#!/usr/bin/env node
// Self-contained FFT-based circular convolution demo (O(N log N))

function isPowerOfTwo(n){return n>0 && (n & (n-1))===0}
function nextPowerOfTwo(n){let p=1;while(p<n)p<<=1;return p}
function mul(a,b){return {re:a.re*b.re - a.im*b.im, im:a.re*b.im + a.im*b.re}}
function div(a,b,eps=1e-12){const d=b.re*b.re + b.im*b.im;const den=d<eps?eps:d;return {re:(a.re*b.re + a.im*b.im)/den, im:(a.im*b.re - a.re*b.im)/den}}
function fft(input){const n=input.length;if(!isPowerOfTwo(n))throw new Error("FFT length must be pow2");const a=input.slice();for(let i=1,j=0;i<n;i++){let bit=n>>>1;for(;j&bit;bit>>>=1)j^=bit;j^=bit;if(i<j){const t=a[i];a[i]=a[j];a[j]=t}}for(let len=2;len<=n;len<<=1){const ang=-2*Math.PI/len;const wlen={re:Math.cos(ang),im:Math.sin(ang)};for(let i=0;i<n;i+=len){let w={re:1,im:0};for(let j=0;j<(len>>>1);j++){const u=a[i+j];const v=mul(a[i+j+(len>>>1)],w);a[i+j]={re:u.re+v.re,im:u.im+v.im};a[i+j+(len>>>1)]={re:u.re-v.re,im:u.im-v.im};w=mul(w,wlen)}}}return a}
function ifft(input){const n=input.length;const conj=input.map(z=>({re:z.re,im:-z.im}));const y=fft(conj);return y.map(z=>({re:z.re/n,im:-z.im/n}))}
function realToComplex(x,pad){const n=pad??x.length;const out=new Array(n);for(let i=0;i<n;i++)out[i]={re:i<x.length?x[i]:0,im:0};return out}
function circConv(x,y){const n=x.length;if(y.length!==n)throw new Error('len mismatch');const m=nextPowerOfTwo(n);const X=fft(realToComplex(x,m));const Y=fft(realToComplex(y,m));const Z=new Array(m);for(let i=0;i<m;i++)Z[i]=mul(X[i],Y[i]);const z=ifft(Z);return z.slice(0,n).map(c=>c.re)}
function circDeconv(z,x,eps=1e-8){const n=z.length;if(x.length!==n)throw new Error('len mismatch');const m=nextPowerOfTwo(n);const Z=fft(realToComplex(z,m));const X=fft(realToComplex(x,m));const Y=new Array(m);for(let i=0;i<m;i++){const denom={re:X[i].re,im:X[i].im};const num={re:Z[i].re,im:Z[i].im};const d=denom.re*denom.re+denom.im*denom.im;const safe=d<eps?{re:denom.re+eps,im:denom.im}:denom;Y[i]=div(num,safe,eps)}const y=ifft(Y);return y.slice(0,n).map(c=>c.re)}

function randVec(n){const v=new Array(n);for(let i=0;i<n;i++)v[i]=Math.random()*2-1;return v}
function rmse(a,b){const n=a.length;let s=0;for(let i=0;i<n;i++){const d=a[i]-b[i];s+=d*d}return Math.sqrt(s/n)}

(function main(){const n=Number(process.env.DIM||1024);const a=randVec(n);const b=randVec(n);const bound=circConv(a,b);const approxB=circDeconv(bound,a,1e-8);const err=rmse(approxB,b);console.log(JSON.stringify({n,rmse:err}))})();
