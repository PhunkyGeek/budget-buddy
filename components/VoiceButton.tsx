import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Animated, Platform, Alert } from 'react-native';
import { Mic, MicOff, Loader } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useConversationalAI } from '@/components/ConversationalAIProvider';
import { voiceService } from '@/services/voiceService';

interface VoiceButtonProps {
  onPress?: () => void;
  onSuccess?: () => void; // Callback to trigger reload, passed from HomeScreen
  disabled?: boolean;
}

export function VoiceButton({ onPress, onSuccess, disabled = false }: VoiceButtonProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { 
    isAvailable, 
    isConnected, 
    isProcessing, 
    isRecording,
    startConversation, 
    endConversation, 
    startRecording, 
    stopRecording 
  } = useConversationalAI();
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePress = async () => {
    if (disabled || !user) return;

    // Call external onPress if provided (for backward compatibility)
    if (onPress) {
      onPress();
      return;
    }

    // Scale animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (Platform.OS === 'web') {
      // Web platform - use ElevenLabs SDK or simulation
      if (isAvailable && !isConnected) {
        try {
          await startConversation();
        } catch (error) {
          console.error('Failed to start conversation:', error);
          Alert.alert(
            'Voice Error',
            'Failed to start voice conversation. Please try again.',
            [{ text: 'OK' }]
          );
        }
      } else if (isConnected) {
        try {
          await endConversation();
        } catch (error) {
          console.error('Failed to end conversation:', error);
        }
      } else {
        // Fallback to simulation for web
        if (!isProcessing) {
          try {
            const simulatedText = await voiceService.simulateSpeechToText();
            const response = await voiceService.processVoiceCommand(simulatedText, user.id);
            
            if (response.success) {
              onSuccess?.(); // Trigger reload on success
            } else {
              Alert.alert(
                'Voice Command Failed',
                response.message,
                [{ text: 'OK' }]
              );
            }
          } catch (error) {
            console.error('Voice command error:', error);
            Alert.alert(
              'Voice Command Error',
              'Sorry, there was an error processing your voice command. Please try again.',
              [{ text: 'OK' }]
            );
          }
        }
      }
    } else {
      // Mobile platform - use expo-av for recording
      if (!isRecording) {
        await startRecording();
      } else {
        await stopRecording();
        // Trigger reload after stopping recording, assuming processing is complete
        onSuccess?.();
      }
    }
  };

  const getButtonColor = () => {
    if (isProcessing) return theme.warning;
    if (isRecording || isConnected) return theme.error;
    return theme.primary;
  };

  const getIcon = () => {
    if (isProcessing) return <Loader size={24} color="#ffffff" />;
    if (isRecording || isConnected) return <MicOff size={24} color="#ffffff" />;
    return <Mic size={24} color="#ffffff" />;
  };

  const styles = StyleSheet.create({
    button: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: getButtonColor(),
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
      opacity: disabled ? 0.6 : 1,
    },
  });

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        disabled={disabled || isProcessing}
        activeOpacity={0.8}
      >
        {getIcon()}
      </TouchableOpacity>
    </Animated.View>
  );
}