import type { TIngredient, TOrderDetails } from '@utils-types';
import type { Location } from 'react-router-dom';

export type OrderCardUIProps = {
  orderInfo: TOrderInfo;
  maxIngredients: number;
  locationState: { background: Location };
};

type TOrderInfo = TOrderDetails & {
  ingredientsInfo: TIngredient[];
  ingredientsToShow: TIngredient[];
  remains: number;
};
