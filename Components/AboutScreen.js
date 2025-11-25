// /Components/AboutScreen.js

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Pressable,
  Dimensions,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const BG = require('../assets/bg.png');
const CONTAINER = require('../assets/register_container.png');
const BLUE_BUTTON = require('../assets/blue_button.png');
const ARROW = require('../assets/ic_arrow.png');
const LOGO = require('../assets/Logo.png');
const FISHER = require('../assets/onb_1_fisher.png'); // рыболов из онбординга

const COLORS = {
  bg: '#030F41',
  title: '#040F46',
  text: '#040F46',
  buttonText: '#FFFFFF',
};

export default function AboutScreen({ navigation }) {
  const handleShare = async () => {
    try {
      await Share.share({
        message:
          'Fishen Memory Frendy — a fun fishing game for friends, with daily mood quiz and “Fishing Memories” for your best moments. The game works fully offline – your data stays only on your device.',
      });
    } catch (e) {
      console.warn('Share error', e);
    }
  };

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={styles.safe}>
        {/* back */}
        <View style={styles.headerRow}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Image source={ARROW} style={styles.backIcon} resizeMode="contain" />
          </Pressable>
        </View>

        {/* карточка About */}
        <View style={styles.cardWrapper}>
          <ImageBackground
            source={CONTAINER}
            style={styles.card}
            imageStyle={styles.cardImage}
            resizeMode="stretch"
          >
            <Text style={styles.title}>ABOUT THE APP</Text>

            <Text style={styles.text}>
              Fishen Memory Frendy is a fun game for a group or a couple of
              friends. Take turns casting the rod, catch random tasks and
              complete them – each catch brings laughter and new memories.
            </Text>

            <Text style={styles.text}>
              The application has a daily quiz “What fish are you today?” to
              find out your mood, and a section “Fishing Memories” where you can
              save photos and notes from the best moments.
            </Text>

            <Text style={[styles.text, { marginBottom: 16 }]}>
              The game works completely offline – your data and memories remain
              only with you.
            </Text>

            {/* блок с картинками */}
            <View style={styles.imagesContainer}>
              <Image
                source={LOGO}
                style={styles.logo}
                resizeMode="contain"
              />
              <Image
                source={FISHER}
                style={styles.fisher}
                resizeMode="contain"
              />
            </View>
          </ImageBackground>

          {/* кнопка SHARE вне контейнера */}
          <Pressable onPress={handleShare} style={styles.buttonPressable}>
            <ImageBackground
              source={BLUE_BUTTON}
              style={styles.buttonBg}
              imageStyle={styles.buttonBgImage}
              resizeMode="stretch"
            >
              <Text style={styles.buttonText}>SHARE</Text>
            </ImageBackground>
          </Pressable>
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
  headerRow: {
    paddingHorizontal: 16,
    paddingTop: 24,
    marginBottom: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 44,
    height: 44,
  },

  cardWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    width: 400,
    height:600,
    paddingHorizontal: 18,
    paddingVertical: 18,
    overflow: 'hidden',
  },
  cardImage: {
    borderRadius: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.title,
    textAlign: 'center',
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    lineHeight: 19,
    color: COLORS.text,
    marginBottom: 8,
  },

  imagesContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    marginBottom: 16,
  },
  logo: {
    position: 'absolute',
    left: 0,
    bottom: -80,
    width: width * 0.35,
    height: width * 0.35,
    borderRadius: 25,
    overflow: 'hidden',
  },
  fisher: {
    position: 'absolute',
    right: -30,
    bottom: -128,
    width: width * 0.5,
    height: width * 0.6,
  },

  buttonPressable: {
    marginTop: 4,
  },
  buttonBg: {
    width: '100%',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonBgImage: {
    borderRadius: 4,
  },
  buttonText: {
    color: COLORS.buttonText,
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
