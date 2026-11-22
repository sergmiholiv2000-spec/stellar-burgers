import { Preloader } from '@ui';
import { ResetPasswordUI } from '@ui-pages';
import { type SyntheticEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { clearUserError, getUserError, resetPassword } from '../../services/slices/user';
import { useDispatch, useSelector } from '../../services/store';

export const ResetPassword = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const error = useSelector(getUserError);

  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [canReset] = useState((): boolean =>
    Boolean(localStorage.getItem('resetPassword'))
  );

  useEffect(() => {
    if (!canReset) {
      void navigate('/forgot-password', { replace: true });
    }
  }, [canReset, navigate]);

  useEffect(
    () => (): void => {
      dispatch(clearUserError());
    },
    [dispatch]
  );

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    void dispatch(resetPassword({ password, token }))
      .unwrap()
      .then((): void => {
        localStorage.removeItem('resetPassword');
        void navigate('/login');
      })
      .catch((): void => undefined);
  };

  /* Пока не подтверждено, что пользователь пришёл со страницы восстановления,
     форму не показываем — иначе она успевает мигнуть перед редиректом. */
  if (!canReset) {
    return <Preloader />;
  }

  return (
    <ResetPasswordUI
      errorText={error ?? undefined}
      password={password}
      token={token}
      setPassword={setPassword}
      setToken={setToken}
      handleSubmit={handleSubmit}
    />
  );
};
