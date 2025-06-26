import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { X, Plus, Minus, Lock, Clock as Unlock, History } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { getWalletTransactions } from '@/services/supabaseService';
import { WalletTransaction } from '@/types/database';

interface WalletHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
}

export function WalletHistoryModal({ visible, onClose, userId }: WalletHistoryModalProps) {
  const { theme } = useTheme();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && userId) {
      loadTransactions();
    }
  }, [visible, userId]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await getWalletTransactions(userId);
      setTransactions(data);
    } catch (error) {
      console.error('Error loading wallet transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'add':
        return <Plus size={20} color={theme.success} />;
      case 'withdraw':
        return <Minus size={20} color={theme.error} />;
      case 'lock':
        return <Lock size={20} color={theme.primary} />;
      case 'unlock':
        return <Unlock size={20} color={theme.secondary} />;
      default:
        return <History size={20} color={theme.textSecondary} />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'add':
        return theme.success;
      case 'withdraw':
        return theme.error;
      case 'lock':
        return theme.primary;
      case 'unlock':
        return theme.secondary;
      default:
        return theme.textSecondary;
    }
  };

  const getAmountPrefix = (type: string) => {
    switch (type) {
      case 'add':
      case 'unlock':
        return '+';
      case 'withdraw':
      case 'lock':
        return '-';
      default:
        return '';
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modal: {
      flex: 1,
      backgroundColor: theme.background,
      marginTop: Platform.OS !== 'web' ? 40 : 0,
    },
    header: {
      backgroundColor: theme.card,
      paddingTop: Platform.OS !== 'web' ? 20 : 20,
      paddingHorizontal: 20,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.text,
    },
    closeButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme.surface,
    },
    subtitle: {
      fontSize: 16,
      color: theme.textSecondary,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 64,
    },
    loadingText: {
      fontSize: 16,
      color: theme.textSecondary,
      marginTop: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 16,
    },
    transactionsList: {
      flex: 1,
    },
    transactionCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    transactionIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    transactionDetails: {
      flex: 1,
    },
    transactionDescription: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    transactionDate: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    transactionAmount: {
      fontSize: 18,
      fontWeight: '700',
      textAlign: 'right',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 64,
    },
    emptyStateText: {
      fontSize: 18,
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: 8,
    },
    emptyStateSubtext: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.title}>Transaction History</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>Your wallet activity and transactions</Text>
          </View>

          <View style={styles.content}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={styles.loadingText}>Loading transactions...</Text>
              </View>
            ) : transactions.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>Recent Transactions</Text>
                <ScrollView 
                  style={styles.transactionsList}
                  showsVerticalScrollIndicator={false}
                >
                  {transactions.map((transaction) => (
                    <View key={transaction.id} style={styles.transactionCard}>
                      <View style={[
                        styles.transactionIcon,
                        { backgroundColor: getTransactionColor(transaction.transaction_type) + '20' }
                      ]}>
                        {getTransactionIcon(transaction.transaction_type)}
                      </View>

                      <View style={styles.transactionDetails}>
                        <Text style={styles.transactionDescription}>
                          {transaction.description}
                        </Text>
                        <Text style={styles.transactionDate}>
                          {formatDate(transaction.timestamp)}
                        </Text>
                      </View>

                      <Text style={[
                        styles.transactionAmount,
                        { color: getTransactionColor(transaction.transaction_type) }
                      ]}>
                        {getAmountPrefix(transaction.transaction_type)}${transaction.amount.toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No transactions yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Your wallet activity will appear here
                </Text>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}