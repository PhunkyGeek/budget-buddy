import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Linking,
  Animated,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { User, Settings, Bell, Shield, CreditCard, CircleHelp as HelpCircle, ChevronRight, Crown, LogOut, Zap } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

export default function AccountScreen() {
  const { theme } = useTheme();
  const { profile, signOut } = useAuth();
  const router = useRouter();
  
  // Animation refs for the shining effect
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(0)).current;

  const menuItems = [
    {
      id: 'edit-profile',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      icon: User,
      route: '/account/edit-profile',
    },
    {
      id: 'preferences',
      title: 'Preferences',
      subtitle: 'Theme, language, and display settings',
      icon: Settings,
      route: '/account/preferences',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Manage your notification preferences',
      icon: Bell,
      route: '/account/notifications',
    },
    {
      id: 'privacy',
      title: 'Privacy',
      subtitle: 'Data usage and privacy settings',
      icon: Shield,
      route: '/account/privacy',
    },
    {
      id: 'subscriptions',
      title: 'Subscriptions',
      subtitle: 'Manage your Pro subscription',
      icon: CreditCard,
      route: '/account/subscriptions',
    },
    {
      id: 'help-support',
      title: 'Help & Support',
      subtitle: 'FAQ, contact us, and documentation',
      icon: HelpCircle,
      route: '/account/help-support',
    },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleBoltPress = () => {
    // Trigger shining animation
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: false,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: false,
        }),
      ]),
      Animated.sequence([
        Animated.timing(shadowAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false, // Changed to false for shadow properties
        }),
        Animated.timing(shadowAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false, // Changed to false for shadow properties
        }),
      ]),
    ]).start();

    // Open Bolt.new website
    Linking.openURL('https://bolt.new');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    safeArea: {
      flex: 1,
      backgroundColor: theme.card,
    },
    header: {
      backgroundColor: theme.card,
      paddingHorizontal: 20,
      paddingBottom: 24,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 24,
      marginTop: Platform.OS !== 'web' ? 20 : 20,
    },
    profileSection: {
      alignItems: 'center',
      marginBottom: 24,
    },
    profileImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    profileImageText: {
      fontSize: 32,
      fontWeight: '700',
      color: '#ffffff',
    },
    profileName: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 4,
    },
    profileEmail: {
      fontSize: 16,
      color: theme.textSecondary,
      marginBottom: 12,
    },
    subscriptionBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.primary,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
      gap: 6,
      marginBottom: 16,
    },
    subscriptionBadgePro: {
      backgroundColor: theme.secondary,
    },
    subscriptionText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#ffffff',
      textTransform: 'uppercase',
    },
    content: {
      flex: 1,
      padding: 20,
      backgroundColor: theme.background,
    },
    menuItem: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    menuItemIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    menuItemContent: {
      flex: 1,
    },
    menuItemTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    menuItemSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 18,
    },
    menuItemChevron: {
      marginLeft: 8,
    },
    signOutButton: {
      backgroundColor: theme.error,
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 24,
      marginBottom: 32,
    },
    signOutButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '700',
    },
    footer: {
      alignItems: 'center',
      paddingBottom: 20,
    },
    footerText: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 16,
    },
    builtWithBolt: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    boltBadgeContainer: {
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    boltBadgeAnimated: {
      shadowColor: '#6366f1',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.6,
      shadowRadius: 8,
      elevation: 10,
    },
  });

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  const animatedShadowStyle = {
    shadowOpacity: shadowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.25, 0.6],
    }),
    shadowRadius: shadowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [4, 8],
    }),
    elevation: shadowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [5, 10],
    }),
  };

  // Determine badge image based on theme
  const badgeImage = theme.background === '#ffffff' || theme.card === '#ffffff' 
    ? require('@/assets/images/bolt-badge-black.png') // Black badge for light theme
    : require('@/assets/images/bolt-badge-white.png'); // White badge for dark theme

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Account</Text>
          
          <View style={styles.profileSection}>
            <View style={styles.profileImage}>
              <Text style={styles.profileImageText}>
                {getInitials(profile?.first_name, profile?.last_name)}
              </Text>
            </View>
            
            <Text style={styles.profileName}>
              {profile?.first_name} {profile?.last_name}
            </Text>
            
            <Text style={styles.profileEmail}>
              {profile?.email}
            </Text>
            
            <View style={[
              styles.subscriptionBadge,
              profile?.subscription_status === 'pro' && styles.subscriptionBadgePro
            ]}>
              {profile?.subscription_status === 'pro' && (
                <Crown size={14} color="#ffffff" />
              )}
              <Text style={styles.subscriptionText}>
                {profile?.subscription_status === 'pro' ? 'Pro Member' : 'Free Plan'}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => router.push(item.route as any)}
            >
              <View style={styles.menuItemIcon}>
                <item.icon size={20} color={theme.primary} />
              </View>
              
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
              </View>
              
              <View style={styles.menuItemChevron}>
                <ChevronRight size={20} color={theme.textSecondary} />
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <LogOut size={20} color="#ffffff" />
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Budget Buddy v1.0.0</Text>
            <View style={styles.builtWithBolt}>
              <TouchableOpacity 
                onPress={handleBoltPress} 
                activeOpacity={0.8}
              >
                <Animated.View 
                  style={[
                    styles.boltBadgeContainer,
                    animatedShadowStyle,
                    {
                      transform: [{ scale: scaleAnim }],
                      shadowColor: shadowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['#000000', '#6366f1'],
                      }),
                    }
                  ]}
                >
                  <Image
                    source={badgeImage}
                    style={{ width: 130, height: 62, resizeMode: 'contain' }}
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}