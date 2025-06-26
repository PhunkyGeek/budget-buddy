import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ChevronDown } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { CustomDropdown } from './CustomDropdown';

interface PickerOption {
  label: string;
  value: string;
}

interface ThemedPickerProps {
  options: PickerOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  style?: any;
}

export function ThemedPicker({
  options,
  selectedValue,
  onValueChange,
  placeholder = 'Select an option',
  style,
}: ThemedPickerProps) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      position: 'relative',
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      overflow: 'hidden',
    },
    pickerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingRight: 12,
    },
    picker: {
      flex: 1,
      color: theme.text,
      backgroundColor: 'transparent',
      height: 56,
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    chevronContainer: {
      position: 'absolute',
      right: 12,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      pointerEvents: 'none',
    },
  });

  // Use custom dropdown for web
  if (Platform.OS === 'web') {
    return (
      <CustomDropdown
        options={options}
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        placeholder={placeholder}
        style={style}
      />
    );
  }

  // Use native picker for mobile with custom styling
  return (
    <View style={[styles.container, style]}>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={styles.picker}
          dropdownIconColor="transparent" // Hide default icon
          itemStyle={{
            color: theme.text,
            backgroundColor: theme.card,
          }}
        >
          {placeholder && !selectedValue && (
            <Picker.Item 
              label={placeholder} 
              value="" 
              color={theme.textSecondary}
            />
          )}
          {options.map((option) => (
            <Picker.Item
              key={option.value}
              label={option.label}
              value={option.value}
              color={theme.text}
            />
          ))}
        </Picker>
        
        <View style={styles.chevronContainer}>
          <ChevronDown size={20} color={theme.textSecondary} />
        </View>
      </View>
    </View>
  );
}