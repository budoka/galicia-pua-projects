import { estados } from "./estados";
import { sucursales } from "./sucursales";

export const estadoObj = {
  
    label: 'Estado',
    type: 'list',
    wsField: 'stateId',
    listValues: estados,
  };
  
  export const fechaGeneracionObj = {
    
    label: 'Fecha generación',
    type: 'date',
    wsField: 'fechaGeneracion',
  };
  
  export const centroCostoPropietarioObj = {
   
    label: 'Suc/CC Propietario',
    type: 'list-search',
    wsField: 'idSectorPropietario',
    listValues: sucursales,
  };
  
  export const centroCostoTenenciaObj = {
   
    label: 'Tenencia Suc/CC',
    type: 'list-search',
    wsField: 'idSectorTenedor',
    listValues: sucursales,
  }