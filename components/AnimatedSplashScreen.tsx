import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface AnimatedSplashScreenProps {
  onAnimationComplete: () => Promise<void>;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function AnimatedSplashScreen({ onAnimationComplete }: AnimatedSplashScreenProps) {
  const { theme, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start the animation sequence
    const animationSequence = Animated.sequence([
      // Initial fade in and scale up
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // Hold for a moment
      Animated.delay(800),
      // Grow effect
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Shrink back
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 300,
        useNativeDriver: true,
      }),
      // Final settle
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      // Hold before fade out
      Animated.delay(500),
      // Fade out
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animationSequence.start(async (finished) => {
      if (finished) {
        try {
          // Properly handle the async callback with error handling
          await onAnimationComplete();
        } catch (error) {
          console.error('Error in splash screen animation completion:', error);
          // Even if there's an error, we should still proceed to show the app
          // The error is logged but doesn't prevent the app from loading
        }
      }
    });

    // Cleanup function
    return () => {
      animationSequence.stop();
    };
  }, [scaleAnim, opacityAnim, onAnimationComplete]);

  const logoSource = isDark 
    ? require('@/assets/images/logo-dark.png')
    : require('@/assets/images/logo-light.png');

  const backgroundColor = isDark ? '#000000' : '#ffffff';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
    },
    logoContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    logo: {
      width: screenWidth * 0.7,
      height: screenHeight * 0.15,
      resizeMode: 'contain',
    },
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image source={logoSource} style={styles.logo} />
      </Animated.View>
    </View>
  );
}