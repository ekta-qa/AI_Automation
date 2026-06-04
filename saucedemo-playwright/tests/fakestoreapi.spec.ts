import { test, expect, APIRequestContext } from '@playwright/test';

const API_BASE_URL = 'https://fakestoreapi.com';
const API_REQUEST_TIMEOUT = 60_000;

test.describe('Fake Store API Automation', () => {
  let request: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    request = await playwright.request.newContext({
      baseURL: API_BASE_URL,
      timeout: API_REQUEST_TIMEOUT,
      extraHTTPHeaders: {
        'Accept': 'application/json',
      },
    });
  });

  test.afterAll(async () => {
    await request.dispose();
  });

  test.describe('Positive Scenario: Auth/Login', () => {
    test('TC_1 Login with valid credentials returns 200 and valid token', async () => {
      const response = await request.post('/auth/login', {
        data: {
          username: 'mor_2314',
          password: '83r5^_',
        },
        timeout: API_REQUEST_TIMEOUT,
      });

      expect(response.ok()).toBeTruthy();
      // Assert HTTP status code is 2xx (201 Created or 200 OK)
      expect(response.status()).toBeGreaterThanOrEqual(200);
      expect(response.status()).toBeLessThan(300);

      // Parse and assert JSON response structure
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('token');
      expect(typeof responseBody.token).toBe('string');
      expect(responseBody.token.length).toBeGreaterThan(0);
      expect(responseBody.token).toBeTruthy();

      // Additional assertion for response headers
      expect(response.headers()['content-type']).toContain('application/json');
    });
  });

  test.describe('Negative Scenario: Product Search / Data Validation', () => {
    test('TC_2 Request non-existent product returns appropriate error handling', async () => {
      const response = await request.get('/products/99999');

      // Assert that status code is 2xx (API returns 200 for non-existent products)
      expect(response.status()).toBeGreaterThanOrEqual(200);
      expect(response.status()).toBeLessThan(300);

      // Parse response body - Fake Store API returns empty response for non-existent products
      const responseText = await response.text();
      
      // Verify response is empty (null/empty body)
      expect(responseText.trim()).toBe('');

      // Additional validation: ensure response body is not a valid product object
      if (responseText.trim()) {
        const responseBody = JSON.parse(responseText);
        expect(responseBody).not.toHaveProperty('id');
        expect(responseBody).not.toHaveProperty('title');
        expect(responseBody).not.toHaveProperty('price');
      }
    });
  });

  test.describe('Validation Scenario: Cart/Booking Checkout Schema Check', () => {
    test('TC_3 Post cart data with products validates response schema and auto-generated id', async () => {
      const cartPayload = {
        userId: 2,
        date: '2025-05-26',
        products: [
          {
            productId: 1,
            quantity: 3,
          },
          {
            productId: 5,
            quantity: 2,
          },
        ],
      };

      const response = await request.post('/carts', {
        data: cartPayload,
        timeout: API_REQUEST_TIMEOUT,
      });

      expect(response.ok()).toBeTruthy();
      // Assert HTTP status code is 2xx (201 Created or 200 OK)
      expect(response.status()).toBeGreaterThanOrEqual(200);
      expect(response.status()).toBeLessThan(300);

      // Parse and validate response structure
      const responseBody = await response.json();

      // Verify auto-generated id property exists and is a number
      expect(responseBody).toHaveProperty('id');
      expect(typeof responseBody.id).toBe('number');
      expect(responseBody.id).toBeGreaterThan(0);

      // Verify the sent data is mirrored in the response
      expect(responseBody).toHaveProperty('userId', cartPayload.userId);
      expect(responseBody).toHaveProperty('date', cartPayload.date);
      expect(responseBody).toHaveProperty('products');
      expect(Array.isArray(responseBody.products)).toBe(true);

      // Validate products array structure matches sent data
      expect(responseBody.products).toHaveLength(cartPayload.products.length);
      
      for (let i = 0; i < responseBody.products.length; i++) {
        expect(responseBody.products[i]).toEqual(cartPayload.products[i]);
        expect(responseBody.products[i]).toHaveProperty('productId');
        expect(responseBody.products[i]).toHaveProperty('quantity');
      }

      // Validate response headers
      expect(response.headers()['content-type']).toContain('application/json');
    });
  });
});
