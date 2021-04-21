import { CancelToken } from 'axios';

export type HttpVerb = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface HeadersParamsDictionary {
  [key: string]: string | number | boolean;
}

interface PlaceholdersDictionary {
  [key: string]: string | number;
}

export interface DataDictionary {
  [key: string]: any;
}

export interface Headers extends HeadersParamsDictionary {}
export interface Params extends HeadersParamsDictionary {}
export interface Placeholders extends PlaceholdersDictionary {}
export type Data<T> = T;

export interface RequestConfig<T = DataDictionary | void> {
  verb?: HttpVerb;
  headers?: Headers;
  placeholders?: Placeholders;
  params?: Params;
  data?: Data<T>;
  timeout?: number;
  cancelToken?: CancelToken;
}

// export type RequestOptions<T = void> = Request<T> | undefined;

export interface API<ResourcesType> {
  baseURL: string;
  resources: ResourcesType;
}

export interface Resource {
  path: string;
  config?: RequestConfig;
}
