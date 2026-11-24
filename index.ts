import { Platform } from 'react-native';

// Android home screen widgets run this handler even when the app is closed, so it is
// registered before the app itself starts.
if (Platform.OS === 'android') {
  const { registerWidgetTaskHandler } = require('react-native-android-widget');
  const { widgetTaskHandler } = require('./src/widgets/handler');
  registerWidgetTaskHandler(widgetTaskHandler);
}

require('expo-router/entry');
