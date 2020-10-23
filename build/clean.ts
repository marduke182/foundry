import { TaskFunction } from 'gulp';
import { forEachModule } from './utils';
import path from 'path';
import fs from 'fs-extra';

/**
 * Remove built files from `dist` folder
 * while ignoring source files
 */
async function cleanModule(modulePath: string): Promise<any> {
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

  // Attempt to remove the files
  try {
    for (const filePath of files) {
      await fs.remove(path.join(modulePath, 'dist', filePath));
    }
    return;
  } catch (err) {
    return err;
  }
}

export const clean: TaskFunction = async (cb) => {
  const promises = [];

  forEachModule((modulePath) => {
    const promise = cleanModule(modulePath);
    promises.push(promise);
  });

  const errors = (await Promise.all(promises)).filter((error) => !!error);

  cb(errors.length ? errors : undefined);
};
