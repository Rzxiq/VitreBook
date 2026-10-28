import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { fetchRemoteMirrors } from './src/api/configService';
import { useSettingsStore } from './src/store/useSettingsStore';

const App = () => {
  const { setMirrors } = useSettingsStore();

  useEffect(() => {
    // Dynamic catalog mirror discovery on app startup
    fetchRemoteMirrors().then((remoteMirrors) => {
      if (remoteMirrors && remoteMirrors.length > 0) {
        setMirrors(remoteMirrors);
      }
    });
  }, [setMirrors]);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <AppNavigator />
    </SafeAreaProvider>
  );
};

export default App;
