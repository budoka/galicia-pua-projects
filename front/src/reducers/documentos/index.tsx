import { combineReducers } from '@reduxjs/toolkit';

import documentosPendientesReducer from 'src/features/documentos/documentos-pendientes/documentos-pendientes.slice';
/* import ingresarCajasReducer from 'src/features/cajas/ingresar-caja/ingresar-caja.slice';
import editarCajasReducer from 'src/features/cajas/editar-caja/editar-caja.slice'; */

const reducers = {
  pendientes: documentosPendientesReducer,
  /*   creacion: ingresarCajasReducer,
  edicion: editarCajasReducer, */
};

export default combineReducers({
  ...reducers,
});
