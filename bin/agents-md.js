#!/usr/bin/env node

import('../dist/cli.mjs').catch((err) => {
  console.error('Failed to load CLI:', err.message);
  console.error('Make sure to run `npm run build` first.');
  process.exit(1);
});
