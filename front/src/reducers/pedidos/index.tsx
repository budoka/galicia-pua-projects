import { combineReducers } from '@reduxjs/toolkit';

import pedidosPendientesReducer from 'src/features/pedidos/pedidos-pendientes/pedidos-pendientes.slice';
/* import ingresarCajasReducer from 'src/features/cajas/ingresar-caja/ingresar-caja.slice';
import editarCajasReducer from 'src/features/cajas/editar-caja/editar-caja.slice'; */

const reducers = {
  pendientes: pedidosPendientesReducer,
  /*   creacion: ingresarCajasReducer,
  edicion: editarCajasReducer, */
};

export default combineReducers({
  ...reducers,
});
