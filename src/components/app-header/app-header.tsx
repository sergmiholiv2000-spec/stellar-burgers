import { AppHeaderUI } from '@ui';

import { getUserName } from '../../services/slices/user';
import { useSelector } from '../../services/store';

export const AppHeader = (): React.JSX.Element => {
  const userName = useSelector(getUserName);

  return <AppHeaderUI userName={userName} />;
};
