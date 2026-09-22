import { GlassView } from 'expo-glass-effect';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AuthMode = 'login' | 'signup';

export default function AuthScreen({ mode }: { mode: AuthMode }) {
  const isSignup = mode === 'signup';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit() {
    if (!email.trim() || !password.trim() || (isSignup && !name.trim())) {
      Alert.alert('Faltan datos', 'Completa los campos para continuar.');
      return;
    }
    Alert.alert(isSignup ? 'Tu cuenta está lista' : 'Bienvenido a NEXUS CUP', 'Aquí conectaremos la autenticación con tu backend cuando esté preparado.');
  }

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={[styles.glow, styles.cyanGlow]} />
      <View pointerEvents="none" style={[styles.glow, styles.violetGlow]} />
      <View pointerEvents="none" style={[styles.grid, styles.gridOne]} />
      <View pointerEvents="none" style={[styles.grid, styles.gridTwo]} />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.topBar}>
              <View style={styles.brandRow}>
                <View style={styles.brandMark}><View style={styles.markCore} /><Text style={styles.brandSlash}>/</Text></View>
                <View><Text style={styles.brandName}>NEXUS</Text><Text style={styles.brandSub}>TOURNAMENTS</Text></View>
              </View>
              <View style={styles.liveChip}><View style={styles.liveDot} /><Text style={styles.liveText}>LIVE</Text></View>
            </View>

            <View style={styles.hero}>
              <Text style={styles.eyebrow}>{isSignup ? 'CREA TU LEGADO' : 'EL JUEGO TE LLAMA'}</Text>
              <Text style={styles.title}>{isSignup ? 'Tu próxima\nvictoria empieza hoy.' : 'Donde compiten\nlos que dejan huella.'}</Text>
              <Text style={styles.subtitle}>{isSignup ? 'Gestiona equipos, torneos y comunidades desde una misma plataforma.' : 'Entra a la arena. Tus torneos, tu equipo y tu siguiente desafío están aquí.'}</Text>
              <View style={styles.metrics}><Metric value="2.4K" label="torneos activos" /><View style={styles.metricLine} /><Metric value="48K" label="competidores" /><View style={styles.metricLine} /><Metric value="24/7" label="en juego" /></View>
            </View>

            <GlassView glassEffectStyle="clear" tintColor="rgba(17, 32, 52, 0.76)" style={styles.card}>
              <View pointerEvents="none" style={styles.cardReflection} />
              <View style={styles.cardHeading}><View><Text style={styles.cardTitle}>{isSignup ? 'Crea tu perfil' : 'Acceso de competidor'}</Text><Text style={styles.cardCaption}>{isSignup ? 'Solo te llevará un minuto.' : 'Ingresa para continuar tu partida.'}</Text></View><Text style={styles.cardNumber}>01</Text></View>
              {isSignup && <Field label="Nombre de usuario" placeholder="¿Cómo te conoce la arena?" value={name} onChangeText={setName} autoCapitalize="none" />}
              <Field label="Correo electrónico" placeholder="tu@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              <Field label="Contraseña" placeholder={isSignup ? 'Mínimo 8 caracteres' : 'Tu contraseña'} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} rightAction={<Pressable accessibilityRole="button" onPress={() => setShowPassword((visible) => !visible)}><Text style={styles.showPassword}>{showPassword ? 'Ocultar' : 'Ver'}</Text></Pressable>} />
              {!isSignup && <Text style={styles.recovery}>¿Olvidaste tu contraseña?</Text>}
              <Pressable accessibilityRole="button" onPress={handleSubmit} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryButtonText}>{isSignup ? 'Entrar a la competición' : 'Continuar a la arena'}</Text><View style={styles.arrowCircle}><Text style={styles.arrow}>→</Text></View></Pressable>
              <View style={styles.dividerRow}><View style={styles.divider} /><Text style={styles.dividerText}>O ACCEDE CON</Text><View style={styles.divider} /></View>
              <Pressable accessibilityRole="button" onPress={() => Alert.alert('Google', 'Configuraremos este acceso junto con el backend.')} style={({ pressed }) => [styles.googleButton, pressed && styles.pressed]}><Text style={styles.googleG}>G</Text><Text style={styles.googleButtonText}>Continuar con Google</Text></Pressable>
            </GlassView>
            <View style={styles.switchRow}><Text style={styles.switchText}>{isSignup ? '¿Ya eres parte de NEXUS?' : '¿Primera vez en la arena?'}</Text><link href={isSignup ? '/login' : '/signup'} style={styles.switchAction}>{isSignup ? 'Inicia sesión' : 'Crea tu cuenta'}</link></View>
            {isSignup && <Text style={styles.legal}>Al continuar aceptas los Términos de uso y la Política de privacidad.</Text>}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function Metric({ value, label }: { value: string; label: string }) { return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>; }
type FieldProps = Pick<React.ComponentProps<typeof TextInput>, 'value' | 'onChangeText' | 'secureTextEntry' | 'keyboardType' | 'autoCapitalize'> & { label: string; placeholder: string; rightAction?: React.ReactNode };
function Field({ label, placeholder, rightAction, ...inputProps }: FieldProps) { return <View style={styles.fieldGroup}><Text style={styles.fieldLabel}>{label}</Text><View style={styles.inputShell}><TextInput {...inputProps} placeholder={placeholder} placeholderTextColor="rgba(204, 222, 239, 0.42)" style={styles.input} />{rightAction}</View></View>; }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050B14', overflow: 'hidden' }, safeArea: { flex: 1 }, flex: { flex: 1 },
  glow: { position: 'absolute', borderRadius: 999, opacity: 0.55 }, cyanGlow: { width: 430, height: 430, backgroundColor: '#006D85', top: -210, right: -170 }, violetGlow: { width: 330, height: 330, backgroundColor: '#381C85', bottom: 60, left: -200 },
  grid: { position: 'absolute', width: 620, height: 1, backgroundColor: 'rgba(130, 229, 255, 0.08)', transform: [{ rotate: '-34deg' }] }, gridOne: { top: 120, left: -170 }, gridTwo: { top: 330, left: -70 },
  scrollContent: { width: '100%', maxWidth: 570, alignSelf: 'center', paddingHorizontal: 22, paddingTop: 12, paddingBottom: 34 }, topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 }, brandMark: { width: 38, height: 38, borderRadius: 12, overflow: 'hidden', backgroundColor: '#BFF7FF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E8FEFF', shadowColor: '#54E9FF', shadowOpacity: 0.65, shadowRadius: 16, elevation: 8 }, markCore: { position: 'absolute', width: 20, height: 20, borderRadius: 4, backgroundColor: '#05223B', transform: [{ rotate: '45deg' }] }, brandSlash: { color: '#DCFCFF', fontSize: 31, fontWeight: '200', marginTop: -2 }, brandName: { color: '#F4FBFF', fontSize: 18, fontWeight: '900', letterSpacing: 2.7 }, brandSub: { color: '#74EFFF', fontSize: 7, fontWeight: '800', letterSpacing: 2.15, marginTop: 1 }, liveChip: { borderRadius: 20, paddingHorizontal: 10, height: 28, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: 'rgba(126, 245, 255, 0.3)', backgroundColor: 'rgba(11, 48, 64, 0.62)' }, liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#70F6BF', shadowColor: '#70F6BF', shadowRadius: 6, shadowOpacity: 1 }, liveText: { color: '#B8FEEE', fontWeight: '900', fontSize: 9, letterSpacing: 1.2 },
  hero: { marginTop: 53, marginBottom: 25 }, eyebrow: { color: '#7BEFFF', fontSize: 10, fontWeight: '900', letterSpacing: 2.3, marginBottom: 12 }, title: { color: '#F3FBFF', fontSize: 37, lineHeight: 41, letterSpacing: -1.25, fontWeight: '900' }, subtitle: { color: '#A2B5C7', fontSize: 15, lineHeight: 22, marginTop: 13, maxWidth: 430 }, metrics: { flexDirection: 'row', alignItems: 'center', marginTop: 24, alignSelf: 'flex-start', paddingVertical: 11, paddingHorizontal: 13, backgroundColor: 'rgba(9, 31, 48, 0.58)', borderRadius: 13, borderWidth: 1, borderColor: 'rgba(135, 234, 255, 0.16)' }, metric: { minWidth: 73 }, metricValue: { color: '#F4FDFF', fontSize: 15, fontWeight: '900', letterSpacing: -0.3 }, metricLabel: { color: '#7E9AAC', fontSize: 8, letterSpacing: 0.2, marginTop: 2 }, metricLine: { height: 23, width: 1, backgroundColor: 'rgba(139, 227, 255, 0.2)', marginHorizontal: 10 },
  card: { overflow: 'hidden', borderRadius: 24, padding: 20, gap: 15, backgroundColor: 'rgba(12, 29, 47, 0.76)', borderWidth: 1, borderColor: 'rgba(153, 237, 255, 0.3)', shadowColor: '#04111F', shadowOpacity: 0.8, shadowRadius: 26, shadowOffset: { width: 0, height: 15 }, elevation: 8 }, cardReflection: { position: 'absolute', height: 150, width: '75%', right: -35, top: -94, backgroundColor: 'rgba(147, 241, 255, 0.13)', borderRadius: 90, transform: [{ rotate: '-17deg' }] }, cardHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }, cardTitle: { color: '#F2FBFF', fontSize: 19, fontWeight: '800', letterSpacing: -0.4 }, cardCaption: { color: '#8BA6BA', fontSize: 12, marginTop: 3 }, cardNumber: { color: 'rgba(125, 238, 255, 0.6)', fontWeight: '900', fontSize: 15, letterSpacing: 1 }, fieldGroup: { gap: 7 }, fieldLabel: { color: '#BED0DD', fontSize: 12, fontWeight: '800', letterSpacing: 0.15 }, inputShell: { height: 51, borderRadius: 13, backgroundColor: 'rgba(1, 12, 25, 0.43)', borderWidth: 1, borderColor: 'rgba(162, 229, 245, 0.2)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 }, input: { flex: 1, color: '#F0F9FF', fontSize: 15, height: '100%' }, showPassword: { color: '#72EFFF', fontSize: 12, fontWeight: '800', paddingLeft: 10 }, recovery: { alignSelf: 'flex-end', color: '#77EFFF', fontSize: 12, fontWeight: '700', marginTop: -5 },
  primaryButton: { minHeight: 54, borderRadius: 14, backgroundColor: '#9BF7FF', paddingLeft: 18, paddingRight: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 3, shadowColor: '#47E4F7', shadowOpacity: 0.45, shadowRadius: 18, shadowOffset: { width: 0, height: 6 }, elevation: 6 }, primaryButtonText: { color: '#04223A', fontSize: 15, fontWeight: '900' }, arrowCircle: { width: 38, height: 38, borderRadius: 11, backgroundColor: '#07364D', alignItems: 'center', justifyContent: 'center' }, arrow: { color: '#B9F9FF', fontSize: 21, fontWeight: '800', lineHeight: 24 }, dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginVertical: 1 }, divider: { flex: 1, height: 1, backgroundColor: 'rgba(160, 221, 238, 0.15)' }, dividerText: { color: '#7892A4', fontSize: 9, fontWeight: '800', letterSpacing: 0.8 }, googleButton: { height: 50, borderRadius: 13, borderWidth: 1, borderColor: 'rgba(161, 227, 243, 0.22)', backgroundColor: 'rgba(255, 255, 255, 0.04)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 }, googleG: { color: '#80F3FF', fontSize: 18, fontWeight: '900' }, googleButtonText: { color: '#D7EAF4', fontSize: 14, fontWeight: '700' }, switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, marginTop: 23 }, switchText: { color: '#91A9B9', fontSize: 13 }, switchAction: { color: '#82F3FF', fontSize: 13, fontWeight: '900' }, legal: { textAlign: 'center', color: '#718A9B', fontSize: 11, lineHeight: 16, marginTop: 18, paddingHorizontal: 20 }, pressed: { opacity: 0.8, transform: [{ scale: 0.985 }] },
});
