import { getOrderByNumberApi, orderBurgerApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { TOrder } from '@utils-types';

export type TOrderState = {
  orderRequest: boolean;
  orderModalData: TOrder | null;
  orderByNumber: TOrder | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: TOrderState = {
  orderRequest: false,
  orderModalData: null,
  orderByNumber: null,
  isLoading: false,
  error: null,
};

export const createOrder = createAsyncThunk<TOrder, string[]>(
  'order/create',
  async (ingredientIds: string[]): Promise<TOrder> => {
    const res = await orderBurgerApi(ingredientIds);
    return res.order;
  }
);

export const fetchOrderByNumber = createAsyncThunk<TOrder, number>(
  'order/fetchByNumber',
  async (number: number): Promise<TOrder> => {
    const res = await getOrderByNumberApi(number);
    if (!res.success || !res.orders.length) {
      throw new Error('Заказ не найден');
    }
    return res.orders[0];
  }
);

export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    resetOrder: (state): void => {
      state.orderModalData = null;
      state.orderRequest = false;
      state.error = null;
    },
    clearOrderByNumber: (state): void => {
      state.orderByNumber = null;
      state.isLoading = false;
      state.error = null;
    },
  },
  selectors: {
    getOrderRequest: (state): boolean => state.orderRequest,
    getOrderModalData: (state): TOrder | null => state.orderModalData,
    getOrderByNumber: (state): TOrder | null => state.orderByNumber,
    getOrderLoading: (state): boolean => state.isLoading,
    getOrderError: (state): string | null => state.error,
  },
  extraReducers: (builder): void => {
    builder
      .addCase(createOrder.pending, (state): void => {
        state.orderRequest = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action): void => {
        state.orderRequest = false;
        state.orderModalData = action.payload;
      })
      .addCase(createOrder.rejected, (state, action): void => {
        state.orderRequest = false;
        state.error = action.error.message ?? 'Не удалось оформить заказ';
      })
      .addCase(fetchOrderByNumber.pending, (state): void => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderByNumber.fulfilled, (state, action): void => {
        state.isLoading = false;
        state.orderByNumber = action.payload;
      })
      .addCase(fetchOrderByNumber.rejected, (state, action): void => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Заказ не найден';
      });
  },
});

export const { resetOrder, clearOrderByNumber } = orderSlice.actions;
export const {
  getOrderRequest,
  getOrderModalData,
  getOrderByNumber,
  getOrderLoading,
  getOrderError,
} = orderSlice.selectors;
