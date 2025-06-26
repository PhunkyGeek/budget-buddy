import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Plus, Search, Filter, Calendar, X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getExpenses, 
  getCategories, 
  deleteExpense 
} from '@/services/supabaseService';
import { unsplashService } from '@/services/unsplashService';
import { ExpenseCard } from '@/components/ExpenseCard';
import { ExpenseModal } from '@/components/ExpenseModal';
import { ThemedPicker } from '@/components/ThemedPicker';
import { Category } from '@/types/database';

export default function ExpensesScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenseImages, setExpenseImages] = useState<{[key: string]: string}>({});
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showDateFilterModal, setShowDateFilterModal] = useState(false);
  const [selectedDateFrom, setSelectedDateFrom] = useState<string | null>(null);
  const [selectedDateTo, setSelectedDateTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Get date filter from params and initialize date states
  const dateFilter = params.dateFilter as string;

  useEffect(() => {
    // Initialize date filters based on params
    if (dateFilter) {
      setSelectedDateFrom(dateFilter);
      setSelectedDateTo(dateFilter);
    } else {
      setSelectedDateFrom(null);
      setSelectedDateTo(null);
    }
  }, [dateFilter]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, selectedDateFrom, selectedDateTo, selectedCategory]);

  useEffect(() => {
    if (expenses.length > 0) {
      loadExpenseImages();
    }
  }, [expenses]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const filters: any = { categoryId: selectedCategory };
      
      // Apply date filters
      if (selectedDateFrom && selectedDateTo) {
        if (selectedDateFrom === selectedDateTo) {
          // Single date filter
          filters.date = selectedDateFrom;
        } else {
          // Date range filter
          filters.dateFrom = selectedDateFrom;
          filters.dateTo = selectedDateTo;
        }
      } else if (selectedDateFrom) {
        filters.dateFrom = selectedDateFrom;
      } else if (selectedDateTo) {
        filters.dateTo = selectedDateTo;
      }

      const [expensesData, categoriesData] = await Promise.all([
        getExpenses(user.id, filters),
        getCategories(user.id),
      ]);

      setExpenses(expensesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading expenses:', error);
      Alert.alert('Error', 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const loadExpenseImages = async () => {
    const imagePromises = expenses.map(async (expense) => {
      const categoryName = expense.categories?.name || 'miscellaneous';
      const images = await unsplashService.searchImages(categoryName, 1);
      return { 
        expenseId: expense.id, 
        imageUrl: images[0]?.urls.small || '' 
      };
    });

    const imageResults = await Promise.all(imagePromises);
    const imageMap = imageResults.reduce((acc, { expenseId, imageUrl }) => {
      acc[expenseId] = imageUrl;
      return acc;
    }, {} as {[key: string]: string});
    
    setExpenseImages(imageMap);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExpense(expenseId);
              await loadData(); // Reload data
            } catch (error) {
              console.error('Error deleting expense:', error);
              Alert.alert('Error', 'Failed to delete expense');
            }
          },
        },
      ]
    );
  };

  const handleApplyDateFilter = () => {
    setShowDateFilterModal(false);
    // Data will reload automatically due to useEffect dependency
  };

  const handleClearDateFilter = () => {
    setSelectedDateFrom(null);
    setSelectedDateTo(null);
    setShowDateFilterModal(false);
    // Data will reload automatically due to useEffect dependency
  };

  const filteredExpenses = expenses.filter((expense) => {
    const categoryName = expense.categories?.name || '';
    const matchesSearch = categoryName.toLowerCase().includes(searchText.toLowerCase());
    return matchesSearch;
  });

  // Prepare picker options
  const categoryOptions = [
    { label: 'All Categories', value: '' },
    ...categories.map(category => ({
      label: category.name,
      value: category.id,
    })),
  ];

  // Format date filter for display
  const getDateFilterDisplay = () => {
    if (!selectedDateFrom && !selectedDateTo) return '';
    
    const today = new Date().toISOString().split('T')[0];
    
    if (selectedDateFrom === selectedDateTo) {
      if (selectedDateFrom === today) return ' - Today';
      return ` - ${new Date(selectedDateFrom).toLocaleDateString()}`;
    }
    
    if (selectedDateFrom && selectedDateTo) {
      return ` - ${new Date(selectedDateFrom).toLocaleDateString()} to ${new Date(selectedDateTo).toLocaleDateString()}`;
    }
    
    if (selectedDateFrom) {
      return ` - From ${new Date(selectedDateFrom).toLocaleDateString()}`;
    }
    
    if (selectedDateTo) {
      return ` - Until ${new Date(selectedDateTo).toLocaleDateString()}`;
    }
    
    return '';
  };

  const hasDateFilter = selectedDateFrom || selectedDateTo;

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
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    titleContainer: {
      flex: 1,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.text,
    },
    titleWithFilter: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
    },
    dateFilterText: {
      fontSize: 16,
      color: theme.primary,
      fontWeight: '600',
      marginTop: 4,
    },
    addButton: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    addButtonText: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '600',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: 12,
      paddingHorizontal: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.text,
    },
    filtersContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 8,
    },
    filterButton: {
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
    filterButtonActive: {
      backgroundColor: theme.primary + '20',
      borderColor: theme.primary,
    },
    filterButtonText: {
      fontSize: 14,
      color: theme.text,
      fontWeight: '500',
    },
    filterButtonTextActive: {
      color: theme.primary,
      fontWeight: '600',
    },
    categoryPickerContainer: {
      flex: 1,
    },
    entriesCount: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    content: {
      flex: 1,
      padding: 20,
    },
    expensesList: {
      paddingBottom: 20,
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
      marginBottom: 16,
    },
    emptyStateSubtext: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
    },
    createButton: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingHorizontal: 32,
      paddingVertical: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    createButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    loadingText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: 32,
    },
    // Date Filter Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
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
    dateInputContainer: {
      marginBottom: 16,
    },
    dateLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    dateInput: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      padding: 12,
      fontSize: 16,
      color: theme.text,
      backgroundColor: theme.background,
    },
    modalButtonsContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 24,
    },
    modalButton: {
      flex: 1,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    applyButton: {
      backgroundColor: theme.primary,
    },
    clearButton: {
      backgroundColor: theme.error,
    },
    cancelButton: {
      backgroundColor: theme.textSecondary,
    },
    modalButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleContainer}>
            <Text style={hasDateFilter ? styles.titleWithFilter : styles.title}>
              Expense Entries
            </Text>
            {hasDateFilter && (
              <Text style={styles.dateFilterText}>
                {getDateFilterDisplay()}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowExpenseModal(true)}
          >
            <Plus size={16} color="#ffffff" />
            <Text style={styles.addButtonText}>Create New</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchIcon}>
            <Search size={20} color={theme.textSecondary} />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search expenses..."
            placeholderTextColor={theme.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <View style={styles.filtersContainer}>
          <TouchableOpacity 
            style={[
              styles.filterButton,
              hasDateFilter && styles.filterButtonActive
            ]}
            onPress={() => setShowDateFilterModal(true)}
          >
            <Calendar size={16} color={hasDateFilter ? theme.primary : theme.textSecondary} />
            <Text style={[
              styles.filterButtonText,
              hasDateFilter && styles.filterButtonTextActive
            ]}>
              {hasDateFilter ? 'Filtered' : 'Date Range'}
            </Text>
          </TouchableOpacity>

          <View style={styles.categoryPickerContainer}>
            <ThemedPicker
              options={categoryOptions}
              selectedValue={selectedCategory}
              onValueChange={(value) => {
                setSelectedCategory(value);
              }}
              placeholder="All Categories"
            />
          </View>
        </View>

        <Text style={styles.entriesCount}>
          {filteredExpenses.length} entries
        </Text>
      </View>

      <View style={styles.content}>
        {loading ? (
          <Text style={styles.loadingText}>Loading expenses...</Text>
        ) : filteredExpenses.length > 0 ? (
          <ScrollView
            style={styles.expensesList}
            showsVerticalScrollIndicator={false}
          >
            {filteredExpenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                imageUrl={expenseImages[expense.id]}
                onDelete={() => handleDeleteExpense(expense.id)}
                showImage={true}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No expenses found</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchText || selectedCategory || hasDateFilter
                ? 'Try adjusting your search or filters' 
                : 'Start tracking your expenses'
              }
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowExpenseModal(true)}
            >
              <Plus size={20} color="#ffffff" />
              <Text style={styles.createButtonText}>Add First Expense</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Date Filter Modal */}
      <Modal
        visible={showDateFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDateFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Date Filter</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowDateFilterModal(false)}
              >
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>From Date</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.textSecondary}
                value={selectedDateFrom || ''}
                onChangeText={setSelectedDateFrom}
              />
            </View>

            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>To Date</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.textSecondary}
                value={selectedDateTo || ''}
                onChangeText={setSelectedDateTo}
              />
            </View>

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.clearButton]}
                onPress={handleClearDateFilter}
              >
                <Text style={styles.modalButtonText}>Clear</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.applyButton]}
                onPress={handleApplyDateFilter}
              >
                <Text style={styles.modalButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ExpenseModal
        visible={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSuccess={loadData}
      />
    </SafeAreaView>
  );
}