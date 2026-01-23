import './global.css';
import { registerRootComponent } from 'expo';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

// Reanimated strict mode uyarilarini kapat (3. parti kutuphaneler nedeniyle)
configureReanimatedLogger({
    level: ReanimatedLogLevel.warn,
    strict: false,
});

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
