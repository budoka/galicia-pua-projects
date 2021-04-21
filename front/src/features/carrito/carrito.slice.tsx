import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import _ from 'lodash';
import { apis } from '../../API/setup/setup-apis';
import { RequestConfig } from '../../API/types';
import { buildAxiosRequestConfig } from '../../API/utils';
import { RootState } from '../../reducers';
import {
  AgregarAlCarrito,
  AgregarAlCarritoRequestBody,
  AgregarAlCarritoResponseBody,
  CantidadCarritoRequestBody,
  CantidadCarritoResponseBody,
  CarritoSliceState,
  PreviewPedidosCarrito,
  UsuarioCarrito,
} from './types';

const FEATURE_NAME = 'carrito';

const fetchCantidadCarrito = createAsyncThunk<number, RequestConfig<UsuarioCarrito>, { state: RootState }>(
  FEATURE_NAME + '/fetchCantidadCarrito',
  async (config, thunkApi) => {
    // const { dispatch, getState } = thunkApi;

    // Mapeo de la solicitud
    const requestData = config.data;

    // Configuracion del servicio
    const api = apis['TEMPORAL_CARRITO'];
    const resource = api.resources['TOTAL_PEDIDOS'];
    const axiosConfig = buildAxiosRequestConfig(api, resource, { ...config, data: requestData });

    // Respuesta del servicio
    const response = await axios.request<CantidadCarritoResponseBody>(axiosConfig);
    const responseData = response.data;

    return responseData;
  },
);

const addToCarrito = createAsyncThunk<PreviewPedidosCarrito, RequestConfig<AgregarAlCarrito>, { state: RootState }>(
  FEATURE_NAME + '/addToCarrito',
  async (config, thunkApi) => {
    // const { dispatch, getState } = thunkApi;

    // Mapeo de la solicitud
    const requestData = config.data;

    // Configuracion del servicio
    const api = apis['TEMPORAL_CARRITO'];
    const resource = api.resources['GUARDAR'];
    const axiosConfig = buildAxiosRequestConfig(api, resource, { ...config, data: requestData });

    // Respuesta del servicio
    const response = await axios.request<AgregarAlCarritoResponseBody>(axiosConfig);
    const responseData = response.data;

    return responseData;
  },
);

// Slice

const initialState: CarritoSliceState = {
  loading: false,
  data: { cantidad: 0, pedidos: {}, preview: {} },
  error: null,
};

const slice = createSlice({
  name: FEATURE_NAME,
  initialState,
  reducers: {
    clearPreview(state) {
      state.data.preview = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCantidadCarrito.pending, (state) => {
        state.loading = true;
        state.data = { ...state.data, cantidad: 0 };
        state.error = null;
      })
      .addCase(fetchCantidadCarrito.fulfilled, (state, action) => {
        state.loading = false;
        state.data = {
          ...state.data,
          cantidad: action.payload,
        };
      })
      .addCase(fetchCantidadCarrito.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? null;
      });
    builder
      .addCase(addToCarrito.pending, (state) => {
        state.loading = true;
        state.data = { ...state.data /* , preview: {} */ };
      })
      .addCase(addToCarrito.fulfilled, (state, action) => {
        state.loading = false;
        state.data = {
          ...state.data,
          cantidad: action.payload.cantidad,
          preview: { ...action.payload /* , pedidos: [ ...state.data.preview?.pedidos, ...action.payload.pedidos!] */ },
        };
      })
      .addCase(addToCarrito.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? null;
      });
  },
});

const { clearPreview } = slice.actions;

export { fetchCantidadCarrito, addToCarrito, clearPreview };

export default slice.reducer;
