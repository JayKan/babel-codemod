'use strict';

const fs = require('fs');
const path = require('path');
const { parse } = require('babylon');
const { traverse } = require('babel-core');
const JSON = require('circular-json');
const { oneLine } = require('common-tags');
const isBuiltinModule = require('is-builtin-module');

module.exports = babel => {
  // `types` contain methods for building ASTs manually and for checking
  // the types of AST nodes
  const { types: t } = babel;

  // NOTES: a plugin can have functions that are
  // run before or after plugins. They can be used
  // for setup or cleanup/analysis purposes
  return {
    // our primiary `visitor` for the plugin
    // see: https://en.wikipedia.org/wiki/Visitor_pattern
    visitor: {
      ImportDeclaration(path, { file }) {
        let memberObjectNameIdentifier;
        const {
          namedSpecifiers,
          defaultSpecifier,
          namespaceSpecifier,
        } = splitSpecifiers(t, path.get('specifiers'));
        const { node: { value: source } } = path.get('source');
        const specifiersExist = Boolean(namedSpecifiers.length) || Boolean(namespaceSpecifier);
        const isCommonJS = isCommonJSModule(source, file.opts.filename);

        // check to see if there are namedSpecifiers/namespaceSpecifier or CommonJS
        if (!specifiersExist || !isCommonJS) {
          return;
        }

        // check to see if there are any defaultSpecifier
        if (defaultSpecifier) {
          memberObjectNameIdentifier = defaultSpecifier.node.local;
        } else if (namespaceSpecifier) {
          memberObjectNameIdentifier = namespaceSpecifier.node.local;
          namespaceSpecifier.replaceWith(
            t.importDefaultSpecifier(memberObjectNameIdentifier),
          );
        } else {
          memberObjectNameIdentifier = path.scope.generateUidIdentifier(source);
          path.node.specifiers.push(
            t.importDefaultSpecifier(memberObjectNameIdentifier),
          );
        }

        namedSpecifiers.forEach(specifier => {
          const { node: { imported: { name } } } = specifier;
          const { referencePaths } = specifier.scope.getBinding(name);
          referencePaths.forEach(refPath => {
            refPath.replaceWith(
              t.memberExpression(
                memberObjectNameIdentifier,
                t.identifier(name),
              ),
            );
          });
          specifier.remove();
        });
      }
    }
  }
}

function splitSpecifiers(t, specifiers) {
  return specifiers.reduce(
    (acc, specifier) => {
      if (t.isImportSpecifier(specifier)) {
        acc.namedSpecifiers.push(specifier);
      } else if (t.isImportNamespaceSpecifier(specifier)) {
        acc.namespaceSpecifier = specifier;
      } else if (t.isImportDefaultSpecifier(specifier)) {
        acc.defaultSpecifier = specifier;
      }
      return acc;
    },
    { namedSpecifiers: [] }
  );
}

function isCommonJSModule(sourceString, filename) {
  if (isRelativePath(sourceString)) {
    const fullPath = path.resolve(path.dirname(filename), sourceString);
    return !exportsAsESModule(require.resolve(fullPath));
  } else if (path.isAbsolute(sourceString)) {
    return !exportsAsESModule(require.resolve(sourceString));
  } else if (isBuiltinModule(sourceString)) {
    return true;
  } else {
    console.warn(
      oneLine`
        import for "${sourceString}" was unable
        to be identified as commonJS or ESM
      `
    );
    return false;
  }
}

function isRelativePath(string) {
  return string.startsWith('.');
}

function exportsAsESModule(modulePath) {
  const contents = fs.readFileSync(modulePath, 'utf8');
  try {
    const ast = parse(contents, {
      sourceType: 'module',
    });
    let hasExportSpecifier = false;
    traverse(ast, {
      ExportSpecifier(path) {
        hasExportSpecifier = true;
        path.stop();
      }
    });
    return hasExportSpecifier;
  } catch (error) {
    console.warn(`unable to parse '${modulePath}'`, error);
    return error;
  }
}