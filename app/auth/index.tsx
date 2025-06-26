import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import * as Linking from 'expo-linking';
import { useTheme } from '@/contexts/ThemeContext';
import { signUp, signIn, signInWithGoogle, handleOAuthCallback } from '@/services/supabaseService';

// Complete the auth session for web
WebBrowser.maybeCompleteAuthSession();

const { width: screenWidth } = Dimensions.get('window');

export default function AuthScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  // Handle deep linking for OAuth callback
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      if (url.includes('#access_token=') || url.includes('?code=')) {
        try {
          await handleOAuthCallback(url);
          router.replace('/(tabs)');
        } catch (error: any) {
          console.error('OAuth callback error:', error);
          Alert.alert('Authentication Error', error.message || 'Failed to complete Google sign-in');
        }
      }
    };

    // Handle initial URL if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Listen for incoming links
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => subscription?.remove();
  }, [router]);

  const handleAuth = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (isSignUp && (!formData.firstName || !formData.lastName)) {
      Alert.alert('Error', 'Please enter your first and last name');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(formData.email, formData.password, formData.firstName, formData.lastName);
        Alert.alert('Success', 'Account created successfully!');
      } else {
        await signIn(formData.email, formData.password);
      }
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);

    try {
      const redirectUri = makeRedirectUri({
        scheme: 'budgetbuddy',
        path: '/auth/callback',
      });

      const { url } = await signInWithGoogle(redirectUri);
      
      if (url) {
        if (Platform.OS === 'web') {
          // For web, open in the same window
          window.location.href = url;
        } else {
          // For mobile, use WebBrowser
          const result = await WebBrowser.openAuthSessionAsync(url, redirectUri);
          
          if (result.type === 'success' && result.url) {
            await handleOAuthCallback(result.url);
            router.replace('/(tabs)');
          } else if (result.type === 'cancel') {
            // User cancelled, do nothing
          } else {
            throw new Error('Google sign-in was cancelled or failed');
          }
        }
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      Alert.alert('Error', error.message || 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    gradient: {
      flex: 1,
    },
    content: {
      flex: 1,
      padding: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: '#ffffff',
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: '#ffffff',
      textAlign: 'center',
      marginBottom: 48,
      opacity: 0.9,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 24,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
      width: '100%',
      maxWidth: 400,
      alignSelf: 'center',
    },
    inputContainer: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      backgroundColor: theme.background,
    },
    inputIcon: {
      padding: 12,
    },
    input: {
      flex: 1,
      padding: 12,
      fontSize: 16,
      color: theme.text,
    },
    passwordToggle: {
      padding: 12,
    },
    nameRow: {
      flexDirection: 'row',
      gap: 12,
    },
    nameInput: {
      flex: 1,
    },
    submitButton: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 8,
    },
    submitButtonDisabled: {
      backgroundColor: theme.textSecondary,
    },
    submitButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '700',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 24,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.border,
    },
    dividerText: {
      marginHorizontal: 16,
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    googleButton: {
      backgroundColor: theme.secondary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 12,
      borderWidth: 1,
      borderColor: theme.secondary,
    },
    googleButtonDisabled: {
      backgroundColor: theme.textSecondary,
      borderColor: theme.textSecondary,
    },
    googleButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    googleIconContainer: {
      width: 20,
      height: 20,
      backgroundColor: '#ffffff',
      borderRadius: 2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    googleIconText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.secondary,
    },
    switchButton: {
      marginTop: 24,
      alignItems: 'center',
    },
    switchText: {
      color: theme.textSecondary,
      fontSize: 16,
    },
    switchLink: {
      color: theme.primary,
      fontWeight: '600',
    },
  });

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[theme.primary, theme.secondary]}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Budget Buddy</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </Text>

          <View style={styles.card}>
            {/* Google Sign-In Button */}
            <TouchableOpacity
              style={[styles.googleButton, googleLoading && styles.googleButtonDisabled]}
              onPress={handleGoogleSignIn}
              disabled={googleLoading}
            >
              <View style={styles.googleIconContainer}>
                <Text style={styles.googleIconText}>G</Text>
              </View>
              <Text style={styles.googleButtonText}>
                {googleLoading ? 'Signing in...' : `Continue with Google`}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Email/Password Form */}
            {isSignUp && (
              <View style={styles.nameRow}>
                <View style={[styles.inputContainer, styles.nameInput]}>
                  <Text style={styles.label}>First Name</Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                      <User size={20} color={theme.textSecondary} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Name"
                      placeholderTextColor={theme.textSecondary}
                      value={formData.firstName}
                      onChangeText={(text) => setFormData(prev => ({...prev, firstName: text}))}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                <View style={[styles.inputContainer, styles.nameInput]}>
                  <Text style={styles.label}>Last Name</Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                      <User size={20} color={theme.textSecondary} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Surname"
                      placeholderTextColor={theme.textSecondary}
                      value={formData.lastName}
                      onChangeText={(text) => setFormData(prev => ({...prev, lastName: text}))}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIcon}>
                  <Mail size={20} color={theme.textSecondary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Email"
                  placeholderTextColor={theme.textSecondary}
                  value={formData.email}
                  onChangeText={(text) => setFormData(prev => ({...prev, email: text}))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIcon}>
                  <Lock size={20} color={theme.textSecondary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter password"
                  placeholderTextColor={theme.textSecondary}
                  value={formData.password}
                  onChangeText={(text) => setFormData(prev => ({...prev, password: text}))}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={theme.textSecondary} />
                  ) : (
                    <Eye size={20} color={theme.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleAuth}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsSignUp(!isSignUp)}
            >
              <Text style={styles.switchText}>
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <Text style={styles.switchLink}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}