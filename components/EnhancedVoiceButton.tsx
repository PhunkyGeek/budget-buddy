import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Animated, Platform, Alert, View, Text } from 'react-native';
import { Mic, MicOff, Loader } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useConversationalAI } from '@/components/ConversationalAIProvider';
import { voiceService } from '@/services/voiceService';

interface EnhancedVoiceButtonProps {
  onSuccess?: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function EnhancedVoiceButton({ 
  onSuccess, 
  disabled = false, 
  size = 'medium' 
}: EnhancedVoiceButtonProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { isAvailable, isConnected, startConversation, endConversation, speak } = useConversationalAI();
  
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  const buttonSizes = {
    small: { width: 40, height: 40, borderRadius: 20, iconSize: 20 },
    medium: { width: 48, height: 48, borderRadius: 24, iconSize: 24 },
    large: { width: 56, height: 56, borderRadius: 28, iconSize: 28 },
  };

  const currentSize = buttonSizes[size];

  const handleTranscription = async (transcribedText: string) => {
    if (!user || !transcribedText) return;

    setIsProcessing(true);

    try {
      const response = await voiceService.processVoiceCommand(transcribedText, user.id);
      
      if (response.success) {
        // Play audio response if available and on mobile
        if (response.audioResponse && isAvailable) {
          try {
            await speak(response.audioResponse);
          } catch (error) {
            console.error('Error playing audio response:', error);
          }
        }

        Alert.alert(
          'Voice Command Processed',
          `Command: "${transcribedText}"\n\n${response.message}`,
          [
            {
              text: 'OK',
              onPress: () => {
                onSuccess?.();
              }
            }
          ]
        );
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
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePress = async () => {
    if (disabled || !user) return;

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

    if (isAvailable && isConnected) {
      // Use ElevenLabs Conversational AI
      if (!isListening) {
        try {
          setIsListening(true);
          await startConversation();
        } catch (error) {
          console.error('Failed to start conversation:', error);
          setIsListening(false);
          Alert.alert(
            'Voice Error',
            'Failed to start voice conversation. Please try again.',
            [{ text: 'OK' }]
          );
        }
      } else {
        try {
          await endConversation();
          setIsListening(false);
        } catch (error) {
          console.error('Failed to end conversation:', error);
          setIsListening(false);
        }
      }
    } else {
      // Fallback to simulation
      if (!isListening) {
        setIsListening(true);
        setIsProcessing(true);
        try {
          const simulatedText = await voiceService.simulateSpeechToText();
          await handleTranscription(simulatedText);
          setIsListening(false);
        } catch (error) {
          setIsListening(false);
          setIsProcessing(false);
          console.error('Voice command error:', error);
          Alert.alert(
            'Voice Command Error',
            'Sorry, there was an error processing your voice command. Please try again.',
            [{ text: 'OK' }]
          );
        }
      }
    }
  };

  const getButtonColor = () => {
    if (isProcessing) return theme.warning;
    if (isListening) return theme.error;
    return theme.primary;
  };

  const getIcon = () => {
    if (isProcessing) return <Loader size={currentSize.iconSize} color="#ffffff" />;
    if (isListening) return <MicOff size={currentSize.iconSize} color="#ffffff" />;
    return <Mic size={currentSize.iconSize} color="#ffffff" />;
  };

  const styles = StyleSheet.create({
    container: {
      position: 'relative',
      alignItems: 'center',
    },
    button: {
      width: currentSize.width,
      height: currentSize.height,
      borderRadius: currentSize.borderRadius,
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
    statusIndicator: {
      marginTop: 8,
      alignItems: 'center',
    },
    statusText: {
      fontSize: 10,
      color: theme.textSecondary,
      fontWeight: '600',
    },
    availabilityIndicator: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: isAvailable && isConnected ? theme.success : theme.warning,
      borderWidth: 2,
      borderColor: theme.card,
    },
  });

  const getStatusText = () => {
    if (isProcessing) return 'Processing...';
    if (isListening) return 'Listening...';
    if (isAvailable && isConnected) return 'AI Ready';
    if (isAvailable && !isConnected) return 'Connecting...';
    return 'Simulation Mode';
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        disabled={disabled || isProcessing}
        activeOpacity={0.8}
      >
        {getIcon()}
        <View style={styles.availabilityIndicator} />
      </TouchableOpacity>
      
      <View style={styles.statusIndicator}>
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>
    </Animated.View>
  );
}