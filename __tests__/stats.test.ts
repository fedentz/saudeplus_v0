const { groupByMonth, calculateAverageSpeed, evaluateActivityStatus } = require('../utils/stats');

describe('groupByMonth', () => {
  it('aggregates activities by month', () => {
    const activities = [
      { date: new Date('2024-05-01'), distance: 5, duration: 30 },
      { date: new Date('2024-05-10'), distance: 3, duration: 20 },
      { date: new Date('2024-06-02'), distance: 10, duration: 60 },
    ];
    const result = groupByMonth(activities);
    expect(result).toEqual([
      {
        month: '05/2024',
        totalActivities: 2,
        totalDistance: 8,
        totalTime: 50,
      },
      {
        month: '06/2024',
        totalActivities: 1,
        totalDistance: 10,
        totalTime: 60,
      },
    ]);
  });
});

describe('calculateAverageSpeed', () => {
  it('computes km/h correctly', () => {
    const speed = calculateAverageSpeed(2, 1800); // 2 km in 30 min
    expect(speed).toBe(4);
  });
});

describe('evaluateActivityStatus', () => {
  it('marks activity valid if checks pass', () => {
    const res = evaluateActivityStatus(1, 600); // 1 km in 10 min -> 6 km/h
    expect(res).toEqual({ status: 'valida', velocidadPromedio: 6 });
  });

  it('detects vehicle usage by speed', () => {
    const res = evaluateActivityStatus(10, 1200); // 10 km in 20 min -> 30 km/h
    expect(res.status).toBe('invalida');
    expect(res.invalidReason).toBe('vehiculo');
  });
});
