import { createAsyncThunk, createSlice, PayloadAction, Reducer } from '@reduxjs/toolkit';
import axios from 'axios';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';

import moment from 'moment';
import { apis } from 'src/API/setup/setup-apis';
import { RequestConfig } from 'src/API/types';
import { DATE_DD_MM_YYYY_FORMAT } from 'src/constants';
import { RootState } from 'src/reducers';
import { ExtractStringPropertyNames } from 'src/types';
import { buildAxiosRequestConfig } from 'src/API/utils';
import { splitStringByWords } from 'src/utils/string';
import { sleep } from 'src/utils/various';
import {
  CajasPendientes,
  CajasPendientesRequestBody,
  CajasPendientesResponseBody,
  PedidosPendientesSliceState,
  CantidadPedidos,
  CantidadPedidosRequestBody,
  DetalleCaja,
  FiltrosPedidos,
} from './types';

const FEATURE_NAME = 'pedidosPendientes';

// Async actions

const fetchCantidadPedidos = createAsyncThunk<
  CantidadPedidos | number,
  RequestConfig<{ filters: FiltrosPedidos; key: keyof CantidadPedidos }>, // Cambiar FiltrosCajas por CantidadCajasRequestBody
  { state: RootState }
>(FEATURE_NAME + '/fetchCantidadPedidos', async (options, thunkApi) => {
  const { dispatch, getState } = thunkApi;
  const data = options.data!;

  const idUsuario = getState().sesion.data.idUsuario;

  // Mapeo de la solicitud
  const requestData: CantidadPedidosRequestBody = {
    idUsuario,
    estado: data.filters.estado,
  };

  // Configuracion del servicio
  const api = apis['PEDIDOS_PENDIENTES'];
  const resource = api.resources['CANTIDAD_PEDIDOS'];
  const config = buildAxiosRequestConfig(api, resource, { ...options, data: requestData });

  // Respuesta del servicio
  const response = await axios.request<number>(config);
  const responseData = response.data;

  // Mapeo de la respuesta
  const cantidadDocumentos: CantidadPedidos | number = data.key ? Object.assign({}, { [data.key]: responseData }) : responseData;

  return cantidadDocumentos;
});

const fetchCajas = createAsyncThunk<CajasPendientes, RequestConfig | undefined, { state: RootState }>(
  FEATURE_NAME + '/fetchCajas',
  async (options, thunkApi) => {
    const { dispatch, getState } = thunkApi;

    const filters: FiltrosPedidos = getState().pedidos.pendientes.filters;

    // Mapeo de la solicitud
    const requestData: CajasPendientesRequestBody = {
      idUsuario: getState().sesion.data?.idUsuario!,
      roles: [getState().sesion.data?.perfil!],
      estado: filters.estado,
      fechaDesde: filters.fecha && filters.fecha.length > 0 ? filters.fecha[0].format() : undefined,
      fechaHasta: filters.fecha && filters.fecha.length > 1 ? moment(filters.fecha[1]).add(1, 'day').format() : undefined, // workaround  moment(...).add(1, 'day')
      centroCosto: filters.sector,
      nombre: filters.usuario,
    };

    // Configuracion del servicio
    const api = apis['CAJA'];
    const resource = api.resources['DETALLE_CAJA'];
    const config = buildAxiosRequestConfig(api, resource, { ...options, data: requestData });

    // Respuesta del servicio
    const response = await axios.request<CajasPendientesResponseBody>(config);
    const responseData = response.data;

    // Mapeo de la respuesta
    const cajas = responseData.map((caja) => {
      return {
        numero: caja.numero,
        descripcion: caja.descripcion,
        estado: splitStringByWords(caja.estado)?.join(' '),
        fechaEmision: moment(caja.fechaEmision).format(DATE_DD_MM_YYYY_FORMAT),
        sector: caja.sector,
        usuario: caja.usuario,
      } as DetalleCaja;
    });

    return cajas;
  },
);

const exportCajas = createAsyncThunk<void, void, { state: RootState }>(FEATURE_NAME + '/exportCajas', async (_, thunkApi) => {
  const { getState } = thunkApi;

  // Excel
  const workbook = new Workbook();
  // Hojas
  const sheet = workbook.addWorksheet('Datos', {
    properties: { defaultColWidth: 90 },
  });
  // Estilo del header
  sheet.getRow(1).font = {
    bold: true,
  };
  sheet.getRow(1).alignment = { horizontal: 'center' };

  // Columnas
  sheet.columns = [
    { header: 'Caja', key: 'numero', width: 20 },
    { header: 'Descripción', key: 'descripcion', width: 20 },
    { header: 'Estado', key: 'estado', width: 20 },
    { header: 'Fecha emisión', key: 'fechaEmision', width: 20 },
    { header: 'Sector', key: 'sector', width: 20 },
    { header: 'Usuario', key: 'usuario', width: 20 },
  ];

  // Filas
  const data = getState().cajas.pendientes.data.cajas;
  sheet.addRows(data);

  // Creacion de archivo
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), 'test.xlsx');

  await sleep(1000);
});

// Slice

const initialState: PedidosPendientesSliceState = {
  data: { cajas: [] },
  filters: {},
  loading: {},
  error: null,
};

const slice = createSlice({
  name: FEATURE_NAME,
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<FiltrosPedidos>) {
      state.filters = action.payload;
    },
    clearFilters(state) {
      state.filters = {};
    },
    clearState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCantidadPedidos.pending, (state) => {
        state.loading.cantidadPedidos = true;
        state.data = { ...state.data, cantidad: 0 };
        state.error = null;
      })
      .addCase(fetchCantidadPedidos.fulfilled, (state, action) => {
        state.loading.cantidadPedidos = false;
        state.data = {
          ...state.data,
          cantidad: { ...(state.data.cantidad as CantidadPedidos), ...(action.payload as CantidadPedidos) },
        };
      })
      .addCase(fetchCantidadPedidos.rejected, (state, action) => {
        state.loading.cantidadPedidos = false;
        state.error = action.error.message ?? null;
      });
    builder
      .addCase(fetchCajas.pending, (state) => {
        state.loading.busqueda = true;
        state.data = { ...state.data, cajas: [] };
        state.error = null;
      })
      .addCase(fetchCajas.fulfilled, (state, action) => {
        state.loading.busqueda = false;
        state.data = { ...state.data, cajas: action.payload };
      })
      .addCase(fetchCajas.rejected, (state, action) => {
        state.loading.busqueda = false;
        state.error = action.error.message ?? null;
      });
    builder
      .addCase(exportCajas.pending, (state) => {
        state.loading.exportacion = true;
        state.error = null;
      })
      .addCase(exportCajas.fulfilled, (state) => {
        state.loading.exportacion = false;
      })
      .addCase(exportCajas.rejected, (state, action) => {
        state.loading.exportacion = false;
        state.error = action.error.message ?? null;
      });
  },
});

const { setFilters, clearFilters, clearState } = slice.actions;

export { fetchCantidadPedidos, fetchCajas, exportCajas, setFilters, clearFilters, clearState };

//export default slice.reducer;
export default slice.reducer as Reducer<typeof initialState>;
