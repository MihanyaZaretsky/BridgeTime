/**
 * Question Screen
 * Displays the interactive question from a scanned card
 * Supports text, video, and audio formats with multiple choice answers
 */

import { PastColors, PresentColors, SharedColors } from '@/constants/theme';
import { useGame } from '@/context/GameContext';
import { getQuestionById, inferTimePeriodFromQuestionId } from '@/data/questionBank';
import { AnswerOption, Question, TimePeriod } from '@/types/game';
import Constants from 'expo-constants';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    Dimensions,
    Linking,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Animated, {
    FadeIn,
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function QuestionScreen() {
  const insets = useSafeAreaInsets();
  const { dispatch, game, answerQuestion } = useGame();
  const params = useLocalSearchParams<{ questionId?: string }>();
  
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  const rawQuestionId = Array.isArray(params.questionId)
    ? params.questionId[0]
    : params.questionId;

  const effectiveQuestionId = useMemo(() => {
    const trimmed = (rawQuestionId ?? '').toString().trim();
    return trimmed;
  }, [rawQuestionId]);

  const questionTimePeriod: TimePeriod = useMemo(() => {
    const inferred = effectiveQuestionId ? inferTimePeriodFromQuestionId(effectiveQuestionId) : null;
    if (inferred) return inferred;
    // Fallback: if opened without QR params, keep old behavior based on turn
    return game?.currentTurn === 'past' ? 'present' : 'past';
  }, [effectiveQuestionId, game?.currentTurn]);

  const isTimePeriodAllowed = useMemo(() => {
    if (!game) return true;
    return questionTimePeriod === game.currentTurn;
  }, [game, questionTimePeriod]);

  const question: Question = useMemo(() => {
    return getQuestionById(effectiveQuestionId, questionTimePeriod);
  }, [effectiveQuestionId, questionTimePeriod]);

  useEffect(() => {
    if (!game) return;
    if (game.currentQuestion?.id === question.id) return;
    dispatch({ type: 'SET_QUESTION', question });
  }, [dispatch, game?.startedAt, game?.currentQuestion?.id, question.id]);

  useEffect(() => {
    setSelectedAnswer(null);
    setHasAnswered(false);
    setIsCorrect(false);
  }, [effectiveQuestionId]);
  
  const currentColors = game?.currentTurn === 'past' ? PastColors : PresentColors;
  const questionColors = questionTimePeriod === 'past' ? PastColors : PresentColors;

  // Animation values
  const resultScale = useSharedValue(0);
  const buttonShake = useSharedValue(0);

  const handleSelectAnswer = (optionId: string) => {
    if (hasAnswered) return;
    if (!isTimePeriodAllowed) return;
    setSelectedAnswer(optionId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || hasAnswered) return;
    if (!isTimePeriodAllowed) return;

    const selectedOption = question.options.find(o => o.id === selectedAnswer);
    const correct = selectedOption?.isCorrect || false;
    
    setIsCorrect(correct);
    setHasAnswered(true);

    // Animate result
    resultScale.value = withSpring(1, { damping: 10, stiffness: 150 });

    if (!correct) {
      // Shake animation for wrong answer
      buttonShake.value = withSequence(
        withSpring(-10, { damping: 2, stiffness: 500 }),
        withSpring(10, { damping: 2, stiffness: 500 }),
        withSpring(-5, { damping: 2, stiffness: 500 }),
        withSpring(0, { damping: 10, stiffness: 500 })
      );
    }
  };

  const handleOpenMediaUrl = async (url: string) => {
    const trimmed = (url ?? '').trim();
    if (!trimmed) return;

    const resolved = (() => {
      if (/^https?:\/\//i.test(trimmed)) return trimmed;
      const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;
      const base = typeof extra.mediaBaseUrl === 'string' ? extra.mediaBaseUrl.trim() : '';
      const normalizedBase = base.replace(/\/$/, '');
      if (!normalizedBase) return trimmed;
      if (!trimmed.startsWith('/')) return `${normalizedBase}/${trimmed}`;
      return `${normalizedBase}${trimmed}`;
    })();

    try {
      const canOpen = await Linking.canOpenURL(resolved);
      if (!canOpen) return;
      await Linking.openURL(resolved);
    } catch {
      return;
    }
  };

  const handleContinue = () => {
    if (!isTimePeriodAllowed) {
      router.replace('/game');
      return;
    }
    // Update game state
    answerQuestion(isCorrect);
    
    // Check if game is over
    if (game && isCorrect) {
      const currentPlayer = game.players[game.currentTurn];
      if (currentPlayer.currentPosition + 1 >= game.bridgeLength) {
        router.replace('/victory');
        return;
      }
    }
    
    router.replace('/game');
  };

  const resultStyle = useAnimatedStyle(() => ({
    transform: [{ scale: resultScale.value }],
  }));

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: buttonShake.value }],
  }));

  const getOptionStyle = (option: AnswerOption) => {
    if (!hasAnswered) {
      return selectedAnswer === option.id ? styles.optionSelected : styles.optionDefault;
    }
    if (option.isCorrect) {
      return styles.optionCorrect;
    }
    if (selectedAnswer === option.id && !option.isCorrect) {
      return styles.optionIncorrect;
    }
    return styles.optionDisabled;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View
        entering={FadeIn.delay(100)}
        style={[styles.header, { backgroundColor: questionColors.background }]}
      >
        <View style={styles.headerContent}>
          <Text style={[styles.timePeriodLabel, { color: questionColors.textLight }]}>
            {questionTimePeriod === 'past' ? '📜 Из прошлого' : '✨ Из настоящего'}
          </Text>
          <Text style={[styles.categoryLabel, { color: questionColors.text }]}>
            {question.metadata?.category || 'Общее'}
          </Text>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Question content */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={[
            styles.questionCard,
            questionTimePeriod === 'past' ? styles.questionCardPast : styles.questionCardPresent,
          ]}
        >
          <Text
            style={[
              styles.questionTitle,
              questionTimePeriod === 'past' ? styles.questionTitlePast : styles.questionTitlePresent,
            ]}
          >
            {question.title}
          </Text>
          
          {/* Content based on format */}
          {question.format === 'text' && (
            <Text
              style={[
                styles.questionText,
                questionTimePeriod === 'past' ? styles.questionTextPast : styles.questionTextPresent,
              ]}
            >
              {question.content}
            </Text>
          )}
          
          {question.format === 'audio' && (
            <View style={styles.mediaPlaceholder}>
              <Text style={styles.mediaIcon}>🎵</Text>
              <Text style={styles.mediaText}>Здесь будет воспроизводиться аудио</Text>
              <Pressable style={styles.playButton}>
                <Text style={styles.playButtonText}>▶ Воспроизвести</Text>
              </Pressable>
            </View>
          )}
          
          {question.format === 'video' && (
            Platform.OS === 'web' ? (
              <View style={styles.videoWrap}>
                <video
                  src={question.content}
                  controls
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </View>
            ) : (
              <View style={styles.mediaPlaceholder}>
                <Text style={styles.mediaIcon}>🎬</Text>
                <Text style={styles.mediaText}>Видео откроется во внешнем плеере</Text>
                <Pressable style={styles.playButton} onPress={() => handleOpenMediaUrl(question.content)}>
                  <Text style={styles.playButtonText}>Открыть видео</Text>
                </Pressable>
              </View>
            )
          )}

          {question.hint && (
            <View
              style={[
                styles.hintContainer,
                questionTimePeriod === 'past' ? styles.hintContainerPast : styles.hintContainerPresent,
              ]}
            >
              <Text
                style={[
                  styles.hintText,
                  questionTimePeriod === 'past' ? styles.hintTextPast : styles.hintTextPresent,
                ]}
              >
                {question.hint}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Answer options */}
        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => (
            <Animated.View
              key={option.id}
              entering={FadeInUp.delay(300 + index * 100).duration(400)}
            >
              <Pressable
                style={[styles.optionButton, getOptionStyle(option)]}
                onPress={() => handleSelectAnswer(option.id)}
                disabled={hasAnswered}
              >
                <View style={styles.optionLetter}>
                  <Text style={styles.optionLetterText}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text style={styles.optionText}>{option.text}</Text>
                {hasAnswered && option.isCorrect && (
                  <Text style={styles.correctIndicator}>✓</Text>
                )}
                {hasAnswered && selectedAnswer === option.id && !option.isCorrect && (
                  <Text style={styles.incorrectIndicator}>✗</Text>
                )}
              </Pressable>
            </Animated.View>
          ))}
        </View>

        {/* Result feedback */}
        {hasAnswered && (
          <Animated.View style={[styles.resultCard, resultStyle]}>
            <Text style={styles.resultEmoji}>{isCorrect ? '🎉' : '💭'}</Text>
            <Text style={[styles.resultTitle, { color: isCorrect ? SharedColors.success : PastColors.primary }]}>
              {isCorrect ? 'Правильно!' : 'Не совсем...'}
            </Text>
            <Text style={styles.resultMessage}>
              {isCorrect
                ? 'Вы получаете сегмент моста. Поставьте его на своей стороне.'
                : game
                  ? `Ход переходит к ${game.currentTurn === 'past' ? game.players.present.name : game.players.past.name}.`
                  : 'Ход переходит к другому игроку.'}
            </Text>
          </Animated.View>
        )}

        {!isTimePeriodAllowed && (
          <View style={styles.periodErrorCard}>
            <Text style={styles.periodErrorTitle}>Нельзя открыть вопрос из другой эпохи</Text>
            <Text style={styles.periodErrorText}>
              Сейчас ход игрока из {game?.currentTurn === 'past' ? 'Прошлого' : 'Настоящего'}. Этот QR-код относится к{' '}
              {questionTimePeriod === 'past' ? 'Прошлому' : 'Настоящему'}.
            </Text>
            <Pressable style={styles.periodErrorButton} onPress={() => router.replace('/game')}>
              <Text style={styles.periodErrorButtonText}>Вернуться к игре</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Bottom action */}
      <Animated.View
        style={[
          styles.bottomAction,
          { paddingBottom: insets.bottom + 20 },
          shakeStyle,
        ]}
      >
        {!hasAnswered ? (
          <Pressable
            style={[
              styles.submitButton,
              { backgroundColor: currentColors.primary },
              !selectedAnswer && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmitAnswer}
            disabled={!selectedAnswer || !isTimePeriodAllowed}
          >
            <Text style={styles.submitButtonText}>
              {selectedAnswer ? 'Ответить' : 'Выберите вариант ответа'}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            style={[
              styles.continueButton,
              { backgroundColor: isCorrect ? SharedColors.success : SharedColors.bridge },
            ]}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>
              {isCorrect ? 'Поставить сегмент моста →' : 'Передать ход →'}
            </Text>
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PastColors.background, // Dark blue-green background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flex: 1,
  },
  timePeriodLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 20,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  questionCard: {
    backgroundColor: '#FFFFFF', // Light neutral surfaces
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  questionCardPast: {
    backgroundColor: '#F3E9D2',
    borderColor: 'rgba(93, 64, 55, 0.25)',
    borderWidth: 1,
  },
  questionCardPresent: {
    backgroundColor: '#FFFFFF',
  },
  questionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: SharedColors.bridgeShadow,
    marginBottom: 16,
  },
  questionTitlePast: {
    color: '#3E2E22',
  },
  questionTitlePresent: {
    color: SharedColors.bridgeShadow,
  },
  questionText: {
    fontSize: 17,
    lineHeight: 26,
    color: '#444',
  },
  questionTextPast: {
    color: '#3E2E22',
  },
  questionTextPresent: {
    color: '#444',
  },
  mediaPlaceholder: {
    backgroundColor: '#FFFFFF', // Light neutral surfaces
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  videoWrap: {
    backgroundColor: '#000',
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    height: Math.round(SCREEN_WIDTH * 0.56),
  },
  mediaIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  mediaText: {
    fontSize: 14,
    color: SharedColors.neutral,
    marginBottom: 16,
  },
  playButton: {
    backgroundColor: SharedColors.river,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  hintContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFFFFF', // Light neutral surfaces
    borderRadius: 12,
  },
  hintText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  hintContainerPast: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderColor: 'rgba(62, 46, 34, 0.20)',
    borderWidth: 1,
  },
  hintContainerPresent: {
    backgroundColor: '#FFFFFF',
  },
  hintTextPast: {
    color: '#3E2E22',
  },
  hintTextPresent: {
    color: '#8B6914',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    gap: 14,
  },
  optionDefault: {
    backgroundColor: '#fff',
    borderColor: '#E0E0E0',
  },
  optionSelected: {
    backgroundColor: '#E8F4FC',
    borderColor: SharedColors.river,
  },
  optionCorrect: {
    backgroundColor: '#E8F5E9',
    borderColor: SharedColors.success,
  },
  optionIncorrect: {
    backgroundColor: '#FFEBEE',
    borderColor: '#EF5350',
  },
  optionDisabled: {
    backgroundColor: '#FAFAFA',
    borderColor: '#E0E0E0',
    opacity: 0.6,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: SharedColors.riverLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetterText: {
    fontSize: 14,
    fontWeight: '700',
    color: SharedColors.riverDeep,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  correctIndicator: {
    fontSize: 20,
    color: SharedColors.success,
    fontWeight: '700',
  },
  incorrectIndicator: {
    fontSize: 20,
    color: '#EF5350',
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: 'rgba(255,255,255,0.9)', // Slightly transparent for darker theme
    borderRadius: 20,
    padding: 24,
    marginTop: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  resultEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  resultMessage: {
    fontSize: 16,
    color: SharedColors.neutral,
    textAlign: 'center',
    lineHeight: 24,
  },
  periodErrorCard: {
    marginTop: 18,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(23, 38, 42, 0.12)',
  },
  periodErrorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#17262A',
    marginBottom: 6,
    textAlign: 'center',
  },
  periodErrorText: {
    fontSize: 14,
    color: 'rgba(23, 38, 42, 0.75)',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 12,
  },
  periodErrorButton: {
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(47, 128, 237, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(47, 128, 237, 0.28)',
  },
  periodErrorButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F5FB8',
  },
  bottomAction: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: 'rgba(255,255,255,0.1)', // More transparent for darker theme
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  submitButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: SharedColors.neutral,
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  continueButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});
