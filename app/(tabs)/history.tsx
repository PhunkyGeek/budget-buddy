import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Calendar, TrendingUp, TrendingDown, Filter } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getExpenses, 
  getIncomes,
  getCategories,
  getIncomeSources,
} from '@/services/supabaseService';
import { ThemedPicker } from '@/components/ThemedPicker';
import { Category, IncomeSource } from '@/types/database';

interface TransactionItem {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  category?: string;
  source?: string;
  created_at: string;
}

export default function HistoryScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [expensesData, incomesData, categoriesData, sourcesData] = await Promise.all([
        getExpenses(user.id),
        getIncomes(user.id), // NEW: Fetch incomes
        getCategories(user.id),
        getIncomeSources(user.id),
      ]);

      // Transform expenses to transaction format
      const expenseTransactions: TransactionItem[] = expensesData.map(expense => ({
        id: expense.id,
        type: 'expense' as const,
        amount: expense.amount,
        date: expense.date,
        category: expense.categories?.name,
        created_at: expense.created_at,
      }));

      // Transform incomes to transaction format
      const incomeTransactions: TransactionItem[] = incomesData.map(income => ({
        id: income.id,
        type: 'income' as const,
        amount: income.amount,
        date: income.date,
        source: income.income_sources?.name,
        created_at: income.created_at,
      }));

      // Combine and sort all transactions
      const allTransactions = [...expenseTransactions, ...incomeTransactions];
      setTransactions(allTransactions);
      setCategories(categoriesData);
      setIncomeSources(sourcesData);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions
    .filter(transaction => {
      if (selectedCategory && transaction.type === 'expense') {
        return transaction.category === selectedCategory;
      }
      if (selectedSource && transaction.type === 'income') {
        return transaction.source === selectedSource;
      }
      return true;
    })
    .sort((a, b) => {
      // Sort by created_at timestamp instead of date
      const timestampA = new Date(a.created_at).getTime();
      const timestampB = new Date(b.created_at).getTime();
      return sortOrder === 'desc' ? timestampB - timestampA : timestampA - timestampB;
    });

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // Prepare picker options
  const categoryOptions = [
    { label: 'All Categories', value: '' },
    ...categories.map(category => ({
      label: category.name,
      value: category.name,
    })),
  ];

  // Enhanced formatDate function to include timestamp
  const formatDate = (dateString: string, createdAt: string) => {
    const date = new Date(dateString);
    const timestamp = new Date(createdAt);
    
    const dateFormatted = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    
    const timeFormatted = timestamp.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    
    return `${dateFormatted} at ${timeFormatted}`;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      backgroundColor: theme.card,
      paddingTop: Platform.OS !== 'web' ? 40 : 20,
      paddingHorizontal: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 8,
    },
    monthSubtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      marginBottom: 16,
    },
    summaryRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    summaryIcon: {
      marginBottom: 8,
    },
    summaryAmount: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 4,
    },
    summaryLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    incomeAmount: {
      color: theme.success,
    },
    expenseAmount: {
      color: theme.error,
    },
    filtersContainer: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 8,
    },
    filterPickerContainer: {
      flex: 1,
    },
    sortButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 6,
    },
    sortButtonText: {
      fontSize: 14,
      color: theme.text,
      fontWeight: '500',
    },
    content: {
      flex: 1,
      padding: 20,
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
    incomeIcon: {
      backgroundColor: `${theme.success}20`,
    },
    expenseIcon: {
      backgroundColor: `${theme.error}20`,
    },
    transactionDetails: {
      flex: 1,
    },
    transactionCategory: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
      textTransform: 'capitalize',
    },
    transactionDate: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 18,
    },
    transactionAmount: {
      fontSize: 18,
      fontWeight: '700',
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
    loadingText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: 32,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transaction History</Text>
        <Text style={styles.monthSubtitle}>{currentMonth}</Text>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <TrendingUp size={24} color={theme.success} />
            </View>
            <Text style={[styles.summaryAmount, styles.incomeAmount]}>
              ${totalIncome.toFixed(2)}
            </Text>
            <Text style={styles.summaryLabel}>Total Income</Text>
          
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <TrendingDown size={24} color={theme.error} />
            </View>
            <Text style={[styles.summaryAmount, styles.expenseAmount]}>
              ${totalExpenses.toFixed(2)}
            </Text>
            <Text style={styles.summaryLabel}>Total Expenses</Text>
          </View>
        </View>

        <View style={styles.filtersContainer}>
          <View style={styles.filterPickerContainer}>
            <ThemedPicker
              options={categoryOptions}
              selectedValue={selectedCategory}
              onValueChange={setSelectedCategory}
              placeholder="All Categories"
            />
          </View>

          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          >
            <Calendar size={16} color={theme.textSecondary} />
            <Text style={styles.sortButtonText}>
              {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {loading ? (
          <Text style={styles.loadingText}>Loading transactions...</Text>
        ) : filteredTransactions.length > 0 ? (
          <ScrollView
            style={styles.transactionsList}
            showsVerticalScrollIndicator={false}
          >
            {filteredTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionCard}>
                <View style={[
                  styles.transactionIcon,
                  transaction.type === 'income' ? styles.incomeIcon : styles.expenseIcon
                ]}>
                  {transaction.type === 'income' ? (
                    <TrendingUp size={20} color={theme.success} />
                  ) : (
                    <TrendingDown size={20} color={theme.error} />
                  )}
                </View>

                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionCategory}>
                    {transaction.category || transaction.source || 'Unknown'}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {formatDate(transaction.date, transaction.created_at)}
                  </Text>
                </View>

                <Text style={[
                  styles.transactionAmount,
                  transaction.type === 'income' ? styles.incomeAmount : styles.expenseAmount
                ]}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No transactions found</Text>
            <Text style={styles.emptyStateSubtext}>
              {selectedCategory || selectedSource 
                ? 'Try adjusting your filters' 
                : 'Start tracking your finances'
              }
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}