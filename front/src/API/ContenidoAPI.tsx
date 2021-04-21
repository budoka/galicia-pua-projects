import { getURLs } from '../utils/ConfigurationServices';
import { BoxDetailAPIRequest, BoxDocumentAPIRequest } from '../types/caja-datos';
import { DocumentRequest } from '../components/GridConContenido';

export const eliminarContenidoById = async (id: number, idUsuario: number | undefined) => {
  const response = await fetch(getURLs().EliminarDocumento, {
    method: 'DELETE',
    body: JSON.stringify({
      id: id,
      idUsuario: idUsuario,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
};

export const eliminarDetalleCajaById = async (id: number) => {
  const response = await fetch(getURLs().EliminarDetalle, {
    method: 'DELETE',
    body: JSON.stringify({
      id: id,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
};

export const actualizarContenido = async (contenido: any, idUsuario: any) => {
  //const idUsuario = contenido.idUsuario;
  //contenido["idUsuario"] = null;
  const response = await fetch(getURLs().ActualizarDocumento, {
    method: 'POST',
    body: JSON.stringify({
      contenido: contenido, //{ ...contenido, idSectorTenedor: 1243, idUsuarioAlta: 3, idSectorOrigen: 1243 },
      idUsuario: idUsuario,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
};

export const guardarContenido = async (contenido: DocumentRequest) => {
  const response = await fetch(getURLs().GuardarContenido, {
    method: 'POST',
    body: JSON.stringify({
      tipoContenido: 'Caja con Documentos',
      contenido: [contenido],
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
};

export const guardarContenido2 = async (tipoContenido: string, contenido: BoxDocumentAPIRequest[] | BoxDetailAPIRequest[]) => {
  return await fetch(getURLs().GuardarContenido, {
    method: 'POST',
    body: JSON.stringify({
      tipoContenido,
      contenido,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const getDocumentos = async (numeroCaja: number, pagina: number, tamanioPagina: number) => {
  const response = await fetch(getURLs().ObtenerDocumentos, {
    method: 'POST',
    body: JSON.stringify({
      id: numeroCaja,
      numeroPagina: pagina,
      volumenPagina: tamanioPagina,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
};

export const updateDetail = async (detail: any) => {
  const response = await fetch(getURLs().ActualizarDetalle, {
    method: 'POST',
    body: JSON.stringify({
      tipoContenido: 'Caja con Detalle',
      contenido: detail,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
};

// Al parecer el contenido va en una lista
//documento: { ...contenido, idUsuarioAlta: 3, idSectorOrigen: 1243 },
export const addDetail = async (detail: any) => {
  const response = await fetch(getURLs().AgregarDetalle, {
    method: 'POST',
    body: JSON.stringify({
      tipoContenido: 'Caja con Detalle',
      contenido: [detail],
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
};
