import { moduleName, journalCompendium, itemCompendium } from '../../consts';
import * as logger from '../../logger';

export default async function () {
  let sanitize = (text) => {
    if (text && typeof text === 'string') {
      return text.replace(/\s/g, '-').toLowerCase();
    }
    return text;
  };

  const createCompendiumIfNoExist = async (
    settingName: string,
    compendiumType: string,
    compendiumLabel: string
  ) => {
    const compendiumName = game.settings.get(moduleName, settingName);
    const compendium = game.packs.find((pack: Compendium) => pack.collection === compendiumName);
    const sanitizedLabel = sanitize(compendiumLabel);
    if (compendium) {
      logger.info(`Compendium '${compendiumName}' found, will not create compendium.`);
      return false;
    }

    logger.info(`Compendium '${compendiumName}' was not found, creating it now.`);
    // create a compendium for the user
    await Compendium.create({
      entity: compendiumType,
      label: `My Translations cache ${compendiumLabel}`,
      name: `${game.world.name}-gt-${sanitizedLabel}`,
      package: 'world',
    });
    await game.settings.set(
      moduleName,
      settingName,
      `world.${game.world.name}-gt-${sanitizedLabel}`
    );
    return true;
  };

  const results = await Promise.allSettled([
    createCompendiumIfNoExist(itemCompendium, 'Item', 'Items'),
    createCompendiumIfNoExist(journalCompendium, 'Journal', 'Journal'),
  ]);

  if (results.some((result: PromiseFulfilledResult<boolean>) => result.value)) location.reload();
}
