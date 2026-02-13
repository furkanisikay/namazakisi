
module.exports = {
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  getPresentedNotificationsAsync: jest.fn().mockResolvedValue([]),
  dismissNotificationAsync: jest.fn(),
  dismissAllNotificationsAsync: jest.fn(),
  getLastNotificationResponseAsync: jest.fn().mockResolvedValue(null),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  setNotificationCategoryAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  removeNotificationSubscription: jest.fn(),
  AndroidImportance: {
    DEFAULT: 3,
    HIGH: 4,
    MAX: 5,
  },
  AndroidNotificationPriority: {
    DEFAULT: 'default',
    HIGH: 'high',
    MAX: 'max',
  },
  SchedulableTriggerInputTypes: {
    DATE: 'date',
    DAILY: 'daily',
  }
};
