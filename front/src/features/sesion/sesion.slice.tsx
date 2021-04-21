import { Action, createAsyncThunk, createSlice, PayloadAction, Reducer, ThunkAction, ThunkDispatch } from '@reduxjs/toolkit';
import { message } from 'antd';
import axios from 'axios';
import moment from 'moment';
import { sortByRol } from 'src/utils/various';
import { apis } from '../../API/setup/setup-apis';
import { RequestConfig } from '../../API/types';
import { buildAxiosRequestConfig } from '../../API/utils';
import { RootState } from '../../reducers';
import { InfoAzure, InfoSesion, SesionResponseBody, SesionSliceState } from './types';

const FEATURE_NAME = 'sesion';

// Async actions

const sortRoles = (data: any) => {
  return data.roles.sort((a: { id: number; descripcion: string; nombre: string; }, b: { id: number; descripcion: string; nombre: string; }) => sortByRol(a, b));
};

const fetchInfoSesion = createAsyncThunk<InfoSesion | undefined, RequestConfig<InfoAzure>, { state: RootState }>(
  FEATURE_NAME + '/fetchInfoSesion',
  async (config, thunkApi) => {
    //const { dispatch, getState } = thunkApi;

    // Mapeo de la solicitud

    const requestData: InfoAzure = {
      ...config.data,
    };

    //console.log("config data:", requestData)
    // Configuracion del servicio
    const api = apis['INFO_SESION'];
    const resource = api.resources['INFO_SESION'];
    //console.log("config headers", config)
    const axiosConfig = buildAxiosRequestConfig(api, resource, { ...config, data: requestData });


    // Respuesta del servicio
    try {
      const response = await axios.request<SesionResponseBody>(axiosConfig);
      const responseData = response.data;
      // Mapeo de la respuesta
      //const sortRol = responseData.roles.sort((a, b) => sortByRol(a, b));

      const infoSesion: InfoSesion = {
        idUsuario: responseData.idUsuario,
        idSector: responseData.idSector,
        nombreSector: responseData.descripcionSector,
        perfil: responseData.roles && responseData.roles.length > 0 ? sortRoles(responseData)[0].descripcion : undefined,
        roles: responseData.roles && responseData.roles.length > 0 ? responseData.roles.map(r => r.descripcion) : undefined,
        legajo: config.data?.legajo,
        nombreUsuario: config.data?.nombreUsuario,
      };
      return infoSesion;
    }
    catch {
      message.error("Ocurrió un error obteniendo la informacion del usuario.")
    }
  },
);
// Slice

const initialState: SesionSliceState = {
  data: {},
  loading: false,
  error: null,
};

const slice = createSlice({
  name: FEATURE_NAME,
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.data.token = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInfoSesion.pending, (state) => {
        state.loading = true;
        state.data = { token: state.data.token };
        state.error = null;
      })
      .addCase(fetchInfoSesion.fulfilled, (state, action) => {
        state.loading = false;
        state.data = { ...state.data, ...action.payload };
      })
      .addCase(fetchInfoSesion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Error de prueba';
      });
  },
});

const { setToken } = slice.actions;

export { fetchInfoSesion, setToken };

export default slice.reducer;
