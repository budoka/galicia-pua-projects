// Modelo front

export interface Documento {
  tipo: string;
  numeroDocumento: string;
}

export interface Direccion {
  calle: string;
  numero: number;
  piso?: number;
}

export interface Persona {
  idHost: number;
  nombre?: string;
  apellido?: string;
  razonSocial?: string;
  documento?: Documento;
  direccion: Direccion;
}

export interface Data {
  personas: { value: Persona[]; loading: boolean };
}

// Modelo back

export type Filtro = 'PorNombreApellido' | 'CUIT' | 'DU' | 'PorRazonSocial' | 'CI' | 'LE' | 'LC';
export type TipoBusqueda = 1 | 2;

export interface ObtenerClienteRequest {
  filtro: Filtro;
  legajo: string;
  nombre?: string;
  apellido?: string;
  documento?: string;
  razonSocial?: string;
  tipoBusqueda?: TipoBusqueda;
}

export interface ObtenerClienteResponse {
  idHost: number;
  nombre?: string;
  apellido?: string;
  razonSocial?: string;
  tipoDocumento: string;
  numeroDocumento: string;
  direccion: string;
  numero: number;
  piso?: number;
}
