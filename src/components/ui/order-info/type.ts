import type { TIngredient, TOrderDetails } from '@utils-types';

export type OrderInfoUIProps = {
  orderInfo: TOrderInfo;
};

type TOrderInfo = TOrderDetails & {
  ingredientsInfo: Record<string, TIngredient & { count: number }>;
};
