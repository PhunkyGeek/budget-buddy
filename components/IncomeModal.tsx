import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { X, Plus } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getIncomeSources, 
  addIncome, 
  createCustomIncomeSource 
} from '@/services/supabaseService';
import { IncomeSource } from '@/types/database';
import { ThemedPicker } from './ThemedPicker';

interface IncomeModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function IncomeModal({ visible, onClose, onSuccess }: IncomeModalProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [sources, setSources] = useState<IncomeSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [customSourceName, setCustomSourceName] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && user) {
      loadIncomeSources();
    }
  }, [visible, user]);

  const loadIncomeSources = async () => {
    try {
      const data = await getIncomeSources(user!.id);
      setSources(data);
      if (data.length > 0 && !selectedSource) {
        setSelectedSource(data[0].id);
      }
    } catch (error) {
      console.error('Error loading income sources:', error);
    }
  };

  const handleSubmit = async () => {
    if (!user || !amount || !selectedSource) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      let sourceId = selectedSource;

      // Create custom source if needed
      if (selectedSource === 'custom' && customSourceName.trim()) {
        const customSource = await createCustomIncomeSource(user.id, customSourceName.trim());
        sourceId = customSource.id;
      }

      await addIncome(user.id, sourceId, numericAmount, new Date().toISOString().split('T')[0]);
      
      Alert.alert('Success', 'Income added successfully!');
      resetForm();
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error('Error adding income:', error);
      Alert.alert('Error', 'Failed to add income');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setCustomSourceName('');
    setShowCustomInput(false);
    setSelectedSource(sources.length > 0 ? sources[0].id : '');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Prepare picker options
  const pickerOptions = [
    ...sources.map(source => ({
      label: source.name,
      value: source.id,
    })),
    { label: 'Add Custom Source', value: 'custom' },
  ];

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
      maxHeight: '80%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
    },
    closeButton: {
      padding: 4,
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
      padding: 12,
      fontSize: 16,
      color: theme.text,
      backgroundColor: theme.background,
      marginBottom: 16,
    },
    pickerContainer: {
      marginBottom: 16,
    },
    customButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderWidth: 1,
      borderColor: theme.primary,
      borderRadius: 8,
      marginBottom: 16,
    },
    customButtonText: {
      color: theme.primary,
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    submitButton: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    submitButtonDisabled: {
      backgroundColor: theme.textSecondary,
    },
    submitButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '700',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Income</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
            >
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              placeholderTextColor={theme.textSecondary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Income Source</Text>
            <View style={styles.pickerContainer}>
              <ThemedPicker
                options={pickerOptions}
                selectedValue={selectedSource}
                onValueChange={setSelectedSource}
                placeholder="Select an income source"
              />
            </View>

            {(selectedSource === 'custom' || showCustomInput) && (
              <>
                <Text style={styles.label}>Custom Source Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter source name"
                  placeholderTextColor={theme.textSecondary}
                  value={customSourceName}
                  onChangeText={setCustomSourceName}
                />
              </>
            )}

            <TouchableOpacity
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Adding...' : 'Add Income'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}