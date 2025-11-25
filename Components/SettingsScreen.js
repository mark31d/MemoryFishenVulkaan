// /Components/SettingsScreen.js

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Pressable,
  Dimensions,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';

const { width } = Dimensions.get('window');

const BG = require('../assets/bg.png');
const CONTAINER = require('../assets/container.png');
const BLUE_BUTTON = require('../assets/blue_button.png');
const RED_BUTTON = require('../assets/red_button.png');
const ARROW = require('../assets/ic_arrow.png');
const IC_PHOTO = require('../assets/ic_photo.png');

const PROFILE_KEY = '@fmf_profile';
const QUIZ_RESULT_KEY = '@fmf_quiz_result';
const MEMORIES_KEY = '@fmf_memories';
const GAME_STATE_KEY = '@fmf_game_state';
const RATING_KEY = '@fmf_rating';

const COLORS = {
  bg: '#030F41',
  cardText: '#040F46',
  title: '#040F46',
  buttonText: '#FFFFFF',
  ratingActive: '#E8C452',
  ratingInactive: '#040F46',
};

export default function SettingsScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [rating, setRating] = useState(0);
  const [canReset, setCanReset] = useState(false);

  const [editVisible, setEditVisible] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftPhotoUri, setDraftPhotoUri] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const profileRaw = await AsyncStorage.getItem(PROFILE_KEY);
        if (profileRaw) setProfile(JSON.parse(profileRaw));

        const ratingRaw = await AsyncStorage.getItem(RATING_KEY);
        if (ratingRaw) setRating(Number(ratingRaw) || 0);

        setCanReset(!!profileRaw || !!ratingRaw);
      } catch (e) {
        console.warn('Settings load error', e);
      }
    };

    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation]);

  const openEdit = useCallback(() => {
    setDraftName(profile?.name || '');
    setDraftPhotoUri(profile?.photoUri || null);
    setEditVisible(true);
  }, [profile]);

  const handlePickPhoto = useCallback(() => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.9,
      },
      (response) => {
        if (response.didCancel || response.errorCode) {
          return;
        }
        const uri = response.assets?.[0]?.uri;
        if (uri) {
          setDraftPhotoUri(uri);
        }
      },
    );
  }, []);

  const handleSaveProfile = useCallback(async () => {
    const name = draftName.trim() || 'Fisher';
    const newProfile = { name, photoUri: draftPhotoUri || null };

    try {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
      setProfile(newProfile);
      setCanReset(true);
      setEditVisible(false);
    } catch (e) {
      console.warn('Save profile error', e);
    }
  }, [draftName, draftPhotoUri]);

  const handleSetRating = useCallback(
    async (value) => {
      setRating(value);
      setCanReset(true);
      try {
        await AsyncStorage.setItem(RATING_KEY, String(value));
      } catch (e) {
        console.warn('Save rating error', e);
      }
    },
    [],
  );

  const handleReset = useCallback(() => {
    if (!canReset) return;

    Alert.alert(
      'Reset progress?',
      'This will delete your profile, quiz result and fishing memories.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                PROFILE_KEY,
                QUIZ_RESULT_KEY,
                MEMORIES_KEY,
                GAME_STATE_KEY,
                RATING_KEY,
              ]);
            } catch (e) {
              console.warn('Reset error', e);
            } finally {
              setProfile(null);
              setRating(0);
              setCanReset(false);
            }
          },
        },
      ],
    );
  }, [canReset]);

  const userName = profile?.name || 'Fisher';
  const avatarUri = profile?.photoUri || null;

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

        {/* cards */}
        <View style={styles.cardsWrapper}>
          {/* YOUR PROFILE */}
          <ImageBackground
            source={CONTAINER}
            style={styles.card}
            imageStyle={styles.cardImage}
            resizeMode="stretch"
          >
            <Text style={styles.cardTitle}>YOUR PROFILE</Text>

            <Pressable onPress={openEdit} style={styles.avatarWrapper}>
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Image
                    source={IC_PHOTO}
                    style={styles.icPhotoCenter}
                    resizeMode="contain"
                  />
                </View>
              )}

              {avatarUri && (
                <View style={styles.icPhotoBadge}>
                  <Image
                    source={IC_PHOTO}
                    style={styles.icPhotoSmall}
                    resizeMode="contain"
                  />
                </View>
              )}
            </Pressable>

            <Text style={styles.userName}>{userName}</Text>

            <PrimaryButton label="CHANGE" onPress={openEdit} />
          </ImageBackground>

          {/* SETTINGS */}
          <ImageBackground
            source={CONTAINER}
            style={[styles.card, styles.cardSettings]}
            imageStyle={styles.cardImage}
            resizeMode="stretch"
          >
            <Text style={styles.cardTitle}>SETTINGS</Text>

            <View style={styles.rowBetween}>
              <Text style={styles.label}>RATING</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((v) => (
                  <Pressable
                    key={v}
                    onPress={() => handleSetRating(v)}
                    hitSlop={8}
                  >
                    <Text
                      style={[
                        styles.star,
                        v <= rating ? styles.starActive : styles.starInactive,
                      ]}
                    >
                      ★
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Text style={styles.ratingHint}>
              Tap a star to rate your fishing mood.
            </Text>

            <View style={styles.resetWrapper}>
              <DangerButton
                label="RESET PROGRESS"
                onPress={handleReset}
                disabled={!canReset}
              />
            </View>
          </ImageBackground>
        </View>

        {/* modal edit profile */}
        <Modal
          visible={editVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setEditVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <ImageBackground
              source={CONTAINER}
              style={styles.modalCard}
              imageStyle={styles.cardImage}
              resizeMode="stretch"
            >
              <Text style={styles.cardTitle}>CHANGE PROFILE</Text>

              <Pressable onPress={handlePickPhoto} style={styles.modalAvatarWrap}>
                {draftPhotoUri ? (
                  <Image
                    source={{ uri: draftPhotoUri }}
                    style={styles.modalAvatar}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.modalAvatar, styles.avatarPlaceholder]}>
                    <Image
                      source={IC_PHOTO}
                      style={styles.icPhotoCenter}
                      resizeMode="contain"
                    />
                  </View>
                )}
                <View style={styles.icPhotoBadge}>
                  <Image
                    source={IC_PHOTO}
                    style={styles.icPhotoSmall}
                    resizeMode="contain"
                  />
                </View>
              </Pressable>

              <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor="#4f6b82"
                value={draftName}
                onChangeText={setDraftName}
              />

              <View style={styles.modalButtonsRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <PrimaryButton label="CHANGE" onPress={handleSaveProfile} />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Pressable
                    onPress={() => setEditVisible(false)}
                    style={styles.menuButtonPressable}
                  >
                    <ImageBackground
                      source={BLUE_BUTTON}
                      style={styles.menuButtonBg}
                      imageStyle={styles.menuButtonBgImage}
                      resizeMode="stretch"
                    >
                      <Text style={styles.cancelText}>CANCEL</Text>
                    </ImageBackground>
                  </Pressable>
                </View>
              </View>
            </ImageBackground>
          </View>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
}

function PrimaryButton({ label, onPress }) {
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

function DangerButton({ label, onPress, disabled }) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={[styles.menuButtonPressable, disabled && { opacity: 0.4 }]}
    >
      <ImageBackground
        source={RED_BUTTON}
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

  headerRow: {
    paddingHorizontal: 16,
    paddingTop: 24,
    marginBottom: 8,
  },
  // БОЛЬШАЯ КНОПКА ВЫХОДА
  backButton: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 56,
    height: 56,
  },

  cardsWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    flex: 1,
    justifyContent: 'flex-start',
  },

  // контейнер не обрезается сверху/снизу
  card: {
    width: 400,
    paddingHorizontal: 18,
    paddingVertical: 20,
    marginVertical: 12,          // отступ сверху и снизу
  },
  cardSettings: {
    marginTop: 4,
  },
  cardImage: {},
  cardTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.title,
    marginBottom: 12,
  },

  avatarWrapper: {
    alignSelf: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: width * 0.4,
    height: width * 0.4,
    borderWidth: 2,
    borderColor: '#235D6B',
  },
  avatarPlaceholder: {
    backgroundColor: '#7fa8c3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icPhotoCenter: {
    width: 40,
    height: 40,
  },
  icPhotoBadge: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#95C5DF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#235D6B',
  },
  icPhotoSmall: {
    width: 18,
    height: 18,
  },
  userName: {
    marginTop: 4,
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 16,
    color: COLORS.cardText,
  },

  menuButtonPressable: {
    marginTop: 8,
  },
  menuButtonBg: {
    width: '100%',
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonBgImage: {
    borderRadius: 4,
  },
  menuButtonText: {
    color: COLORS.buttonText,
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  label: {
    fontSize: 16,
    color: COLORS.cardText,
    fontWeight: '600',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 24,
    marginHorizontal: 2,
  },
  starActive: {
    color: COLORS.ratingActive,
  },
  starInactive: {
    color: COLORS.ratingInactive,
  },
  ratingHint: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.cardText,
  },
  resetWrapper: {
    marginTop: 16,
  },

  // modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(3,15,65,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width:400,
    paddingHorizontal: 18,
    paddingVertical: 20,
    marginVertical: 16,      // чтобы контейнер модалки тоже не обрезался
  },
  modalAvatarWrap: {
    alignSelf: 'center',
    marginBottom: 10,
  },
  modalAvatar: {
    width: width * 0.45,
    height: width * 0.45,
    borderWidth: 2,
    borderColor: '#235D6B',
  },
  input: {
    height: 44,
    borderWidth: 2,
    borderColor: '#235D6B',
    backgroundColor: '#95C5DF',
    paddingHorizontal: 10,
    color: COLORS.cardText,
    marginBottom: 12,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  cancelText: {
    color: COLORS.buttonText,
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
