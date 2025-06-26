import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Shield, Eye, Database, ExternalLink } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function PrivacyScreen() {
  const { theme } = useTheme();

  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
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
    infoItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    infoItemLast: {
      borderBottomWidth: 0,
    },
    infoIcon: {
      marginRight: 16,
      marginTop: 2,
    },
    infoContent: {
      flex: 1,
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    infoDescription: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    linkButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.primary,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginTop: 8,
    },
    linkButtonText: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '600',
      marginRight: 8,
    },
    highlightText: {
      color: theme.primary,
      fontWeight: '600',
    },
    bulletPoint: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
      marginBottom: 8,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Collection</Text>
          
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Database size={24} color={theme.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>What We Collect</Text>
              <Text style={styles.infoDescription}>
                We collect only the data necessary to provide our budgeting services:
              </Text>
              <Text style={styles.bulletPoint}>• Personal information (name, email)</Text>
              <Text style={styles.bulletPoint}>• Financial data (income, expenses, categories)</Text>
              <Text style={styles.bulletPoint}>• Voice commands (processed locally when possible)</Text>
              <Text style={styles.bulletPoint}>• Usage analytics (anonymized)</Text>
            </View>
          </View>

          <View style={[styles.infoItem, styles.infoItemLast]}>
            <View style={styles.infoIcon}>
              <Shield size={24} color={theme.success} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Data Security</Text>
              <Text style={styles.infoDescription}>
                Your financial data is encrypted and stored securely using <Text style={styles.highlightText}>Supabase</Text> with industry-standard security measures.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Controls</Text>
          
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Eye size={24} color={theme.secondary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Data Visibility</Text>
              <Text style={styles.infoDescription}>
                Only you can access your financial data. We never share your personal financial information with third parties without your explicit consent.
              </Text>
            </View>
          </View>

          <View style={[styles.infoItem, styles.infoItemLast]}>
            <View style={styles.infoIcon}>
              <Shield size={24} color={theme.accent} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Voice Data</Text>
              <Text style={styles.infoDescription}>
                Voice commands are processed using <Text style={styles.highlightText}>ElevenLabs</Text> API. Audio data is not stored permanently and is used only for command processing.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Rights</Text>
          
          <View style={styles.infoContent}>
            <Text style={styles.infoDescription}>
              You have the right to:
            </Text>
            <Text style={styles.bulletPoint}>• Access all your stored data</Text>
            <Text style={styles.bulletPoint}>• Request data correction or deletion</Text>
            <Text style={styles.bulletPoint}>• Export your data</Text>
            <Text style={styles.bulletPoint}>• Opt out of data collection</Text>
            <Text style={styles.bulletPoint}>• Delete your account and all associated data</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal Information</Text>
          
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => handleOpenLink('https://example.com/privacy-policy')}
          >
            <Text style={styles.linkButtonText}>Full Privacy Policy</Text>
            <ExternalLink size={16} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.linkButton, { marginTop: 12 }]}
            onPress={() => handleOpenLink('https://example.com/terms-of-service')}
          >
            <Text style={styles.linkButtonText}>Terms of Service</Text>
            <ExternalLink size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}