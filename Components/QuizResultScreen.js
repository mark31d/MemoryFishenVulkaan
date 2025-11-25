import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  Dimensions,
  Pressable,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const BG   = require('../assets/bg.png');
const LOGO = require('../assets/Logo.png');
const CARD = require('../assets/register_container.png');
const BTN_BG = require('../assets/blue_button.png');

const QUIZ_RESULT_KEY = '@fmf_quiz_result';

// картинки рыб
const FISH_IMAGES = {
  green: require('../assets/fish_green.png'),
  red: require('../assets/fish_red.png'),
  blue: require('../assets/fish_blue.png'),
  gold: require('../assets/fish_gold.png'),
  purple: require('../assets/fish_purple.png'),
};

const FISH_META = {
  green: {
    title: 'GREEN LAUGHY FISH',
    description:
      'Cheerful and friendly, you bring good mood to everyone around you today.',
  },
  red: {
    title: 'RED ENERGETIC FISH',
    description:
      'Full of energy and drive — today is perfect for active plans and bold ideas.',
  },
  blue: {
    title: 'BLUE SWIFT',
    description:
      'Quick, curious and adventurous — you are ready to swim into something new.',
  },
  gold: {
    title: 'GOLDEN CALM FISH',
    description:
      'Peaceful and balanced — today is ideal for rest and quiet joy.',
  },
  purple: {
    title: 'PURPLE DREAMER',
    description:
      'Dreamy and creative — great time to imagine, draw, write or plan something unusual.',
  },
};

const COLORS = {
  bg: '#030F41',
  cardText: '#040F46',
  title: '#040F46',
  buttonText: '#FFFFFF',
  buttonDisabledOverlay: 'rgba(3,15,65,0.45)',
};

export default function QuizResultScreen({ route, navigation }) {
  const fishKey = route?.params?.fishKey || 'red';
  const meta = FISH_META[fishKey] || FISH_META.red;
  const fishImg = FISH_IMAGES[fishKey];

  // Сохраняем результат квиза в AsyncStorage
  useEffect(() => {
    const saveResult = async () => {
      try {
        const result = {
          fishKey: fishKey,
          title: meta.title,
        };
        await AsyncStorage.setItem(QUIZ_RESULT_KEY, JSON.stringify(result));
      } catch (e) {
        console.warn('Save quiz result error', e);
      }
    };
    saveResult();
  }, [fishKey, meta.title]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Today I am a ${meta.title} in Fishen Memory Frendy!`,
      });
    } catch (e) {
      // ignore
    }
  };

  const handleClose = () => {
    navigation.replace('Home');
  };

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={styles.safe}>
        {/* логотип */}
        <View style={styles.logoWrapper}>
          <Image
            source={LOGO}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* карточка результата */}
        <View style={styles.cardWrapper}>
          <ImageBackground
            source={CARD}
            style={styles.cardBg}
            resizeMode="stretch"
          >
            <View style={styles.cardContent}>
              <Text style={styles.title}>THANKS FOR THE ANSWERS!</Text>
              <Text style={styles.subtitle}>TODAY YOU:</Text>

              <View style={styles.fishWrapper}>
                <Image
                  source={fishImg}
                  style={styles.fishImage}
                  resizeMode="contain"
                />
              </View>

              <Text style={styles.fishTitle}>{meta.title}</Text>
              <Text style={styles.description}>{meta.description}</Text>

              {/* SHARE */}
              <Pressable onPress={handleShare} style={styles.buttonWrapper}>
                <ImageBackground
                  source={BTN_BG}
                  style={styles.buttonBg}
                  imageStyle={styles.buttonBgImage}
                  resizeMode="stretch"
                >
                  <Text style={styles.buttonText}>SHARE</Text>
                </ImageBackground>
              </Pressable>
            </View>
          </ImageBackground>
        </View>

        {/* CLOSE под карточкой */}
        <Pressable onPress={handleClose} style={styles.closeWrapper}>
          <Text style={styles.closeText}>CLOSE</Text>
        </Pressable>
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

  // логотип
  logoWrapper: {
    paddingTop: 24,
    paddingBottom: 8,
    alignItems: 'center',
  },
  logo: {
    width: width * 0.46,
    height: width * 0.46,
    borderRadius: 45, // скругляем, но без обрезания изображения
  },

  // карточка
  cardWrapper: {
    flex: 1,
    paddingHorizontal: 18,
    paddingBottom: 24,
    justifyContent: 'flex-end',
  },
  cardBg: {
    width: '100%',
    minHeight: height * 0.56,
    justifyContent: 'center',
  },
  cardContent: {
    paddingHorizontal: 22,
    paddingVertical: 20,
    alignItems: 'center',
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.title,
    textTransform: 'uppercase',
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.cardText,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },

  fishWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  fishImage: {
    width: width * 0.45,
    height: height * 0.18,
  },

  fishTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.cardText,
    marginBottom: 6,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: COLORS.cardText,
    textAlign: 'center',
    marginBottom: 18,
  },

  // кнопка SHARE
  buttonWrapper: {
    width: '70%',
    height: 52,
    marginTop: 4,
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
    color: COLORS.buttonText,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // CLOSE
  closeWrapper: {
    alignItems: 'center',
    paddingBottom: 18,
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
