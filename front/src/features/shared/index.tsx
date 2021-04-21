import { createAsyncThunk } from '@reduxjs/toolkit';
import axios, { AxiosRequestConfig } from 'axios';
import { apis } from 'src/API/setup/setup-apis';
import { RequestConfig } from 'src/API/types';
import { buildAxiosRequestConfig } from 'src/API/utils';
import { RootState } from 'src/reducers';
import { ObtenerClienteRequest, ObtenerClienteResponse, Persona } from './types';

const FEATURE_NAME = 'shared';

// Async actions

export const fetchPersonas = createAsyncThunk<Persona[], RequestConfig<ObtenerClienteRequest> | undefined, { state: RootState }>(
  FEATURE_NAME + '/fetchPersonas',
  async (options, thunkApi) => {
    const { dispatch, getState } = thunkApi;

    // Configuracion del servicio
    const api = apis['CONSULTA_CLIENTE'];
    const resource = api.resources['OBTENER_CLIENTE'];
    const config = buildAxiosRequestConfig(api, resource, options);

    // config.url = 'http://bff-puda-portalunificado-qas.stgcloud.bancogalicia.com.ar/consulta-cliente/obtenerCliente';

    // Respuesta del servicio
    const response = await axios.request<ObtenerClienteResponse[]>(config);
    const responseData = response.data;

    // Mapeo de la respuesta
    const personas = responseData.map((persona) => {
      return {
        idHost: persona.idHost,
        nombre: persona.nombre,
        apellido: persona.apellido,
        razonSocial: persona.razonSocial,
        documento: {
          numeroDocumento: persona.numeroDocumento,
          tipo: +persona.tipoDocumento === 1 ? 'CUIT' : +persona.tipoDocumento === 2 ? 'CUIL' : persona.tipoDocumento,
        },
        direccion: {
          calle: persona.direccion,
          numero: persona.numero,
          piso: persona.piso,
        },
      };
    }) as Persona[];

    return personas;
  },
);
