import { combineReducers } from '@reduxjs/toolkit';

import { burgerConstructorSlice } from './slices/constructor';
import { feedSlice } from './slices/feed';
import { ingredientsSlice } from './slices/ingredients';
import { orderSlice } from './slices/order';
import { profileOrdersSlice } from './slices/profile-orders';
import { userSlice } from './slices/user';

export const rootReducer = combineReducers({
  [ingredientsSlice.name]: ingredientsSlice.reducer,
  [burgerConstructorSlice.name]: burgerConstructorSlice.reducer,
  [userSlice.name]: userSlice.reducer,
  [feedSlice.name]: feedSlice.reducer,
  [profileOrdersSlice.name]: profileOrdersSlice.reducer,
  [orderSlice.name]: orderSlice.reducer,
});
