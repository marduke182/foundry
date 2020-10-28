import { translateActor, translateItem, translateJournalEntry } from '../../translate';
import { ApplicationWithObject, Button, OnClick } from '../../types';

function addTranslateButton(buttons: Button[], onClick: OnClick) {
  if (!buttons.some((button) => button.id === 'translate')) {
    buttons.unshift({
      icon: 'fas fa-address-book',
      label: 'Change Language',
      // @ts-ignore
      id: 'translate',
      // @ts-ignore
      class: 'tmp',
      onclick: onClick,
    });
  }
}

export function initSheetButton() {
  if (!game.user.isGM) return;

  const itemSheets = {};
  const actorSheets = {};
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
