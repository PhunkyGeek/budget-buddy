import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CircleCheck as CheckCircle, Circle as XCircle, ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function StripeCallbackScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [countdown, setCountdown] = useState(3);

  const sessionId = params.session_id as string;
  const status = params.status as string;

  const isSuccess = status === 'success' && sessionId;
  const isCancelled = status === 'cancelled';

  useEffect(() => {
    // Countdown timer to redirect back to budget-safe
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.replace('/(tabs)/budget-safe');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const getStatusContent = () => {
    if (isSuccess) {
      return {
        icon: <CheckCircle size={80} color={theme.success} />,
        title: 'Payment Successful!',
        message: 'Your funds have been added to your wallet successfully. You should see the updated balance shortly.',
        bgColor: theme.success + '20',
      };
    } else if (isCancelled) {
      return {
        icon: <XCircle size={80} color={theme.warning} />,
        title: 'Payment Cancelled',
        message: 'Your payment was cancelled. No charges were made to your account.',
        bgColor: theme.warning + '20',
      };
    } else {
      return {
        icon: <XCircle size={80} color={theme.error} />,
        title: 'Payment Error',
        message: 'There was an issue processing your payment. Please try again.',
        bgColor: theme.error + '20',
      };
    }
  };

  const statusContent = getStatusContent();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
      paddingTop: Platform.OS !== 'web' ? 60 : 20,
    },
    statusContainer: {
      backgroundColor: statusContent.bgColor,
      borderRadius: 24,
      padding: 32,
      alignItems: 'center',
      marginBottom: 32,
      width: '100%',
      maxWidth: 400,
    },
    iconContainer: {
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 16,
    },
    message: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 24,
    },
    sessionInfo: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      width: '100%',
      marginBottom: 24,
    },
    sessionLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    sessionId: {
      fontSize: 14,
      color: theme.text,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    redirectContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    redirectIcon: {
      marginRight: 12,
    },
    redirectText: {
      fontSize: 16,
      color: theme.text,
      flex: 1,
    },
    countdown: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.primary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: theme.textSecondary,
      marginTop: 16,
    },
  });

  // Show loading state briefly
  if (countdown === 3) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Processing payment result...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.statusContainer}>
          <View style={styles.iconContainer}>
            {statusContent.icon}
          </View>
          
          <Text style={styles.title}>{statusContent.title}</Text>
          <Text style={styles.message}>{statusContent.message}</Text>

          {sessionId && (
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionLabel}>Transaction ID</Text>
              <Text style={styles.sessionId}>{sessionId}</Text>
            </View>
          )}
        </View>

        <View style={styles.redirectContainer}>
          <View style={styles.redirectIcon}>
            <ArrowLeft size={20} color={theme.primary} />
          </View>
          <Text style={styles.redirectText}>
            Returning to Budget Safe in{' '}
            <Text style={styles.countdown}>{countdown}</Text> seconds
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}