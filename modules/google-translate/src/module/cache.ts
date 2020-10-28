import { getCompendium } from './utils';
import { moduleName } from './consts';
import * as logger from './logger';

export interface ItemTranslationData {
  source: {
    name: string;
    description: string;
  };
  target: {
    name: string;
    description: string;
  };
}

export function getData(item: Item): ItemTranslationData | undefined {
  const data = item.getFlag(moduleName, 'data');
  if (!data) {
    return data;
  }

  return data as ItemTranslationData;
}

export function setData(item: Item, data: ItemTranslationData): void {
  item.setFlag(moduleName, 'data', data);
}

export async function storeItemInCache(item: Item, data: ItemTranslationData) {
  logger.info(`storing ${item.name} in the cache.`);
  if (!hasProperty(item, 'data.type')) {
    logger.err(`${moduleName} requires that items contais a 'data.type' property.`);
    return;
  }

  const cache = await getFromCache(item);
  if (cache) {
    setData(cache, data);
  }

  const cacheCompendium = getCompendiumCache(getProperty(item, 'data.type'));
  const newItem = await cacheCompendium.importEntity(item);

  setData(newItem as Item, data);
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

function getCompendiumCache(type: string) {
  switch (type) {
    case 'spell': {
      return getCompendium('Spell');
    }
    case 'feat': {
      return getCompendium('Feat');
    }
    default: {
      return getCompendium('Item');
    }
  }
}

export async function getFromCache(entity: Item): Promise<Item | undefined> {
  logger.info(`retrieving ${entity.name} from cache.`);
  if (!hasProperty(entity, 'data.type')) {
    logger.err(`${moduleName} requires that items contais a 'data.type' property.`);
    return;
  }
  const type = getProperty(entity, 'data.type');
  const compendiumCache = getCompendiumCache(type);

  const items = await Promise.all(
    (await compendiumCache.getIndex())
      .filter((item) => item.name === entity.name)
      .map<Promise<Item>>((item) => compendiumCache.getEntity(item._id) as Promise<Item>)
  );

  logger.debug(`${items.length} items found in the cache.`);

  return findSpecificItem(entity, items);
}
