import { moduleName, itemCompendium } from '../../consts';

const KEY = 'key';
const SOURCE = 'source';
const TARGET = 'target';

export const getKey = (): string => game.settings.get(moduleName, KEY);
export const getSource = (): string => game.settings.get(moduleName, SOURCE);
export const getTarget = (): string => game.settings.get(moduleName, TARGET);

export const registerSettings = (): void => {
  game.settings.register(moduleName, 'key', {
    name: game.i18n.localize(`${moduleName}.api-key.Name`),
    hint: game.i18n.localize(`${moduleName}.api-key.Hint`),
    scope: 'world',
    default: '',
    config: true,
    type: String,
  });

  game.settings.register(moduleName, 'source', {
    name: game.i18n.localize(`${moduleName}.source.Name`),
    hint: game.i18n.localize(`${moduleName}.source.Hint`),
    scope: 'world',
    default: 'en',
    config: true,
    type: String,
    choices: {
      // If choices are defined, the resulting setting will be a select menu
      en: 'English',
      es: 'Spanish',
    },
  });

  game.settings.register(moduleName, 'target', {
    name: game.i18n.localize(`${moduleName}.target.Name`),
    hint: game.i18n.localize(`${moduleName}.target.Hint`),
    scope: 'world',
    default: 'es',
    config: true,
    type: String,
    choices: {
      // If choices are defined, the resulting setting will be a select menu
      en: 'English',
      es: 'Spanish',
    },
  });

  game.settings.register(moduleName, 'log-level', {
    name: game.i18n.localize(`${moduleName}.log-level.Name`),
    hint: game.i18n.localize(`${moduleName}.log-level.Hint`),
    scope: 'world',
    default: 'off',
    config: true,
    type: String,
    choices: {
      off: 'OFF',
      info: 'INFO',
      warn: 'WARN',
      err: 'ERR',
      debug: 'DEBUG',
    },
  });

  game.settings.register(moduleName, itemCompendium, {
    scope: 'world',
    default: '',
    config: false,
    type: String,
  });
};
