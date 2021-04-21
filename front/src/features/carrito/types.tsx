import { IElement } from '../../types';

export interface CarritoSliceState {
  loading: boolean;
  data: { cantidad?: number; pedidos?: PedidosCarrito; preview?: PreviewPedidosCarrito };
  error: string | null;
}

// Modelo Front

export interface UsuarioCarrito {
  idUsuario: number;
}

export interface CajaCarrito {
  id: number;
}

export interface DocumentoCarrito {
  id: number;
}

export interface PedidosCarrito {
  cajas?: CajaCarrito[] | null;
  documentos?: DocumentoCarrito[] | null;
}

export interface PreviewPedidoCarrito {
  id: number;
  descripcion: string;
  estado: string;
}

export interface AgregarAlCarrito extends UsuarioCarrito, PedidosCarrito {}

export interface PreviewPedidosCarrito {
  cantidad?: number;
  pedidos?: PreviewPedidoCarrito[];
}

// Modelo Back

export type CantidadCarritoRequestBody = UsuarioCarrito;
export type CantidadCarritoResponseBody = number;

export type AgregarAlCarritoRequestBody = AgregarAlCarrito;
export type AgregarAlCarritoResponseBody = PreviewPedidosCarrito;
