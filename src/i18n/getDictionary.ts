import 'server-only';

const dictionaries = {
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  ru: () => import('./dictionaries/ru.json').then((module) => module.default),
};

export type Locale = keyof typeof dictionaries;

export const getDictionary = async (locale: Locale) => {
  // Default to ru if locale is not found
  if (!dictionaries[locale]) {
    return dictionaries.ru();
  }
  return dictionaries[locale]();
};
