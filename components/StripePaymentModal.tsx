import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
import { X, CreditCard, ExternalLink, Shield, CircleCheck as CheckCircle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { stripeService } from '@/services/stripeService';

interface StripePaymentModalProps {
  visible: boolean;
  onClose: () => void;
  amount: number;
  userId: string;
  onSuccess: () => void;
}

export function StripePaymentModal({ 
  visible, 
  onClose, 
  amount, 
  userId, 
  onSuccess 
}: StripePaymentModalProps) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);

  const paymentFeatures = [
    'Credit & Debit Cards (Visa, Mastercard, Amex)',
    'Bank Transfers & ACH',
    'Digital Wallets (Apple Pay, Google Pay)',
    'Buy Now, Pay Later options',
    'International payment methods',
  ];

  const handlePayment = async () => {
    if (!stripeService.isConfigured()) {
      Alert.alert(
        'Payment Configuration',
        'Stripe is not properly configured. In a production app, you would need to:\n\n1. Set up your Stripe account\n2. Add your publishable key to environment variables\n3. Configure webhook endpoints\n\nFor now, we\'ll simulate a successful payment.',
        [
          {
            text: 'Simulate Success',
            onPress: () => simulateSuccess()
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create checkout session
      const checkoutResponse = await stripeService.createCheckoutSession(amount, userId);
      
      if (!checkoutResponse.success || !checkoutResponse.sessionUrl) {
        throw new Error(checkoutResponse.error || 'Failed to create checkout session');
      }

      // Step 2: Redirect to Stripe Checkout
      const paymentResult = await stripeService.processPayment(checkoutResponse.sessionUrl);

      // For web, the redirect happens immediately, so this code won't execute
      // For mobile, we handle the result here
      if (Platform.OS !== 'web') {
        if (paymentResult.success) {
          Alert.alert(
            'Payment Successful!',
            `$${amount.toFixed(2)} has been added to your wallet.`,
            [
              {
                text: 'Great!',
                onPress: () => {
                  onClose();
                  onSuccess();
                }
              }
            ]
          );
        } else {
          Alert.alert(
            'Payment Failed',
            paymentResult.error || 'Your payment could not be processed. Please try again.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert(
        'Payment Error',
        'There was an error processing your payment. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const simulateSuccess = () => {
    setLoading(true);
    
    // Simulate processing time
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Payment Simulated!',
        `This is a demo simulation. In a real app, $${amount.toFixed(2)} would be charged and added to your wallet via Stripe Checkout.`,
        [
          {
            text: 'Continue',
            onPress: () => {
              onClose();
              onSuccess();
            }
          }
        ]
      );
    }, 2000);
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modal: {
      backgroundColor: theme.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '85%',
      minHeight: '60%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 20,
      paddingHorizontal: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
    },
    closeButton: {
      padding: 4,
    },
    scrollContent: {
      flex: 1,
      paddingHorizontal: 20,
    },
    amountContainer: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 20,
      marginVertical: 20,
      alignItems: 'center',
    },
    amountLabel: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 4,
    },
    amountText: {
      fontSize: 32,
      fontWeight: '700',
      color: theme.primary,
    },
    redirectNotice: {
      backgroundColor: theme.primary + '10',
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    redirectIcon: {
      marginRight: 12,
      marginTop: 2,
    },
    redirectContent: {
      flex: 1,
    },
    redirectTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.primary,
      marginBottom: 4,
    },
    redirectText: {
      fontSize: 14,
      color: theme.text,
      lineHeight: 20,
    },
    featuresSection: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 12,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    featureIcon: {
      marginRight: 12,
    },
    featureText: {
      fontSize: 14,
      color: theme.text,
      flex: 1,
    },
    securitySection: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      flexDirection: 'row',
      alignItems: 'center',
    },
    securityIcon: {
      marginRight: 12,
    },
    securityContent: {
      flex: 1,
    },
    securityTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    securityText: {
      fontSize: 12,
      color: theme.textSecondary,
      lineHeight: 16,
    },
    footer: {
      paddingHorizontal: 20,
      paddingBottom: Platform.OS !== 'web' ? 40 : 20,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      backgroundColor: theme.card,
    },
    payButton: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    payButtonDisabled: {
      backgroundColor: theme.textSecondary,
    },
    payButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '700',
    },
    disclaimer: {
      fontSize: 11,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: 12,
      lineHeight: 14,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Secure Payment</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Amount to Add</Text>
              <Text style={styles.amountText}>${amount.toFixed(2)}</Text>
            </View>

            <View style={styles.redirectNotice}>
              <View style={styles.redirectIcon}>
                <ExternalLink size={20} color={theme.primary} />
              </View>
              <View style={styles.redirectContent}>
                <Text style={styles.redirectTitle}>Secure Checkout</Text>
                <Text style={styles.redirectText}>
                  You'll be redirected to Stripe's secure payment page where you can choose from multiple payment options and complete your transaction safely.
                </Text>
              </View>
            </View>

            <View style={styles.featuresSection}>
              <Text style={styles.sectionTitle}>Available Payment Methods</Text>
              {paymentFeatures.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <CheckCircle size={16} color={theme.success} />
                  </View>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            <View style={styles.securitySection}>
              <View style={styles.securityIcon}>
                <Shield size={20} color={theme.success} />
              </View>
              <View style={styles.securityContent}>
                <Text style={styles.securityTitle}>Bank-Level Security</Text>
                <Text style={styles.securityText}>
                  Powered by Stripe. Your payment information is encrypted and never stored on our servers. PCI DSS compliant.
                </Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.payButton,
                loading && styles.payButtonDisabled,
              ]}
              onPress={handlePayment}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <CreditCard size={20} color="#ffffff" />
              )}
              <Text style={styles.payButtonText}>
                {loading ? 'Opening Checkout...' : 'Continue to Payment'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              By continuing, you agree to our Terms of Service and Privacy Policy. No additional fees.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}