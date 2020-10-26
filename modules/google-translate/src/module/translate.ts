import { moduleName } from './consts';
import { getKey, getSource, getTarget } from './hooks/init/register-settings';
import { errorOnce } from './utils';

export interface Translation {
  translatedText: string;
}

const ROOT_URL = 'https://translation.googleapis.com/language/translate/v2';
const showNoApiKeyError = errorOnce(game.i18n.format(`${moduleName}.api-key.not-found`, {}));

export async function translate(text: string): Promise<Translation[]> {
  const key = getKey();
  if (!key) {
    showNoApiKeyError();
    return;
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

function allTranslated(requests: Translation[][]) {
  return requests.every((request) => request.length > 0);
}

function getTranslation(translation: Translation[]) {
  return translation[0].translatedText;
}

export async function translateItem(item: Item): Promise<void> {
  const name = getProperty(item, 'data.name');
  const description = getProperty(item, 'data.data.description.value');
  const translations = await Promise.all([translate(name), translate(description)]);

  if (allTranslated(translations)) {
    await item.update(
      {
        name: getTranslation(translations[0]),
        'data.description.value': getTranslation(translations[1]),
      },
      undefined
    );
  }
}

export async function translateActor(actor: Actor): Promise<void> {
  const name = getProperty(actor, 'data.name');

  const translations = await Promise.all([translate(name)]);

  if (allTranslated(translations)) {
    await actor.update(
      {
        name: getTranslation(translations[0]),
      },
      undefined
    );
  }

  for (const item of actor.items.values()) {
    await translateItem(item);
  }
}

export async function translateJournalEntry(journal: JournalEntry): Promise<void> {
  const name = getProperty(journal, 'data.name');
  const content = getProperty(journal, 'data.content');

  const translations = await Promise.all([translate(name), translate(content)]);

  if (allTranslated(translations)) {
    await journal.update(
      {
        name: getTranslation(translations[0]),
        content: getTranslation(translations[1]),
      },
      undefined
    );
  }
}
