import { Preloader } from '@ui';
import { Navigate, useLocation } from 'react-router-dom';

import { getIsAuthChecked, getUser } from '../../services/slices/user';
import { useSelector } from '../../services/store';

import type { Location } from 'react-router-dom';

type TProtectedRouteProps = {
  onlyUnAuth?: boolean;
  children: React.JSX.Element;
};

export const ProtectedRoute = ({
  onlyUnAuth = false,
  children,
}: TProtectedRouteProps): React.JSX.Element => {
  const isAuthChecked = useSelector(getIsAuthChecked);
  const user = useSelector(getUser);
  const location = useLocation();

  if (!isAuthChecked) {
    return <Preloader />;
  }

  if (onlyUnAuth && user) {
    const from = (location.state as { from?: Location } | null)?.from;
    return <Navigate replace to={from ?? { pathname: '/' }} />;
  }

  if (!onlyUnAuth && !user) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return children;
};
