import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Platform, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { useAuth } from '@/contexts/AuthContext';
import { useVoiceCommandSuccess } from '@/contexts/VoiceCommandSuccessContext';
import { voiceService } from '@/services/voiceService';
import * as supabaseService from '@/services/supabaseService';

// Import ElevenLabs SDK only for web
let useConversation: any = null;

if (Platform.OS === 'web') {
  try {
    const ElevenLabsReact = require('@11labs/react');
    useConversation = ElevenLabsReact.useConversation;
  } catch (error) {
    console.log('ElevenLabs React SDK not available');
  }
}

interface ConversationalAIContextType {
  isAvailable: boolean;
  isConnected: boolean;
  isProcessing: boolean;
  isRecording: boolean;
  startConversation: () => Promise<void>;
  endConversation: () => Promise<void>;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  speak?: (text: string) => Promise<void>;
  onSuccess?: () => void; // Add onSuccess callback
}

const ConversationalAIContext = createContext<
  ConversationalAIContextType | undefined
>(undefined);

interface ConversationalAIProviderProps {
  children: React.ReactNode;
  onSuccess?: () => void; // Accept onSuccess from parent
}

export function ConversationalAIProvider({
  children,
  onSuccess,
}: ConversationalAIProviderProps) {
  const { user } = useAuth();
  const { triggerSuccess } = useVoiceCommandSuccess();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | undefined>();

  // Initialize ElevenLabs conversation hook for web only
  const conversation =
    Platform.OS === 'web' && useConversation
      ? useConversation({
          onConnect: () => {
            console.log('Connected to ElevenLabs Conversational AI');
          },
          onDisconnect: () => {
            console.log('Disconnected from ElevenLabs Conversational AI');
          },
          onMessage: async (message: any) => {
            console.log('Received message from AI:', message);
            if (message.role === 'user' && message.content) {
              await handleTranscription(message.content);
            }
          },
          onError: (error: any) => {
            console.error('ElevenLabs AI Error:', error);
            setIsProcessing(false);
          },
        })
      : null;

  useEffect(() => {
    const agentId = process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID;
    const apiKey = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;

    if (Platform.OS === 'web') {
      setIsAvailable(!!useConversation && !!agentId && !!apiKey);
    } else {
      setIsAvailable(true);
    }
  }, []);

  const handleTranscription = async (transcribedText: string) => {
    if (!user || !transcribedText) return;

    setIsProcessing(true);

    try {
      console.log('Processing voice command:', transcribedText);
      const response = await voiceService.processVoiceCommand(
        transcribedText,
        user.id
      );

      if (response.success) {
        console.log('Command succeeded, triggering onSuccess');
        if (response.audioResponse) {
          try {
            if (Platform.OS === 'web' && conversation?.speak) {
              await conversation.speak(response.audioResponse);
            }
          } catch (error) {
            console.error('Error playing audio response:', error);
          }
        }
        onSuccess?.(); // Call onSuccess after success
      } else {
        console.log('Voice command failed:', response.message);
      }
    } catch (error) {
      console.error('Voice command error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const startConversation = useCallback(async () => {
    if (!conversation) {
      throw new Error('Conversation not available');
    }

    try {
      const agentId = process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID;
      if (!agentId) {
        throw new Error('Agent ID not configured');
      }

      if (Platform.OS === 'web') {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (error) {
          throw new Error('Microphone permission denied');
        }
      }

      await conversation.startSession({
        agentId: agentId,
        dynamicVariables: {
          platform: Platform.OS,
          userId: user?.id || 'anonymous',
        },
        clientTools: {
          logMessage: async ({ message }: { message: string }) => {
            console.log('AI Log:', message);
          },
          processVoiceCommand: async ({ command }: { command: string }) => {
            console.log('Processing voice command:', command);
            await handleTranscription(command);
          },
          'App-action': async ({
            actionType,
            amount,
            category,
            source,
          }: {
            actionType: string;
            amount: number;
            category?: string;
            source?: string;
          }) => {
            if (!user) {
              throw new Error('User not authenticated');
            }

            setIsProcessing(true);

            try {
              const currentDate = new Date().toISOString().split('T')[0];
              let message = '';
              let audioResponse = '';

              switch (actionType) {
                case 'add_expense':
                  if (!category || !amount) {
                    throw new Error(
                      'Category and amount are required for expenses'
                    );
                  }

                  const categories = await supabaseService.getCategories(
                    user.id
                  );
                  let categoryId = categories.find(
                    (cat) => cat.name.toLowerCase() === category.toLowerCase()
                  )?.id;

                  if (!categoryId) {
                    const newCategory =
                      await supabaseService.createCustomCategory(
                        user.id,
                        category
                      );
                    categoryId = newCategory.id;
                  }

                  await supabaseService.addExpense(
                    user.id,
                    categoryId,
                    amount,
                    currentDate
                  );
                  message = `Added $${amount.toFixed(
                    2
                  )} expense for ${category}.`;
                  audioResponse = `Perfect! I've recorded your $${amount.toFixed(
                    2
                  )} expense for ${category}.`;
                  break;

                case 'add_income':
                  if (!source || !amount) {
                    throw new Error(
                      'Source and amount are required for income'
                    );
                  }

                  const sources = await supabaseService.getIncomeSources(
                    user.id
                  );
                  let sourceId = sources.find(
                    (src) => src.name.toLowerCase() === source.toLowerCase()
                  )?.id;

                  if (!sourceId) {
                    const newSource =
                      await supabaseService.createCustomIncomeSource(
                        user.id,
                        source
                      );
                    sourceId = newSource.id;
                  }

                  await supabaseService.addIncome(
                    user.id,
                    sourceId,
                    amount,
                    currentDate
                  );
                  message = `Added $${amount.toFixed(
                    2
                  )} from ${source} to your income.`;
                  audioResponse = `Great! I've added $${amount.toFixed(
                    2
                  )} from ${source} to your income for today.`;
                  break;

                case 'show_budget':
                  const budgetStats = await supabaseService.getBudgetStatistics(
                    user.id
                  );
                  message = `Your budget summary: $${budgetStats.monthlyIncome.toFixed(
                    2
                  )} income, $${budgetStats.monthlyExpenses.toFixed(
                    2
                  )} expenses, $${(
                    budgetStats.monthlyIncome - budgetStats.monthlyExpenses
                  ).toFixed(2)} remaining.`;
                  audioResponse = `Here's your budget summary for this month. You have $${budgetStats.monthlyIncome.toFixed(
                    2
                  )} in income, you've spent $${budgetStats.monthlyExpenses.toFixed(
                    2
                  )}, leaving you with $${(
                    budgetStats.monthlyIncome - budgetStats.monthlyExpenses
                  ).toFixed(2)} remaining.`;
                  break;

                default:
                  throw new Error(`Unsupported action type: ${actionType}`);
              }

              if (audioResponse && conversation?.speak) {
                try {
                  await conversation.speak(audioResponse);
                } catch (error) {
                  console.error('Error playing audio response:', error);
                }
              }

              console.log('App-action succeeded, triggering onSuccess');
              onSuccess?.(); // Call onSuccess after action
              return { success: true, message };
            } catch (error) {
              console.error('App-action error:', error);
              const errorMessage =
                error instanceof Error
                  ? error.message
                  : 'Unknown error occurred';
              return { success: false, error: errorMessage };
            } finally {
              setIsProcessing(false);
            }
          },
        },
      });
    } catch (error) {
      console.error('Failed to start conversation:', error);
      throw error;
    }
  }, [conversation, user, onSuccess]);

  const endConversation = useCallback(async () => {
    if (!conversation) {
      throw new Error('Conversation not available');
    }

    try {
      await conversation.endSession();
    } catch (error) {
      console.error('Failed to end conversation:', error);
      throw error;
    }
  }, [conversation]);

  const startRecording = useCallback(async () => {
    if (Platform.OS === 'web') {
      return;
    }

    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Microphone access is required for voice commands.',
          [{ text: 'OK' }]
        );
        return;
      }

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
      setIsRecording(true);
      console.log('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert(
        'Recording Error',
        'Failed to start recording. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (Platform.OS === 'web') {
      return;
    }

    if (!recording) return;

    try {
      console.log('Stopping recording...');
      setIsRecording(false);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(undefined);

      console.log('Recording stopped, URI:', uri);

      if (uri) {
        const simulatedText = await voiceService.simulateSpeechToText();
        await handleTranscription(simulatedText);
        onSuccess?.(); // Call onSuccess after processing
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsRecording(false);
      setRecording(undefined);
      Alert.alert(
        'Recording Error',
        'Failed to stop recording. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [recording, onSuccess]);

  const speak = useCallback(
    async (text: string) => {
      if (Platform.OS === 'web' && conversation?.speak) {
        try {
          await conversation.speak(text);
        } catch (error) {
          console.error('Error with text-to-speech:', error);
        }
      }
    },
    [conversation]
  );

  const contextValue: ConversationalAIContextType = {
    isAvailable,
    isConnected: conversation?.status === 'connected' || false,
    isProcessing,
    isRecording,
    startConversation,
    endConversation,
    startRecording,
    stopRecording,
    speak,
    onSuccess, // Propagate onSuccess to context
  };

  return (
    <ConversationalAIContext.Provider value={contextValue}>
      {children}
    </ConversationalAIContext.Provider>
  );
}

export function useConversationalAI() {
  const context = useContext(ConversationalAIContext);
  if (context === undefined) {
    throw new Error(
      'useConversationalAI must be used within a ConversationalAIProvider'
    );
  }
  return context;
}
