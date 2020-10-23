import { getKey, getSource, getTarget } from './settings';

const ROOT_URL = 'https://translation.googleapis.com/language/translate/v2';

export function translate(text: string): Promise<Translation[]> {
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

export interface Translation {
  translatedText: string;
}
