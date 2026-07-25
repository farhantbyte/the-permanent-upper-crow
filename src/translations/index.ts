// to add a new language 
// 0 - make sure you made a file ./<lang>.ts
// 1- import here
// 2- add to translations
// 3- that's it - Farr-KAW-ehan...

import { en } from './en';
import { fa } from './fa';

const translations = { en, fa };

export type Language = keyof typeof translations;

export const availableLanguages = Object.keys(translations) as Language[];

let currentLang: Language = 'en';

export function setLanguage(lang: Language) {
  currentLang = lang;
}

export function getLanguage(): Language {
  return currentLang;
}

export function t() {
  return translations[currentLang];
}

// define elements that needed to become rtl... for an rtl-based language

const RTL_CLASSES = [
  'dialogue-speaker',
  'dialogue-body',
  'hud',
  'store-sign-main',
  'contract-body',
  'contract-sig-label',
  'contract-fine-print',
  'news-chyron',
  'news-live',
  'insufficient-flash',
];
 
export function applyDirection(): void {
  const isRtl = t().dir === 'rtl';
 
  RTL_CLASSES.forEach((cls) => {
    document.querySelectorAll(`.${cls}`).forEach((el) => {
      el.classList.toggle('rtl', isRtl);
    });
  });
 
  const label = document.querySelector('.btn-cawfee-label');
  if (label) label.textContent = t().exti.cawfeeBtn;
}

