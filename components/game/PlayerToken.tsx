/**
 * PlayerToken - Represents a player on the bridge
 * Animates movement as progress is made
 */

import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { PastColors, PresentColors, SharedColors } from '@/constants/theme';
import { PlayerRole } from '@/types/game';

interface PlayerTokenProps {
  role: PlayerRole;
  name: string;
  position: number;
  isCurrentTurn: boolean;
  isMoving?: boolean;
}

export function PlayerToken({
  role,
  name,
  position,
  isCurrentTurn,
  isMoving = false,
}: PlayerTokenProps) {
  const colors = role === 'past' ? PastColors : PresentColors;
  const bounceValue = useSharedValue(0);
  const glowValue = useSharedValue(isCurrentTurn ? 1 : 0);

  useEffect(() => {
    if (isMoving) {
      // Happy bounce when moving forward
      bounceValue.value = withSequence(
        withSpring(-15, { damping: 8, stiffness: 300 }),
        withSpring(0, { damping: 10, stiffness: 200 })
      );
    }
  }, [position, isMoving]);

  useEffect(() => {
    glowValue.value = withSpring(isCurrentTurn ? 1 : 0, {
      damping: 15,
      stiffness: 100,
    });
  }, [isCurrentTurn]);

  const tokenStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounceValue.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowValue.value * 0.6,
    transform: [{ scale: 1 + glowValue.value * 0.2 }],
  }));

  // Get initials for the token
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Animated.View style={[styles.container, tokenStyle]}>
      {/* Glow effect when it's this player's turn */}
      <Animated.View
        style={[
          styles.glow,
          { backgroundColor: colors.glow },
          glowStyle,
        ]}
      />

      {/* Token body */}
      <View style={[styles.token, { backgroundColor: colors.primary }]}>
        <View style={[styles.tokenInner, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.initials, { color: colors.background }]}>
            {initials || (role === 'past' ? '⏳' : '⌛')}
          </Text>
        </View>
      </View>

      {/* Role indicator */}
      <View style={[styles.roleIndicator, { backgroundColor: colors.accent }]}>
        <Text style={styles.roleIcon}>
          {role === 'past' ? '📜' : '✨'}
        </Text>
      </View>

      {/* Name label */}
      <View style={[styles.nameLabel, { backgroundColor: colors.background }]}>
        <Text
          style={[styles.nameText, { color: colors.text }]}
          numberOfLines={1}
        >
          {name}
        </Text>
      </View>
    </Animated.View>
  );
}

interface PlayerBankProps {
  role: PlayerRole;
  name: string;
  score: number;
  isCurrentTurn: boolean;
}

export function PlayerBank({ role, name, score, isCurrentTurn }: PlayerBankProps) {
  const colors = role === 'past' ? PastColors : PresentColors;
  const pulseValue = useSharedValue(1);

  useEffect(() => {
    if (isCurrentTurn) {
      pulseValue.value = withSequence(
        withSpring(1.05, { damping: 10 }),
        withSpring(1, { damping: 15 })
      );
    }
  }, [isCurrentTurn]);

  const bankStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.bank,
        { backgroundColor: colors.background, borderColor: colors.border },
        isCurrentTurn && { borderColor: colors.primary, borderWidth: 3 },
        bankStyle,
      ]}
    >
      <Text style={styles.bankEmoji}>
        {role === 'past' ? '🏛️' : '🏙️'}
      </Text>
      <Text style={[styles.bankName, { color: colors.text }]} numberOfLines={1}>
        {name}
      </Text>
      <View style={[styles.scoreContainer, { backgroundColor: colors.primary }]}>
        <Text style={[styles.scoreText, { color: colors.background }]}>
          {score}
        </Text>
      </View>
      {isCurrentTurn && (
        <View style={[styles.turnIndicator, { backgroundColor: SharedColors.gold }]}>
          <Text style={styles.turnText}>Your Turn</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    top: -10,
  },
  token: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  tokenInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 16,
    fontWeight: '700',
  },
  roleIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleIcon: {
    fontSize: 12,
  },
  nameLabel: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  nameText: {
    fontSize: 12,
    fontWeight: '600',
    maxWidth: 80,
  },
  bank: {
    width: 120,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bankEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  bankName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  scoreContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '700',
  },
  turnIndicator: {
    position: 'absolute',
    top: -10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  turnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
});

export default PlayerToken;
