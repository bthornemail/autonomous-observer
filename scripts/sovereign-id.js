#!/usr/bin/env node
// Sovereign Identity for CQE agents based on harmonic joint trits
// Features:
// - Create DID-like identity from an axiom (did:harmonic:<scheme>:<hash>)
// - Resolve identity against on-chain registry (via JSON-RPC web3_sha3 + eth_call)
// - Emits a DID Document with verification method (EIP-191) and stateless routing hints

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function toHex(buf){ return '0x' + Buffer.from(buf).toString('hex'); }
function hexFromUtf8(s){ return '0x' + Buffer.from(s, 'utf8').toString('hex'); }
function strip0x(h){ return h && h.startsWith('0x') ? h.slice(2) : h; }
function pad32(h){ return '0x' + strip0x(h).padStart(64, '0'); }
function sliceHex(hex, start, length){ return '0x' + strip0x(hex).slice(start*2, (start+length)*2); }
function wordAt(hex, idx){ return sliceHex(hex, idx*32, 32); }

async function rpcCall(rpcUrl, method, params = []){
  const res = await fetch(rpcUrl, {
    method: 'POST', headers: { 'content-type':'application/json' },
    body: JSON.stringify({ jsonrpc:'2.0', id:1, method, params })
  });
  if (!res.ok) throw new Error(`RPC HTTP ${res.status}`);
  const j = await res.json();
  if (j.error) throw new Error(`RPC ${method} error: ${j.error.message||j.error.code}`);
  return j.result;
}

function latestAxiom(distDir){
  const dir = path.resolve(distDir || 'dist/axioms');
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.json') && f.startsWith('cqe-axiom-'))
    .map(f => path.join(dir,f))
    .sort((a,b)=> fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return files[0] || null;
}

async function createFromAxiom({ axiomPath, rpcUrl }){
  const p = axiomPath || latestAxiom('dist/axioms');
  if (!p) throw new Error('No axiom found. Run validate-cqe-and-sign first or pass --axiom');
  const ax = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (!(ax && ax.harmonic_signature && ax.harmonic_signature.joint_trits)){
    throw new Error('Axiom missing harmonic_signature.joint_trits');
  }
  const scheme = ax.harmonic_signature.scheme;
  const joint = ax.harmonic_signature.joint_trits;
  const hdPath = ax.hd && ax.hd.path;
  const sha256hex = ax.signature && ax.signature.digest || crypto.createHash('sha256').update(joint, 'utf8').digest('hex');
  let jointKeccak = null;
  if (rpcUrl) {
    jointKeccak = await rpcCall(rpcUrl, 'web3_sha3', [hexFromUtf8(joint)]);
  }
  // DID uses scheme + preferred hash (keccak if available else sha256)
  const idSuffix = jointKeccak ? strip0x(jointKeccak) : `sha256-${sha256hex}`;
  const did = `did:harmonic:${scheme}:${idSuffix}`;

  // Optional stateless IDs (reuse existing CLI if present)
  let route = null;
  try {
    const child = require('child_process').execSync(
      `node scripts/harmonic-stateless-id.js --from-axiom ${JSON.stringify(p)}`,
      { stdio: ['ignore','pipe','pipe'] }
    ).toString();
    route = JSON.parse(child);
  } catch {}

  const doc = {
    id: did,
    controller: did,
    alsoKnownAs: [ ax.harmonic_signature.joint_trits.slice(0, 64) + '…' ],
    verificationMethod: [
      {
        id: did + '#eip191',
        type: 'EcdsaSecp256k1RecoveryMethod2020',
        controller: did,
        blockchainAccountId: ax.wallet_signature && ax.wallet_signature.address ? `eip155:${process.env.EVM_CHAIN_ID||'unknown'}:${ax.wallet_signature.address}` : undefined,
        hdPath: hdPath || null,
        scheme
      }
    ].filter(Boolean),
    authentication: [ did + '#eip191' ],
    service: route ? [
      { id: did + '#quic', type: 'StatelessQUIC', data: route.quic_cid16 },
      { id: did + '#mac48', type: 'MAC48', data: route.mac48 },
      { id: did + '#eui64', type: 'EUI64', data: route.eui64 },
      { id: did + '#uuid', type: 'UUIDv4Seeded', data: route.uuid_v4 },
      { id: did + '#ble', type: 'BLEManufacturer', data: route.ble_mfg }
    ] : [],
    metadata: {
      scheme,
      hdPath: hdPath || null,
      jointHashKeccak: jointKeccak,
      sha256hex,
      axiom: path.basename(p)
    }
  };
  return { did, document: doc };
}

async function resolveOnChain({ rpcUrl, registry, scheme, joint_trits, joint_hash }){
  if (!rpcUrl || !registry || !scheme) throw new Error('rpcUrl, registry, scheme are required');
  // Compute jointHash (keccak) if needed
  let jh = joint_hash;
  if (!jh) {
    if (!joint_trits) throw new Error('Provide joint_trits or joint_hash');
    jh = await rpcCall(rpcUrl, 'web3_sha3', [hexFromUtf8(joint_trits)]);
  }
  // id = keccak256(abi.encodePacked(scheme, jointHash))
  const id = await rpcCall(rpcUrl, 'web3_sha3', [hexFromUtf8(scheme) + strip0x(jh)]);
  // selector getAxiom(bytes32)
  const sig = await rpcCall(rpcUrl, 'web3_sha3', [hexFromUtf8('getAxiom(bytes32)')]);
  const selector = '0x' + strip0x(sig).slice(0,8);
  const data = selector + strip0x(id).padStart(64,'0');
  const raw = await rpcCall(rpcUrl, 'eth_call', [ { to: registry, data }, 'latest' ]);
  // Decode (address, string, bytes32, string, string, uint64)
  const owner = '0x' + strip0x(wordAt(raw,0)).slice(24*2);
  const schemeOff = wordAt(raw,1);
  const retJointHash = wordAt(raw,2);
  const hdOff = wordAt(raw,3);
  const shaOff = wordAt(raw,4);
  const tsWord = wordAt(raw,5);
  const base = (offHex) => Number(BigInt(offHex));
  const decodeStrAt = (offHex) => {
    const baseIdx = base(offHex);
    const lenHex = sliceHex(raw, baseIdx, 32);
    const len = Number(BigInt(lenHex));
    const dataHex = sliceHex(raw, baseIdx+32, len);
    return Buffer.from(strip0x(dataHex),'hex').toString('utf8');
  };
  const schemeOut = decodeStrAt(schemeOff);
  const hdPath = decodeStrAt(hdOff);
  const sha256hex = decodeStrAt(shaOff);
  const did = `did:harmonic:${schemeOut}:${strip0x(retJointHash)}`;
  const doc = {
    id: did,
    controller: did,
    verificationMethod: [
      { id: did + '#eip191', type: 'EcdsaSecp256k1RecoveryMethod2020', controller: did, blockchainAccountId: owner ? `eip155:${process.env.EVM_CHAIN_ID||'unknown'}:${owner}` : undefined, hdPath, scheme: schemeOut }
    ],
    authentication: [ did + '#eip191' ],
    metadata: { scheme: schemeOut, jointHashKeccak: retJointHash, sha256hex, timestamp: Number(BigInt(tsWord)), registry }
  };
  return { did, document: doc };
}

async function main(){
  const args = process.argv.slice(2);
  const opt = {};
  for (let i=0;i<args.length;i++){
    const a = args[i];
    if (a === '--create-from-axiom') opt.createAxiom = args[++i];
    else if (a === '--resolve') opt.resolve = true;
    else if (a === '--rpc') opt.rpc = args[++i];
    else if (a === '--registry') opt.registry = args[++i];
    else if (a === '--scheme') opt.scheme = args[++i];
    else if (a === '--joint') opt.joint = args[++i];
    else if (a === '--joint-hash') opt.jointHash = args[++i];
  }

  if (opt.createAxiom) {
    const out = await createFromAxiom({ axiomPath: opt.createAxiom, rpcUrl: opt.rpc });
    console.log(JSON.stringify(out, null, 2));
    return;
  }
  if (opt.resolve) {
    const out = await resolveOnChain({ rpcUrl: opt.rpc, registry: opt.registry, scheme: opt.scheme, joint_trits: opt.joint, joint_hash: opt.jointHash });
    console.log(JSON.stringify(out, null, 2));
    return;
  }
  console.error('Usage:\n  node scripts/sovereign-id.js --create-from-axiom <path> [--rpc <url>]\n  node scripts/sovereign-id.js --resolve --rpc <url> --registry <addr> --scheme <scheme> [--joint <trits>|--joint-hash <0x..>]');
  process.exit(2);
}

if (require.main === module) main();
