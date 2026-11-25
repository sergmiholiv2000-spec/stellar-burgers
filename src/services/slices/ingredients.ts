import { getIngredientsApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { SerializedError } from '@reduxjs/toolkit';
import type { TIngredient } from '@utils-types';

export type TIngredientsState = {
  items: TIngredient[];
  isLoading: boolean;
  error: SerializedError | null;
};

const initialState: TIngredientsState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchIngredients = createAsyncThunk<TIngredient[]>(
  'ingredients/fetch',
  async (): Promise<TIngredient[]> => await getIngredientsApi(),
  {
    condition: (_arg, { getState }): boolean => {
      const state = getState() as { ingredients: TIngredientsState };
      return !state.ingredients.isLoading && !state.ingredients.items.length;
    },
  }
);

export const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {},
  selectors: {
    getIngredients: (state): TIngredient[] => state.items,
    getIngredientsLoading: (state): boolean => state.isLoading,
    getIngredientsError: (state): SerializedError | null => state.error,
  },
  extraReducers: (builder): void => {
    builder
      .addCase(fetchIngredients.pending, (state): void => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIngredients.fulfilled, (state, action): void => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchIngredients.rejected, (state, action): void => {
        state.isLoading = false;
        state.error = action.error;
      });
  },
});

export const { getIngredients, getIngredientsLoading, getIngredientsError } =
  ingredientsSlice.selectors;
