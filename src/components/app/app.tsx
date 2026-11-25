import {
  AppHeader,
  IngredientDetails,
  Modal,
  OrderInfo,
  ProtectedRoute,
} from '@components';
import {
  ConstructorPage,
  Feed,
  ForgotPassword,
  Login,
  NotFound404,
  Profile,
  ProfileOrders,
  Register,
  ResetPassword,
} from '@pages';
import { clsx } from 'clsx';
import { useEffect, useRef } from 'react';
import { Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';

import { fetchIngredients } from '../../services/slices/ingredients';
import { checkUserAuth } from '../../services/slices/user';
import { useDispatch } from '../../services/store';

import type { DetailPageProps } from './type';
import type { Location } from 'react-router-dom';

import '../../index.css';

import styles from './app.module.css';

const App = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const isInitialized = useRef(false);

  /* Ингредиенты нужны всем экранам, а проверка токена — защищённым маршрутам,
     поэтому оба запроса уходят один раз при старте приложения. */
  useEffect(() => {
    if (isInitialized.current) return;

    isInitialized.current = true;
    void dispatch(fetchIngredients()).catch(() => undefined);
    void dispatch(checkUserAuth()).catch(() => undefined);
  }, [dispatch]);

  return (
    <div className={styles.app}>
      <AppHeader />
      <RouteComponent />
    </div>
  );
};

export default App;

/* Обёртка для прямого перехода на /ingredients/:id, /feed/:number и
   /profile/orders/:number: в модальном окне заголовок рисует ModalUI, а на
   отдельной странице его нужно вывести самостоятельно. */
const DetailPage = ({ title, children }: DetailPageProps): React.JSX.Element => (
  <div className={styles.detailPageWrap}>
    <h3 className={clsx(styles.detailHeader, 'text', 'text_type_main-large')}>
      {title}
    </h3>
    {children}
  </div>
);

const formatOrderNumber = (number: string | undefined): string =>
  number ? `#${number.padStart(6, '0')}` : '';

const OrderPage = (): React.JSX.Element => {
  const { number } = useParams<{ number: string }>();

  return (
    <DetailPage title={formatOrderNumber(number)}>
      <OrderInfo />
    </DetailPage>
  );
};

const OrderModal = ({ onClose }: { onClose: () => void }): React.JSX.Element => {
  const { number } = useParams<{ number: string }>();

  return (
    <Modal title={formatOrderNumber(number)} onClose={onClose}>
      <OrderInfo />
    </Modal>
  );
};

const RouteComponent = (): React.JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();

  /* Ссылки на ингредиент и заказ кладут в состояние перехода адрес страницы,
     с которой пришёл пользователь. Он есть — показываем модальное окно поверх
     этой страницы, нет (прямая ссылка или перезагрузка) — отдельную страницу. */
  const background = (location.state as { background?: Location } | null)?.background;

  const handleModalClose = (): void => {
    void navigate(-1);
  };

  return (
    <>
      <Routes location={background ?? location}>
        <Route path="/" element={<ConstructorPage />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/feed/:number" element={<OrderPage />} />
        <Route
          path="/ingredients/:id"
          element={
            <DetailPage title="Детали ингредиента">
              <IngredientDetails />
            </DetailPage>
          }
        />

        <Route
          path="/login"
          element={
            <ProtectedRoute onlyUnAuth>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute onlyUnAuth>
              <Register />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <ProtectedRoute onlyUnAuth>
              <ForgotPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <ProtectedRoute onlyUnAuth>
              <ResetPassword />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/orders"
          element={
            <ProtectedRoute>
              <ProfileOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/orders/:number"
          element={
            <ProtectedRoute>
              <OrderPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound404 />} />
      </Routes>

      {background && (
        <Routes>
          <Route
            path="/feed/:number"
            element={<OrderModal onClose={handleModalClose} />}
          />
          <Route
            path="/ingredients/:id"
            element={
              <Modal title="Детали ингредиента" onClose={handleModalClose}>
                <IngredientDetails />
              </Modal>
            }
          />
          <Route
            path="/profile/orders/:number"
            element={
              <ProtectedRoute>
                <OrderModal onClose={handleModalClose} />
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </>
  );
};
