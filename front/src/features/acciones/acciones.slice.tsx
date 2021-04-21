import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { apis } from '../../API/setup/setup-apis';
import { RequestConfig } from '../../API/types';
import { buildAxiosRequestConfig } from '../../API/utils';
import { RootState } from '../../reducers';
import {
  AccionesSliceState,
  AplicarAccionRequestBody,
  AplicarAccionResponseBody,
  DropdownAcciones,
  ModalAccion,
  ObtenerAccionesRequestBody,
  ObtenerAccionesResponseBody,
} from './types';

const FEATURE_NAME = 'acciones';

const fetchActions = createAsyncThunk<ObtenerAccionesResponseBody, RequestConfig<ObtenerAccionesRequestBody>, { state: RootState }>(
  FEATURE_NAME + '/fetchActions',
  async (config, thunkApi) => {
    // const { dispatch, getState } = thunkApi;

    // Mapeo de la solicitud
    const requestData = config.data;

    // Configuracion del servicio
    const api = apis['ACCION'];
    const resource = api.resources['OBTENER_ACCIONES'];
    const axiosConfig = buildAxiosRequestConfig(api, resource, { ...config, data: requestData });

    // Respuesta del servicio
    const response = await axios.request<ObtenerAccionesResponseBody>(axiosConfig);
    const responseData = response.data.map((d) => ({ ...d, parametros: JSON.parse(d.parametros as any) }));

    return responseData;
  },
);

const applyAction = createAsyncThunk<AplicarAccionResponseBody, RequestConfig<AplicarAccionRequestBody>, { state: RootState }>(
  FEATURE_NAME + '/applyAction',
  async (config, thunkApi) => {
    // const { dispatch, getState } = thunkApi;

    // Mapeo de la solicitud
    const requestData = config.data;

    // Mapeo de la solicitud
    /* const requestData = {
      ...config.data,
      parametros: Object.fromEntries(
        Object.entries(config.data?.parametros || {}).map((entry) => {
          return [entry[0], entry[1]];
        }),
      ),
    }; */

    // Configuracion del servicio
    const api = apis['APLICAR_ACCION'];
    const resource = api.resources['APLICAR_ACCION'];
    const axiosConfig = buildAxiosRequestConfig(api, resource, { ...config, data: requestData });

    // Respuesta del servicio
    const response = await axios.request<AplicarAccionResponseBody>(axiosConfig);
    const responseData = response.data;

    return responseData;
  },
);

// Slice

const initialState: AccionesSliceState = {
  loading: false,
  data: {},
  error: null,
};

const slice = createSlice({
  name: FEATURE_NAME,
  initialState,
  reducers: {
    clearAccions() {
      return initialState;
    },
    setDropdownActions: (state, action: PayloadAction<DropdownAcciones>) => {
      state.data.dropdown = {
        ...state.data.dropdown,
        ...action.payload,
        acciones: { ...state.data.dropdown?.acciones, ...action.payload.acciones },
      };
    },
    setModalActions: (state, action: PayloadAction<ModalAccion>) => {
      state.data.modal = { ...state.data.modal, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActions.pending, (state) => {
        state.loading = true;
        state.data = { ...state.data };
      })
      .addCase(fetchActions.fulfilled, (state, action) => {
        state.loading = false;
        state.data = {
          ...state.data,
          dropdown: { acciones: { lista: action.payload, seleccionada: undefined }, disabled: true },
        };
      })
      .addCase(fetchActions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? null;
      });
    builder
      .addCase(applyAction.pending, (state) => {
        state.loading = true;
        state.data = { ...state.data };
      })
      .addCase(applyAction.fulfilled, (state, action) => {
        state.loading = false;
        state.data = {
          ...state.data,
          resultados: action.payload,
        };
      })
      .addCase(applyAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? null;
      });
  },
});

const { clearAccions, setDropdownActions, setModalActions } = slice.actions;

export { fetchActions, applyAction, clearAccions, setDropdownActions, setModalActions };

export default slice.reducer;
