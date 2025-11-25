// /Components/MemoriesScreen.js

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Pressable,
  SafeAreaView,
  FlatList,
  TextInput,
  Modal,
  Share,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const BG = require('../assets/bg.png');
const ARROW = require('../assets/ic_arrow.png');          // квадратная стрелка назад
const BLUE_BUTTON = require('../assets/blue_button.png');
const RED_BUTTON = require('../assets/red_button.png');
const ICON_PHOTO = require('../assets/ic_photo.png');  // маленькая иконка картинки
const CALENDAR_ICON = require('../assets/calendar.png');

const STORAGE_KEY = '@fmf_memories';

const COLORS = {
  bg: '#030F41',
  card: '#95C5DF',
  cardBorder: '#235D6B',
  title: '#040F46',
  text: '#040F46',
  buttonText: '#FFFFFF',
  deleteBg: '#640404',
};

export default function MemoriesScreen({ navigation }) {
  const [memories, setMemories] = useState([]);
  const [creating, setCreating] = useState(false);

  // поля формы
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [description, setDescription] = useState('');
  const [photo1, setPhoto1] = useState(null);
  const [photo2, setPhoto2] = useState(null);

  // модалка удаления
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [memoryToDelete, setMemoryToDelete] = useState(null);

  // загрузка из AsyncStorage
  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setMemories(JSON.parse(raw));
        }
      } catch (e) {
        console.warn('Memories load error', e);
      }
    };
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation]);

  const saveToStorage = async (items) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Memories save error', e);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDate('');
    setSelectedDate(new Date());
    setShowDatePicker(false);
    setDescription('');
    setPhoto1(null);
    setPhoto2(null);
  };

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
    if (Platform.OS === 'android') {
      if (event.type === 'set' && selectedDate) {
        setDate(formatDate(selectedDate));
      }
      setShowDatePicker(false);
    }
  };

  const handlePickImage = useCallback((slot) => {
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
        if (!uri) return;
        if (slot === 1) setPhoto1(uri);
        if (slot === 2) setPhoto2(uri);
      }
    );
  }, []);

  const handleCreate = () => {
    if (!title.trim() || !description.trim()) {
      // можно добавить Alert, но оставлю мягко
      return;
    }

    const item = {
      id: Date.now().toString(),
      title: title.trim(),
      date: date.trim(),
      description: description.trim(),
      photo1,
      photo2,
    };

    const updated = [item, ...memories];
    setMemories(updated);
    saveToStorage(updated);

    resetForm();
    setCreating(false);
  };

  const handleShare = (item) => {
    const msg =
      `${item.title}\n${item.date ? item.date + '\n' : ''}\n` +
      (item.description || '');
    Share.share({ message: msg });
  };

  const askDelete = (item) => {
    setMemoryToDelete(item);
    setConfirmVisible(true);
  };

  const confirmDelete = () => {
    if (!memoryToDelete) return;
    const updated = memories.filter((m) => m.id !== memoryToDelete.id);
    setMemories(updated);
    saveToStorage(updated);
    setConfirmVisible(false);
    setMemoryToDelete(null);
  };

  const cancelDelete = () => {
    setConfirmVisible(false);
    setMemoryToDelete(null);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyWrapper}>
      <Text style={styles.emptyText}>
        You don't have any fishing memories yet.
      </Text>
    </View>
  );

  const renderMemory = ({ item }) => (
    <View style={styles.memoryCard}>
      {/* title + date */}
      <Text style={styles.memoryTitle}>{item.title.toUpperCase()}</Text>
      {item.date ? (
        <View style={styles.memoryDateRow}>
          <Image
            source={CALENDAR_ICON}
            style={styles.memoryCalendarIcon}
            resizeMode="contain"
          />
          <Text style={styles.memoryDate}>{item.date}</Text>
        </View>
      ) : null}
      {/* description */}
      {item.description ? (
        <Text style={styles.memoryDescription}>{item.description}</Text>
      ) : null}
      {/* photos */}
      {(item.photo1 || item.photo2) && (
        <View style={styles.memoryPhotosRow}>
          {item.photo1 ? (
            <Image
              source={{ uri: item.photo1 }}
              style={styles.memoryPhoto}
              resizeMode="cover"
            />
          ) : null}
          {item.photo2 ? (
            <Image
              source={{ uri: item.photo2 }}
              style={styles.memoryPhoto}
              resizeMode="cover"
            />
          ) : null}
        </View>
      )}

      {/* buttons row */}
      <View style={styles.memoryButtonsRow}>
        <Pressable onPress={() => askDelete(item)} style={styles.cardButtonPressable}>
          <ImageBackground
            source={RED_BUTTON}
            style={styles.cardButtonBg}
            imageStyle={styles.cardButtonBgImage}
            resizeMode="stretch"
          >
            <Text style={styles.cardButtonText}>DELETE</Text>
          </ImageBackground>
        </Pressable>

        <Pressable onPress={() => handleShare(item)} style={styles.cardButtonPressable}>
          <ImageBackground
            source={BLUE_BUTTON}
            style={styles.cardButtonBg}
            imageStyle={styles.cardButtonBgImage}
            resizeMode="stretch"
          >
            <Text style={styles.cardButtonText}>SHARE</Text>
          </ImageBackground>
        </Pressable>
      </View>
    </View>
  );

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={styles.safe}>
        {/* header with back + plus */}
        <View style={styles.headerRow}>
          <Pressable
            style={styles.headerButtonBack}
            onPress={() => navigation.goBack()}
          >
            <Image source={ARROW} style={styles.headerIcon} resizeMode="contain" />
          </Pressable>

          <Text style={styles.headerTitle}>FISHING MEMORIES</Text>

          <Pressable
            style={styles.headerButton}
            onPress={() => setCreating(true)}
          >
            <View style={styles.plusInner}>
              <Text style={styles.plusText}>+</Text>
            </View>
          </Pressable>
        </View>

        {/* список или пустой стейт */}
        {memories.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={memories}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={renderMemory}
          />
        )}

        {/* карточка создания */}
        {creating && (
          <View style={styles.createOverlay}>
            <View style={styles.createCard}>
              <Text style={styles.createTitle}>CREATE A FISHING MEMORIES</Text>

              {/* title + date row */}
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.flex1]}
                  placeholder="Name of the memoir"
                  placeholderTextColor="#33556D"
                  value={title}
                  onChangeText={setTitle}
                />
                <View style={styles.inputSpacer} />
                <Pressable
                  style={[styles.input, styles.flex1, styles.dateInput]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <View style={styles.dateInputContent}>
                    <Image
                      source={CALENDAR_ICON}
                      style={styles.calendarIcon}
                      resizeMode="contain"
                    />
                    <Text style={[styles.dateText, !date && styles.datePlaceholder]}>
                      {date || 'Choose a date'}
                    </Text>
                  </View>
                </Pressable>
              </View>

              {/* description */}
              <TextInput
                style={styles.descriptionInput}
                placeholder="Description:"
                placeholderTextColor="#33556D"
                multiline
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
              />

              {/* two photos */}
              <View style={styles.photosRow}>
                <Pressable
                  style={styles.photoSlot}
                  onPress={() => handlePickImage(1)}
                >
                  {photo1 ? (
                    <Image
                      source={{ uri: photo1 }}
                      style={styles.photoImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Image
                      source={ICON_PHOTO}
                      style={styles.photoIcon}
                      resizeMode="contain"
                    />
                  )}
                </Pressable>

                <Pressable
                  style={styles.photoSlot}
                  onPress={() => handlePickImage(2)}
                >
                  {photo2 ? (
                    <Image
                      source={{ uri: photo2 }}
                      style={styles.photoImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Image
                      source={ICON_PHOTO}
                      style={styles.photoIcon}
                      resizeMode="contain"
                    />
                  )}
                </Pressable>
              </View>

              <Pressable onPress={handleCreate} style={styles.savePressable}>
                <ImageBackground
                  source={BLUE_BUTTON}
                  style={styles.saveButtonBg}
                  imageStyle={styles.saveButtonBgImage}
                  resizeMode="stretch"
                >
                  <Text style={styles.saveButtonText}>SAVE</Text>
                </ImageBackground>
              </Pressable>

              {/* CANCEL link */}
              <Pressable
                onPress={() => {
                  resetForm();
                  setCreating(false);
                }}
                style={styles.cancelArea}
              >
                <Text style={styles.cancelText}>CANCEL</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* модалка выбора даты */}
        <Modal
          visible={showDatePicker}
          transparent
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.dateModalCard}>
              <Text style={styles.modalTitle}>CHOOSE A DATE</Text>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                style={styles.datePicker}
              />
              <Pressable
                onPress={() => {
                  setDate(formatDate(selectedDate));
                  setShowDatePicker(false);
                }}
                style={styles.dateSavePressable}
              >
                <ImageBackground
                  source={BLUE_BUTTON}
                  style={styles.modalBtnBg}
                  imageStyle={styles.modalBtnBgImage}
                  resizeMode="stretch"
                >
                  <Text style={styles.modalBtnText}>SAVE</Text>
                </ImageBackground>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* модалка удаления */}
        <Modal
          visible={confirmVisible}
          transparent
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>DELETE MEMORIES?</Text>
              <View style={styles.modalButtonsRow}>
                <Pressable onPress={confirmDelete} style={styles.modalBtnPressable}>
                  <ImageBackground
                    source={RED_BUTTON}
                    style={styles.modalBtnBg}
                    imageStyle={styles.modalBtnBgImage}
                    resizeMode="stretch"
                  >
                    <Text style={styles.modalBtnText}>DELETE</Text>
                  </ImageBackground>
                </Pressable>
                <Pressable onPress={cancelDelete} style={styles.modalBtnPressable}>
                  <ImageBackground
                    source={BLUE_BUTTON}
                    style={styles.modalBtnBg}
                    imageStyle={styles.modalBtnBgImage}
                    resizeMode="stretch"
                  >
                    <Text style={styles.modalBtnText}>CANCEL</Text>
                  </ImageBackground>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: COLORS.bg },
  safe: { flex: 1 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
    justifyContent: 'space-between',
  },
  headerButtonBack: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 4,
    backgroundColor: '#0A105A',
    borderWidth: 2,
    borderColor: '#E8C452',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    width: 44,
    height: 44,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
   
  },
  plusInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },

  emptyWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    
  },
  emptyText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 15,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 80,
    paddingBottom: 24,
  },

  memoryCard: {
    
    backgroundColor: COLORS.card,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
  },
  memoryTitle: {
    fontSize: 25,
    fontWeight: '700',
    color: COLORS.title,
    marginBottom: 4,
  },
  memoryDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  memoryCalendarIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
    tintColor: COLORS.text,
  },
  memoryDate: {
    fontSize: 25,
    color: COLORS.text,
  },
  memoryDescription: {
    fontSize: 17,
    color: COLORS.text,
    marginBottom: 10,
  },
  memoryPhotosRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  memoryPhoto: {
    width: 120,
    height: 120,
    marginRight: 8,
  },
  memoryButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardButtonPressable: {
    flex: 1,
    marginHorizontal: 4,
  },
  cardButtonBg: {
    width: '100%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardButtonBgImage: {
    borderRadius: 4,
  },
  cardButtonText: {
    color: COLORS.buttonText,
    fontSize: 16,
    fontWeight: '700',
  },

  // create card
  createOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(3,15,65,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  createCard: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  createTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.title,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  flex1: { flex: 1 },
  inputSpacer: { width: 10 },
  input: {
    height: 44,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    backgroundColor: '#9DC6E0',
    paddingHorizontal: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  dateInput: {
    justifyContent: 'center',
  },
  dateInputContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    width: 22,
    height: 22,
    marginRight: 8,
    tintColor: COLORS.text,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.text,
  },
  datePlaceholder: {
    color: '#33556D',
  },
  descriptionInput: {
    height: 110,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    backgroundColor: '#9DC6E0',
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 10,
  },
  photosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  photoSlot: {
    flex: 1,
    height: 120,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    backgroundColor: '#9DC6E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoIcon: {
    width: 32,
    height: 32,
    opacity: 0.8,
  },
  savePressable: {
    marginBottom: 8,
  },
  saveButtonBg: {
    width: '100%',
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonBgImage: {
    borderRadius: 4,
  },
  saveButtonText: {
    color: COLORS.buttonText,
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cancelArea: {
    marginTop: 4,
    alignItems: 'center',
  },
  cancelText: {
    color: COLORS.text,
    fontSize: 14,
  },

  // modal delete
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderWidth: 3,
    borderColor: COLORS.cardBorder,
    borderRadius: 6,
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  dateModalCard: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderWidth: 3,
    borderColor: COLORS.cardBorder,
    borderRadius: 6,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  datePicker: {
    width: '100%',
    marginVertical: 16,
  },
  dateSavePressable: {
    width: '100%',
    marginTop: 8,
  },
  modalTitle: {
    textAlign: 'center',
    color: COLORS.title,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalBtnPressable: {
    flex: 1,
    marginHorizontal: 4,
  },
  modalBtnBg: {
    width: '100%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnBgImage: {
    borderRadius: 4,
  },
  modalBtnText: {
    color: COLORS.buttonText,
    fontSize: 16,
    fontWeight: '700',
  },
});
