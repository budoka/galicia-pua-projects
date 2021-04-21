import React from 'react';
import { HttpVerb } from '../types';
//import { HttpVerb } from 'src/types';

export interface Size {
  width: number;
  height: number;
}

export interface Dictionary<T> {
  [key: string]: T;
}

export interface ObjectLiteral {
  [key: string]: any;
}

export interface QueryParams {
  select?: string[];
  where?: ObjectLiteral;
  offset?: number;
  limit?: number;
  order?: { [P in keyof any]?: 'ASC' | 'DESC' };
}

// API
export interface IAPI {
  name: string;
  url: string;
  method: IAPIMethod[];
}

export interface IAPIMethod {
  id: string;
  verb: HttpVerb;
  path: string;
  headers?: {
    [header: string]: unknown;
  };
  data?: {
    [data: string]: unknown;
  };
  params?: {
    [params: string]: unknown;
  };
}
