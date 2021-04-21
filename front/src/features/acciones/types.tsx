import { ObjectLiteral } from 'src/types';

export interface AccionesSliceState {
  loading: boolean;
  data: {
    dropdown?: DropdownAcciones;
    modal?: ModalAccion;
    resultados?: ResultadoAccion[];
  };
  error: string | null;
}

// Modelo Front

export type TipoElemento = 'DO' | 'CA' | 'PE'; // Documento, Caja, Pedido
export type TipoDatoParametro = 'FECHA' | 'TEXTO' | 'NUMERO' | 'BOOLEAN' | 'LISTA';

export interface ObtenerAcciones {
  tipoElemento: TipoElemento;
  idEstadoActual: number;
  idUsuario: number;
}

export interface Parametro {
  id: number;
  idAccion: number;
  orden: number;
  parametro: string;
  descripcion: string;
  tipoDato: TipoDatoParametro;
  patron?: RegExp;
}

export interface Accion {
  tipoElemento: TipoElemento;
  idElementos: number[];
  idAccion: number;
  parametros: ObjectLiteral;
  idUsuario: number;
}

export interface ElementoAccion {
  id: number;
  descripcion: string;
  parametros: Parametro[];
}

export interface DropdownAcciones {
  acciones?: Acciones;
  disabled?: boolean;
}

export interface Acciones {
  lista?: ElementoAccion[];
  seleccionada?: ElementoAccion;
}

export interface ModalAccion {
  visible?: boolean;
  disabledOkButton?: boolean;
  elementos?: any[];
}

export interface ResultadoAccion {
  idElemento: number;
  estado: string;
  respuesta: string;
}

// Modelo Back

export type ObtenerAccionesRequestBody = ObtenerAcciones;
export type ObtenerAccionesResponseBody = ElementoAccion[];

export type AplicarAccionRequestBody = Accion;
export type AplicarAccionResponseBody = ResultadoAccion[];
