import { createSlice, nanoid } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  TConstructorIngredient,
  TConstructorState,
  TIngredient,
} from '@utils-types';

const initialState: TConstructorState = {
  bun: null,
  ingredients: [],
};

export const burgerConstructorSlice = createSlice({
  name: 'burgerConstructor',
  initialState,
  reducers: {
    addIngredient: {
      reducer: (state, action: PayloadAction<TConstructorIngredient>): void => {
        if (action.payload.type === 'bun') {
          state.bun = action.payload;
        } else {
          state.ingredients.push(action.payload);
        }
      },
      prepare: (ingredient: TIngredient): { payload: TConstructorIngredient } => ({
        payload: { ...ingredient, id: nanoid() },
      }),
    },
    removeIngredient: (state, action: PayloadAction<number>): void => {
      state.ingredients.splice(action.payload, 1);
    },
    moveIngredientUp: (state, action: PayloadAction<number>): void => {
      const index = action.payload;
      if (index <= 0) return;
      [state.ingredients[index - 1], state.ingredients[index]] = [
        state.ingredients[index],
        state.ingredients[index - 1],
      ];
    },
    moveIngredientDown: (state, action: PayloadAction<number>): void => {
      const index = action.payload;
      if (index >= state.ingredients.length - 1) return;
      [state.ingredients[index], state.ingredients[index + 1]] = [
        state.ingredients[index + 1],
        state.ingredients[index],
      ];
    },
    clearConstructor: (): TConstructorState => initialState,
  },
  selectors: {
    getConstructorItems: (state): TConstructorState => state,
  },
});

export const {
  addIngredient,
  removeIngredient,
  moveIngredientUp,
  moveIngredientDown,
  clearConstructor,
} = burgerConstructorSlice.actions;

export const { getConstructorItems } = burgerConstructorSlice.selectors;
