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
import { CircleCheck as CheckCircle, Circle as XCircle, ArrowLeft, Crown } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function SubscriptionCallbackScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [countdown, setCountdown] = useState(3);

  const sessionId = params.session_id as string;
  const status = params.status as string;

  const isSuccess = status === 'success' && sessionId;
  const isCancelled = status === 'cancelled';

  useEffect(() => {
    // Countdown timer to redirect back to subscriptions
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.replace('/(tabs)/account/subscriptions');
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
        title: 'Welcome to Pro!',
        message: 'Your subscription has been activated successfully. You now have access to all Pro features including AI Budget Expert and Budget Safe.',
        bgColor: theme.success + '20',
      };
    } else if (isCancelled) {
      return {
        icon: <XCircle size={80} color={theme.warning} />,
        title: 'Subscription Cancelled',
        message: 'Your subscription was cancelled. No charges were made to your account.',
        bgColor: theme.warning + '20',
      };
    } else {
      return {
        icon: <XCircle size={80} color={theme.error} />,
        title: 'Subscription Error',
        message: 'There was an issue processing your subscription. Please try again.',
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
    proFeatures: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      width: '100%',
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.border,
    },
    featuresTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    featureIcon: {
      marginRight: 12,
    },
    featureText: {
      fontSize: 14,
      color: theme.text,
      flex: 1,
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
          <Text style={styles.loadingText}>Processing subscription result...</Text>
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
              <Text style={styles.sessionLabel}>Subscription ID</Text>
              <Text style={styles.sessionId}>{sessionId}</Text>
            </View>
          )}
        </View>

        {isSuccess && (
          <View style={styles.proFeatures}>
            <Text style={styles.featuresTitle}>🎉 Your Pro Features</Text>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Crown size={16} color={theme.secondary} />
              </View>
              <Text style={styles.featureText}>AI Budget Expert with personalized insights</Text>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <CheckCircle size={16} color={theme.success} />
              </View>
              <Text style={styles.featureText}>Budget Safe with secure savings goals</Text>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <CheckCircle size={16} color={theme.success} />
              </View>
              <Text style={styles.featureText}>Advanced analytics and forecasting</Text>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <CheckCircle size={16} color={theme.success} />
              </View>
              <Text style={styles.featureText}>Priority customer support</Text>
            </View>
          </View>
        )}

        <View style={styles.redirectContainer}>
          <View style={styles.redirectIcon}>
            <ArrowLeft size={20} color={theme.primary} />
          </View>
          <Text style={styles.redirectText}>
            Returning to Subscriptions in{' '}
            <Text style={styles.countdown}>{countdown}</Text> seconds
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}