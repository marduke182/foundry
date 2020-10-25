const tasks = arr => arr.join(' && ')

module.exports = {
  'hooks': {
    "commit-msg": "yarn commitlint -E HUSKY_GIT_PARAMS",
    'pre-commit': tasks([
      'yarn lint-staged',
      'yarn gulp updateManifest',
    ])
  }
}
