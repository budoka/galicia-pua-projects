import { combineReducers } from '@reduxjs/toolkit';

import reportesReducer from 'src/features/reportes/reportes.slice';

const reducers = {
  reportes: reportesReducer,
  /*   creacion: ingresarCajasReducer,
  edicion: editarCajasReducer, */
};

export default combineReducers({
  ...reducers,
});
