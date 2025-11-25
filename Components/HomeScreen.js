// /Components/HomeScreen.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const BG = require('../assets/bg.png');
const LOGO = require('../assets/Logo.png');
const BLUE_BUTTON = require('../assets/blue_button.png');
const WOOD_DESK = require('../assets/wood_desk.png');

// те же ключи, что и в Registration / QuizResult
const PROFILE_KEY = '@fmf_profile';
const QUIZ_RESULT_KEY = '@fmf_quiz_result';

// мапа картинок рыб
const FISH_IMAGES = {
  green: require('../assets/fish_green.png'),
  red: require('../assets/fish_red.png'),
  blue: require('../assets/fish_blue.png'),
  gold: require('../assets/fish_gold.png'),
  purple: require('../assets/fish_purple.png'),
};

const COLORS = {
  bg: '#030F41',
  card: '#95C5DF',
  cardBorder: '#235D6B',
  title: '#040F46',
  text: '#040F46',
  buttonText: '#FFFFFF',
};

// размеры доски и кнопок (без процентов)
const BOARD_WIDTH   = width - 10;     // почти во всю ширину
const BUTTON_WIDTH  = BOARD_WIDTH - 80; // кнопки чуть уже доски

export default function HomeScreen({ navigation, route }) {
  const [profile, setProfile] = useState(null);     // {name, photoUri}
  const [quizResult, setQuizResult] = useState(null); // {fishKey, title}

  useEffect(() => {
    const load = async () => {
      try {
        // 1) Если прилетели параметры (на случай прямой навигации с другими экранами)
        if (route?.params?.photoUri || route?.params?.userName) {
          const fromRoute = {
            name: route.params.userName || 'Fisher',
            photoUri: route.params.photoUri || null,
          };
          setProfile(fromRoute);
          await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(fromRoute));
        } else {
          // 2) Иначе берём профиль из AsyncStorage
          const profileRaw = await AsyncStorage.getItem(PROFILE_KEY);
          if (profileRaw) {
            setProfile(JSON.parse(profileRaw));
          }
        }

        // результат квиза (рыбка)
        const quizRaw = await AsyncStorage.getItem(QUIZ_RESULT_KEY);
        if (quizRaw) setQuizResult(JSON.parse(quizRaw));
      } catch (e) {
        console.warn('HomeScreen load error', e);
      }
    };

    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, route]);

  const userName = profile?.name || 'Fisher';
  const fishKey = quizResult?.fishKey || 'red';
  const fishImage = FISH_IMAGES[fishKey];

  const handleGo = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={styles.safe}>
        {/* Иконка приложения сверху */}
        <View style={styles.logoWrapper}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        </View>

        {/* Приветственная карточка */}
        <View style={styles.greetingWrapper}>
          <View style={styles.greetingCard}>
            <View style={styles.greetingLeft}>
              {profile?.photoUri ? (
                <Image
                  source={{ uri: profile.photoUri }}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]} />
              )}
            </View>

            <View style={styles.greetingCenter}>
              <Text style={styles.greetingTitle}>
                HELLO, {userName.toUpperCase()}!
              </Text>
              <Text style={styles.greetingText}>Have a nice day!</Text>
            </View>

            {fishImage && (
              <View style={styles.greetingRight}>
                <Image
                  source={fishImage}
                  style={styles.fishMini}
                  resizeMode="contain"
                />
              </View>
            )}
          </View>
        </View>

        {/* Деревянный борт с кнопками */}
        <View style={styles.boardWrapper}>
          <ImageBackground
            source={WOOD_DESK}
            style={styles.board}
            imageStyle={styles.boardImage}
            resizeMode="stretch"
          >
            <MenuButton label="GAME" onPress={() => handleGo('Game')} />
            <MenuButton
              label="FISHING MEMORIES"
              onPress={() => handleGo('Memories')}
            />
            <MenuButton
              label="SETTINGS"
              onPress={() => handleGo('Settings')}
            />
            <MenuButton label="ABOUT" onPress={() => handleGo('About')} />
          </ImageBackground>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

function MenuButton({ label, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.menuButtonPressable}>
      <ImageBackground
        source={BLUE_BUTTON}
        style={styles.menuButtonBg}
        imageStyle={styles.menuButtonBgImage}
        resizeMode="stretch"
      >
        <Text style={styles.menuButtonText}>{label}</Text>
      </ImageBackground>
    </Pressable>
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
  logoWrapper: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: 15,
  },

  // greeting card
  greetingWrapper: {
    paddingHorizontal: 50,
    marginBottom: 12,
  },
  greetingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  greetingLeft: {
    marginRight: 10,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
  },
  avatarPlaceholder: {
    backgroundColor: '#7fa8c3',
  },
  greetingCenter: {
    flex: 1,
  },
  greetingTitle: {
    color: COLORS.title,
    fontSize: 25,
    fontWeight: '700',
    marginBottom: 4,
  },
  greetingText: {
    color: COLORS.text,
    fontSize: 14,
  },
  greetingRight: {
    marginLeft: 8,
  },
  fishMini: {
    width: 90,
    height: 90,
    top:20,
    left:10,
  },

  // board + buttons
  boardWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 32,
    paddingHorizontal: 0,
  },
  board: {
   
    minHeight: 450,
    minWidth: 500,
    left:-10,
    paddingHorizontal: 30,
    paddingVertical: 38,
    justifyContent: 'center',
  },
  boardImage: {
    borderRadius: 24,
  },

  menuButtonPressable: {
    marginVertical: 6,
    alignItems: 'center', // чтобы кнопка была уже доски
  },
  menuButtonBg: {
    left:15,
    width: 250,
    height: 74,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonBgImage: {
   
  },
  menuButtonText: {
    color: COLORS.buttonText,
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
