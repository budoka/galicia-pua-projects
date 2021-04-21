
import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import { API, Resource, RequestConfig } from 'src/API/types';
import { buildAxiosRequestConfig } from 'src/API/utils';

export const cancelRequest = (source: CancelTokenSource) => {
  if (source) source.cancel();
};

export const doRequest = async <RequestBody = void, ResponseBody = unknown>(
  api: API<unknown>,
  resource: Resource,
  config?: RequestConfig<RequestBody>,
) => {
  const requestData = config?.data;

  // Configuracion del servicio
  const axiosConfig = buildAxiosRequestConfig(api, resource, { ...config, data: requestData });

  // Respuesta del servicio
  const response = await axios.request<ResponseBody>(axiosConfig);
  const responseData = response.data;

  return responseData;
};

export const getValuesOfFilter = async <T>(
  request: AxiosRequestConfig,
  handle: (label: string, data: T) => void,
  label: string | string[],
) => {
  try {
    const response = await axios.request(request);
    if (Array.isArray(label)) label.forEach((l) => handle(l, <T>response.data));
    else handle(label, <T>response.data);
  } catch (error) {
  }
};

export const executeWS = async <T>(request: AxiosRequestConfig, handle: (data: T) => void) => {
  try {
    const response = await axios.request<T>(request);
    handle(response.data);
  } catch (error) {
    /*
    if (error.response?.status === 422) {
      //message.error('Llamada mal armada');
    } else if (error.response?.status === 400) {
      //message.error('Bad Request');
    } else {
      //message.error('Ocurrió un error');
    }
    */
  }
};
