import { getFeedsApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { TFeedState, TOrder, TOrdersData } from '@utils-types';

const initialState: TFeedState = {
  orders: [],
  total: 0,
  totalToday: 0,
  isLoading: false,
  isLoaded: false,
  error: null,
};

export const fetchFeeds = createAsyncThunk<TOrdersData>(
  'feed/fetch',
  async (): Promise<TOrdersData> => {
    const res = await getFeedsApi();
    return {
      orders: res.orders,
      total: res.total,
      totalToday: res.totalToday,
    };
  }
);

export const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {},
  selectors: {
    getFeedState: (state): TFeedState => state,
    getFeedOrders: (state): TOrder[] => state.orders,
    getFeedLoading: (state): boolean => state.isLoading,
    getFeedLoaded: (state): boolean => state.isLoaded,
    getFeedError: (state): string | null => state.error,
  },
  extraReducers: (builder): void => {
    builder
      .addCase(fetchFeeds.pending, (state): void => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeeds.fulfilled, (state, action): void => {
        state.isLoading = false;
        state.isLoaded = true;
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.totalToday = action.payload.totalToday;
      })
      .addCase(fetchFeeds.rejected, (state, action): void => {
        state.isLoading = false;
        state.isLoaded = true;
        state.error = action.error.message ?? 'Не удалось загрузить ленту заказов';
      });
  },
});

export const {
  getFeedState,
  getFeedOrders,
  getFeedLoading,
  getFeedLoaded,
  getFeedError,
} = feedSlice.selectors;
