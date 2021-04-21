import { IElement } from 'src/types';

export interface CajasPendientesSliceState {
  data: Data;
  filters: FiltrosDigitalizaciones;
  loading: Loading;
  error: string | null;
}

// Modelo front

export interface DetalleCaja extends IElement {
  numero: number;
  descripcion: string;
  estado: string;
  fechaEmision: string;
  sector: number;
  usuario: string;
}

export type EstadosDigitalizaciones = 'DISPONIBLE' | 'ENVIADO' | 'INDEXADO' | 'ERROR';

export interface FiltrosDigitalizaciones {
  estado?: EstadosDigitalizaciones;
  //estado?: string;
  fecha?: moment.Moment[];
  sector?: number;
  usuario?: string;
}

export type CajasPendientes = DetalleCaja[];

export interface CantidadDigitalizaciones {
  disponibles?: number;
  enviados?: number;
  indexados?: number;
  errores?: number;
}

export interface Data {
  cajas: CajasPendientes;
  cantidad?: number | CantidadDigitalizaciones;
}

/* export interface CantidadCajasLoading {
  pendientesCierre?: boolean;
  pendientesDevolucion?: boolean;
}
 */
export interface Loading {
  cantidadDigitalizaciones?: boolean;
  busqueda?: boolean;
  exportacion?: boolean;
}

// Modelo back

export interface CajasPendientesRequestBody {
  idUsuario: number; // sacar
  roles: string[]; // sacar
  estado?: string;
  centroCosto?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  nombre?: string;
  // numeroPagina: number;
  // volumenPagina: number;
  // contarTotal: boolean;
}

interface DetalleCajaResponseBody {
  numero: number;
  estado: string;
  descripcion: string;
  fechaEmision: string;
  sector: number;
  usuario: string;
}

export type CajasPendientesResponseBody = DetalleCajaResponseBody[];

export interface CantidadDigitalizacionesRequestBody {
  legajo?: string;
  estado?: string;
}
