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
import { Parametros, Params, Reporte, ReportesSliceState } from './types';
import { getPerfilUsuario } from 'src/utils/redux';

const FEATURE_NAME = 'reportes';

// Async actions

const fetchReportes = createAsyncThunk<Reporte[], RequestConfig<Params>, { state: RootState }>(
  FEATURE_NAME + '/fetchReportes',
  async (options, thunkApi) => {
    const { dispatch, getState } = thunkApi;
    const data = options.data!;

    // Mapeo de la solicitud
    const requestData: Params = {
      ...data,
    };

    // Configuracion del servicio
    const api = apis['REPORTE'];
    const resource = api.resources['VER_REPORTE'];
    const config = buildAxiosRequestConfig(api, resource, { ...options, data: requestData });

    // Respuesta del servicio
    const response = await axios.request<Reporte[]>(config);
    const responseData = response.data;

    return responseData;
  },
);

// Slice

const initialState: ReportesSliceState = {
  data: { reportes: [] },
  parameters: {},
  loading: false,
  error: null,
};

const slice = createSlice({
  name: FEATURE_NAME,
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Params>) {
      state.parameters = action.payload;
    },
    clearFilters(state) {
      state.parameters = {};
    },
    clearState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReportes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReportes.fulfilled, (state, action) => {
        state.loading = false;
        state.data.reportes = action.payload;
      })
      .addCase(fetchReportes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? null;
      });
  },
});

const { setFilters, clearFilters, clearState } = slice.actions;

export { fetchReportes, setFilters, clearFilters, clearState };

export default slice.reducer;
