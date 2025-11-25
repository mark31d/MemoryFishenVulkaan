// /Components/QuizScreen.js
// «What fish are you today?» — 5 вопросов, один ответ, итог -> QuizResultScreen

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  Dimensions,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const BG   = require('../assets/bg.png');
const LOGO = require('../assets/Logo.png');
const CARD = require('../assets/register_container.png');
const BTN_BG = require('../assets/blue_button.png');

// ключи рыб
const FISH_KEYS = {
  GREEN: 'green',
  RED: 'red',
  BLUE: 'blue',
  GOLD: 'gold',
  PURPLE: 'purple',
};

// ... QUESTIONS и COLORS оставляем как есть ...

const QUESTIONS = [
  {
    id: 0,
    subtitle: 'How are you feeling this morning?',
    options: [
      { text: 'Full of energy', fish: FISH_KEYS.RED },
      { text: 'Calm', fish: FISH_KEYS.GOLD },
      { text: 'A little sleepy', fish: FISH_KEYS.PURPLE },
      { text: 'In the mood for adventure', fish: FISH_KEYS.BLUE },
    ],
  },
  {
    id: 1,
    subtitle: 'What water would you choose today?',
    options: [
      { text: 'A warm lake', fish: FISH_KEYS.GREEN },
      { text: 'A deep sea', fish: FISH_KEYS.BLUE },
      { text: 'A river with a current', fish: FISH_KEYS.RED },
      { text: 'A small pond in silence', fish: FISH_KEYS.GOLD },
    ],
  },
  {
    id: 2,
    subtitle: 'What would you do right now if you were a fish?',
    options: [
      { text: 'Swam around friends', fish: FISH_KEYS.GREEN },
      { text: 'Hiding between stones', fish: FISH_KEYS.PURPLE },
      { text: 'Jumped over the waves', fish: FISH_KEYS.BLUE },
      { text: 'Started a new adventure', fish: FISH_KEYS.RED },
    ],
  },
  {
    id: 3,
    subtitle: 'What are you in the mood for today?',
    options: [
      { text: 'Dreamy', fish: FISH_KEYS.PURPLE },
      { text: 'Active', fish: FISH_KEYS.RED },
      { text: 'Calm', fish: FISH_KEYS.GOLD },
      { text: 'Cheerful', fish: FISH_KEYS.GREEN },
    ],
  },
  {
    id: 4,
    subtitle: 'What do you want to “catch” today?',
    options: [
      { text: 'A new idea', fish: FISH_KEYS.PURPLE },
      { text: 'Good mood', fish: FISH_KEYS.GREEN },
      { text: 'Calm', fish: FISH_KEYS.GOLD },
      { text: 'A little adrenaline', fish: FISH_KEYS.RED },
    ],
  },
];

const COLORS = {
  bg: '#030F41',
  cardText: '#040F46',
  title: '#040F46',
  progressActive: '#040F46',
  progressInactive: 'rgba(4,15,70,0.35)',
  checkboxBorder: '#235D6B',
  checkboxFill: '#235D6B',
  optionBorder: '#235D6B',
  optionBg: 'rgba(149,197,223,0.6)',
  buttonText: '#FFFFFF',
  buttonDisabledText: 'rgba(255,255,255,0.4)',
  buttonDisabledOverlay: 'rgba(3,15,65,0.45)',
};

const LOGO_SIZE = 170; // фиксированный размер логотипа

export default function QuizScreen({ navigation }) {
  const [step, setStep] = useState(0); // 0..4
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(null));

  const currentQuestion = QUESTIONS[step];
  const selectedIndex = answers[step];

  const allAnswered = useMemo(
    () => answers.every((a) => a !== null),
    [answers],
  );

  const handleSelect = (optionIndex) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[step] = optionIndex;
      return next;
    });
  };

  const computeFishResult = () => {
    const scores = {
      [FISH_KEYS.GREEN]: 0,
      [FISH_KEYS.RED]: 0,
      [FISH_KEYS.BLUE]: 0,
      [FISH_KEYS.GOLD]: 0,
      [FISH_KEYS.PURPLE]: 0,
    };

    QUESTIONS.forEach((q, qIndex) => {
      const ansIdx = answers[qIndex];
      if (ansIdx === null || ansIdx === undefined) return;
      const fishKey = q.options[ansIdx].fish;
      scores[fishKey] += 1;
    });

    const order = [
      FISH_KEYS.RED,
      FISH_KEYS.GREEN,
      FISH_KEYS.BLUE,
      FISH_KEYS.GOLD,
      FISH_KEYS.PURPLE,
    ];

    let bestKey = order[0];
    let bestScore = -1;

    order.forEach((key) => {
      if (scores[key] > bestScore) {
        bestScore = scores[key];
        bestKey = key;
      }
    });

    return bestKey;
  };

  const handleNext = () => {
    if (selectedIndex === null || selectedIndex === undefined) return;

    if (step < QUESTIONS.length - 1) {
      setStep((s) => s + 1);
      return;
    }

    const resultFishKey = computeFishResult();
    navigation.replace('QuizResult', {
      fishKey: resultFishKey,
    });
  };

  const buttonDisabled =
    selectedIndex === null || selectedIndex === undefined;

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={styles.safe}>
        {/* логотип */}
        <View style={styles.logoWrapper}>
          <Image
            source={LOGO}
            style={styles.logo}
            resizeMode="cover"
          />
        </View>

        {/* контейнер с вопросом */}
        <View style={styles.cardWrapper}>
          <ImageBackground
            source={CARD}
            style={styles.cardBg}
            imageStyle={styles.cardBgImage}
            resizeMode="stretch"
          >
            <View style={styles.cardContent}>
              <Text style={styles.title}>WHAT FISH ARE YOU TODAY?</Text>
              <Text style={styles.subtitle}>{currentQuestion.subtitle}</Text>

              {/* прогресс 5 шагов */}
              <View style={styles.progressRow}>
                {QUESTIONS.map((q, idx) => (
                  <View
                    key={q.id}
                    style={[
                      styles.progressSegment,
                      idx <= step && styles.progressSegmentActive,
                    ]}
                  />
                ))}
              </View>

              {/* варианты */}
              <View style={styles.optionsWrapper}>
                {currentQuestion.options.map((opt, idx) => {
                  const active = idx === selectedIndex;
                  return (
                    <Pressable
                      key={opt.text}
                      style={[
                        styles.optionRow,
                        active && styles.optionRowActive,
                      ]}
                      onPress={() => handleSelect(idx)}
                    >
                      <View
                        style={[
                          styles.checkboxOuter,
                          active && styles.checkboxOuterActive,
                        ]}
                      >
                        {active && <View style={styles.checkboxInner} />}
                      </View>
                      <Text
                        style={[
                          styles.optionText,
                          active && styles.optionTextActive,
                        ]}
                      >
                        {opt.text}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* кнопка CHOOSE */}
              <Pressable
                onPress={handleNext}
                disabled={buttonDisabled}
                style={styles.buttonWrapper}
              >
                <ImageBackground
                  source={BTN_BG}
                  style={styles.buttonBg}
                  imageStyle={styles.buttonBgImage}
                  resizeMode="stretch"
                >
                  {buttonDisabled && (
                    <View style={styles.buttonDisabledOverlay} />
                  )}
                  <Text
                    style={[
                      styles.buttonText,
                      buttonDisabled && styles.buttonTextDisabled,
                    ]}
                  >
                    CHOOSE
                  </Text>
                </ImageBackground>
              </Pressable>
            </View>
          </ImageBackground>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  safe: {
    flex: 1,
  },

  // лого чуть ниже и с радиусом
  logoWrapper: {
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: 45,   // ⬅️ скругление
    overflow: 'hidden', // чтобы точно обрезало углы
  },

  cardWrapper: {
    flex: 1,
    paddingHorizontal: 18,
    paddingBottom: 42,
    justifyContent: 'flex-end',
  },
  cardBg: {
    width: '100%',
    minHeight: height * 0.58,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardBgImage: {},
  cardContent: {
    paddingHorizontal: 22,
    paddingVertical: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.title,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.cardText,
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  progressSegment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
    backgroundColor: COLORS.progressInactive,
  },
  progressSegmentActive: {
    backgroundColor: COLORS.progressActive,
  },
  optionsWrapper: {
    marginBottom: 18,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 4,
    borderColor: COLORS.optionBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    backgroundColor: COLORS.optionBg,
  },
  optionRowActive: {
    borderColor: COLORS.progressActive,
  },
  checkboxOuter: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.checkboxBorder,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxOuterActive: {
    borderColor: COLORS.checkboxFill,
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: COLORS.checkboxFill,
  },
  optionText: {
    fontSize: 15,
    color: COLORS.cardText,
  },
  optionTextActive: {
    fontWeight: '700',
  },
  buttonWrapper: {
    marginTop: 4,
    height: 56,
  },
  buttonBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonBgImage: {
    borderRadius: 4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.buttonText,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  buttonDisabledOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.buttonDisabledOverlay,
    borderRadius: 4,
  },
  buttonTextDisabled: {
    color: COLORS.buttonDisabledText,
  },
});
