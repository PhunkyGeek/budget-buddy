import React from 'react';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function AccountLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.card,
          height: Platform.OS !== 'web' ? 100 : undefined,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: '700',
        },
        headerShadowVisible: false,
        contentStyle: {
          paddingTop: Platform.OS !== 'web' ? 10 : 0,
        },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="edit-profile" 
        options={{ title: 'Edit Profile' }} 
      />
      <Stack.Screen 
        name="preferences" 
        options={{ title: 'Preferences' }} 
      />
      <Stack.Screen 
        name="notifications" 
        options={{ title: 'Notifications' }} 
      />
      <Stack.Screen 
        name="privacy" 
        options={{ title: 'Privacy' }} 
      />
      <Stack.Screen 
        name="subscriptions" 
        options={{ title: 'Subscriptions' }} 
      />
      <Stack.Screen 
        name="help-support" 
        options={{ title: 'Help & Support' }} 
      />
      <Stack.Screen 
        name="feedback" 
        options={{ title: 'Feedback' }} 
      />
    </Stack>
  );
}