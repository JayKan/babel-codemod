import fs, { readFile } from 'fs';
import { resolve } from 'path';
import { execSync } from 'child_process';

resolve(__dirname, './thing');

readFile('./thing.js', 'utf8', (err, string) => {
  console.log(string);
});

fs.readFile('./other-thing', 'utf8', (err, string) => {
  // this local `resolve()` is not the same as `resolve` from path
  // so it shouldn't be transformed (see ./dist/src/index.js) to
  // see our transformed code
  const resolve = string => string;
  console.log(resolve());
});

execSync(`What's up from CHILD_PROCESS!`);