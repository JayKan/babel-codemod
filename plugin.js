'use strict';
const JSON = require('circular-json');
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
      ImportDeclaration(path, state) {
        const specifiers = [];
        let defaultSpecifier;

        path.get('specifiers').forEach(specifier => {
          if (t.isImportSpecifier(specifier)) {
            specifiers.push(specifier);
          } else {
            defaultSpecifier = specifier;
          }
        });

        const { node: { value: source } } = path.get('source');
        const isBuiltIn = isBuiltinModule(source);

        // since we're only looking for native built-in packages
        if (!specifiers.length || !isBuiltIn) {
          return;
        }

        let memberObjectNameIdentifier;
        if (defaultSpecifier) {
          memberObjectNameIdentifier = defaultSpecifier.node.local;
        } else {
          memberObjectNameIdentifier = path.scope.generateUidIdentifier(source);
          path.node.specifiers.push(t.importDefaultSpecifier(memberObjectNameIdentifier));
        }

        specifiers.forEach(specifier => {
          const { node: { imported: { name } } } = specifier;
          const { referencePaths } = specifier.scope.getBinding(name);

          referencePaths.forEach(refPath => {
            refPath.replaceWith(
              t.memberExpression(memberObjectNameIdentifier, t.identifier(name))
            );
          });

          specifier.remove();
        });
      }
    }
  }
}
