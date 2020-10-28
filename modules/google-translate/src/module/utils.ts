import { CompendiumsCache } from './types';

export const errorOnce = () => {
  let showed = false;
  return (err: string) => {
    if (!showed) {
      showed = true;
      ui.notifications.error(err);
    }
  };
};

export const sanitize = (text: string) => {
  if (text && typeof text === 'string') {
    return text.replace(/\s/g, '-').toLowerCase();
  }
  return text;
};

export const createCompendiumKey = (type: CompendiumsCache): string =>
  `${game.world.name}-gt-${sanitize(type)}`;

export const getCompendium = (type: CompendiumsCache): Compendium =>
  game.packs.get(`world.${createCompendiumKey(type)}`);

export function sanitizeContent(content: string): string {
  return content.replace(
    /(@\w+)\s*(\[\w*\])\s*(\{[\w\s]*\})/gm,
    (_, entity, id, description) => `${entity}${id}${description}`
  );
}
