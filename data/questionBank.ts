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
    format: 'video',
    title: 'Угадай фильм по отрывку',
    content: '/videos/qr-001.mp4',
    hint: 'Подсказка: действие происходит в пустыне.',
    options: [
      { id: 'a', text: 'Ирония судьбы, или С лёгким паром!', isCorrect: false },
      { id: 'b', text: 'Бриллиантовая рука', isCorrect: false },
      { id: 'c', text: 'Иван Васильевич меняет профессию', isCorrect: false },
      { id: 'd', text: 'Белое солнце пустыни', isCorrect: true },
    ],
    metadata: { year: 1970, category: 'Кино', difficulty: 'easy' },
  },
  '2': {
    id: '2',
    cardId: 'card-past-002',
    timePeriod: 'past',
    format: 'video',
    title: 'Угадай фильм по отрывку',
    content: '/videos/qr-002.mp4',
    hint: 'Подсказка: комедия, которую цитируют поколениями.',
    options: [
      { id: 'a', text: 'Ирония судьбы, или С лёгким паром!', isCorrect: false },
      { id: 'b', text: 'Бриллиантовая рука', isCorrect: true },
      { id: 'c', text: 'Иван Васильевич меняет профессию', isCorrect: false },
      { id: 'd', text: 'Белое солнце пустыни', isCorrect: false },
    ],
    metadata: { year: 1969, category: 'Кино', difficulty: 'easy' },
  },
  '3': {
    id: '3',
    cardId: 'card-past-003',
    timePeriod: 'past',
    format: 'video',
    title: 'Угадай фильм по отрывку',
    content: '/videos/qr-003.mp4',
    hint: 'Подсказка: машина времени и очень узнаваемые фразы.',
    options: [
      { id: 'a', text: 'Ирония судьбы, или С лёгким паром!', isCorrect: false },
      { id: 'b', text: 'Бриллиантовая рука', isCorrect: false },
      { id: 'c', text: 'Иван Васильевич меняет профессию', isCorrect: true },
      { id: 'd', text: 'Белое солнце пустыни', isCorrect: false },
    ],
    metadata: { year: 1973, category: 'Кино', difficulty: 'easy' },
  },
  '4': {
    id: '4',
    cardId: 'card-past-004',
    timePeriod: 'past',
    format: 'audio',
    title: 'Угадай песню по фрагменту',
    content: '/audio/qr-004.mp3',
    hint: 'Подсказка: популярная русская эстрада.',
    options: [
      { id: 'a', text: '«Вера»', isCorrect: true },
      { id: 'b', text: '«Салют, Вера!»', isCorrect: false },
      { id: 'c', text: '«Океан и три реки»', isCorrect: false },
      { id: 'd', text: '«Небеса»', isCorrect: false },
    ],
    metadata: { category: 'Музыка', difficulty: 'easy' },
  },
  '5': {
    id: '5',
    cardId: 'card-past-005',
    timePeriod: 'past',
    format: 'audio',
    title: 'Угадай мультфильм/саундтрек по фрагменту',
    content: '/audio/qr-005.mp3',
    hint: 'Подсказка: советская/российская анимация.',
    options: [
      { id: 'a', text: '«Ну, погоди!»', isCorrect: true },
      { id: 'b', text: '«Винни-Пух»', isCorrect: false },
      { id: 'c', text: '«Простоквашино»', isCorrect: false },
      { id: 'd', text: '«Чебурашка»', isCorrect: false },
    ],
    metadata: { category: 'Музыка', difficulty: 'easy' },
  },
  '6': {
    id: '6',
    cardId: 'card-past-006',
    timePeriod: 'past',
    format: 'audio',
    title: 'Угадай песню по фрагменту',
    content: '/audio/qr-006.mp3',
    hint: 'Подсказка: мировой хит.',
    options: [
      { id: 'a', text: 'Billie Jean', isCorrect: true },
      { id: 'b', text: 'Beat It', isCorrect: false },
      { id: 'c', text: 'Thriller', isCorrect: false },
      { id: 'd', text: 'Smooth Criminal', isCorrect: false },
    ],
    metadata: { category: 'Музыка', difficulty: 'easy' },
  },
  '13': {
    id: '13',
    cardId: 'card-present-013',
    timePeriod: 'present',
    format: 'video',
    title: 'Угадай фильм по отрывку',
    content: '/videos/qr-013.mp4',
    hint: 'Подсказка: космос, время и сообщения близких.',
    options: [
      { id: 'a', text: 'Интерстеллар', isCorrect: true },
      { id: 'b', text: 'Гравитация', isCorrect: false },
      { id: 'c', text: 'Марсианин', isCorrect: false },
      { id: 'd', text: 'Контакт', isCorrect: false },
    ],
    metadata: { year: 2014, category: 'Кино', difficulty: 'easy' },
  },
  '14': {
    id: '14',
    cardId: 'card-present-014',
    timePeriod: 'present',
    format: 'video',
    title: 'Угадай фильм по отрывку',
    content: '/videos/qr-014.mp4',
    hint: 'Подсказка: тюремная драма и необычный заключённый.',
    options: [
      { id: 'a', text: 'Побег из Шоушенка', isCorrect: false },
      { id: 'b', text: 'Зелёная миля', isCorrect: true },
      { id: 'c', text: 'Сияние', isCorrect: false },
      { id: 'd', text: 'Список Шиндлера', isCorrect: false },
    ],
    metadata: { year: 1999, category: 'Кино', difficulty: 'easy' },
  },
  '15': {
    id: '15',
    cardId: 'card-present-015',
    timePeriod: 'present',
    format: 'video',
    title: 'Угадай фильм по отрывку',
    content: '/videos/qr-015.mp4',
    hint: 'Подсказка: шоколад, фабрика и золотые билеты.',
    options: [
      { id: 'a', text: 'Чарли и шоколадная фабрика', isCorrect: true },
      { id: 'b', text: 'Матильда', isCorrect: false },
      { id: 'c', text: 'Дом странных детей мисс Перегрин', isCorrect: false },
      { id: 'd', text: 'Гарри Поттер и философский камень', isCorrect: false },
    ],
    metadata: { year: 2005, category: 'Кино', difficulty: 'easy' },
  },
  '16': {
    id: '16',
    cardId: 'card-present-016',
    timePeriod: 'present',
    format: 'audio',
    title: 'Угадай песню по фрагменту',
    content: '/audio/qr-016.mp3',
    hint: 'Подсказка: российская поп-музыка 2010-х.',
    options: [
      { id: 'a', text: 'Егор Крид — «Будильник»', isCorrect: true },
      { id: 'b', text: 'Егор Крид — «Самая самая»', isCorrect: false },
      { id: 'c', text: 'Мот — «Капкан»', isCorrect: false },
      { id: 'd', text: 'MBAND — «Она вернётся»', isCorrect: false },
    ],
    metadata: { category: 'Музыка', difficulty: 'easy' },
  },
  '17': {
    id: '17',
    cardId: 'card-present-017',
    timePeriod: 'present',
    format: 'audio',
    title: 'Угадай песню по фрагменту',
    content: '/audio/qr-017.mp3',
    hint: 'Подсказка: мировой поп-хит 2010-х.',
    options: [
      { id: 'a', text: 'Justin Bieber — Baby (feat. Ludacris)', isCorrect: true },
      { id: 'b', text: 'Justin Bieber — Sorry', isCorrect: false },
      { id: 'c', text: 'One Direction — What Makes You Beautiful', isCorrect: false },
      { id: 'd', text: 'Ed Sheeran — Shape of You', isCorrect: false },
    ],
    metadata: { category: 'Музыка', difficulty: 'easy' },
  },
  '18': {
    id: '18',
    cardId: 'card-present-018',
    timePeriod: 'present',
    format: 'audio',
    title: 'Угадай песню по фрагменту',
    content: '/audio/qr-018.mp3',
    hint: 'Подсказка: русская лирика/рэп, песня про школьный выпускной.',
    options: [
      { id: 'a', text: 'Баста — «Выпускной (Медлячок)»', isCorrect: true },
      { id: 'b', text: 'Баста — «Сансара»', isCorrect: false },
      { id: 'c', text: 'Макс Корж — «Малый повзрослел»', isCorrect: false },
      { id: 'd', text: 'Noize MC — «Вселенная бесконечна?»', isCorrect: false },
    ],
    metadata: { category: 'Музыка', difficulty: 'easy' },
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
