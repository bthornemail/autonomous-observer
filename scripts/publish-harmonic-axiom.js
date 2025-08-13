#!/usr/bin/env node
// Publish a harmonic axiom to the on-chain registry using a local wallet.
// Requires: ethers (v6 preferred). Falls back to guidance if not installed.

const fs = require('fs');
const path = require('path');

async function main() {
  let ethers;
  try {
    ethers = require('ethers'); // prefer project-level install
  } catch (e) {
    try {
      // fallback to local scripts deps
      ethers = require(path.resolve(__dirname, 'node_modules/ethers'));
    } catch (e2) {
      console.error('Missing dependency: ethers. Run: (cd scripts && npm i)');
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
  if (!rpcUrl || !registryAddr) {
    console.error('Usage: publish-harmonic-axiom --axiom <path> --rpc <url> [--key <hex>] --registry <address>');
    console.error('Or set env: EVM_RPC_URL, [ETH_PRIVATE_KEY], HARMONIC_REGISTRY_ADDRESS');
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
  const toUtf8Bytes = ethers.toUtf8Bytes || (ethers.utils && ethers.utils.toUtf8Bytes);
  const hexlify = ethers.hexlify || (ethers.utils && ethers.utils.hexlify);
  const getBytes = ethers.getBytes || (v => v);
  const concat = ethers.concat || ethers.utils && ethers.utils.concat;
  const keccak256 = ethers.keccak256 || ethers.utils && ethers.utils.keccak256;

  const provider = ethers.providers ? new ethers.providers.JsonRpcProvider(rpcUrl) : new ethers.JsonRpcProvider(rpcUrl);
  let wallet;
  if (privKey) {
    wallet = new (ethers.Wallet || ethers.Wallet)(privKey, provider);
  } else {
    // unlocked account fallback
    const accts = await provider.send('eth_accounts', []);
    if (!accts || !accts.length) {
      console.error('No private key provided and no unlocked accounts available on node. Provide --key or unlock an account.');
      process.exit(2);
    }
    wallet = provider.getSigner(accts[0]);
  }

  // sign message unless signature is provided via env
  let signature = process.env.ETH_SIGNATURE_HEX || process.env.ETH_SIGNATURE;
  if (!signature) {
    const msgBytes = toUtf8Bytes(message);
    try {
      if (wallet.signMessage) {
        signature = await wallet.signMessage(message);
      }
    } catch (e) {
      // Fallback: build EIP-191 formatted message bytes and use eth_sign
      const addr = (wallet.getAddress ? await wallet.getAddress() : (await provider.listAccounts())[0]);
      const prefix = toUtf8Bytes("\x19Ethereum Signed Message:\n");
      const lenStr = String(msgBytes.length);
      const eip191 = concat([prefix, toUtf8Bytes(lenStr), msgBytes]);
      signature = await provider.send('eth_sign', [addr, hexlify(eip191)]);
    }
    if (!signature) {
      // As a last resort, try eth_sign directly on the raw message bytes
      const addr = (wallet.getAddress ? await wallet.getAddress() : (await provider.listAccounts())[0]);
      signature = await provider.send('eth_sign', [addr, hexlify(msgBytes)]);
    }
  }

  // registry
  const abi = [
    'function registerAxiom(bytes message, bytes signature, string scheme, string hdPath, string sha256hex) external returns (bytes32)'
  ];
  const registry = new ethers.Contract(registryAddr, abi, wallet);

  // submit tx
  const msgBytes = toUtf8Bytes(message);
  // allow manual gas override and auto-cap under block gas limit
  const gasIdx = args.indexOf('--gas');
  let overrides = {};
  if (gasIdx !== -1) {
    overrides.gasLimit = args[gasIdx + 1];
  } else {
    try {
      const latest = await provider.getBlock('latest');
      if (latest && latest.gasLimit) {
        const cap = latest.gasLimit.mul ? latest.gasLimit.mul(95).div(100) : latest.gasLimit;
        overrides.gasLimit = cap;
      }
    } catch {}
  }
  const tx = await registry.registerAxiom(msgBytes, signature, scheme, hdPath, shaHex, overrides);
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
