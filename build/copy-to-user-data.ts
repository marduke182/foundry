import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { forEachModule } from './utils';

/**
 * Copy build to User Data folder
 */
export async function copyToUserData(cb) {
  const dataFolder = process.env.FOUNDRY_VTT_DATA_FOLDER;
  if (!dataFolder) {
    throw new Error('You need to specify FOUNDRY_VTT_DATA_FOLDER env variable.');
  }
  const errors = [];
  forEachModule(async (modulePath) => {
    const name = path.basename(path.resolve(modulePath));
    let destDir: string;

    try {
      if (
        fs.existsSync(path.resolve(modulePath, 'dist', 'module.json')) ||
        fs.existsSync(path.resolve(modulePath, 'src', 'module.json'))
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
      await fs.copy(path.join(modulePath, 'dist'), linkDir);
      cb();
    } catch (e) {
      errors.push(e);
    }
  });

  cb(errors.length ? errors : undefined);
}
