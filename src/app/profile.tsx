import { Redirect, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getCurrentUser, isAuthenticated } from './auth-state';
import { getRegisteredTournamentIds, getTournaments } from './esport/tournament-state';

export default function ProfileScreen() {
  const router = useRouter();
  const user = getCurrentUser();
  const tournaments = getTournaments();
  const registeredIds = getRegisteredTournamentIds();
  const registered = tournaments.filter((tournament) => registeredIds.includes(tournament.id));
  const created = tournaments.filter((tournament) => tournament.ownerId === user?.id);

  if (!isAuthenticated() || !user) {
    return <Redirect href="/login" />;
  }

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={styles.glow} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.page}>
          <Pressable onPress={() => router.replace('/')} style={({ pressed }) => [styles.back, pressed && styles.pressed]}><Text style={styles.backArrow}>←</Text><Text style={styles.backText}>Volver al inicio</Text></Pressable>
          <View style={styles.header}><View style={styles.avatar}><View style={styles.hair} /><View style={styles.face} /><View style={styles.shoulders} /></View><View><Text style={styles.eyebrow}>PERFIL DE COMPETIDOR</Text><Text style={styles.username}>{user.username}</Text><Text style={styles.email}>{user.email}</Text></View></View>
          <View style={styles.section}><Text style={styles.sectionTitle}>Torneos inscriptos</Text>{registered.length === 0 ? <Text style={styles.empty}>Todavía no estás inscripto en ningún torneo.</Text> : registered.map((tournament) => <TournamentRow key={tournament.id} title={tournament.name} game={tournament.game} />)}</View>
          <View style={styles.section}><Text style={styles.sectionTitle}>Torneos creados por vos</Text>{created.length === 0 ? <Text style={styles.empty}>Todavía no creaste ningún torneo.</Text> : created.map((tournament) => <TournamentRow key={tournament.id} title={tournament.name} game={tournament.game} />)}</View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function TournamentRow({ title, game }: { title: string; game: string }) {
  return <View style={styles.row}><View style={styles.rowMark} /><View><Text style={styles.rowTitle}>{title}</Text><Text style={styles.rowGame}>{game}</Text></View></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050B14' }, safeArea: { flex: 1 }, page: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 28, gap: 18 }, glow: { position: 'absolute', width: 430, height: 430, right: -170, top: -170, borderRadius: 230, backgroundColor: '#07586A', opacity: 0.72 }, back: { flexDirection: 'row', alignItems: 'center', gap: 7 }, backArrow: { color: '#7BEFFF', fontSize: 20 }, backText: { color: '#9AC9D8', fontSize: 13, fontWeight: '800' }, header: { flexDirection: 'row', alignItems: 'center', gap: 18, paddingVertical: 20 }, avatar: { width: 86, height: 86, borderRadius: 44, overflow: 'hidden', backgroundColor: '#A6D3E7', borderWidth: 2, borderColor: '#D2FAFF' }, hair: { position: 'absolute', top: 9, left: 21, width: 43, height: 31, borderRadius: 22, backgroundColor: '#41546C', zIndex: 2 }, face: { position: 'absolute', top: 16, left: 28, width: 33, height: 38, borderRadius: 18, backgroundColor: '#F2C5A8', zIndex: 3 }, shoulders: { position: 'absolute', bottom: -17, left: 7, width: 72, height: 47, borderRadius: 35, backgroundColor: '#506D89' }, eyebrow: { color: '#78EDFF', fontSize: 10, fontWeight: '900', letterSpacing: 1.6 }, username: { color: '#F4FAFF', fontSize: 32, fontWeight: '800', marginTop: 4 }, email: { color: '#8FA9B9', fontSize: 13, marginTop: 4 }, section: { borderRadius: 12, borderWidth: 1, borderColor: 'rgba(147, 222, 245, 0.32)', backgroundColor: 'rgba(7, 24, 39, 0.78)', padding: 18, gap: 10 }, sectionTitle: { color: '#F0F7FF', fontSize: 20, fontWeight: '700', marginBottom: 4 }, empty: { color: '#8FA9B9', fontSize: 13, paddingVertical: 8 }, row: { minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 1, borderTopColor: 'rgba(158, 224, 242, 0.16)' }, rowMark: { width: 10, height: 26, borderRadius: 4, backgroundColor: '#19E8DB' }, rowTitle: { color: '#F3F8FD', fontSize: 14, fontWeight: '900' }, rowGame: { color: '#8FA9B9', fontSize: 11, marginTop: 3 }, pressed: { opacity: 0.75 },
});
