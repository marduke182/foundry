import { series } from 'gulp'; // or import * as gulp from 'gulp'
import { build as buildTs } from './build/build';
import { updateManifest as updateManifestImpl } from './build/update-manifest';
import { clean as cleanModule } from './build/clean';
import { copyFiles } from './build/copy-files';
import { copyToUserData } from './build/copy-to-user-data';
import { packageAndUpload } from './build/package-and-upload';

export function copy(cb) {
  return copyFiles(cb);
}

export function clean(cb) {
  return cleanModule(cb);
}

export function updateManifest(cb) {
  return updateManifestImpl(cb);
}

export function execBuild(cb) {
  return buildTs(cb);
}

export const dev = series(clean, execBuild, updateManifest, copyFiles, copyToUserData);

export const build = series(clean, execBuild, updateManifest, copyFiles);

// This requires GH_TOKEN
export const release = series(clean, execBuild, copyFiles, packageAndUpload);
