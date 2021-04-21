export interface SesionSliceState {
  data: InfoSesion;
  loading: boolean;
  error: string | null;
}

// Modelo front

export interface InfoSesion {
  idUsuario?: number;
  grupos?: string[];
  idSector?: number;
  nombreUsuario?: string;
  nombreSector?: string;
  legajo?: string;
  perfil?: string;
  roles?: string[];
  token?: string;
}

export type InfoAzure = Pick<InfoSesion, 'grupos' | 'legajo' | 'nombreUsuario'>;

// Modelo back

export type SesionRequestBody = string;

export interface SesionResponseBody {
  descripcionSector: string;
  idSector: number;
  idUsuario: number;
  roles: { id: number; descripcion: string; nombre: string }[];
}
