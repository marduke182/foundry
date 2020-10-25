import fs from 'fs-extra';
import path from 'path';
import stringify from 'json-stringify-pretty-compact';
import { forEachModule } from './utils';
import { TaskFunction } from 'gulp';
import simpleGit, { SimpleGit, SimpleGitOptions } from 'simple-git';

const options: SimpleGitOptions = {
  baseDir: process.cwd(),
  binary: 'git',
  maxConcurrentProcesses: 6,
};

// when setting all options in a single object
const git: SimpleGit = simpleGit(options);

/**
 * Update version and URLs in the manifest JSON
 */
export const updateManifest: TaskFunction = (cb) => {
  let errors: any[] = [];

  forEachModule((modulePath) => {
    const packageJson = fs.readJSONSync(path.join(modulePath, 'package.json'));
    const moduleJson = fs.readJSONSync(path.join(modulePath, 'src', 'module.json'));
    const repository = packageJson.homepage;
    try {
      moduleJson.version = packageJson.version;
      moduleJson.url = repository;
      moduleJson.author = packageJson.author;
      moduleJson.manifest = `${repository.replace('github.com', 'raw.githubusercontent.com')}/${
        packageJson.name
      }@${packageJson.version}/modules/${path.basename(modulePath)}/src/module.json`;

      moduleJson.download = `${repository}/archive/${packageJson.name}@${packageJson.version}.zip`;

      const prettyProjectJson = stringify(moduleJson, { maxLength: 35 });

      fs.writeFileSync(path.join(modulePath, 'src', 'module.json'), prettyProjectJson, 'utf8');
      git.add(path.join(modulePath, 'src', 'module.json'));
    } catch (err) {
      errors.push(err);
    }
  });

  cb(errors.length ? errors : undefined);
};
