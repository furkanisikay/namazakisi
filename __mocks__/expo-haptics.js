/**
 * expo-haptics jest mock — native EventEmitter'a dokunur; import eden (ya da `core/feedback`
 * üzerinden DOLAYLI yükleyen) suite hiç çalışmadan patlardı (AGENTS.md requireNativeModule
 * tuzağı). Fonksiyonlar çözülen jest.fn'dir; enum'lar gerçek değerleriyle.
 */
const ImpactFeedbackStyle = { Light: 'light', Medium: 'medium', Heavy: 'heavy', Soft: 'soft', Rigid: 'rigid' };
const NotificationFeedbackType = { Success: 'success', Warning: 'warning', Error: 'error' };
const AndroidHaptics = { Confirm: 'confirm', Reject: 'reject', Context_Click: 'context-click' };

module.exports = {
  ImpactFeedbackStyle,
  NotificationFeedbackType,
  AndroidHaptics,
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  performAndroidHapticsAsync: jest.fn(() => Promise.resolve()),
};
