import { encode, decode, encodeBufferToTrie, encodeJsonToTrie, decodeTrieToBuffer } from './lib.js';

const $ = (sel) => document.querySelector(sel);
const encLog = $('#enc-log');
const decLog = $('#dec-log');
const rtcLog = $('#rtc-log');
const trieLog = $('#trie-log');
let currentVectorJson = null;
let currentManifestJson = null;

function download(name, data, type='application/octet-stream'){
  const blob = new Blob([data], {type});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

$('#btn-encode').onclick = async () => {
  const file = $('#enc-file').files[0];
  const dim = parseInt($('#enc-dim').value, 10);
  const seed = $('#enc-seed').value || 'demo';
  if (!file || !dim) { encLog.textContent = 'Select a file and dimension'; return; }
  const buf = new Uint8Array(await file.arrayBuffer());
  try{
    const out = await encode(buf, { dim, seed });
    currentVectorJson = JSON.stringify({ vector: out.vector, manifest: out.manifest });
    encLog.textContent = `Encoded ${file.name} (${buf.length} bytes) → dim=${dim}`;
    $('#btn-download-vector').disabled = false;
    $('#btn-copy-vector').disabled = false;
  }catch(e){
    encLog.textContent = 'Encode error: ' + e.message;
  }
};

$('#btn-download-vector').onclick = () => {
  if (!currentVectorJson) return;
  download('harmonic-vector.json', currentVectorJson, 'application/json');
};
$('#btn-copy-vector').onclick = async () => {
  if (!currentVectorJson) return;
  await navigator.clipboard.writeText(currentVectorJson);
  encLog.textContent = 'Vector JSON copied to clipboard';
};

$('#btn-decode').onclick = async () => {
  const f = $('#dec-json').files[0];
  if (!f) { decLog.textContent = 'Select a vector JSON file'; return; }
  const text = await f.text();
  const j = JSON.parse(text);
  const dim = parseInt($('#dec-dim').value, 10);
  const seed = $('#dec-seed').value || undefined;
  try{
    const payload = await decode(j, { dim, seed });
    download('decoded.bin', payload, 'application/octet-stream');
    decLog.textContent = `Decoded ${payload.byteLength} bytes`;
    $('#btn-download-bin').disabled = false;
    $('#btn-download-bin').onclick = () => download('decoded.bin', payload, 'application/octet-stream');
  }catch(e){
    decLog.textContent = 'Decode error: ' + e.message;
  }
};

// Trie UI
$('#btn-trie-encode').onclick = async () => {
  const f = $('#trie-file').files[0];
  const jf = $('#trie-json').files[0];
  const dim = parseInt($('#trie-dim').value, 10);
  const seed = $('#trie-seed').value || 'trie';
  const chunkSize = parseInt($('#trie-chunk').value, 10) || 8192;
  const includeVectors = $('#trie-include').checked;
  try{
    let manifest;
    if (jf){
      const j = JSON.parse(await jf.text());
      manifest = await encodeJsonToTrie(j, { dim, seed, chunkSize, includeVectors });
    } else if (f){
      const buf = new Uint8Array(await f.arrayBuffer());
      manifest = await encodeBufferToTrie(buf, { dim, seed, chunkSize, includeVectors });
    } else {
      trieLog.textContent = 'Select a file or JSON'; return;
    }
    currentManifestJson = JSON.stringify(manifest);
    $('#btn-trie-download').disabled = false;
    $('#btn-trie-download').onclick = () => download('manifest.json', currentManifestJson, 'application/json');
    trieLog.textContent = `Built manifest with ${manifest.chunkCount} chunks`;
  }catch(e){ trieLog.textContent = 'Trie encode error: ' + e.message; }
};

$('#btn-trie-decode').onclick = async () => {
  const mf = $('#trie-manifest').files[0];
  if (!mf && !currentManifestJson){ trieLog.textContent = 'Select or build a manifest first'; return; }
  let manifest = mf ? JSON.parse(await mf.text()) : JSON.parse(currentManifestJson);
  try{
    const payload = await decodeTrieToBuffer(manifest);
    download('decoded-from-manifest.bin', payload, 'application/octet-stream');
    trieLog.textContent = `Decoded manifest (${manifest.chunkCount} chunks) → ${payload.byteLength} bytes`;
  }catch(e){ trieLog.textContent = 'Trie decode error: ' + e.message; }
};

// P2P (copy-paste WebRTC)
let pc, dc;
$('#btn-create-offer').onclick = async () => {
  pc = new RTCPeerConnection();
  dc = pc.createDataChannel('harmonic');
  dc.onopen = () => rtcLog.textContent = 'Data channel open';
  dc.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data);
      if (msg.type === 'vector') {
        currentVectorJson = JSON.stringify(msg.data);
        encLog.textContent = 'Vector received via P2P';
        $('#btn-download-vector').disabled = false;
        $('#btn-copy-vector').disabled = false;
      }
    } catch {}
  };
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  $('#rtc-offer').value = btoa(JSON.stringify(pc.localDescription));
  $('#btn-accept-answer').disabled = false;
};

$('#btn-accept-answer').onclick = async () => {
  try{
    const answer = JSON.parse(atob($('#rtc-answer').value.trim()))
    await pc.setRemoteDescription(answer);
    rtcLog.textContent = 'Connected';
    $('#btn-send-vector').disabled = false;
  }catch(e){ rtcLog.textContent = 'Answer error: ' + e.message; }
};

$('#btn-send-vector').onclick = () => {
  if (!dc || dc.readyState !== 'open') { rtcLog.textContent = 'Channel not open'; return; }
  if (!currentVectorJson) { rtcLog.textContent = 'No vector in memory'; return; }
  dc.send(JSON.stringify({ type: 'vector', data: JSON.parse(currentVectorJson) }));
  rtcLog.textContent = 'Vector sent';
};
