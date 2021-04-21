import { Moment } from 'moment';
import { formatDate, addZero } from '../utils/Common';
import { Plantilla } from '../components/PlantillaSelect';

export type CajaForm = {
  idUsuario: number | undefined;
  descripcion: string;
  fechaDesde: string | null;
  fechaHasta: string | null;
  fechaVencimiento: string | null;
  idSectorOrigen: number | undefined;
  idTipoCaja: number | undefined;
  idTipoContenido: number | undefined;
  userName: string | undefined;
  legajo: string | undefined;
  idUsuarioAlta: number | undefined;
  idPlantilla: number | undefined;
  restringida: number;
};

export const CajaToDTO = (
  idUsuario: number | undefined,
  descripcion: string,
  fechaDesde: Moment | null,
  fechaHasta: Moment | null,
  fechaVencimiento: Moment | null | undefined,
  idSectorOrigen: number | undefined,
  idTipoCaja: number | undefined,
  tipoContenido: number | undefined,
  idUsuarioAlta: number | undefined,
  plantilla: Plantilla | undefined,
  restringida: boolean,
  username: string | undefined,
  legajo: string | undefined,
): CajaForm => {
  return {
    idUsuario: idUsuario,
    descripcion: descripcion,
    fechaDesde: fechaDesde ? formatDate(fechaDesde.toDate()) : null,
    fechaHasta: fechaHasta ? formatDate(fechaHasta.toDate()) : null,
    //  fechaGeneracion: formatDate(fechaGeneracion) + " " + fechaGeneracion.toLocaleTimeString() + '.' + addZero(fechaGeneracion.getMilliseconds(), 3),  // formatDate(fechaGeneracion) + fechaGeneracion.toLocaleTimeString() + fechaGeneracion.getMilliseconds() va
    fechaVencimiento: fechaVencimiento ? formatDate(fechaVencimiento.toDate()) : null,
    idSectorOrigen: idSectorOrigen,
    idTipoCaja: idTipoCaja,
    idTipoContenido: tipoContenido,
    userName: username,
    legajo: legajo,
    idUsuarioAlta: idUsuarioAlta,
    idPlantilla: plantilla ? plantilla.id : undefined,
    restringida: restringida ? 1 : 0,
  };
};
