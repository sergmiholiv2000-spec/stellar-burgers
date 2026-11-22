import {
  forgotPasswordApi,
  getUserApi,
  loginUserApi,
  logoutApi,
  registerUserApi,
  resetPasswordApi,
  updateUserApi,
} from '@api';
import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';

import { deleteCookie, setCookie } from '@utils/cookie';

import type { TLoginData, TRegisterData } from '@api';
import type { TUser } from '@utils-types';

export type TUserState = {
  user: TUser | null;
  isAuthChecked: boolean;
  isLoading: boolean;
  error: string | null;
};

const initialState: TUserState = {
  user: null,
  isAuthChecked: false,
  isLoading: false,
  error: null,
};

const saveTokens = (accessToken: string, refreshToken: string): void => {
  setCookie('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

const clearTokens = (): void => {
  deleteCookie('accessToken');
  localStorage.removeItem('refreshToken');
};

export const registerUser = createAsyncThunk<TUser, TRegisterData>(
  'user/register',
  async (data: TRegisterData): Promise<TUser> => {
    const res = await registerUserApi(data);
    saveTokens(res.accessToken, res.refreshToken);
    return res.user;
  }
);

export const loginUser = createAsyncThunk<TUser, TLoginData>(
  'user/login',
  async (data: TLoginData): Promise<TUser> => {
    const res = await loginUserApi(data);
    saveTokens(res.accessToken, res.refreshToken);
    return res.user;
  }
);

export const checkUserAuth = createAsyncThunk<TUser | null>(
  'user/checkAuth',
  async (): Promise<TUser | null> => {
    if (!localStorage.getItem('refreshToken')) {
      return null;
    }
    try {
      const res = await getUserApi();
      return res.user;
    } catch (err) {
      clearTokens();
      throw err;
    }
  }
);

export const updateUser = createAsyncThunk<TUser, Partial<TRegisterData>>(
  'user/update',
  async (data: Partial<TRegisterData>): Promise<TUser> => {
    const res = await updateUserApi(data);
    return res.user;
  }
);

export const logoutUser = createAsyncThunk<void, void>(
  'user/logout',
  async (): Promise<void> => {
    try {
      await logoutApi();
    } catch {
      /* Выход должен завершаться даже при ошибке сервера: токены удаляем локально. */
    } finally {
      clearTokens();
    }
  }
);

export const forgotPassword = createAsyncThunk<void, { email: string }>(
  'user/forgotPassword',
  async (data: { email: string }): Promise<void> => {
    await forgotPasswordApi(data);
  }
);

export const resetPassword = createAsyncThunk<void, { password: string; token: string }>(
  'user/resetPassword',
  async (data: { password: string; token: string }): Promise<void> => {
    await resetPasswordApi(data);
  }
);

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state): void => {
      state.error = null;
    },
  },
  selectors: {
    getUser: (state): TUser | null => state.user,
    getUserName: (state): string | undefined => state.user?.name,
    getIsAuthChecked: (state): boolean => state.isAuthChecked,
    getUserLoading: (state): boolean => state.isLoading,
    getUserError: (state): string | null => state.error,
  },
  extraReducers: (builder): void => {
    builder
      .addCase(checkUserAuth.fulfilled, (state, action): void => {
        state.isLoading = false;
        state.isAuthChecked = true;
        state.user = action.payload;
      })
      .addCase(checkUserAuth.rejected, (state): void => {
        state.isLoading = false;
        state.isAuthChecked = true;
        state.user = null;
      })
      .addCase(logoutUser.fulfilled, (state): void => {
        state.isLoading = false;
        state.error = null;
        state.user = null;
      })
      .addMatcher(
        isAnyOf(forgotPassword.fulfilled, resetPassword.fulfilled),
        (state): void => {
          state.isLoading = false;
          state.error = null;
        }
      )
      .addMatcher(
        isAnyOf(loginUser.fulfilled, registerUser.fulfilled, updateUser.fulfilled),
        (state, action): void => {
          state.isLoading = false;
          state.error = null;
          state.isAuthChecked = true;
          state.user = action.payload;
        }
      )
      .addMatcher(
        isAnyOf(
          checkUserAuth.pending,
          loginUser.pending,
          registerUser.pending,
          updateUser.pending,
          logoutUser.pending,
          forgotPassword.pending,
          resetPassword.pending
        ),
        (state): void => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        isAnyOf(
          loginUser.rejected,
          registerUser.rejected,
          updateUser.rejected,
          logoutUser.rejected,
          forgotPassword.rejected,
          resetPassword.rejected
        ),
        (state, action): void => {
          state.isLoading = false;
          state.error = action.error.message ?? 'Произошла ошибка';
        }
      );
  },
});

export const { clearUserError } = userSlice.actions;
export const { getUser, getUserName, getIsAuthChecked, getUserLoading, getUserError } =
  userSlice.selectors;
