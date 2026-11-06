import { registerRootComponent } from 'expo';
import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

// Skia on web runs on CanvasKit, which has to finish loading before any code that
// uses Skia runs. That's why App is required here instead of imported at the top.
LoadSkiaWeb().then(() => {
  const App = require('./App').default;
  registerRootComponent(App);
});
