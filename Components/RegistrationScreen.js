// /Components/RegistrationScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TextInput,
  Pressable,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const BG                = require('../assets/bg.png');
const LOGO              = require('../assets/Logo.png');
const REGISTER_CARD     = require('../assets/register_container.png');
const BUTTON_IMG        = require('../assets/blue_button.png');
const PHOTO_PLACEHOLDER = require('../assets/ic_photo.png');

const PROFILE_KEY = '@fmf_profile';

const COLORS = {
  title: '#040F46',
  text: '#040F46',
  inputBorder: '#235D6B',
  placeholder: 'rgba(4,15,70,0.6)',
  buttonText: '#FFFFFF',
};

// базовые размеры без процентов
const H_PADDING     = 16;
const CARD_WIDTH    = width - H_PADDING * 2;
const LOGO_SIZE     = 200;
const PHOTO_SIZE    = 180;
const BUTTON_HEIGHT = 60;

export default function RegistrationScreen({ navigation }) {
  const [name, setName] = useState('');
  const [photoUri, setPhotoUri] = useState(null);

  const handlePickPhoto = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.9,
      selectionLimit: 1,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        console.log('ImagePicker error: ', response.errorMessage);
        return;
      }
      const asset = response.assets && response.assets[0];
      if (asset?.uri) {
        setPhotoUri(asset.uri);
      }
    });
  };

  const handleSave = async () => {
    const trimmedName = name.trim() || 'Fisher';
    const profile = {
      name: trimmedName,
      photoUri: photoUri,
    };

    try {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.warn('RegistrationScreen save error', e);
    }

    // дальше идём в Quiz (Home потом сам прочитает профиль из AsyncStorage)
    navigation.replace('Quiz', {
      userName: trimmedName,
      photoUri,
    });
  };

  const canSave = name.trim().length > 0 && !!photoUri;

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.kav}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* logo */}
          <View style={styles.logoWrapper}>
            <Image source={LOGO} style={styles.logo} resizeMode="contain" />
          </View>

          {/* card based on register_container.png */}
          <View style={styles.cardOuter}>
            <ImageBackground
              source={REGISTER_CARD}
              style={styles.card}
              resizeMode="stretch"
              imageStyle={styles.cardImage}
            >
              <Text style={styles.title}>REGISTRATION</Text>

              {/* photo picker */}
              <Pressable style={styles.photoBox} onPress={handlePickPhoto}>
                {photoUri ? (
                  <Image
                    source={{ uri: photoUri }}
                    style={styles.photo}
                    resizeMode="cover"
                  />
                ) : (
                  <Image
                    source={PHOTO_PLACEHOLDER}
                    style={styles.photoPlaceholderImg}
                    resizeMode="contain"
                  />
                )}
              </Pressable>

              {/* name input */}
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor={COLORS.placeholder}
                value={name}
                onChangeText={setName}
              />

              {/* blue button — показываем ТОЛЬКО если есть имя и фото */}
              {canSave && (
                <Pressable style={styles.buttonWrapper} onPress={handleSave}>
                  <ImageBackground
                    source={BUTTON_IMG}
                    style={styles.buttonBg}
                    imageStyle={styles.buttonBgImage}
                    resizeMode="stretch"
                  >
                    <Text style={styles.buttonText}>SAVE</Text>
                  </ImageBackground>
                </Pressable>
              )}
            </ImageBackground>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  kav: {
    flex: 1,
  },

  logoWrapper: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: 24,
  },

  cardOuter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: H_PADDING,
    paddingBottom: 32,
  },
  card: {
    width: CARD_WIDTH,
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 28,
    alignItems: 'center',
  },
  cardImage: {
    borderRadius: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.title,
    marginBottom: 18,
    textTransform: 'uppercase',
  },

  photoBox: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderWidth: 3,
    borderColor: COLORS.inputBorder,
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  photo: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
  },
  photoPlaceholderImg: {
    width: PHOTO_SIZE * 0.2,
    height: PHOTO_SIZE * 0.2,
    tintColor: '#235D6B',
  },

  input: {
    alignSelf: 'stretch',
    height: 52,
    borderWidth: 3,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: 12,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 20,
    backgroundColor: 'transparent',
  },

  buttonWrapper: {
    alignSelf: 'stretch',
    height: BUTTON_HEIGHT,
    marginTop: 4,
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
