#!/usr/bin/env node
const { CUEFramework } = require('./CUEFramework');

(async () => {
  const cue = new CUEFramework({ universePort: 3001, knowledgeSeed: false });
  await cue.serve();
})();
