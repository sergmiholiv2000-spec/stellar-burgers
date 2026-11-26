import { expect, test } from '@playwright/test';

import type { Locator, Page } from '@playwright/test';

const INGREDIENTS_HAR = 'tests/hars/ingredients.har';
const USER_HAR = 'tests/hars/user.har';
const ORDER_HAR = 'tests/hars/order.har';

const BUN_NAME = 'Краторная булка N-200i';
const BUN_CALORIES = 420;
const MAIN_NAME = 'Биокотлета из марсианской Магнолии';
const MAIN_CALORIES = 4242;

const MOCK_ACCESS_TOKEN = 'Bearer mock-access-token';
const MOCK_REFRESH_TOKEN = 'mock-refresh-token';
const MOCK_ORDER_NUMBER = 987654;

const mockAuthTokens = async (page: Page): Promise<void> => {
  await page.addInitScript((refreshToken: string): void => {
    window.localStorage.setItem('refreshToken', refreshToken);
  }, MOCK_REFRESH_TOKEN);

  await page.context().addCookies([
    {
      name: 'accessToken',
      value: MOCK_ACCESS_TOKEN,
      url: 'http://localhost:4000',
    },
  ]);
};

const constructorSection = (page: Page): Locator =>
  page.locator('section').filter({
    has: page.getByRole('button', { name: 'Оформить заказ' }),
  });

const ingredientCard = (page: Page, name: string): Locator =>
  page.getByRole('listitem').filter({ hasText: name }).first();

const addIngredient = async (page: Page, name: string): Promise<void> => {
  await ingredientCard(page, name).getByRole('button', { name: 'Добавить' }).click();
};

const openIngredientModal = async (
  page: Page,
  name: string,
  calories: number
): Promise<void> => {
  await ingredientCard(page, name).getByRole('link').click();

  const modal = page.locator('#modals');

  await expect(modal.getByRole('heading', { name: 'Детали ингредиента' })).toBeVisible();
  await expect(modal.getByText(name, { exact: true })).toBeVisible();
  await expect(modal.getByText(String(calories), { exact: true })).toBeVisible();
};

test.beforeEach(async ({ page }) => {
  await mockAuthTokens(page);

  /* Все запросы к бэкенду подменяются данными из HAR-файлов. */
  await page.routeFromHAR(INGREDIENTS_HAR, {
    url: '**/api/ingredients',
    notFound: 'abort',
  });
  await page.routeFromHAR(USER_HAR, {
    url: '**/api/auth/user',
    notFound: 'abort',
  });
  await page.routeFromHAR(ORDER_HAR, {
    url: '**/api/orders',
    notFound: 'abort',
  });

  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Соберите бургер' })).toBeVisible();
});

test.describe('страница конструктора бургера', () => {
  test('добавляет булку и начинку в конструктор', async ({ page }) => {
    const constructor = constructorSection(page);

    await expect(constructor.getByText('Выберите булки')).toHaveCount(2);
    await expect(constructor.getByText('Выберите начинку')).toBeVisible();

    await addIngredient(page, BUN_NAME);
    await addIngredient(page, MAIN_NAME);

    await expect(constructor.getByText(`${BUN_NAME} (верх)`)).toBeVisible();
    await expect(constructor.getByText(`${BUN_NAME} (низ)`)).toBeVisible();
    await expect(constructor.getByText(MAIN_NAME, { exact: true })).toBeVisible();
  });

  test('открывает модальное окно с данными выбранного ингредиента', async ({ page }) => {
    await openIngredientModal(page, MAIN_NAME, MAIN_CALORIES);

    await expect(page.locator('#modals').getByText(BUN_NAME)).toHaveCount(0);
  });

  test('закрывает модальное окно ингредиента по крестику', async ({ page }) => {
    await openIngredientModal(page, BUN_NAME, BUN_CALORIES);

    await page.locator('#modals button').click();

    await expect(page.locator('#modals > div')).toHaveCount(0);
  });

  test('закрывает модальное окно ингредиента по клику на оверлей', async ({ page }) => {
    await openIngredientModal(page, BUN_NAME, BUN_CALORIES);

    await page
      .locator('#modals div[class*="overlay"]')
      .click({ position: { x: 5, y: 5 } });

    await expect(page.locator('#modals > div')).toHaveCount(0);
  });

  test('создаёт заказ и очищает конструктор после закрытия модального окна', async ({
    page,
  }) => {
    const constructor = constructorSection(page);

    await addIngredient(page, BUN_NAME);
    await addIngredient(page, MAIN_NAME);

    const orderRequestPromise = page.waitForRequest(
      (request) => request.url().endsWith('/api/orders') && request.method() === 'POST'
    );

    await page.getByRole('button', { name: 'Оформить заказ' }).click();

    const orderRequest = await orderRequestPromise;
    expect(orderRequest.headers().authorization).toBe(MOCK_ACCESS_TOKEN);

    await expect(
      page.locator('#modals').getByRole('heading', {
        name: String(MOCK_ORDER_NUMBER),
      })
    ).toBeVisible();

    await expect(constructor.getByText('Выберите булки')).toHaveCount(2);
    await expect(constructor.getByText('Выберите начинку')).toBeVisible();

    await page.locator('#modals button').click();

    await expect(page.locator('#modals > div')).toHaveCount(0);
    await expect(constructor.getByText('Выберите булки')).toHaveCount(2);
    await expect(constructor.getByText('Выберите начинку')).toBeVisible();
  });
});
