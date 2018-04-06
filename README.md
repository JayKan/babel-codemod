# babel-codemod
<div align="center">
  <h1>babel-codemod</h1>

  Use Babel to codemod your code ✌️

</div>

[![MIT License][license-badge]][license]
[![Code of Conduct][coc-badge]][coc]
[![PRs Welcome][prs-badge]][prs]

> Prerequisites: make sure you have node **>=8** and npm **>=5**

## The Problem
When ES moudules land in Node.js, it's possible to the following:

```javascript
import { foo } from '/foo';
```

However since CommonJS is not statically analyzable, typically we would do something like this in our current Node code base:

```javascript
import { readFile } from 'fs'; // it works ok if you use Babel to transpile
```

## The solution
Use our custom `babel-plugin` to codemod our code programatically. To see exactly how this plugin works please follow:

```bash
$ git clone

$ npm install

$ npm run build
# See dist for our transfomred code
```

## License
MIT © [Jay Kan](https://github.com/JayKan)

[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: https://github.com/JayKan/babel-codemod/pulls
[license-badge]: https://img.shields.io/npm/l/express.svg?style=flat-square
[license]: https://github.com/JayKan/babel-codemod/blob/master/LICENSE
[coc-badge]: https://img.shields.io/badge/code%20of-conduct-ff69b4.svg?style=flat-square
[coc]: https://github.com/JayKan/babel-codemod/blob/master/CODE_OF_CONDUCT.md