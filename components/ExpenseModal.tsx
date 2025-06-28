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
import { X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getCategories, 
  addExpense, 
  createCustomCategory 
} from '@/services/supabaseService';
import { Category } from '@/types/database';
import { ThemedPicker } from './ThemedPicker';

interface ExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ExpenseModal({ visible, onClose, onSuccess }: ExpenseModalProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [customCategoryName, setCustomCategoryName] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && user) {
      loadCategories();
    }
  }, [visible, user]);

  const loadCategories = async () => {
    try {
      const data = await getCategories(user!.id);
      setCategories(data);
      if (data.length > 0 && !selectedCategory) {
        setSelectedCategory(data[0].id);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSubmit = async () => {
    if (!user || !amount || !selectedCategory) {
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
      let categoryId = selectedCategory;

      // Create custom category if needed
      if (selectedCategory === 'custom' && customCategoryName.trim()) {
        const customCategory = await createCustomCategory(user.id, customCategoryName.trim());
        categoryId = customCategory.id;
      }

      await addExpense(user.id, categoryId, numericAmount, new Date().toISOString().split('T')[0]);
      
      Alert.alert('Success', 'Expense added successfully!');
      resetForm();
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setCustomCategoryName('');
    setSelectedCategory(categories.length > 0 ? categories[0].id : '');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Prepare picker options
  const pickerOptions = [
    ...categories.map(category => ({
      label: category.name,
      value: category.id,
    })),
    { label: 'Add Custom Category', value: 'custom' },
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
      backgroundColor: theme.background
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
            <Text style={styles.title}>Add Expense</Text>
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

            <Text style={styles.label}>Category</Text>
            <View style={styles.pickerContainer}>
              <ThemedPicker
                options={pickerOptions}
                selectedValue={selectedCategory}
                onValueChange={setSelectedCategory}
                placeholder="Select a category"
              />
            </View>

            {selectedCategory === 'custom' && (
              <>
                <Text style={styles.label}>Custom Category Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter category name"
                  placeholderTextColor={theme.textSecondary}
                  value={customCategoryName}
                  onChangeText={setCustomCategoryName}
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
                {loading ? 'Adding...' : 'Add Expense'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}