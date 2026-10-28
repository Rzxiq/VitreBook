import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { SearchScreen } from '../screens/SearchScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { BookDetailScreen } from '../screens/BookDetailScreen';
import { PdfReaderScreen } from '../screens/PdfReaderScreen';
import { ScrapedBook } from '../types/book';

export type RootStackParamList = {
  MainTabs: undefined;
  BookDetail: { book: ScrapedBook };
  PdfReader: { md5: string; filePath: string; title: string };
};

export type BottomTabParamList = {
  SearchTab: undefined;
  LibraryTab: undefined;
  SettingsTab: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

const TabBarIcon = ({ label, focused }: { label: string; focused: boolean }) => {
  let icon = '🔍';
  if (label === 'Library') icon = '📚';
  if (label === 'Settings') icon = '⚙️';

  return <Text style={[styles.tabIcon, focused && styles.focusedTabIcon]}>{icon}</Text>;
};

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#E50914',
        tabBarInactiveTintColor: '#888888',
      }}
    >
      <Tab.Screen
        name="SearchTab"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: ({ focused }) => <TabBarIcon label="Explore" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="LibraryTab"
        component={LibraryScreen}
        options={{
          tabBarLabel: 'My Library',
          tabBarIcon: ({ focused }) => <TabBarIcon label="Library" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ focused }) => <TabBarIcon label="Settings" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#121212' },
        }}
      >
        <Stack.Screen name="MainTabs" component={BottomTabs} />
        <Stack.Screen
          name="BookDetail"
          component={BookDetailScreen}
          options={{
            headerShown: true,
            headerTitle: 'Book Details',
            headerStyle: { backgroundColor: '#1A1A1A' },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="PdfReader"
          component={PdfReaderScreen}
          options={{
            headerShown: false,
            orientation: 'all',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#181818',
    borderTopColor: '#252525',
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabIcon: {
    fontSize: 18,
    opacity: 0.6,
  },
  focusedTabIcon: {
    opacity: 1,
  },
});
