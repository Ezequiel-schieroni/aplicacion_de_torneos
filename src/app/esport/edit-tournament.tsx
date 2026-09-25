import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isAuthenticated } from '../auth-state';
import { getTournaments, updateTournament } from './tournament-state';

export default function EditTournamentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tournament = getTournaments().find((item) => item.id === id && item.ownerId === 'local-user');
  const [name, setName] = useState(tournament?.name ?? '');
  const [description, setDescription] = useState(tournament?.description ?? '');

  if (!isAuthenticated()) {
    return <Redirect href="/login" />;
  }

  if (!tournament) {
    return <Redirect href="/esport" />;
  }

  const editableTournament = tournament;

  function saveChanges() {
    updateTournament(editableTournament.id, { game: editableTournament.game, name: name.trim() || editableTournament.name, description: description.trim() || editableTournament.description });
    router.replace('/esport');
  }

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={styles.glow} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.page}>
          <View style={styles.header}><Text style={styles.brand}>NEXUS <Text style={styles.caption}>TOURNAMENTS</Text></Text><View style={styles.live}><View style={styles.dot} /><Text style={styles.liveText}>LIVE</Text></View></View>
          <View style={styles.panel}>
            <Pressable onPress={() => router.replace('/esport')} style={({ pressed }) => [styles.back, pressed && styles.pressed]}><Text style={styles.backArrow}>←</Text><Text style={styles.backText}>Volver a torneos</Text></Pressable>
            <Text style={styles.heading}>EDITAR TORNEO</Text>
            <Text style={styles.subtitle}>Solo el creador puede modificar esta competencia.</Text>
            <Text style={styles.label}>TÍTULO DEL TORNEO</Text>
            <TextInput value={name} onChangeText={setName} style={styles.input} placeholderTextColor="#708A99" />
            <Text style={styles.label}>DESCRIPCIÓN</Text>
            <TextInput value={description} onChangeText={setDescription} multiline style={[styles.input, styles.description]} placeholderTextColor="#708A99" />
            <Text style={styles.game}>JUEGO: {editableTournament.game}</Text>
            <View style={styles.actions}><Pressable onPress={() => router.replace('/esport')} style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}><Text style={styles.cancelText}>Cancelar</Text></Pressable><Pressable onPress={saveChanges} style={({ pressed }) => [styles.save, pressed && styles.pressed]}><Text style={styles.saveText}>Guardar cambios</Text></Pressable></View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050B14' }, safeArea: { flex: 1 }, page: { flex: 1, width: '100%', maxWidth: 820, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 10 }, glow: { position: 'absolute', width: 380, height: 380, right: -150, top: -130, borderRadius: 220, backgroundColor: '#07586A', opacity: 0.75 }, header: { height: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, brand: { color: '#F5FBFF', fontSize: 18, fontWeight: '900', letterSpacing: 2 }, caption: { color: '#78EDFF', fontSize: 7, letterSpacing: 1 }, live: { height: 25, paddingHorizontal: 10, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(12, 47, 61, 0.75)', borderWidth: 1, borderColor: 'rgba(126, 245, 255, 0.3)' }, dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#70F6BF' }, liveText: { color: '#B8FEEE', fontSize: 8, fontWeight: '900' }, panel: { marginTop: 25, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(147, 222, 245, 0.34)', backgroundColor: 'rgba(7, 24, 39, 0.82)', padding: 24, gap: 10 }, back: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }, backArrow: { color: '#7BEFFF', fontSize: 19 }, backText: { color: '#8EC5D6', fontSize: 12, fontWeight: '800' }, heading: { color: '#F4FAFF', fontSize: 30, fontWeight: '300' }, subtitle: { color: '#8FA9B9', fontSize: 13, marginBottom: 12 }, label: { color: '#D9EEF6', fontSize: 11, fontWeight: '900', letterSpacing: 1 }, input: { minHeight: 48, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(145, 222, 244, 0.26)', backgroundColor: 'rgba(2, 13, 25, 0.5)', color: '#F3FBFF', paddingHorizontal: 13, fontSize: 14 }, description: { height: 100, paddingTop: 12, textAlignVertical: 'top' }, game: { color: '#78EDFF', fontSize: 12, fontWeight: '800', marginTop: 4 }, actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 12 }, cancel: { minHeight: 44, paddingHorizontal: 18, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(145, 222, 244, 0.28)', justifyContent: 'center' }, cancelText: { color: '#9BB4C2', fontWeight: '800' }, save: { minHeight: 44, paddingHorizontal: 18, borderRadius: 8, backgroundColor: '#19E8DB', justifyContent: 'center' }, saveText: { color: '#04223B', fontWeight: '900' }, pressed: { opacity: 0.76, transform: [{ scale: 0.985 }] },
});
