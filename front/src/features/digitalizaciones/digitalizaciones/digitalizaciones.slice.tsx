import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import moment from 'moment';
import { apis } from 'src/API/setup/setup-apis';
import { RequestConfig } from 'src/API/types';
import { buildAxiosRequestConfig } from 'src/API/utils';
import { DATE_DD_MM_YYYY_FORMAT } from 'src/constants';
import { fetchPersonas } from 'src/features/shared';
import { RootState } from 'src/reducers';
import { splitStringByWords } from 'src/utils/string';
import { DigitalizacionesSliceState } from './types';

const FEATURE_NAME = 'digitalizaciones';

// Slice

const initialState: DigitalizacionesSliceState = {
  data: { personas: { value: [], loading: false } },
  error: null,
};

const slice = createSlice({
  name: FEATURE_NAME,
  initialState,
  reducers: {
    clearState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPersonas.pending, (state) => {
        state.data = { ...state.data, personas: { value: [], loading: true } };
        state.error = null;
      })
      .addCase(fetchPersonas.fulfilled, (state, action) => {
        state.data = { ...state.data, personas: { value: action.payload, loading: false } };
      })
      .addCase(fetchPersonas.rejected, (state, action) => {
        state.data = { ...state.data, personas: { value: [], loading: false } };
        state.error = action.error.message ?? null;
      });
  },
});

const { clearState } = slice.actions;

export { clearState };

export default slice.reducer;
