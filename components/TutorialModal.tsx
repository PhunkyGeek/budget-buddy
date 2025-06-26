import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Mic, X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface TutorialModalProps {
  visible: boolean;
  onClose: () => void;
}

export function TutorialModal({ visible, onClose }: TutorialModalProps) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modal: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 24,
      width: '100%',
      maxWidth: 400,
      alignItems: 'center',
    },
    header: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginBottom: 16,
    },
    closeButton: {
      padding: 4,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 16,
    },
    description: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: 8,
      lineHeight: 22,
    },
    example: {
      fontSize: 16,
      color: theme.primary,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 32,
      fontStyle: 'italic',
    },
    buttonContainer: {
      width: '100%',
      gap: 12,
    },
    primaryButton: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    primaryButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '700',
    },
    secondaryButton: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    secondaryButtonText: {
      color: theme.text,
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <X size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.iconContainer}>
            <Mic size={36} color="#ffffff" />
          </View>

          <Text style={styles.title}>Welcome to Budget Buddy!</Text>
          
          <Text style={styles.description}>
            Track your finances with the power of your voice. Say commands naturally and let AI handle the rest.
          </Text>
          
          <Text style={styles.example}>
            "Add $2000 from salary to my income"
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onClose}
            >
              <Text style={styles.secondaryButtonText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}