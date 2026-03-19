import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../../features/home/HomeScreen';
import CalendarScreen from '../../features/calendar/CalendarScreen';
import SettingsScreen from '../../features/settings/SettingsScreen';
import { Text } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

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
        component={HomeScreen}
        options={{
          tabBarLabel: 'Următoare',
          tabBarIcon: () => <Text style={{ fontSize: 16 }}>⏭️</Text>,
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarIcon: () => <Text style={{ fontSize: 16 }}>📅</Text>,
        }}
      />
      <Tab.Screen
        name="Setări"
        component={SettingsScreen}
        options={{
          tabBarIcon: () => <Text style={{ fontSize: 16 }}>⚙️</Text>,
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
