import * as XLSX from 'xlsx';

/**
 * Format date nicely for report
 */
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Export a comprehensive Excel report for a single restaurant
 * Layout starts with:
 * Row 1: RENZA
 * Row 2: [Restaurant Name] - Performance & Operations Report
 */
export function exportRestaurantReport(restaurant, analytics = {}) {
  const wb = XLSX.utils.book_new();
  const customerBaseUrl = process.env.NEXT_PUBLIC_CUSTOMER_URL || 'https://renza-restaurant.vercel.app';
  const menuUrl = restaurant.customMenuUrl || `${customerBaseUrl}/menu/${restaurant.slug}`;
  const nowStr = formatDate(new Date());

  const allViews = analytics.allTime?.menuViews ?? analytics.totalMenuViews ?? 0;
  const allScans = analytics.allTime?.qrScans ?? analytics.totalScans ?? 0;
  const allDiners = analytics.allTime?.uniqueVisitors ?? 0;
  const todayViews = analytics.today?.menuViews ?? analytics.todayMenuViews ?? 0;
  const todayScans = analytics.today?.qrScans ?? analytics.todayScans ?? 0;
  const todayDiners = analytics.today?.uniqueVisitors ?? 0;

  const foodItems = restaurant.foodItems || [];
  const categories = restaurant.categories || [];
  const availableCount = foodItems.filter((f) => f.isAvailable).length;
  const unavailableCount = foodItems.filter((f) => !f.isAvailable).length;

  // ─────────────────────────────────────────────────────────────────────────────
  // SHEET 1: RENZA Executive Summary
  // ─────────────────────────────────────────────────────────────────────────────
  const summaryRows = [
    ['RENZA'],
    [`${restaurant.name} - Operations & Performance Report`],
    [`Generated On: ${nowStr} | Platform: RENZA Cloud Dining OS`],
    [],
    ['1. RESTAURANT PROFILE & CREDENTIALS', ''],
    ['Platform Brand', 'RENZA Restaurant OS'],
    ['Restaurant Name', restaurant.name || 'N/A'],
    ['Slug Identifier', restaurant.slug || 'N/A'],
    ['Live Digital Menu URL', menuUrl],
    ['Account Status', restaurant.status ? restaurant.status.toUpperCase() : 'ACTIVE'],
    ['Cuisine Specialty', restaurant.cuisineType || 'General Dining'],
    ['Contact Phone', restaurant.phone || 'N/A'],
    ['Physical Address', restaurant.address || 'N/A'],
    ['Google Maps Review URL', restaurant.googleReviewUrl || 'Auto-generated'],
    ['Primary Admin Name', restaurant.adminName || restaurant.adminUsers?.[0]?.name || 'N/A'],
    ['Primary Admin Email', restaurant.adminEmail || restaurant.adminUsers?.[0]?.email || 'N/A'],
    ['Registration Date', formatDate(restaurant.createdAt)],
    [],
    ['2. TRAFFIC & ANALYTICS PERFORMANCE', ''],
    ['Total Menu Views (All-time)', allViews],
    ['Total QR Code Scans (All-time)', allScans],
    ['Total Unique Diners (All-time)', allDiners],
    ["Today's Menu Views", todayViews],
    ["Today's QR Code Scans", todayScans],
    ["Today's Unique Diners", todayDiners],
    ['Total Menu Dishes', foodItems.length],
    ['Available Dishes in Stock', availableCount],
    ['Sold Out Dishes', unavailableCount],
    ['Total Categories Configured', categories.length],
    [],
    ['3. CATEGORIES SUMMARY', ''],
    ['S.No', 'Category Name', 'Sort Order', 'Dish Count'],
  ];

  categories.forEach((cat, idx) => {
    const dishCount =
      cat.foodItems?.length ??
      cat._count?.foodItems ??
      foodItems.filter((f) => f.categoryId === cat.id || f.category?.id === cat.id).length;

    summaryRows.push([idx + 1, cat.name, cat.sortOrder ?? idx + 1, dishCount]);
  });

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary['!cols'] = [{ wch: 32 }, { wch: 45 }, { wch: 15 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'RENZA Summary');

  // ─────────────────────────────────────────────────────────────────────────────
  // SHEET 2: Menu Dishes & Stock Inventory
  // ─────────────────────────────────────────────────────────────────────────────
  const dishHeaders = [
    'S.No',
    'Dish Name',
    'Category',
    'Price (INR)',
    'Type',
    'Spiciness',
    'Availability Status',
    'Dietary Tags',
    'Description',
    'Created At',
  ];

  const dishRows = [
    ['RENZA - MENU DISHES & STOCK INVENTORY'],
    [`Restaurant: ${restaurant.name} | Total Dishes: ${foodItems.length}`],
    [],
    dishHeaders,
  ];

  foodItems.forEach((dish, idx) => {
    const isVeg = dish.isVeg === true || dish.foodType === 'veg';
    const typeLabel = isVeg ? 'Pure Veg 🌱' : 'Non-Veg 🍗';
    const statusLabel = dish.isAvailable ? 'AVAILABLE' : 'SOLD OUT';

    const tags = [];
    if (dish.isVegan) tags.push('Vegan');
    if (dish.isJain) tags.push('Jain');
    if (dish.isGlutenFree) tags.push('Gluten-Free');
    if (dish.specialTags) tags.push(dish.specialTags);

    let spicyLabel = 'Mild';
    if (dish.spicyLevel === 2 || dish.spicyLevel === 'medium') spicyLabel = 'Medium 🌶🌶';
    else if (dish.spicyLevel >= 3 || dish.spicyLevel === 'hot') spicyLabel = 'Extra Spicy 🌶🌶🌶';

    dishRows.push([
      idx + 1,
      dish.name,
      dish.category?.name || dish.categoryName || 'Uncategorized',
      Number(dish.price) || 0,
      typeLabel,
      spicyLabel,
      statusLabel,
      tags.join(', ') || 'Standard',
      dish.description || '',
      formatDate(dish.createdAt),
    ]);
  });

  const wsDishes = XLSX.utils.aoa_to_sheet(dishRows);
  wsDishes['!cols'] = [
    { wch: 6 },
    { wch: 28 },
    { wch: 20 },
    { wch: 12 },
    { wch: 14 },
    { wch: 16 },
    { wch: 20 },
    { wch: 24 },
    { wch: 45 },
    { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, wsDishes, 'Menu & Stock');

  // Trigger browser download
  const safeName = (restaurant.name || 'Restaurant').replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateTag = new Date().toISOString().slice(0, 10);
  const fileName = `RENZA_${safeName}_Report_${dateTag}.xlsx`;

  XLSX.writeFile(wb, fileName);
}

/**
 * Export a master platform Excel report for ALL restaurants
 */
export function exportAllRestaurantsReport(restaurants) {
  const wb = XLSX.utils.book_new();
  const nowStr = formatDate(new Date());

  const headers = [
    'S.No',
    'Restaurant Name',
    'Slug',
    'Status',
    'Cuisine Specialty',
    'Contact Phone',
    'Address',
    'Admin Name',
    'Admin Email',
    'Total Dishes',
    'Total Categories',
    'Total Menu Views',
    'Total QR Scans',
    "Today's Menu Views",
    "Today's QR Scans",
    'Created Date',
  ];

  const rows = [
    ['RENZA'],
    ['PLATFORM-WIDE RESTAURANTS MASTER REPORT'],
    [`Generated On: ${nowStr} | Total Restaurants: ${restaurants.length}`],
    [],
    headers,
  ];

  restaurants.forEach((r, idx) => {
    rows.push([
      idx + 1,
      r.name,
      r.slug,
      r.status ? r.status.toUpperCase() : 'ACTIVE',
      r.cuisineType || 'General Dining',
      r.phone || 'N/A',
      r.address || 'N/A',
      r.adminName || r.adminUsers?.[0]?.name || 'N/A',
      r.adminEmail || r.adminUsers?.[0]?.email || 'N/A',
      r.foodItemCount ?? r.foodItemsCount ?? 0,
      r.categoryCount ?? 0,
      r.totalMenuViews ?? r.analytics?.allTime?.menuViews ?? 0,
      r.totalScans ?? r.analytics?.allTime?.qrScans ?? 0,
      r.todayMenuViews ?? r.analytics?.today?.menuViews ?? 0,
      r.todayScans ?? r.analytics?.today?.qrScans ?? 0,
      formatDate(r.createdAt),
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 25 },
    { wch: 18 },
    { wch: 12 },
    { wch: 20 },
    { wch: 16 },
    { wch: 30 },
    { wch: 20 },
    { wch: 26 },
    { wch: 14 },
    { wch: 16 },
    { wch: 18 },
    { wch: 16 },
    { wch: 18 },
    { wch: 16 },
    { wch: 20 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'RENZA Master Report');

  const dateTag = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `RENZA_All_Restaurants_Report_${dateTag}.xlsx`);
}
