const { groupByMonth } = require('../utils/stats');

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
