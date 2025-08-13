#!/usr/bin/env node
// Publish a harmonic axiom to the on-chain registry using a local wallet.
// Requires: ethers (v6 preferred). Falls back to guidance if not installed.

const fs = require('fs');
const path = require('path');

async function main() {
  let ethers;
  try {
    ethers = require('ethers'); // v6
  } catch (e) {
    try {
      ethers = require('ethers'); // if alias resolves to v5 anyway
    } catch (e2) {
      console.error('Missing dependency: ethers. Install with: npm i ethers@6');
      process.exit(2);
    }
  }

  const args = process.argv.slice(2);
  const opt = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--axiom') opt.axiom = args[++i];
    else if (a === '--rpc') opt.rpc = args[++i];
    else if (a === '--key') opt.key = args[++i];
    else if (a === '--registry') opt.registry = args[++i];
  }

  const rpcUrl = opt.rpc || process.env.EVM_RPC_URL || process.env.RPC_URL;
  const privKey = opt.key || process.env.ETH_PRIVATE_KEY || process.env.PRIVKEY;
  const registryAddr = opt.registry || process.env.HARMONIC_REGISTRY_ADDRESS;
  if (!rpcUrl || !privKey || !registryAddr) {
    console.error('Usage: publish-harmonic-axiom --axiom <path> --rpc <url> --key <hex> --registry <address>');
    console.error('Or set env: EVM_RPC_URL, ETH_PRIVATE_KEY, HARMONIC_REGISTRY_ADDRESS');
    process.exit(2);
  }

  function latestAxiom(distDir) {
    const dir = path.resolve(distDir || 'dist/axioms');
    if (!fs.existsSync(dir)) return null;
    const files = fs.readdirSync(dir)
      .filter(f => f.endsWith('.json') && f.startsWith('cqe-axiom-'))
      .map(f => path.join(dir, f))
      .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
    return files[0] || null;
  }

  const axiomPath = opt.axiom || latestAxiom('dist/axioms');
  if (!axiomPath) {
    console.error('No axiom found. Run: node scripts/validate-cqe-and-sign.js first.');
    process.exit(2);
  }
  const ax = JSON.parse(fs.readFileSync(axiomPath, 'utf8'));
  if (!(ax && ax.harmonic_signature && ax.harmonic_signature.joint_trits)) {
    console.error('Axiom missing harmonic_signature.joint_trits');
    process.exit(2);
  }
  if (!ax.hd || !ax.hd.path || !ax.harmonic_signature.scheme) {
    console.error('Axiom missing hd.path or harmonic scheme');
    process.exit(2);
  }

  // message to sign = joint trits string
  const message = ax.harmonic_signature.joint_trits;
  const scheme = ax.harmonic_signature.scheme;
  const hdPath = ax.hd.path;
  const shaHex = (ax.signature && ax.signature.digest) || '';

  // ethers v6 helpers
  const toUtf8Bytes = ethers.toUtf8Bytes || ethers.utils && ethers.utils.toUtf8Bytes;
  const getBytes = ethers.getBytes || (v => v);
  const concat = ethers.concat || ethers.utils && ethers.utils.concat;
  const keccak256 = ethers.keccak256 || ethers.utils && ethers.utils.keccak256;

  const provider = new ethers.JsonRpcProvider ? new ethers.JsonRpcProvider(rpcUrl) : new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet ? new ethers.Wallet(privKey, provider) : new ethers.Wallet(privKey, provider);

  // sign message unless signature is provided via env
  let signature = process.env.ETH_SIGNATURE_HEX || process.env.ETH_SIGNATURE;
  if (!signature) {
    signature = await wallet.signMessage(message);
  }

  // registry
  const abi = [
    'function registerAxiom(bytes message, bytes signature, string scheme, string hdPath, string sha256hex) external returns (bytes32)'
  ];
  const registry = new ethers.Contract(registryAddr, abi, wallet);

  // submit tx
  const msgBytes = toUtf8Bytes(message);
  const tx = await registry.registerAxiom(msgBytes, signature, scheme, hdPath, shaHex);
  const receipt = await tx.wait();

  // compute id client-side (keccak256(abi.encodePacked(scheme, keccak256(message))))
  const jointHash = keccak256(msgBytes);
  const id = keccak256(concat([toUtf8Bytes(scheme), getBytes(jointHash)]));

  console.log(JSON.stringify({
    status: 'sent',
    txHash: receipt.transactionHash || tx.hash,
    registry: registryAddr,
    id,
    scheme,
    hdPath,
    axiom: path.basename(axiomPath)
  }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
