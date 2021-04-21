import { getURLs } from '../utils/ConfigurationServices';

export interface ActionResult {
  success: boolean;
  message: string;
}

export enum HttpStatusCode {
  OK = 200,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  UNPROCESSABLE_ENTITY = 422,
}

export class HttpException extends Error {
  httpStatusCode: number;

  constructor(httpStatusCode: number, message?: string) {
    super(message);
    this.httpStatusCode = httpStatusCode;
  }
}

const errorResponse = (data: ActionResult, error: HttpException) => {
  data.success = false;
  data.message = error.message;
  return data;
};

// DUPLICADO
export const cerrarCaja = async (body: { idCaja: string | number; idUsuario: number }) => {
  const data: ActionResult = { success: false, message: '' };

  const result = await fetch(getURLs().CerrarCaja, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      return successfulResponse(
        response,
        data,
        'La caja ha sido cerrada correctamente.',
        'La caja no tiene documentos.',
        'No se ha podido cerrar la caja. La caja no existe, ha sido cerrada previamente o tiene documentos.',
      );
    })
    .catch((error: HttpException) => {
      return errorResponse(data, error);
    });

  return result;
};

const successfulResponse = (response: Response, data: ActionResult, successStatus: string, unprocessStatus: string, badStatus: string) => {
  const status = response.status;
  if (HttpStatusCode.OK === status) {
    data.success = true;
    return data;
  } else if (HttpStatusCode.UNPROCESSABLE_ENTITY === status) {
    throw new HttpException(status, unprocessStatus);
  } else if (HttpStatusCode.BAD_REQUEST === status) {
    throw new HttpException(status, badStatus);
  } else {
    throw new HttpException(status);
  }
};

export const eliminarCaja = async (id: string | number, idUsuario: number | undefined) => {
  const data: ActionResult = { success: false, message: '' };

  const result = await fetch(getURLs().EliminarCaja, {
    method: 'DELETE',
    body: JSON.stringify({
      idCaja: id,
      idUsuario: idUsuario,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      return successfulResponse(
        response,
        data,
        'La caja ha sido eliminada correctamente.',
        'La caja cuenta con documentos.',
        'La caja no existe y/o ha sido eliminada previamente.',
      );

    })
    .catch((error) => {
      return errorResponse(data, error);
    });

  return result;
};

export const actualizarEtiquetas = async (idCaja: number, etiquetas: number[]) => {
  const result = await fetch(getURLs().ActualizarEtiquetas, {
    method: 'POST',
    body: JSON.stringify({
      contenido: {
        idCaja,
        etiquetas,
      },
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      const status = response.status;
      if (HttpStatusCode.OK === status) {
        return true;
      } else if (HttpStatusCode.UNPROCESSABLE_ENTITY === status) {
        return false;
      } else {
        throw new HttpException(status, 'Error al actualizar las etiquetas.');
      }
    })
    .catch((error) => {
      return false;
    });

  return result;
};
