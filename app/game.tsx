import { AppIcon } from '@/components/ui/app-icon';
import { BlurView } from '@/components/ui/blur-view';
import { LinearGradient } from '@/components/ui/linear-gradient';
import { SharedColors } from '@/constants/theme';
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
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const EraTheme = {
  past: {
    bg: ['#F3E6D0', '#E7D6B1'],
    card: '#EFE2C6',
    text: '#3A2E1F',
    accent: '#8B5E3C',
  },
  present: {
    bg: ['#F7FAFF', '#FFFFFF'],
    card: '#FFFFFF',
    text: '#0F172A',
    accent: '#3B82F6',
  },
} as const;

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const { game, getCurrentPlayer, resetGame } = useGame();

  // Redirect if no game is active
  if (!game) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Нет активной игры</Text>
        <Pressable style={styles.backButton} onPress={() => router.replace('/')}>
          <Text style={styles.backButtonText}>Домой</Text>
        </Pressable>
      </View>
    );
  }

  const currentPlayer = getCurrentPlayer();
  const isCurrentTurnPast = game.currentTurn === 'past';
  const era = isCurrentTurnPast ? EraTheme.past : EraTheme.present;
  const scoreLimit = 5;

  const eraProgress = useSharedValue(isCurrentTurnPast ? 0 : 1);
  const cardScale = useSharedValue(1);
  const cardOpacity = useSharedValue(1);

  useEffect(() => {
    const to = isCurrentTurnPast ? 0 : 1;
    eraProgress.value = withTiming(to, {
      duration: 800,
      easing: Easing.inOut(Easing.cubic),
    });

    cardOpacity.value = 0;
    cardOpacity.value = withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) });
    cardScale.value = withSequence(
      withTiming(0.96, { duration: 140, easing: Easing.out(Easing.cubic) }),
      withTiming(1.02, { duration: 220, easing: Easing.inOut(Easing.cubic) }),
      withTiming(1, { duration: 260, easing: Easing.out(Easing.cubic) })
    );
  }, [isCurrentTurnPast, eraProgress, cardOpacity, cardScale]);

  const pastBgStyle = useAnimatedStyle(() => ({ opacity: 1 - eraProgress.value }));
  const presentBgStyle = useAnimatedStyle(() => ({ opacity: eraProgress.value }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  // Check for winner
  if (game.status === 'finished' && game.winner) {
    router.replace('/victory');
    return null;
  }

  const handleScanCard = () => {
    router.push('/scanner');
  };

  const handleQuit = () => {
    resetGame();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[StyleSheet.absoluteFill, pastBgStyle]}>
        <LinearGradient colors={EraTheme.past.bg as unknown as string[]} style={StyleSheet.absoluteFill} />
        <Animated.View style={[styles.vignetteLayer, pastBgStyle]}>
          <LinearGradient
            colors={['rgba(0,0,0,0.14)', 'transparent']}
            style={[styles.vignetteEdge, styles.vignetteTop]}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.14)']}
            style={[styles.vignetteEdge, styles.vignetteBottom]}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.10)', 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[styles.vignetteSide, styles.vignetteLeft]}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.10)']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[styles.vignetteSide, styles.vignetteRight]}
          />
        </Animated.View>

        <Animated.View style={[styles.pastBlurWrap, pastBgStyle]} pointerEvents="none">
          <BlurView intensity={18} tint="light" style={StyleSheet.absoluteFill} />
        </Animated.View>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, presentBgStyle]}>
        <LinearGradient colors={EraTheme.present.bg as unknown as string[]} style={StyleSheet.absoluteFill} />
        <Animated.View style={[styles.presentGlow, presentBgStyle]} pointerEvents="none" />
      </Animated.View>

      <View style={[styles.content, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 18 }]}>
        <View style={styles.topBar}>
          <Pressable onPress={handleQuit} style={styles.closeButton}>
            <AppIcon name="close" size={18} color={era.text} />
          </Pressable>
        </View>

        <View style={styles.mainArea}>
          <Animated.View
            style={[
              styles.playerCard,
              { backgroundColor: era.card, borderColor: isCurrentTurnPast ? 'rgba(139, 94, 60, 0.22)' : 'rgba(59, 130, 246, 0.18)' },
              cardAnimatedStyle,
              !isCurrentTurnPast && styles.playerCardPresentGlow,
            ]}
          >
            <View style={styles.cardCenter}>
              <View style={styles.eraIconCenter} pointerEvents="none">
                <AppIcon
                  name={isCurrentTurnPast ? 'hourglass-outline' : 'sparkles-outline'}
                  size={132}
                  color={isCurrentTurnPast ? 'rgba(139, 94, 60, 0.22)' : 'rgba(59, 130, 246, 0.20)'}
                />
              </View>

              <Text style={[styles.playerName, styles.playerNameCentered, { color: era.text }]} numberOfLines={1}>
                {currentPlayer?.name ?? ''}
              </Text>
              <Text
                style={[
                  styles.playerTurnLabel,
                  styles.playerTurnLabelCentered,
                  { color: isCurrentTurnPast ? 'rgba(58, 46, 31, 0.70)' : 'rgba(15, 23, 42, 0.62)' },
                ]}
              >
                Твой ход
              </Text>
            </View>

            <View style={styles.scoreBlock}>
              <ScoreIcons value={currentPlayer?.score ?? 0} max={scoreLimit} tint={era.accent} />
            </View>
          </Animated.View>

          <View
            style={[
              styles.instructionCard,
              { backgroundColor: isCurrentTurnPast ? 'rgba(239, 226, 198, 0.72)' : 'rgba(255, 255, 255, 0.78)' },
            ]}
          >
            <Text style={[styles.instructionTitle, { color: era.text }]}>
              Возьмите карту из {isCurrentTurnPast ? 'Прошлого' : 'Настоящего'} и отсканируйте QR-код
            </Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.scanButton,
            { backgroundColor: era.accent },
            pressed && styles.scanButtonPressed,
          ]}
          onPress={handleScanCard}
        >
          <AppIcon name="camera-outline" size={22} color="#FFFFFF" />
          <Text style={styles.scanButtonText}>Отсканировать QR-код</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ScoreIcons({ value, max, tint }: { value: number; max: number; tint: string }) {
  const safeValue = Math.max(0, Math.min(max, value));
  return (
    <View style={styles.scoreRow}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < safeValue;
        return (
          <View
            key={i}
            style={[
              styles.scoreCircle,
              filled
                ? { backgroundColor: tint, borderColor: tint }
                : { backgroundColor: 'transparent', borderColor: 'rgba(23, 38, 42, 0.18)' },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SharedColors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 6,
    paddingBottom: 14,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.70)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  mainArea: {
    flex: 1,
    justifyContent: 'center',
    minHeight: Math.max(420, Math.round(SCREEN_HEIGHT * 0.6)),
  },
  playerCard: {
    flex: 1,
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.10,
    shadowRadius: 26,
    elevation: 8,
  },
  playerCardPresentGlow: {
    shadowColor: '#3B82F6',
    shadowOpacity: 0.22,
  },
  cardCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  eraIconCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  playerName: {
    fontSize: 24,
    fontFamily: 'Nunito_700Bold',
    color: SharedColors.bridgeShadow,
  },
  playerNameCentered: {
    textAlign: 'center',
  },
  playerTurnLabel: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
  },
  playerTurnLabelCentered: {
    textAlign: 'center',
  },
  scoreBlock: {
    marginTop: 'auto',
    paddingTop: 18,
    alignItems: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  instructionCard: {
    marginTop: 14,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(23, 38, 42, 0.10)',
  },
  instructionTitle: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: SharedColors.bridgeShadow,
    lineHeight: 22,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 22,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 8,
    marginTop: 16,
  },
  scanButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  scanButtonText: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    color: '#fff',
  },
  errorText: {
    fontSize: 18,
    color: SharedColors.neutral,
    textAlign: 'center',
    marginTop: 100,
  },
  backButton: {
    marginTop: 20,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: SharedColors.river,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },

  vignetteLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  vignetteEdge: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 120,
  },
  vignetteTop: {
    top: 0,
  },
  vignetteBottom: {
    bottom: 0,
  },
  vignetteSide: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 90,
  },
  vignetteLeft: {
    left: 0,
  },
  vignetteRight: {
    right: 0,
  },
  pastBlurWrap: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.55,
  },
  presentGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
});
