import * as logger from '../../logger';
import { createCompendiumKey, getCompendium } from '../../utils';
import { CompendiumType, CompendiumsCache } from '../../types';

export async function createConpendium() {
  const createCompendiumIfNoExist = async (
    compendiumType: CompendiumType,
    compendiumLabel: CompendiumsCache
  ) => {
    const compendiumName = createCompendiumKey(compendiumLabel);
    const compendium = getCompendium(compendiumLabel);
    if (compendium) {
      logger.info(`Compendium '${compendiumName}' found, will not create compendium.`);
      return false;
    }

    logger.info(`Compendium '${compendiumName}' was not found, creating it now.`);
    // create a compendium for the user
    await Compendium.create({
      entity: compendiumType,
      label: `Translations for: ${compendiumLabel}`,
      name: compendiumName,
      package: 'world',
    });
    return true;
  };

  const results = await Promise.allSettled([
    createCompendiumIfNoExist('Item', 'Item'),
    createCompendiumIfNoExist('Item', 'Spell'),
    createCompendiumIfNoExist('Item', 'Feat'),
    // No need to cache journals, it does not make sense.... as differen that items this can change very often.
    // createCompendiumIfNoExist('JournalEntry', 'Journal'),
  ]);

  if (results.some((result: PromiseFulfilledResult<boolean>) => result.value)) location.reload();
}
