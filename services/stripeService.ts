import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabaseService';

export interface CheckoutSessionResponse {
  success: boolean;
  sessionUrl?: string;
  sessionId?: string;
  error?: string;
}

export interface PaymentResult {
  success: boolean;
  sessionId?: string;
  error?: string;
}

export class StripeService {
  private publishableKey: string;

  constructor() {
    this.publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
  }

  async createCheckoutSession(amount: number, userId: string): Promise<CheckoutSessionResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-create-checkout-session', {
        body: {
          amount,
          currency: 'usd',
          userId
        }
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        return {
          success: false,
          error: error.message || 'Failed to create checkout session'
        };
      }

      return data;
    } catch (error) {
      console.error('Stripe service error:', error);
      return {
        success: false,
        error: 'Network error occurred'
      };
    }
  }

  async processPayment(sessionUrl: string): Promise<PaymentResult> {
    if (Platform.OS === 'web') {
      return this.processWebPayment(sessionUrl);
    } else {
      return this.processMobilePayment(sessionUrl);
    }
  }

  private async processWebPayment(sessionUrl: string): Promise<PaymentResult> {
    try {
      // For web, redirect directly to Stripe Checkout
      window.location.href = sessionUrl;
      
      // This return won't be reached as the page redirects,
      // but we include it for type safety
      return {
        success: true,
        sessionId: 'redirecting'
      };
    } catch (error) {
      console.error('Web payment error:', error);
      return {
        success: false,
        error: 'Failed to redirect to payment page'
      };
    }
  }

  private async processMobilePayment(sessionUrl: string): Promise<PaymentResult> {
    try {
      // For mobile, use WebBrowser to open Stripe Checkout
      const result = await WebBrowser.openAuthSessionAsync(
        sessionUrl,
        'budgetbuddy://stripe-callback'
      );

      if (result.type === 'success') {
        // Extract session_id from the result URL if available
        const url = new URL(result.url);
        const sessionId = url.searchParams.get('session_id');
        const status = url.searchParams.get('status');

        if (status === 'success' && sessionId) {
          return {
            success: true,
            sessionId
          };
        } else if (status === 'cancelled') {
          return {
            success: false,
            error: 'Payment was cancelled'
          };
        } else {
          return {
            success: false,
            error: 'Payment status unknown'
          };
        }
      } else if (result.type === 'cancel') {
        return {
          success: false,
          error: 'Payment was cancelled'
        };
      } else {
        return {
          success: false,
          error: 'Payment session was dismissed'
        };
      }
    } catch (error) {
      console.error('Mobile payment error:', error);
      return {
        success: false,
        error: 'Failed to open payment page'
      };
    }
  }

  getPublishableKey(): string {
    return this.publishableKey;
  }

  isConfigured(): boolean {
    return !!this.publishableKey;
  }
}

export const stripeService = new StripeService();