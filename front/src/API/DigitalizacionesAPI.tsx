import { valueType } from "antd/lib/statistic/utils";
import { getURLs } from "../utils/ConfigurationServices";



export const obtenerDocumentosPorOperacion = async (procesoId: valueType, subProcesoId: valueType, idOperacion: valueType, tipoDocumental: any) => {
  const response = await fetch(getURLs().BuscarDocumentoPorOperacion, {
    method: 'POST',
    body: JSON.stringify({
      idProceso: procesoId,
      idSubproceso: subProcesoId,
      idOperacion: idOperacion,
      tipoDocumental: tipoDocumental
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
};

export const visualizar = async (idFilenet: string) => {
  const response = await fetch(getURLs().VisualizarDocumentosFilenet, {
    method: 'POST',
    body: JSON.stringify({
      id: idFilenet
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await response.text().then(text => text);
};

export const obtenerDocumentosPorUsuario = async (hostId: number, tipoDocumental: any) => {
  const response = await fetch(getURLs().BuscarDocumentoPorUsuario, {
    method: 'POST',
    body: JSON.stringify({
      idHost: hostId,
      tipoDocumental: tipoDocumental
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
};

//obtenerHistorialOperacion
export const obtenerHistorialOperacion = async (idDoc: number) => {
  const response = await fetch(getURLs().BuscarHistorialPorOperacion, {
    method: 'POST',
    body: JSON.stringify({
      idDocumento: idDoc,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
};