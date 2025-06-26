import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { X, Lightbulb, PiggyBank, TrendingUp, Shield, CreditCard, Target, ChartBar as BarChart3 } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { BudgetInsight } from '@/services/geminiService';

interface InsightDetailModalProps {
  visible: boolean;
  onClose: () => void;
  insight: BudgetInsight | null;
}

export function InsightDetailModal({ visible, onClose, insight }: InsightDetailModalProps) {
  const { theme } = useTheme();

  if (!insight) return null;

  const getIconComponent = (iconName: string, size: number = 32, color: string = theme.primary) => {
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

  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'savings_tip': return 'Savings Tip';
      case 'investment': return 'Investment Opportunity';
      case 'analysis': return 'Budget Analysis';
      case 'prediction': return 'Financial Prediction';
      default: return 'Financial Insight';
    }
  };

  const getDetailedContent = (insight: BudgetInsight) => {
    // Generate more detailed content based on the insight type and description
    const baseContent = insight.description;
    
    switch (insight.type) {
      case 'savings_tip':
        return `${baseContent}\n\nHere are some actionable steps you can take:\n\n• Review your monthly subscriptions and cancel unused services\n• Set up automatic transfers to your savings account\n• Use the 24-hour rule before making non-essential purchases\n• Consider switching to generic brands for everyday items\n• Track your spending for a week to identify patterns\n\nRemember, small changes in your spending habits can lead to significant savings over time. Even saving an extra $50 per month can add up to $600 per year!`;
      
      case 'investment':
        return `${baseContent}\n\nInvestment considerations:\n\n• Start with low-cost index funds for diversification\n• Consider your risk tolerance and investment timeline\n• Take advantage of employer 401(k) matching if available\n• Build an emergency fund before investing heavily\n• Dollar-cost averaging can help reduce market timing risk\n\nImportant: This is general guidance only. Consider consulting with a financial advisor for personalized investment advice based on your specific situation.`;
      
      case 'analysis':
        return `${baseContent}\n\nDeeper analysis insights:\n\n• Compare this spending to similar households in your area\n• Look for seasonal patterns in your spending\n• Consider if this category aligns with your values and goals\n• Identify opportunities to optimize without sacrificing quality of life\n• Set specific targets for this category next month\n\nRegular budget analysis helps you stay on track and make informed financial decisions. Review your spending patterns monthly to catch trends early.`;
      
      case 'prediction':
        return `${baseContent}\n\nFactors that could affect this prediction:\n\n• Changes in income or employment status\n• Unexpected expenses or financial emergencies\n• Market conditions and inflation rates\n• Life changes (marriage, children, home purchase)\n• Economic factors beyond your control\n\nWhile predictions help with planning, it's important to regularly review and adjust your financial goals. Stay flexible and be prepared to adapt your strategy as circumstances change.`;
      
      default:
        return baseContent;
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
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    closeButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme.surface,
    },
    headerContent: {
      flex: 1,
      marginRight: 16,
    },
    typeLabel: {
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 8,
      lineHeight: 30,
    },
    subtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      lineHeight: 22,
    },
    priorityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 16,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    priorityBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginLeft: 'auto',
    },
    priorityText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#ffffff',
      textTransform: 'uppercase',
    },
    content: {
      flex: 1,
      padding: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 16,
    },
    descriptionText: {
      fontSize: 16,
      color: theme.text,
      lineHeight: 24,
      marginBottom: 24,
    },
    detailsSection: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 24,
    },
    detailsTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 12,
    },
    detailsText: {
      fontSize: 15,
      color: theme.text,
      lineHeight: 22,
    },
    geminiTag: {
      backgroundColor: theme.primary + '20',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 8,
      alignSelf: 'flex-start',
      marginTop: 16,
    },
    geminiTagText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    actionButton: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 24,
      marginBottom: Platform.OS !== 'web' ? 40 : 20,
    },
    actionButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '700',
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
              <View style={styles.headerContent}>
                <Text style={styles.typeLabel}>
                  {getTypeDisplayName(insight.type)}
                </Text>
                <Text style={styles.title}>{insight.title}</Text>
                <Text style={styles.subtitle}>{insight.subtitle}</Text>
              </View>
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.priorityContainer}>
              <View style={[styles.iconContainer, { backgroundColor: insight.color + '20' }]}>
                {getIconComponent(insight.icon, 24, insight.color)}
              </View>
              
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(insight.priority) }]}>
                <Text style={styles.priorityText}>{insight.priority} Priority</Text>
              </View>
            </View>
          </View>

          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.descriptionText}>
              {insight.description}
            </Text>

            <View style={styles.detailsSection}>
              <Text style={styles.detailsTitle}>Detailed Guidance</Text>
              <Text style={styles.detailsText}>
                {getDetailedContent(insight)}
              </Text>
            </View>

            <View style={styles.geminiTag}>
              <Text style={styles.geminiTagText}>
                ✨ Powered by Gemini AI
              </Text>
            </View>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={onClose}
            >
              <Text style={styles.actionButtonText}>Got it, thanks!</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}