// /Components/OnboardingScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Dimensions,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// фон
const BG = require('../assets/bg.png');

// контейнер под текст
const CARD_BG = require('../assets/container.png');
// синий градиент для кнопки
const BTN_BG = require('../assets/blue_button.png');

// иллюстрации экранов
const IMG_SCREEN_1 = require('../assets/onb_1_fisher.png');
const IMG_SCREEN_2 = require('../assets/onb_2_fishes.png');
const IMG_SCREEN_3 = require('../assets/onb_3_two_fishers.png');
const IMG_SCREEN_4 = require('../assets/onb_4_duel.png');
const IMG_SCREEN_5 = require('../assets/onb_5_privacy.png'); // сундук

const SLIDES = [
  {
    key: 'catch',
    image: IMG_SCREEN_1,
    title: 'CATCH THE MOMENT',
    text:
      'Welcome to Fishen Memory Frendy!\n' +
      'Here, every catch is not just a fish, but a memory, mood and laughter with friends.',
    button: 'NEXT',
  },
  {
    key: 'quiz',
    image: IMG_SCREEN_2,
    title: 'WHAT FISH ARE YOU TODAY?',
    text:
      'Answer a few easy questions and find out which fish rules you today. Are you a red energetic fish, a cheerful green fish?',
    button: 'CONTINUE',
  },
  {
    key: 'profile',
    image: IMG_SCREEN_3,
    title: 'CREATE YOUR FISHER',
    text:
      'Add a photo and name – create your own fishing story. All your memories are stored only on your device.',
    button: 'OKAY',
  },
  {
    key: 'duel',
    image: IMG_SCREEN_4,
    title: 'HAVE FUN TOGETHER',
    text:
      'Have fun with a friend: take turns casting the fishing rod, catch tasks and create a fun atmosphere together!',
    button: 'START',
  },
  {
    key: 'privacy',
    image: IMG_SCREEN_5,
    title: 'PRIVACY POLICY',
    text:
      'Fishen Memory Frendy does not collect or share your data. All photos and notes are stored only on your device.',
    button: 'LET`S GO',
  },
];

const COLORS = {
  bg: '#030F41',
  title: '#040F46',
  text: '#040F46',
  buttonText: '#FFFFFF',
};

/** ---------- ПАДДИНГИ ДЛЯ КАРТОЧКИ ---------- */
const getCardStyle = (index) => {
  const cardStyles = [
    { paddingHorizontal: 20, paddingVertical: 40 }, // 1
    { paddingHorizontal: 12, paddingVertical: 20 }, // 2
    { paddingHorizontal: 22, paddingVertical: 18 }, // 3
    { paddingHorizontal: 20, paddingVertical: 20 }, // 4
    { paddingHorizontal: 20, paddingVertical: 20 }, // 5
  ];
  return cardStyles[index] || cardStyles[0];
};

const getTitleStyle = (index) => {
  const titleStyles = [
    { textAlign: 'left' },   // 1
    { textAlign: 'center' }, // 2
    { textAlign: 'center' }, // 3
    { textAlign: 'center' }, // 4
    { textAlign: 'center' }, // 5
  ];
  return titleStyles[index] || titleStyles[0];
};

const getTextStyle = (index) => {
  const textStyles = [
    { textAlign: 'left' },   // 1
    { textAlign: 'left' },   // 2
    { textAlign: 'center' }, // 3
    { textAlign: 'center' }, // 4
    { textAlign: 'center' }, // 5
  ];
  return textStyles[index] || textStyles[0];
};

/** ---------- ВЫСОТА / ПОЗИЦИЯ ИЛЛЮСТРАЦИИ ДЛЯ КАЖДОГО СЛАЙДА ---------- */
/**
 * Здесь всё самое удобное для правки:
 * просто меняешь height / marginBottom для нужного индекса.
 * Высоту я считаю от ширины экрана, чтобы картинка была адекватной
 * на разных девайсах.
 */
const getHeroStyle = (index) => {
  const heroStyles = [
    // 0: CATCH THE MOMENT — самый высокий рыбак
    { height: width * 1.45, marginBottom: -70 },

    // 1: WHAT FISH ARE YOU TODAY? — чуть ниже
    { height: width * 1.25, marginBottom: -10 },

    // 2: CREATE YOUR FISHER — два рыбака, ещё чуть меньше
    { height: width * 1.2, marginBottom: -100 },

    // 3: HAVE FUN TOGETHER — дуэль
    { height: width * 1, marginBottom: -40 },

    // 4: PRIVACY POLICY — сундук, самая низкая
    { height: width * 1.0, marginBottom: 0 },
  ];

  return heroStyles[index] || heroStyles[0];
};

export default function OnboardingScreen({ navigation }) {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];

  const handleNext = () => {
    if (index < SLIDES.length - 1) {
      setIndex((i) => i + 1);
    } else {
      navigation.replace('Registration');
    }
  };

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          {/* верхняя иллюстрация */}
          <View style={styles.heroWrapper}>
            <Image
              source={slide.image}
              style={[styles.heroBase, getHeroStyle(index)]}
              resizeMode="contain"
            />
          </View>

          {/* низ: карточка + кнопка */}
          <View style={styles.bottomWrapper}>
            {/* карточка с текстом */}
            <ImageBackground
              source={CARD_BG}
              style={[styles.card, getCardStyle(index)]}
              imageStyle={styles.cardImage}
              resizeMode="stretch"
            >
              <Text style={[styles.title, getTitleStyle(index)]}>
                {slide.title}
              </Text>
              <Text style={[styles.text, getTextStyle(index)]}>
                {slide.text}
              </Text>
            </ImageBackground>

            {/* кнопка */}
            <Pressable style={styles.buttonWrap} onPress={handleNext}>
              <ImageBackground
                source={BTN_BG}
                style={styles.buttonBg}
                imageStyle={styles.buttonBgImage}
                resizeMode="stretch"
              >
                <Text style={styles.buttonText}>{slide.button}</Text>
              </ImageBackground>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

/* ---------- СТИЛИ ---------- */

const H_PADDING = 16;
const CARD_WIDTH = width - H_PADDING * 2;
const BUTTON_WIDTH = width - 80;
const BUTTON_HEIGHT = 64;

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  safe: {
    flex: 1,
  },

  content: {
    flex: 1,
  },

  // герой прижат к карточке снизу
  heroWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  heroBase: {
    width: width,
  },

  bottomWrapper: {
    paddingHorizontal: H_PADDING,
    paddingBottom: 32,
    alignItems: 'center',
  },

  card: {
    width: CARD_WIDTH,
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  cardImage: {
    borderRadius: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.title,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
    color: COLORS.text,
    marginBottom: 4,
  },

  buttonWrap: {
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    marginBottom: 12,
  },
  buttonBg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonBgImage: {
    borderRadius: 6,
  },
  buttonText: {
    color: COLORS.buttonText,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
