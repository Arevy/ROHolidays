import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { AppErrorBoundary } from '../../ui/components/AppErrorBoundary';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function UpcomingRoute() {
  const Screen = require('../../features/home/HomeScreen').default as React.ComponentType;
  return (
    <AppErrorBoundary scope="upcoming-route">
      <Screen />
    </AppErrorBoundary>
  );
}

function CalendarRoute() {
  const Screen = require('../../features/calendar/CalendarScreen').default as React.ComponentType;
  return (
    <AppErrorBoundary scope="calendar-route">
      <Screen />
    </AppErrorBoundary>
  );
}

function SettingsRoute() {
  const Screen = require('../../features/settings/SettingsScreen').default as React.ComponentType;
  return (
    <AppErrorBoundary scope="settings-route">
      <Screen />
    </AppErrorBoundary>
  );
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarLabelStyle: { fontSize: 12 },
        tabBarIconStyle: { marginBottom: -2 },
      }}
      initialRouteName="Calendar">
      <Tab.Screen
        name="Următoare"
        component={UpcomingRoute}
        options={{
          tabBarLabel: 'Următoare',
          tabBarIcon: () => <Text style={{ fontSize: 16 }}>⏭️</Text>,
          tabBarAccessibilityLabel: 'Upcoming events tab',
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarRoute}
        options={{
          tabBarIcon: () => <Text style={{ fontSize: 16 }}>📅</Text>,
          tabBarAccessibilityLabel: 'Calendar tab',
        }}
      />
      <Tab.Screen
        name="Setări"
        component={SettingsRoute}
        options={{
          tabBarIcon: () => <Text style={{ fontSize: 16 }}>⚙️</Text>,
          tabBarAccessibilityLabel: 'Settings tab',
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Root"
        component={Tabs}
        options={{
          headerTitle: () => <Text style={{ fontWeight: '600' }}>Sărbători RO + Calendar Ortodox</Text>,
        }}
      />
    </Stack.Navigator>
  );
}
