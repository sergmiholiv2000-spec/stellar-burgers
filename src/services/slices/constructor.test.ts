import {
  addIngredient,
  burgerConstructorSlice,
  clearConstructor,
  moveIngredientDown,
  moveIngredientUp,
  removeIngredient,
} from './constructor';

import type {
  TConstructorIngredient,
  TConstructorState,
  TIngredient,
} from '@utils-types';

const mockBun: TIngredient = {
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
};

const mockMain: TIngredient = {
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
};

const mockSauce: TIngredient = {
  _id: '643d69a5c3f7b9001cfa0942',
  name: 'Соус Spicy-X',
  type: 'sauce',
  proteins: 30,
  fat: 20,
  carbohydrates: 40,
  calories: 30,
  price: 90,
  image: 'https://example.com/sauce.png',
  image_mobile: 'https://example.com/sauce-mobile.png',
  image_large: 'https://example.com/sauce-large.png',
};

const toConstructorIngredient = (
  ingredient: TIngredient,
  id: string
): TConstructorIngredient => ({ ...ingredient, id });

const constructorBun = toConstructorIngredient(mockBun, 'bun-id');
const constructorMain = toConstructorIngredient(mockMain, 'main-id');
const constructorSauce = toConstructorIngredient(mockSauce, 'sauce-id');

const initialState: TConstructorState = {
  bun: null,
  ingredients: [],
};

describe('burgerConstructorSlice reducer', () => {
  it('возвращает начальное состояние для неизвестного экшена при state = undefined', () => {
    const state = burgerConstructorSlice.reducer(undefined, { type: 'UNKNOWN' });

    expect(state).toEqual(initialState);
  });

  it('обрабатывает addIngredient для булки', () => {
    const state = burgerConstructorSlice.reducer(undefined, addIngredient(mockBun));

    expect(state.bun).toMatchObject(mockBun);
    expect(state.bun?.id).toEqual(expect.any(String));
    expect(state.ingredients).toEqual([]);
  });

  it('заменяет булку при добавлении новой булки', () => {
    const stateAfterFirstBun = burgerConstructorSlice.reducer(
      undefined,
      addIngredient(mockBun)
    );
    const stateAfterSecondBun = burgerConstructorSlice.reducer(
      stateAfterFirstBun,
      addIngredient({
        ...mockBun,
        _id: 'another-bun-id',
        name: 'Другая булка',
      })
    );

    expect(stateAfterSecondBun.bun?.name).toBe('Другая булка');
    expect(stateAfterSecondBun.ingredients).toEqual([]);
  });

  it('обрабатывает addIngredient для начинки и соуса', () => {
    const stateAfterMain = burgerConstructorSlice.reducer(
      undefined,
      addIngredient(mockMain)
    );
    const stateAfterSauce = burgerConstructorSlice.reducer(
      stateAfterMain,
      addIngredient(mockSauce)
    );

    expect(stateAfterSauce.bun).toBeNull();
    expect(stateAfterSauce.ingredients).toHaveLength(2);
    expect(stateAfterSauce.ingredients[0]).toMatchObject(mockMain);
    expect(stateAfterSauce.ingredients[0].id).toEqual(expect.any(String));
    expect(stateAfterSauce.ingredients[1]).toMatchObject(mockSauce);
    expect(stateAfterSauce.ingredients[1].id).toEqual(expect.any(String));
  });

  it('обрабатывает removeIngredient', () => {
    const previousState: TConstructorState = {
      bun: constructorBun,
      ingredients: [constructorMain, constructorSauce],
    };

    const state = burgerConstructorSlice.reducer(previousState, removeIngredient(0));

    expect(state.ingredients).toEqual([constructorSauce]);
    expect(state.bun).toEqual(constructorBun);
  });

  it('обрабатывает moveIngredientUp', () => {
    const previousState: TConstructorState = {
      bun: null,
      ingredients: [constructorMain, constructorSauce],
    };

    const state = burgerConstructorSlice.reducer(previousState, moveIngredientUp(1));

    expect(state.ingredients).toEqual([constructorSauce, constructorMain]);
  });

  it('обрабатывает moveIngredientDown', () => {
    const previousState: TConstructorState = {
      bun: null,
      ingredients: [constructorMain, constructorSauce],
    };

    const state = burgerConstructorSlice.reducer(previousState, moveIngredientDown(0));

    expect(state.ingredients).toEqual([constructorSauce, constructorMain]);
  });

  it('не меняет порядок при moveIngredientUp на первом элементе', () => {
    const previousState: TConstructorState = {
      bun: null,
      ingredients: [constructorMain, constructorSauce],
    };

    const state = burgerConstructorSlice.reducer(previousState, moveIngredientUp(0));

    expect(state.ingredients).toEqual([constructorMain, constructorSauce]);
  });

  it('не меняет порядок при moveIngredientDown на последнем элементе', () => {
    const previousState: TConstructorState = {
      bun: null,
      ingredients: [constructorMain, constructorSauce],
    };

    const state = burgerConstructorSlice.reducer(previousState, moveIngredientDown(1));

    expect(state.ingredients).toEqual([constructorMain, constructorSauce]);
  });

  it('обрабатывает clearConstructor', () => {
    const previousState: TConstructorState = {
      bun: constructorBun,
      ingredients: [constructorMain],
    };

    const state = burgerConstructorSlice.reducer(previousState, clearConstructor());

    expect(state).toEqual(initialState);
  });
});
