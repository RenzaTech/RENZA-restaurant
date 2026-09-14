import { readFile } from 'node:fs/promises';
import process from 'node:process';

const API_URL = (process.env.API_URL || 'http://localhost:5000').replace(/\/$/, '');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const DATA_FILE = new URL('../data/anbude-cafe-menu.json', import.meta.url);

const summary = { created: 0, skipped: 0, failed: 0 };

function normalizeName(name) {
  return String(name || '').trim().toLowerCase();
}

function logResult(status, type, name, detail = '') {
  summary[status] += 1;
  console.log(`${status.padEnd(7)} ${type.padEnd(8)} ${name}${detail ? ` - ${detail}` : ''}`);
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  if (!response.ok) {
    const message = body?.error || body?.message || `${response.status} ${response.statusText}`;
    throw new Error(message);
  }
  return body;
}

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

function appendPresentFields(formData, fields) {
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null) formData.append(key, String(value));
  }
}

async function main() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required.');
  }

  const rawData = await readFile(DATA_FILE, 'utf8');
  const menu = JSON.parse(rawData);
  const categories = Array.isArray(menu.categories) ? menu.categories : [];
  if (!menu.restaurant || !Array.isArray(menu.categories)) {
    throw new Error('The menu JSON must contain restaurant and categories.');
  }

  const login = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  const token = login?.token;
  if (!token) throw new Error('Login succeeded without a JWT token.');
  console.log(`Authenticated as ${login.user?.email || ADMIN_EMAIL}`);

  const requestOptions = { headers: authHeaders(token) };
  const existingCategoryResponse = await request('/api/restaurant/categories', requestOptions);
  const existingFoodResponse = await request('/api/restaurant/foods', requestOptions);
  const existingCategories = Array.isArray(existingCategoryResponse)
    ? existingCategoryResponse
    : existingCategoryResponse?.categories || [];
  const existingFoods = Array.isArray(existingFoodResponse)
    ? existingFoodResponse
    : existingFoodResponse?.foods || [];

  const categoryIds = new Map(existingCategories.map((category) => [normalizeName(category.name), category.id || category._id]));
  const foodNames = new Set(existingFoods.map((food) => normalizeName(food.name)));

  for (const category of categories) {
    const name = category?.name;
    const key = normalizeName(name);
    if (!key) {
      logResult('failed', 'category', '(unnamed)', 'missing name');
      continue;
    }
    if (categoryIds.has(key)) {
      logResult('skipped', 'category', name, 'already exists');
      continue;
    }

    try {
      const created = await request('/api/restaurant/categories', {
        method: 'POST',
        headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          ...(category.sortOrder !== undefined && category.sortOrder !== null ? { sortOrder: category.sortOrder } : {}),
        }),
      });
      const categoryId = created?.id || created?._id || created?.category?.id || created?.category?._id;
      if (!categoryId) throw new Error('response did not include a category id');
      categoryIds.set(key, categoryId);
      logResult('created', 'category', name);
    } catch (error) {
      logResult('failed', 'category', name, error.message);
    }
  }

  for (const category of categories) {
    const categoryId = categoryIds.get(normalizeName(category?.name));
    const items = Array.isArray(category?.foodItems) ? category.foodItems : [];

    for (const item of items) {
      const name = item?.name;
      const key = normalizeName(name);
      if (!key) {
        logResult('failed', 'food', '(unnamed)', 'missing name');
        continue;
      }
      if (foodNames.has(key)) {
        logResult('skipped', 'food', name, 'already exists');
        continue;
      }
      if (!categoryId) {
        logResult('failed', 'food', name, `category "${category?.name || '(unnamed)'}" has no id`);
        continue;
      }

      try {
        const formData = new FormData();
        appendPresentFields(formData, {
          name: item.name,
          price: item.price,
          isVeg: item.isVeg,
          description: item.description,
          isAvailable: item.isAvailable,
          sortOrder: item.sortOrder,
          categoryId,
        });
        const created = await request('/api/restaurant/foods', {
          method: 'POST',
          headers: authHeaders(token),
          body: formData,
        });
        if (!created?.id && !created?._id && !created?.food?.id && !created?.food?._id) {
          throw new Error('response did not include a food id');
        }
        foodNames.add(key);
        logResult('created', 'food', name);
      } catch (error) {
        logResult('failed', 'food', name, error.message);
      }
    }
  }

  console.log('\nSeed summary');
  console.log(`created: ${summary.created}`);
  console.log(`skipped: ${summary.skipped}`);
  console.log(`failed:  ${summary.failed}`);
  if (summary.failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`Seed failed: ${error.message}`);
  console.log('\nSeed summary');
  console.log(`created: ${summary.created}`);
  console.log(`skipped: ${summary.skipped}`);
  console.log(`failed:  ${summary.failed + 1}`);
  process.exitCode = 1;
});
