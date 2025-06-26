import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CircleHelp as HelpCircle, ChevronDown, ChevronRight, Mail, MessageCircle, ExternalLink, Mic, DollarSign, Shield, MessageSquare } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'voice' | 'budgeting' | 'account' | 'technical';
}

export default function HelpSupportScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqData: FAQItem[] = [
    {
      id: '1',
      category: 'voice',
      question: 'How do I use voice commands?',
      answer: 'Tap the microphone button and speak naturally. Try saying "Add $50 for groceries" or "Add $2000 from salary to my income". The AI will parse your command and add the transaction automatically.',
    },
    {
      id: '2',
      category: 'voice',
      question: 'What voice commands are supported?',
      answer: 'You can add expenses with "Spend $X on [category]", add income with "Add $X from [source] to my income", and view your budget with "Show my budget". More commands are being added regularly.',
    },
    {
      id: '3',
      category: 'budgeting',
      question: 'How do I set up my monthly budget?',
      answer: 'Start by adding your income sources, then track your expenses by category. The app automatically calculates your remaining budget and provides insights on your spending patterns.',
    },
    {
      id: '4',
      category: 'budgeting',
      question: 'Can I create custom categories?',
      answer: 'Yes! When adding an expense or income, you can select "Add Custom Category" or "Add Custom Source" to create your own categories that fit your lifestyle.',
    },
    {
      id: '5',
      category: 'account',
      question: 'What\'s included in the Pro plan?',
      answer: 'Pro includes AI Budget Expert for personalized insights, Budget Safe for secure savings goals, advanced analytics, priority support, and enhanced voice features.',
    },
    {
      id: '6',
      category: 'technical',
      question: 'Is my financial data secure?',
      answer: 'Yes, all data is encrypted and stored securely using Supabase with industry-standard security measures. Your data is never shared with third parties without your consent.',
    },
  ];

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@budgetbuddy.app?subject=Budget Buddy Support');
  };

  const handleOpenChat = () => {
    // This would open a chat widget or support system
    console.log('Opening chat support...');
  };

  const handleFeedback = () => {
    router.push('/account/feedback');
  };

  const getCategoryIcon = (category: FAQItem['category']) => {
    switch (category) {
      case 'voice':
        return <Mic size={16} color={theme.primary} />;
      case 'budgeting':
        return <DollarSign size={16} color={theme.success} />;
      case 'account':
        return <Shield size={16} color={theme.secondary} />;
      case 'technical':
        return <HelpCircle size={16} color={theme.accent} />;
      default:
        return <HelpCircle size={16} color={theme.textSecondary} />;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    section: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.border,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 16,
    },
    faqItem: {
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      paddingVertical: 16,
    },
    faqItemLast: {
      borderBottomWidth: 0,
    },
    faqHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    faqQuestion: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    faqCategoryIcon: {
      marginRight: 12,
    },
    faqQuestionText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      flex: 1,
    },
    faqToggle: {
      padding: 4,
    },
    faqAnswer: {
      marginTop: 12,
      paddingLeft: 28,
    },
    faqAnswerText: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    contactItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    contactItemLast: {
      borderBottomWidth: 0,
    },
    contactIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    contactContent: {
      flex: 1,
    },
    contactTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    contactDescription: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    contactChevron: {
      marginLeft: 8,
    },
    infoText: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
      fontStyle: 'italic',
      marginTop: 20,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {faqData.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.faqItem,
                index === faqData.length - 1 && styles.faqItemLast
              ]}
              onPress={() => toggleFAQ(item.id)}
            >
              <View style={styles.faqHeader}>
                <View style={styles.faqQuestion}>
                  <View style={styles.faqCategoryIcon}>
                    {getCategoryIcon(item.category)}
                  </View>
                  <Text style={styles.faqQuestionText}>{item.question}</Text>
                </View>
                
                <View style={styles.faqToggle}>
                  {expandedFAQ === item.id ? (
                    <ChevronDown size={20} color={theme.textSecondary} />
                  ) : (
                    <ChevronRight size={20} color={theme.textSecondary} />
                  )}
                </View>
              </View>
              
              {expandedFAQ === item.id && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{item.answer}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          
          <TouchableOpacity
            style={styles.contactItem}
            onPress={handleContactSupport}
          >
            <View style={styles.contactIcon}>
              <Mail size={20} color={theme.primary} />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>Email Support</Text>
              <Text style={styles.contactDescription}>
                Get help via email - we typically respond within 24 hours
              </Text>
            </View>
            <View style={styles.contactChevron}>
              <ExternalLink size={16} color={theme.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={handleOpenChat}
          >
            <View style={styles.contactIcon}>
              <MessageCircle size={20} color={theme.secondary} />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>Live Chat</Text>
              <Text style={styles.contactDescription}>
                Chat with our support team in real-time
              </Text>
            </View>
            <View style={styles.contactChevron}>
              <ChevronRight size={16} color={theme.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.contactItem, styles.contactItemLast]}
            onPress={handleFeedback}
          >
            <View style={styles.contactIcon}>
              <MessageSquare size={20} color={theme.accent} />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>Feedback</Text>
              <Text style={styles.contactDescription}>
                Share your thoughts and help us improve the app
              </Text>
            </View>
            <View style={styles.contactChevron}>
              <ChevronRight size={16} color={theme.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.infoText}>
          Budget Buddy v1.0.0 - Built with Bolt.new
        </Text>
      </ScrollView>
    </View>
  );
}