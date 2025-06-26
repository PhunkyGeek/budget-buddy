import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MessageSquare, Send } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { addFeedback } from '@/services/supabaseService';

export default function FeedbackScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  });

  const handleSubmit = async () => {
    if (!user || !formData.subject.trim() || !formData.message.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      await addFeedback(user.id, formData.subject.trim(), formData.message.trim());
      
      Alert.alert(
        'Success', 
        'Thank you for your feedback! We appreciate your input and will review it carefully.',
        [
          {
            text: 'OK',
            onPress: () => {
              setFormData({ subject: '', message: '' });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
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
    header: {
      alignItems: 'center',
      marginBottom: 32,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    form: {
      flex: 1,
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: theme.text,
      backgroundColor: theme.card,
      minHeight: 48,
    },
    messageInput: {
      minHeight: 120,
      textAlignVertical: 'top',
    },
    submitButton: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 24,
    },
    submitButtonDisabled: {
      backgroundColor: theme.textSecondary,
    },
    submitButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '700',
    },
    infoText: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: 16,
      lineHeight: 20,
    },
  });

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MessageSquare size={40} color="#ffffff" />
          </View>
          <Text style={styles.title}>Share Your Feedback</Text>
          <Text style={styles.subtitle}>
            Help us improve Budget Buddy by sharing your thoughts, suggestions, or reporting any issues you've encountered.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Subject</Text>
            <TextInput
              style={styles.input}
              placeholder="What's this feedback about?"
              placeholderTextColor={theme.textSecondary}
              value={formData.subject}
              onChangeText={(text) => setFormData(prev => ({...prev, subject: text}))}
              autoCapitalize="sentences"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Message</Text>
            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Tell us more about your experience, suggestions, or any issues you've encountered..."
              placeholderTextColor={theme.textSecondary}
              value={formData.message}
              onChangeText={(text) => setFormData(prev => ({...prev, message: text}))}
              multiline
              autoCapitalize="sentences"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Send size={20} color="#ffffff" />
            <Text style={styles.submitButtonText}>
              {loading ? 'Sending...' : 'Send Feedback'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.infoText}>
            Your feedback is valuable to us and helps make Budget Buddy better for everyone. We read every submission and appreciate your time.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}