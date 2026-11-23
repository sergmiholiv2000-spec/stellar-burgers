import { OrderInfoUI, Preloader } from '@ui';
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { getFeedOrders } from '../../services/slices/feed';
import {
  getIngredients,
  getIngredientsError,
  getIngredientsLoading,
} from '../../services/slices/ingredients';
import {
  clearOrderByNumber,
  fetchOrderByNumber,
  getOrderByNumber,
  getOrderError,
  getOrderLoading,
} from '../../services/slices/order';
import { getProfileOrders } from '../../services/slices/profile-orders';
import { useDispatch, useSelector } from '../../services/store';

import type { TIngredient } from '@utils-types';

export const OrderInfo = (): React.JSX.Element => {
  const { number } = useParams<{ number: string }>();
  const dispatch = useDispatch();

  const orderByNumber = useSelector(getOrderByNumber);
  const orderError = useSelector(getOrderError);
  const isOrderLoading = useSelector(getOrderLoading);
  const feedOrders = useSelector(getFeedOrders);
  const profileOrders = useSelector(getProfileOrders);
  const ingredients = useSelector(getIngredients);
  const isIngredientsLoading = useSelector(getIngredientsLoading);
  const ingredientsError = useSelector(getIngredientsError);

  /* В ленте и истории заказов уже есть все данные, поэтому сначала ищем
     заказ по номеру из URL там — модальное окно открывается без запроса. */
  const orderFromLists = useMemo(() => {
    if (!number) return null;

    const orderNumber = Number(number);

    return (
      [...feedOrders, ...profileOrders].find((order) => order.number === orderNumber) ??
      null
    );
  }, [feedOrders, profileOrders, number]);

  const orderData = orderFromLists ?? orderByNumber;

  useEffect(() => {
    if (!number) return;

    /* Заказ найден в загруженных списках — запрос к серверу не нужен. */
    if (orderFromLists) {
      dispatch(clearOrderByNumber());
      return;
    }

    /* Запасной вариант: прямой переход по ссылке или перезагрузка страницы. */
    dispatch(clearOrderByNumber());
    void dispatch(fetchOrderByNumber(Number(number))).catch(() => undefined);

    return (): void => {
      dispatch(clearOrderByNumber());
    };
  }, [dispatch, number, orderFromLists]);

  /* Готовим данные для отображения */
  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = Record<string, TIngredient & { count: number }>;

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1,
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total,
    };
  }, [orderData, ingredients]);

  /* Ошибку заказа из стора показываем только когда он не найден в списках:
     иначе ошибка прошлого запроса могла бы перекрыть готовые данные. */
  const resolvedOrderError = orderFromLists ? null : orderError;

  if (
    (isOrderLoading && !orderFromLists) ||
    isIngredientsLoading ||
    (!ingredients.length && !ingredientsError) ||
    (!orderData && !resolvedOrderError)
  ) {
    return <Preloader />;
  }

  if (resolvedOrderError || !orderData) {
    return (
      <p className="text text_type_main-medium" style={{ textAlign: 'center' }}>
        {resolvedOrderError ?? 'Заказ не найден'}
      </p>
    );
  }

  /* Без ингредиентов состав заказа не собрать. Явная ошибка лучше вечного
     прелоадера: он раньше показывался, если запрос ингредиентов падал. */
  if (!ingredients.length) {
    return (
      <p className="text text_type_main-medium" style={{ textAlign: 'center' }}>
        {ingredientsError
          ? `Не удалось загрузить ингредиенты: ${
              ingredientsError.message ?? 'неизвестная ошибка'
            }`
          : 'Не удалось собрать состав заказа'}
      </p>
    );
  }

  if (!orderInfo) {
    return (
      <p className="text text_type_main-medium" style={{ textAlign: 'center' }}>
        Не удалось собрать состав заказа
      </p>
    );
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
