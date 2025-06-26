import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { Bell, DollarSign, TrendingUp, Calendar } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    expenseReminders: true,
    budgetAlerts: false,
    monthlyReports: true,
    voiceCommands: true,
  });

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
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
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    settingItemLast: {
      borderBottomWidth: 0,
    },
    settingIcon: {
      marginRight: 16,
    },
    settingContent: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    settingDescription: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 18,
    },
    switch: {
      marginLeft: 16,
    },
    infoText: {
      fontSize: 14,
      color: theme.textSecondary,
      fontStyle: 'italic',
      textAlign: 'center',
      marginTop: 20,
      paddingHorizontal: 20,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Bell size={24} color={theme.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive notifications on your device
              </Text>
            </View>
            <Switch
              style={styles.switch}
              value={notifications.pushNotifications}
              onValueChange={() => handleToggle('pushNotifications')}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget & Expense Alerts</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <DollarSign size={24} color={theme.secondary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Expense Reminders</Text>
              <Text style={styles.settingDescription}>
                Daily reminders to log your expenses
              </Text>
            </View>
            <Switch
              style={styles.switch}
              value={notifications.expenseReminders}
              onValueChange={() => handleToggle('expenseReminders')}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <TrendingUp size={24} color={theme.warning} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Budget Alerts</Text>
              <Text style={styles.settingDescription}>
                Alerts when you're approaching budget limits
              </Text>
            </View>
            <Switch
              style={styles.switch}
              value={notifications.budgetAlerts}
              onValueChange={() => handleToggle('budgetAlerts')}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={[styles.settingItem, styles.settingItemLast]}>
            <View style={styles.settingIcon}>
              <Calendar size={24} color={theme.success} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Monthly Reports</Text>
              <Text style={styles.settingDescription}>
                Monthly summary of your spending and savings
              </Text>
            </View>
            <Switch
              style={styles.switch}
              value={notifications.monthlyReports}
              onValueChange={() => handleToggle('monthlyReports')}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voice Features</Text>
          
          <View style={[styles.settingItem, styles.settingItemLast]}>
            <View style={styles.settingIcon}>
              <Bell size={24} color={theme.accent} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Voice Command Feedback</Text>
              <Text style={styles.settingDescription}>
                Audio confirmation for voice commands
              </Text>
            </View>
            <Switch
              style={styles.switch}
              value={notifications.voiceCommands}
              onValueChange={() => handleToggle('voiceCommands')}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        <Text style={styles.infoText}>
          Note: Some notification features require device permissions and may not be available in the web version.
        </Text>
      </ScrollView>
    </View>
  );
}