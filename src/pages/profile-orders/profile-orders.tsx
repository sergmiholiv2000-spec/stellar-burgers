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
  getProfileOrdersLoading,
} from '../../services/slices/profile-orders';
import { useDispatch, useSelector } from '../../services/store';

const ORDERS_REFRESH_INTERVAL = 3000;

export const ProfileOrders = (): React.JSX.Element => {
  const dispatch = useDispatch();

  const orders = useSelector(getProfileOrders);
  const isLoading = useSelector(getProfileOrdersLoading);
  const error = useSelector(getProfileOrdersError);
  const isIngredientsLoading = useSelector(getIngredientsLoading);
  const ingredientsError = useSelector(getIngredientsError);

  useEffect(() => {
    dispatch(clearProfileOrders());
    void dispatch(fetchProfileOrders()).catch(() => undefined);

    const refreshTimer = setInterval((): void => {
      void dispatch(fetchProfileOrders()).catch(() => undefined);
    }, ORDERS_REFRESH_INTERVAL);

    return (): void => {
      clearInterval(refreshTimer);
    };
  }, [dispatch]);

  if (isIngredientsLoading || (isLoading && !orders.length)) {
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
