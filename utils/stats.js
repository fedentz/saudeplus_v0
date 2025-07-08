function groupByMonth(activities) {
  const map = new Map();
  activities.forEach((a) => {
    const key = `${String(a.date.getMonth() + 1).padStart(2, '0')}/${a.date.getFullYear()}`;
    const entry = map.get(key) || { count: 0, dist: 0, time: 0 };
    entry.count += 1;
    entry.dist += a.distance;
    entry.time += a.duration;
    map.set(key, entry);
  });
  return Array.from(map.entries()).map(([month, stats]) => ({
    month,
    totalActivities: stats.count,
    totalDistance: Number(stats.dist.toFixed(2)),
    totalTime: stats.time,
  }));
}

module.exports = { groupByMonth };
