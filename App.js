// App.js — Fishen Memory Frendy (compact stack + Loader)

import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// ---- Components ----
import Loader from './Components/Loader';

import OnboardingScreen from './Components/OnboardingScreen';


import RegistrationScreen from './Components/RegistrationScreen';
import QuizScreen from './Components/QuizScreen';
import QuizResultScreen from './Components/QuizResultScreen';

import HomeScreen from './Components/HomeScreen';

import GameScreen from './Components/GameScreen';        
import MemoriesScreen from './Components/MemoriesScreen'; 
import SettingsScreen from './Components/SettingsScreen';  
import AboutScreen from './Components/AboutScreen';

const RootStack = createNativeStackNavigator();

// тема под твой UI-kit
const THEME = {
  bg: '#030F41',
  card: '#95C5DF',
  text: '#FFFFFF',
  text2: '#E8C452',
  accent: '#235D6B',
  danger: '#640404',
  border: '#000000',
};

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: THEME.bg,
    card: THEME.bg,
    text: THEME.text,
    border: THEME.border,
  },
};

function RootNavigator() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {/* онбординг + політика */}
      <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
    

      {/* реєстрація + квіз */}
      <RootStack.Screen name="Registration" component={RegistrationScreen} />
      <RootStack.Screen name="Quiz" component={QuizScreen} />
      <RootStack.Screen name="QuizResult" component={QuizResultScreen} />

      {/* основні розділи */}
      <RootStack.Screen name="Home" component={HomeScreen} />
      <RootStack.Screen name="Game" component={GameScreen} />
      <RootStack.Screen name="Memories" component={MemoriesScreen} />
      <RootStack.Screen name="Settings" component={SettingsScreen} />
      <RootStack.Screen name="About" component={AboutScreen} />
    </RootStack.Navigator>
  );
}

export default function App() {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 3000);
    return () => clearTimeout(t);
  }, []);

  if (booting) {
    return <Loader fullscreen />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}
