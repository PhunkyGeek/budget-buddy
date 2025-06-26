import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface DropdownOption {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  style?: any;
}

export function CustomDropdown({
  options,
  selectedValue,
  onValueChange,
  placeholder = 'Select an option',
  style,
}: CustomDropdownProps) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownLayout, setDropdownLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const dropdownRef = useRef<View>(null);

  const selectedOption = options.find(option => option.value === selectedValue);

  const handleToggle = () => {
    if (!isOpen) {
      // Measure dropdown position before opening
      dropdownRef.current?.measure((x, y, width, height, pageX, pageY) => {
        setDropdownLayout({ x: pageX, y: pageY + height, width, height });
        setIsOpen(true);
      });
    } else {
      setIsOpen(false);
    }
  };

  const handleSelect = (value: string) => {
    onValueChange(value);
    setIsOpen(false);
  };

  const styles = StyleSheet.create({
    container: {
      position: 'relative',
    },
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      minHeight: 48,
    },
    triggerText: {
      flex: 1,
      fontSize: 16,
      color: selectedOption ? theme.text : theme.textSecondary,
    },
    chevron: {
      marginLeft: 8,
    },
    overlay: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    dropdown: {
      position: 'absolute',
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      maxHeight: 200,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
      zIndex: 1000,
    },
    option: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    optionLast: {
      borderBottomWidth: 0,
    },
    optionSelected: {
      backgroundColor: theme.primary + '20',
    },
    optionText: {
      fontSize: 16,
      color: theme.text,
    },
    optionTextSelected: {
      color: theme.primary,
      fontWeight: '600',
    },
  });

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <TouchableOpacity
          ref={dropdownRef}
          style={styles.trigger}
          onPress={handleToggle}
          activeOpacity={0.7}
        >
          <Text style={styles.triggerText} numberOfLines={1}>
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
          <View style={styles.chevron}>
            {isOpen ? (
              <ChevronUp size={20} color={theme.textSecondary} />
            ) : (
              <ChevronDown size={20} color={theme.textSecondary} />
            )}
          </View>
        </TouchableOpacity>

        {isOpen && (
          <Modal
            transparent
            visible={isOpen}
            onRequestClose={() => setIsOpen(false)}
          >
            <TouchableOpacity
              style={styles.overlay}
              activeOpacity={1}
              onPress={() => setIsOpen(false)}
            >
              <View
                style={[
                  styles.dropdown,
                  {
                    left: dropdownLayout.x,
                    top: dropdownLayout.y,
                    width: dropdownLayout.width,
                  },
                ]}
              >
                <ScrollView showsVerticalScrollIndicator={false}>
                  {options.map((option, index) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.option,
                        index === options.length - 1 && styles.optionLast,
                        option.value === selectedValue && styles.optionSelected,
                      ]}
                      onPress={() => handleSelect(option.value)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          option.value === selectedValue && styles.optionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        )}
      </View>
    );
  }

  // For mobile platforms, return null as we'll use the native Picker
  return null;
}