#!/usr/bin/env node
// Compile and deploy HarmonicAxiomRegistry.sol using solc-js and ethers v6
// Usage:
//   node scripts/deploy-harmonic-registry.js --rpc <url> --key <privateKey>

const fs = require('fs');
const path = require('path');

async function main() {
  let solc, ethers;
  try { solc = require('solc'); } catch (e) {
    try { solc = require(path.resolve(__dirname, 'node_modules/solc')); }
    catch { console.error('Missing dependency: solc. Run: (cd scripts && npm i)'); process.exit(2); }
  }
  try { ethers = require('ethers'); } catch (e) {
    try { ethers = require(path.resolve(__dirname, 'node_modules/ethers')); }
    catch { console.error('Missing dependency: ethers. Run: (cd scripts && npm i)'); process.exit(2); }
  }

  const args = process.argv.slice(2);
  const opt = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--rpc') opt.rpc = args[++i];
    else if (a === '--key') opt.key = args[++i];
  }
  const rpcUrl = opt.rpc || process.env.EVM_RPC_URL || process.env.RPC_URL;
  const privKey = opt.key || process.env.ETH_PRIVATE_KEY || process.env.PRIVKEY;
  if (!rpcUrl) {
    console.error('Usage: deploy-harmonic-registry --rpc <url> [--key <hex>]');
    console.error('Or set env: EVM_RPC_URL');
    process.exit(2);
  }

  const sourcePath = path.resolve('contracts', 'HarmonicAxiomRegistry.sol');
  if (!fs.existsSync(sourcePath)) { console.error('Contract not found at contracts/HarmonicAxiomRegistry.sol'); process.exit(2); }
  const source = fs.readFileSync(sourcePath, 'utf8');

  const input = {
    language: 'Solidity',
    sources: { 'HarmonicAxiomRegistry.sol': { content: source } },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      // Force pre-Shanghai compatible opcodes to avoid PUSH0 issues on older chains
      evmVersion: 'paris',
      outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } }
    }
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

  const provider = ethers.providers ? new ethers.providers.JsonRpcProvider(rpcUrl) : new ethers.JsonRpcProvider(rpcUrl);
  let signer;
  if (privKey) {
    signer = new (ethers.Wallet || ethers.Wallet)(privKey, provider);
  } else {
    // Try unlocked account via JSON-RPC signer
    const accts = await provider.send('eth_accounts', []);
    if (!accts || !accts.length) {
      console.error('No accounts available on node and no private key provided. Provide --key or unlock an account on Geth.');
      process.exit(2);
    }
    signer = provider.getSigner(accts[0]);
  }

  const factory = new ethers.ContractFactory(abi, bytecode, signer);
  // Allow manual gas override to bypass estimateGas caps or buggy nodes
  const gasIdx = args.indexOf('--gas');
  let gasOverride = {};
  if (gasIdx !== -1) {
    const v = args[gasIdx + 1];
    gasOverride = { gasLimit: (ethers.BigNumber ? ethers.BigNumber.from(v) : v) };
  } else {
    // Probe latest block gasLimit and use 95% of it if estimate fails
    try {
      const est = await factory.signer.estimateGas({ data: bytecode });
      gasOverride = { gasLimit: est };
    } catch (e) {
      const latest = await provider.getBlock('latest');
      const cap = latest && latest.gasLimit ? latest.gasLimit : (ethers.BigNumber ? ethers.BigNumber.from('6000000') : '6000000');
      const ninetyFive = cap.mul ? cap.mul(95).div(100) : cap;
      gasOverride = { gasLimit: ninetyFive };
    }
  }
  const contract = await factory.deploy(gasOverride);
  let txHash;
  if (contract.deployTransaction) {
    const receipt = await contract.deployTransaction.wait();
    txHash = receipt.transactionHash;
  } else if (contract.deploymentTransaction) {
    const receipt = await contract.deploymentTransaction().wait();
    txHash = receipt.hash || receipt.transactionHash;
  }

  console.log(JSON.stringify({
    status: 'deployed',
  address: contract.address || contract.target,
  txHash: txHash,
    chainId: (await provider.getNetwork()).chainId.toString()
  }, null, 2));
}

main().catch(err => { console.error(err); process.exit(1); });
