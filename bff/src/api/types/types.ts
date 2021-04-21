import { CancelToken } from 'axios';

export type HttpVerb = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface HeadersQueryDictionary {
  [key: string]: string | number | boolean;
}

interface ParamsDictionary {
  [key: string]: string | number;
}

export interface DataDictionary {
  [key: string]: any;
}

export type Headers = HeadersQueryDictionary;
export type Query = HeadersQueryDictionary;
export type Params = ParamsDictionary | string;
export type Data<T> = T;

export interface RequestConfig<T = DataDictionary | void> {
  verb?: HttpVerb;
  headers?: Headers;
  params?: Params;
  query?: Query;
  data?: Data<T>;
  timeout?: number;
  cancelToken?: CancelToken;
}

export interface API<ResourcesType> {
  baseURL: string;
  resources: ResourcesType;
}

export interface Resource {
  path: string;
  config?: RequestConfig;
}

export interface ApiRequest {
  verb: string;
  api: string;
  resource: string;
  version?: string;
  params?: any;
  query?: any;
  data?: any;
}
