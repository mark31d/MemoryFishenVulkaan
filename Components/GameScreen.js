// /Components/GameScreen.js
// Party fishing game: 2 players, rounds, catch tasks

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Pressable,
  Dimensions,
  TextInput,
  Alert,
  Share,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';

const { width, height } = Dimensions.get('window');

const BG = require('../assets/bg.png');

const CARD_BG = require('../assets/container.png');
const REGISTER_CARD_BG = require('../assets/register_container.png');
const BLUE_BUTTON = require('../assets/blue_button.png');
const RED_BUTTON = require('../assets/red_button.png');
const IC_PHOTO = require('../assets/ic_photo.png');
const ARROW = require('../assets/ic_arrow.png');
const ROD = require('../assets/rod.png'); // удочка
const HOME = require('../assets/ic_home.png'); 
const IMG_SCREEN_1 = require('../assets/onb_1_fisher.png');
const IMG_SCREEN_3 = require('../assets/onb_3_two_fishers.png');
const COLORS = {
  bg: '#030F41',
  card: '#95C5DF',
  cardBorder: '#235D6B',
  title: '#040F46',
  text: '#040F46',
  buttonText: '#FFFFFF',
  buttonBorder: '#E8C452',
  buttonBg: '#0A105A',
  danger: '#640404',
};

const TASKS = [
  'Show how you would pull a giant fish.',
  'Make up and say a new fishing saying.',
  'Make a face as if you had just been bitten by a fish.',
  'Sing along as if you were a singing crucian carp.',
  'Shout “Bite!” so that everyone is scared.',
  'Give the fish a compliment.',
  'Pretend you are a catfish and lying on the bottom.',
  'Come up with a name for your imaginary fish.',
  'Show what your dream catch looks like.',
  'Explain seriously why fish laugh underwater.',
  'Come up with a superhero fish.',
  'Make the sound a fish makes when it is happy.',
  'Throw something in the air and try to “catch” it like a fish.',
  'Come up with a fishing slogan.',
  'Say “I caught it!” as if it were your greatest victory.',
  'Show what you would look like in a fishing cartoon.',
  'Picture a fish trying to trick you.',
  'Imagine yourself as a fish and give a short interview.',
  'Take a selfie as if you caught a shark (even if you didn’t).',
  'Come up with a name for a new fishing game.',
  'Explain to a friend how to fish… without a fish.',
  'Show how you would react if a fish stole your bait.',
  'Say a “fishing toast” — briefly and with feeling.',
  'Come up with what “fish radio” sounds like.',
  'Depict a catch that escaped, but you are still proud of it.',
  'Pretend to catch an imaginary goldfish and make a wish.',
  'Come up with and perform the “Catch of the Day” dance.',
  'Say “I am the main fisherman!” in different intonations.',
  'Show what fishing looks like after 10 hours without a catch.',
  'Come up with your own fishing life hack and explain it with a serious face.',
];

const STEPS = {
  RULES: 'rules',
  P1: 'p1',
  P2: 'p2',
  ROUNDS: 'rounds',
  PRE_CATCH: 'preCatch', // кто ходит сейчас (ROUND + фото + CATCH)
  CATCH: 'catch',        // экран с удочкой
  TASK: 'task',          // задание
  RESULT: 'result',
};

export default function GameScreen({ navigation }) {
  const [step, setStep] = useState(STEPS.RULES);

  const [player1, setPlayer1] = useState({ name: '', photoUri: null });
  const [player2, setPlayer2] = useState({ name: '', photoUri: null });

  const [rounds, setRounds] = useState(10);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [scores, setScores] = useState([0, 0]);
  const [currentTask, setCurrentTask] = useState(null);

  const players = useMemo(() => [player1, player2], [player1, player2]);
  const currentPlayer = players[currentPlayerIndex];

  // ---- image picker ----

  const ensurePhotoPermission = async () => {
    if (Platform.OS !== 'android') return true;

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES ||
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      {
        title: 'Photo permission',
        message:
          'Fishen Memory Frendy needs access to your photos to set player avatars.',
        buttonPositive: 'OK',
      }
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const pickForPlayer = async (which) => {
    const ok = await ensurePhotoPermission();
    if (!ok) {
      Alert.alert(
        'Permission needed',
        'We need access to your photos to set an avatar.'
      );
      return;
    }

    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.9,
      includeBase64: false,
      selectionLimit: 1,
    });

    if (result.didCancel) return;
    if (!result.assets || !result.assets.length) return;

    const uri = result.assets[0].uri;

    if (which === 1) {
      setPlayer1((p) => ({ ...p, photoUri: uri }));
    } else {
      setPlayer2((p) => ({ ...p, photoUri: uri }));
    }
  };

  // ---- game flow ----

  const startGame = () => {
    if (!player1.name.trim() || !player2.name.trim()) {
      Alert.alert('Players', 'Please enter both players names.');
      return;
    }
    setScores([0, 0]);
    setCurrentRound(1);
    setCurrentPlayerIndex(0);
    setCurrentTask(null);
    setStep(STEPS.PRE_CATCH); // сначала экран "кто ходит"
  };

  // экран с удочкой -> через 1.5 сек показываем задание
  useEffect(() => {
    if (step !== STEPS.CATCH) return;

    const timer = setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * TASKS.length);
      setCurrentTask(TASKS[randomIndex]);
      setStep(STEPS.TASK);
    }, 1500); // задержка перед показом задания

    return () => clearTimeout(timer);
  }, [step]);

  const handleTaskResult = (done) => {
    if (done) {
      setScores((prev) => {
        const next = [...prev];
        next[currentPlayerIndex] += 1;
        return next;
      });
    }

    if (currentRound >= rounds) {
      setStep(STEPS.RESULT);
    } else {
      setCurrentRound((r) => r + 1);
      setCurrentPlayerIndex((i) => (i === 0 ? 1 : 0));
      setStep(STEPS.PRE_CATCH); // следующий игрок: снова экран "ROUND + CATCH"
    }
  };

  const handleShare = async () => {
    try {
      const text =
        `Fishing game results:\n` +
        `${player1.name || 'Player 1'} – ${scores[0]} points\n` +
        `${player2.name || 'Player 2'} – ${scores[1]} points`;
      await Share.share({ message: text });
    } catch (e) {
      console.warn('Share error', e);
    }
  };

  const restartFlow = () => {
    setStep(STEPS.RULES);
    setCurrentRound(1);
    setCurrentPlayerIndex(0);
    setScores([0, 0]);
    setCurrentTask(null);
  };

  const renderTopButton = () => {
    // на экранах игры – домик
    if (
      step === STEPS.PRE_CATCH ||
      step === STEPS.CATCH ||
      step === STEPS.TASK ||
      step === STEPS.RESULT
    ) {
      return (
        <Pressable
          style={styles.homeBtn}
          onPress={() => navigation.navigate('Home')}
        >
          <Image style={styles.homeIcon} source = {HOME} ></Image>
        </Pressable>
      );
    }

    // на настройках – стрелка НО БЕЗ нарисованного контейнера
    const goBackInside = () => {
      if (step === STEPS.RULES) {
        navigation.goBack();
      } else if (step === STEPS.P1) {
        setStep(STEPS.RULES);
      } else if (step === STEPS.P2) {
        setStep(STEPS.P1);
      } else if (step === STEPS.ROUNDS) {
        setStep(STEPS.P2);
      }
    };

    return (
      <Pressable style={styles.backBtn} onPress={goBackInside}>
        <Image source={ARROW} style={styles.backIconImg} resizeMode="contain" />
      </Pressable>
    );
  };

  // ---- screens ----

  const renderRules = () => (
    <Card>
      <Text style={styles.cardTitle}>GAME RULES</Text>
      <Text style={styles.cardText}>
        Play with a friend in turns: cast a fishing rod, catch your tasks and
        complete them. Each catch is a new challenge and a portion of laughter.
      </Text>
      <Text style={[styles.cardText, { marginTop: 8 }]}>
        It&apos;s simple: cast, catch, act!
      </Text>

      <BlueButton label="LET`S GO!" onPress={() => setStep(STEPS.P1)} />
    </Card>
  );

  const renderPlayer = (which) => {
    const isP1 = which === 1;
    const player = isP1 ? player1 : player2;
    const setPlayer = isP1 ? setPlayer1 : setPlayer2;

    const onSave = () => {
      if (!player.name.trim()) {
        Alert.alert('Name', 'Please enter a name.');
        return;
      }
      setPlayer((p) => ({ ...p, name: p.name.trim() }));
      if (isP1) setStep(STEPS.P2);
      else setStep(STEPS.ROUNDS);
    };

    return (
      <ImageBackground
        source={REGISTER_CARD_BG}
        style={styles.regCard}
        imageStyle={styles.cardImage}
      >
        <Text style={styles.cardTitle}>
          {isP1 ? 'PLAYER 1' : 'PLAYER 2'}
        </Text>

        <Pressable
          style={styles.photoWrapper}
          onPress={() => pickForPlayer(which)}
        >
          {player.photoUri ? (
            <Image
              source={{ uri: player.photoUri }}
              style={styles.photo}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={IC_PHOTO}
              style={styles.photoIcon}
              resizeMode="contain"
            />
          )}
        </Pressable>

        <View style={styles.nameInputWrapper}>
          <TextInput
            value={player.name}
            onChangeText={(text) => setPlayer({ ...player, name: text })}
            placeholder="Enter your name"
            placeholderTextColor="#4A6477"
            style={styles.nameInput}
          />
        </View>

        <BlueButton label={isP1 ? 'ADD' : 'SAVE'} onPress={onSave} />
      </ImageBackground>
    );
  };

  const renderRounds = () => (
    <Card>
      <Text style={styles.cardTitle}>CHOOSE THE NUMBER OF ROUNDS</Text>

      <View style={styles.roundsList}>
        {[5, 10, 15].map((value) => (
          <Pressable
            key={value}
            style={[
              styles.roundRow,
              rounds === value && styles.roundRowActive,
            ]}
            onPress={() => setRounds(value)}
          >
            <View
              style={[
                styles.roundCheckbox,
                rounds === value && styles.roundCheckboxActive,
              ]}
            >
              {rounds === value && <View style={styles.roundCheckboxInner} />}
            </View>
            <Text style={styles.roundText}>{value} rounds</Text>
          </Pressable>
        ))}
      </View>

      <BlueButton label="START" onPress={startGame} />
    </Card>
  );

  // новый экран – кто ходит (ROUND + фото + CATCH)
  const renderPreCatch = () => {
    const displayName =
      currentPlayer.name || (currentPlayerIndex === 0 ? 'Player 1' : 'Player 2');

    return (
      <View style={styles.preCatchWrapper}>
        <Card>
          <Text style={styles.cardTitle}>ROUND {currentRound}</Text>
          <Text style={styles.cardText}>{displayName} casts the rod!</Text>

          <View style={styles.preCatchPhotoWrapper}>
            {currentPlayer.photoUri ? (
              <Image
                source={{ uri: currentPlayer.photoUri }}
                style={styles.preCatchPhoto}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={IC_PHOTO}
                style={styles.preCatchPhotoIcon}
                resizeMode="contain"
              />
            )}
          </View>

          <BlueButton
            label="CATCH"
            onPress={() => setStep(STEPS.CATCH)}
          />
        </Card>
      </View>
    );
  };

  // экран с удочкой (как на втором скрине)
  const renderCatch = () => (
    <View style={styles.catchContainer}>
      <Text style={styles.catchHint}>
        Let&apos;s catch something interesting...
      </Text>

      <View style={styles.catchRodWrapper}>
        <Image source={ROD} style={styles.catchRod} resizeMode="contain" />
      </View>
    </View>
  );

  const renderTask = () => (
    <View style={styles.taskWrapper}>
        <View style = {styles.rowContainer}>
      <Text style={styles.niceCatch}>NICE CATCH!</Text>
      <Image style ={styles.hero}  source={IMG_SCREEN_1}></Image>
      </View>
      <Card>
        <View style={styles.taskPhotoWrapper}>
          {currentPlayer.photoUri ? (
            <Image
              source={{ uri: currentPlayer.photoUri }}
              style={styles.taskPhoto}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={IC_PHOTO}
              style={styles.taskPhotoIcon}
              resizeMode="contain"
            />
          )}
        </View>

        <Text
          style={[
            styles.cardTitle,
            { textAlign: 'center', marginTop: 8 },
          ]}
        >
          {(
            currentPlayer.name ||
            (currentPlayerIndex === 0 ? 'PLAYER 1' : 'PLAYER 2')
          ).toUpperCase()}
          , THIS IS THE TASK YOU CAUGHT:
        </Text>

        <Text style={[styles.cardText, { marginTop: 10 }]}>{currentTask}</Text>

        <View style={styles.taskButtonsRow}>
          <Pressable
            style={styles.smallButtonWrapper}
            onPress={() => handleTaskResult(true)}
          >
            <ImageBackground
              source={BLUE_BUTTON}
              style={styles.smallButtonBg}
              imageStyle={styles.smallButtonBgImage}
              resizeMode="stretch"
            >
              <Text style={styles.smallButtonText}>DONE</Text>
            </ImageBackground>
          </Pressable>

          <Pressable
            style={styles.smallButtonWrapper}
            onPress={() => handleTaskResult(false)}
          >
            <ImageBackground
              source={RED_BUTTON}
              style={styles.smallButtonBg}
              imageStyle={styles.smallButtonBgImage}
              resizeMode="stretch"
            >
              <Text style={styles.smallButtonText}>NOT DONE</Text>
            </ImageBackground>
          </Pressable>
        </View>
      </Card>
    </View>
  );

  const renderResult = () => (
    <View style={styles.resultWrapper}>
      <View style={styles.resultImageWrapper}>
        <Image
          source={IMG_SCREEN_3}
          style={styles.resultImage}
          resizeMode="contain"
        />
      </View>
      <ImageBackground
        source={REGISTER_CARD_BG}
        style={styles.resultCard}
        imageStyle={styles.cardImage}
      >
        <Text style={styles.cardTitle}>RESULTS</Text>

        <View style={styles.resultRow}>
          <View style={styles.resultLeft}>
            {player1.photoUri ? (
              <Image
                source={{ uri: player1.photoUri }}
                style={styles.resultPhoto}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={IC_PHOTO}
                style={styles.resultPhoto}
                resizeMode="contain"
              />
            )}
            <View>
              <Text style={styles.resultLabel}>PLAYER 1</Text>
              <Text style={styles.resultName}>
                {player1.name || 'Player 1'}
              </Text>
            </View>
          </View>
          <Text style={styles.resultScore}>{scores[0]}</Text>
        </View>

        <View style={styles.resultRow}>
          <View style={styles.resultLeft}>
            {player2.photoUri ? (
              <Image
                source={{ uri: player2.photoUri }}
                style={styles.resultPhoto}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={IC_PHOTO}
                style={styles.resultPhoto}
                resizeMode="contain"
              />
            )}
            <View>
              <Text style={styles.resultLabel}>PLAYER 2</Text>
              <Text style={styles.resultName}>
                {player2.name || 'Player 2'}
              </Text>
            </View>
          </View>
          <Text style={styles.resultScore}>{scores[1]}</Text>
        </View>

        <BlueButton label="SHARE" onPress={handleShare} />
      </ImageBackground>
    </View>
  );

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={styles.safe}>
        <View style={styles.topRow}>
          {renderTopButton()}
          <View style={{ width: 48 }} />
        </View>

        <View style={styles.content}>
          {step === STEPS.RULES && renderRules()}
          {step === STEPS.P1 && renderPlayer(1)}
          {step === STEPS.P2 && renderPlayer(2)}
          {step === STEPS.ROUNDS && renderRounds()}
          {step === STEPS.PRE_CATCH && renderPreCatch()}
          {step === STEPS.CATCH && renderCatch()}
          {step === STEPS.TASK && renderTask()}
          {step === STEPS.RESULT && renderResult()}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

// helpers

function Card({ children }) {
  return (
    <ImageBackground
      source={CARD_BG}
      style={styles.card}
      imageStyle={styles.cardImage}
    >
      {children}
    </ImageBackground>
  );
}

function BlueButton({ label, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.blueButtonWrapper}>
      <ImageBackground
        source={BLUE_BUTTON}
        style={styles.blueButton}
        imageStyle={styles.blueButtonImage}
        resizeMode="stretch"
      >
        <Text style={styles.blueButtonText}>{label}</Text>
      </ImageBackground>
    </Pressable>
  );
}

// styles

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  safe: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  // стрелка БЕЗ контейнера
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    top:20,
  },
  backIconImg: {
    width: 45,
    height: 45,

  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  // домик остаётся в рамке
  homeBtn: {
    width: 44,
    height: 44,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: COLORS.buttonBorder,
    backgroundColor: COLORS.buttonBg,
    alignItems: 'center',
    justifyContent: 'center',
    top:20,
  },
  homeIcon: {
    width:45,
    height:45,

  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    justifyContent: 'center',
  },

  card: {
    paddingHorizontal: 24,
    paddingVertical: 22,
  },
  cardImage: {resizeMode:'contain', width:700,left:-150,top:-30, height:550,},
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.title,
    textAlign: 'center',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 15,
    lineHeight: 20,
    color: COLORS.text,
    textAlign: 'center',
  },

  blueButtonWrapper: {
    marginTop: 18,
  },
  blueButton: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blueButtonImage: {
    borderRadius: 4,
  },
  blueButtonText: {
    color: COLORS.buttonText,
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  // карточки игроков
  regCard: {
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 22,
  },
  photoWrapper: {
    marginTop: 12,
    alignSelf: 'center',
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
    backgroundColor: '#7fa8c3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoIcon: {
    width: 64,
    height: 64,
    tintColor: '#235D6B',
  },
  nameInputWrapper: {
    marginTop: 16,
  },
  nameInput: {
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    borderRadius: 2,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },

  roundsList: {
    marginTop: 16,
  },
  roundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 2,
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  roundRowActive: {
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  roundCheckbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundCheckboxActive: {
    borderColor: COLORS.buttonBg,
  },
  roundCheckboxInner: {
    width: 12,
    height: 12,
    backgroundColor: COLORS.buttonBg,
  },
  roundText: {
    fontSize: 15,
    color: COLORS.text,
  },

  // PRE_CATCH – карточка "ROUND + фото + CATCH"
  preCatchWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  preCatchPhotoWrapper: {
    alignSelf: 'center',
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
    backgroundColor: '#7fa8c3',
    marginVertical: 14,
  },
  preCatchPhoto: {
    width: '100%',
    height: '100%',
  },
  preCatchPhotoIcon: {
    width: '100%',
    height: '100%',
  },

  // CATCH – удочка
  catchContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  catchHint: {
    position: 'absolute',
    top: height * 0.2,
    alignSelf: 'center',
    color: '#FFFFFF',
    fontSize: 16,
  },
  catchRodWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  catchRod: {
    width: width * 1,
    height: height * 1,top:240,
  },

  // TASK
  taskWrapper: {
    flex: 1,
    justifyContent: 'center',
   
  },
  niceCatch: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',

  },
  taskPhotoWrapper: {
    alignSelf: 'center',
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
    backgroundColor: '#7fa8c3',
  },
  taskPhoto: {
    width: '100%',
    height: '100%',
  },
  taskPhotoIcon: {
    width: '100%',
    height: '100%',
  },
  taskButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  smallButtonWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  smallButtonBg: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallButtonBgImage: {
    borderRadius: 4,
  },
  smallButtonText: {
    color: COLORS.buttonText,
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  // RESULT
  resultWrapper: {
    flex: 1,
    justifyContent: 'center',
    top:-10,
  },
  resultImageWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  resultImage: {
    width: width * 0.8,
    height: width * 0.5,
  },
  resultCard: {
    paddingHorizontal: 44,
    paddingVertical:102,
    
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  resultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultPhoto: {
    width: 80,
    height: 80,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    marginRight: 10,
    backgroundColor: '#7fa8c3',
  },
  resultLabel: {
    fontSize: 25,
    fontWeight: '700',
    color: COLORS.text,
  },
  resultName: {
    fontSize: 15,
    color: COLORS.text,
  },
  resultScore: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.title,
  },
  finishTextBtn: {
    marginTop: 12,
    alignSelf: 'center',
  },
  finishText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',

  },
  hero: {
    width: 200,
    height: 210,
  },
});
