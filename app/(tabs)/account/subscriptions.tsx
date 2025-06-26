import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Crown, Clock as Unlock, Check, Zap, Shield, TrendingUp, RotateCcw } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { revenueCatService } from '@/services/revenueCatService';

export default function SubscriptionsScreen() {
  const { theme } = useTheme();
  const { profile } = useAuth();

  const handleUnlockPro = async () => {
    try {
      await revenueCatService.openPaywall();
    } catch (error) {
      console.error('Error opening paywall:', error);
    }
  };

  const handleManageSubscription = async () => {
    try {
      await revenueCatService.openPaywall();
    } catch (error) {
      console.error('Error opening subscription management:', error);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      await revenueCatService.restorePurchases();
    } catch (error) {
      console.error('Error restoring purchases:', error);
    }
  };

  const proFeatures = [
    {
      icon: Zap,
      title: 'AI Budget Expert',
      description: 'Get personalized budget insights and recommendations',
    },
    {
      icon: Shield,
      title: 'Budget Safe',
      description: 'Secure savings goals and automated transfers',
    },
    {
      icon: TrendingUp,
      title: 'Advanced Analytics',
      description: 'Detailed spending patterns and forecasting',
    },
    {
      icon: Crown,
      title: 'Priority Support',
      description: 'Get help faster with priority customer support',
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    currentPlanSection: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
      borderWidth: 2,
      borderColor: profile?.subscription_status === 'pro' ? theme.secondary : theme.border,
      alignItems: 'center',
    },
    planIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: profile?.subscription_status === 'pro' ? theme.secondary : theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    planTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 8,
    },
    planStatus: {
      fontSize: 16,
      color: theme.textSecondary,
      marginBottom: 16,
    },
    planPrice: {
      fontSize: 32,
      fontWeight: '700',
      color: theme.primary,
      marginBottom: 8,
    },
    planPeriod: {
      fontSize: 16,
      color: theme.textSecondary,
    },
    featuresSection: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.border,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 16,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    featureItemLast: {
      borderBottomWidth: 0,
    },
    featureIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    featureContent: {
      flex: 1,
    },
    featureTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    featureDescription: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 18,
    },
    featureCheck: {
      marginLeft: 8,
    },
    actionButton: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginBottom: 12,
    },
    actionButtonPro: {
      backgroundColor: theme.secondary,
    },
    actionButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '700',
    },
    manageButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.border,
    },
    manageButtonText: {
      color: theme.text,
    },
    restoreButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.primary,
    },
    restoreButtonText: {
      color: theme.primary,
    },
    infoText: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
      fontStyle: 'italic',
      marginTop: 16,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.currentPlanSection}>
          <View style={styles.planIcon}>
            <Crown size={40} color="#ffffff" />
          </View>
          
          <Text style={styles.planTitle}>
            {profile?.subscription_status === 'pro' ? 'Pro Plan' : 'Free Plan'}
          </Text>
          
          <Text style={styles.planStatus}>
            {profile?.subscription_status === 'pro' 
              ? 'You have access to all Pro features' 
              : 'Basic budgeting features'
            }
          </Text>

          {profile?.subscription_status === 'pro' ? (
            <View>
              <Text style={styles.planPrice}>$9.99</Text>
              <Text style={styles.planPeriod}>per month</Text>
            </View>
          ) : (
            <View>
              <Text style={styles.planPrice}>$0</Text>
              <Text style={styles.planPeriod}>forever</Text>
            </View>
          )}
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>
            {profile?.subscription_status === 'pro' ? 'Your Pro Features' : 'Unlock Pro Features'}
          </Text>
          
          {proFeatures.map((feature, index) => (
            <View 
              key={index} 
              style={[
                styles.featureItem, 
                index === proFeatures.length - 1 && styles.featureItemLast
              ]}
            >
              <View style={styles.featureIcon}>
                <feature.icon size={20} color={theme.primary} />
              </View>
              
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>

              {profile?.subscription_status === 'pro' && (
                <View style={styles.featureCheck}>
                  <Check size={20} color={theme.success} />
                </View>
              )}
            </View>
          ))}
        </View>

        {profile?.subscription_status === 'pro' ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.manageButton]}
            onPress={handleManageSubscription}
          >
            <Text style={[styles.actionButtonText, styles.manageButtonText]}>
              Manage Subscription
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonPro]}
            onPress={handleUnlockPro}
          >
            <Unlock size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>Upgrade to Pro</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.restoreButton]}
          onPress={handleRestorePurchases}
        >
          <RotateCcw size={20} color={theme.primary} />
          <Text style={[styles.actionButtonText, styles.restoreButtonText]}>
            Restore Purchases
          </Text>
        </TouchableOpacity>

        <Text style={styles.infoText}>
          Note: RevenueCat integration requires native build. This demo shows the UI structure and simulates the purchase flow.
        </Text>
      </ScrollView>
    </View>
  );
}