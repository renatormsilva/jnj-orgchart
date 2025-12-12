import { test, expect } from '@playwright/test';

const API_BASE_URL = 'http://localhost:3000/api/v1';

test.describe('API Endpoints', () => {
  test('GET /health should return healthy status', async ({ request }) => {
    const response = await request.get('http://localhost:3000/health');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe('healthy');
  });

  test('GET /api/v1/people should return paginated list', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/people`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBeTruthy();
    expect(body.pagination).toBeDefined();
    expect(body.pagination.page).toBeDefined();
    expect(body.pagination.limit).toBeDefined();
    expect(body.pagination.total).toBeDefined();
  });

  test('GET /api/v1/people should support pagination', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/people?page=1&limit=5`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.data.length).toBeLessThanOrEqual(5);
    expect(body.pagination.page).toBe(1);
    expect(body.pagination.limit).toBe(5);
  });

  test('GET /api/v1/people should support search', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/people?search=Manager`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.data).toBeDefined();
  });

  test('GET /api/v1/people/:id should return person details', async ({ request }) => {
    const listResponse = await request.get(`${API_BASE_URL}/people?limit=1`);
    const listBody = await listResponse.json();

    if (listBody.data.length > 0) {
      const personId = listBody.data[0].id;
      const response = await request.get(`${API_BASE_URL}/people/${personId}`);
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(personId);
      expect(body.data.name).toBeDefined();
      expect(body.data.jobTitle).toBeDefined();
      expect(body.data.department).toBeDefined();
    }
  });

  test('GET /api/v1/hierarchy should return hierarchy tree', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/hierarchy`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBeDefined();
    expect(body.data.name).toBeDefined();
    expect(body.data.children).toBeDefined();
    expect(Array.isArray(body.data.children)).toBeTruthy();
  });

  test('GET /api/v1/departments should return list of departments', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/departments`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBeTruthy();
  });

  test('GET /api/v1/managers should return list of managers', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/managers`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBeTruthy();
  });

  test('GET /api/v1/statistics should return organization statistics', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/statistics`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.totalPeople).toBeDefined();
    expect(body.data.totalEmployees).toBeDefined();
    expect(body.data.totalPartners).toBeDefined();
    expect(body.data.totalActive).toBeDefined();
    expect(body.data.totalInactive).toBeDefined();
  });

  test('GET /api/v1/people/:id should return 404 for non-existent person', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/people/999999`);
    expect(response.status()).toBe(404);
  });

  test('GET /api/v1/people/:id/management-chain should return chain', async ({ request }) => {
    const listResponse = await request.get(`${API_BASE_URL}/people?limit=1`);
    const listBody = await listResponse.json();

    if (listBody.data.length > 0) {
      const personId = listBody.data[0].id;
      const response = await request.get(`${API_BASE_URL}/people/${personId}/management-chain`);
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBeTruthy();
    }
  });
});
