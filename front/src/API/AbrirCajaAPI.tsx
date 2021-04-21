import { getURLs } from '../utils/ConfigurationServices';
import { CajaForm } from '../types/CajaForm';


export const getTiposDeCajas = async () => {
  const response = await fetch(getURLs().TiposDeCajas, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      //'algo': "importante" 
    },
  });
  return await response.json();
};


export const getTiposDeContenido = async (tipoCaja: string) => {
  const response = await fetch(getURLs().TiposDeContenidos, {
    method: 'POST',
    body: JSON.stringify({
      tipoCaja: tipoCaja,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
};

export const getPlantillas = async (idSector: number | undefined) => {
  const response = await fetch(getURLs().TiposDePlantillas, {
    method: 'POST',
    body: JSON.stringify({
      idSector: idSector,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
};

export const guardarCaja = async (caja: CajaForm) => {
  const response = await fetch(getURLs().CrearCaja, {
    method: 'POST',
    body: JSON.stringify(caja),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
};

// ponerle un tipo a esta caja
export const modificarCaja = async (caja: any) => {
  const response = await fetch(getURLs().ActualizarCaja, {
    method: 'POST',
    body: JSON.stringify(caja),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
};

export const buscarFechaVencimiento = async (idCaja: number, contenido: any) => {
  const response = await fetch(getURLs().BuscarFechaVencimiento, {
    method: 'POST',
    body: JSON.stringify({
      idTipoCaja: idCaja,
      tipoContenido: contenido,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
};

export const obtenerCajaById = async (id: string | null) => {
  const response = await fetch(getURLs().BuscarCaja, {
    method: 'POST',
    body: JSON.stringify({
      idCaja: id,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
};

export const getPreview = async (idTipoCaja: number | undefined, idPlantilla: number | undefined, tipoContenido: string | undefined) => {
  const getTiposDeContenidoId = (descripcion: string) => {
    if (descripcion === 'Caja con Etiqueta') return 0;
    if (descripcion === 'Caja con Detalle') return 1;
    if (descripcion === 'Caja con Documentos') return 2;
  };

  const response = await fetch(getURLs().PreviewV2, {
    method: 'POST',
    body: JSON.stringify({
      /*  idCaja: idCaja,
      idPlantilla: idPlantilla,
      tipoContenido: contenido, */
      idTipoCaja,
      idTipoContenido: getTiposDeContenidoId(tipoContenido!),
      idPlantilla,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
};
