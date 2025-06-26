import { Platform, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { supabase } from './supabaseService';

export interface VoiceCommand {
  type: 'income' | 'expense' | 'show_budget' | 'unknown';
  amount?: number;
  source?: string;
  category?: string;
  text: string;
}

export interface VoiceResponse {
  success: boolean;
  command: VoiceCommand;
  message: string;
  audioResponse?: string;
}

export class VoiceService {
  private apiKey: string;
  private baseUrl: string = 'https://api.elevenlabs.io/v1';

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || '';
    
    // Configure audio for mobile platforms
    if (Platform.OS !== 'web') {
      this.configureAudio();
    }
  }

  private async configureAudio(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Audio configuration error:', error);
    }
  }

  async speechToText(audioFileUri: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    try {
      console.log('Converting speech to text with ElevenLabs...');
      
      // Read the audio file as base64
      const base64Audio = await FileSystem.readAsStringAsync(audioFileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Convert base64 to ArrayBuffer
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Create FormData for the API request
      const formData = new FormData();
      const audioBlob = new Blob([bytes], { type: 'audio/mp4' });
      formData.append('file', audioBlob, 'recording.mp4');
      formData.append('model_id', 'scribe_v1');
      formData.append('language_code', 'eng');

      const response = await fetch(`${this.baseUrl}/speech-to-text`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('STT API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`STT request failed: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log('STT response:', data);
      
      return data.text || '';
    } catch (error) {
      console.error('Speech-to-text error:', error);
      throw error;
    }
  }

  async processVoiceCommand(textInput: string | null, audioFileUri: string | null, userId: string): Promise<VoiceResponse> {
    try {
      let transcribedText = textInput;

      // If we have an audio file (mobile platform), convert it to text
      if (audioFileUri && Platform.OS !== 'web') {
        try {
          transcribedText = await this.speechToText(audioFileUri);
          console.log('Transcribed text:', transcribedText);
        } catch (sttError) {
          console.error('Speech-to-text failed, using fallback:', sttError);
          // Fallback to simulation if STT fails
          transcribedText = await this.simulateSpeechToText();
        }
      }

      if (!transcribedText) {
        throw new Error('No text input provided');
      }

      // Call the Supabase Edge Function to parse and process the command
      const { data, error } = await supabase.functions.invoke('parse-voice', {
        body: { text: transcribedText, userId }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      // Generate audio response if successful
      if (data.success && data.audioResponse) {
        try {
          const audioUrl = await this.textToSpeech(data.audioResponse);
          if (audioUrl) {
            // Play the audio response
            await this.playAudio(audioUrl);
          }
        } catch (audioError) {
          console.error('Audio generation error:', audioError);
          // Continue without audio - don't fail the whole operation
        }
      }

      return data;
    } catch (error) {
      console.error('Voice command processing error:', error);
      return {
        success: false,
        command: { type: 'unknown', text: textInput || '' },
        message: 'Sorry, I couldn\'t process that command. Please try again.'
      };
    }
  }

  async textToSpeech(text: string, voiceId: string = 'pNInz6obpgDQGcFmaJgB'): Promise<string | null> {
    if (!this.apiKey) {
      console.log('TTS skipped: Missing API key');
      return null;
    }

    try {
      console.log('Making TTS request to ElevenLabs...');
      
      const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          output_format: 'mp3_44100_128',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.0,
            use_speaker_boost: true,
            speed: 1.0,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('TTS API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`TTS request failed: ${response.status} - ${response.statusText}`);
      }

      console.log('TTS request successful, processing audio...');
      
      const arrayBuffer = await response.arrayBuffer();
      
      // Convert to base64 for playback
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < uint8Array.byteLength; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      const base64Audio = btoa(binary);
      
      return `data:audio/mpeg;base64,${base64Audio}`;
    } catch (error) {
      console.error('TTS Error:', error);
      
      // Show user-friendly error message
      if (error instanceof Error && error.message.includes('401')) {
        Alert.alert(
          'Voice Feature Unavailable',
          'The voice response feature requires a valid ElevenLabs API key. The command was processed successfully, but audio feedback is not available.',
          [{ text: 'OK' }]
        );
      }
      
      return null;
    }
  }

  async playAudio(audioUrl: string): Promise<void> {
    if (Platform.OS === 'web') {
      // For web, use HTML5 Audio API
      try {
        const audio = new Audio(audioUrl);
        await audio.play();
      } catch (error) {
        console.error('Web audio playback error:', error);
      }
    } else {
      // For mobile, use expo-av
      try {
        console.log('Playing audio on mobile...');
        
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: true, volume: 1.0 }
        );

        // Set up playback status update
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync();
          }
        });

        await sound.playAsync();
      } catch (error) {
        console.error('Mobile audio playback error:', error);
      }
    }
  }

  // Simulate speech-to-text for demo purposes (used as fallback)
  async simulateSpeechToText(): Promise<string> {
    const sampleCommands = [
      "Add $50 for groceries",
      "Add $2000 from salary to my income",
      "Spend $25 on transportation",
      "Add $100 from freelance to my income",
      "Deduct $15 for coffee",
      "Show my budget"
    ];
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const randomCommand = sampleCommands[Math.floor(Math.random() * sampleCommands.length)];
        resolve(randomCommand);
      }, 2000);
    });
  }

  parseVoiceCommand(text: string): VoiceCommand {
    const lowercaseText = text.toLowerCase().trim();

    // Parse income commands: "add $2000 from salary to my income"
    const incomeMatch = lowercaseText.match(/add\s+\$?(\d+(?:\.\d{2})?)\s+from\s+(.+?)\s+to\s+(?:my\s+)?income/);
    if (incomeMatch) {
      return {
        type: 'income',
        amount: parseFloat(incomeMatch[1]),
        source: incomeMatch[2].trim(),
        text
      };
    }

    // Parse expense commands: "deduct $50 for groceries" or "spend $50 on groceries"
    const expenseMatch = lowercaseText.match(/(?:deduct|spend|spent)\s+\$?(\d+(?:\.\d{2})?)\s+(?:for|on)\s+(.+)/);
    if (expenseMatch) {
      return {
        type: 'expense',
        amount: parseFloat(expenseMatch[1]),
        category: expenseMatch[2].trim(),
        text
      };
    }

    // Parse budget query: "show my budget"
    if (lowercaseText.includes('show') && lowercaseText.includes('budget')) {
      return {
        type: 'show_budget',
        text
      };
    }

    return {
      type: 'unknown',
      text
    };
  }

  // Method to test API key validity
  async testApiKey(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        method: 'GET',
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('API key test error:', error);
      return false;
    }
  }
}

export const voiceService = new VoiceService();