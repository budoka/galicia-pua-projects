export interface ReportesSliceState {
  data: Data;
  parameters: Params;
  loading: boolean;
  error: string | null;
}

export type EstadosPedidos = 'EnResolucion' | 'PendienteEnvio' | 'PendienteResolucion' | 'Rechazado' | 'Resuelto';

export interface Params {
  nombre?: string;
  parametros?: Parametros;
}

export interface Parametros {
  idUsuario: number;
}

export interface Data {
  reportes: Reporte[];
}

export interface Reporte {
  Proceso: string;
  Item: string;
  Estado: string;
  Cantidad: number;
  Ruta: string;
}
