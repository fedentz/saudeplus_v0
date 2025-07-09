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

function calculateAverageSpeed(distanceKm, durationSec) {
  if (!durationSec) return 0;
  return Number(((distanceKm / (durationSec / 3600)).toFixed(2)));
}

function evaluateActivityStatus(distanceKm, durationSec) {
  const velocidadPromedio = calculateAverageSpeed(distanceKm, durationSec);
  if (velocidadPromedio > 20) {
    return { status: 'invalida', invalidReason: 'vehiculo', velocidadPromedio };
  }
  if (durationSec < 300) {
    return { status: 'invalida', invalidReason: 'no_es_usuario', velocidadPromedio };
  }
  return { status: 'valida', velocidadPromedio };
}

module.exports = { groupByMonth, calculateAverageSpeed, evaluateActivityStatus };
