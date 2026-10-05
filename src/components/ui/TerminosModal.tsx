import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../../constants/Colors";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function TerminosModal({ visible, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent
    >
      <SafeAreaView style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitulo}>Términos y Condiciones</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={Colors.blanco}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contenido}
          showsVerticalScrollIndicator={false}
        >
          {/* INTRO */}
          <Text style={styles.fecha}>
            Última actualización: octubre de 2026
          </Text>
          <Text style={styles.parrafo}>
            Bienvenido a SENT-IA, un sistema de seguimiento emocional
            estudiantil desarrollado para la Institución Educativa Técnica
            Industrial Rafael Navia Varón. Al usar esta aplicación, aceptas los
            siguientes términos y condiciones.
          </Text>

          {/* SECCIÓN 1 */}
          <Text style={styles.seccionTitulo}>
            1. Propósito de la aplicación
          </Text>
          <Text style={styles.parrafo}>
            SENT-IA es una herramienta de apoyo pedagógico que permite a los
            estudiantes registrar sus respuestas a situaciones hipotéticas
            relacionadas con su bienestar emocional. Los resultados son
            analizados por inteligencia artificial y presentados a los docentes
            orientadores como insumo de seguimiento, no como diagnóstico
            clínico.
          </Text>

          {/* SECCIÓN 2 */}
          <Text style={styles.seccionTitulo}>2. Recopilación de datos</Text>
          <Text style={styles.parrafo}>
            La aplicación recopila la siguiente información:
          </Text>
          <Text style={styles.bullet}>
            • Nombre completo, correo electrónico y foto de perfil (opcional).
          </Text>
          <Text style={styles.bullet}>
            • Respuestas a situaciones hipotéticas semanales y tiempo de
            respuesta.
          </Text>
          <Text style={styles.bullet}>
            • Registro emocional diario voluntario mediante selección de estado.
          </Text>
          <Text style={styles.bullet}>• Grado e institución educativa.</Text>

          {/* SECCIÓN 3 */}
          <Text style={styles.seccionTitulo}>3. Uso de la información</Text>
          <Text style={styles.parrafo}>
            Los datos recopilados se utilizan exclusivamente para:
          </Text>
          <Text style={styles.bullet}>
            • Generar indicadores de bienestar emocional por área temática.
          </Text>
          <Text style={styles.bullet}>
            • Producir resúmenes de análisis para los docentes orientadores.
          </Text>
          <Text style={styles.bullet}>
            • Identificar estudiantes que puedan requerir acompañamiento
            pedagógico.
          </Text>
          <Text style={styles.parrafo}>
            La información nunca será compartida con terceros, utilizada con
            fines comerciales ni publicada de forma que permita identificar a un
            estudiante específico.
          </Text>

          {/* SECCIÓN 4 */}
          <Text style={styles.seccionTitulo}>
            4. Privacidad y confidencialidad
          </Text>
          <Text style={styles.parrafo}>
            Las respuestas individuales de los estudiantes son confidenciales.
            Los docentes únicamente tienen acceso a los indicadores calculados y
            al resumen generado por la inteligencia artificial — nunca a las
            respuestas exactas. Los estudiantes no pueden ver sus propios
            indicadores ni las observaciones que los docentes realicen sobre
            ellos.
          </Text>

          {/* SECCIÓN 5 */}
          <Text style={styles.seccionTitulo}>5. Menores de edad</Text>
          <Text style={styles.parrafo}>
            SENT-IA está dirigida exclusivamente a estudiantes de bachillerato.
            Al registrarse, el estudiante declara conocer y aceptar estos
            términos. Se recomienda que los acudientes o tutores legales sean
            informados sobre el uso de la aplicación por parte del menor.
          </Text>

          {/* SECCIÓN 6 */}
          <Text style={styles.seccionTitulo}>6. Inteligencia artificial</Text>
          <Text style={styles.parrafo}>
            Los resúmenes generados por SENT-IA son producidos por el modelo de
            lenguaje Mistral Nemo 12B a través de la API de NVIDIA. Estos
            resúmenes tienen carácter orientativo y pedagógico. No constituyen
            diagnósticos psicológicos ni médicos y no reemplazan la atención
            profesional especializada.
          </Text>

          {/* SECCIÓN 7 */}
          <Text style={styles.seccionTitulo}>7. Seguridad de los datos</Text>
          <Text style={styles.parrafo}>
            Los datos se almacenan en Supabase con cifrado en tránsito y en
            reposo. El acceso a la información está protegido por políticas de
            seguridad a nivel de fila (Row Level Security) que garantizan que
            cada usuario solo accede a los datos que le corresponden.
          </Text>

          {/* SECCIÓN 8 */}
          <Text style={styles.seccionTitulo}>8. Modificaciones</Text>
          <Text style={styles.parrafo}>
            La institución educativa y el equipo desarrollador se reservan el
            derecho de modificar estos términos en cualquier momento. Los
            cambios serán notificados a través de la aplicación.
          </Text>

          {/* SECCIÓN 9 */}
          <Text style={styles.seccionTitulo}>9. Contacto</Text>
          <Text style={styles.parrafo}>
            Para consultas relacionadas con el tratamiento de datos o el
            funcionamiento de la aplicación, puede comunicarse con la
            coordinación académica de la Institución Educativa Técnica
            Industrial Rafael Navia Varón.
          </Text>

          {/* CRÉDITOS */}
          <View style={styles.creditosCard}>
            <MaterialCommunityIcons
              name="code-tags"
              size={20}
              color={Colors.azulPrincipal}
            />
            <Text style={styles.creditosTitulo}>Créditos</Text>
            <Text style={styles.creditosTexto}>Desarrollado por</Text>
            <Text style={styles.creditosNombre}>Sofía García</Text>
            <Text style={styles.creditosInstitucion}>
              Institución Educativa Técnica Industrial{"\n"}Rafael Navia Varón
            </Text>
            <Text style={styles.creditosAnio}>© 2026</Text>
          </View>
        </ScrollView>

        {/* BOTÓN CERRAR */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.buttonCerrar}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonCerrarTexto}>Entendido</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.fondoApp,
  },
  header: {
    backgroundColor: Colors.azulPrincipal,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitulo: {
    fontSize: 17,
    fontFamily: "Poppins_700Bold",
    color: Colors.blanco,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: { flex: 1 },
  contenido: {
    padding: 24,
    paddingBottom: 8,
  },
  fecha: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
    marginBottom: 12,
  },
  seccionTitulo: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    color: Colors.azulPrincipal,
    marginTop: 20,
    marginBottom: 8,
  },
  parrafo: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisOscuro,
    lineHeight: 22,
    marginBottom: 8,
  },
  bullet: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisOscuro,
    lineHeight: 22,
    paddingLeft: 8,
    marginBottom: 4,
  },
  creditosCard: {
    backgroundColor: Colors.blanco,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginTop: 32,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.azulClaro,
    gap: 6,
  },
  creditosTitulo: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    color: Colors.grisOscuro,
    marginTop: 4,
  },
  creditosTexto: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
  },
  creditosNombre: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: Colors.azulPrincipal,
  },
  creditosInstitucion: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.grisMedio,
    textAlign: "center",
    lineHeight: 20,
  },
  creditosAnio: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.grisMedio,
    marginTop: 4,
  },
  footer: {
    padding: 20,
    paddingBottom: 32,
    backgroundColor: Colors.fondoApp,
    borderTopWidth: 1,
    borderTopColor: Colors.azulClaro,
  },
  buttonCerrar: {
    backgroundColor: Colors.azulPrincipal,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
    elevation: 4,
  },
  buttonCerrarTexto: {
    color: Colors.blanco,
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
  },
});
