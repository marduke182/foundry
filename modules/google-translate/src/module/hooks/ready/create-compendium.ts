import * as logger from '../../logger';
import { createCompendiumKey, getCompendium } from '../../utils';
import { CompendiumType } from '../../types';

export async function createConpendium() {
  const createCompendiumIfNoExist = async (
    compendiumType: CompendiumType,
    compendiumLabel: string
  ) => {
    const compendiumName = createCompendiumKey(compendiumType);
    const compendium = getCompendium(compendiumType);
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
    createCompendiumIfNoExist('Item', 'Items'),
    // No need to cache journals, it does not make sense.... as differen that items this can change very often.
    // createCompendiumIfNoExist('JournalEntry', 'Journal'),
  ]);

  if (results.some((result: PromiseFulfilledResult<boolean>) => result.value)) location.reload();
}
