import { Platform, Linking, Alert } from 'react-native';
import { stripeService } from './stripeService';

export interface RevenueCatConfig {
  apiKey: string;
  entitlementId: string;
  productId: string;
  sandboxUrl: string;
  stripeProductId: string;
}

export class RevenueCatService {
  private config: RevenueCatConfig;
  private isNativeAvailable: boolean;

  constructor() {
    this.config = {
      apiKey: process.env.EXPO_PUBLIC_REVENUECAT_KEY || '',
      entitlementId: 'pro',
      productId: 'Budget_Buddy_Pro_Annual',
      sandboxUrl: 'https://pay.rev.cat/sandbox/xlzleojzacamrxqw/',
      stripeProductId: 'prod_SZ1In28QIIPWFZ',
    };
    
    // Check if we're in a native environment where RevenueCat can work
    this.isNativeAvailable = Platform.OS !== 'web' && this.hasNativeSupport();
  }

  private hasNativeSupport(): boolean {
    try {
      // Try to import both react-native-purchases and react-native-purchases-ui
      require('react-native-purchases');
      require('react-native-purchases-ui');
      return true;
    } catch (error) {
      return false;
    }
  }

  async openPaywall(userId?: string): Promise<void> {
    // Web platform - use Stripe for subscriptions
    if (Platform.OS === 'web') {
      if (!userId) {
        Alert.alert(
          'User Required',
          'A user ID is required for checkout. Please ensure you are logged in.',
          [{ text: 'OK' }]
        );
        return;
      }

      try {
        // Check if Stripe is configured
        if (!stripeService.isConfigured()) {
          // Fallback to RevenueCat web checkout
          const checkoutUrl = `${this.config.sandboxUrl}${userId}`;
          
          Alert.alert(
            'Upgrade to Pro',
            'You will be redirected to RevenueCat\'s secure checkout page to complete your Pro upgrade.',
            [
              {
                text: 'Cancel',
                style: 'cancel'
              },
              {
                text: 'Continue',
                onPress: async () => {
                  try {
                    await Linking.openURL(checkoutUrl);
                  } catch (error) {
                    console.error('Error opening checkout URL:', error);
                    Alert.alert(
                      'Error',
                      'Unable to open checkout page. Please try again later.',
                      [{ text: 'OK' }]
                    );
                  }
                }
              }
            ]
          );
          return;
        }

        // Use Stripe for web subscriptions
        const callbackOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://budget-budddy.netlify.app';
        const checkoutResponse = await stripeService.createSubscriptionCheckoutSession(
          userId,
          this.config.stripeProductId,
          callbackOrigin
        );

        if (!checkoutResponse.success || !checkoutResponse.sessionUrl) {
          throw new Error(checkoutResponse.error || 'Failed to create checkout session');
        }

        // Redirect to Stripe Checkout
        await stripeService.processPayment(checkoutResponse.sessionUrl);

      } catch (error) {
        console.error('Error with web subscription checkout:', error);
        Alert.alert(
          'Checkout Error',
          'Unable to open checkout page. Please try again later.',
          [{ text: 'OK' }]
        );
      }
      return;
    }

    // Native platforms - use RevenueCat
    if (!this.isNativeAvailable) {
      this.showNativeRequiredAlert();
      return;
    }

    try {
      // Dynamic imports for native environments only
      const Purchases = require('react-native-purchases').default;
      const RevenueCatUI = require('react-native-purchases-ui').default;
      const { PAYWALL_RESULT } = require('react-native-purchases-ui');
      
      // Configure RevenueCat if not already configured
      if (this.config.apiKey) {
        await Purchases.configure({ apiKey: this.config.apiKey });
      }

      // Present the paywall using RevenueCatUI
      const paywallResult = await RevenueCatUI.presentPaywall();

      // Handle the paywall result
      switch (paywallResult) {
        case PAYWALL_RESULT.PURCHASED:
          Alert.alert(
            'Upgrade Successful!',
            'Welcome to Budget Buddy Pro! You now have access to all premium features including AI Budget Expert and Budget Safe.',
            [{ text: 'Awesome!' }]
          );
          break;
        
        case PAYWALL_RESULT.RESTORED:
          Alert.alert(
            'Purchases Restored!',
            'Your Pro subscription has been restored successfully.',
            [{ text: 'Great!' }]
          );
          break;
        
        case PAYWALL_RESULT.CANCELLED:
          // User cancelled, no need to show an alert
          break;
        
        case PAYWALL_RESULT.NOT_PRESENTED:
        case PAYWALL_RESULT.ERROR:
        default:
          Alert.alert(
            'Paywall Error',
            'There was an issue displaying the paywall. Please try again later.',
            [{ text: 'OK' }]
          );
          break;
      }
    } catch (error: any) {
      console.error('RevenueCat paywall error:', error);
      
      Alert.alert(
        'Paywall Error',
        'There was an error displaying the paywall. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  }

  async restorePurchases(): Promise<void> {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Web Platform',
        'Purchase restoration is handled automatically on web. If you have an active subscription, it should be reflected in your account.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!this.isNativeAvailable) {
      this.showNativeRequiredAlert();
      return;
    }

    try {
      const Purchases = require('react-native-purchases').default;
      
      const purchaserInfo = await Purchases.restorePurchases();
      
      if (purchaserInfo.entitlements.active[this.config.entitlementId]) {
        Alert.alert(
          'Purchases Restored!',
          'Your Pro subscription has been restored successfully.',
          [{ text: 'Great!' }]
        );
      } else {
        Alert.alert(
          'No Purchases Found',
          'No active subscriptions were found to restore.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Restore purchases error:', error);
      Alert.alert(
        'Restore Error',
        'There was an error restoring your purchases. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  }

  async checkSubscriptionStatus(): Promise<boolean> {
    if (Platform.OS === 'web') {
      // For web, we can't check subscription status directly
      // This would need to be handled by your backend
      return false;
    }

    if (!this.isNativeAvailable) {
      return false;
    }

    try {
      const Purchases = require('react-native-purchases').default;
      
      const purchaserInfo = await Purchases.getPurchaserInfo();
      return purchaserInfo.entitlements.active[this.config.entitlementId] !== undefined;
    } catch (error) {
      console.error('Subscription status check error:', error);
      return false;
    }
  }

  // Alternative method to present paywall for specific offering
  async openPaywallForOffering(offeringIdentifier?: string, userId?: string): Promise<void> {
    if (Platform.OS === 'web') {
      // For web, redirect to the same checkout URL regardless of offering
      await this.openPaywall(userId);
      return;
    }

    if (!this.isNativeAvailable) {
      this.showNativeRequiredAlert();
      return;
    }

    try {
      const Purchases = require('react-native-purchases').default;
      const RevenueCatUI = require('react-native-purchases-ui').default;
      const { PAYWALL_RESULT } = require('react-native-purchases-ui');
      
      // Configure RevenueCat if not already configured
      if (this.config.apiKey) {
        await Purchases.configure({ apiKey: this.config.apiKey });
      }

      let paywallResult;

      if (offeringIdentifier) {
        // Get specific offering
        const offerings = await Purchases.getOfferings();
        const offering = offerings.all[offeringIdentifier];
        
        if (offering) {
          paywallResult = await RevenueCatUI.presentPaywall({ offering });
        } else {
          throw new Error(`Offering '${offeringIdentifier}' not found`);
        }
      } else {
        // Present default paywall
        paywallResult = await RevenueCatUI.presentPaywall();
      }

      // Handle the paywall result (same as above)
      switch (paywallResult) {
        case PAYWALL_RESULT.PURCHASED:
          Alert.alert(
            'Upgrade Successful!',
            'Welcome to Budget Buddy Pro! You now have access to all premium features.',
            [{ text: 'Awesome!' }]
          );
          break;
        
        case PAYWALL_RESULT.RESTORED:
          Alert.alert(
            'Purchases Restored!',
            'Your Pro subscription has been restored successfully.',
            [{ text: 'Great!' }]
          );
          break;
        
        case PAYWALL_RESULT.CANCELLED:
          break;
        
        case PAYWALL_RESULT.NOT_PRESENTED:
        case PAYWALL_RESULT.ERROR:
        default:
          Alert.alert(
            'Paywall Error',
            'There was an issue displaying the paywall. Please try again later.',
            [{ text: 'OK' }]
          );
          break;
      }
    } catch (error: any) {
      console.error('RevenueCat paywall error:', error);
      Alert.alert(
        'Paywall Error',
        'There was an error displaying the paywall. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  }

  // Method to present paywall only if user doesn't have entitlement
  async openPaywallIfNeeded(userId?: string): Promise<void> {
    if (Platform.OS === 'web') {
      // For web, always show the checkout since we can't check entitlements
      await this.openPaywall(userId);
      return;
    }

    if (!this.isNativeAvailable) {
      this.showNativeRequiredAlert();
      return;
    }

    try {
      const Purchases = require('react-native-purchases').default;
      const RevenueCatUI = require('react-native-purchases-ui').default;
      const { PAYWALL_RESULT } = require('react-native-purchases-ui');
      
      // Configure RevenueCat if not already configured
      if (this.config.apiKey) {
        await Purchases.configure({ apiKey: this.config.apiKey });
      }

      // Present paywall only if user doesn't have the required entitlement
      const paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: this.config.entitlementId
      });

      // Handle the paywall result
      switch (paywallResult) {
        case PAYWALL_RESULT.PURCHASED:
          Alert.alert(
            'Upgrade Successful!',
            'Welcome to Budget Buddy Pro! You now have access to all premium features.',
            [{ text: 'Awesome!' }]
          );
          break;
        
        case PAYWALL_RESULT.RESTORED:
          Alert.alert(
            'Purchases Restored!',
            'Your Pro subscription has been restored successfully.',
            [{ text: 'Great!' }]
          );
          break;
        
        case PAYWALL_RESULT.CANCELLED:
          break;
        
        case PAYWALL_RESULT.NOT_PRESENTED:
          // User already has the entitlement, no paywall needed
          Alert.alert(
            'Already Pro!',
            'You already have access to all Pro features.',
            [{ text: 'Great!' }]
          );
          break;
        
        case PAYWALL_RESULT.ERROR:
        default:
          Alert.alert(
            'Paywall Error',
            'There was an issue displaying the paywall. Please try again later.',
            [{ text: 'OK' }]
          );
          break;
      }
    } catch (error: any) {
      console.error('RevenueCat paywall error:', error);
      Alert.alert(
        'Paywall Error',
        'There was an error displaying the paywall. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  }

  private showNativeRequiredAlert(): void {
    Alert.alert(
      'Native Build Required',
      'RevenueCat requires a native build to function properly. To test in-app purchases:\n\n1. Export your Expo project\n2. Set up a local development environment\n3. Install react-native-purchases and react-native-purchases-ui\n4. Create a development build using Expo Dev Client\n5. Test on a physical device\n\nFor web users, we use Stripe for subscription management.',
      [
        {
          text: 'Learn More',
          onPress: () => {
            Linking.openURL('https://www.revenuecat.com/docs/getting-started/installation/expo');
          }
        },
        {
          text: 'Simulate Purchase',
          onPress: () => {
            this.simulatePurchase();
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  }

  private simulatePurchase(): void {
    Alert.alert(
      'Purchase Simulation',
      'In this demo, we\'re simulating a successful Pro upgrade. In a real app:\n\n• Web users: Stripe handles subscription billing\n• Mobile users: RevenueCat handles App Store/Google Play billing\n• Both platforms update subscription status in your database',
      [
        {
          text: 'Simulate Success',
          onPress: () => {
            Alert.alert(
              'Upgrade Successful!',
              'Welcome to Budget Buddy Pro! You now have access to all premium features including AI Budget Expert and Budget Safe.\n\n(This is a simulation - in production, the user\'s subscription status would be updated in your database)',
              [{ text: 'Awesome!' }]
            );
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  }

  // Utility method to check if RevenueCat is properly configured
  isConfigured(): boolean {
    return !!this.config.apiKey && (this.isNativeAvailable || Platform.OS === 'web');
  }

  // Get configuration for debugging
  getConfig(): RevenueCatConfig & { isNativeAvailable: boolean } {
    return {
      ...this.config,
      isNativeAvailable: this.isNativeAvailable
    };
  }
}

export const revenueCatService = new RevenueCatService();