import { ConstructorPageUI } from '@ui-pages';
import { clsx } from 'clsx';

import {
  getIngredientsError,
  getIngredientsLoading,
} from '../../services/slices/ingredients';
import { useSelector } from '../../services/store';

import styles from './constructor-page.module.css';

export const ConstructorPage = (): React.JSX.Element => {
  const isLoading = useSelector(getIngredientsLoading);
  const error = useSelector(getIngredientsError);

  if (error) {
    return (
      <main className={styles.containerMain}>
        <p className={clsx(styles.title, 'text', 'text_type_main-medium', 'mt-10')}>
          {`Не удалось загрузить ингредиенты: ${error.message ?? 'неизвестная ошибка'}`}
        </p>
      </main>
    );
  }

  return <ConstructorPageUI isIngredientsLoading={isLoading} />;
};
