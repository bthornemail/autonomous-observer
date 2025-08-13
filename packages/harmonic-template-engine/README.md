# @ulp/harmonic-template-engine

Generate deterministic harmonic vectors with tunable placeholders.

- Deterministic unit-magnitude spectrum (invertible in CQE pipeline)
- Harmonic emphasis by base frequency and multipliers
- Placeholders to reserve or tune bins (single index or ranges)
- CLI to emit vectors and render templates with `${k}` or `${k:min..max}`
- Binary encoder/decoder with carrier plans (auto, pentad7=49, pentad7+1=50 with anchor), seed-only decode support

Quick start:

```bash
# from monorepo root
npm run harmonic:demo
```

Or manually:

```bash
npx --workspace @ulp/harmonic-template-engine harmonic-template \
  --dim=1024 --seed="thesis-1" --base=7 --harmonics=1,3,5 --gain=0.5 \
  --placeholders=k:5:0.8,k:13:0.2,range:100..120:0.1 \
  --format "Thesis-Based Marketplace Framework Report_.txt" \
  --out vector.json
```

Binary encode/decode with carrier plan:

```bash
# encode with a structured plan (49 bins) or with anchor (50)
npx --workspace @ulp/harmonic-template-engine harmonic-template encode \
  --in file.bin --dim=1024 --seed=payload --plan pentad7+1 --out payload-vector.json

# decode (manifest present)
npx --workspace @ulp/harmonic-template-engine harmonic-template decode \
  --in payload-vector.json --out file.out

# seed-only decode (no manifest): supply dim, seed, and optionally --plan
npx --workspace @ulp/harmonic-template-engine harmonic-template decode \
  --in payload-vector.json --out file.out --dim=1024 --seed=payload --plan pentad7+1
```

API:

```js
import { generateTemplate, applyPlaceholdersToData } from '@ulp/harmonic-template-engine';

const { vector, spec } = generateTemplate({ dim: 1024, seed: 'x', baseFreq: 7, harmonics: [1,3,5], placeholders: [{ k: 5, amplitude: 0.8 }] });
```
