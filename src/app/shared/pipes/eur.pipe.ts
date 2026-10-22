import { Pipe, type PipeTransform } from '@angular/core';

const LOCALES: Readonly<Record<string, string>> = {
  en: 'en-IE',
  es: 'es-ES',
  de: 'de-DE',
  lt: 'lt-LT',
};
const formatters = new Map<string, Intl.NumberFormat>();

/** EUR formatting in the active UI language without bundling Angular locale data. */
@Pipe({ name: 'eur' })
export class EurPipe implements PipeTransform {
  transform(value: number, lang = 'en', fractionDigits = 0): string {
    const key = `${lang}:${String(fractionDigits)}`;
    let formatter = formatters.get(key);
    if (!formatter) {
      formatter = new Intl.NumberFormat(LOCALES[lang] ?? 'en-IE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      });
      formatters.set(key, formatter);
    }
    return formatter.format(value);
  }
}
