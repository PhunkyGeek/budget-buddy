import { Platform, Linking, Alert } from 'react-native';

export interface RevenueCatConfig {
  apiKey: string;
  entitlementId: string;
  productId: string;
}

export class RevenueCatService {
  private config: RevenueCatConfig;
  private isNativeAvailable: boolean;

  constructor() {
    this.config = {
      apiKey: process.env.EXPO_PUBLIC_REVENUECAT_KEY || '',
      entitlementId: 'pro',
      productId: 'Budget_Buddy_Pro_Annual',
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

  async openPaywall(): Promise<void> {
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
  async openPaywallForOffering(offeringIdentifier?: string): Promise<void> {
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
  async openPaywallIfNeeded(): Promise<void> {
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
      'RevenueCat requires a native build to function properly. To test in-app purchases:\n\n1. Export your Expo project\n2. Set up a local development environment\n3. Install react-native-purchases and react-native-purchases-ui\n4. Create a development build using Expo Dev Client\n5. Test on a physical device\n\nFor now, we\'ll simulate the purchase flow.',
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
      'In this demo, we\'re simulating a successful Pro upgrade. In a real app with native build, this would:\n\n1. Display your "Budget Buddy" paywall from RevenueCat dashboard\n2. Process the actual purchase through App Store/Google Play\n3. Update the user\'s subscription status\n4. Grant access to Pro features',
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
    return !!this.config.apiKey && this.isNativeAvailable;
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