import { translate, Translation } from './translate';
const DEBUG = true;
type OnClick = (e: UIEvent) => void;

interface Button {
  id: string;
  label: string;
  icon: string;
  class: string;
  onclick: OnClick;
}

interface ApplicationWithObject<T extends any> extends Application {
  object: T;
}

function allTranslated(requests: Translation[][]) {
  return requests.every((request) => request.length > 0);
}

function getTranslation(translation: Translation[]) {
  return translation[0].translatedText;
}

function addTranslateButton(buttons: Button[], onClick: OnClick) {
  if (!buttons.some((button) => button.id === 'translate')) {
    buttons.unshift({
      icon: 'fas fa-address-book',
      label: 'Translate',
      // @ts-ignore
      id: 'translate',
      // @ts-ignore
      class: 'tmp',
      onclick: onClick,
    });
  }
}

async function translateItem(item: Item) {
  const name = getProperty(item, 'data.name');
  const description = getProperty(item, 'data.data.description.value');

  console.log(name.length + description.length);
  if (!DEBUG) {
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
}

async function translateActor(actor: Actor) {
  for (const item of actor.items.values()) {
    await translateItem(item);
  }
}

async function translateJournalEntry(journal: JournalEntry) {
  const name = getProperty(journal, 'data.name');
  const content = getProperty(journal, 'data.content');

  if (!DEBUG) {
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
}

export function initSheetButton() {
  let itemSheets = {};
  let actorSheets = {};
  Object.values(CONFIG.Item.sheetClasses).forEach((itemType) =>
    Object.keys(itemType).forEach((sheetName) => (itemSheets[sheetName] = 1))
  );
  Object.values(CONFIG.Actor.sheetClasses).forEach((itemType) =>
    Object.keys(itemType).forEach((sheetName) => (actorSheets[sheetName] = 1))
  );

  Object.keys(itemSheets).forEach((sheetName) => {
    Hooks.on(
      `get${sheetName.split('.')[1]}HeaderButtons`,
      (app: ApplicationWithObject<Item>, buttons: Button[]) => {
        addTranslateButton(buttons, (e) => {
          e.preventDefault();
          return translateItem(app.object);
        });
      }
    );
  });
  Object.keys(actorSheets).forEach((sheetName) =>
    Hooks.on(
      `get${sheetName.split('.')[1]}HeaderButtons`,
      (app: ApplicationWithObject<Actor>, buttons: Button[]) => {
        addTranslateButton(buttons, (e) => {
          e.preventDefault();
          return translateActor(app.object);
        });
      }
    )
  );

  Hooks.on(
    'getJournalSheetHeaderButtons',
    (app: ApplicationWithObject<JournalEntry>, buttons: Button[]) => {
      addTranslateButton(buttons, (e) => {
        e.preventDefault();
        return translateJournalEntry(app.object);
      });
    }
  );
}
