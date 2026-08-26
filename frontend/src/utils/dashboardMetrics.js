/**
 * Utility functions for computing 100% real, truthful analytics and chart data
 * from raw database objects (orders, products, appointments, customers).
 */

// Helper to get past N days names/labels (e.g., ['Mon', 'Tue', 'Wed', ...])
export function getPastDays(daysCount = 7) {
  const days = [];
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      dateStr: d.toISOString().split('T')[0], // '2026-08-25'
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }), // 'Mon'
      fullLabel: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) // 'Aug 25'
    });
  }
  return days;
}

/**
 * Computes real 7-day revenue trend from actual orders.
 * If no orders on a day, revenue is RM 0.00.
 */
export function computeRealRevenueTrend(orders = [], daysCount = 7) {
  const days = getPastDays(daysCount);
  
  return days.map(day => {
    const dayTotal = orders
      .filter(o => {
        if (!o.order_date && !o.created_at && !o.date) return false;
        const oDateStr = (o.order_date || o.created_at || o.date).split('T')[0];
        return oDateStr === day.dateStr;
      })
      .reduce((sum, o) => sum + (Number(o.total_amount || o.total || o.service_price || 0)), 0);

    return {
      date: day.dayName,
      total: Number(dayTotal.toFixed(2)),
      fullDate: day.fullLabel
    };
  });
}

/**
 * Computes real 7-day appointment / order count trend.
 */
export function computeRealVolumeTrend(items = [], dateField = 'created_at', daysCount = 7) {
  const days = getPastDays(daysCount);
  
  return days.map(day => {
    const count = items.filter(item => {
      const val = item[dateField] || item.booking_date || item.appointment_date || item.order_date || item.date;
      if (!val) return false;
      return val.split('T')[0] === day.dateStr;
    }).length;

    return {
      label: day.dayName,
      value: count,
      fullDate: day.fullLabel
    };
  });
}

/**
 * Computes real sparkline data points (e.g. 7 points for the last 7 days).
 */
export function computeRealSparkline(trendData = [], valueKey = 'total') {
  if (!trendData || trendData.length === 0) return [0, 0, 0, 0, 0, 0, 0];
  return trendData.map(d => Number(d[valueKey] || 0));
}

/**
 * Computes real category or product breakdown from active catalog items.
 */
export function computeRealProductBreakdown(products = []) {
  if (!products || products.length === 0) {
    return [];
  }

  const categoryMap = {};
  products.forEach(p => {
    const cat = p.category_name || (p.category_id ? `Category #${p.category_id}` : 'General Catalog');
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });

  return Object.entries(categoryMap).map(([label, value]) => ({
    label,
    value
  }));
}

/**
 * Computes real service/appointment breakdown by service name.
 */
export function computeRealServiceBreakdown(appointments = []) {
  if (!appointments || appointments.length === 0) {
    return [];
  }

  const serviceMap = {};
  appointments.forEach(a => {
    const serviceName = a.service_name || 'Standard Service';
    serviceMap[serviceName] = (serviceMap[serviceName] || 0) + 1;
  });

  return Object.entries(serviceMap).map(([label, value]) => ({
    label,
    value
  }));
}
