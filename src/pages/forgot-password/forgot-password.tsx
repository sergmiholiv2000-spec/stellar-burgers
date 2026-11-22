import { ForgotPasswordUI } from '@ui-pages';
import { type SyntheticEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  clearUserError,
  forgotPassword,
  getUserError,
} from '../../services/slices/user';
import { useDispatch, useSelector } from '../../services/store';

export const ForgotPassword = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const error = useSelector(getUserError);

  const [email, setEmail] = useState('');

  useEffect(
    () => (): void => {
      dispatch(clearUserError());
    },
    [dispatch]
  );

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    void dispatch(forgotPassword({ email }))
      .unwrap()
      .then((): void => {
        localStorage.setItem('resetPassword', 'true');
        void navigate('/reset-password', { replace: true });
      })
      .catch((): void => undefined);
  };

  return (
    <ForgotPasswordUI
      errorText={error ?? undefined}
      email={email}
      setEmail={setEmail}
      handleSubmit={handleSubmit}
    />
  );
};
