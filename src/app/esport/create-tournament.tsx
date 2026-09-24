import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isAuthenticated } from '../auth-state';
import { addTournament } from './tournament-state';

const defaultGameOptions = ['Valorant', 'League of Legends', 'Rocket League'];

export default function CreateTournamentScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [gameOptions, setGameOptions] = useState(defaultGameOptions);
  const [selectedGame, setSelectedGame] = useState('Valorant');
  const [newGameName, setNewGameName] = useState('');
  const [addGameVisible, setAddGameVisible] = useState(false);
  const [teams, setTeams] = useState(8);
  const [players, setPlayers] = useState(5);

  if (!isAuthenticated()) {
    return <Redirect href="/login" />;
  }

  function selectGame(game: string) {
    setSelectedGame(game);
  }

  function addGame() {
    const gameName = newGameName.trim();
    if (!gameName || gameOptions.includes(gameName)) {
      return;
    }
    setGameOptions((current) => [...current, gameName]);
    setSelectedGame(gameName);
    setNewGameName('');
    setAddGameVisible(false);
  }

  function adjustValue(setValue: (value: number) => void, value: number, amount: number, minimum: number) {
    setValue(Math.max(minimum, value + amount));
  }

  function createTournament() {
    const tournamentName = title.trim() || 'Nuevo torneo';
    addTournament({
      game: selectedGame,
      name: tournamentName,
      description: description.trim() || 'Torneo creado por la comunidad.',
      colors: ['#22E6D7', '#397A9B'],
    });
    router.replace('/esport');
  }

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={[styles.orb, styles.orbTop]} />
      <View pointerEvents="none" style={[styles.orb, styles.orbBottom]} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.page}>
          <View style={styles.header}>
            <Pressable onPress={() => router.replace('/esport')} style={({ pressed }) => [styles.brandRow, pressed && styles.pressed]}>
              <View style={styles.brandMark}><View style={styles.markShape} /><Text style={styles.markSlash}>/</Text></View>
              <View><Text style={styles.brandName}>NEXUS</Text><Text style={styles.brandCaption}>TOURNAMENTS</Text></View>
            </Pressable>
            <View style={styles.liveBadge}><View style={styles.liveDot} /><Text style={styles.liveText}>LIVE</Text></View>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.topLine}>
              <View>
                <Pressable onPress={() => router.replace('/esport')} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}><Text style={styles.backArrow}>←</Text><Text style={styles.backText}>Volver a torneos</Text></Pressable>
                <Text style={styles.heading}>CREAR TORNEO</Text>
                <Text style={styles.subtitle}>Configura la competencia y prepara la arena.</Text>
              </View>
              <Text style={styles.step}>01 / 01</Text>
            </View>

            <View style={styles.formPanel}>
              <FormField label="TÍTULO DEL TORNEO" hint="El nombre que verán los competidores.">
                <TextInput value={title} onChangeText={setTitle} placeholder="Ej. Nexus Winter Cup" placeholderTextColor="rgba(210, 230, 240, 0.35)" style={styles.input} />
              </FormField>

              <FormField label="DESCRIPCIÓN" hint="Cuenta brevemente de qué trata el torneo.">
                <TextInput value={description} onChangeText={setDescription} multiline numberOfLines={4} placeholder="Describe el formato, premios y reglas principales..." placeholderTextColor="rgba(210, 230, 240, 0.35)" style={[styles.input, styles.descriptionInput]} />
              </FormField>

              <View style={styles.sectionRow}>
                <FormField label="JUEGO" hint="Selecciona el juego del torneo.">
                  <View style={styles.gameSelector}>
                    {gameOptions.map((game) => {
                      const selected = selectedGame === game;
                      return <Pressable key={game} onPress={() => selectGame(game)} style={({ pressed }) => [styles.gameOption, selected && styles.gameOptionSelected, pressed && styles.pressed]}><Text style={[styles.gameOptionText, selected && styles.gameOptionTextSelected]}>{game}</Text>{selected && <Text style={styles.check}>✓</Text>}</Pressable>;
                    })}
                    {addGameVisible ? (
                      <View style={styles.addGameForm}>
                        <TextInput value={newGameName} onChangeText={setNewGameName} autoFocus placeholder="Nombre del juego" placeholderTextColor="rgba(210, 230, 240, 0.35)" style={styles.addGameInput} />
                        <View style={styles.addGameActions}><Pressable onPress={() => { setNewGameName(''); setAddGameVisible(false); }} style={({ pressed }) => [styles.smallCancel, pressed && styles.pressed]}><Text style={styles.smallCancelText}>Cancelar</Text></Pressable><Pressable onPress={addGame} style={({ pressed }) => [styles.smallAdd, pressed && styles.pressed]}><Text style={styles.smallAddText}>Agregar</Text></Pressable></View>
                      </View>
                    ) : (
                      <Pressable onPress={() => setAddGameVisible(true)} style={({ pressed }) => [styles.addGame, pressed && styles.pressed]}><Text style={styles.addGamePlus}>＋</Text><Text style={styles.addGameText}>Agregar juego</Text></Pressable>
                    )}
                  </View>
                </FormField>

                <FormField label="CANTIDAD DE EQUIPOS" hint="Total de equipos participantes.">
                  <Stepper value={teams} onChange={(amount) => adjustValue(setTeams, teams, amount, 2)} />
                </FormField>
              </View>

              <FormField label="JUGADORES POR EQUIPO" hint="Cantidad máxima por equipo.">
                <Stepper value={players} onChange={(amount) => adjustValue(setPlayers, players, amount, 1)} />
              </FormField>

              <View style={styles.notice}><Text style={styles.noticeIcon}>i</Text><Text style={styles.noticeText}>Podrás editar estos datos y administrar las inscripciones después de crear el torneo.</Text></View>
              <View style={styles.actions}><Pressable onPress={() => router.replace('/esport')} style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}><Text style={styles.cancelText}>Cancelar</Text></Pressable><Pressable onPress={createTournament} style={({ pressed }) => [styles.submitButton, pressed && styles.pressed]}><Text style={styles.submitText}>Crear torneo</Text><Text style={styles.submitArrow}>→</Text></Pressable></View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}

function FormField({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return <View style={styles.formField}><Text style={styles.fieldLabel}>{label}</Text><Text style={styles.fieldHint}>{hint}</Text>{children}</View>;
}

function Stepper({ value, onChange }: { value: number; onChange: (amount: number) => void }) {
  return <View style={styles.stepper}><Pressable onPress={() => onChange(-1)} style={({ pressed }) => [styles.stepperButton, pressed && styles.pressed]}><Text style={styles.stepperSymbol}>−</Text></Pressable><Text style={styles.stepperValue}>{value}</Text><Pressable onPress={() => onChange(1)} style={({ pressed }) => [styles.stepperButton, pressed && styles.pressed]}><Text style={styles.stepperSymbol}>＋</Text></Pressable></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050B14', overflow: 'hidden' }, safeArea: { flex: 1 }, page: { flex: 1, width: '100%', maxWidth: 1220, alignSelf: 'center', paddingHorizontal: 32, paddingTop: 8 },
  orb: { position: 'absolute', borderRadius: 999 }, orbTop: { width: 390, height: 390, right: -120, top: -145, backgroundColor: '#07586A', opacity: 0.8 }, orbBottom: { width: 280, height: 280, left: -210, bottom: -55, backgroundColor: '#321679', opacity: 0.8 },
  header: { height: 49, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: 'relative' }, brandRow: { position: 'absolute', left: 0, flexDirection: 'row', alignItems: 'center', gap: 9 }, brandMark: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#C8F8FF', borderWidth: 1, borderColor: '#F0FFFF', shadowColor: '#55E8FF', shadowOpacity: 0.65, shadowRadius: 14 }, markShape: { position: 'absolute', width: 18, height: 18, borderRadius: 4, backgroundColor: '#102A43', transform: [{ rotate: '45deg' }] }, markSlash: { color: '#DBFCFF', fontSize: 25, lineHeight: 27, fontWeight: '200' }, brandName: { color: '#F5FBFF', fontSize: 16, fontWeight: '900', letterSpacing: 2.5 }, brandCaption: { color: '#78EDFF', fontSize: 6, fontWeight: '900', letterSpacing: 1.8 }, liveBadge: { height: 25, borderRadius: 16, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(12, 47, 61, 0.7)', borderWidth: 1, borderColor: 'rgba(126, 245, 255, 0.3)' }, liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#70F6BF' }, liveText: { color: '#B8FEEE', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  content: { paddingTop: 18, paddingBottom: 35 }, topLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18 }, backButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 7 }, backArrow: { color: '#7BEFFF', fontSize: 19 }, backText: { color: '#8EC5D6', fontSize: 12, fontWeight: '800' }, heading: { color: '#F4FAFF', fontSize: 31, fontWeight: '300', letterSpacing: 0.3 }, subtitle: { color: '#8FA9B9', fontSize: 13, marginTop: 5 }, step: { color: 'rgba(123, 239, 255, 0.65)', fontSize: 13, fontWeight: '900', letterSpacing: 1 }, formPanel: { borderRadius: 13, borderWidth: 1, borderColor: 'rgba(147, 222, 245, 0.34)', backgroundColor: 'rgba(7, 24, 39, 0.8)', padding: 22, shadowColor: '#123E50', shadowOpacity: 0.34, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 5, gap: 18 }, formField: { flex: 1, minWidth: 0 }, fieldLabel: { color: '#D9EEF6', fontSize: 11, fontWeight: '900', letterSpacing: 1.1 }, fieldHint: { color: '#7894A5', fontSize: 11, marginTop: 4, marginBottom: 8 }, input: { minHeight: 49, borderRadius: 9, borderWidth: 1, borderColor: 'rgba(145, 222, 244, 0.26)', backgroundColor: 'rgba(2, 13, 25, 0.45)', color: '#F3FBFF', paddingHorizontal: 14, fontSize: 14 }, descriptionInput: { height: 94, paddingTop: 13, textAlignVertical: 'top' }, sectionRow: { flexDirection: 'row', gap: 18 }, gameSelector: { gap: 7 }, gameOption: { minHeight: 39, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(145, 222, 244, 0.2)', backgroundColor: 'rgba(2, 13, 25, 0.35)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, gameOptionSelected: { borderColor: '#27E7DE', backgroundColor: 'rgba(23, 224, 215, 0.13)' }, gameOptionText: { color: '#A7BFCC', fontSize: 13 }, gameOptionTextSelected: { color: '#DDFEFF', fontWeight: '800' }, check: { color: '#63FFF3', fontSize: 16, fontWeight: '900' }, addGame: { minHeight: 39, borderRadius: 8, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(123, 239, 255, 0.4)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }, addGameForm: { gap: 7 }, addGameInput: { height: 39, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(123, 239, 255, 0.4)', backgroundColor: 'rgba(2, 13, 25, 0.45)', color: '#F3FBFF', paddingHorizontal: 12, fontSize: 13 }, addGameActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 7 }, smallCancel: { minHeight: 30, paddingHorizontal: 10, justifyContent: 'center' }, smallCancelText: { color: '#8FA9B9', fontSize: 11, fontWeight: '800' }, smallAdd: { minHeight: 30, paddingHorizontal: 11, borderRadius: 7, backgroundColor: '#19E8DB', justifyContent: 'center' }, smallAddText: { color: '#04223B', fontSize: 11, fontWeight: '900' }, addGamePlus: { color: '#73F5FF', fontSize: 17 }, addGameText: { color: '#73F5FF', fontSize: 12, fontWeight: '800' }, stepper: { height: 49, borderRadius: 9, borderWidth: 1, borderColor: 'rgba(145, 222, 244, 0.26)', backgroundColor: 'rgba(2, 13, 25, 0.45)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 7 }, stepperButton: { width: 35, height: 35, borderRadius: 8, backgroundColor: 'rgba(73, 206, 225, 0.14)', alignItems: 'center', justifyContent: 'center' }, stepperSymbol: { color: '#8BF6FF', fontSize: 22, lineHeight: 24 }, stepperValue: { color: '#F3FBFF', fontSize: 17, fontWeight: '900' }, notice: { minHeight: 42, borderRadius: 8, backgroundColor: 'rgba(44, 136, 154, 0.13)', borderWidth: 1, borderColor: 'rgba(86, 220, 235, 0.17)', padding: 10, flexDirection: 'row', alignItems: 'center', gap: 9 }, noticeIcon: { width: 18, height: 18, borderRadius: 10, textAlign: 'center', color: '#72F4FF', borderWidth: 1, borderColor: '#72F4FF', fontSize: 12, lineHeight: 16 }, noticeText: { flex: 1, color: '#8EAEBB', fontSize: 11, lineHeight: 15 }, actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 1 }, cancelButton: { height: 44, paddingHorizontal: 18, borderRadius: 9, borderWidth: 1, borderColor: 'rgba(145, 222, 244, 0.28)', alignItems: 'center', justifyContent: 'center' }, cancelText: { color: '#9BB4C2', fontSize: 13, fontWeight: '800' }, submitButton: { height: 44, minWidth: 145, paddingHorizontal: 15, borderRadius: 9, backgroundColor: '#19E8DB', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14, shadowColor: '#20F4E8', shadowOpacity: 0.75, shadowRadius: 15 }, submitText: { color: '#04223B', fontSize: 13, fontWeight: '900' }, submitArrow: { color: '#04223B', fontSize: 20, fontWeight: '900' }, pressed: { opacity: 0.76, transform: [{ scale: 0.985 }] },
});
