import fs from 'fs';
import { resolve } from 'path';
import { stripIndents } from 'common-tags';
import { foo } from './esm';
import * as esm2 from './esm2';
import defaultExport from './default-esm';
import * as cjs2 from './cjs2';
import isAbsolute, { theAnswer } from './cjs';
import myFunction, { someProp, otherFunction } from './both';

function doThings(withThing) {
  return new Promise(resolve => {
    if (foo()) {
      const resolved = 'I am not the resolve function!';
      return resolve(
        fs.writeFileSync('./foo.ignored.txt', resolved)
      );
    } else if (defaultExport() && isAbsolute(withThing)) {
      const foo = 'not the foo function';
      return resolve(
        myFunction(resolve(foo, someProp), otherFunction)
      );
    } else if (cjs2.foobar()) {
      return resolve(cjs2.baz.buzz);
    } else if (esm2.default) {
      return resolve({ foo: esm2.foo });
    }
    return resolve(theAnswer);
  });
}

doThings('/blah/blah').then(result => {
  console.log(
    stripIndents`
      ----------------------------
      doThings and get results:

      ${JSON.stringify(result, null, 4)}
      ----------------------------
    `
  );
});