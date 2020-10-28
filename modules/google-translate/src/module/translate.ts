import { moduleName } from './consts';
import { getKey, getSource, getTarget } from './hooks/init/register-settings';
import { errorOnce, sanitizeContent } from './utils';
import * as logger from './logger';
import { ItemGTData } from './types';
import { getFromCache, storeItemInCache, getData, ItemTranslationData, setData } from './cache';

export interface Translation {
  translatedText: string;
}

const ROOT_URL = 'https://translation.googleapis.com/language/translate/v2';
const showNoApiKeyError = errorOnce();

/**
 * Retrieve the information from the configuration and invoke google translate api
 * @param text API client
 */
export async function translate(text: string): Promise<Translation[]> {
  const key = getKey();
  if (!key) {
    showNoApiKeyError(game.i18n.format(`${moduleName}.api-key.not-found`, {}));
    return [];
  }
  const params = `q=${encodeURIComponent(
    text
  )}&source=${getSource()}&target=${getTarget()}&key=${getKey()}`;

  return fetch(`${ROOT_URL}?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })
    .then((res) => res.json())
    .then((response) => {
      return response.data.translations;
    })
    .catch((error) => {
      console.log('There was an error with the translation request: ', error);
    });
}

// Helpers
function allTranslated(requests: Translation[][]) {
  return requests.every((request) => request.length > 0);
}

function getTranslation(translation: Translation[]) {
  return translation[0].translatedText;
}

async function updateItem(item: Item, data: ItemGTData) {
  logger.info(`Updating ${item.name} with the translation.`);
  return item.update(
    {
      name: data.name,
      'data.description.value': data.description,
    },
    undefined
  );
}

// Helpers end
async function useInternalDataIfAble(item: Item, withData: Item): Promise<boolean> {
  // Check if it was translated already
  const data = getData(withData);
  if (data) {
    logger.info(`Item: ${item.name} was translated previously, flipping the language instead.`);
    const { source, target } = data;
    if (getProperty(item, 'data.name') === source.name) {
      await updateItem(item, target);
    } else {
      await updateItem(item, source);
    }
    return true;
  }
  return false;
}

/**
 * Function that will translate the items name and description
 * @param item Item to be translated
 */
export async function translateItem(item: Item): Promise<void> {
  const done = await useInternalDataIfAble(item, item);
  if (done) {
    return;
  }

  // Attempt to get from cache
  const cache = await getFromCache(item);
  if (cache) {
    logger.info(`${item.name} was found on the cache.`);
    const done = await useInternalDataIfAble(item, cache);
    if (done) {
      // Need to store the cache on this item to no do another call
      setData(item, getData(cache));
      return;
    }
  }

  // Otherwise, translate using google.
  logger.info(`${item.name} was not in the cache.`);
  const name = getProperty(item, 'data.name');
  const description = getProperty(item, 'data.data.description.value');
  const translations = await Promise.all([translate(name), translate(description)]);

  if (allTranslated(translations)) {
    // Uptade cache and set flag of item translated
    const itemTranslationData: ItemTranslationData = {
      source: { name, description },
      target: {
        name: getTranslation(translations[0]),
        description: getTranslation(translations[1]),
      },
    };
    storeItemInCache(item, itemTranslationData);
    await updateItem(item, itemTranslationData.target);
    setData(item, itemTranslationData);
  }
}

/**
 * Function that will translate the actor name and all his items, features, spells, etc.
 * @param actor Actor to be translated
 */
export async function translateActor(actor: Actor): Promise<void> {
  const name = getProperty(actor, 'data.name');

  const translations = await Promise.all([translate(name)]);

  if (allTranslated(translations)) {
    logger.info('Actor name has been translated.');
    await actor.update(
      {
        name: getTranslation(translations[0]),
      },
      undefined
    );
  }

  logger.info(`Translating all the items, spells and features of the Actor: ${actor.name}.`);
  for (const item of actor.items.values()) {
    await translateItem(item);
  }
  logger.info(`Items of the Actor: ${actor.name}, has been translated.`);
}

/**
 * Function that will translate the content of the journal
 * @param journal Journal to be translated
 */
export async function translateJournalEntry(journal: JournalEntry): Promise<void> {
  // Check if was translated before
  const wasTranslated = journal.getFlag(moduleName, 'translated');
  if (wasTranslated) {
    logger.info(`Stopping translation, the ${journal.name} was already translated.`);
    return;
  }

  // Otherwide, translate, no cache needed for journals
  const name = getProperty(journal, 'data.name');
  const content = getProperty(journal, 'data.content');

  const translations = await Promise.all([translate(name), translate(content)]);

  if (allTranslated(translations)) {
    logger.info(`The Journal: ${journal.name} has been translated.`);
    await journal.update(
      {
        name: getTranslation(translations[0]),
        content: sanitizeContent(getTranslation(translations[1])),
      },
      undefined
    );
    journal.setFlag(moduleName, 'translated', true);
  }
}
