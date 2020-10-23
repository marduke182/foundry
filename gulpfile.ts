import { src, dest, series, TaskFunction } from 'gulp'; // or import * as gulp from 'gulp'
import fs from 'fs-extra';
import path from 'path';
import typescript from 'typescript';
import ts from 'gulp-typescript';
import merge from 'merge-stream';
import stringify from 'json-stringify-pretty-compact';
import chalk from 'chalk';

const root = process.cwd();

/**
 * TypeScript transformers
 * @returns {typescript.TransformerFactory<typescript.SourceFile>}
 */
function createTransformer() {
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

function getModules(): string[] {
  const modules = path.join(root, 'modules');
  if (!fs.existsSync(modules)) {
    throw new Error('modules ');
  }

  return fs
    .readdirSync(modules)
    .map((name) => path.join(modules, name))
    .filter((source) => fs.lstatSync(source).isDirectory())
    .filter((source) => path.basename(source) !== 'module-base'); // Lets remove module base from the build
}

function buildTs(modules: string[]) {
  const tasks: NodeJS.ReadableStream[] = [];
  for (const module of modules) {
    const tsConfig = ts.createProject(path.join(module, 'tsconfig.json'), {
      getCustomTransformers: (_) => ({
        after: [createTransformer()],
      }),
    });
    const task = src(path.join(module, 'src/**/*.ts'))
      .pipe(tsConfig())
      .pipe(dest(path.join(module, 'dist/')));
    tasks.push(task);
  }
  return merge(tasks) as NodeJS.ReadableStream;
}

/**
 * Copy static files
 */
const copyFiles: TaskFunction = async (cb) => {
  const modules = getModules();
  const statics = ['lang', 'fonts', 'templates', 'module.json', 'system.json', 'template.json'];

  for (const module of modules) {
    try {
      for (const file of statics) {
        if (fs.existsSync(path.join(module, 'src', file))) {
          await fs.copy(path.join(module, 'src', file), path.join(module, 'dist', file));
        }
      }
      return cb();
    } catch (err) {
      cb(err);
    }
  }
};

/**
 * Update version and URLs in the manifest JSON
 */
const createModuleJson = (modulePath: string, cb: (err?: any) => void) => {
  const packageJson = fs.readJSONSync(path.join(modulePath, 'package.json'));
  const moduleJson = fs.readJSONSync(path.join(modulePath, 'src', 'module.json'));
  try {
    moduleJson.version = packageJson.version;

    const prettyProjectJson = stringify(moduleJson, { maxLength: 35 });

    fs.writeFileSync(path.join(modulePath, 'dist', 'module.json'), prettyProjectJson, 'utf8');

    return cb();
  } catch (err) {
    cb(err);
  }
};

/**
 * Remove built files from `dist` folder
 * while ignoring source files
 */
async function cleanModule(modulePath: string, cb: (err?: any) => void) {
  const name = path.basename(path.resolve(modulePath));
  const files = [];

  // If the project uses TypeScript
  if (fs.existsSync(path.join(modulePath, 'src', `${name}.ts`))) {
    files.push(
      'lang',
      'templates',
      'module',
      `${name}.js`,
      'module.json',
      'system.json',
      'template.json'
    );
  }

  console.log(' ', chalk.yellow('Files to clean:'));
  console.log('   ', chalk.blueBright(files.join('\n    ')));

  // Attempt to remove the files
  try {
    for (const filePath of files) {
      await fs.remove(path.join(modulePath, 'dist', filePath));
    }
    return cb();
  } catch (err) {
    cb(err);
  }
}

/**
 * Copy build to User Data folder
 */
export async function copyToUserData(cb) {
  const dataFolder = process.env.FOUNDRY_VTT_DATA_FOLDER;
  if (!dataFolder) {
    throw new Error('You need to specify FOUNDRY_VTT_DATA_FOLDER env variable.');
  }

  const modules = getModules();
  for (const module of modules) {
    const name = path.basename(path.resolve(module));
    let destDir: string;

    try {
      if (
        fs.existsSync(path.resolve(module, 'dist', 'module.json')) ||
        fs.existsSync(path.resolve(module, 'src', 'module.json'))
      ) {
        destDir = 'modules';
      } else {
        throw Error(`Could not find ${chalk.blueBright('module.json')}`);
      }

      let linkDir;
      if (dataFolder) {
        if (!fs.existsSync(path.join(dataFolder, 'Data')))
          throw Error('User Data path invalid, no Data directory found at' + dataFolder);

        linkDir = path.join(dataFolder, 'Data', destDir, name);
      } else {
        throw Error('You need to specify FOUNDRY_VTT_DATA_FOLDER env variable.');
      }

      console.log(chalk.green(`Copying build to ${chalk.blueBright(linkDir)}`));

      await fs.emptyDir(linkDir);
      await fs.copy(path.join(module, 'dist'), linkDir);
      cb();
    } catch (e) {
      cb(e);
    }
  }
}

export const copy = copyFiles;

export const clean: TaskFunction = async (cb) => {
  const modules = getModules();
  let errors: any[] = [];
  const promises = [];
  for (const module of modules) {
    const promise = cleanModule(module, (err) => {
      if (err) {
        errors.push(err);
      }
    });
    promises.push(promise);
  }
  await Promise.all(promises);

  cb(errors.length ? errors : undefined);
};

export const createManifest: TaskFunction = (cb) => {
  const modules = getModules();
  let errors: any[] = [];
  for (const module of modules) {
    createModuleJson(module, (err) => {
      if (err) {
        errors.push(err);
      }
    });
  }
  cb(errors.length ? errors : undefined);
};

export const execBuild = () => {
  return buildTs(getModules());
};

export const build = series(clean, execBuild, createManifest, copyFiles, copyToUserData);
