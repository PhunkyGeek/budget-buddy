import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Expense, Category } from '@/types/database';

interface ExpenseCardProps {
  expense: Expense & { categories: Category };
  imageUrl?: string;
  onDelete?: () => void;
  showImage?: boolean;
}

export function ExpenseCard({ expense, imageUrl, onDelete, showImage = false }: ExpenseCardProps) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.border,
    },
    cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    imageContainer: {
      marginRight: 12,
    },
    image: {
      width: 60,
      height: 60,
      borderRadius: 8,
      backgroundColor: theme.surface,
    },
    textContainer: {
      flex: 1,
    },
    categoryName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
      textTransform: 'capitalize',
    },
    amount: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.error,
      marginBottom: 2,
    },
    date: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    deleteButton: {
      padding: 8,
      marginLeft: 8,
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        {showImage && imageUrl && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}
        
        <View style={styles.textContainer}>
          <Text style={styles.categoryName}>
            {expense.categories?.name || 'Unknown Category'}
          </Text>
          <Text style={styles.amount}>
            -${expense.amount.toFixed(2)}
          </Text>
          <Text style={styles.date}>
            {formatDate(expense.date)}
          </Text>
        </View>

        {onDelete && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={onDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Trash2 
              size={20} 
              color={theme.error} 
              strokeWidth={2}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}