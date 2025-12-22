/**
 * Minimalist Welcome Screen - BridgeTime Landing Page
 * Features a calm, spacious design with subtle bridge metaphor
 */

import { SharedColors } from '@/constants/theme';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  const [rulesMounted, setRulesMounted] = useState(false);
  
  // Animation values
  const titleOpacity = useSharedValue(1);
  const buttonScale = useSharedValue(1);
  const rulesProgress = useSharedValue(0);
  const haloProgress = useSharedValue(0);

  useEffect(() => {
    haloProgress.value = withRepeat(
      withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.cubic) }),
      -1,
      true
    );

    return () => {
      cancelAnimation(haloProgress);
    };
  }, [haloProgress]);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const rulesBackdropStyle = useAnimatedStyle(() => ({
    opacity: 0.45 * rulesProgress.value,
  }));

  const rulesPipStyle = useAnimatedStyle(() => ({
    opacity: rulesProgress.value,
    transform: [{ translateY: (1 - rulesProgress.value) * 28 }],
  }));

  const haloStyle = useAnimatedStyle(() => {
    const t = haloProgress.value;
    return {
      opacity: 0.10 + 0.08 * t,
      transform: [{ scale: 1 + 0.06 * t }],
    };
  });

  const handleStart = () => {
    router.push('/setup');
  };

  const openRules = () => {
    setRulesMounted(true);
    rulesProgress.value = withTiming(1, { duration: 260, easing: Easing.out(Easing.cubic) });
  };

  const closeRules = () => {
    rulesProgress.value = withTiming(
      0,
      { duration: 220, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) {
          runOnJS(setRulesMounted)(false);
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      {/* Centered content */}
      <View style={styles.contentContainer}>
        <Animated.View style={[styles.headerContainer, titleStyle, { paddingTop: insets.top + 100 }]}>
          <View style={styles.titleArea}>
            <Animated.View style={[styles.titleHalo, haloStyle]} />
            <View style={styles.titleRow}>
              <Text style={styles.title}>BridgeTime</Text>
            </View>
          </View>
          <Text style={styles.tagline}>Уютный помощник для настольной игры</Text>
        </Animated.View>

        <View style={styles.spacer} />

        {/* Primary CTA button */}
        <Animated.View style={[styles.buttonContainer, buttonStyle]}>
          <Pressable
            style={({ pressed }) => [
              styles.startButton,
              pressed && styles.startButtonPressed,
            ]}
            onPress={handleStart}
          >
            <Text style={styles.startButtonText}>Начать</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.rulesButton,
              pressed && styles.rulesButtonPressed,
            ]}
            onPress={openRules}
          >
            <Text style={styles.rulesButtonText}>Правила</Text>
          </Pressable>
        </Animated.View>

        <View style={styles.spacer} />

        {rulesMounted && (
          <Animated.View style={[styles.rulesPip, rulesPipStyle, { marginTop: 14 }]}>
            <Text style={styles.rulesTitle}>Как играть</Text>
            <Text style={styles.rulesText}>
              1 Возьмите карту из противоположной эпохи{`\n`}
              2 Отсканируйте QR-код на карте{`\n`}
              3 Ответьте на вопрос, чтобы получить сегмент моста{`\n`}
              4 Первый, кто дойдёт до противоположного берега — побеждает!
            </Text>

            <Pressable style={styles.rulesCloseButton} onPress={closeRules}>
              <Text style={styles.rulesCloseText}>Закрыть</Text>
            </Pressable>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SharedColors.background,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  spacer: {
    flex: 1,
    width: '100%',
    maxWidth: 420,
  },
  headerContainer: {
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  title: {
    fontSize: 40,
    fontFamily: 'Nunito_700Bold',
    color: SharedColors.bridgeShadow,
    letterSpacing: 0.5,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  titleArea: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  titleHalo: {
    position: 'absolute',
    width: 92,
    height: 92,
    borderRadius: 999,
    backgroundColor: 'rgba(47, 128, 237, 0.10)',
  },
  tagline: {
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    color: 'rgba(23, 38, 42, 0.70)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  buttonContainer: {
    marginTop: 28,
    alignItems: 'center',
    width: '100%',
  },
  startButton: {
    backgroundColor: SharedColors.river,
    paddingVertical: 16,
    paddingHorizontal: 22,
    borderRadius: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 7,
    minWidth: 260,
    alignItems: 'center',
  },
  startButtonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  startButtonText: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    color: '#FFFFFF',
  },
  rulesButton: {
    marginTop: 14,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 14,
    backgroundColor: SharedColors.grass,
    minWidth: 260,
    alignItems: 'center',
  },
  rulesButtonPressed: {
    opacity: 0.9,
  },
  rulesButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    color: '#FFFFFF',
  },
  rulesPip: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 18,
    backgroundColor: SharedColors.card,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 12,
  },
  rulesTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_700Bold',
    color: '#17262A',
    marginBottom: 10,
  },
  rulesText: {
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    color: 'rgba(23, 38, 42, 0.80)',
    lineHeight: 24,
  },
  rulesCloseButton: {
    marginTop: 16,
    alignSelf: 'flex-end',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  rulesCloseText: {
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    color: 'rgba(23, 38, 42, 0.65)',
  },
});
