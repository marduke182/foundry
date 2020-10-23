import path from 'path';
import fs from 'fs-extra';

const root = process.cwd();

export function getModules(): string[] {
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

export function forEachModule(modulefn: (modulePath: string) => any) {
  const modules = getModules();

  for (const module of modules) {
    modulefn(module);
  }
}
