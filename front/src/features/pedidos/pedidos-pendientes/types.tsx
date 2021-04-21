import { IElement } from 'src/types';

export interface PedidosPendientesSliceState {
  data: Data;
  filters: FiltrosPedidos;
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

export type EstadosPedidos = 'EnResolucion' | 'PendienteEnvio' | 'PendienteResolucion' | 'Rechazado' | 'Resuelto';

export interface FiltrosPedidos {
  estado?: EstadosPedidos;
  //estado?: string;
  fecha?: moment.Moment[];
  sector?: number;
  usuario?: string;
}

export type CajasPendientes = DetalleCaja[];

export interface CantidadPedidos {
  pendientesEnvio?: number;
  pendientesResolucion?: number;
  resueltos?: number;
  rechazados?: number;
}

export interface Data {
  cajas: CajasPendientes;
  cantidad?: number | CantidadPedidos;
}

/* export interface CantidadCajasLoading {
  pendientesCierre?: boolean;
  pendientesDevolucion?: boolean;
}
 */
export interface Loading {
  cantidadPedidos?: boolean;
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

export interface CantidadPedidosRequestBody {
  idUsuario?: number;
  estado?: EstadosPedidos;
}
