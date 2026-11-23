import { BurgerConstructorUI } from '@ui';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  clearConstructor,
  getConstructorItems,
} from '../../services/slices/constructor';
import {
  createOrder,
  getOrderError,
  getOrderModalData,
  getOrderRequest,
  resetOrder,
} from '../../services/slices/order';
import { getUser } from '../../services/slices/user';
import { useDispatch, useSelector } from '../../services/store';

import type { TConstructorIngredient } from '@utils-types';

export const BurgerConstructor = (): React.JSX.Element | null => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const constructorItems = useSelector(getConstructorItems);
  const orderRequest = useSelector(getOrderRequest);
  const orderModalData = useSelector(getOrderModalData);
  const orderError = useSelector(getOrderError);
  const user = useSelector(getUser);

  const onOrderClick = (): void => {
    /* Авторизацию проверяем до проверки состава заказа: гостя нужно отправить
       на форму входа даже в том случае, если бургер ещё не собран. */
    if (!user) {
      void navigate('/login', { state: { from: location } });
      return;
    }

    if (!constructorItems.bun || orderRequest) return;

    const ingredientIds = [
      constructorItems.bun._id,
      ...constructorItems.ingredients.map((item) => item._id),
      constructorItems.bun._id,
    ];

    void dispatch(createOrder(ingredientIds))
      .unwrap()
      .then((): void => {
        dispatch(clearConstructor());
      })
      .catch((): void => {
        /* Текст ошибки сохраняется в orderSlice и не роняет приложение. */
      });
  };

  const closeOrderModal = (): void => {
    /* Пока запрос в полёте, модальное окно закрывать нельзя: иначе заказ
       создастся, а пользователь об этом не узнает. */
    if (orderRequest) return;

    dispatch(resetOrder());

    /* Конструктор очищается только после успешного заказа. При закрытии окна
       с ошибкой собранный бургер должен остаться на месте. */
    if (orderModalData) {
      dispatch(clearConstructor());
      void navigate('/');
    }
  };

  const price = useMemo(
    () =>
      (constructorItems.bun ? constructorItems.bun.price * 2 : 0) +
      constructorItems.ingredients.reduce(
        (s: number, v: TConstructorIngredient) => s + v.price,
        0
      ),
    [constructorItems]
  );

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={constructorItems}
      orderModalData={orderModalData}
      orderError={orderError}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};
