import values  from "../API/json/values.json";
//import Profile from './components/profile';
import { centroCostoPropietarioObj, centroCostoTenenciaObj, estadoObj, fechaGeneracionObj } from "./common";
import { estados } from "./estados";
import { sucursales } from "./sucursales";


export const filtersDoc = [
    {
      label: 'Número de Caja',
      type: 'number',
      wsField: 'idCaja',
    },
    {
      label: 'Detalle',
      type: 'text',
      wsField: 'detalle',
    },
    {
      label: 'DNI / Cuit cliente',
      type: 'text',
      wsField: 'dniCuitTitular',
    },
    fechaGeneracionObj,
    {
      label: 'Fecha desde',
      type: 'date',
      wsField: 'fechaDesde',
    },
    {
      label: 'Fecha documental',
      type: 'date',
      wsField: 'fechaDocumental',
    },
    {
      label: 'Fecha hasta',
      type: 'date',
      wsField: 'fechaHasta',
    },
    {
      label: 'Número de documento',
      type: 'number',
      wsField: 'id',
    },
    {
      label: 'Nombre / Razon Social',
      type: 'text',
      wsField: 'nombreTitular',
    },
    {
      label: 'Suc/CC Origen',
      type: 'list-search',
      wsField: 'idSectorOrigen',
      listValues: sucursales,
    },
    centroCostoPropietarioObj,
    centroCostoTenenciaObj,
    estadoObj
    ,
    {
      label: 'Tipo de documento',
      type: 'list-search',
      wsField: 'idTipoDocumento',
      listValues: values
    },
  ];

 