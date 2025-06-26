import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { handleOAuthCallback } from '@/services/supabaseService';

export default function AuthCallbackScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Reconstruct the URL with all parameters
        const url = `${window.location.origin}${window.location.pathname}${window.location.search}${window.location.hash}`;
        
        await handleOAuthCallback(url);
        router.replace('/(tabs)');
      } catch (error) {
        console.error('OAuth callback error:', error);
        router.replace('/auth');
      }
    };

    processCallback();
  }, [params, router]);

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