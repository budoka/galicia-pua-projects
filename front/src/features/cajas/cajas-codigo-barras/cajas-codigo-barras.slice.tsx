import { createAsyncThunk, createSlice, PayloadAction, Reducer } from '@reduxjs/toolkit';
import axios, { AxiosResponse } from 'axios';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';

import moment from 'moment';
import { apis } from 'src/API/setup/setup-apis';
import { RequestConfig } from 'src/API/types';
import { DATE_DD_MM_YYYY_FORMAT } from 'src/constants';
import { RootState } from 'src/reducers';
import { ExtractStringPropertyNames, ObjectLiteral } from 'src/types';
import { buildAxiosRequestConfig } from 'src/API/utils';
import { splitStringByWords } from 'src/utils/string';
import { sleep } from 'src/utils/various';
import { CajasCodigoBarrasSliceState, DocumentoCodigoBarras } from './types';
import { BoxDocumentTemplate } from 'src/types/caja-templates';

const FEATURE_NAME = 'cajasCodigoBarras';

// Async actions

export const fetchPreview = createAsyncThunk<
  { value: number; label: string }[],
  RequestConfig<{ idTipoCaja: number; idTipoContenido: number }> | undefined,
  { state: RootState }
>(FEATURE_NAME + '/fetchPreview', async (options, thunkApi) => {
  const { getState } = thunkApi;

  // Configuracion del servicio
  const api = apis['CAJA'];
  const resource = api.resources['PREVIEW'];
  const config = buildAxiosRequestConfig(api, resource, { ...options, data: options?.data });

  // Respuesta del servicio
  const response = await axios.request<{ id: number; descripcion: string }[]>(config);
  const responseData = response.data;

  // Mapeo de la respuesta
  const documentos = responseData.map((doc) => {
    return {
      value: doc.id,
      label: doc.descripcion,
    };
  });

  return documentos;
});

export const saveDocumentosCodigoBarras = createAsyncThunk<number, RequestConfig<{ idCaja: string }> | undefined, { state: RootState }>(
  FEATURE_NAME + '/saveDocumentosCodigoBarras',
  async (options, thunkApi) => {
    const { dispatch, getState } = thunkApi;
    const data = options?.data!;

    // Mapeo de la solicitud
    const requestData: { tipoContenido: string; contenido: any[] } = {
      tipoContenido: 'Caja con Documentos',
      contenido: getState().cajas.codigoBarras.data.map((doc) => ({
        fechaDocumental: moment(doc.fecha, ['DD/MM/YYYY', 'D/MM/YYYY'], true).format('YYYY-MM-DD'),
        idCaja: data.idCaja,
        idTipoDocumento: getState().cajas.codigoBarras.currentDocumentType.value,
        idSectorOrigen: getState().sesion.data.idSector,
        idSectorTenedor: getState().sesion.data.idSector,
        idSectorPropietario: doc.sucursal,
        idUsuarioAlta: getState().sesion.data.idUsuario,
      })),
    };

    // Configuracion del servicio
    const api = apis['CONTENIDO_CAJA'];
    const resource = api.resources['GUARDAR_CONTENIDO'];
    const config = buildAxiosRequestConfig(api, resource, { ...options, data: requestData });

    // Respuesta del servicio
    const response = await axios.request(config);
    const responseData = response.data;

    // Mapeo de la respuesta
    /*   const cantidadCajas: CantidadCajas | number = data.key ? Object.assign({}, { [data.key]: responseData }) : responseData;

  return cantidadCajas; */
    return response.status;
  },
);

// Slice

const initialState: CajasCodigoBarrasSliceState = {
  input: '',
  currentDocumentType: {},
  documentTypes: [],
  data: [],
  visible: false,
  loading: {},
  error: null,
};

const slice = createSlice({
  name: FEATURE_NAME,
  initialState,
  reducers: {
    setInput(state, action: PayloadAction<string>) {
      state.input = action.payload;
    },
    setCurrentDocumentType(state, action: PayloadAction<any>) {
      state.currentDocumentType = action.payload;
    },
    setDocumentTypes(state, action: PayloadAction<any>) {
      state.documentTypes = action.payload;
    },
    setVisible(state, action: PayloadAction<boolean>) {
      state.visible = action.payload;
      state.input = '';
      state.data = [];
    },
    setBarcodeData(state, action: PayloadAction<DocumentoCodigoBarras>) {
      state.input = '';
      state.data = [...state.data, action.payload];
    },
    clearState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPreview.pending, (state) => {
        state.loading.saving = true;
        state.error = null;
      })
      .addCase(fetchPreview.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.documentTypes = action.payload;
        state.loading.saving = false;
      })
      .addCase(fetchPreview.rejected, (state, action) => {
        state.documentTypes = [];
        state.loading.saving = false;
        state.error = action.error.message ?? null;
      });
    builder
      .addCase(saveDocumentosCodigoBarras.pending, (state) => {
        state.loading.saving = true;
        state.error = null;
      })
      .addCase(saveDocumentosCodigoBarras.fulfilled, (state) => {
        state.loading.saving = false;
      })
      .addCase(saveDocumentosCodigoBarras.rejected, (state, action) => {
        state.loading.saving = false;
        state.error = action.error.message ?? null;
      });
  },
});

const { setCurrentDocumentType, setDocumentTypes, setInput, setVisible, setBarcodeData, clearState } = slice.actions;

export { setCurrentDocumentType, setDocumentTypes, setInput, setVisible, setBarcodeData, clearState };

export default slice.reducer;
