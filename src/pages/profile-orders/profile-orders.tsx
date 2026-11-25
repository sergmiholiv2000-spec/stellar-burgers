import { Preloader } from '@ui';
import { ProfileOrdersUI } from '@ui-pages';
import { useEffect } from 'react';

import {
  getIngredientsError,
  getIngredientsLoading,
} from '../../services/slices/ingredients';
import {
  clearProfileOrders,
  fetchProfileOrders,
  getProfileOrders,
  getProfileOrdersError,
  getProfileOrdersLoaded,
  getProfileOrdersLoading,
} from '../../services/slices/profile-orders';
import { useDispatch, useSelector } from '../../services/store';

export const ProfileOrders = (): React.JSX.Element => {
  const dispatch = useDispatch();

  const orders = useSelector(getProfileOrders);
  const isLoading = useSelector(getProfileOrdersLoading);
  const isLoaded = useSelector(getProfileOrdersLoaded);
  const error = useSelector(getProfileOrdersError);
  const isIngredientsLoading = useSelector(getIngredientsLoading);
  const ingredientsError = useSelector(getIngredientsError);

  /* История заказов загружается при открытии страницы. Периодический опрос
     не нужен: он перезаписывал пустое состояние прелоадером. */
  useEffect(() => {
    dispatch(clearProfileOrders());
    void dispatch(fetchProfileOrders()).catch(() => undefined);
  }, [dispatch]);

  if (isIngredientsLoading || (isLoading && !isLoaded)) {
    return <Preloader />;
  }

  if (ingredientsError) {
    return (
      <p className="text text_type_main-medium mt-10" style={{ textAlign: 'center' }}>
        {`Не удалось загрузить ингредиенты: ${
          ingredientsError.message ?? 'неизвестная ошибка'
        }`}
      </p>
    );
  }

  if (error && !orders.length) {
    return (
      <p className="text text_type_main-medium mt-10" style={{ textAlign: 'center' }}>
        {`Не удалось загрузить историю заказов: ${error.message ?? 'неизвестная ошибка'}`}
      </p>
    );
  }

  return <ProfileOrdersUI orders={orders} />;
};
