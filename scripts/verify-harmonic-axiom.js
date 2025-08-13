#!/usr/bin/env node
/*
Verifies a harmonic axiom/sign request against the on-chain registry.

Usage:
  node scripts/verify-harmonic-axiom.js \
    --rpc http://127.0.0.1:8545 \
    --registry 0x... \
    --file dist/axioms/cqe-axiom-*.json|*.sign.json \
    [--sig 0xSIG --addr 0xADDR]

Inputs:
  --file can point to either:
    - the axiom JSON from validate-cqe-and-sign.js, or
    - the generated *.sign.json wallet_sign_request bundle.

What it does:
  - Extracts joint trits message, scheme, and hd path
  - Computes jointHash = keccak256(utf8(message))
  - Computes id = keccak256(abi.encodePacked(scheme, jointHash))
  - Reads registry.axioms(id)
  - If a signature is provided (or present in axiom), recovers signer via EIP-191 and compares with on-chain owner
  - Prints a compact JSON summary
*/
const fs = require('fs');
const path = require('path');
let ethers;
try {
  ethers = require('ethers');
} catch (e) {
  try {
    ethers = require(path.resolve(__dirname, 'node_modules/ethers'));
  } catch (e2) {
    console.error('Missing dependency: ethers. Run: (cd scripts && npm i)');
    process.exit(2);
  }
}

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    const k = a.startsWith('--') ? a.slice(2) : null;
    if (k) {
      const v = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
      out[k] = v;
    }
  }
  return out;
}

const ABI = [
  {
    type: 'function',
    stateMutability: 'view',
    name: 'axioms',
    inputs: [{ name: '', type: 'bytes32' }],
    outputs: [
      { name: 'owner', type: 'address' },
      { name: 'scheme', type: 'string' },
      { name: 'jointHash', type: 'bytes32' },
      { name: 'hdPath', type: 'string' },
      { name: 'sha256hex', type: 'string' },
      { name: 'timestamp', type: 'uint64' },
    ],
  },
];

function loadJson(p) {
  const abs = path.resolve(p);
  const txt = fs.readFileSync(abs, 'utf8');
  return JSON.parse(txt);
}

function extractFromFile(obj) {
  // Try wallet_sign_request shape
  if (obj && obj.kind === 'wallet_sign_request' && obj.standard && /eip191/i.test(obj.standard)) {
    return {
      source: 'sign-request',
      message: obj.message,
      scheme: obj.harmonic_scheme,
      hdPath: obj.hd_path,
      sha256hex: obj.sha256 || '',
      signature: null,
      address: null,
    };
  }
  // Try axiom shape
  if (obj && obj.kind === 'axiom' && obj.harmonic_signature && obj.hd) {
    const sig = obj.wallet_signature || {};
    return {
      source: 'axiom',
      message: obj.harmonic_signature.joint_trits,
      scheme: obj.harmonic_signature.scheme,
      hdPath: obj.hd.path,
      sha256hex: (obj.signature && obj.signature.digest) || '',
      signature: sig.signature || null,
      address: sig.address || null,
    };
  }
  throw new Error('Unrecognized file format: expected wallet_sign_request or axiom JSON');
}

async function main() {
  const args = parseArgs(process.argv);
  const rpc = args.rpc || process.env.RPC_URL || 'http://127.0.0.1:8545';
  const registryAddr = args.registry || process.env.HARMONIC_REGISTRY_ADDRESS;
  const file = args.file;
  const idArg = args.id;
  const sigArg = args.sig || process.env.ETH_SIGNATURE_HEX || process.env.ETH_SIGNATURE;
  const addrArg = args.addr || process.env.ETH_ADDRESS;
  if (!registryAddr) throw new Error('Missing --registry or HARMONIC_REGISTRY_ADDRESS');
  let message, scheme, hdPath = '', sha256hex = '', sigFromFile = null, addrFromFile = null, source = null;
  if (file) {
    const obj = loadJson(file);
    ({ message, scheme, hdPath, sha256hex, signature: sigFromFile, address: addrFromFile, source } = extractFromFile(obj));
  } else {
    // direct CLI inputs
    message = args.message;
    scheme = args.scheme;
    hdPath = args.hdPath || '';
    sha256hex = args.sha256 || '';
    source = 'cli';
    if (!message || !scheme) throw new Error('Provide --scheme and --message when not using --file');
  }
  const signature = sigArg || sigFromFile || null;
  const address = addrArg || addrFromFile || null;

  const provider = new ethers.providers.JsonRpcProvider(rpc);

  // Compute jointHash and id (if not directly provided)
  let jointHash, id;
  if (idArg) {
    id = idArg;
    if (message) {
      const msgBytes = ethers.utils.toUtf8Bytes(message);
      jointHash = ethers.utils.keccak256(msgBytes);
    } else {
      jointHash = null;
    }
  } else {
    const msgBytes = ethers.utils.toUtf8Bytes(message);
    jointHash = ethers.utils.keccak256(msgBytes);
    id = ethers.utils.solidityKeccak256(['string', 'bytes32'], [scheme, jointHash]);
  }

  // Fetch on-chain
  const contract = new ethers.Contract(registryAddr, ABI, provider);
  let onChain;
  try {
    onChain = await contract.axioms(id);
  } catch (e) {
    throw new Error('Failed to read registry.axioms(id): ' + (e && e.message));
  }

  // Normalize outputs
  const registry = {
    owner: onChain.owner,
    scheme: onChain.scheme,
    jointHash: onChain.jointHash,
    hdPath: onChain.hdPath,
    sha256hex: onChain.sha256hex,
    timestamp: onChain.timestamp ? Number(onChain.timestamp) : 0,
  };

  // Try signature recovery if available
  let recovered = null;
  let sigOk = null;
  if (signature) {
    try {
      recovered = ethers.utils.verifyMessage(message, signature);
      if (address) sigOk = recovered.toLowerCase() === address.toLowerCase();
    } catch (e) {
      recovered = 'ERROR: ' + (e && e.message);
    }
  }

  const out = {
    status: 'ok',
    file: path.basename(file),
    source,
    rpc,
    registry: registryAddr,
  inputs: { scheme, hdPath, sha256hex },
    computed: { jointHash, id },
    onChain: registry,
    checks: {
      foundOnChain: !!registry.owner && registry.owner !== ethers.constants.AddressZero,
      schemeMatch: registry.scheme === scheme,
      jointHashMatch: registry.jointHash && registry.jointHash.toLowerCase() === jointHash.toLowerCase(),
      hdPathMatch: registry.hdPath === hdPath,
      sha256Match: !sha256hex || registry.sha256hex === '' || registry.sha256hex === sha256hex,
      recoveredEqualsOnChain: recovered && typeof recovered === 'string' && /^0x/i.test(recovered) && registry.owner && recovered.toLowerCase() === registry.owner.toLowerCase(),
      recoveredEqualsProvided: sigOk === null ? null : sigOk,
    },
    recovered,
    provided: address || null,
  };

  console.log(JSON.stringify(out, null, 2));
}

if (require.main === module) {
  main().catch((err) => {
    console.error(JSON.stringify({ status: 'error', message: err && err.message }, null, 2));
    process.exit(1);
  });
}
