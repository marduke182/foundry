import { getCompendium } from './utils';
import { moduleName } from './consts';
import * as logger from './logger';
import { ItemGTData } from './types';

export async function storeItemInCache(item: Item, translated: ItemGTData) {
  logger.info(`storing ${item.name} in the cache.`);
  const cacheCompendium = getCompendium('Item');

  const newItem = await cacheCompendium.importEntity(await item.clone());

  newItem.setFlag(moduleName, 'name', translated.name);
  newItem.setFlag(moduleName, 'description', translated.description);
}

/**
 * Find the exact item, same item could have same name but different type
 * @param item that your are looking for
 * @param items array of similar items that you want to filter
 */
function findSpecificItem(item: Item, items: Item[]): Item | undefined {
  if (items.length === 0) {
    logger.debug(`No items found for ${item.name}`);
    return;
  }

  // We dont optimize for system that does not store data type
  if (!hasProperty(items, 'data.type')) {
    logger.debug('Current system does not support data.type property.');
    return items[0];
  }

  // We try to find the specific type
  const type = getProperty(item, 'data.type');
  logger.debug(`Looking for a ${item.name} of type: ${type}.`);
  const result = items.filter((e) => getProperty(e, 'data.type') === type);

  return result.length > 1 ? result[0] : undefined;
}

export async function getFromCache(entity: Item): Promise<Item | undefined> {
  logger.info(`retrieving ${entity.name} from cache.`);
  const cache = getCompendium('Item');

  const items = await Promise.all(
    (await cache.getIndex())
      .filter((item) => item.name === entity.name)
      .map<Promise<Item>>((item) => cache.getEntity(item._id) as Promise<Item>)
  );

  logger.debug(`${items.length} items found in the cache.`);

  return findSpecificItem(entity, items);
}
