import { AxiosRequestConfig } from 'axios';
import { getVar } from 'src/environment';
import { ApiError } from 'src/exceptions/api';
import { HttpVerb, Params, RequestConfig } from './types/types';

/**
 * Build the endpoint of a request.
 * @param baseURL request's base url
 * @param resource request's resource
 * @param params request's placeholders (e.g: replace 'https//example.com/users/:userId/inventory/:inventoryId' with 'https//example.com/users/10000/inventory/50')
 */
export function buildEndpoint(baseURL: string, path: string, params?: Params) {
  if (typeof params === 'string') return `${baseURL}/${path}/${params}`;

  const _params = params ? Object.entries(params) : undefined;
  let _path = path;
  if (_params) _path = _params.reduce((url, ph) => url.replace(`:${ph[0]}`, ph[1].toString()), _path);
  const endpoint = `${baseURL}/${_path}`;
  return endpoint;
}

/**
 * Build the axios request config.
 * @param api API
 * @param resource request's resource
 * @param config request's configuration
 */
export function buildAxiosRequestConfig<Data>(
  api: string,
  version: string | undefined,
  resource: string,
  config: RequestConfig<Data> = {},
  defaultOptions: RequestConfig<Data> = {},
) {
  const params = config.params;
  const cancelToken = config.cancelToken;
  const path = version !== undefined ? `${version}/${resource}` : resource;
  const endpoint = buildEndpoint(String(getVar('MS_SCHEMA')) + '://' + api + String(getVar('MS_BASE_URL')), path, params);

  const verb = config?.verb ?? defaultOptions?.verb;
  const headers = { ...defaultOptions?.headers, ...config?.headers };
  const query = { ...defaultOptions?.query, ...config?.query };
  const data = { ...defaultOptions?.data, ...config?.data };
  const timeout = config?.timeout ?? defaultOptions?.timeout;

  const axiosConfig: AxiosRequestConfig = { method: verb, url: endpoint, headers, params: query, data, cancelToken, timeout };

  return axiosConfig;
}

export function parseVerb(verb: string): HttpVerb {
  if (verb.toLowerCase() === 'get') return 'GET';
  else if (verb.toLowerCase() === 'post') return 'POST';
  else if (verb.toLowerCase() === 'put') return 'PUT';
  else if (verb.toLowerCase() === 'patch') return 'PATCH';
  else if (verb.toLowerCase() === 'delete') return 'DELETE';

  throw new ApiError('Unable to parse Verb');
}
