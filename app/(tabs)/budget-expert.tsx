import React, { useState, useEffect, useRef } from 'react';
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
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GraduationCap, Clock as Unlock, Zap, TrendingUp, Shield, PiggyBank, ChartBar as BarChart3, Target, CreditCard, MessageCircle, Send, X, Minimize2, Lightbulb, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Filter, Maximize2 } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { revenueCatService } from '@/services/revenueCatService';
import { getBudgetStatistics } from '@/services/supabaseService';
import { geminiService, BudgetInsight, GeminiMessage } from '@/services/geminiService';
import { InsightDetailModal } from '@/components/InsightDetailModal';

const { width: screenWidth } = Dimensions.get('window');

export default function BudgetExpertScreen() {
  const { theme } = useTheme();
  const { user, profile } = useAuth();
  const [insights, setInsights] = useState<BudgetInsight[]>([]);
  const [budgetStats, setBudgetStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isInsightsHorizontal, setIsInsightsHorizontal] = useState(true);
  
  // Insight detail modal state
  const [showInsightModal, setShowInsightModal] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<BudgetInsight | null>(null);
  
  // Chat state
  const [showMiniChat, setShowMiniChat] = useState(true);
  const [showFullChat, setShowFullChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<GeminiMessage[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m your AI financial assistant. How can I help you optimize your budget today?',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    if (user && profile?.subscription_status === 'pro') {
      loadBudgetData();
    }
  }, [user, profile]);

  // Regenerate insights daily
  useEffect(() => {
    const checkForDailyUpdate = () => {
      const lastUpdate = localStorage.getItem('lastInsightUpdate');
      const today = new Date().toDateString();
      
      if (lastUpdate !== today && budgetStats) {
        loadBudgetData();
        localStorage.setItem('lastInsightUpdate', today);
      }
    };

    if (Platform.OS === 'web' && budgetStats) {
      checkForDailyUpdate();
    }
  }, [budgetStats]);

  const loadBudgetData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const stats = await getBudgetStatistics(user.id);
      setBudgetStats(stats);
      
      // Generate AI insights with more dynamic content
      const aiInsights = await geminiService.generateBudgetInsights(stats);
      setInsights(aiInsights);
    } catch (error) {
      console.error('Error loading budget data:', error);
      Alert.alert('Error', 'Failed to load budget insights');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockPro = async () => {
    try {
      await revenueCatService.openPaywall();
    } catch (error) {
      console.error('Error opening paywall:', error);
    }
  };

  const handleInsightPress = (insight: BudgetInsight) => {
    setSelectedInsight(insight);
    setShowInsightModal(true);
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || chatLoading) return;

    const userMessage: GeminiMessage = {
      role: 'user',
      content: currentMessage.trim(),
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setChatLoading(true);

    try {
      const response = await geminiService.chatWithAssistant([...chatMessages, userMessage], budgetStats);
      
      const assistantMessage: GeminiMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, assistantMessage]);

      // Auto-expand to full chat after first user message
      const userMessageCount = chatMessages.filter(m => m.role === 'user').length + 1;
      if (userMessageCount >= 1 && !showFullChat) {
        setShowFullChat(true);
        setShowMiniChat(false);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: GeminiMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleMaximizeChat = () => {
    setShowFullChat(true);
    setShowMiniChat(false);
  };

  const handleMinimizeChat = () => {
    setShowFullChat(false);
    setShowMiniChat(true);
  };

  const getIconComponent = (iconName: string, size: number = 24, color: string = theme.primary) => {
    const iconMap = {
      'piggy-bank': PiggyBank,
      'trending-up': TrendingUp,
      'bar-chart': BarChart3,
      'shield': Shield,
      'credit-card': CreditCard,
      'target': Target,
      'lightbulb': Lightbulb,
      'crystal-ball': Target, // Fallback
    };
    
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Lightbulb;
    return <IconComponent size={size} color={color} />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return theme.error;
      case 'medium': return theme.warning;
      case 'low': return theme.success;
      default: return theme.textSecondary;
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
      paddingBottom: 150, // Increased space for mini chat
    },
    proHeader: {
      backgroundColor: theme.card,
      paddingTop: Platform.OS !== 'web' ? 60 : 20,
      paddingHorizontal: 20,
      paddingBottom: 24,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
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
      marginBottom: 16,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    statValue: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    section: {
      padding: 20,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 24, // Added space below Expert Predictions header
    },
    filterButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    // Horizontal carousel styles
    horizontalInsightsScrollView: {
      marginHorizontal: -20, // Extend to screen edges
    },
    horizontalInsightsContent: {
      paddingHorizontal: 20,
    },
    horizontalInsightCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      paddingTop: 40, // Added padding to prevent clash with priority badge
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      width: screenWidth * 0.75, // Adjusted width for better responsiveness
      marginRight: 16,
    },
    // Vertical grid styles
    insightsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    insightCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      width: screenWidth > 768 ? '48%' : '100%',
    },
    insightHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      marginTop: 15,
    },
    insightIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    insightContent: {
      flex: 1,
    },
    insightTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 4,
    },
    insightSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 12, // Added space below tags for uniformity
    },
    insightDescription: {
      fontSize: 14,
      color: theme.text,
      lineHeight: 20,
    },
    priorityBadge: {
      position: 'absolute',
      top: 12,
      right: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    priorityText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#ffffff',
      textTransform: 'uppercase',
    },
    geminiTag: {
      backgroundColor: theme.primary + '20',
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      alignSelf: 'flex-start',
      marginTop: 8,
    },
    geminiTagText: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.primary,
      textTransform: 'uppercase',
    },
    // Chat styles
    miniChatContainer: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      right: 20,
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
    },
    chatHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    chatIcon: {
      marginRight: 12, // Added space between icon and title
    },
    chatTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
      flex: 1,
    },
    maximizeButton: {
      padding: 4,
    },
    chatInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    chatInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 14,
      color: theme.text,
      backgroundColor: theme.background,
    },
    sendButton: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      padding: 8,
    },
    // Full chat modal styles
    chatModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    chatModal: {
      flex: 1,
      backgroundColor: theme.card,
      marginTop: Platform.OS !== 'web' ? 60 : 20,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    chatModalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    chatModalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
    },
    chatModalActions: {
      flexDirection: 'row',
      gap: 12,
    },
    chatModalButton: {
      padding: 8,
    },
    chatMessages: {
      flex: 1,
      padding: 20,
    },
    messageContainer: {
      marginBottom: 16,
    },
    userMessage: {
      alignSelf: 'flex-end',
      backgroundColor: theme.primary,
      borderRadius: 16,
      borderBottomRightRadius: 4,
      padding: 12,
      maxWidth: '80%',
    },
    assistantMessage: {
      alignSelf: 'flex-start',
      backgroundColor: theme.surface,
      borderRadius: 16,
      borderBottomLeftRadius: 4,
      padding: 12,
      maxWidth: '80%',
      borderWidth: 1,
      borderColor: theme.border,
    },
    messageText: {
      fontSize: 14,
      lineHeight: 20,
    },
    userMessageText: {
      color: '#ffffff',
    },
    assistantMessageText: {
      color: theme.text,
    },
    messageTime: {
      fontSize: 10,
      color: theme.textSecondary,
      marginTop: 4,
      textAlign: 'right',
    },
    chatInputSection: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: theme.border,
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
          colors={[theme.secondary, theme.primary]}
          style={styles.gradient}
        >
          <View style={styles.proIndicator}>
            <Text style={styles.proIndicatorText}>PRO FEATURE</Text>
          </View>

          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <GraduationCap size={60} color="#ffffff" />
            </View>

            <Text style={styles.title}>Budget Expert</Text>
            <Text style={styles.subtitle}>This is a Pro Feature</Text>
            <Text style={styles.description}>
              Upgrade to Pro to access AI-powered budget insights, personalized recommendations, and analytics.
            </Text>

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Zap size={24} color="rgba(255, 255, 255, 0.9)" />
                </View>
                <Text style={styles.featureText}>AI-powered analysis</Text>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <TrendingUp size={24} color="rgba(255, 255, 255, 0.9)" />
                </View>
                <Text style={styles.featureText}>Saving recommendations</Text>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Shield size={24} color="rgba(255, 255, 255, 0.9)" />
                </View>
                <Text style={styles.featureText}>Expense categorization</Text>
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
        <Text style={styles.proTitle}>Budget Expert</Text>
        <Text style={styles.proSubtitle}>AI-powered insights for your finances</Text>
        
        {budgetStats && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: theme.success }]}>
                ${budgetStats.monthlyIncome.toFixed(0)}
              </Text>
              <Text style={styles.statLabel}>Monthly Income</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: theme.error }]}>
                ${budgetStats.monthlyExpenses.toFixed(0)}
              </Text>
              <Text style={styles.statLabel}>Monthly Expenses</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: budgetStats.savingsRate > 0 ? theme.success : theme.error }]}>
                {budgetStats.savingsRate.toFixed(1)}%
              </Text>
              <Text style={styles.statLabel}>Savings Rate</Text>
            </View>
          </View>
        )}
      </View>

      <ScrollView style={styles.proScrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
          <Text style={styles.loadingText}>Generating AI insights...</Text>
        ) : (
          <>
            {/* Expert Insights Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Expert Insights</Text>
                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={() => setIsInsightsHorizontal(!isInsightsHorizontal)}
                >
                  <Filter size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
              
              {isInsightsHorizontal ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.horizontalInsightsScrollView}
                  contentContainerStyle={styles.horizontalInsightsContent}
                  decelerationRate="fast"
                  snapToInterval={screenWidth * 0.75 + 16}
                  snapToAlignment="start"
                >
                  {insights.slice(0, 3).map((insight) => (
                    <TouchableOpacity 
                      key={insight.id} 
                      style={styles.horizontalInsightCard}
                      onPress={() => handleInsightPress(insight)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(insight.priority) }]}>
                        <Text style={styles.priorityText}>{insight.priority}</Text>
                      </View>
                      
                      <View style={styles.insightHeader}>
                        <View style={[styles.insightIconContainer, { backgroundColor: insight.color + '20' }]}>
                          {getIconComponent(insight.icon, 20, insight.color)}
                        </View>
                        <View style={styles.insightContent}>
                          <Text style={styles.insightTitle}>{insight.title}</Text>
                          <Text style={styles.insightSubtitle}>{insight.subtitle}</Text>
                        </View>
                      </View>
                      
                      <Text style={styles.insightDescription}>{insight.description}</Text>
                      
                      <View style={styles.geminiTag}>
                        <Text style={styles.geminiTagText}>Powered by Gemini AI</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.insightsGrid}>
                  {insights.slice(0, 3).map((insight) => (
                    <TouchableOpacity 
                      key={insight.id} 
                      style={styles.insightCard}
                      onPress={() => handleInsightPress(insight)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(insight.priority) }]}>
                        <Text style={styles.priorityText}>{insight.priority}</Text>
                      </View>
                      
                      <View style={styles.insightHeader}>
                        <View style={[styles.insightIconContainer, { backgroundColor: insight.color + '20' }]}>
                          {getIconComponent(insight.icon, 20, insight.color)}
                        </View>
                        <View style={styles.insightContent}>
                          <Text style={styles.insightTitle}>{insight.title}</Text>
                          <Text style={styles.insightSubtitle}>{insight.subtitle}</Text>
                        </View>
                      </View>
                      
                      <Text style={styles.insightDescription}>{insight.description}</Text>
                      
                      <View style={styles.geminiTag}>
                        <Text style={styles.geminiTagText}>Powered by Gemini AI</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Expert Predictions Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Expert Predictions</Text>
              <View style={styles.insightsGrid}>
                {insights.slice(3, 8).map((insight, index) => (
                  <TouchableOpacity 
                    key={insight.id} 
                    style={[
                      styles.insightCard,
                      // Apply conditional margin only for non-web platforms
                      index === insights.slice(3, 8).length - 1 && Platform.OS !== 'web' && { marginBottom: 130 }
                    ]}
                    onPress={() => handleInsightPress(insight)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(insight.priority) }]}>
                      <Text style={styles.priorityText}>{insight.priority}</Text>
                    </View>
                    
                    <View style={styles.insightHeader}>
                      <View style={[styles.insightIconContainer, { backgroundColor: insight.color + '20' }]}>
                        {getIconComponent(insight.icon, 20, insight.color)}
                      </View>
                      <View style={styles.insightContent}>
                        <Text style={styles.insightTitle}>{insight.title}</Text>
                        <Text style={styles.insightSubtitle}>{insight.subtitle}</Text>
                      </View>
                    </View>
                    
                    <Text style={styles.insightDescription}>{insight.description}</Text>
                    
                    <View style={styles.geminiTag}>
                      <Text style={styles.geminiTagText}>Powered by Gemini AI</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Mini Chat */}
      {showMiniChat && !showFullChat && (
        <View style={styles.miniChatContainer}>
          <View style={styles.chatHeader}>
            <View style={styles.chatIcon}>
              <MessageCircle size={20} color={theme.primary} />
            </View>
            <Text style={styles.chatTitle}>Buddy AI</Text>
            <TouchableOpacity
              style={styles.maximizeButton}
              onPress={handleMaximizeChat}
            >
              <Maximize2 size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.chatInputContainer}>
            <TextInput
              style={styles.chatInput}
              placeholder="Ask about your budget..."
              placeholderTextColor={theme.textSecondary}
              value={currentMessage}
              onChangeText={setCurrentMessage}
              onSubmitEditing={handleSendMessage}
              multiline
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
              disabled={chatLoading || !currentMessage.trim()}
            >
              <Send size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Full Chat Modal */}
      <Modal
        visible={showFullChat}
        animationType="slide"
        onRequestClose={() => setShowFullChat(false)}
      >
        <KeyboardAvoidingView 
          style={styles.chatModalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.chatModal}>
            <View style={styles.chatModalHeader}>
              <Text style={styles.chatModalTitle}>AI Financial Assistant</Text>
              <View style={styles.chatModalActions}>
                <TouchableOpacity
                  style={styles.chatModalButton}
                  onPress={handleMinimizeChat}
                >
                  <Minimize2 size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.chatMessages} showsVerticalScrollIndicator={false}>
              {chatMessages.map((message, index) => (
                <View key={index} style={styles.messageContainer}>
                  <View style={message.role === 'user' ? styles.userMessage : styles.assistantMessage}>
                    <Text style={[
                      styles.messageText,
                      message.role === 'user' ? styles.userMessageText : styles.assistantMessageText
                    ]}>
                      {message.content}
                    </Text>
                    <Text style={styles.messageTime}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              ))}
              {chatLoading && (
                <View style={styles.messageContainer}>
                  <View style={styles.assistantMessage}>
                    <Text style={styles.assistantMessageText}>Thinking...</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.chatInputSection}>
              <View style={styles.chatInputContainer}>
                <TextInput
                  style={styles.chatInput}
                  placeholder="Ask about your budget..."
                  placeholderTextColor={theme.textSecondary}
                  value={currentMessage}
                  onChangeText={setCurrentMessage}
                  onSubmitEditing={handleSendMessage}
                  multiline
                />
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={handleSendMessage}
                  disabled={chatLoading || !currentMessage.trim()}
                >
                  <Send size={16} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Insight Detail Modal */}
      <InsightDetailModal
        visible={showInsightModal}
        onClose={() => setShowInsightModal(false)}
        insight={selectedInsight}
      />
    </SafeAreaView>
  );
}