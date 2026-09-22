import { Redirect, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isAuthenticated } from './auth-state';

type Tournament = {
  name: string;
  sport: string;
  date: string;
  venue: string;
  format: string;
};

const initialTournament: Tournament = {
  name: 'Copa NEXUS Apertura',
  sport: 'Futbol 5',
  date: '18 de octubre de 2026',
  venue: 'Complejo Arena Norte',
  format: 'Eliminacion directa',
};

export default function SportsTournamentScreen() {
  const router = useRouter();
  const [tournament, setTournament] = useState(initialTournament);
  const [teams, setTeams] = useState(['Los Halcones', 'Club Central', 'Deportivo Sur', 'La Banda FC']);
  const [newTeam, setNewTeam] = useState('');
  const [editing, setEditing] = useState(false);

  const progress = useMemo(() => Math.min(100, Math.round((teams.length / 8) * 100)), [teams.length]);

  if (!isAuthenticated()) {
    return <Redirect href="/login" />;
  }

  function updateTournament(field: keyof Tournament, value: string) {
    setTournament((current) => ({ ...current, [field]: value }));
  }

  function addTeam() {
    const name = newTeam.trim();
    if (!name) {
      Alert.alert('Nombre requerido', 'Escribe el nombre del equipo para agregarlo.');
      return;
    }
    if (teams.some((team) => team.toLowerCase() === name.toLowerCase())) {
      Alert.alert('Equipo repetido', 'Ese equipo ya esta anotado en el torneo.');
      return;
    }
    setTeams((current) => [...current, name]);
    setNewTeam('');
  }

  function removeTeam(team: string) {
    Alert.alert('Quitar equipo', `Quieres quitar a ${team}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Quitar', style: 'destructive', onPress: () => setTeams((current) => current.filter((item) => item !== team)) },
    ]);
  }

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={[styles.orb, styles.orbTop]} />
      <View pointerEvents="none" style={[styles.orb, styles.orbBottom]} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.topRow}>
            <Pressable accessibilityRole="button" onPress={() => router.replace('/')} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
              <Text style={styles.backText}>Volver</Text>
            </Pressable>
            <View style={styles.sportChip}><Text style={styles.sportChipText}>DEPORTES</Text></View>
          </View>

          <View style={styles.heading}>
            <Text style={styles.eyebrow}>PANEL DEL ORGANIZADOR</Text>
            <Text style={styles.title}>{tournament.name}</Text>
            <Text style={styles.subtitle}>Configura el torneo, administra los equipos y prepara la competencia.</Text>
          </View>

          <View style={styles.statsRow}>
            <Stat value={String(teams.length)} label="equipos" />
            <View style={styles.statDivider} />
            <Stat value={tournament.format === 'Liga' ? 'Liga' : 'Llaves'} label="formato" />
            <View style={styles.statDivider} />
            <Stat value={`${progress}%`} label="cupo completo" />
          </View>

          <View style={styles.sectionHeader}>
            <View><Text style={styles.sectionTitle}>Informacion del torneo</Text><Text style={styles.sectionCaption}>Edita los datos que veran los participantes.</Text></View>
            <Pressable accessibilityRole="button" onPress={() => setEditing((current) => !current)} style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}>
              <Text style={styles.editButtonText}>{editing ? 'Listo' : 'Editar'}</Text>
            </Pressable>
          </View>

          <View style={styles.detailsCard}>
            <EditableField label="Nombre" value={tournament.name} editable={editing} onChangeText={(value) => updateTournament('name', value)} />
            <EditableField label="Deporte" value={tournament.sport} editable={editing} onChangeText={(value) => updateTournament('sport', value)} />
            <EditableField label="Fecha" value={tournament.date} editable={editing} onChangeText={(value) => updateTournament('date', value)} />
            <EditableField label="Sede" value={tournament.venue} editable={editing} onChangeText={(value) => updateTournament('venue', value)} />
            <EditableField label="Formato" value={tournament.format} editable={editing} onChangeText={(value) => updateTournament('format', value)} last />
          </View>

          <View style={styles.sectionHeader}>
            <View><Text style={styles.sectionTitle}>Equipos inscritos</Text><Text style={styles.sectionCaption}>{teams.length} de 8 lugares ocupados.</Text></View>
          </View>

          <View style={styles.addTeamRow}>
            <TextInput value={newTeam} onChangeText={setNewTeam} placeholder="Nombre del equipo" placeholderTextColor="#71869A" style={styles.teamInput} returnKeyType="done" onSubmitEditing={addTeam} />
            <Pressable accessibilityRole="button" onPress={addTeam} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}><Text style={styles.addButtonText}>Agregar</Text></Pressable>
          </View>

          <View style={styles.teamList}>
            {teams.map((team, index) => (
              <View key={team} style={styles.teamRow}>
                <View style={styles.teamNumber}><Text style={styles.teamNumberText}>{String(index + 1).padStart(2, '0')}</Text></View>
                <Text style={styles.teamName}>{team}</Text>
                <Pressable accessibilityRole="button" accessibilityLabel={`Quitar ${team}`} onPress={() => removeTeam(team)} style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}><Text style={styles.removeText}>Quitar</Text></Pressable>
              </View>
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => Alert.alert('Torneo guardado', 'Los cambios se aplicaron a esta sesion. Conecta un backend para guardarlos permanentemente.')}
            style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}>
            <Text style={styles.saveButtonText}>Guardar cambios</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

function EditableField({ label, value, editable, onChangeText, last = false }: { label: string; value: string; editable: boolean; onChangeText: (value: string) => void; last?: boolean }) {
  return <View style={[styles.field, !last && styles.fieldBorder]}><Text style={styles.fieldLabel}>{label}</Text>{editable ? <TextInput value={value} onChangeText={onChangeText} style={styles.fieldInput} /> : <Text style={styles.fieldValue}>{value}</Text>}</View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#07120D', overflow: 'hidden' }, safeArea: { flex: 1 }, content: { width: '100%', maxWidth: 780, alignSelf: 'center', padding: 22, paddingBottom: 42 },
  orb: { position: 'absolute', borderRadius: 999, opacity: 0.38 }, orbTop: { width: 380, height: 380, backgroundColor: '#0B8153', top: -230, right: -130 }, orbBottom: { width: 330, height: 330, backgroundColor: '#155C8B', bottom: -200, left: -180 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, backButton: { paddingVertical: 9, paddingHorizontal: 13, borderRadius: 10, backgroundColor: 'rgba(213, 255, 231, 0.09)', borderWidth: 1, borderColor: 'rgba(186, 255, 213, 0.18)' }, backText: { color: '#D7FCE3', fontSize: 13, fontWeight: '800' }, sportChip: { borderRadius: 99, paddingHorizontal: 11, paddingVertical: 7, backgroundColor: '#B8FFCD' }, sportChipText: { color: '#09351E', fontSize: 10, fontWeight: '900', letterSpacing: 1.25 },
  heading: { marginTop: 38, marginBottom: 24 }, eyebrow: { color: '#82F6B2', fontSize: 10, fontWeight: '900', letterSpacing: 2 }, title: { color: '#F2FFF6', fontSize: 34, lineHeight: 39, fontWeight: '900', letterSpacing: -1, marginTop: 9 }, subtitle: { color: '#A5BDAC', fontSize: 15, lineHeight: 22, marginTop: 10, maxWidth: 540 },
  statsRow: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', borderRadius: 15, paddingVertical: 12, paddingHorizontal: 15, backgroundColor: 'rgba(14, 47, 31, 0.72)', borderWidth: 1, borderColor: 'rgba(162, 255, 199, 0.16)', marginBottom: 31 }, stat: { minWidth: 72 }, statValue: { color: '#F0FFF5', fontWeight: '900', fontSize: 16 }, statLabel: { color: '#89A898', fontSize: 10, marginTop: 2 }, statDivider: { width: 1, height: 26, backgroundColor: 'rgba(194, 255, 216, 0.18)', marginHorizontal: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, sectionTitle: { color: '#F0FFF5', fontSize: 18, fontWeight: '900' }, sectionCaption: { color: '#89A898', fontSize: 12, marginTop: 3 }, editButton: { borderRadius: 10, paddingVertical: 9, paddingHorizontal: 14, backgroundColor: 'rgba(117, 255, 167, 0.15)', borderWidth: 1, borderColor: 'rgba(139, 255, 184, 0.28)' }, editButtonText: { color: '#9DFFC0', fontSize: 12, fontWeight: '900' },
  detailsCard: { borderRadius: 18, overflow: 'hidden', backgroundColor: 'rgba(13, 37, 25, 0.9)', borderWidth: 1, borderColor: 'rgba(169, 255, 203, 0.14)', marginBottom: 32 }, field: { minHeight: 62, paddingHorizontal: 16, paddingVertical: 11, justifyContent: 'center' }, fieldBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(174, 255, 205, 0.1)' }, fieldLabel: { color: '#86A596', fontSize: 10, fontWeight: '900', letterSpacing: 0.9, textTransform: 'uppercase' }, fieldValue: { color: '#E6F8EC', fontSize: 15, marginTop: 4, fontWeight: '700' }, fieldInput: { color: '#E6F8EC', fontSize: 15, marginTop: 2, paddingVertical: 0, fontWeight: '700' },
  addTeamRow: { flexDirection: 'row', gap: 9, marginBottom: 13 }, teamInput: { flex: 1, height: 49, borderRadius: 12, paddingHorizontal: 14, color: '#EFFEF4', fontSize: 14, backgroundColor: 'rgba(5, 24, 14, 0.88)', borderWidth: 1, borderColor: 'rgba(174, 255, 205, 0.2)' }, addButton: { height: 49, borderRadius: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#B8FFCD' }, addButtonText: { color: '#09351E', fontSize: 13, fontWeight: '900' },
  teamList: { gap: 8 }, teamRow: { minHeight: 59, borderRadius: 14, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(13, 37, 25, 0.82)', borderWidth: 1, borderColor: 'rgba(169, 255, 203, 0.12)' }, teamNumber: { height: 30, width: 30, borderRadius: 9, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(125, 255, 174, 0.12)' }, teamNumberText: { color: '#98F9B8', fontSize: 10, fontWeight: '900' }, teamName: { color: '#E8FAEE', flex: 1, fontSize: 15, fontWeight: '800', marginLeft: 11 }, removeButton: { paddingVertical: 7, paddingHorizontal: 8 }, removeText: { color: '#F2A4A4', fontSize: 12, fontWeight: '800' },
  saveButton: { height: 54, marginTop: 27, borderRadius: 14, backgroundColor: '#60E999', justifyContent: 'center', alignItems: 'center', shadowColor: '#49DD86', shadowOpacity: 0.24, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 5 }, saveButtonText: { color: '#042612', fontSize: 15, fontWeight: '900' }, pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
});
