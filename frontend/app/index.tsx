import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../components/Button';
import { Colors, Fonts } from '../constants/theme';
import { useResponsive } from '../hooks/useResponsive';
import { Heart, Users, Activity, Search } from 'lucide-react-native';

export default function LandingPage() {
  const router = useRouter();
  const { isMobile, isTablet, isDesktop, responsive, fs, wp } = useResponsive();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero Section */}
      <View style={[
        styles.heroSection, 
        { 
          flexDirection: isDesktop ? 'row' : 'column',
          padding: responsive(20, 32, 48),
          minHeight: responsive(400, 450, 500),
        }
      ]}>
        <View style={[
          styles.heroTextContainer, 
          {
            paddingRight: isDesktop ? 40 : 0,
            marginBottom: isDesktop ? 0 : 32,
            alignItems: isDesktop ? 'flex-start' : 'center',
          }
        ]}>
          <Text style={[
            styles.title, 
            { 
              fontSize: fs(responsive(32, 48, 64)),
              textAlign: isDesktop ? 'left' : 'center',
            }
          ]}>
            Save a Life Today.
          </Text>
          <Text style={[
            styles.subtitle,
            {
              fontSize: fs(responsive(14, 16, 18)),
              textAlign: isDesktop ? 'left' : 'center',
            }
          ]}>
            Join Sri Lanka's largest blood donation network. Connect with donors in your area and help those in critical need.
          </Text>
          
          <View style={[
            styles.actionButtons,
            { justifyContent: isDesktop ? 'flex-start' : 'center' }
          ]}>
            <Button 
              title="I Need Blood" 
              onPress={() => router.push('/request')} 
              variant="primary"
              size={isMobile ? 'medium' : 'large'}
              style={[styles.actionButton, { minWidth: responsive(130, 150, 160) }]}
            />
            <Button 
              title="Register as Donor" 
              onPress={() => router.push('/auth/register')} 
              variant="outline"
              size={isMobile ? 'medium' : 'large'}
              style={[styles.actionButton, { minWidth: responsive(130, 150, 160) }]}
            />
          </View>
        </View>

        <View style={styles.heroImageContainer}>
          <View style={[
            styles.bloodDropShape,
            {
              width: responsive(150, 200, 250),
              height: responsive(150, 200, 250),
              borderRadius: responsive(75, 100, 125),
            }
          ]}>
            <Heart color="#FFF" size={responsive(48, 64, 80)} fill={Colors.primary} strokeWidth={1} />
          </View>
        </View>
      </View>

      {/* Stats Section */}
      <View style={[
        styles.statsSection,
        { padding: responsive(20, 32, 40) }
      ]}>
        {[
          { icon: <Users color={Colors.primary} size={responsive(24, 28, 32)} />, num: '10,000+', label: 'Registered Donors' },
          { icon: <Activity color={Colors.primary} size={responsive(24, 28, 32)} />, num: '25', label: 'Districts Covered' },
          { icon: <Heart color={Colors.primary} size={responsive(24, 28, 32)} />, num: '5,000+', label: 'Lives Saved' },
        ].map((stat, idx) => (
          <View key={idx} style={[
            styles.statCard,
            {
              width: responsive(140, 180, 200),
              padding: responsive(16, 20, 24),
            }
          ]}>
            {stat.icon}
            <Text style={[styles.statNumber, { fontSize: fs(responsive(22, 28, 32)) }]}>{stat.num}</Text>
            <Text style={[styles.statLabel, { fontSize: fs(responsive(11, 13, 14)) }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* How It Works */}
      <View style={[
        styles.howItWorksSection,
        { padding: responsive(20, 32, 40) }
      ]}>
        <Text style={[styles.sectionTitle, { fontSize: fs(responsive(24, 28, 32)) }]}>How It Works</Text>
        
        <View style={[
          styles.stepsContainer,
          { 
            flexDirection: isMobile ? 'column' : 'row',
            gap: responsive(20, 30, 40),
          }
        ]}>
          {[
            { icon: <Search color={Colors.primary} size={24} />, title: '1. Request', desc: 'Submit a request for the required blood type in your district.' },
            { icon: <Activity color={Colors.primary} size={24} />, title: '2. Match', desc: 'Our system instantly notifies nearby registered donors with matching blood types.' },
            { icon: <Heart color={Colors.primary} size={24} />, title: '3. Connect', desc: 'Donors accept the request and head to the hospital to save a life.' },
          ].map((step, idx) => (
            <View key={idx} style={[
              styles.step,
              { padding: responsive(20, 24, 32) }
            ]}>
              <View style={styles.stepIcon}>{step.icon}</View>
              <Text style={[styles.stepTitle, { fontSize: fs(responsive(16, 18, 20)) }]}>{step.title}</Text>
              <Text style={[styles.stepDesc, { fontSize: fs(responsive(12, 13, 14)) }]}>{step.desc}</Text>
            </View>
          ))}
        </View>
        
        <View style={{ marginTop: responsive(24, 32, 40), alignItems: 'center' }}>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
  },
  heroTextContainer: {
    flex: 1,
  },
  title: {
    fontFamily: Fonts.bold,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginBottom: 32,
    lineHeight: 28,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  actionButton: {},
  heroImageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bloodDropShape: {
    backgroundColor: Colors.primaryDark + '80',
    borderBottomLeftRadius: 20,
    transform: [{ rotate: '-45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
  },
  statsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
  },
  statCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: {
    fontFamily: Fonts.bold,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  howItWorksSection: {
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: Fonts.bold,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 32,
  },
  stepsContainer: {
    justifyContent: 'center',
    width: '100%',
    maxWidth: 1200,
  },
  step: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surface,
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
    fontFamily: Fonts.bold,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  stepDesc: {
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
