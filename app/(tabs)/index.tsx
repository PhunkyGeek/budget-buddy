import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
  Platform,
  Dimensions,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Plus, 
  Wallet, 
  DollarSign, 
  PiggyBank, 
  ChevronRight,
  Mic,
  History,
  TrendingUp,
  Shield,
  GraduationCap,
  X,
  TrendingDown
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getMonthlyIncome, 
  getMonthlyExpenses, 
  getTodayExpenses,
  updateUserLastTutorialMonth
} from '@/services/supabaseService';
import { unsplashService } from '@/services/unsplashService';
import { VoiceButton } from '@/components/VoiceButton';
import { ConversationalAIProvider } from '@/components/ConversationalAIProvider';
import { VoiceCommandSuccessProvider } from '@/contexts/VoiceCommandSuccessContext';
import { TutorialModal } from '@/components/TutorialModal';
import { IncomeModal } from '@/components/IncomeModal';
import { ExpenseModal } from '@/components/ExpenseModal';

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  const { theme } = useTheme();
  const { user, profile } = useAuth();
  const router = useRouter();
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [todayExpenses, setTodayExpenses] = useState<any[]>([]);
  const [expenseImages, setExpenseImages] = useState<{[key: string]: string}>({});
  const [showTutorial, setShowTutorial] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showAddOptionsModal, setShowAddOptionsModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Ref for horizontal scroll view
  const expensesScrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (user && profile) {
      loadData();
      
      // Check if tutorial should be shown
      const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM' format
      const shouldShowTutorial = 
        profile.last_tutorial_shown_month === null || // First time user
        profile.last_tutorial_shown_month !== currentMonth; // New month
      
      if (shouldShowTutorial) {
        // Small delay to ensure smooth UI transition
        setTimeout(() => setShowTutorial(true), 1000);
      }
    }
  }, [user, profile, refreshTrigger]);

  const loadData = async () => {
    if (!user) return;

    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      const [income, expenses, todayExp] = await Promise.all([
        getMonthlyIncome(user.id, year, month),
        getMonthlyExpenses(user.id, year, month),
        getTodayExpenses(user.id),
      ]);

      setMonthlyIncome(income);
      setMonthlyExpenses(expenses);
      setTodayExpenses(todayExp);

      // Load images for today's expenses
      const imagePromises = todayExp.map(async (expense) => {
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
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSeeAllTodayExpenses = () => {
    const today = new Date().toISOString().split('T')[0];
    router.push({
      pathname: '/expenses',
      params: { dateFilter: today }
    });
  };

  const handleTutorialClose = async () => {
    setShowTutorial(false);
    
    // Update the last tutorial shown month
    if (user) {
      try {
        const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM' format
        await updateUserLastTutorialMonth(user.id, currentMonth);
      } catch (error) {
        console.error('Error updating tutorial month:', error);
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Handle horizontal scroll for expenses carousel
  const handleScrollRight = () => {
    if (expensesScrollViewRef.current) {
      const cardWidth = 280; // Approximate width of expense card + margin
      expensesScrollViewRef.current.scrollTo({
        x: cardWidth,
        animated: true,
      });
    }
  };

  // Handle add options
  const handleAddIncome = () => {
    setShowAddOptionsModal(false);
    setShowIncomeModal(true);
  };

  const handleAddExpense = () => {
    setShowAddOptionsModal(false);
    setShowExpenseModal(true);
  };

  const remainingBudget = monthlyIncome - monthlyExpenses;
  const todayTotal = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      paddingTop: Platform.OS !== 'web' ? 40 : 20,
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    headerGradient: {
      paddingTop: Platform.OS !== 'web' ? 40 : 20,
      paddingHorizontal: 20,
      paddingBottom: 24,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    greeting: {
      fontSize: 24,
      fontWeight: '700',
      color: '#ffffff',
    },
    headerButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    headerButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    totalIncomeTitle: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.9)',
      textAlign: 'center',
      marginBottom: 8,
    },
    totalIncomeAmount: {
      fontSize: 36,
      fontWeight: '700',
      color: '#ffffff',
      textAlign: 'center',
      marginBottom: 24,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
    },
    statIcon: {
      marginBottom: 8,
    },
    statValue: {
      fontSize: 18,
      fontWeight: '700',
      color: '#ffffff',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: 'rgba(255, 255, 255, 0.8)',
      textAlign: 'center',
    },
    content: {
      flex: 1,
      padding: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 16,
    },
    seeAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    seeAllText: {
      fontSize: 14,
      color: theme.primary,
      fontWeight: '600',
    },
    // Updated styles for horizontal carousel
    expensesCarouselContainer: {
      position: 'relative',
    },
    expensesScrollView: {
      flex: 1,
    },
    expensesScrollContent: {
      paddingRight: 60, // Space for scroll button
    },
    scrollButton: {
      position: 'absolute',
      right: 16,
      top: '50%',
      transform: [{ translateY: -22 }],
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
      zIndex: 10,
    },
    expenseCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      marginRight: 16,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      flexDirection: 'row',
      alignItems: 'center',
      width: 260, // Fixed width for horizontal scrolling
      borderWidth: 1,
      borderColor: theme.border,
    },
    expenseImage: {
      width: 60,
      height: 60,
      borderRadius: 12,
      marginRight: 16,
      backgroundColor: theme.surface,
    },
    expenseDetails: {
      flex: 1,
    },
    expenseCategory: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
      textTransform: 'capitalize',
    },
    expenseAmount: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.error,
    },
    todayBanner: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginTop: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    todayBannerText: {
      fontSize: 16,
      color: theme.text,
      textAlign: 'center',
    },
    todayBannerHighlight: {
      fontWeight: '700',
      color: theme.primary,
    },
    quickActionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    quickActionCard: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    quickActionCardPro: {
      borderWidth: 2,
      borderColor: theme.secondary,
    },
    quickActionIcon: {
      marginBottom: 8,
    },
    quickActionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 4,
    },
    quickActionSubtitle: {
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    proBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: theme.secondary,
      borderRadius: 8,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    proBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#ffffff',
    },
    emptyState: {
      alignItems: 'center',
      padding: 32,
    },
    emptyStateText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: 16,
    },
    addButton: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingHorizontal: 24,
      paddingVertical: 12,
    },
    addButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    // Add Options Modal Styles
    addOptionsOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    addOptionsContainer: {
      backgroundColor: theme.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      paddingBottom: Platform.OS !== 'web' ? 40 : 24,
    },
    addOptionsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    addOptionsTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
    },
    closeOptionsButton: {
      padding: 4,
    },
    addOptionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    addOptionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    addIncomeIcon: {
      backgroundColor: `${theme.success}20`,
    },
    addExpenseIcon: {
      backgroundColor: `${theme.error}20`,
    },
    addOptionContent: {
      flex: 1,
    },
    addOptionButtonText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    addOptionSubtext: {
      fontSize: 14,
      color: theme.textSecondary,
    },
  });

  return (
    <VoiceCommandSuccessProvider onSuccess={loadData}>
      <ConversationalAIProvider>
        <SafeAreaView style={styles.container}>
          <LinearGradient
            colors={[theme.primary, theme.secondary]}
            style={styles.headerGradient}
          >
            <View style={styles.headerTop}>
              <Text style={styles.greeting}>
                Hello, {profile?.first_name || 'User'}
              </Text>
              <View style={styles.headerButtons}>
                <VoiceButton />
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={() => setShowAddOptionsModal(true)}
                >
                  <Plus size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.totalIncomeTitle}>Total Income</Text>
            <Text style={styles.totalIncomeAmount}>${monthlyIncome.toFixed(2)}</Text>
            
            <View style={styles.statsRow}>
              <TouchableOpacity style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Wallet size={24} color="#ffffff" />
                </View>
                <Text style={styles.statValue}>${monthlyIncome.toFixed(2)}</Text>
                <Text style={styles.statLabel}>Monthly Income</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.statCard}>
                <View style={styles.statIcon}>
                  <DollarSign size={24} color="#ffffff" />
                </View>
                <Text style={styles.statValue}>${monthlyExpenses.toFixed(2)}</Text>
                <Text style={styles.statLabel}>Total Expenses</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.statCard}>
                <View style={styles.statIcon}>
                  <PiggyBank size={24} color="#ffffff" />
                </View>
                <Text style={styles.statValue}>${remainingBudget.toFixed(2)}</Text>
                <Text style={styles.statLabel}>Remaining Budget</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          >
            {/* Today's Expenses - Now with horizontal carousel */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Today's Expenses</Text>
                <TouchableOpacity 
                  style={styles.seeAllButton}
                  onPress={handleSeeAllTodayExpenses}
                >
                  <Text style={styles.seeAllText}>See All</Text>
                  <ChevronRight size={16} color={theme.primary} />
                </TouchableOpacity>
              </View>

              {todayExpenses.length > 0 ? (
                <>
                  <View style={styles.expensesCarouselContainer}>
                    <ScrollView
                      ref={expensesScrollViewRef}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.expensesScrollView}
                      contentContainerStyle={styles.expensesScrollContent}
                      decelerationRate="fast"
                      snapToInterval={276} // Card width + margin
                      snapToAlignment="start"
                    >
                      {todayExpenses.map((expense) => (
                        <View key={expense.id} style={styles.expenseCard}>
                          <Image
                            source={{ uri: expenseImages[expense.id] }}
                            style={styles.expenseImage}
                            resizeMode="cover"
                          />
                          <View style={styles.expenseDetails}>
                            <Text style={styles.expenseCategory}>
                              {expense.categories?.name || 'Unknown'}
                            </Text>
                            <Text style={styles.expenseAmount}>
                              ${expense.amount.toFixed(2)}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </ScrollView>
                    
                    {todayExpenses.length > 1 && (
                      <TouchableOpacity
                        style={styles.scrollButton}
                        onPress={handleScrollRight}
                      >
                        <ChevronRight size={20} color="#ffffff" />
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.todayBanner}>
                    <Text style={styles.todayBannerText}>
                      Today's Total: <Text style={styles.todayBannerHighlight}>${todayTotal.toFixed(2)}</Text>
                      {'\n'}
                      Current Remaining: <Text style={styles.todayBannerHighlight}>${(remainingBudget - todayTotal).toFixed(2)}</Text>
                    </Text>
                  </View>
                </>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No expenses today</Text>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowExpenseModal(true)}
                  >
                    <Text style={styles.addButtonText}>Add First Expense</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity
                  style={styles.quickActionCard}
                  onPress={() => setShowExpenseModal(true)}
                >
                  <View style={styles.quickActionIcon}>
                    <Plus size={32} color={theme.primary} />
                  </View>
                  <Text style={styles.quickActionTitle}>Create New Expense</Text>
                  <Text style={styles.quickActionSubtitle}>Add expense quickly</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => router.push('/history')}
                >
                  <View style={styles.quickActionIcon}>
                    <History size={32} color={theme.primary} />
                  </View>
                  <Text style={styles.quickActionTitle}>View History</Text>
                  <Text style={styles.quickActionSubtitle}>See all transactions</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.quickActionCard}>
                  <View style={styles.quickActionIcon}>
                    <Mic size={32} color={theme.primary} />
                  </View>
                  <Text style={styles.quickActionTitle}>Voice Buddy</Text>
                  <Text style={styles.quickActionSubtitle}>Talk to add expenses</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.quickActionCard, styles.quickActionCardPro]}
                  onPress={() => router.push('/budget-expert')}
                >
                  <View style={styles.proBadge}>
                    <Text style={styles.proBadgeText}>Pro</Text>
                  </View>
                  <View style={styles.quickActionIcon}>
                    <GraduationCap size={32} color={theme.secondary} />
                  </View>
                  <Text style={styles.quickActionTitle}>Budget Expert</Text>
                  <Text style={styles.quickActionSubtitle}>AI budget advisor</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.quickActionCard, styles.quickActionCardPro]}
                  onPress={() => router.push('/budget-safe')}
                >
                  <View style={styles.proBadge}>
                    <Text style={styles.proBadgeText}>Pro</Text>
                  </View>
                  <View style={styles.quickActionIcon}>
                    <Shield size={32} color={theme.secondary} />
                  </View>
                  <Text style={styles.quickActionTitle}>Budget Safe</Text>
                  <Text style={styles.quickActionSubtitle}>Secure savings plan</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickActionCard}
                  onPress={() => setShowIncomeModal(true)}
                >
                  <View style={styles.quickActionIcon}>
                    <TrendingUp size={32} color={theme.success} />
                  </View>
                  <Text style={styles.quickActionTitle}>Add Income</Text>
                  <Text style={styles.quickActionSubtitle}>Record new income</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Add Options Modal */}
          <Modal
            visible={showAddOptionsModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowAddOptionsModal(false)}
          >
            <TouchableOpacity
              style={styles.addOptionsOverlay}
              activeOpacity={1}
              onPress={() => setShowAddOptionsModal(false)}
            >
              <TouchableOpacity
                style={styles.addOptionsContainer}
                activeOpacity={1}
                onPress={(e) => e.stopPropagation()}
              >
                <View style={styles.addOptionsHeader}>
                  <Text style={styles.addOptionsTitle}>Add Transaction</Text>
                  <TouchableOpacity
                    style={styles.closeOptionsButton}
                    onPress={() => setShowAddOptionsModal(false)}
                  >
                    <X size={24} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.addOptionButton}
                  onPress={handleAddIncome}
                >
                  <View style={[styles.addOptionIcon, styles.addIncomeIcon]}>
                    <TrendingUp size={24} color={theme.success} />
                  </View>
                  <View style={styles.addOptionContent}>
                    <Text style={styles.addOptionButtonText}>Add Income</Text>
                    <Text style={styles.addOptionSubtext}>Record money you've received</Text>
                  </View>
                  <ChevronRight size={20} color={theme.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.addOptionButton}
                  onPress={handleAddExpense}
                >
                  <View style={[styles.addOptionIcon, styles.addExpenseIcon]}>
                    <TrendingDown size={24} color={theme.error} />
                  </View>
                  <View style={styles.addOptionContent}>
                    <Text style={styles.addOptionButtonText}>Add Expense</Text>
                    <Text style={styles.addOptionSubtext}>Record money you've spent</Text>
                  </View>
                  <ChevronRight size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>

          {/* Existing Modals */}
          <TutorialModal
            visible={showTutorial}
            onClose={handleTutorialClose}
          />

          <IncomeModal
            visible={showIncomeModal}
            onClose={() => setShowIncomeModal(false)}
            onSuccess={loadData}
          />

          <ExpenseModal
            visible={showExpenseModal}
            onClose={() => setShowExpenseModal(false)}
            onSuccess={loadData}
          />
        </SafeAreaView>
      </ConversationalAIProvider>
    </VoiceCommandSuccessProvider>
  );
}