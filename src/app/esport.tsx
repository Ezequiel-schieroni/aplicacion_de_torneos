import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isAuthenticated, setAuthenticated } from './auth-state';
import { getTournaments, removeTournament, Tournament } from './esport/tournament-state';

export default function EsportsScreen() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState(getTournaments);
  const [joined, setJoined] = useState<string[]>([]);

  if (!isAuthenticated()) {
    return <Redirect href="/login" />;
  }

  function toggleJoin(name: string) {
    setJoined((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]);
  }

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={[styles.orb, styles.orbTop]} />
      <View pointerEvents="none" style={[styles.orb, styles.orbBottom]} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.page}>
          <View style={styles.header}>
            <Pressable accessibilityRole="button" onPress={() => router.replace('/')} style={({ pressed }) => [styles.brandRow, pressed && styles.pressed]}>
              <View style={styles.brandMark}><View style={styles.markShape} /><Text style={styles.markSlash}>/</Text></View>
              <View><Text style={styles.brandName}>NEXUS</Text><Text style={styles.brandCaption}>TOURNAMENTS</Text></View>
            </Pressable>
            <View style={styles.liveBadge}><View style={styles.liveDot} /><Text style={styles.liveText}>LIVE</Text></View>
          </View>

          <View style={styles.layout}>
            <View style={styles.sidebar}>
              <View style={styles.profileCard}>
                <View style={styles.largeAvatar}><View style={styles.largeHair} /><View style={styles.largeFace} /><View style={styles.largeShoulders} /></View>
                <View style={styles.profileCopy}><Text style={styles.profileLine}>♙  mi tournaments</Text><Text style={styles.profileLine}>♧  ver perfil⌄</Text></View>
                <Pressable onPress={() => { setAuthenticated(false); router.replace('/login'); }} style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}><Text style={styles.logoutText}>Cerrar Sesión</Text></Pressable>
              </View>
              <View style={styles.registeredPanel}>
                <Text style={styles.registeredTitle}>los torneos inscriptos</Text>
                {joined.length === 0 ? (
                  <Text style={styles.emptyRegistered}>Todavía no estás inscripto.</Text>
                ) : (
                  joined.map((name) => (
                    <View key={name} style={styles.registeredRow}>
                      <Text style={styles.registeredIcon}>▣</Text>
                      <View style={styles.registeredCopy}><Text numberOfLines={1} style={styles.registeredName}>{name}</Text><Text style={styles.registeredCaption}>Inscripción activa</Text></View>
                      <View style={[styles.status, styles.statusOn]}><View style={styles.statusDot} /></View>
                    </View>
                  ))
                )}
              </View>
            </View>

              <View style={[styles.mainContent, { paddingHorizontal: 12, paddingTop: 4, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(147, 222, 245, 0.32)', backgroundColor: 'rgba(7, 24, 39, 0.52)', shadowColor: '#123E50', shadowOpacity: 0.28, shadowRadius: 18, shadowOffset: { width: 0, height: 7 }, elevation: 5 }]}>
              <View style={styles.contentTop}>
                <View><Pressable onPress={() => router.replace('/')} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}><Text style={styles.backArrow}>←</Text><Text style={styles.backText}>Volver</Text></Pressable><Text style={styles.heading}>TORNEOS DISPONIBLES</Text></View>
                <Pressable onPress={() => router.push('/esport/create-tournament')} style={({ pressed }) => [styles.createButton, pressed && styles.pressed]}><Text style={styles.createPlus}>＋</Text><Text style={styles.createText}>CREAR TORNEO</Text></Pressable>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.grid}>
                {tournaments.map((tournament) => {
                  const isJoined = joined.includes(tournament.name);
                  return <TournamentCard key={tournament.id} {...tournament} isJoined={isJoined} onToggle={() => toggleJoin(tournament.name)} onEdit={() => router.push(`/esport/edit-tournament?id=${tournament.id}`)} onDelete={() => { removeTournament(tournament.id); setTournaments((current) => current.filter((item) => item.id !== tournament.id)); setJoined((current) => current.filter((item) => item !== tournament.name)); }} />;
                })}
              </ScrollView>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function TournamentCard({ id, game, name, description, colors, ownerId, isJoined, onToggle, onEdit, onDelete }: Tournament & { isJoined: boolean; onToggle: () => void; onEdit: () => void; onDelete: () => void }) {
  const isOwner = ownerId === 'local-user';

  return (
    <View style={[styles.tournamentCard, isOwner && styles.ownerCard]}>
      <Text style={styles.gameLabel}>{game}</Text>
      <Text numberOfLines={1} style={styles.tournamentName}>{name}</Text>
      <Text numberOfLines={2} style={styles.description}>{description}</Text>
      {isOwner && <View style={{ flexDirection: 'row', gap: 6, marginTop: 5, minHeight: 22 }}><Pressable onPress={onEdit} style={({ pressed }) => [{ paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5, backgroundColor: 'rgba(123, 239, 255, 0.12)' }, pressed && styles.pressed]}><Text style={{ color: '#83F2FF', fontSize: 10, fontWeight: '800' }}>Editar</Text></Pressable><Pressable onPress={onDelete} style={({ pressed }) => [{ paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5, backgroundColor: 'rgba(255, 110, 130, 0.12)' }, pressed && styles.pressed]}><Text style={{ color: '#FF8B9D', fontSize: 10, fontWeight: '800' }}>Eliminar</Text></Pressable></View>}
      <View style={[styles.cardFooter, isOwner && styles.ownerFooter]}>
        <View style={styles.gameMarks}><View style={[styles.markOne, { backgroundColor: colors[0] }]} /><View style={[styles.markTwo, { backgroundColor: colors[1] }]} /><View style={[styles.markThree, { backgroundColor: colors[0] }]} /></View>
        <Pressable onPress={onToggle} style={({ pressed }) => [styles.joinButton, isJoined && styles.joinedButton, pressed && styles.pressed]}><Text style={styles.joinText}>{isJoined ? 'Inscripto' : 'Inscribirse'}</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050B14', overflow: 'hidden' }, safeArea: { flex: 1 }, page: { flex: 1, width: '100%', maxWidth: 1220, alignSelf: 'center', paddingHorizontal: 32, paddingTop: 8 },
  orb: { position: 'absolute', borderRadius: 999 }, orbTop: { width: 390, height: 390, right: -120, top: -145, backgroundColor: '#07586A', opacity: 0.85 }, orbBottom: { width: 280, height: 280, left: -210, bottom: -55, backgroundColor: '#321679', opacity: 0.85 },
  header: { height: 49, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: 'relative' }, brandRow: { position: 'absolute', left: 0, flexDirection: 'row', alignItems: 'center', gap: 9 }, brandMark: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#C8F8FF', borderWidth: 1, borderColor: '#F0FFFF', shadowColor: '#55E8FF', shadowOpacity: 0.65, shadowRadius: 14 }, markShape: { position: 'absolute', width: 18, height: 18, borderRadius: 4, backgroundColor: '#102A43', transform: [{ rotate: '45deg' }] }, markSlash: { color: '#DBFCFF', fontSize: 25, lineHeight: 27, fontWeight: '200' }, brandName: { color: '#F5FBFF', fontSize: 16, fontWeight: '900', letterSpacing: 2.5 }, brandCaption: { color: '#78EDFF', fontSize: 6, fontWeight: '900', letterSpacing: 1.8 }, liveBadge: { height: 25, borderRadius: 16, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(12, 47, 61, 0.7)', borderWidth: 1, borderColor: 'rgba(126, 245, 255, 0.3)' }, liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#70F6BF' }, liveText: { color: '#B8FEEE', fontSize: 8, fontWeight: '900', letterSpacing: 1 }, headerAvatar: { position: 'absolute', right: 0, width: 38, height: 38, borderRadius: 20, overflow: 'visible', backgroundColor: '#A6D3E7', borderWidth: 2, borderColor: 'rgba(230, 251, 255, 0.8)' }, headerChevron: { position: 'absolute', right: -18, top: 6, color: '#D3F8FF', fontSize: 15 }, avatarHair: { position: 'absolute', top: 4, left: 8, width: 19, height: 14, borderRadius: 10, backgroundColor: '#41546C', zIndex: 2 }, avatarFace: { position: 'absolute', top: 8, left: 11, width: 15, height: 17, borderRadius: 9, backgroundColor: '#F2C5A8', zIndex: 3 }, avatarShoulders: { position: 'absolute', bottom: -7, left: 2, width: 31, height: 21, borderRadius: 18, backgroundColor: '#506D89', zIndex: 1 },
  layout: { flex: 1, flexDirection: 'row', gap: 38, paddingTop: 4, paddingBottom: 12 }, sidebar: { width: 258, gap: 15 }, profileCard: { minHeight: 127, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(147, 222, 245, 0.3)', backgroundColor: 'rgba(12, 32, 49, 0.85)', padding: 12, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 }, largeAvatar: { width: 62, height: 62, borderRadius: 32, overflow: 'hidden', backgroundColor: '#A6D3E7', borderWidth: 1, borderColor: '#C7F6FF' }, largeHair: { position: 'absolute', top: 8, left: 14, width: 32, height: 24, borderRadius: 18, backgroundColor: '#41546C', zIndex: 2 }, largeFace: { position: 'absolute', top: 13, left: 20, width: 25, height: 28, borderRadius: 14, backgroundColor: '#F2C5A8', zIndex: 3 }, largeShoulders: { position: 'absolute', bottom: -12, left: 4, width: 54, height: 34, borderRadius: 28, backgroundColor: '#506D89', zIndex: 1 }, profileCopy: { flex: 1, minWidth: 135 }, profileLine: { color: '#DCEBF3', fontSize: 11, marginBottom: 5 }, logoutButton: { width: '100%', height: 30, borderRadius: 18, backgroundColor: '#1DE9DF', alignItems: 'center', justifyContent: 'center', shadowColor: '#24F4EF', shadowOpacity: 0.65, shadowRadius: 12 }, logoutText: { color: '#05223B', fontSize: 13, fontWeight: '900' }, registeredPanel: { flex: 1, minHeight: 260, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(147, 222, 245, 0.3)', backgroundColor: 'rgba(9, 28, 45, 0.82)', paddingHorizontal: 13, paddingTop: 12 }, registeredTitle: { color: '#F0F7FF', fontSize: 19, marginBottom: 9 }, emptyRegistered: { color: '#93A9B9', fontSize: 12, paddingVertical: 12 }, registeredRow: { minHeight: 48, borderBottomWidth: 1, borderBottomColor: 'rgba(158, 224, 242, 0.18)', flexDirection: 'row', alignItems: 'center', gap: 9 }, registeredIcon: { width: 22, color: '#B6D0E1', fontSize: 17, textAlign: 'center' }, registeredCopy: { flex: 1 }, registeredName: { color: '#F3F8FD', fontSize: 12, fontWeight: '900' }, registeredCaption: { color: '#93A9B9', fontSize: 9, marginTop: 2 }, status: { width: 25, height: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, statusOn: { backgroundColor: 'rgba(82, 229, 203, 0.35)' }, statusOff: { backgroundColor: 'rgba(220, 80, 96, 0.35)' }, statusDot: { width: 6, height: 6, borderRadius: 4, backgroundColor: '#6CE7C5' },
  mainContent: { flex: 1, minWidth: 0 }, contentTop: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }, backButton: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 }, backArrow: { color: '#7BEFFF', fontSize: 18 }, backText: { color: '#8EC5D6', fontSize: 12, fontWeight: '800' }, heading: { color: '#F4FAFF', fontSize: 27, fontWeight: '300', letterSpacing: 0.2 }, createButton: { height: 31, borderRadius: 18, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#18E9E0', shadowColor: '#20F4E8', shadowOpacity: 0.8, shadowRadius: 13 }, createPlus: { color: '#04223A', fontSize: 19, lineHeight: 20 }, createText: { color: '#04223A', fontSize: 12, fontWeight: '900' }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingTop: 5, paddingBottom: 20 }, tournamentCard: { width: '31.8%', minWidth: 205, height: 109, padding: 10, borderRadius: 11, borderWidth: 1, borderColor: 'rgba(144, 222, 244, 0.32)', backgroundColor: 'rgba(12, 33, 49, 0.86)', shadowColor: '#153F52', shadowOpacity: 0.32, shadowRadius: 13, shadowOffset: { width: 0, height: 5 }, elevation: 4 }, gameLabel: { color: '#D8E7F1', fontSize: 11 }, tournamentName: { color: '#F5FAFF', fontSize: 15, fontWeight: '900', marginTop: 1 }, description: { color: '#E4EFF5', fontSize: 11, lineHeight: 13, maxWidth: 225, marginTop: 1 }, cardFooter: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 7 }, gameMarks: { flexDirection: 'row', alignItems: 'center', gap: 3, maxWidth: 82 }, markOne: { width: 12, height: 17, transform: [{ rotate: '35deg' }], borderRadius: 2 }, markTwo: { width: 13, height: 13, borderRadius: 8, opacity: 0.85 }, markThree: { width: 14, height: 10, transform: [{ skewX: '-20deg' }] }, joinButton: { minWidth: 79, height: 26, paddingHorizontal: 9, borderRadius: 15, backgroundColor: '#13E5D7', alignItems: 'center', justifyContent: 'center', shadowColor: '#20F4E8', shadowOpacity: 0.6, shadowRadius: 10 }, joinedButton: { backgroundColor: '#63AAB0' }, joinText: { color: '#04223A', fontSize: 11, fontWeight: '900' }, pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
  ownerCard: { height: 135 },
  ownerFooter: { flex: 0, minHeight: 30, marginTop: 7, alignItems: 'center' },
});
