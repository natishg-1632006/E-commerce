const orderClient = require('../clients/orderClient');
const productClient = require('../clients/productClient');
const categoryClient = require('../clients/categoryClient');
const inventoryClient = require('../clients/inventoryClient');
const couponClient = require('../clients/couponClient');
const paymentClient = require('../clients/paymentClient');

/**
 * Helper to derive date ranges from period query parameters
 * @param {string} period - The time period (today, yesterday, last7days, etc)
 * @param {string} [startDate] - Custom start date
 * @param {string} [endDate] - Custom end date
 * @returns {Object} Date objects for start and end bounds
 */
const getDateRange = (period, startDate, endDate) => {
  const now = new Date();
  let start = new Date();
  let end = new Date();

  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'yesterday':
      start.setDate(now.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(now.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      break;
    case 'last7days':
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    case 'last30days':
      start.setDate(now.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      break;
    case 'month':
      // Start of current month
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      // Start of current year
      start = new Date(now.getFullYear(), 0, 1);
      break;
    case 'custom':
      if (startDate) start = new Date(startDate);
      if (endDate) end = new Date(endDate);
      break;
    default:
      // Default to last 30 days
      start.setDate(now.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      break;
  }

  return { start, end };
};

/**
 * GET /analytics/dashboard
 * Aggregates summary KPIs from all microservices.
 */
const getDashboardData = async (token) => {
  const [ordersData, products, categories, inventory, coupons, payments] = await Promise.all([
    orderClient.getAllOrders(token, { limit: 5000 }).catch(() => ({ data: [] })),
    productClient.getAllProducts(token).catch(() => []),
    categoryClient.getAllCategories(token).catch(() => []),
    inventoryClient.getAllInventory(token).catch(() => []),
    couponClient.getAllCoupons(token).catch(() => []),
    paymentClient.getAllPayments(token).catch(() => []),
  ]);

  const orders = ordersData?.data || [];

  let completedOrders = 0;
  let pendingOrders = 0;
  let cancelledOrders = 0;
  let totalRevenue = 0;
  let paidCount = 0;

  orders.forEach((o) => {
    const status = String(o.orderStatus || '').toUpperCase();
    if (status === 'COMPLETED' || status === 'DELIVERED') {
      completedOrders++;
    } else if (status === 'CANCELLED' || status === 'PAYMENT_FAILED') {
      cancelledOrders++;
    } else {
      pendingOrders++;
    }

    if (o.paymentStatus === 'PAID') {
      totalRevenue += (o.totalAmount || 0);
      paidCount++;
    }
  });

  const lowStockCount = inventory.filter(
    (i) => (i.currentStock - i.reservedStock) <= (i.lowStockThreshold || 10)
  ).length;

  let currentStock = 0;
  let reservedStock = 0;
  inventory.forEach((i) => {
    currentStock += (i.currentStock || 0);
    reservedStock += (i.reservedStock || 0);
  });

  const paymentMethods = { UPI: 0, Card: 0, COD: 0, Wallet: 0 };
  if (payments && payments.length > 0) {
    payments.forEach((p) => {
      const method = String(p.paymentMethod || '').toUpperCase();
      if (method === 'UPI') paymentMethods.UPI++;
      else if (method === 'CARD' || method.includes('CREDIT') || method.includes('DEBIT')) paymentMethods.Card++;
      else if (method === 'COD') paymentMethods.COD++;
      else if (method === 'WALLET') paymentMethods.Wallet++;
    });
  } else {
    orders.forEach((o) => {
      const method = String(o.paymentMethod || '').toUpperCase();
      if (method === 'UPI') paymentMethods.UPI++;
      else if (method === 'CARD' || method.includes('CREDIT') || method.includes('DEBIT')) paymentMethods.Card++;
      else if (method === 'COD') paymentMethods.COD++;
      else if (method === 'WALLET') paymentMethods.Wallet++;
    });
  }

  const averageOrderValue = paidCount > 0 ? parseFloat((totalRevenue / paidCount).toFixed(2)) : 0;

  return {
    revenue: parseFloat(totalRevenue.toFixed(2)),
    orders: orders.length,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    products: products.length,
    categories: categories.length,
    lowStock: lowStockCount,
    coupons: coupons.length,
    averageOrderValue,
    inventorySummary: {
      totalCurrentStock: currentStock,
      totalReservedStock: reservedStock,
      lowStockItemsCount: lowStockCount,
    },
    paymentSummary: paymentMethods,
  };
};

/**
 * GET /analytics/revenue
 * Tracks revenue breakdown by time timeline.
 */
const getRevenueAnalytics = async (token, period, startDate, endDate) => {
  const { start, end } = getDateRange(period, startDate, endDate);

  const ordersData = await orderClient.getAllOrders(token, {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    limit: 5000,
  });

  const orders = ordersData?.data || [];
  const paidOrders = orders.filter((o) => o.paymentStatus === 'PAID');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const avgOrderValue = paidOrders.length > 0 ? parseFloat((totalRevenue / paidOrders.length).toFixed(2)) : 0;

  const timeline = {};
  paidOrders.forEach((o) => {
    const day = o.createdAt.split('T')[0];
    timeline[day] = (timeline[day] || 0) + (o.totalAmount || 0);
  });

  const formattedTimeline = Object.keys(timeline)
    .sort()
    .map((date) => ({ date, revenue: parseFloat(timeline[date].toFixed(2)) }));

  return {
    period: period || 'last30days',
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    orderCount: orders.length,
    paidOrderCount: paidOrders.length,
    averageOrderValue: avgOrderValue,
    timeline: formattedTimeline,
  };
};

/**
 * GET /analytics/orders
 * Generates status statistics and chronological trends.
 */
const getOrderAnalytics = async (token) => {
  const ordersData = await orderClient.getAllOrders(token, { limit: 5000 });
  const orders = ordersData?.data || [];

  let completed = 0;
  let pending = 0;
  let cancelled = 0;
  let revenue = 0;
  let paidCount = 0;

  const trend = {};

  orders.forEach((o) => {
    const status = String(o.orderStatus || '').toUpperCase();
    if (status === 'COMPLETED' || status === 'DELIVERED') {
      completed++;
    } else if (status === 'CANCELLED' || status === 'PAYMENT_FAILED') {
      cancelled++;
    } else {
      pending++;
    }

    if (o.paymentStatus === 'PAID') {
      revenue += (o.totalAmount || 0);
      paidCount++;
    }

    const day = o.createdAt.split('T')[0];
    if (!trend[day]) {
      trend[day] = { count: 0, revenue: 0 };
    }
    trend[day].count++;
    if (o.paymentStatus === 'PAID') {
      trend[day].revenue += (o.totalAmount || 0);
    }
  });

  const orderTrend = Object.keys(trend)
    .sort()
    .map((date) => ({
      date,
      count: trend[date].count,
      revenue: parseFloat(trend[date].revenue.toFixed(2)),
    }));

  const averageOrderValue = paidCount > 0 ? parseFloat((revenue / paidCount).toFixed(2)) : 0;

  return {
    totalOrders: orders.length,
    completed,
    pending,
    cancelled,
    revenue: parseFloat(revenue.toFixed(2)),
    averageOrderValue,
    orderTrend,
  };
};

/**
 * GET /analytics/products
 * Identifies top/least selling items and remaining warehouse inventory.
 */
const getProductAnalytics = async (token) => {
  const [ordersData, products, inventory] = await Promise.all([
    orderClient.getAllOrders(token, { limit: 5000 }),
    productClient.getAllProducts(token),
    inventoryClient.getAllInventory(token),
  ]);

  const orders = ordersData?.data || [];
  const inventoryMap = new Map(inventory.map((i) => [i.productId, i]));

  const productStats = {};

  orders
    .filter((o) => o.paymentStatus === 'PAID')
    .forEach((o) => {
      (o.items || []).forEach((item) => {
        if (!productStats[item.productId]) {
          productStats[item.productId] = {
            productId: item.productId,
            name: item.name,
            brand: item.brand,
            unitsSold: 0,
            revenue: 0,
          };
        }
        productStats[item.productId].unitsSold += (item.quantity || 0);
        productStats[item.productId].revenue += (item.subtotal || 0);
      });
    });

  const statsList = Object.values(productStats);

  const topSelling = [...statsList]
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 10);

  const soldProductIds = new Set(statsList.map((s) => s.productId));
  const unsoldProducts = products
    .filter((p) => !soldProductIds.has(p.productId))
    .map((p) => ({
      productId: p.productId,
      name: p.name,
      brand: p.brand,
      unitsSold: 0,
      revenue: 0,
    }));

  const leastSelling = [...statsList, ...unsoldProducts]
    .sort((a, b) => a.unitsSold - b.unitsSold)
    .slice(0, 10);

  const highestRevenue = [...statsList]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const inventoryRemaining = products.map((p) => {
    const inv = inventoryMap.get(p.productId);
    return {
      productId: p.productId,
      name: p.name,
      brand: p.brand,
      currentStock: inv ? inv.currentStock : 0,
      availableStock: inv ? inv.availableStock : 0,
      reservedStock: inv ? inv.reservedStock : 0,
      status: inv ? inv.status : 'Out Of Stock',
    };
  });

  return {
    topSellingProducts: topSelling,
    leastSellingProducts: leastSelling,
    highestRevenueProducts: highestRevenue,
    inventoryRemaining,
  };
};

/**
 * GET /analytics/categories
 * Groups sales and volumes category-wise.
 */
const getCategoryAnalytics = async (token) => {
  const [ordersData, categories] = await Promise.all([
    orderClient.getAllOrders(token, { limit: 5000 }),
    categoryClient.getAllCategories(token),
  ]);

  const orders = ordersData?.data || [];
  const categoryMap = new Map(categories.map((c) => [c.categoryId || c.id, c]));

  const categoryStats = {};

  orders
    .filter((o) => o.paymentStatus === 'PAID')
    .forEach((o) => {
      (o.items || []).forEach((item) => {
        const catId = item.categoryId;
        if (!catId) return;

        if (!categoryStats[catId]) {
          const category = categoryMap.get(catId);
          categoryStats[catId] = {
            categoryId: catId,
            categoryName: item.categoryName || category?.name || 'Unknown',
            revenue: 0,
            unitsSold: 0,
          };
        }
        categoryStats[catId].revenue += (item.subtotal || 0);
        categoryStats[catId].unitsSold += (item.quantity || 0);
      });
    });

  categories.forEach((c) => {
    const catId = c.categoryId || c.id;
    if (!categoryStats[catId]) {
      categoryStats[catId] = {
        categoryId: catId,
        categoryName: c.name,
        revenue: 0,
        unitsSold: 0,
      };
    }
  });

  const statsList = Object.values(categoryStats);

  const topCategories = [...statsList]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const leastSellingCategories = [...statsList]
    .sort((a, b) => a.unitsSold - b.unitsSold)
    .slice(0, 5);

  return {
    revenuePerCategory: statsList.map((s) => ({
      categoryId: s.categoryId,
      categoryName: s.categoryName,
      revenue: parseFloat(s.revenue.toFixed(2)),
    })),
    unitsSold: statsList.map((s) => ({
      categoryId: s.categoryId,
      categoryName: s.categoryName,
      unitsSold: s.unitsSold,
    })),
    topCategories,
    leastSellingCategories,
  };
};

/**
 * GET /analytics/coupons
 * Calculates coupon redemption rates and conversion metrics.
 */
const getCouponAnalytics = async (token) => {
  const [ordersData, coupons] = await Promise.all([
    orderClient.getAllOrders(token, { limit: 5000 }),
    couponClient.getAllCoupons(token),
  ]);

  const orders = ordersData?.data || [];

  const couponStats = {};
  let totalDiscountGiven = 0;
  let couponSuccess = 0;
  let couponFailure = 0;

  const couponOrders = orders.filter((o) => o.couponCode);

  couponOrders.forEach((o) => {
    const code = o.couponCode;
    const isPaid = o.paymentStatus === 'PAID';
    const isCancelled = o.orderStatus === 'CANCELLED' || o.orderStatus === 'PAYMENT_FAILED';

    if (isPaid) {
      couponSuccess++;
    } else if (isCancelled) {
      couponFailure++;
    }

    totalDiscountGiven += (o.discountAmount || 0);

    if (!couponStats[code]) {
      couponStats[code] = {
        couponCode: code,
        usageCount: 0,
        discountGiven: 0,
        successCount: 0,
        failureCount: 0,
      };
    }
    couponStats[code].usageCount++;
    couponStats[code].discountGiven += (o.discountAmount || 0);
    if (isPaid) couponStats[code].successCount++;
    if (isCancelled) couponStats[code].failureCount++;
  });

  coupons.forEach((c) => {
    if (!couponStats[c.code]) {
      couponStats[c.code] = {
        couponCode: c.code,
        usageCount: 0,
        discountGiven: 0,
        successCount: 0,
        failureCount: 0,
      };
    }
  });

  const statsList = Object.values(couponStats);

  const mostUsed = [...statsList]
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 5);

  return {
    mostUsedCoupon: mostUsed[0] || null,
    discountGiven: parseFloat(totalDiscountGiven.toFixed(2)),
    couponUsage: {
      ordersWithCoupons: couponOrders.length,
      ordersWithoutCoupons: orders.length - couponOrders.length,
      totalOrders: orders.length,
    },
    couponRedemption: statsList.map((s) => ({
      couponCode: s.couponCode,
      usageCount: s.usageCount,
      discountGiven: parseFloat(s.discountGiven.toFixed(2)),
    })),
    couponSuccess,
    couponFailure,
  };
};

/**
 * GET /analytics/inventory
 * Summarizes current stock, reservations, and low stock statuses.
 */
const getInventoryAnalytics = async (token) => {
  const inventory = await inventoryClient.getAllInventory(token);

  let currentStock = 0;
  let reservedStock = 0;
  let soldStock = 0;
  let lowStock = 0;
  let outOfStock = 0;

  inventory.forEach((i) => {
    currentStock += (i.currentStock || 0);
    reservedStock += (i.reservedStock || 0);
    soldStock += (i.soldQuantity || 0);

    const available = i.currentStock - i.reservedStock;
    if (available <= 0) {
      outOfStock++;
    } else if (available <= (i.lowStockThreshold || 10)) {
      lowStock++;
    }
  });

  return {
    currentStock,
    reservedStock,
    soldStock,
    lowStock,
    outOfStock,
  };
};

/**
 * GET /analytics/payments
 * Computes split payment methods count & totals, along with transaction statuses.
 */
const getPaymentAnalytics = async (token) => {
  let payments = [];
  try {
    payments = await paymentClient.getAllPayments(token);
  } catch (err) {
    console.warn('[Payment Analytics] Could not fetch from Payment Service, falling back to Order Service:', err.message);
  }

  let upiCount = 0;
  let upiAmount = 0;
  let cardCount = 0;
  let cardAmount = 0;
  let codCount = 0;
  let codAmount = 0;
  let walletCount = 0;
  let walletAmount = 0;

  let successCount = 0;
  let failedCount = 0;
  let pendingCount = 0;

  if (payments && payments.length > 0) {
    payments.forEach((p) => {
      const method = String(p.paymentMethod || '').toUpperCase();
      const status = String(p.status || '').toUpperCase();
      const amount = Number(p.amount || 0);

      if (method === 'UPI') {
        upiCount++;
        upiAmount += amount;
      } else if (method === 'CARD' || method.includes('CREDIT') || method.includes('DEBIT')) {
        cardCount++;
        cardAmount += amount;
      } else if (method === 'COD') {
        codCount++;
        codAmount += amount;
      } else if (method === 'WALLET') {
        walletCount++;
        walletAmount += amount;
      }

      if (status === 'PAID' || status === 'SUCCESS') {
        successCount++;
      } else if (status === 'FAILED') {
        failedCount++;
      } else if (status === 'PENDING') {
        pendingCount++;
      }
    });
  } else {
    // Fallback: derive payment statistics directly from orders
    const ordersData = await orderClient.getAllOrders(token, { limit: 5000 });
    const orders = ordersData?.data || [];

    orders.forEach((o) => {
      const method = String(o.paymentMethod || '').toUpperCase();
      const status = String(o.paymentStatus || '').toUpperCase();
      const amount = Number(o.totalAmount || 0);

      if (method === 'UPI') {
        upiCount++;
        upiAmount += amount;
      } else if (method === 'CARD' || method.includes('CREDIT') || method.includes('DEBIT')) {
        cardCount++;
        cardAmount += amount;
      } else if (method === 'COD') {
        codCount++;
        codAmount += amount;
      } else if (method === 'WALLET') {
        walletCount++;
        walletAmount += amount;
      }

      if (status === 'PAID' || status === 'SUCCESS') {
        successCount++;
      } else if (status === 'FAILED') {
        failedCount++;
      } else if (status === 'PENDING') {
        pendingCount++;
      }
    });
  }

  return {
    paymentMethods: {
      UPI: { count: upiCount, amount: parseFloat(upiAmount.toFixed(2)) },
      Card: { count: cardCount, amount: parseFloat(cardAmount.toFixed(2)) },
      COD: { count: codCount, amount: parseFloat(codAmount.toFixed(2)) },
      Wallet: { count: walletCount, amount: parseFloat(walletAmount.toFixed(2)) },
    },
    paymentSuccess: successCount,
    paymentFailed: failedCount,
    paymentPending: pendingCount,
  };
};

/**
 * GET /analytics/health
 * Checks health of all downstream microservices and computes latency metrics.
 */
const getHealthStatus = async () => {
  const startTime = Date.now();

  const checkServices = [
    { name: 'Order Service', fn: orderClient.checkHealth },
    { name: 'Product Service', fn: productClient.checkHealth },
    { name: 'Category Service', fn: categoryClient.checkHealth },
    { name: 'Inventory Service', fn: inventoryClient.checkHealth },
    { name: 'Payment Service', fn: paymentClient.checkHealth },
    { name: 'Coupon Service', fn: couponClient.checkHealth },
  ];

  const results = await Promise.all(
    checkServices.map(async (s) => {
      const res = await s.fn();
      return { service: s.name, ...res };
    })
  );

  const allHealthy = results.every((r) => r.status === 'Healthy');

  return {
    status: allHealthy ? 'Healthy' : 'Degraded',
    connectedServices: results,
    responseTimeMs: Date.now() - startTime,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  };
};

module.exports = {
  getDashboardData,
  getRevenueAnalytics,
  getOrderAnalytics,
  getProductAnalytics,
  getCategoryAnalytics,
  getCouponAnalytics,
  getInventoryAnalytics,
  getPaymentAnalytics,
  getHealthStatus,
};
