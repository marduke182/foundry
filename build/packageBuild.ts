import path from 'path';
import fs from 'fs-extra';
import archiver from 'archiver';
import chalk from 'chalk';
import { eachModule } from './utils';
import gh from 'ghreleases';

const auth = {
  token: process.env.GH_TOKEN,
};

interface Assets {
  name: string;
}

interface Release {
  assets: Assets[];
}

// TODO: Get repo info from package homepage url
const OWNER = 'marduke182';
const REPO = 'foundry';

export const uploadAssets = async (moduleTag: string, zipPath: string) => {
  const fileName = path.basename(zipPath);
  return new Promise((resolve, reject) => {
    gh.getByTag(auth, OWNER, REPO, moduleTag, (err, release: Release) => {
      if (err) {
        console.log(
          chalk.red('You cannot upload the assets without creating the release first.', err)
        );
        reject();
        return;
      }

      if (release.assets.some((asset) => asset.name === fileName)) {
        console.log(chalk.yellow('The release already has an asset. Skipping.'));
        resolve();
        return;
      }

      gh.uploadAssets(auth, 'marduke182', 'foundry', `tags/${moduleTag}`, zipPath, (err, res) => {
        if (err) {
          return reject(err);
        }
        console.log(chalk.yellow(`The release ${moduleTag} has been published.`));
        return resolve(res);
      });
    });
  });
};

function createZip(moduleName: string, at: string, fromPath: string) {
  return new Promise((resolve, reject) => {
    const zipName = path.basename(at);
    const zipFile = fs.createWriteStream(at);

    const zip = archiver('zip', { zlib: { level: 9 } });

    zipFile.on('close', () => {
      console.log(chalk.green(`Zip file ${zipName} has been written`));
      resolve();
    });

    zip.on('error', (err) => {
      reject(err);
    });

    zip.pipe(zipFile);

    // Add the directory with the final code
    zip.directory(fromPath, moduleName);

    zip.finalize();
  });
}

/**
 * Package build
 */
export async function packageBuild(cb) {
  for (const modulePath of eachModule()) {
    const manifest = fs.readJSONSync(path.join(modulePath, 'dist', 'module.json'));
    const packageInfo = fs.readJSONSync(path.join(modulePath, 'package.json'));
    const moduleName = path.basename(modulePath);

    await fs.ensureDir(path.join('package', moduleName));

    const zipName = `${manifest.name}.zip`;
    const zipPath = path.join('package', moduleName, zipName);

    await createZip(manifest.name, zipPath, path.join(modulePath, 'dist/'));
    await uploadAssets(`${packageInfo.name}@${packageInfo.version}`, zipPath);
  }
  cb();
}
