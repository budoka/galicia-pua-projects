import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import { combineReducers } from '@reduxjs/toolkit';
import carritoReducer from '../features/carrito/carrito.slice';
import sesionReducer from '../features/sesion/sesion.slice';
import menuReducer from '../features/menu/menu.slice';
import cajasReducer from 'src/reducers/cajas';
import documentosReducer from 'src/reducers/documentos';
import pedidosReducer from 'src/reducers/pedidos';
import digitalizacionesReducer from 'src/reducers/digitalizaciones';
import accionesReducer from 'src/features/acciones/acciones.slice';
import reportesReducer from 'src/features/reportes/reportes.slice';

const reducers = {
  sesion: sesionReducer,
  carrito: carritoReducer,
  menu: menuReducer,
  cajas: cajasReducer,
  documentos: documentosReducer,
  pedidos: pedidosReducer,
  digitalizaciones: digitalizacionesReducer,
  acciones: accionesReducer,
  reportes: reportesReducer,
};

export const createRootReducer = (history: History) => {
  return combineReducers({
    ...reducers,
    router: connectRouter(history),
  });
};

export type RootState = ReturnType<ReturnType<typeof createRootReducer>>;
