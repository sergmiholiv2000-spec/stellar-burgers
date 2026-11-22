import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { useEffect } from 'react';

import {
  fetchFeeds,
  getFeedError,
  getFeedOrders,
  getFeedLoading,
} from '../../services/slices/feed';
import {
  getIngredientsError,
  getIngredientsLoading,
} from '../../services/slices/ingredients';
import { useDispatch, useSelector } from '../../services/store';

const FEED_REFRESH_INTERVAL = 3000;

export const Feed = (): React.JSX.Element => {
  const dispatch = useDispatch();

  const orders = useSelector(getFeedOrders);
  const isLoading = useSelector(getFeedLoading);
  const error = useSelector(getFeedError);
  const isIngredientsLoading = useSelector(getIngredientsLoading);
  const ingredientsError = useSelector(getIngredientsError);

  useEffect(() => {
    void dispatch(fetchFeeds()).catch(() => undefined);

    const refreshTimer = setInterval((): void => {
      void dispatch(fetchFeeds()).catch(() => undefined);
    }, FEED_REFRESH_INTERVAL);

    return (): void => {
      clearInterval(refreshTimer);
    };
  }, [dispatch]);

  const handleGetFeeds = (): void => {
    void dispatch(fetchFeeds()).catch(() => undefined);
  };

  /* Карточки заказов собираются из ингредиентов, поэтому без них лента
     осталась бы пустой без объяснения причины. */
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
        {`Не удалось загрузить ленту заказов: ${error}`}
      </p>
    );
  }

  return <FeedUI orders={orders} handleGetFeeds={handleGetFeeds} />;
};
