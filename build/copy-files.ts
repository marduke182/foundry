import fs from 'fs-extra';
import path from 'path';
import { eachModule } from './utils';

/**
 * Copy static files
 */
export async function copyFiles(cb) {
  const statics = [
    'lang',
    'fonts',
    'templates',
    'module.json',
    'system.json',
    'template.json',
    'manifest.json',
  ];
  const errors = [];
  for (const modulePath of eachModule()) {
    try {
      for (const file of statics) {
        if (fs.existsSync(path.join(modulePath, 'src', file))) {
          await fs.copy(path.join(modulePath, 'src', file), path.join(modulePath, 'dist', file));
        }
      }
    } catch (err) {
      errors.push(err);
    }
  }

  cb(errors.length ? errors : undefined);
}
