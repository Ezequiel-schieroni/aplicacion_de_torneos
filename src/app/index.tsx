import { Link, Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isAuthenticated, setAuthenticated } from './auth-state';

export default function Index() {
  const router = useRouter();
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);

  if (!isAuthenticated()) {
    return <Redirect href="/login" />;
  }

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={[styles.orb, styles.purpleOrb]} />
      <View pointerEvents="none" style={[styles.orb, styles.cyanOrb]} />
      <View pointerEvents="none" style={[styles.line, styles.lineOne]} />
      <View pointerEvents="none" style={[styles.line, styles.lineTwo]} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <View style={styles.brandMark}>
                <View style={styles.markShape} />
                <Text style={styles.markSlash}>/</Text>
              </View>
              <View>
                <Text style={styles.brandName}>NEXUS</Text>
                <Text style={styles.brandCaption}>TOURNAMENTS</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
              <View style={styles.profileArea}>
                <Pressable
                  accessibilityLabel="Abrir menú de perfil"
                  accessibilityRole="button"
                  onPress={() => setProfileMenuVisible((visible) => !visible)}
                  style={({ pressed }) => [styles.profileButton, pressed && styles.profilePressed]}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarHead}>●</Text>
                    <Text style={styles.avatarBody}>▰</Text>
                  </View>
                  <Text style={styles.profileChevron}>{profileMenuVisible ? '⌃' : '⌄'}</Text>
                </Pressable>
                {profileMenuVisible && (
                  <View style={styles.profileMenu}>
                    <Pressable style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}>
                      <Text style={styles.menuIcon}>♙</Text>
                      <Text style={styles.menuText}>Mi Perfil</Text>
                    </Pressable>
                    <Pressable style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}>
                      <Text style={styles.menuIcon}>⚙</Text>
                      <Text style={styles.menuText}>Configuración</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setAuthenticated(false);
                        setProfileMenuVisible(false);
                        router.replace('/login');
                      }}
                      style={({ pressed }) => [styles.menuItem, styles.logoutItem, pressed && styles.menuItemPressed]}
                    >
                      <Text style={styles.menuIcon}>↪</Text>
                      <Text style={styles.menuText}>Cerrar Sesión</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          </View>

          <Text style={styles.title}>Elegí tu entorno</Text>

          <View style={styles.options}>
            <EnvironmentCard href="/explore" icon="SPORTS" title="TORNEO DE" accent="DEPORTES" />
            <EnvironmentCard href="/explore" icon="ESPORTS" title="TORNEO DE" accent="ESPORTS" />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function EnvironmentCard({ href, icon, title, accent }: { href: '/explore'; icon: 'SPORTS' | 'ESPORTS'; title: string; accent: string }) {
  return (
    <Link href={href} asChild>
      <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
        <View style={styles.cardInner}>
          <View style={styles.iconArea}>
            <Text style={styles.iconPrimary}>{icon === 'SPORTS' ? '⚽' : '⌁'}</Text>
            <Text style={styles.iconSecondary}>{icon === 'SPORTS' ? '◌' : '✦'}</Text>
          </View>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardAccent}>{accent}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050B14', overflow: 'hidden' },
  safeArea: { flex: 1 },
  content: { flex: 1, width: '100%', maxWidth: 1120, alignSelf: 'center', paddingHorizontal: 28, paddingTop: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandMark: { width: 43, height: 43, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: '#C8F8FF', borderWidth: 1, borderColor: '#F0FFFF', shadowColor: '#55E8FF', shadowOpacity: 0.65, shadowRadius: 18, elevation: 8 },
  markShape: { position: 'absolute', width: 22, height: 22, borderRadius: 5, backgroundColor: '#102A43', transform: [{ rotate: '45deg' }] },
  markSlash: { color: '#DBFCFF', fontSize: 31, lineHeight: 33, fontWeight: '200' },
  brandName: { color: '#F5FBFF', fontSize: 21, fontWeight: '900', letterSpacing: 3.2 },
  brandCaption: { color: '#78EDFF', fontSize: 8, fontWeight: '900', letterSpacing: 2.4, marginTop: 1 },
  liveBadge: { height: 32, borderRadius: 18, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: 'rgba(12, 47, 61, 0.7)', borderWidth: 1, borderColor: 'rgba(126, 245, 255, 0.3)' },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#70F6BF', shadowColor: '#70F6BF', shadowOpacity: 1, shadowRadius: 7 },
  liveText: { color: '#B8FEEE', fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  profileArea: { position: 'relative', zIndex: 10 },
  profileButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4, paddingLeft: 4 },
  profilePressed: { opacity: 0.72 },
  avatar: { width: 43, height: 43, borderRadius: 22, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: '#A6D3E7', borderWidth: 2, borderColor: 'rgba(230, 251, 255, 0.8)', shadowColor: '#62DDF4', shadowOpacity: 0.45, shadowRadius: 12, elevation: 6 },
  avatarHead: { color: '#F1F8FF', fontSize: 17, lineHeight: 17, marginTop: -5 },
  avatarBody: { color: '#54758C', fontSize: 25, lineHeight: 22, marginTop: -1 },
  profileChevron: { color: '#D3F8FF', fontSize: 20, lineHeight: 20, width: 13, textAlign: 'center' },
  profileMenu: { position: 'absolute', top: 53, right: 0, width: 228, overflow: 'hidden', borderRadius: 7, borderWidth: 1, borderColor: 'rgba(155, 225, 248, 0.35)', backgroundColor: 'rgba(10, 32, 51, 0.97)', shadowColor: '#000000', shadowOpacity: 0.4, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 12 },
  menuItem: { minHeight: 51, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(164, 226, 245, 0.18)' },
  menuItemPressed: { backgroundColor: 'rgba(92, 184, 222, 0.22)' },
  logoutItem: { borderBottomWidth: 0 },
  menuIcon: { width: 22, color: '#D8F5FF', fontSize: 23, textAlign: 'center' },
  menuText: { color: '#D8E6F0', fontSize: 18, fontWeight: '500' },
  title: { marginTop: 54, color: '#F6FBFF', textAlign: 'center', fontSize: 58, lineHeight: 66, fontWeight: '300', letterSpacing: -1.2 },
  options: { flexDirection: 'row', justifyContent: 'center', gap: 64, marginTop: 42 },
  card: { width: 348, height: 330, padding: 11, borderRadius: 39, borderWidth: 1, borderColor: 'rgba(123, 221, 255, 0.34)', backgroundColor: 'rgba(10, 29, 45, 0.5)', shadowColor: '#1C6379', shadowOpacity: 0.24, shadowRadius: 25, shadowOffset: { width: 0, height: 12 }, elevation: 8 },
  cardInner: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 29, borderWidth: 1, borderColor: 'rgba(156, 231, 255, 0.35)', backgroundColor: 'rgba(16, 35, 52, 0.76)' },
  iconArea: { height: 132, width: 170, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 4, marginBottom: 5 },
  iconPrimary: { color: '#A1C6DD', fontSize: 77, textShadowColor: '#8FD7F3', textShadowRadius: 18 },
  iconSecondary: { color: '#91B9D2', fontSize: 48, marginTop: 48, marginLeft: -17, textShadowColor: '#8FD7F3', textShadowRadius: 15 },
  cardTitle: { color: '#F4FAFF', fontSize: 32, lineHeight: 36, fontStyle: 'italic', fontWeight: '300', letterSpacing: -0.5 },
  cardAccent: { color: '#F4FAFF', fontSize: 36, lineHeight: 39, fontStyle: 'italic', fontWeight: '900', letterSpacing: -0.5 },
  cardPressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  orb: { position: 'absolute', borderRadius: 999 },
  purpleOrb: { width: 350, height: 350, left: -210, bottom: 65, backgroundColor: '#321679', opacity: 0.9 },
  cyanOrb: { width: 390, height: 390, right: -145, top: -96, backgroundColor: '#07586A', opacity: 0.88 },
  line: { position: 'absolute', width: 850, height: 1, backgroundColor: 'rgba(126, 225, 255, 0.1)', transform: [{ rotate: '-35deg' }] },
  lineOne: { left: -285, top: 130 },
  lineTwo: { left: -90, top: 360 },
});
