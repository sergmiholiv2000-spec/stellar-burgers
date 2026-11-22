import { LoginUI } from '@ui-pages';
import { type SyntheticEvent, useEffect, useState } from 'react';

import { clearUserError, getUserError, loginUser } from '../../services/slices/user';
import { useDispatch, useSelector } from '../../services/store';

export const Login = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const error = useSelector(getUserError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(
    () => (): void => {
      dispatch(clearUserError());
    },
    [dispatch]
  );

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();
    void dispatch(loginUser({ email, password })).catch(() => undefined);
  };

  return (
    <LoginUI
      errorText={error ?? undefined}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
    />
  );
};
