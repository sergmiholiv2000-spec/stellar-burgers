import { RegisterUI } from '@ui-pages';
import { type SyntheticEvent, useEffect, useState } from 'react';

import { clearUserError, getUserError, registerUser } from '../../services/slices/user';
import { useDispatch, useSelector } from '../../services/store';

export const Register = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const error = useSelector(getUserError);

  const [userName, setUserName] = useState('');
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
    void dispatch(registerUser({ name: userName, email, password })).catch(
      () => undefined
    );
  };

  return (
    <RegisterUI
      errorText={error ?? undefined}
      email={email}
      userName={userName}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}
      setUserName={setUserName}
      handleSubmit={handleSubmit}
    />
  );
};
