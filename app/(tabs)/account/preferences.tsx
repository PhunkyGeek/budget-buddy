import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { Moon, Sun, Smartphone } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function PreferencesScreen() {
  const { theme, isDark, setTheme } = useTheme();
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'auto'>('auto');

  const handleThemeChange = (mode: 'light' | 'dark' | 'auto') => {
    setThemeMode(mode);
    setTheme(mode);
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
      paddingVertical: 12,
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
    themeOptions: {
      marginTop: 12,
    },
    themeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    themeOptionText: {
      fontSize: 16,
      color: theme.text,
      marginLeft: 12,
      flex: 1,
    },
    themeSwitch: {
      marginLeft: 'auto',
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              {isDark ? (
                <Moon size={24} color={theme.primary} />
              ) : (
                <Sun size={24} color={theme.primary} />
              )}
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Theme</Text>
              <Text style={styles.settingDescription}>
                Choose your preferred color scheme
              </Text>
              
              <View style={styles.themeOptions}>
                <View style={styles.themeOption}>
                  <Sun size={20} color={theme.textSecondary} />
                  <Text style={styles.themeOptionText}>Light</Text>
                  <Switch
                    style={styles.themeSwitch}
                    value={themeMode === 'light'}
                    onValueChange={() => handleThemeChange('light')}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor="#ffffff"
                  />
                </View>
                
                <View style={styles.themeOption}>
                  <Moon size={20} color={theme.textSecondary} />
                  <Text style={styles.themeOptionText}>Dark</Text>
                  <Switch
                    style={styles.themeSwitch}
                    value={themeMode === 'dark'}
                    onValueChange={() => handleThemeChange('dark')}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor="#ffffff"
                  />
                </View>
                
                <View style={styles.themeOption}>
                  <Smartphone size={20} color={theme.textSecondary} />
                  <Text style={styles.themeOptionText}>System</Text>
                  <Switch
                    style={styles.themeSwitch}
                    value={themeMode === 'auto'}
                    onValueChange={() => handleThemeChange('auto')}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor="#ffffff"
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language & Region</Text>
          
          <View style={[styles.settingItem, styles.settingItemLast]}>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Language</Text>
              <Text style={styles.settingDescription}>
                English (US) - Coming soon: Multiple language support
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voice Settings</Text>
          
          <View style={[styles.settingItem, styles.settingItemLast]}>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Voice Recognition</Text>
              <Text style={styles.settingDescription}>
                Enhanced voice command processing - Pro feature
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}