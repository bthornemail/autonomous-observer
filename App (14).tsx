import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { StatusBar, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

// Import our existing components adapted for React Native
import HarmonyCalculatorScreen from './screens/HarmonyCalculatorScreen'
import GeometryVisualizerScreen from './screens/GeometryVisualizerScreen'  
import MeditationScreen from './screens/MeditationScreen'

const Tab = createBottomTabNavigator()

const App: React.FC = () => {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#001122" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: string
              
              if (route.name === 'Harmony') {
                iconName = 'calculate'
              } else if (route.name === 'Geometry') {
                iconName = 'panorama-fisheye'
              } else {
                iconName = 'self-improvement'
              }
              
              return <Icon name={iconName} size={size} color={color} />
            },
            tabBarActiveTintColor: '#FFD700',
            tabBarInactiveTintColor: '#888888',
            tabBarStyle: {
              backgroundColor: '#001122',
              borderTopColor: '#FFD700',
              borderTopWidth: 2,
            },
            headerStyle: {
              backgroundColor: '#001122',
            },
            headerTintColor: '#FFD700',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          })}
        >
          <Tab.Screen 
            name="Harmony" 
            component={HarmonyCalculatorScreen}
            options={{ title: '📐 Harmony Calculator' }}
          />
          <Tab.Screen 
            name="Geometry" 
            component={GeometryVisualizerScreen}
            options={{ title: '✨ Sacred Geometry' }}
          />
          <Tab.Screen 
            name="Meditation" 
            component={MeditationScreen}
            options={{ title: '🧘 Meditation' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  )
}

export default App