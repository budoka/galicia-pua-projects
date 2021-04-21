import axios, { AxiosRequestConfig } from 'axios';
import dayjs from 'dayjs';
import { API, Placeholders, RequestConfig, Resource } from './types';
import { getVar } from '../utils/environment';

/**
 * Build the url of an API.
 * @param apiId api's id
 */
export function buildBaseURL(apiId: string) {
  const PREFIX_API = 'API_';
  const prefix = getVar(PREFIX_API + 'PREFIX');
  const suffix = getVar(PREFIX_API + 'SUFFIX');
  apiId = getVar(PREFIX_API + apiId).toString();

  return `${prefix}/${suffix}/${apiId}`;
}

/**
 * Build the endpoint of a request.
 * @param baseURL request's base url
 * @param resource request's resource
 * @param placeholders request's placeholders (e.g: replace 'https//example.com/users/:userId/inventory/:inventoryId' with 'https//example.com/users/10000/inventory/50')
 */
export function buildEndpoint(baseURL: string, path: string, placeholders?: Placeholders) {
  const _placeholders = placeholders ? Object.entries(placeholders) : undefined;
  let _path = path;
  if (_placeholders) _path = _placeholders.reduce((url, ph) => url.replace(`:${ph[0]}`, ph[1].toString()), _path);
  return `${baseURL}/${_path}`;
}

/**
 * Build the axios request config.
 * @param api API
 * @param resource request's resource
 * @param config request's configuration
 */
export function buildAxiosRequestConfig<ResourceType, Data>(api: API<ResourceType>, resource: Resource, config: RequestConfig<Data> = {}) {
  const { baseURL } = api;
  const { path, config: defaultOptions } = resource;
  const { placeholders, cancelToken } = config!;
  const endpoint = buildEndpoint(baseURL, path, placeholders);
  const verb = config?.verb ?? defaultOptions?.verb;
  const headers = { ...defaultOptions?.headers, ...config?.headers };
  const params = { ...defaultOptions?.params, ...config?.params };
  const data = { ...defaultOptions?.data, ...config?.data };
  const timeout = config?.timeout ?? defaultOptions?.timeout;

  const axiosConfig: AxiosRequestConfig = { method: verb, url: endpoint, headers, params, data, cancelToken, timeout };

  return axiosConfig;
}

/**
 * Get expiration unix time
 * @param value value value *15*
 * @param unit default value *second*
 */
export function getExpirationTime(value: number = 15, unit: 'second' | 'minute' = 'second') {
  return dayjs().add(value, unit).unix();
}
