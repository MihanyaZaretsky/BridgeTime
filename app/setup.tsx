/**
 * Game Setup Screen
 * Players select their roles (Past/Present) and enter names
 */

import { AppIcon } from '@/components/ui/app-icon';
import { PastColors, SharedColors } from '@/constants/theme';
import { useGame } from '@/context/GameContext';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SetupScreen() {
  const insets = useSafeAreaInsets();
  const { startGame } = useGame();
  
  const [pastPlayerName, setPastPlayerName] = useState('');
  const [presentPlayerName, setPresentPlayerName] = useState('');
  const [pastFocused, setPastFocused] = useState(false);
  const [presentFocused, setPresentFocused] = useState(false);
  const [showValidationHint, setShowValidationHint] = useState(false);

  const canStart = pastPlayerName.trim().length > 0 && presentPlayerName.trim().length > 0;

  const handleStartGame = () => {
    if (!canStart) {
      setShowValidationHint(true);
      return;
    }

    startGame(pastPlayerName.trim(), presentPlayerName.trim());
    router.replace('/game');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <AppIcon name="chevron-back" size={22} color={styles.iconColor.color} />
          </Pressable>
          <Text style={styles.title}>Кто играет?</Text>
          <Text style={styles.subtitle}>
            Введите имена обоих игроков и распределите роли
          </Text>
        </Animated.View>

        {/* Past Player Card */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(600)}
          style={[styles.playerCard, { backgroundColor: 'rgba(255, 255, 255, 0.92)' }]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.roleIconContainer}>
              <AppIcon name="chatbubble-outline" size={22} color={styles.iconColor.color} />
            </View>
            <View style={styles.roleInfo}>
              <Text style={styles.roleName}>Игрок 1 — Прошлое</Text>
              <Text style={styles.roleDescription}>Вспоминает и рассказывает истории</Text>
            </View>
          </View>
          
          <Text style={styles.inputLabel}>Имя игрока (Прошлое)</Text>
          <TextInput
            style={[styles.input, pastFocused && styles.inputFocused]}
            placeholder="Введите имя"
            placeholderTextColor={'rgba(0,0,0,0.35)'}
            value={pastPlayerName}
            onChangeText={setPastPlayerName}
            autoCapitalize="words"
            returnKeyType="next"
            onFocus={() => setPastFocused(true)}
            onBlur={() => setPastFocused(false)}
          />

          {pastFocused && (
            <Text style={styles.hintText}>Обычно младший игрок</Text>
          )}
        </Animated.View>

        {/* Connection indicator */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.connectionLine}>
          <View style={styles.connectionDot} />
          <View style={styles.connectionBridge}>
            <AppIcon name="swap-horizontal-outline" size={18} color={styles.iconColor.color} />
          </View>
          <View style={styles.connectionDot} />
        </Animated.View>

        {/* Present Player Card */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(600)}
          style={[styles.playerCard, { backgroundColor: 'rgba(255, 255, 255, 0.92)' }]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.roleIconContainer}>
              <AppIcon name="chatbubble-outline" size={22} color={styles.iconColor.color} />
            </View>
            <View style={styles.roleInfo}>
              <Text style={styles.roleName}>Игрок 2 — Настоящее</Text>
              <Text style={styles.roleDescription}>Отвечает о текущей жизни</Text>
            </View>
          </View>
          
          <Text style={styles.inputLabel}>Имя игрока (Настоящее)</Text>
          <TextInput
            style={[styles.input, presentFocused && styles.inputFocused]}
            placeholder="Введите имя"
            placeholderTextColor={'rgba(0,0,0,0.35)'}
            value={presentPlayerName}
            onChangeText={setPresentPlayerName}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleStartGame}
            onFocus={() => setPresentFocused(true)}
            onBlur={() => setPresentFocused(false)}
          />

          {presentFocused && (
            <Text style={styles.hintText}>Обычно старший игрок</Text>
          )}
        </Animated.View>

        {/* Start button */}
        <Animated.View entering={FadeInUp.delay(500).duration(600)} style={styles.buttonContainer}>
          <Pressable
            style={[
              styles.startButton,
              !canStart && styles.startButtonDisabled,
            ]}
            onPress={handleStartGame}
          >
            <Text style={styles.startButtonText}>
              Продолжить
            </Text>
          </Pressable>

          {showValidationHint && !canStart && (
            <Text style={styles.validationHint}>Введите оба имени</Text>
          )}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PastColors.background, // Dark blue-green background
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconColor: {
    color: 'rgba(23, 38, 42, 0.70)',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: SharedColors.bridgeShadow,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: SharedColors.neutral,
    lineHeight: 24,
  },
  playerCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 18,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  roleIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 4,
    color: SharedColors.bridgeShadow,
  },
  roleDescription: {
    fontSize: 14,
    color: 'rgba(23, 38, 42, 0.62)',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: SharedColors.bridgeShadow,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    color: '#000000',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  inputFocused: {
    shadowOpacity: 0.12,
    shadowRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  hintText: {
    marginTop: 10,
    fontSize: 12,
    color: 'rgba(23, 38, 42, 0.45)',
  },
  connectionLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    gap: 8,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: SharedColors.river,
  },
  connectionBridge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(107, 163, 190, 0.2)',
    borderRadius: 20,
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 32,
  },
  startButton: {
    backgroundColor: SharedColors.bridge,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: SharedColors.bridgeShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonDisabled: {
    backgroundColor: SharedColors.neutral,
    opacity: 0.6,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  validationHint: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.65)',
  },
});
