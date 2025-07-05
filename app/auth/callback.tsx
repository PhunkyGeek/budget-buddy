import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/services/supabaseService';

export default function AuthCallbackScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Extract parameters from URL hash
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          // Set the session with Supabase
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Error setting session:', error.message);
            router.replace('/auth');
          } else {
            console.log('Session set successfully:', data.user);
            router.replace('/(tabs)');
          }
        } else {
          console.error('No access token or refresh token found in callback');
          router.replace('/auth');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        router.replace('/auth');
      }
    };

    processCallback();
  }, [router]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
    },
    text: {
      fontSize: 18,
      color: theme.text,
      marginTop: 16,
    },
  });

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.primary} />
      <Text style={styles.text}>Completing sign-in...</Text>
    </View>
  );
}