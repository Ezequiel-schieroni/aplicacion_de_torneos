import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { GlassView } from 'expo-glass-effect';
import { Link } from 'expo-router';
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
      Alert.alert('Completa tus datos', 'Revisa los campos marcados para continuar.');
      return;
    }
    Alert.alert(isSignup ? 'Todo listo para empezar' : 'Bienvenido de vuelta', 'Conecta aquí tu servicio de autenticación para finalizar el acceso.');
  }

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={[styles.orb, styles.orbOne]} />
      <View pointerEvents="none" style={[styles.orb, styles.orbTwo]} />
      <View pointerEvents="none" style={[styles.orb, styles.orbThree]} />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.brandRow}><View style={styles.brandMark}><Text style={styles.brandMarkText}>m</Text></View><Text style={styles.brandName}>momenta</Text></View>
            <View style={styles.hero}>
              <Text style={styles.kicker}>{isSignup ? 'TU NUEVO ESPACIO' : 'QUÉ ALEGRÍA VERTE'}</Text>
              <Text style={styles.title}>{isSignup ? 'Crea, comparte, conecta.' : 'Tus momentos te esperan.'}</Text>
              <Text style={styles.subtitle}>{isSignup ? 'Únete a una comunidad para compartir las cosas que hacen único tu día.' : 'Inicia sesión para volver a tus historias, personas y recuerdos favoritos.'}</Text>
            </View>
            <GlassView glassEffectStyle="clear" tintColor="rgba(255,255,255,0.22)" style={styles.card}>
              <View style={styles.cardHighlight} pointerEvents="none" />
              {isSignup && <Field label="Nombre de usuario" placeholder="¿Cómo te llamamos?" value={name} onChangeText={setName} autoCapitalize="none" />}
              <Field label="Correo electrónico" placeholder="nombre@correo.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              <Field label="Contraseña" placeholder={isSignup ? 'Mínimo 8 caracteres' : 'Tu contraseña'} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} rightAction={<Pressable accessibilityRole="button" onPress={() => setShowPassword((visible) => !visible)}><Text style={styles.showPassword}>{showPassword ? 'Ocultar' : 'Ver'}</Text></Pressable>} />
              {!isSignup && <Link href="/signup" style={styles.forgotLink}>¿Olvidaste tu contraseña?</Link>}
              <Pressable accessibilityRole="button" onPress={handleSubmit} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryButtonText}>{isSignup ? 'Crear mi cuenta' : 'Iniciar sesión'}</Text><View style={styles.arrowCircle}><Text style={styles.arrow}>›</Text></View></Pressable>
              <View style={styles.dividerRow}><View style={styles.divider} /><Text style={styles.dividerText}>o continúa con</Text><View style={styles.divider} /></View>
              <Pressable accessibilityRole="button" accessibilityLabel="Continuar con Google" onPress={() => Alert.alert('Continuar con Google', 'Configura OAuth o Firebase para activar este acceso.')} style={({ pressed }) => [styles.googleButton, pressed && styles.pressed]}><Text style={styles.googleG}>G</Text><Text style={styles.googleButtonText}>Google</Text></Pressable>
            </GlassView>
            <View style={styles.switchRow}><Text style={styles.switchText}>{isSignup ? '¿Ya tienes una cuenta?' : '¿Todavía no tienes una cuenta?'}</Text><Link href={isSignup ? '/login' : '/signup'} style={styles.switchAction}>{isSignup ? 'Inicia sesión' : 'Regístrate'}</Link></View>
            {isSignup && <Text style={styles.legal}>Al continuar, aceptas los Términos de uso y la Política de privacidad.</Text>}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

type FieldProps = Pick<React.ComponentProps<typeof TextInput>, 'value' | 'onChangeText' | 'secureTextEntry' | 'keyboardType' | 'autoCapitalize'> & { label: string; placeholder: string; rightAction?: React.ReactNode };
function Field({ label, placeholder, rightAction, ...inputProps }: FieldProps) {
  return <View style={styles.fieldGroup}><Text style={styles.fieldLabel}>{label}</Text><View style={styles.inputShell}><TextInput {...inputProps} placeholder={placeholder} placeholderTextColor="rgba(29, 27, 52, 0.42)" style={styles.input} />{rightAction}</View></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#E7E8FF', overflow: 'hidden' }, safeArea: { flex: 1 }, flex: { flex: 1 }, orb: { position: 'absolute', borderRadius: 999 },
  orbOne: { width: 340, height: 340, top: -110, left: -120, backgroundColor: '#B7A5FF' }, orbTwo: { width: 280, height: 280, top: 130, right: -120, backgroundColor: '#8EDBFF' }, orbThree: { width: 310, height: 310, bottom: -145, left: 25, backgroundColor: '#F4B6D6' },
  scrollContent: { width: '100%', maxWidth: 540, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 }, brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: { width: 38, height: 38, borderRadius: 14, backgroundColor: '#25214D', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-8deg' }] }, brandMarkText: { color: '#FFF', fontSize: 25, lineHeight: 29, fontWeight: '800' }, brandName: { color: '#25214D', fontSize: 22, fontWeight: '800', letterSpacing: -0.8 },
  hero: { marginTop: 54, marginBottom: 27 }, kicker: { color: '#5B43C8', fontSize: 11, fontWeight: '800', letterSpacing: 1.35, marginBottom: 11 }, title: { color: '#211E42', fontSize: 38, lineHeight: 42, letterSpacing: -1.5, fontWeight: '800', maxWidth: 420 }, subtitle: { color: '#4E4A6C', fontSize: 15, lineHeight: 22, marginTop: 12, maxWidth: 390 },
  card: { overflow: 'hidden', borderRadius: 28, padding: 20, gap: 16, backgroundColor: 'rgba(255,255,255,0.34)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.65)', shadowColor: '#625E9B', shadowOpacity: 0.16, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 5 }, cardHighlight: { position: 'absolute', width: 200, height: 100, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.22)', top: -55, right: -30 },
  fieldGroup: { gap: 7 }, fieldLabel: { color: '#302C55', fontSize: 13, fontWeight: '700' }, inputShell: { height: 53, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.58)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 }, input: { flex: 1, color: '#211E42', fontSize: 16, height: '100%' }, showPassword: { color: '#5B43C8', fontSize: 13, fontWeight: '800', paddingLeft: 10 }, forgotLink: { alignSelf: 'flex-end', color: '#5B43C8', fontSize: 13, fontWeight: '700', marginTop: -5 },
  primaryButton: { minHeight: 56, borderRadius: 18, backgroundColor: '#282452', paddingLeft: 19, paddingRight: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }, primaryButtonText: { color: '#FFF', fontSize: 16, fontWeight: '800' }, arrowCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#A99AFF', alignItems: 'center', justifyContent: 'center' }, arrow: { color: '#282452', fontSize: 32, fontWeight: '300', lineHeight: 35, marginTop: -3 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 1 }, divider: { flex: 1, height: 1, backgroundColor: 'rgba(48,44,85,0.16)' }, dividerText: { color: '#615D7C', fontSize: 12 }, googleButton: { height: 52, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', backgroundColor: 'rgba(255,255,255,0.5)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 }, googleG: { color: '#4285F4', fontSize: 18, fontWeight: '800' }, googleButtonText: { color: '#302C55', fontSize: 15, fontWeight: '700' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, marginTop: 24 }, switchText: { color: '#4E4A6C', fontSize: 14 }, switchAction: { color: '#4E37B5', fontSize: 14, fontWeight: '800' }, legal: { textAlign: 'center', color: '#615D7C', fontSize: 11, lineHeight: 16, marginTop: 20, paddingHorizontal: 20 }, pressed: { opacity: 0.76, transform: [{ scale: 0.985 }] },
});
