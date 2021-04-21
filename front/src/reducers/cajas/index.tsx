import { combineReducers } from '@reduxjs/toolkit';

import cajasPendientesReducer from 'src/features/cajas/cajas-pendientes/cajas-pendientes.slice';
import cajasCodigoBarrasReducer from 'src/features/cajas/cajas-codigo-barras/cajas-codigo-barras.slice';
/* import ingresarCajasReducer from 'src/features/cajas/ingresar-caja/ingresar-caja.slice';
import editarCajasReducer from 'src/features/cajas/editar-caja/editar-caja.slice'; */

const reducers = {
  pendientes: cajasPendientesReducer,
  codigoBarras: cajasCodigoBarrasReducer,
  /*   creacion: ingresarCajasReducer,
  edicion: editarCajasReducer, */
};

export default combineReducers({
  ...reducers,
});
