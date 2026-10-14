/**
 * `expo-web-browser` mock'u (issue #288) — native köprü jest'te yoktur.
 * Varsayılan: kullanıcı oturumu iptal etti.
 */
module.exports = {
  openAuthSessionAsync: jest.fn(async () => ({ type: 'cancel' })),
  maybeCompleteAuthSession: jest.fn(() => ({ type: 'failed' })),
};
