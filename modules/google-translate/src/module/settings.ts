const KEY = 'key';
const SOURCE = 'source';
const TARGET = 'target';

export const getKey = () => game.settings.get('google-translate', KEY);
export const getSource = () => game.settings.get('google-translate', SOURCE);
export const getTarget = () => game.settings.get('google-translate', TARGET);

export const registerSettings = function () {
  game.settings.register('google-translate', 'key', {
    name: game.i18n.localize('google-translate.api-key.Name'),
    hint: game.i18n.localize('google-translate.api-key.Hint'),
    scope: 'world',
    default: '',
    config: true,
    type: String,
  });

  game.settings.register('google-translate', 'source', {
    name: game.i18n.localize('google-translate.source.Name'),
    hint: game.i18n.localize('google-translate.source.Hint'),
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

  game.settings.register('google-translate', 'target', {
    name: game.i18n.localize('google-translate.target.Name'),
    hint: game.i18n.localize('google-translate.target.Hint'),
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
};
