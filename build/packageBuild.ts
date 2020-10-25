import path from 'path';
import fs from 'fs-extra';
import archiver from 'archiver';
import chalk from 'chalk';
import { forEachModule } from './utils';

/**
 * Package build
 */
export async function packageBuild(cb) {
  const tasks: Promise<any>[] = [];

  forEachModule(async (modulePath) => {
    const manifest = fs.readJSONSync(path.join(modulePath, 'dist', 'module.json'));
    const moduleName = path.basename(modulePath);

    await fs.ensureDir(path.join('package', moduleName));

    const zipName = `${manifest.name}-v${manifest.version}.zip`;

    const task = new Promise((resolve, reject) => {
      const zipFile = fs.createWriteStream(path.join('package', moduleName, zipName));

      const zip = archiver('zip', { zlib: { level: 9 } });

      zipFile.on('close', () => {
        console.log(chalk.green(zip.pointer() + ' total bytes'));
        console.log(chalk.green(`Zip file ${zipName} has been written`));
        return resolve;
      });

      zip.on('error', (err) => {
        reject(err);
      });

      zip.pipe(zipFile);

      // Add the directory with the final code
      zip.directory(path.join(modulePath, 'dist/'), manifest.name);

      zip.finalize();
    });
    tasks.push(task);
  });

  await Promise.all(tasks);
  cb();
}
