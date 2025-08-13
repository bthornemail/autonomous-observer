#!/usr/bin/env node
// Compile and deploy HarmonicAxiomRegistry.sol using solc-js and ethers v6
// Usage:
//   node scripts/deploy-harmonic-registry.js --rpc <url> --key <privateKey>

const fs = require('fs');
const path = require('path');

async function main() {
  let solc, ethers;
  try { solc = require('solc'); } catch (e) { console.error('Missing dependency: solc. Install with: npm i solc'); process.exit(2); }
  try { ethers = require('ethers'); } catch (e) { console.error('Missing dependency: ethers. Install with: npm i ethers@6'); process.exit(2); }

  const args = process.argv.slice(2);
  const opt = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--rpc') opt.rpc = args[++i];
    else if (a === '--key') opt.key = args[++i];
  }
  const rpcUrl = opt.rpc || process.env.EVM_RPC_URL || process.env.RPC_URL;
  const privKey = opt.key || process.env.ETH_PRIVATE_KEY || process.env.PRIVKEY;
  if (!rpcUrl || !privKey) {
    console.error('Usage: deploy-harmonic-registry --rpc <url> --key <hex>');
    console.error('Or set env: EVM_RPC_URL, ETH_PRIVATE_KEY');
    process.exit(2);
  }

  const sourcePath = path.resolve('contracts', 'HarmonicAxiomRegistry.sol');
  if (!fs.existsSync(sourcePath)) { console.error('Contract not found at contracts/HarmonicAxiomRegistry.sol'); process.exit(2); }
  const source = fs.readFileSync(sourcePath, 'utf8');

  const input = {
    language: 'Solidity',
    sources: { 'HarmonicAxiomRegistry.sol': { content: source } },
    settings: { optimizer: { enabled: true, runs: 200 }, outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } } }
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  if (output.errors && output.errors.length) {
    const fatal = output.errors.filter(e => e.severity === 'error');
    fatal.forEach(e => console.error(e.formattedMessage || e.message));
    if (fatal.length) process.exit(1);
  }

  const c = output.contracts['HarmonicAxiomRegistry.sol']['HarmonicAxiomRegistry'];
  if (!c) { console.error('Compilation output missing contract HarmonicAxiomRegistry'); process.exit(1); }
  const abi = c.abi;
  const bytecode = '0x' + c.evm.bytecode.object;

  const provider = new (ethers.JsonRpcProvider || ethers.providers.JsonRpcProvider)(rpcUrl);
  const wallet = new (ethers.Wallet)(privKey, provider);

  const factory = new (ethers.ContractFactory || ethers.ContractFactory)(abi, bytecode, wallet);
  const contract = await factory.deploy();
  const receipt = await contract.deploymentTransaction().wait();

  console.log(JSON.stringify({
    status: 'deployed',
    address: contract.target || contract.address,
    txHash: receipt.hash || receipt.transactionHash,
    chainId: (await provider.getNetwork()).chainId.toString()
  }, null, 2));
}

main().catch(err => { console.error(err); process.exit(1); });
