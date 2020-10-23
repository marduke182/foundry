import typescript from 'typescript';
import path from 'path';

/**
 * TypeScript transformers
 * @returns {typescript.TransformerFactory<typescript.SourceFile>}
 */
export function createTransformer() {
  /**
   * @param {typescript.Node} node
   */
  function shouldMutateModuleSpecifier(node) {
    if (!typescript.isImportDeclaration(node) && !typescript.isExportDeclaration(node))
      return false;
    if (node.moduleSpecifier === undefined) return false;
    if (!typescript.isStringLiteral(node.moduleSpecifier)) return false;
    if (!node.moduleSpecifier.text.startsWith('./') && !node.moduleSpecifier.text.startsWith('../'))
      return false;
    if (path.extname(node.moduleSpecifier.text) !== '') return false;
    return true;
  }

  /**
   * Transforms import/export declarations to append `.js` extension
   * @param {typescript.TransformationContext} context
   */
  function importTransformer(context) {
    return (node) => {
      /**
       * @param {typescript.Node} node
       */
      function visitor(node) {
        if (shouldMutateModuleSpecifier(node)) {
          if (typescript.isImportDeclaration(node)) {
            // @ts-ignore
            const newModuleSpecifier = typescript.createLiteral(`${node.moduleSpecifier.text}.js`);
            return typescript.updateImportDeclaration(
              node,
              node.decorators,
              node.modifiers,
              node.importClause,
              newModuleSpecifier
            );
          } else if (typescript.isExportDeclaration(node)) {
            // @ts-ignore
            const newModuleSpecifier = typescript.createLiteral(`${node.moduleSpecifier.text}.js`);
            // @ts-ignore
            return typescript.updateExportDeclaration(
              node,
              node.decorators,
              node.modifiers,
              node.exportClause,
              newModuleSpecifier
            );
          }
        }
        return typescript.visitEachChild(node, visitor, context);
      }

      return typescript.visitNode(node, visitor);
    };
  }

  return importTransformer;
}
