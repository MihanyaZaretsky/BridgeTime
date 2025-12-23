/**
 * Victory Screen
 * Celebrates the winning player with emotional bridge completion
 */

import { PastColors, PresentColors, SharedColors } from '@/constants/theme';
import { useGame } from '@/context/GameContext';
import { router } from 'expo-router';
import { useEffect } from 'react';
import {
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Animated, {
    Easing,
    FadeIn,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function VictoryScreen() {
  const insets = useSafeAreaInsets();
  const { game, resetGame } = useGame();

  const winner = game?.winner;
  const winnerName = winner ? game.players[winner].name : 'Игрок';
  const winnerColors = winner === 'past' ? PastColors : PresentColors;
  const winnerEmoji = winner === 'past' ? '📜' : '✨';

  // Animation values
  const bridgeScale = useSharedValue(0);
  const celebrationRotate = useSharedValue(0);
  const particleOpacity = useSharedValue(0);
  const titleScale = useSharedValue(0.5);

  useEffect(() => {
    // Orchestrated celebration animations
    bridgeScale.value = withDelay(
      300,
      withSpring(1, { damping: 8, stiffness: 80 })
    );

    titleScale.value = withDelay(
      600,
      withSpring(1, { damping: 10, stiffness: 100 })
    );

    particleOpacity.value = withDelay(
      800,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1000 }),
          withTiming(0.5, { duration: 1000 })
        ),
        -1,
        true
      )
    );

    celebrationRotate.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(5, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const bridgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bridgeScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
  }));

  const celebrationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${celebrationRotate.value}deg` }],
  }));

  const particleStyle = useAnimatedStyle(() => ({
    opacity: particleOpacity.value,
  }));

  const handlePlayAgain = () => {
    resetGame();
    router.replace('/setup');
  };

  const handleGoHome = () => {
    resetGame();
    router.replace('/');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Celebration particles */}
      <Animated.View style={[styles.particlesContainer, particleStyle]}>
        {[...Array(12)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.particle,
              {
                left: `${10 + (i * 8) % 80}%`,
                top: `${15 + (i * 11) % 50}%`,
                backgroundColor: i % 2 === 0 ? SharedColors.gold : winnerColors.primary,
                transform: [{ scale: 0.5 + (i % 3) * 0.3 }],
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* Completed bridge celebration */}
      <Animated.View style={[styles.bridgeCelebration, bridgeStyle, celebrationStyle]}>
        <Text style={styles.bridgeEmoji}>🌉</Text>
      </Animated.View>

      {/* Victory message */}
      <Animated.View style={[styles.messageContainer, titleStyle]}>
        <View style={[styles.winnerBadge, { backgroundColor: winnerColors.background }]}>
          <Text style={styles.winnerEmoji}>{winnerEmoji}</Text>
        </View>
        
        <Text style={styles.victoryTitle}>Мост построен!</Text>
        
        <Text style={[styles.winnerName, { color: winnerColors.primary }]}>
          {winnerName} победил!
        </Text>
        
        <Text style={styles.victoryMessage}>
          Мост через время построен. Два поколения теперь соединены общими воспоминаниями и пониманием.
        </Text>
      </Animated.View>

      {/* Heartfelt message */}
      <Animated.View
        entering={FadeIn.delay(1200)}
        style={styles.heartfeltContainer}
      >
        <Text style={styles.heartfeltEmoji}>💕</Text>
        <Text style={styles.heartfeltText}>
          Спасибо за это путешествие. Главное сокровище — воспоминания, которые вы разделили.
        </Text>
      </Animated.View>

      {/* Action buttons */}
      <Animated.View
        entering={FadeInUp.delay(1400)}
        style={[styles.buttonsContainer, { paddingBottom: insets.bottom + 20 }]}
      >
        <Pressable
          style={[styles.primaryButton, { backgroundColor: winnerColors.primary }]}
          onPress={handlePlayAgain}
        >
          <Text style={styles.primaryButtonText}>Играть снова</Text>
          <Text style={styles.buttonEmoji}>🔄</Text>
        </Pressable>
        
        <Pressable style={styles.secondaryButton} onPress={handleGoHome}>
          <Text style={styles.secondaryButtonText}>Домой</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PastColors.background, // Dark blue-green background
    alignItems: 'center',
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  particle: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  bridgeCelebration: {
    marginTop: 40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(107, 163, 190, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bridgeEmoji: {
    fontSize: 80,
  },
  messageContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 24,
  },
  winnerBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  winnerEmoji: {
    fontSize: 32,
  },
  victoryTitle: {
    fontSize: 36,
    fontWeight: '300',
    color: SharedColors.bridgeShadow,
    marginBottom: 8,
    letterSpacing: 1,
  },
  winnerName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  victoryMessage: {
    fontSize: 16,
    color: SharedColors.neutral,
    textAlign: 'center',
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 32,
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: SharedColors.bridge,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: SharedColors.neutral,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
  },
  heartfeltContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 32,
    gap: 12,
  },
  heartfeltEmoji: {
    fontSize: 24,
  },
  heartfeltText: {
    flex: 1,
    fontSize: 14,
    color: SharedColors.neutral,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  buttonsContainer: {
    marginTop: 'auto',
    width: '100%',
    paddingHorizontal: 20,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  buttonEmoji: {
    fontSize: 20,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: SharedColors.neutral,
  },
});
