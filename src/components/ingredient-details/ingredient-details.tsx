import { IngredientDetailsUI, Preloader } from '@ui';
import { useParams } from 'react-router-dom';

import {
  getIngredients,
  getIngredientsError,
  getIngredientsLoading,
} from '../../services/slices/ingredients';
import { useSelector } from '../../services/store';

export const IngredientDetails = (): React.JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const ingredients = useSelector(getIngredients);
  const isLoading = useSelector(getIngredientsLoading);
  const error = useSelector(getIngredientsError);

  const ingredientData = ingredients.find((item) => item._id === id);

  /* Если запрос ещё не завершился, не показываем «не найден»: на прямом
     переходе по ссылке список ингредиентов в этот момент может быть пустым. */
  if (isLoading || (!ingredients.length && !error)) {
    return <Preloader />;
  }

  if (error && !ingredients.length) {
    return (
      <p className="text text_type_main-medium" style={{ textAlign: 'center' }}>
        {`Не удалось загрузить ингредиенты: ${error.message ?? 'неизвестная ошибка'}`}
      </p>
    );
  }

  if (!ingredientData) {
    return (
      <p className="text text_type_main-medium" style={{ textAlign: 'center' }}>
        Ингредиент не найден
      </p>
    );
  }

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};
