// expo-keep-awake native köprüsü jest'te yok: tablet ev ekranı panosu yalnız çağırır.
module.exports = {
    useKeepAwake: jest.fn(),
    activateKeepAwakeAsync: jest.fn(() => Promise.resolve()),
    deactivateKeepAwake: jest.fn(() => Promise.resolve()),
};
