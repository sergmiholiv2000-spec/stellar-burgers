import { getOrdersApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { SerializedError } from '@reduxjs/toolkit';
import type { TOrder } from '@utils-types';

export type TProfileOrdersState = {
  orders: TOrder[];
  isLoading: boolean;
  isLoaded: boolean;
  error: SerializedError | null;
};

const initialState: TProfileOrdersState = {
  orders: [],
  isLoading: false,
  isLoaded: false,
  error: null,
};

export const fetchProfileOrders = createAsyncThunk<TOrder[]>(
  'profileOrders/fetch',
  async (): Promise<TOrder[]> => await getOrdersApi()
);

export const profileOrdersSlice = createSlice({
  name: 'profileOrders',
  initialState,
  reducers: {
    clearProfileOrders: (state): void => {
      state.orders = [];
      state.isLoading = false;
      state.isLoaded = false;
      state.error = null;
    },
  },
  selectors: {
    getProfileOrders: (state): TOrder[] => state.orders,
    getProfileOrdersLoading: (state): boolean => state.isLoading,
    getProfileOrdersLoaded: (state): boolean => state.isLoaded,
    getProfileOrdersError: (state): SerializedError | null => state.error,
  },
  extraReducers: (builder): void => {
    builder
      .addCase(fetchProfileOrders.pending, (state): void => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfileOrders.fulfilled, (state, action): void => {
        state.isLoading = false;
        state.isLoaded = true;
        state.orders = action.payload;
      })
      .addCase(fetchProfileOrders.rejected, (state, action): void => {
        state.isLoading = false;
        state.isLoaded = true;
        state.error = action.error;
      });
  },
});

export const { clearProfileOrders } = profileOrdersSlice.actions;
export const {
  getProfileOrders,
  getProfileOrdersLoading,
  getProfileOrdersLoaded,
  getProfileOrdersError,
} = profileOrdersSlice.selectors;
