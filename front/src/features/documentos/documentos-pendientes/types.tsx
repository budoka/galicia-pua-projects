import { IElement } from 'src/types';

export interface CajasPendientesSliceState {
  data: Data;
  filters: FiltrosDocumentos;
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

export type EstadosDocumentos = 'PendienteRecepcion';

export interface FiltrosDocumentos {
  estado?: EstadosDocumentos;
  //estado?: string;
  fecha?: moment.Moment[];
  sector?: number;
  usuario?: string;
}

export type CajasPendientes = DetalleCaja[];

export interface CantidadDocumentos {
  // pendientesCierre?: number;
  pendientesDevolucion?: number;
}

export interface Data {
  cajas: CajasPendientes;
  cantidad?: number | CantidadDocumentos;
}

/* export interface CantidadCajasLoading {
  pendientesCierre?: boolean;
  pendientesDevolucion?: boolean;
}
 */
export interface Loading {
  cantidadDocumentos?: boolean;
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

export interface CantidadDocumentosRequestBody {
  stateId?: EstadosDocumentos;
  stateIdFiltro?: string;
}
