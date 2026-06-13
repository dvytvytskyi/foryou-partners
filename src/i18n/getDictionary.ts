import 'server-only';

const dictionaries = {
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  ru: () => import('./dictionaries/ru.json').then((module) => module.default),
};

export type Locale = keyof typeof dictionaries;

function injectHardcoded(obj: any, hardcodedObj: any) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return;
  
  // Add the reference
  obj.hardcoded = hardcodedObj;

  // Recurse into all object values
  for (const key of Object.keys(obj)) {
    if (key !== 'hardcoded' && typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      injectHardcoded(obj[key], hardcodedObj);
    }
  }
}

export const getDictionary = async (locale: Locale) => {
  // Default to ru if locale is not found
  let rawDict;
  if (!dictionaries[locale]) {
    rawDict = await dictionaries.ru();
  } else {
    rawDict = await dictionaries[locale]();
  }

  // Clone to allow mutation, as imports might be read-only
  const dict = JSON.parse(JSON.stringify(rawDict));

  if (dict.hardcoded) {
    injectHardcoded(dict, dict.hardcoded);
  }

  return dict;
};
