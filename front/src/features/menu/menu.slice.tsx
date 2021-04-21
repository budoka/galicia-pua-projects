import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import _ from 'lodash';
import { MenuSliceState } from './types';


const FEATURE_NAME = 'menu';

// Slice

const initialState: MenuSliceState = {
  loading: false,
  data: { key: undefined },
  error: null,
};

const slice = createSlice({
  name: FEATURE_NAME,
  initialState,
  reducers: {
    setKeyMenu(state, action) {
      state.data.key = action.payload;
    },
  },
  extraReducers: {},
});

const { setKeyMenu } = slice.actions;

export { setKeyMenu };

export default slice.reducer;
