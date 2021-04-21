import { combineReducers } from '@reduxjs/toolkit';

import digitalizacionesPendientesReducer from 'src/features/digitalizaciones/digitalizaciones-pendientes/digitalizaciones-pendientes.slice';
import digitalizacionesReducer from 'src/features/digitalizaciones/digitalizaciones/digitalizaciones.slice';
/* import ingresarCajasReducer from 'src/features/cajas/ingresar-caja/ingresar-caja.slice';
import editarCajasReducer from 'src/features/cajas/editar-caja/editar-caja.slice'; */

const reducers = {
  digitalizaciones: digitalizacionesReducer,
  pendientes: digitalizacionesPendientesReducer,
  /*   creacion: ingresarCajasReducer,
  edicion: editarCajasReducer, */
};

export default combineReducers({
  ...reducers,
});
