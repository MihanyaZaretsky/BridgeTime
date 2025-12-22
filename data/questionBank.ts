import { Question, TimePeriod } from '@/types/game';

export function inferTimePeriodFromQuestionId(questionId: string): TimePeriod | null {
  const trimmed = questionId.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const n = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  // Split the first 25 physical QR cards roughly 50/50 between eras.
  // 1..12 => past, 13..25 => present
  if (n <= 12) return 'past';
  if (n <= 25) return 'present';
  return 'present';
}

function buildPlaceholderQuestion(id: string, timePeriod: TimePeriod): Question {
  const correctOptionId = 'a';
  const correctLetter = 'A';
  return {
    id,
    cardId: `card-${timePeriod}-${id}`,
    timePeriod,
    format: 'text',
    title: `Вопрос #${id}`,
    content: 'Содержимое вопроса пока не заполнено. Замените этот текст на реальный вопрос для этой карты.',
    hint: `Верный вариант: ${correctLetter}`,
    options: [
      { id: 'a', text: 'Вариант A', isCorrect: correctOptionId === 'a' },
      { id: 'b', text: 'Вариант B', isCorrect: false },
      { id: 'c', text: 'Вариант C', isCorrect: false },
      { id: 'd', text: 'Вариант D', isCorrect: false },
    ],
  };
}

const BUILTIN_QUESTIONS: Record<string, Question> = {
  '1': {
    id: '1',
    cardId: 'card-past-001',
    timePeriod: 'past',
    format: 'text',
    title: 'Музыка того времени',
    content: 'Какой формат музыки чаще всего использовали дома до того, как CD стали повсеместными?',
    options: [
      { id: 'a', text: 'Пластинки и кассеты', isCorrect: true },
      { id: 'b', text: 'MP3-плееры', isCorrect: false },
      { id: 'c', text: 'Стриминговые сервисы', isCorrect: false },
      { id: 'd', text: 'USB-флешки', isCorrect: false },
    ],
    metadata: { year: 1980, category: 'Музыка', difficulty: 'easy' },
  },
  '26': {
    id: '26',
    cardId: 'card-present-026',
    timePeriod: 'present',
    format: 'text',
    title: 'Современное общение',
    content: 'Какой самый популярный способ общения у молодых людей сегодня (кроме личных встреч)?',
    options: [
      { id: 'a', text: 'Письма', isCorrect: false },
      { id: 'b', text: 'Стационарные звонки', isCorrect: false },
      { id: 'c', text: 'Мессенджеры и соцсети', isCorrect: true },
      { id: 'd', text: 'Факс', isCorrect: false },
    ],
    metadata: { year: 2024, category: 'Технологии', difficulty: 'easy' },
  },
};

export function getQuestionById(questionId: string, timePeriod: TimePeriod): Question {
  const normalized = questionId.trim();
  const builtin = BUILTIN_QUESTIONS[normalized];
  if (builtin) return builtin;
  const inferred = inferTimePeriodFromQuestionId(normalized);
  return buildPlaceholderQuestion(normalized, inferred ?? timePeriod);
}
