import { ProfileUI } from '@ui-pages';
import { type SyntheticEvent, useEffect, useState } from 'react';

import {
  clearUserError,
  getUser,
  getUserError,
  updateUser,
} from '../../services/slices/user';
import { useDispatch, useSelector } from '../../services/store';

import type { TRegisterData } from '@api';

export const Profile = (): React.JSX.Element => {
  const dispatch = useDispatch();

  const user = useSelector(getUser);
  const updateError = useSelector(getUserError);

  const [formValue, setFormValue] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    password: '',
  });

  useEffect(() => {
    setFormValue({
      name: user?.name ?? '',
      email: user?.email ?? '',
      password: '',
    });
  }, [user]);

  useEffect(
    () => (): void => {
      dispatch(clearUserError());
    },
    [dispatch]
  );

  const isFormChanged =
    formValue.name !== (user?.name ?? '') ||
    formValue.email !== (user?.email ?? '') ||
    !!formValue.password;

  const saveUser = async (data: Partial<TRegisterData>): Promise<void> => {
    try {
      await dispatch(updateUser(data)).unwrap();
      setFormValue((prevState) => ({ ...prevState, password: '' }));
    } catch {
      /* Текст ошибки уже записан в store и выводится под формой. */
    }
  };

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    if (!user) return;

    const data: Partial<TRegisterData> = {};

    if (formValue.name !== user.name) data.name = formValue.name;
    if (formValue.email !== user.email) data.email = formValue.email;
    if (formValue.password) data.password = formValue.password;

    if (!Object.keys(data).length) return;

    void saveUser(data);
  };

  const handleCancel = (e: SyntheticEvent): void => {
    e.preventDefault();
    setFormValue({
      name: user?.name ?? '',
      email: user?.email ?? '',
      password: '',
    });
    dispatch(clearUserError());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormValue((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <ProfileUI
      formValue={formValue}
      isFormChanged={isFormChanged}
      updateUserError={updateError ?? undefined}
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      handleInputChange={handleInputChange}
    />
  );
};
