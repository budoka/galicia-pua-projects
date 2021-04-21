import Moment from 'moment';

export function getKey(value: string | string[]): string {
  return value instanceof Array ? value[0] : value;
}

/**
 * isEmpty('');
 *
 * => true
 * @param value
 */
export function isEmpty(value: string | Array<any>) {
  return !value || value.length === 0;
}

export function isString(data: any) {
  return data !== null && typeof data === 'string';
}

export type StringSensitivity = 'base' | 'accent' | 'case' | 'variant';

export function isEqualsIgnoringCase(str1: string, str2: string, sensitivity?: StringSensitivity) {
  sensitivity = !sensitivity ? 'base' : sensitivity;
  return str1.localeCompare(str2, undefined, { sensitivity: sensitivity }) === 0;
}

export function randomString() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function compare(a: number | string | null | Date | any, b: number | string | null | Date | any) {
  if (a! && b! && typeof a !== typeof b) throw new Error('Invalid comparation types');

  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (a instanceof Date && b instanceof Date) return Moment(a, 'DD/MM/YYYY').diff(Moment(b, 'DD/MM/YYYY'));
  a = a ? a : '';
  b = b ? b : '';
  return a.toString().localeCompare(b.toString());
}

export function hashCode(value: string | object, seed: number = 0) {
  if (typeof value === 'object') value = JSON.stringify(value);

  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < value.length; i++) {
    ch = value.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

export function splitStringByWords(value: string) {
  const result = value.match(/[A-Z]+[^A-Z]*|[^A-Z]+/g);
  return result;
}

export function firstLetterLower(str: string) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}
