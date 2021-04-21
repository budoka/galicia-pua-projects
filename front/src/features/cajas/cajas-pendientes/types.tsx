import { IElement } from 'src/types';

export interface CajasPendientesSliceState {
  data: Data;
  filters: FiltrosCajas;
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

export type EstadosCaja = 'PendienteCierre' | 'PendienteRecepcion';

export interface FiltrosCajas {
  estado?: EstadosCaja;
  //estado?: string;
  fecha?: moment.Moment[];
  sector?: number;
  usuario?: string;
}

export type CajasPendientes = DetalleCaja[];

export interface CantidadCajas {
  pendientesCierre?: number;
  pendientesDevolucion?: number;
}

export interface Data {
  cajas: CajasPendientes;
  cantidad?: number | CantidadCajas;
}

/* export interface CantidadCajasLoading {
  pendientesCierre?: boolean;
  pendientesDevolucion?: boolean;
}
 */
export interface Loading {
  cantidadCajas?: boolean;
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

export interface CantidadCajasRequestBody {
  idEstado?: string;
  idEstadoFiltro?: string;
}
