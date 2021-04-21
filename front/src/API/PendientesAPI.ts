import { headers } from 'src/config/ApplicationRoutes';
import { store } from 'src/store';
import { FilterRequest } from '../types/FilterRequest';
import { getURLs } from '../utils/ConfigurationServices';

const body = (estado: any, page: number | undefined, pageSize: number | undefined, filter?: FilterRequest | undefined) => {
  return {
    idUsuario: store.getState().sesion.data.idUsuario,
    centroCosto: store.getState().sesion.data.idSector,
    roles: [store.getState().sesion.data.perfil],
    estado: estado,
    numeroPagina: page,
    volumenPagina: pageSize,
    fechaDesde: filter?.fechaDesde,
    fechaHasta: filter?.fechaHasta,
    nombre: filter?.nombre,
    ccFiltro: filter?.ccFiltro,
  };
};

export const getCajasPend = async (state: string, page?: number, pageSize?: number, filter?: FilterRequest) => {
  const response = await fetch(getURLs().DetallesDeCaja, {
    method: 'POST',
    body: JSON.stringify(body(state, page, pageSize, filter)),
    headers: {
      ...headers,
      'Content-Type': 'application/json',

    },
  });
  return await response.json();
};

export const getDocumentosPend = async (state: string, page?: number, pageSize?: number, filter?: FilterRequest) => {
  const response = await fetch(getURLs().DetalleDocumento, {
    method: 'POST',
    body: JSON.stringify(body(state, page, pageSize, filter)),
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
};

export const getPedidosPend = async (state: string, page?: number, pageSize?: number, filter?: FilterRequest) => {
  const response = await fetch(getURLs().PedidosPendientes, {
    method: 'POST',
    body: JSON.stringify(body(state, page, pageSize, filter)),
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
};

export interface SolicitudesRequestBody {
  legajo: string;
  numeroPagina?: number;
  volumenPagina?: number;
}

export const getSolicitudes = async (body: SolicitudesRequestBody) => {
  const response = await fetch(getURLs().Solicitudes, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
};
