import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Animated, Platform, Alert } from 'react-native';
import { Mic, MicOff } from 'lucide-react-native';
import { Audio } from 'expo-av';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { voiceService } from '@/services/voiceService';

interface VoiceButtonProps {
  onPress?: () => void;
  onSuccess?: () => void;
  disabled?: boolean;
}

export function VoiceButton({ onPress, onSuccess, disabled = false }: VoiceButtonProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | undefined>();
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

    if (Platform.OS !== 'web') {
      // Mobile platform - use actual recording
      if (!isListening) {
        await startRecording();
      } else {
        await stopRecording();
      }
    } else {
      // Web platform - use simulation
      if (!isListening) {
        setIsListening(true);
        try {
          const simulatedText = await voiceService.simulateSpeechToText();
          const response = await voiceService.processVoiceCommand(simulatedText, null, user.id);
          
          setIsListening(false);

          if (response.success) {
            Alert.alert(
              'Voice Command Processed',
              `Command: "${simulatedText}"\n\n${response.message}`,
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
          setIsListening(false);
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

  const startRecording = async () => {
    try {
      // Request microphone permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Microphone access is required for voice commands.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      console.log('Starting recording...');
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(newRecording);
      setIsListening(true);
      console.log('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert(
        'Recording Error',
        'Failed to start recording. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      console.log('Stopping recording...');
      setIsListening(false);
      
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(undefined);
      
      console.log('Recording stopped, URI:', uri);

      if (uri) {
        // Process the recorded audio
        try {
          const response = await voiceService.processVoiceCommand(null, uri, user!.id);
          
          if (response.success) {
            Alert.alert(
              'Voice Command Processed',
              response.message,
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
          console.error('Voice command processing error:', error);
          Alert.alert(
            'Voice Command Error',
            'Sorry, there was an error processing your voice command. Please try again.',
            [{ text: 'OK' }]
          );
        }
      }

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsListening(false);
      setRecording(undefined);
      Alert.alert(
        'Recording Error',
        'Failed to stop recording. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const styles = StyleSheet.create({
    button: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: isListening ? theme.error : theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
      opacity: disabled ? 0.6 : 1,
    },
    buttonListening: {
      backgroundColor: theme.error,
    },
  });

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.button, isListening && styles.buttonListening]}
        onPress={handlePress}
        disabled={disabled || (Platform.OS !== 'web' && isListening && !recording)}
        activeOpacity={0.8}
      >
        {isListening ? (
          <MicOff size={24} color="#ffffff" />
        ) : (
          <Mic size={24} color="#ffffff" />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}