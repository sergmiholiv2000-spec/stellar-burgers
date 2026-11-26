import { fetchIngredients, ingredientsSlice } from './ingredients';

import type { TIngredientsState } from './ingredients';
import type { TIngredient } from '@utils-types';

const mockIngredients: TIngredient[] = [
  {
    _id: '643d69a5c3f7b9001cfa093c',
    name: 'Краторная булка N-200i',
    type: 'bun',
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 1255,
    image: 'https://example.com/bun.png',
    image_mobile: 'https://example.com/bun-mobile.png',
    image_large: 'https://example.com/bun-large.png',
  },
  {
    _id: '643d69a5c3f7b9001cfa0941',
    name: 'Биокотлета из марсианской Магнолии',
    type: 'main',
    proteins: 420,
    fat: 142,
    carbohydrates: 242,
    calories: 4242,
    price: 424,
    image: 'https://example.com/main.png',
    image_mobile: 'https://example.com/main-mobile.png',
    image_large: 'https://example.com/main-large.png',
  },
];

const initialState: TIngredientsState = {
  items: [],
  isLoading: false,
  error: null,
};

describe('ingredientsSlice reducer', () => {
  it('возвращает начальное состояние для неизвестного экшена при state = undefined', () => {
    const state = ingredientsSlice.reducer(undefined, { type: 'UNKNOWN' });

    expect(state).toEqual(initialState);
  });

  it('обрабатывает fetchIngredients.pending', () => {
    const previousState: TIngredientsState = {
      ...initialState,
      error: { name: 'Error', message: 'Предыдущая ошибка' },
    };

    const state = ingredientsSlice.reducer(
      previousState,
      fetchIngredients.pending('request-id', undefined)
    );

    expect(state).toEqual({
      items: [],
      isLoading: true,
      error: null,
    });
  });

  it('обрабатывает fetchIngredients.fulfilled', () => {
    const previousState: TIngredientsState = {
      items: [],
      isLoading: true,
      error: null,
    };

    const state = ingredientsSlice.reducer(
      previousState,
      fetchIngredients.fulfilled(mockIngredients, 'request-id', undefined)
    );

    expect(state).toEqual({
      items: mockIngredients,
      isLoading: false,
      error: null,
    });
  });

  it('обрабатывает fetchIngredients.rejected', () => {
    const previousState: TIngredientsState = {
      items: [],
      isLoading: true,
      error: null,
    };

    const state = ingredientsSlice.reducer(
      previousState,
      fetchIngredients.rejected(
        new Error('Не удалось загрузить ингредиенты'),
        'request-id',
        undefined
      )
    );

    expect(state.isLoading).toBe(false);
    expect(state.items).toEqual([]);
    expect(state.error).toEqual(
      expect.objectContaining({
        name: 'Error',
        message: 'Не удалось загрузить ингредиенты',
      })
    );
  });

  it('не изменяет уже загруженный массив при ошибке запроса', () => {
    const previousState: TIngredientsState = {
      items: mockIngredients,
      isLoading: true,
      error: null,
    };

    const state = ingredientsSlice.reducer(
      previousState,
      fetchIngredients.rejected(new Error('Ошибка сети'), 'request-id', undefined)
    );

    expect(state.items).toEqual(mockIngredients);
    expect(state.isLoading).toBe(false);
  });
});
