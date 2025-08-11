import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Share,
  Vibration
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import PushNotification from 'react-native-push-notification'

// Import our existing Sacred Geometry Engine (same as web version)
import { SacredGeometryEngine, HarmonyCalculation } from '../lib/SacredGeometryEngine'

interface PersonalData {
  name: string
  birthDate: string
  favoriteNumber: number
}

const HarmonyCalculatorScreen: React.FC = () => {
  const [personalData, setPersonalData] = useState<PersonalData>({
    name: '',
    birthDate: '',
    favoriteNumber: 7
  })
  
  const [harmonyResult, setHarmonyResult] = useState<HarmonyCalculation | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleCalculate = async () => {
    if (!personalData.name || !personalData.birthDate) {
      Alert.alert('Missing Information', 'Please enter your name and birth date')
      return
    }

    setIsCalculating(true)
    Vibration.vibrate(50) // Haptic feedback
    
    // Add a small delay for the sacred calculation effect
    setTimeout(async () => {
      try {
        const birthDate = new Date(personalData.birthDate)
        const result = SacredGeometryEngine.calculatePersonalHarmony(
          birthDate,
          personalData.name,
          personalData.favoriteNumber
        )
        
        setHarmonyResult(result)
        
        // Save to device storage for offline access
        await AsyncStorage.setItem('lastHarmonyScore', JSON.stringify(result))
        await AsyncStorage.setItem('userData', JSON.stringify(personalData))
        
        // Schedule daily harmony reminder notification
        PushNotification.localNotificationSchedule({
          title: '🌸 Daily Harmony Check',
          message: `Your harmony was ${result.score}/100 yesterday. Ready for today's check?`,
          date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
          repeatType: 'day',
        })
        
        setIsCalculating(false)
        Vibration.vibrate([100, 200, 100]) // Success vibration pattern
      } catch (error) {
        Alert.alert('Calculation Error', 'Unable to calculate harmony. Please try again.')
        setIsCalculating(false)
      }
    }, 1500)
  }

  const handleShare = async () => {
    if (!harmonyResult) return
    
    try {
      await Share.share({
        message: `🌸 I just calculated my Sacred Geometry Harmony! 

My score: ${harmonyResult.score}/100 ✨
Golden Ratio alignment: ${harmonyResult.harmonicResonance}

Ancient mathematics meets modern wellness.
Try it yourself: https://sacred-geometry.app

#SacredGeometry #PersonalHarmony #GoldenRatio`,
        url: 'https://sacred-geometry.app'
      })
    } catch (error) {
      console.log('Share error:', error)
    }
  }

  const getHarmonyColor = (score: number): string => {
    if (score >= 80) return '#00ff00'
    if (score >= 60) return '#ffff00' 
    if (score >= 40) return '#ff8c00'
    return '#ff4444'
  }

  const getHarmonyMessage = (score: number): string => {
    if (score >= 80) return 'Excellent Harmony! ✨'
    if (score >= 60) return 'Good Harmony 🌟'
    if (score >= 40) return 'Moderate Harmony 📐'
    return 'Needs Attention ⚡'
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>📐 Personal Harmony Calculator</Text>
        <Text style={styles.subtitle}>
          Discover your sacred geometric alignment using ancient mathematical principles
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Your Full Name:</Text>
        <TextInput
          style={styles.input}
          value={personalData.name}
          onChangeText={(text) => setPersonalData({...personalData, name: text})}
          placeholder="Enter your full name"
          placeholderTextColor="#888888"
        />

        <Text style={styles.label}>Birth Date:</Text>
        <TextInput
          style={styles.input}
          value={personalData.birthDate}
          onChangeText={(text) => setPersonalData({...personalData, birthDate: text})}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#888888"
        />

        <Text style={styles.label}>Favorite Number (1-9):</Text>
        <TextInput
          style={styles.input}
          value={personalData.favoriteNumber.toString()}
          onChangeText={(text) => {
            const num = parseInt(text) || 7
            setPersonalData({...personalData, favoriteNumber: Math.max(1, Math.min(9, num))})
          }}
          placeholder="7"
          keyboardType="numeric"
          placeholderTextColor="#888888"
        />
      </View>

      <TouchableOpacity 
        style={[styles.calculateButton, isCalculating && styles.calculating]}
        onPress={handleCalculate}
        disabled={isCalculating}
      >
        <Text style={styles.calculateButtonText}>
          {isCalculating ? '🌀 Calculating Sacred Harmony...' : '✨ Calculate My Harmony'}
        </Text>
      </TouchableOpacity>

      {harmonyResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>{getHarmonyMessage(harmonyResult.score)}</Text>
          
          <Text style={[styles.harmonyScore, { color: getHarmonyColor(harmonyResult.score) }]}>
            {harmonyResult.score}/100
          </Text>

          <View style={styles.phiContainer}>
            <Text style={styles.phiText}>
              🌀 Your Golden Ratio Alignment: {harmonyResult.harmonicResonance}
            </Text>
            <Text style={styles.phiText}>
              📐 Φ (Phi): {harmonyResult.phi.toFixed(10)}
            </Text>
          </View>

          <View style={styles.recommendationsContainer}>
            <Text style={styles.recommendationsTitle}>🎯 Personalized Harmony Recommendations:</Text>
            {harmonyResult.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>📤 Share My Harmony</Text>
          </TouchableOpacity>

          <View style={styles.explanationContainer}>
            <Text style={styles.explanationText}>
              ✨ This calculation uses sacred mathematical principles including the Golden Ratio 
              (Φ = {harmonyResult.phi.toFixed(6)}), numerology, and geometric harmonics to assess 
              your personal energy alignment with the patterns of the universe.
            </Text>
          </View>
        </View>
      )}

      <View style={styles.howItWorksContainer}>
        <Text style={styles.howItWorksTitle}>🌟 How It Works</Text>
        <Text style={styles.howItWorksItem}>• Name Analysis: Each letter carries vibrational frequency</Text>
        <Text style={styles.howItWorksItem}>• Birth Date Patterns: Your cosmic numerical signature</Text>
        <Text style={styles.howItWorksItem}>• Golden Ratio Alignment: How closely you match Φ = 1.618...</Text>
        <Text style={styles.howItWorksItem}>• Sacred Geometry: Ancient patterns for modern harmony</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001122',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    borderRadius: 12,
    padding: 15,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 20,
  },
  calculateButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 30,
    elevation: 5,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  calculating: {
    opacity: 0.7,
  },
  calculateButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultContainer: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 255, 0.3)',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  harmonyScore: {
    fontSize: 48,
    fontWeight: 'bold',
    marginVertical: 15,
  },
  phiContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  phiText: {
    fontSize: 16,
    color: '#FFD700',
    marginVertical: 5,
    fontFamily: 'monospace',
  },
  recommendationsContainer: {
    alignSelf: 'stretch',
    marginTop: 20,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  recommendationItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 15,
    marginVertical: 8,
  },
  recommendationText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  shareButton: {
    backgroundColor: 'rgba(0, 255, 255, 0.3)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 20,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  explanationContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
  },
  explanationText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    textAlign: 'center',
  },
  howItWorksContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
  },
  howItWorksTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 15,
  },
  howItWorksItem: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 8,
  },
})

export default HarmonyCalculatorScreen