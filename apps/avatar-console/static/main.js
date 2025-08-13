import { ethers } from 'https://cdn.skypack.dev/ethers@5.7.2';

const ws = new WebSocket(`ws://${location.host}`);
const events = document.getElementById('events');
const registryEl = document.getElementById('registry');
const rpcEl = document.getElementById('rpc');
const ctrlMsgEl = document.getElementById('ctrlMsg');
const claimBtn = document.getElementById('claimBtn');
const claimStatus = document.getElementById('claimStatus');
const cmdEl = document.getElementById('cmd');
const sendCmd = document.getElementById('sendCmd');
const enterXR = document.getElementById('enterXR');
const xrStatus = document.getElementById('xrStatus');

function log(obj) {
  events.textContent = `${JSON.stringify(obj, null, 2)}\n` + events.textContent;
}

ws.onmessage = (e) => {
  try { log(JSON.parse(e.data)); } catch { log({ raw: e.data }); }
};

claimBtn.onclick = async () => {
  try {
    if (!window.ethereum) throw new Error('No wallet provider');
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const message = ctrlMsgEl.value || 'ULP-AVATAR-CLAIM';
    const signature = await signer.signMessage(message);
    const address = await signer.getAddress();

    claimStatus.textContent = 'signed';
    log({ kind: 'claim', address, signature, message });

    // Broadcast a control-claim to the hub (server relays hub->console only; a future step can add console->hub)
    // For now, just display. The address can be verified on-chain against a published avatar id.
  } catch (e) {
    claimStatus.textContent = 'error';
    log({ kind: 'claim-error', message: e.message });
  }
};

sendCmd.onclick = () => {
  const payload = { kind: 'command', cmd: cmdEl.value, ts: Date.now() };
  log(payload);
};

enterXR.onclick = async () => {
  try {
    if (!navigator.xr) { xrStatus.textContent = 'WebXR not supported'; return; }
    const isSupported = await navigator.xr.isSessionSupported('immersive-vr');
    if (!isSupported) { xrStatus.textContent = 'VR not supported'; return; }

    const gl = document.createElement('canvas').getContext('webgl', { antialias: true });
    const xrSession = await navigator.xr.requestSession('immersive-vr');
    xrStatus.textContent = 'XR session started';
    xrSession.end();
  } catch (e) {
    xrStatus.textContent = 'XR error';
    log({ kind: 'xr-error', message: e.message });
  }
};
