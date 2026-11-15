import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildBaseGeometry } from '../scripts/base-geometry.mjs';

test('Base geometry projection rejects font/palette dependencies and missing references', () => {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'uif-base-geometry-'));
  try {
    fs.mkdirSync(path.join(root,'src/base'),{recursive:true});
    fs.mkdirSync(path.join(root,'dist/tokens/css'),{recursive:true});
    for(const file of ['core-primitives.tokens.css','typography-fluid.tokens.css','semantics-brands.tokens.brand-a.css','semantics-roles.tokens.css','patterns-ui.tokens.css']) fs.writeFileSync(path.join(root,'dist/tokens/css',file),':root { --size: 1rem; --alias: var(--size); --font-family-sans: Arial; --color-text: red; }');
    const sizing=path.join(root,'src/base/sizing.css');
    fs.writeFileSync(sizing,'button { padding: var(--alias); }');
    assert.deepEqual(buildBaseGeometry(root,path.join(root,'dist')).names,['--size','--alias']);
    for(const name of ['--font-family-sans','--color-text','--missing']) {
      fs.writeFileSync(sizing,`button { padding: var(${name}); }`);
      assert.throws(()=>buildBaseGeometry(root,path.join(root,'dist')), /Non-geometric|Missing/);
    }
  } finally { fs.rmSync(root,{recursive:true,force:true}); }
});
