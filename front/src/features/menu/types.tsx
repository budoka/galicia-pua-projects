import { IElement } from '../../types';

export interface MenuSliceState {
  loading: boolean;
  data: { key: string | undefined };
  error: string | null;
}

// Modelo Front

export interface KeyMenu {
  key: string;
}
