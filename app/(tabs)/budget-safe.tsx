import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Platform,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Clock as Unlock, Lock, Goal, PiggyBank, Plus, Minus, CreditCard, Building2, X, Calendar, Timer, CircleCheck as CheckCircle, CircleAlert as AlertCircle, History } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { revenueCatService } from '@/services/revenueCatService';
import { 
  getWalletBalance, 
  addFundsToWallet, 
  withdrawFundsFromWallet, 
  lockFundsInWallet,
  unlockFunds 
} from '@/services/supabaseService';
import { Wallet } from '@/types/database';
import { ThemedPicker } from '@/components/ThemedPicker';
import { StripePaymentModal } from '@/components/StripePaymentModal';
import { WalletHistoryModal } from '@/components/WalletHistoryModal';

const { width: screenWidth } = Dimensions.get('window');

export default function BudgetSafeScreen() {
  const { theme } = useTheme();
  const { user, profile } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showLockFundsModal, setShowLockFundsModal] = useState(false);
  const [showWalletHistoryModal, setShowWalletHistoryModal] = useState(false);
  
  // Form states
  const [amount, setAmount] = useState('');
  const [lockDuration, setLockDuration] = useState('1week');
  const [actionLoading, setActionLoading] = useState(false);

  // Lock duration options
  const lockDurationOptions = [
    { label: '1 Week', value: '1week' },
    { label: '1 Month', value: '1month' },
    { label: '3 Months', value: '3months' },
    { label: '6 Months', value: '6months' },
    { label: '1 Year', value: '1year' },
  ];

  useEffect(() => {
    if (user && profile?.subscription_status === 'pro') {
      loadWalletData();
    }
  }, [user, profile]);

  const loadWalletData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const walletData = await getWalletBalance(user.id);
      setWallet(walletData);
    } catch (error) {
      console.error('Error loading wallet:', error);
      Alert.alert('Error', 'Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  const handleUnlockPro = async () => {
    try {
      await revenueCatService.openPaywall();
    } catch (error) {
      console.error('Error opening paywall:', error);
    }
  };

  const handleAddFunds = () => {
    if (!amount.trim()) {
      Alert.alert('Error', 'Please enter an amount');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (numericAmount < 1) {
      Alert.alert('Error', 'Minimum amount is $1.00');
      return;
    }

    if (numericAmount > 10000) {
      Alert.alert('Error', 'Maximum amount is $10,000.00');
      return;
    }

    // Close the amount modal and open Stripe payment modal
    setShowAddFundsModal(false);
    setShowStripeModal(true);
  };

  const handleStripeSuccess = async () => {
    // Refresh wallet data to show updated balance
    await loadWalletData();
    setAmount('');
    setShowStripeModal(false);
  };

  const handleWithdraw = async () => {
    if (!user || !amount.trim() || !wallet) {
      Alert.alert('Error', 'Please enter an amount');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (numericAmount > wallet.balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    setActionLoading(true);

    try {
      // Simulate Stripe payout processing
      Alert.alert(
        'Stripe Payout Simulation',
        `This would process a $${numericAmount.toFixed(2)} withdrawal through Stripe payouts. In a real app, this would integrate with Stripe's payout API.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setActionLoading(false)
          },
          {
            text: 'Simulate Success',
            onPress: async () => {
              try {
                await withdrawFundsFromWallet(user.id, numericAmount);
                await loadWalletData();
                setAmount('');
                setShowWithdrawModal(false);
                Alert.alert('Success', `$${numericAmount.toFixed(2)} withdrawn from your wallet!`);
              } catch (error) {
                console.error('Error withdrawing funds:', error);
                Alert.alert('Error', 'Failed to withdraw funds');
              } finally {
                setActionLoading(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      Alert.alert('Error', 'Withdrawal processing failed');
      setActionLoading(false);
    }
  };

  const handleLockFunds = async () => {
    if (!user || !amount.trim() || !wallet) {
      Alert.alert('Error', 'Please enter an amount');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (numericAmount > wallet.balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    setActionLoading(true);

    try {
      // Calculate lock expiry date
      const now = new Date();
      let lockExpiry = new Date(now);
      
      switch (lockDuration) {
        case '1week':
          lockExpiry.setDate(now.getDate() + 7);
          break;
        case '1month':
          lockExpiry.setMonth(now.getMonth() + 1);
          break;
        case '3months':
          lockExpiry.setMonth(now.getMonth() + 3);
          break;
        case '6months':
          lockExpiry.setMonth(now.getMonth() + 6);
          break;
        case '1year':
          lockExpiry.setFullYear(now.getFullYear() + 1);
          break;
      }

      await lockFundsInWallet(user.id, numericAmount, lockExpiry.toISOString());
      await loadWalletData();
      setAmount('');
      setShowLockFundsModal(false);
      
      const durationLabel = lockDurationOptions.find(opt => opt.value === lockDuration)?.label || lockDuration;
      Alert.alert('Success', `$${numericAmount.toFixed(2)} locked for ${durationLabel}!`);
    } catch (error) {
      console.error('Error locking funds:', error);
      Alert.alert('Error', 'Failed to lock funds');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnlockFunds = async () => {
    if (!user || !wallet) return;

    Alert.alert(
      'Unlock Funds',
      'Are you sure you want to unlock your funds early? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlock',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              await unlockFunds(user.id);
              await loadWalletData();
              Alert.alert('Success', 'Funds unlocked successfully!');
            } catch (error) {
              console.error('Error unlocking funds:', error);
              Alert.alert('Error', 'Failed to unlock funds');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const isLocked = wallet?.locked_amount && wallet.locked_amount > 0;
  const lockExpired = wallet?.lock_expiry ? new Date(wallet.lock_expiry) <= new Date() : false;

  const formatTimeRemaining = (expiry: string) => {
    const now = new Date();
    const expiryDate = new Date(expiry);
    const diff = expiryDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else {
      return `${hours}h remaining`;
    }
  };

  // Determine callback origin for Stripe
  const getCallbackOrigin = () => {
    if (Platform.OS === 'web') {
      return typeof window !== 'undefined' ? window.location.origin : 'https://budget-budddy.netlify.app';
    } else {
      // For mobile, always use the production URL as it needs to be web-accessible
      return 'https://budget-budddy.netlify.app';
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    gradient: {
      flex: 1,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: screenWidth > 768 ? '20%' : 32,
      paddingVertical: 32,
      paddingTop: Platform.OS !== 'web' ? 80 : 32,
    },
    iconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 25,
    },
    title: {
      fontSize: screenWidth > 768 ? 36 : 32,
      fontWeight: '700',
      color: '#ffffff',
      textAlign: 'center',
      marginBottom: 16,
    },
    subtitle: {
      fontSize: screenWidth > 768 ? 20 : 18,
      color: 'rgba(255, 255, 255, 0.9)',
      textAlign: 'center',
      marginBottom: 8,
    },
    description: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.8)',
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 48,
      maxWidth: screenWidth > 768 ? '60%' : 300,
    },
    featuresList: {
      width: '100%',
      marginBottom: 32,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      paddingHorizontal: 16,
    },
    featureIcon: {
      marginRight: 16,
    },
    featureText: {
      flex: 1,
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.9)',
      fontWeight: '500',
    },
    unlockButton: {
      backgroundColor: '#ffffff',
      borderRadius: 16,
      paddingVertical: 18,
      paddingHorizontal: 48,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    unlockButtonText: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.primary,
    },
    proIndicator: {
      position: 'absolute',
      top: Platform.OS !== 'web' ? 80 : 60,
      right: 32,
      backgroundColor: theme.secondary,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    proIndicatorText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#ffffff',
    },
    // Pro content styles
    proContent: {
      flex: 1,
      backgroundColor: theme.background,
    },
    proScrollView: {
      flex: 1,
    },
    proHeader: {
      backgroundColor: theme.card,
      paddingTop: Platform.OS !== 'web' ? 60 : 20,
      paddingHorizontal: 20,
      paddingBottom: 24,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    greeting: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.text,
      marginTop: 10,
      marginLeft: 20,
    },
    proTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 8,
    },
    proSubtitle: {
      fontSize: 16,
      color: theme.textSecondary,
    },
    walletCard: {
      margin: 20,
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 24,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
    },
    walletHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    walletIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    walletTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
    },
    balanceContainer: {
      alignItems: 'center',
      marginBottom: 24,
    },
    balanceLabel: {
      fontSize: 16,
      color: theme.textSecondary,
      marginBottom: 8,
    },
    balanceAmount: {
      fontSize: 36,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 8,
    },
    lockedInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.warning + '20',
      borderRadius: 12,
      padding: 12,
      marginTop: 8,
    },
    lockedText: {
      fontSize: 14,
      color: theme.warning,
      marginLeft: 8,
      flex: 1,
    },
    historyLink: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 16,
      paddingVertical: 12,
    },
    historyLinkText: {
      fontSize: 16,
      color: theme.primary,
      fontWeight: '600',
      marginRight: 8,
    },
    actionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
      margin: 20,
    },
    actionButton: {
      flex: 1,
      minWidth: screenWidth > 768 ? '30%' : '45%',
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    actionButtonDisabled: {
      opacity: 0.5,
    },
    actionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    addFundsIcon: {
      backgroundColor: theme.success + '20',
    },
    withdrawIcon: {
      backgroundColor: theme.error + '20',
    },
    lockIcon: {
      backgroundColor: theme.primary + '20',
    },
    actionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 4,
    },
    actionSubtitle: {
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modal: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 24,
      width: '100%',
      maxWidth: 400,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
    },
    closeButton: {
      padding: 4,
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      padding: 12,
      fontSize: 16,
      color: theme.text,
      backgroundColor: theme.background,
    },
    pickerContainer: {
      marginBottom: 20,
    },
    submitButton: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    submitButtonDisabled: {
      backgroundColor: theme.textSecondary,
    },
    submitButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '700',
    },
    paymentOptions: {
      marginBottom: 20,
    },
    paymentOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      marginBottom: 12,
      backgroundColor: theme.surface,
    },
    paymentOptionIcon: {
      marginRight: 16,
    },
    paymentOptionText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    stripeInfo: {
      backgroundColor: theme.surface,
      borderRadius: 8,
      padding: 12,
      marginBottom: 20,
    },
    stripeInfoText: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
    },
    loadingText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: 32,
    },
  });

  if (profile?.subscription_status !== 'pro') {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[theme.primary, '#4c1d95']}
          style={styles.gradient}
        >
          <View style={styles.proIndicator}>
            <Text style={styles.proIndicatorText}>PRO FEATURE</Text>
          </View>

          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Shield size={60} color="#ffffff" />
            </View>

            <Text style={styles.title}>Budget Safe</Text>
            <Text style={styles.subtitle}>This is a Pro Feature</Text>
            <Text style={styles.description}>
              Upgrade to Pro to access secure savings goals, and advanced financial protection features.
            </Text>

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Lock size={24} color="rgba(255, 255, 255, 0.9)" />
                </View>
                <Text style={styles.featureText}>Secure savings vault</Text>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Goal size={24} color="rgba(255, 255, 255, 0.9)" />
                </View>
                <Text style={styles.featureText}>Automated savings goals</Text>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <PiggyBank size={24} color="rgba(255, 255, 255, 0.9)" />
                </View>
                <Text style={styles.featureText}>Emergency fund planning</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.unlockButton}
              onPress={handleUnlockPro}
            >
              <Unlock size={24} color={theme.primary} />
              <Text style={styles.unlockButtonText}>Unlock Pro</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.proContent}>
      <View style={styles.proHeader}>
        <Text style={styles.proTitle}>Budget Safe</Text>
        <Text style={styles.proSubtitle}>Your secure digital wallet</Text>
      </View>

      <ScrollView 
        style={styles.proScrollView} 
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      >
        <Text style={styles.greeting}>
          Hello, {profile?.first_name || 'User'}
        </Text>
        {loading ? (
          <Text style={styles.loadingText}>Loading wallet...</Text>
        ) : wallet ? (
          <>
            {/* Wallet Balance Card */}
            <View style={styles.walletCard}>
              <View style={styles.walletHeader}>
                <View style={styles.walletIcon}>
                  <Shield size={24} color={theme.primary} />
                </View>
                <Text style={styles.walletTitle}>Digital Wallet</Text>
              </View>

              <View style={styles.balanceContainer}>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <Text style={styles.balanceAmount}>
                  ${wallet.balance.toFixed(2)}
                </Text>
                
                {isLocked && (
                  <View style={styles.lockedInfo}>
                    <Lock size={16} color={theme.warning} />
                    <Text style={styles.lockedText}>
                      <Text>${wallet.locked_amount.toFixed(2)} locked</Text>
                      {wallet.lock_expiry && !lockExpired && (
                        <Text> • {formatTimeRemaining(wallet.lock_expiry)}</Text>
                      )}
                      {lockExpired && <Text> • Expired - Tap to unlock</Text>}
                    </Text>
                    {lockExpired && (
                      <TouchableOpacity onPress={handleUnlockFunds}>
                        <CheckCircle size={16} color={theme.success} />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>

              <TouchableOpacity 
                style={styles.historyLink}
                onPress={() => setShowWalletHistoryModal(true)}
              >
                <Text style={styles.historyLinkText}>View Transaction History</Text>
                <History size={16} color={theme.primary} />
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsGrid}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowAddFundsModal(true)}
                disabled={actionLoading}
              >
                <View style={[styles.actionIcon, styles.addFundsIcon]}>
                  <Plus size={24} color={theme.success} />
                </View>
                <Text style={styles.actionTitle}>Add Funds</Text>
                <Text style={styles.actionSubtitle}>Deposit money via Stripe</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  (wallet.balance <= 0 || actionLoading) && styles.actionButtonDisabled
                ]}
                onPress={() => setShowWithdrawModal(true)}
                disabled={wallet.balance <= 0 || actionLoading}
              >
                <View style={[styles.actionIcon, styles.withdrawIcon]}>
                  <Minus size={24} color={theme.error} />
                </View>
                <Text style={styles.actionTitle}>Withdraw</Text>
                <Text style={styles.actionSubtitle}>Transfer to bank account</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  (wallet.balance <= 0 || actionLoading) && styles.actionButtonDisabled
                ]}
                onPress={() => setShowLockFundsModal(true)}
                disabled={wallet.balance <= 0 || actionLoading}
              >
                <View style={[styles.actionIcon, styles.lockIcon]}>
                  <Lock size={24} color={theme.primary} />
                </View>
                <Text style={styles.actionTitle}>Lock Funds</Text>
                <Text style={styles.actionSubtitle}>Secure savings goal</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text style={styles.loadingText}>Failed to load wallet</Text>
        )}
      </ScrollView>

      {/* Add Funds Modal */}
      <Modal
        visible={showAddFundsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddFundsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Funds</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAddFundsModal(false)}
              >
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Amount ($1.00 - $10,000.00)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter amount"
                placeholderTextColor={theme.textSecondary}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.stripeInfo}>
              <Text style={styles.stripeInfoText}>
                💳 Powered by Stripe - Secure payment processing with multiple payment options including cards, bank transfers, and digital wallets.
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                actionLoading && styles.submitButtonDisabled,
              ]}
              onPress={handleAddFunds}
              disabled={actionLoading}
            >
              <CreditCard size={20} color="#ffffff" />
              <Text style={styles.submitButtonText}>
                Continue to Payment
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Stripe Payment Modal */}
      <StripePaymentModal
        visible={showStripeModal}
        onClose={() => setShowStripeModal(false)}
        amount={parseFloat(amount) || 0}
        userId={user?.id || ''}
        onSuccess={handleStripeSuccess}
        callbackOrigin={getCallbackOrigin()}
      />

      {/* Withdraw Modal */}
      <Modal
        visible={showWithdrawModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWithdrawModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Withdraw Funds</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowWithdrawModal(false)}
              >
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Amount</Text>
              <TextInput
                style={styles.input}
                placeholder={`Max: $${wallet?.balance.toFixed(2) || '0.00'}`}
                placeholderTextColor={theme.textSecondary}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                actionLoading && styles.submitButtonDisabled,
              ]}
              onPress={handleWithdraw}
              disabled={actionLoading}
            >
              <Minus size={20} color="#ffffff" />
              <Text style={styles.submitButtonText}>
                {actionLoading ? 'Processing...' : 'Withdraw Funds'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Lock Funds Modal */}
      <Modal
        visible={showLockFundsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLockFundsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lock Funds</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowLockFundsModal(false)}
              >
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Amount to Lock</Text>
              <TextInput
                style={styles.input}
                placeholder={`Max: $${wallet?.balance.toFixed(2) || '0.00'}`}
                placeholderTextColor={theme.textSecondary}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Lock Duration</Text>
              <ThemedPicker
                options={lockDurationOptions}
                selectedValue={lockDuration}
                onValueChange={setLockDuration}
                placeholder="Select duration"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                actionLoading && styles.submitButtonDisabled,
              ]}
              onPress={handleLockFunds}
              disabled={actionLoading}
            >
              <Lock size={20} color="#ffffff" />
              <Text style={styles.submitButtonText}>
                {actionLoading ? 'Locking...' : 'Lock Funds'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Wallet History Modal */}
      <WalletHistoryModal
        visible={showWalletHistoryModal}
        onClose={() => setShowWalletHistoryModal(false)}
        userId={user?.id || ''}
      />
    </SafeAreaView>
  );
}