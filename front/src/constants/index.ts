export const APP_TITLE = 'Portal Unificado';
export const FIXED = 'fixed';
export const STICKY = 'sticky';
export const UNSELECTABLE = 'unselectable';
export const ELLIPSIS = 'ellipsis';
export const SHADOW = 'shadow';

export const CAJA_DOCUMENTO = 'Caja con Documentos';
export const CAJA_DETALLE = 'Caja con Detalle';
export const CAJA_ETIQUETA = 'Caja con Etiqueta';

export const DATE_DD_MM_YYYY_FORMAT = 'DD/MM/YYYY';
export const DATETIME_HH_MM_FORMAT = 'DD/MM/YYYY HH:mm';
export const DATETIME_HH_MM_SS_FORMAT = 'DD/MM/YYYY HH:mm:ss';

/* export enum Pattern {
  OnlyNumbers = '^\\d+$',
  OnlyWords = '^([a-záéíóúäëïöü]+( ?[a-záéíóúäëïöü])+ ?)$',
}
 */

export class Pattern {
  public static readonly ANY = /^.+$/;
  public static readonly ONLY_NUMBERS = /^\\d+$/;
  public static readonly ONLY_WORDS = /^([a-záéíóúäëïöü]+( ?[a-záéíóúäëïöü])+ ?)$/i;
}

/* export const PATTERN_ANY = /^.+$/;
export const PATTERN_ONLY_NUMBERS = /^\\d+$/;
export const PATTERN_ONLY_WORDS = /^([a-záéíóúäëïöü]+( ?[a-záéíóúäëïöü])+ ?)$/i;
 */
