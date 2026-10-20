import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from './src/context/AppContext';
import { CategoriesScreen, CategoryFormScreen } from './src/screens/CategoriesScreen';
import { DishDetailsScreen, DishFormScreen, DishListScreen, FilterScreen } from './src/screens/DishScreens';
import { SettingsScreen } from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator(); const Tabs = createBottomTabNavigator();
function DishStack() { const { t } = useApp(); return <Stack.Navigator><Stack.Screen name="DishList" component={DishListScreen} options={{ title: t('dishes') }} /><Stack.Screen name="DishDetails" component={DishDetailsScreen} options={{ title: t('details') }} /><Stack.Screen name="DishForm" component={DishFormScreen} options={{ title: t('addDish') }} /><Stack.Screen name="Filters" component={FilterScreen} options={{ title: t('filters') }} /></Stack.Navigator>; }
function CategoryStack() { const { t } = useApp(); return <Stack.Navigator><Stack.Screen name="CategoryList" component={CategoriesScreen} options={{ title: t('categories') }} /><Stack.Screen name="CategoryForm" component={CategoryFormScreen} options={{ title: t('addCategory') }} /></Stack.Navigator>; }
function Content() { const { ready, t } = useApp(); if (!ready) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator size="large" /></View>; return <NavigationContainer><Tabs.Navigator><Tabs.Screen name="DishTab" component={DishStack} options={{ headerShown: false, title: t('dishes') }} /><Tabs.Screen name="CategoryTab" component={CategoryStack} options={{ headerShown: false, title: t('categories') }} /><Tabs.Screen name="Settings" component={SettingsScreen} options={{ title: t('settings') }} /></Tabs.Navigator></NavigationContainer>; }
export default function App() { return <AppProvider><StatusBar style="dark" /><Content /></AppProvider>; }
