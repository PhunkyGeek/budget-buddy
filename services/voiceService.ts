import { Platform, Alert } from 'react-native';
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

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || '';
  }

  async processVoiceCommand(transcribedText: string, userId: string): Promise<VoiceResponse> {
    try {
      if (!transcribedText) {
        throw new Error('No text input provided');
      }

      console.log('Processing voice command:', transcribedText);

      // Call the Supabase Edge Function to parse and process the command
      const { data, error } = await supabase.functions.invoke('parse-voice', {
        body: { text: transcribedText, userId }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('Voice command processed successfully:', data);
      return data;
    } catch (error) {
      console.error('Voice command processing error:', error);
      return {
        success: false,
        command: { type: 'unknown', text: transcribedText || '' },
        message: 'Sorry, I couldn\'t process that command. Please try again.'
      };
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

  // Check if API key is configured
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  // Test API key validity
  async testApiKey(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
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