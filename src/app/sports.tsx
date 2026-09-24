import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isAuthenticated, setAuthenticated } from './auth-state';

type EventKind = 'Torneo' | 'Partido';

type Court = {
  id: string;
  name: string;
  sport: string;
  location: string;
  surface: string;
  dimensions: string;
  lighting: string;
  capacity: string;
  amenities: string;
};

type SportEvent = {
  id: number;
  kind: EventKind;
  name: string;
  sport: string;
  venue: string;
  date: string;
  time: string;
  format: string;
  teams?: string;
  description: string;
  isRegistered?: boolean;
  createdBy: 'admin';
};

const sportsList = ['Todos', 'Fútbol', 'Rugby', 'Tenis', 'Pádel', 'Básquet'];
const sportsOptions = ['Fútbol', 'Rugby', 'Tenis', 'Pádel', 'Básquet'];
const courts: Court[] = [
  { id: 'futbol-1', name: 'Fútbol 11 Norte', sport: 'Fútbol', location: 'Predio Norte', surface: 'Césped sintético FIFA', dimensions: '105 x 68 m', lighting: '8 torres LED', capacity: '300 personas', amenities: 'Vestuario, duchas y estacionamiento' },
  { id: 'futbol-2', name: 'Fútbol 5 Central', sport: 'Fútbol', location: 'Complejo Central', surface: 'Césped sintético premium', dimensions: '40 x 20 m', lighting: 'Iluminación LED', capacity: '80 personas', amenities: 'Quincho, vestuario y buffet' },
  { id: 'futbol-3', name: 'Fútbol 5 Sur', sport: 'Fútbol', location: 'Predio Sur', surface: 'Caucho deportivo', dimensions: '40 x 20 m', lighting: 'Iluminación LED', capacity: '60 personas', amenities: 'Vestuario y parrillas' },
  { id: 'rugby-1', name: 'Rugby Arena', sport: 'Rugby', location: 'Predio Sur', surface: 'Césped natural', dimensions: '100 x 70 m', lighting: '6 torres LED', capacity: '500 personas', amenities: 'Tribuna, vestuarios y tercer tiempo' },
  { id: 'rugby-2', name: 'Rugby Training', sport: 'Rugby', location: 'Campo Oeste', surface: 'Césped natural', dimensions: '70 x 50 m', lighting: 'Iluminación perimetral', capacity: '120 personas', amenities: 'Vestuarios y zona de calentamiento' },
  { id: 'padel-1', name: 'Pádel Panorámica 1', sport: 'Pádel', location: 'Nave Indoor', surface: 'Césped artificial Mondo', dimensions: '20 x 10 m', lighting: 'Focos LED sin sombras', capacity: '30 personas', amenities: 'Cristal panorámico y marcador' },
  { id: 'padel-2', name: 'Pádel Panorámica 2', sport: 'Pádel', location: 'Nave Indoor', surface: 'Césped artificial Mondo', dimensions: '20 x 10 m', lighting: 'Focos LED sin sombras', capacity: '30 personas', amenities: 'Cristal panorámico y bancos' },
  { id: 'padel-3', name: 'Pádel Outdoor', sport: 'Pádel', location: 'Terraza Este', surface: 'Césped artificial', dimensions: '20 x 10 m', lighting: 'Iluminación LED', capacity: '24 personas', amenities: 'Zona de descanso y paletero' },
  { id: 'tenis-1', name: 'Tenis Central', sport: 'Tenis', location: 'Complejo Central', surface: 'Polvo de ladrillo', dimensions: '23.77 x 10.97 m', lighting: 'Torres LED', capacity: '80 personas', amenities: 'Gradas, vestuario y juez de silla' },
  { id: 'tenis-2', name: 'Tenis Rápida', sport: 'Tenis', location: 'Nave Indoor', surface: 'Cemento acrílico', dimensions: '23.77 x 10.97 m', lighting: 'Iluminación indoor', capacity: '50 personas', amenities: 'Aire acondicionado y marcador' },
  { id: 'tenis-3', name: 'Tenis Sur', sport: 'Tenis', location: 'Predio Sur', surface: 'Polvo de ladrillo', dimensions: '23.77 x 10.97 m', lighting: 'Iluminación LED', capacity: '50 personas', amenities: 'Bancos y bebedero' },
  { id: 'basquet-1', name: 'Básquet Techada', sport: 'Básquet', location: 'Pabellón Norte', surface: 'Parquet deportivo', dimensions: '28 x 15 m', lighting: 'Iluminación indoor', capacity: '250 personas', amenities: 'Gradas, vestuarios y tablero electrónico' },
  { id: 'basquet-2', name: 'Básquet 3x3', sport: 'Básquet', location: 'Pista Urbana', surface: 'Caucho deportivo', dimensions: '15 x 11 m', lighting: 'Torres LED', capacity: '100 personas', amenities: 'Gradas y zona de hidratación' },
];
const venues = courts.map((court) => court.name);
const times = ['18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
const formats = ['Amistoso', 'Liga', 'Eliminación directa', 'Fase de grupos'];

const initialEvents: SportEvent[] = [
  {
    id: 1,
    kind: 'Torneo',
    name: 'CLUTCH MASTERS',
    sport: 'Fútbol',
    venue: 'Fútbol 5 Central',
    date: '18 de octubre de 2026',
    time: '18:00',
    format: 'Eliminación directa',
    description: 'Torneo relámpago Fútbol 5 competitivo con premios.',
    isRegistered: true,
    createdBy: 'admin',
  },
  {
    id: 2,
    kind: 'Torneo',
    name: 'LA GRIETA INVOCADA',
    sport: 'Rugby',
    venue: 'Rugby Arena',
    date: '20 de octubre de 2026',
    time: '19:00',
    format: 'Fase de grupos',
    description: 'Torneo de Seven con tercer tiempo e inscripciones abiertas.',
    isRegistered: true,
    createdBy: 'admin',
  },
  {
    id: 3,
    kind: 'Torneo',
    name: 'BOOSTED CUP',
    sport: 'Tenis',
    venue: 'Tenis Central',
    date: '22 de octubre de 2026',
    time: '20:00',
    format: 'Eliminación directa',
    description: 'Singles masculino y femenino categoría A y B.',
    isRegistered: false,
    createdBy: 'admin',
  },
  {
    id: 4,
    kind: 'Torneo',
    name: 'CAMPEONATO DIGITAL',
    sport: 'Pádel',
    venue: 'Pádel Panorámica 1',
    date: '25 de octubre de 2026',
    time: '20:00',
    format: 'Fase de grupos',
    description: 'Parejas de pádel en cancha sintética con iluminación LED.',
    isRegistered: true,
    createdBy: 'admin',
  },
  {
    id: 5,
    kind: 'Partido',
    name: 'FRAG FEST',
    sport: 'Fútbol',
    venue: 'Fútbol 11 Norte',
    date: '18 de octubre de 2026',
    time: '20:00',
    format: 'Amistoso',
    teams: 'Los Magos vs San Martín',
    description: 'Partido nocturno Fútbol 11 amistoso.',
    isRegistered: false,
    createdBy: 'admin',
  },
  {
    id: 6,
    kind: 'Torneo',
    name: 'BATALLA CAMPAL',
    sport: 'Básquet',
    venue: 'Básquet Techada',
    date: '28 de octubre de 2026',
    time: '21:00',
    format: 'Liga',
    description: 'Torneo 3x3 urbano cancha cubierta.',
    isRegistered: false,
    createdBy: 'admin',
  },
];

export default function SportsScreen() {
  const router = useRouter();

  // Estados principales
  const [events, setEvents] = useState<SportEvent[]>(initialEvents);
  const [selectedSport, setSelectedSport] = useState('Todos');

  // Estado del modal de creación
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [kind, setKind] = useState<EventKind>('Torneo');
  const [name, setName] = useState('');
  const [sport, setSport] = useState(sportsOptions[0]);
  const [venue, setVenue] = useState(venues[0]);
  const [date, setDate] = useState('18 de octubre de 2026');
  const [time, setTime] = useState(times[0]);
  const [format, setFormat] = useState(formats[0]);
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [description, setDescription] = useState('');
  const [editingEventId, setEditingEventId] = useState<number | null>(null);

  // Estado para la modal de coincidencia de fecha/cancha
  const [coincidingEvent, setCoincidingEvent] = useState<SportEvent | null>(null);

  if (!isAuthenticated()) {
    return <Redirect href="/login" />;
  }

  // Torneos inscriptos para la barra lateral
  const registeredEvents = events.filter((e) => e.isRegistered);

  // Filtrado de eventos por deporte
  const filteredEvents =
    selectedSport === 'Todos'
      ? events
      : events.filter((e) => e.sport.toLowerCase() === selectedSport.toLowerCase());

  const visibleCourts = sport ? courts.filter((court) => court.sport === sport) : courts;
  const catalogCourts = selectedSport === 'Todos'
    ? courts
    : courts.filter((court) => court.sport === selectedSport);

  function openCreator(nextKind: EventKind) {
    setEditingEventId(null);
    setKind(nextKind);
    setName('');
    setSport(sportsOptions[0]);
    setVenue(venues[0]);
    setDate('18 de octubre de 2026');
    setTime(times[0]);
    setFormat(nextKind === 'Torneo' ? 'Eliminación directa' : 'Amistoso');
    setTeamA('');
    setTeamB('');
    setDescription('');
    setIsCreatorOpen(true);
  }

  function openEditor(event: SportEvent) {
    setEditingEventId(event.id);
    setKind(event.kind);
    setName(event.name);
    setSport(event.sport);
    setVenue(event.venue);
    setDate(event.date);
    setTime(event.time);
    setFormat(event.format);
    const teams = event.teams?.split(' vs ') ?? ['', ''];
    setTeamA(teams[0]);
    setTeamB(teams[1] ?? '');
    setDescription(event.description);
    setIsCreatorOpen(true);
  }

  function handleCreateEvent() {
    if (!name.trim()) {
      Alert.alert('Falta un nombre', `Asigna un nombre al ${kind.toLowerCase()}.`);
      return;
    }
    if (kind === 'Partido' && (!teamA.trim() || !teamB.trim())) {
      Alert.alert('Faltan equipos', 'Indica los dos equipos que jugarán el partido.');
      return;
    }

    // Comprobación de coincidencia por fecha, hora y cancha
    const match = events.find(
      (e) =>
        e.id !== editingEventId &&
        e.date.trim().toLowerCase() === date.trim().toLowerCase() &&
        e.time === time &&
        e.venue === venue
    );

    if (match) {
      setCoincidingEvent(match);
      return;
    }

    saveEvent();
  }

  function saveEvent() {
    const newEvent: SportEvent = {
      id: Date.now(),
      kind,
      name: name.trim(),
      sport,
      venue,
      date: date.trim(),
      time,
      format,
      teams: kind === 'Partido' ? `${teamA.trim()} vs ${teamB.trim()}` : undefined,
      description: description.trim() || `Competencia de ${sport} (${format}).`,
      isRegistered: true,
      createdBy: 'admin',
    };

    setEvents((prev) => editingEventId === null
      ? [newEvent, ...prev]
      : prev.map((event) => event.id === editingEventId ? { ...newEvent, id: editingEventId, isRegistered: event.isRegistered } : event));
    setIsCreatorOpen(false);
    setCoincidingEvent(null);
    setEditingEventId(null);
  }

  function deleteEvent(event: SportEvent) {
    Alert.alert('Eliminar torneo', `¿Querés eliminar ${event.name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => setEvents((prev) => prev.filter((item) => item.id !== event.id)),
      },
    ]);
  }

  function toggleRegister(id: number) {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isRegistered: !e.isRegistered } : e))
    );
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

          {/* HEADER SUPERIOR */}
          <View style={styles.headerNav}>
            <View style={styles.logoRow}>
              <View style={styles.logoBadge}>
                <Text style={styles.logoIcon}>◆</Text>
              </View>
              <View>
                <Text style={styles.logoTitle}>NEXUS</Text>
                <Text style={styles.logoSub}>TOURNAMENTS</Text>
              </View>
            </View>

            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>

            <Pressable accessibilityRole="button" onPress={() => router.replace('/')} style={styles.userAvatar}>
              <Text style={styles.avatarText}>👤</Text>
            </Pressable>
          </View>

          {/* CONTENIDO PRINCIPAL: SIDEBAR + PANEL CENTRAL */}
          <View style={styles.mainContent}>

            {/* PANELS LATERAL IZQUIERDO */}
            <View style={styles.sidebar}>

              {/* Tarjeta de Perfil */}
              <View style={styles.profileCard}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarCircleText}>👤</Text>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileLink}>👥 mi tournaments</Text>
                  <Text style={styles.profileSubLink}>⚙ ver perfil ∨</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setAuthenticated(false);
                    router.replace('/login');
                  }}
                  style={({ pressed }) => [styles.logoutBtn, pressed && styles.pressed]}
                >
                  <Text style={styles.logoutBtnText}>Cerrar Sesión</Text>
                </Pressable>
              </View>

              {/* Lista "Los torneos inscriptos" */}
              <View style={styles.enrolledCard}>
                <Text style={styles.enrolledTitle}>los torneos inscriptos</Text>
                {registeredEvents.length === 0 ? (
                  <Text style={styles.noEnrolledText}>No estás inscripto en ningún torneo aún.</Text>
                ) : (
                  registeredEvents.map((item) => (
                    <View key={item.id} style={styles.enrolledItem}>
                      <Text style={styles.enrolledIcon}>📅</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.enrolledItemName} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={styles.enrolledItemSub} numberOfLines={1}>
                          {item.sport} - {item.venue}
                        </Text>
                      </View>
                      <View style={styles.statusDotActive} />
                    </View>
                  ))
                )}
              </View>
            </View>

            {/* PANEL PRINCIPAL DERECHO */}
            <View style={styles.centerPanel}>

              {/* Encabezado + Botón de Crear Torneo */}
              <View style={styles.topBar}>
                <Text style={styles.sectionTitle}>TORNEOS DISPONIBLES</Text>
                <View style={styles.createBtnGroup}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => openCreator('Torneo')}
                    style={({ pressed }) => [styles.createMainBtn, pressed && styles.pressed]}
                  >
                    <Text style={styles.createMainBtnText}>+ CREAR TORNEO</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => openCreator('Partido')}
                    style={({ pressed }) => [styles.createSecondaryBtn, pressed && styles.pressed]}
                  >
                    <Text style={styles.createSecondaryBtnText}>+ PARTIDO</Text>
                  </Pressable>
                </View>
              </View>

              {/* BARRA DE SELECCIÓN DE DEPORTES */}
              <View style={styles.sportsFilterRow}>
                <Text style={styles.filterLabel}>Filtrar deporte:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                  {sportsList.map((sp) => {
                    const isSelected = selectedSport === sp;
                    return (
                      <Pressable
                        key={sp}
                        accessibilityRole="button"
                        onPress={() => setSelectedSport(sp)}
                        style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                      >
                        <Text style={[styles.filterChipText, isSelected && styles.filterChipTextSelected]}>
                          {sp}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={styles.courtsSection}>
                <View style={styles.courtsSectionHeader}>
                  <View>
                    <Text style={styles.courtsEyebrow}>INSTALACIONES DISPONIBLES</Text>
                    <Text style={styles.courtsTitle}>Canchas y predios</Text>
                  </View>
                  <Text style={styles.courtsCount}>{catalogCourts.length} espacios</Text>
                </View>
                <View style={styles.courtsGrid}>
                  {catalogCourts.map((court) => (
                    <View key={court.id} style={styles.courtCard}>
                      <View style={styles.courtCardTop}>
                        <Text style={styles.courtSport}>{court.sport.toUpperCase()}</Text>
                        <View style={styles.litBadge}><View style={styles.litDot} /><Text style={styles.litText}>NOCTURNA</Text></View>
                      </View>
                      <Text style={styles.courtName}>{court.name}</Text>
                      <Text style={styles.courtLocation}>⌖ {court.location}</Text>
                      <View style={styles.courtDetails}>
                        <Text style={styles.courtDetail}>Superficie: {court.surface}</Text>
                        <Text style={styles.courtDetail}>Medidas: {court.dimensions}</Text>
                        <Text style={styles.courtDetail}>Capacidad: {court.capacity}</Text>
                        <Text style={styles.courtDetail}>Servicios: {court.amenities}</Text>
                      </View>
                      <Text style={styles.courtLighting}>◷ {court.lighting}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* REJILLA / GRID DE TORNEOS DISPONIBLES */}
              {filteredEvents.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>🔍</Text>
                  <Text style={styles.emptyTitle}>No hay torneos de {selectedSport}</Text>
                  <Text style={styles.emptySub}>¿No te convence ninguno? Podés crear el tuyo arriba.</Text>
                </View>
              ) : (
                <View style={styles.gridContainer}>
                  {filteredEvents.map((evt, idx) => (
                    <View key={evt.id} style={styles.tournamentCard}>
                      <Text style={styles.cardHeaderNum}>
                        {idx + 1}. {evt.sport}
                      </Text>
                      <Text style={styles.cardTitle}>{evt.name}</Text>
                      <Text style={styles.cardDescription} numberOfLines={2}>
                        {evt.description}
                      </Text>
                      <Text style={styles.cardMeta} numberOfLines={1}>📍 {evt.venue}</Text>
                      <Text style={styles.cardMeta} numberOfLines={1}>◷ {evt.date} · {evt.time} hs</Text>

                      <View style={styles.cardFooter}>
                        <View style={styles.cardIconsRow}>
                          <Text style={styles.miniIcon}>🏆</Text>
                          <Text style={styles.miniIcon}>⚽</Text>
                        </View>
                        {evt.createdBy === 'admin' && (
                          <View style={styles.adminActions}>
                            <Pressable accessibilityLabel={`Editar ${evt.name}`} onPress={() => openEditor(evt)} style={styles.adminActionButton}>
                              <Text style={styles.editActionText}>Editar</Text>
                            </Pressable>
                            <Pressable accessibilityLabel={`Eliminar ${evt.name}`} onPress={() => deleteEvent(evt)} style={styles.adminActionButton}>
                              <Text style={styles.deleteActionText}>Eliminar</Text>
                            </Pressable>
                          </View>
                        )}
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => toggleRegister(evt.id)}
                          style={[
                            styles.joinBtn,
                            evt.isRegistered && styles.joinBtnActive,
                          ]}
                        >
                          <Text style={[styles.joinBtnText, evt.isRegistered && styles.joinBtnTextActive]}>
                            {evt.isRegistered ? 'Inscripto ✓' : 'Inscribirse'}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

          </View>
        </ScrollView>
      </SafeAreaView>

      {/* MODAL CREAR TORNEO / PARTIDO */}
      <Modal visible={isCreatorOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingEventId === null ? 'Crear nuevo' : 'Editar'} {kind.toLowerCase()}</Text>
              <Pressable accessibilityRole="button" onPress={() => setIsCreatorOpen(false)} style={styles.closeModalBtn}>
                <Text style={styles.closeModalText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 480 }}>
              <Text style={styles.inputLabel}>Nombre del {kind.toLowerCase()}</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={kind === 'Torneo' ? 'Ej. Copa NEXUS 2026' : 'Ej. Desafío Regional'}
                placeholderTextColor="#5C7285"
                style={styles.textInput}
              />

              <Text style={styles.inputLabel}>Deporte</Text>
              <View style={styles.optionsRow}>
                {sportsOptions.map((s) => (
                  <Pressable
                    key={s}
                    accessibilityRole="button"
                    onPress={() => {
                      setSport(s);
                      setVenue(courts.find((court) => court.sport === s)?.name ?? venues[0]);
                    }}
                    style={[styles.optionPill, sport === s && styles.optionPillActive]}
                  >
                    <Text style={[styles.optionPillText, sport === s && styles.optionPillTextActive]}>{s}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.inputLabel}>Cancha / Predio</Text>
              <View style={styles.optionsRow}>
                {visibleCourts.map((court) => (
                  <Pressable
                    key={court.id}
                    accessibilityRole="button"
                    onPress={() => setVenue(court.name)}
                    style={[styles.optionPill, venue === court.name && styles.optionPillActive]}
                  >
                    <Text style={[styles.optionPillText, venue === court.name && styles.optionPillTextActive]}>{court.name}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.inputLabel}>Fecha</Text>
              <TextInput
                value={date}
                onChangeText={setDate}
                placeholder="Día y fecha (ej. 18 de octubre de 2026)"
                placeholderTextColor="#5C7285"
                style={styles.textInput}
              />

              <Text style={styles.inputLabel}>Horario</Text>
              <View style={styles.optionsRow}>
                {times.map((t) => (
                  <Pressable
                    key={t}
                    accessibilityRole="button"
                    onPress={() => setTime(t)}
                    style={[styles.optionPill, time === t && styles.optionPillActive]}
                  >
                    <Text style={[styles.optionPillText, time === t && styles.optionPillTextActive]}>{t}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.inputLabel}>Formato</Text>
              <View style={styles.optionsRow}>
                {formats.map((f) => (
                  <Pressable
                    key={f}
                    accessibilityRole="button"
                    onPress={() => setFormat(f)}
                    style={[styles.optionPill, format === f && styles.optionPillActive]}
                  >
                    <Text style={[styles.optionPillText, format === f && styles.optionPillTextActive]}>{f}</Text>
                  </Pressable>
                ))}
              </View>

              {kind === 'Partido' && (
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.inputLabel}>Equipo Local</Text>
                  <TextInput
                    value={teamA}
                    onChangeText={setTeamA}
                    placeholder="Nombre del equipo A"
                    placeholderTextColor="#5C7285"
                    style={styles.textInput}
                  />
                  <Text style={styles.inputLabel}>Equipo Visitante</Text>
                  <TextInput
                    value={teamB}
                    onChangeText={setTeamB}
                    placeholder="Nombre del equipo B"
                    placeholderTextColor="#5C7285"
                    style={styles.textInput}
                  />
                </View>
              )}

              <Text style={styles.inputLabel}>Descripción breve</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Detalles sobre premios, reglas o nivel..."
                placeholderTextColor="#5C7285"
                style={[styles.textInput, { height: 60 }]}
                multiline
              />
            </ScrollView>

            <Pressable
              accessibilityRole="button"
              onPress={handleCreateEvent}
              style={({ pressed }) => [styles.submitModalBtn, pressed && styles.pressed]}
            >
              <Text style={styles.submitModalBtnText}>{editingEventId === null ? `Confirmar y Crear ${kind}` : 'Guardar cambios'}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* MODAL / ALERTA DE COINCIDENCIA DE HORARIO Y CANCHA */}
      <Modal visible={coincidingEvent !== null} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { borderColor: '#00F2FE' }]}>
            <Text style={styles.coincidenceIcon}>⚠️</Text>
            <Text style={styles.coincidenceTitle}>¡Coincidencia Detectada!</Text>
            <Text style={styles.coincidenceText}>
              Ya existe un evento programado para ese mismo día, horario y cancha:
            </Text>

            {coincidingEvent && (
              <View style={styles.coincidenceBox}>
                <Text style={styles.coincidenceBoxTitle}>{coincidingEvent.name}</Text>
                <Text style={styles.coincidenceBoxSub}>
                  {coincidingEvent.sport} | {coincidingEvent.venue} ({coincidingEvent.time} hs)
                </Text>
                <Text style={styles.coincidenceBoxDate}>{coincidingEvent.date}</Text>
              </View>
            )}

            <Text style={styles.coincidencePrompt}>
              ¿Qué te gustaría hacer?
            </Text>

            <View style={styles.coincidenceActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  if (coincidingEvent) {
                    toggleRegister(coincidingEvent.id);
                  }
                  setCoincidingEvent(null);
                  setIsCreatorOpen(false);
                }}
                style={({ pressed }) => [styles.coincidenceBtnJoin, pressed && styles.pressed]}
              >
                <Text style={styles.coincidenceBtnJoinText}>Unirme a este Torneo/Partido</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => setCoincidingEvent(null)}
                style={({ pressed }) => [styles.coincidenceBtnChange, pressed && styles.pressed]}
              >
                <Text style={styles.coincidenceBtnChangeText}>Cambiar Horario o Cancha</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => {
                    saveEvent();
                }}
                style={({ pressed }) => [styles.coincidenceBtnForce, pressed && styles.pressed]}
              >
                <Text style={styles.coincidenceBtnForceText}>Crear de todos modos</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#060B11' },
  safeArea: { flex: 1 },
  container: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 30 },

  // Header Nav
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    marginBottom: 20,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#00F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIcon: { color: '#060B11', fontWeight: '900', fontSize: 16 },
  logoTitle: { color: '#FFFFFF', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
  logoSub: { color: '#62829A', fontSize: 8, letterSpacing: 1.5, fontWeight: '700' },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 242, 254, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.3)',
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00F2FE' },
  liveText: { color: '#00F2FE', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#132132',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00F2FE',
  },
  avatarText: { fontSize: 16 },

  // Main Content Split
  mainContent: { flexDirection: 'row', gap: 18, flexWrap: 'wrap' },

  // Sidebar Left
  sidebar: { width: 260, gap: 16 },
  profileCard: {
    backgroundColor: '#0A131F',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.2)',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#182C40',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarCircleText: { fontSize: 24 },
  profileInfo: { alignItems: 'center', marginBottom: 12 },
  profileLink: { color: '#90A8BD', fontSize: 12, fontWeight: '700' },
  profileSubLink: { color: '#62829A', fontSize: 11, marginTop: 2 },
  logoutBtn: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#00F2FE',
    alignItems: 'center',
  },
  logoutBtnText: { color: '#060B11', fontWeight: '900', fontSize: 12 },

  enrolledCard: {
    backgroundColor: '#0A131F',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  enrolledTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', marginBottom: 12 },
  noEnrolledText: { color: '#62829A', fontSize: 11 },
  enrolledItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  enrolledIcon: { fontSize: 14 },
  enrolledItemName: { color: '#E1EBF5', fontWeight: '800', fontSize: 12 },
  enrolledItemSub: { color: '#62829A', fontSize: 10 },
  statusDotActive: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00FFA3' },

  // Center Panel
  centerPanel: { flex: 1, minWidth: 320 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 10,
  },
  sectionTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', letterSpacing: 0.5 },
  createBtnGroup: { flexDirection: 'row', gap: 8 },
  createMainBtn: {
    backgroundColor: '#00F2FE',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  createMainBtnText: { color: '#060B11', fontWeight: '900', fontSize: 12 },
  createSecondaryBtn: {
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
    borderWidth: 1,
    borderColor: '#00F2FE',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
  },
  createSecondaryBtnText: { color: '#00F2FE', fontWeight: '900', fontSize: 12 },

  // Sports Filter Row
  sportsFilterRow: { marginBottom: 18 },
  filterLabel: { color: '#62829A', fontSize: 11, fontWeight: '700', marginBottom: 6 },
  filterScroll: { gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#0E1C2B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  filterChipSelected: { backgroundColor: '#00F2FE', borderColor: '#00F2FE' },
  filterChipText: { color: '#88A3B8', fontSize: 12, fontWeight: '700' },
  filterChipTextSelected: { color: '#060B11', fontWeight: '900' },

  courtsSection: {
    marginBottom: 22,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#081522',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.16)',
  },
  courtsSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12, gap: 10 },
  courtsEyebrow: { color: '#00F2FE', fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  courtsTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', marginTop: 3 },
  courtsCount: { color: '#6F8FA5', fontSize: 11, fontWeight: '800' },
  courtsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  courtCard: { flexGrow: 1, flexBasis: 215, minWidth: 200, padding: 12, borderRadius: 10, backgroundColor: '#0D2030', borderWidth: 1, borderColor: 'rgba(139, 226, 245, 0.14)' },
  courtCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 6 },
  courtSport: { color: '#7FADBF', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  litBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  litDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#00FFA3' },
  litText: { color: '#76DDB8', fontSize: 8, fontWeight: '900' },
  courtName: { color: '#F4FBFF', fontSize: 15, fontWeight: '900', marginTop: 8 },
  courtLocation: { color: '#8EAABD', fontSize: 10, marginTop: 3 },
  courtDetails: { marginTop: 9, gap: 3 },
  courtDetail: { color: '#B6C9D5', fontSize: 10, lineHeight: 13 },
  courtLighting: { color: '#00D9DE', fontSize: 10, fontWeight: '800', marginTop: 9 },

  // Grid
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tournamentCard: {
    width: '31.5%',
    minWidth: 200,
    backgroundColor: '#09131F',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.15)',
    justifyContent: 'space-between',
  },
  cardHeaderNum: { color: '#62829A', fontSize: 10, fontWeight: '700', marginBottom: 4 },
  cardTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '900', marginBottom: 6 },
  cardDescription: { color: '#7E97AD', fontSize: 11, lineHeight: 15, marginBottom: 14 },
  cardMeta: { color: '#86A9BA', fontSize: 10, marginBottom: 3 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardIconsRow: { flexDirection: 'row', gap: 4 },
  miniIcon: { fontSize: 12 },
  adminActions: { flexDirection: 'row', gap: 5, flex: 1, justifyContent: 'flex-end' },
  adminActionButton: { paddingHorizontal: 5, paddingVertical: 4 },
  editActionText: { color: '#00F2FE', fontSize: 9, fontWeight: '900' },
  deleteActionText: { color: '#FF8297', fontSize: 9, fontWeight: '900' },
  joinBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#00F2FE',
  },
  joinBtnActive: { backgroundColor: 'rgba(0, 255, 163, 0.2)', borderWidth: 1, borderColor: '#00FFA3' },
  joinBtnText: { color: '#060B11', fontSize: 11, fontWeight: '900' },
  joinBtnTextActive: { color: '#00FFA3' },

  emptyContainer: {
    backgroundColor: '#09131F',
    borderRadius: 14,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  emptyIcon: { fontSize: 32 },
  emptyTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', marginTop: 10 },
  emptySub: { color: '#62829A', fontSize: 12, marginTop: 4 },

  // Modales
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#0A1422',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.3)',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  closeModalBtn: { padding: 4 },
  closeModalText: { color: '#62829A', fontSize: 18, fontWeight: '900' },
  inputLabel: { color: '#88A3B8', fontSize: 11, fontWeight: '800', marginTop: 10, marginBottom: 4 },
  textInput: {
    backgroundColor: '#050B12',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    fontSize: 13,
  },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  optionPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#112234',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  optionPillActive: { backgroundColor: '#00F2FE', borderColor: '#00F2FE' },
  optionPillText: { color: '#88A3B8', fontSize: 10, fontWeight: '700' },
  optionPillTextActive: { color: '#060B11', fontWeight: '900' },
  submitModalBtn: {
    backgroundColor: '#00F2FE',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  submitModalBtnText: { color: '#060B11', fontWeight: '900', fontSize: 13 },

  // Modal de Coincidencia
  coincidenceIcon: { fontSize: 36, textAlign: 'center' },
  coincidenceTitle: { color: '#00F2FE', fontSize: 20, fontWeight: '900', textAlign: 'center', marginTop: 8 },
  coincidenceText: { color: '#C0D5E6', fontSize: 13, textAlign: 'center', marginTop: 6 },
  coincidenceBox: {
    backgroundColor: '#0F1E30',
    padding: 12,
    borderRadius: 10,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#00F2FE',
  },
  coincidenceBoxTitle: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },
  coincidenceBoxSub: { color: '#00F2FE', fontSize: 12, marginTop: 2 },
  coincidenceBoxDate: { color: '#62829A', fontSize: 11, marginTop: 2 },
  coincidencePrompt: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', textAlign: 'center', marginBottom: 10 },
  coincidenceActions: { gap: 8 },
  coincidenceBtnJoin: { backgroundColor: '#00F2FE', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  coincidenceBtnJoinText: { color: '#060B11', fontWeight: '900', fontSize: 12 },
  coincidenceBtnChange: { backgroundColor: '#182C40', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  coincidenceBtnChangeText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  coincidenceBtnForce: { paddingVertical: 8, alignItems: 'center' },
  coincidenceBtnForceText: { color: '#62829A', fontSize: 11, textDecorationLine: 'underline' },

  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});
