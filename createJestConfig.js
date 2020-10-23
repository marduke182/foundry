module.exports = (dir) => {
  const packageInfo = require(`${dir}/package.json`);
  const packageName = packageInfo.name.split('@marduke182/').pop();
  return {
    name: packageName,
    displayName: packageName,
    // default config
    preset: 'ts-jest',
    globals: {
      'ts-jest': {
        diagnostics: false,
      },
    },
    setupFiles: ['core-js'],
    testMatch: ['**/src/**/*.test.+(ts|tsx|js)'],
    moduleDirectories: ['node_modules'],
    moduleNameMapper: {
      '^@marduke182/(.*)$': '<rootDir>/../$1/src',
    },
  };
};
