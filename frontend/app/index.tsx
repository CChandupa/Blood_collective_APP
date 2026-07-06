import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../components/Button';
import { Colors, Fonts } from '../constants/theme';
import { Heart, Users, Activity, Search } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function LandingPage() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroSection}>
        <View style={styles.heroTextContainer}>
          <Text style={styles.title}>Save a Life Today.</Text>
          <Text style={styles.subtitle}>
            Join Sri Lanka's largest blood donation network. Connect with donors in your area and help those in critical need.
          </Text>
          
          <View style={styles.actionButtons}>
            <Button 
              title="I Need Blood" 
              onPress={() => router.push('/request')} 
              variant="primary"
              size="large"
              style={styles.actionButton}
            />
            <Button 
              title="Register as Donor" 
              onPress={() => router.push('/auth/register')} 
              variant="outline"
              size="large"
              style={styles.actionButton}
            />
          </View>
        </View>

        {/* We can use an animated blood drop or a beautiful illustration here */}
        <View style={styles.heroImageContainer}>
          <View style={styles.bloodDropShape}>
             <Heart color="#FFF" size={80} fill={Colors.primary} strokeWidth={1} />
          </View>
        </View>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Users color={Colors.primary} size={32} />
          <Text style={styles.statNumber}>10,000+</Text>
          <Text style={styles.statLabel}>Registered Donors</Text>
        </View>
        <View style={styles.statCard}>
          <Activity color={Colors.primary} size={32} />
          <Text style={styles.statNumber}>25</Text>
          <Text style={styles.statLabel}>Districts Covered</Text>
        </View>
        <View style={styles.statCard}>
          <Heart color={Colors.primary} size={32} />
          <Text style={styles.statNumber}>5,000+</Text>
          <Text style={styles.statLabel}>Lives Saved</Text>
        </View>
      </View>

      <View style={styles.howItWorksSection}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        
        <View style={styles.stepsContainer}>
          <View style={styles.step}>
            <View style={styles.stepIcon}>
              <Search color={Colors.primary} size={24} />
            </View>
            <Text style={styles.stepTitle}>1. Request</Text>
            <Text style={styles.stepDesc}>Submit a request for the required blood type in your district.</Text>
          </View>
          
          <View style={styles.step}>
            <View style={styles.stepIcon}>
              <Activity color={Colors.primary} size={24} />
            </View>
            <Text style={styles.stepTitle}>2. Match</Text>
            <Text style={styles.stepDesc}>Our system instantly notifies nearby registered donors with matching blood types.</Text>
          </View>
          
          <View style={styles.step}>
            <View style={styles.stepIcon}>
              <Heart color={Colors.primary} size={24} />
            </View>
            <Text style={styles.stepTitle}>3. Connect</Text>
            <Text style={styles.stepDesc}>Donors accept the request and head to the hospital to save a life.</Text>
          </View>
        </View>
        
        <View style={{ marginTop: 40, alignItems: 'center' }}>
          <Button 
            title="Search Donors Directory" 
            onPress={() => router.push('/search')} 
            variant="secondary"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 60,
  },
  heroSection: {
    flexDirection: width > 768 ? 'row' : 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 40,
    minHeight: 500,
    backgroundColor: Colors.surface,
  },
  heroTextContainer: {
    flex: 1,
    paddingRight: width > 768 ? 40 : 0,
    marginBottom: width > 768 ? 0 : 40,
    alignItems: width > 768 ? 'flex-start' : 'center',
  },
  title: {
    fontSize: width > 768 ? 64 : 48,
    fontFamily: Fonts.bold,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 16,
    textAlign: width > 768 ? 'left' : 'center',
  },
  subtitle: {
    fontSize: 18,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginBottom: 32,
    lineHeight: 28,
    textAlign: width > 768 ? 'left' : 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    justifyContent: width > 768 ? 'flex-start' : 'center',
  },
  actionButton: {
    minWidth: 160,
  },
  heroImageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bloodDropShape: {
    width: 250,
    height: 250,
    backgroundColor: Colors.primaryDark + '80',
    borderRadius: 125,
    borderBottomLeftRadius: 20, // To make it look a bit like a drop
    transform: [{ rotate: '-45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  statsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 24,
    padding: 40,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
  },
  statCard: {
    backgroundColor: Colors.surfaceElevated,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    width: 200,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: {
    fontSize: 32,
    fontFamily: Fonts.bold,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  howItWorksSection: {
    padding: 40,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 32,
    fontFamily: Fonts.bold,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 40,
  },
  stepsContainer: {
    flexDirection: width > 768 ? 'row' : 'column',
    justifyContent: 'center',
    gap: 40,
    width: '100%',
    maxWidth: 1200,
  },
  step: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  stepDesc: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
