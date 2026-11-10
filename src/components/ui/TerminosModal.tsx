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
          <Text style={styles.headerTitulo}>
            Política de privacidad y términos
          </Text>

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
          {/* INTRODUCCIÓN */}
          <Text style={styles.fecha}>
            Última actualización: noviembre de 2026
          </Text>

          <Text style={styles.parrafo}>
            Bienvenido a SENT-IA, una herramienta de apoyo pedagógico
            desarrollada para la Institución Educativa Técnica Industrial Rafael
            Navia Varón, ubicada en Cali, Colombia. Este documento explica las
            condiciones de uso de la aplicación y cómo se recopila, utiliza,
            almacena y protege la información de sus usuarios.
          </Text>

          {/* SECCIÓN 1 */}
          <Text style={styles.seccionTitulo}>
            1. Propósito de la aplicación
          </Text>

          <Text style={styles.parrafo}>
            SENT-IA es una herramienta de apoyo pedagógico que permite a los
            estudiantes registrar respuestas a situaciones hipotéticas
            relacionadas con su bienestar emocional. La información es procesada
            para generar indicadores y resúmenes que sirven como insumo para el
            seguimiento y acompañamiento por parte de los docentes orientadores.
          </Text>

          <Text style={styles.parrafo}>
            SENT-IA no es una herramienta de diagnóstico clínico, psicológico ni
            médico. Sus resultados no reemplazan la valoración ni la atención de
            profesionales especializados.
          </Text>

          {/* SECCIÓN 2 */}
          <Text style={styles.seccionTitulo}>
            2. Responsable del tratamiento de datos
          </Text>

          <Text style={styles.parrafo}>
            La responsable del tratamiento de los datos personales recopilados
            mediante SENT-IA es la Institución Educativa Técnica Industrial
            Rafael Navia Varón, en el marco de sus actividades educativas y de
            acompañamiento pedagógico.
          </Text>

          <Text style={styles.parrafo}>
            Para consultas, solicitudes o inquietudes relacionadas con el
            tratamiento de información personal, los usuarios y sus acudientes
            pueden comunicarse al correo:
          </Text>

          <Text style={styles.bullet}>• sentia2807@gmail.com</Text>

          {/* SECCIÓN 3 */}
          <Text style={styles.seccionTitulo}>3. Información recopilada</Text>

          <Text style={styles.parrafo}>
            Para el funcionamiento de la aplicación se pueden recopilar y tratar
            las siguientes categorías de información:
          </Text>

          <Text style={styles.bullet}>
            • Datos de identificación: nombre completo e identificador de
            usuario.
          </Text>

          <Text style={styles.bullet}>
            • Datos de contacto: correo electrónico.
          </Text>

          <Text style={styles.bullet}>
            • Información académica: grado e institución educativa.
          </Text>

          <Text style={styles.bullet}>
            • Respuestas a situaciones hipotéticas, opciones seleccionadas y
            tiempos de respuesta.
          </Text>

          <Text style={styles.bullet}>
            • Registros emocionales diarios realizados voluntariamente por el
            estudiante.
          </Text>

          <Text style={styles.bullet}>
            • Indicadores de bienestar, puntuaciones, niveles de seguimiento,
            resúmenes y alertas generados a partir de la información procesada.
          </Text>

          <Text style={styles.parrafo}>
            La información relacionada con estados emocionales, respuestas sobre
            bienestar y resultados derivados de estos registros puede revelar
            aspectos sensibles de la vida personal del estudiante. Por esta
            razón, recibe un tratamiento especialmente cuidadoso.
          </Text>

          {/* SECCIÓN 4 */}
          <Text style={styles.seccionTitulo}>
            4. Finalidades del tratamiento
          </Text>

          <Text style={styles.parrafo}>
            La información recopilada se utiliza para las siguientes
            finalidades:
          </Text>

          <Text style={styles.bullet}>
            • Registrar las respuestas de los estudiantes a las actividades
            pedagógicas.
          </Text>

          <Text style={styles.bullet}>
            • Calcular indicadores de bienestar por áreas temáticas.
          </Text>

          <Text style={styles.bullet}>
            • Generar resúmenes mediante herramientas de inteligencia
            artificial.
          </Text>

          <Text style={styles.bullet}>
            • Identificar situaciones que puedan requerir acompañamiento
            pedagógico.
          </Text>

          <Text style={styles.bullet}>
            • Presentar información de seguimiento a los docentes y orientadores
            autorizados.
          </Text>

          <Text style={styles.parrafo}>
            Los datos no se venden ni se comparten para fines comerciales o
            publicitarios. Pueden ser procesados por proveedores tecnológicos
            necesarios para prestar los servicios de la aplicación, de acuerdo
            con las finalidades descritas en este documento.
          </Text>

          {/* SECCIÓN 5 */}
          <Text style={styles.seccionTitulo}>
            5. Privacidad y acceso a la información
          </Text>

          <Text style={styles.parrafo}>
            SENT-IA utiliza información individual para calcular indicadores y
            generar resultados asociados a cada estudiante. Los docentes y
            orientadores autorizados pueden consultar información de
            identificación, indicadores, niveles de seguimiento, alertas y
            resúmenes necesarios para el acompañamiento pedagógico.
          </Text>

          <Text style={styles.parrafo}>
            La información utilizada para generar los análisis mediante
            inteligencia artificial se procesa sin incluir directamente el
            nombre, el correo electrónico ni el identificador personal del
            estudiante en la solicitud enviada al servicio de IA.
          </Text>

          <Text style={styles.parrafo}>
            Esto no significa que toda la información almacenada en SENT-IA sea
            anónima: los indicadores y alertas permanecen asociados al usuario
            dentro de la plataforma para permitir el seguimiento
            correspondiente.
          </Text>

          {/* SECCIÓN 6 */}
          <Text style={styles.seccionTitulo}>
            6. Tratamiento mediante inteligencia artificial
          </Text>

          <Text style={styles.parrafo}>
            SENT-IA utiliza el modelo openai/gpt-oss-20b mediante la API de
            NVIDIA para procesar información relacionada con las actividades de
            los estudiantes y generar resúmenes de apoyo pedagógico.
          </Text>

          <Text style={styles.parrafo}>
            La información enviada al servicio de inteligencia artificial puede
            incluir:
          </Text>

          <Text style={styles.bullet}>
            • El grado académico del estudiante.
          </Text>

          <Text style={styles.bullet}>
            • El contexto y contenido de las situaciones hipotéticas.
          </Text>

          <Text style={styles.bullet}>
            • Las opciones seleccionadas y los textos asociados a las
            respuestas.
          </Text>

          <Text style={styles.bullet}>• Los tiempos de respuesta.</Text>

          <Text style={styles.bullet}>
            • Las áreas temáticas, puntuaciones e indicadores calculados.
          </Text>

          <Text style={styles.parrafo}>
            El nombre, correo electrónico e identificador personal no se
            incluyen directamente en el contenido de la solicitud enviada a
            NVIDIA según el flujo de procesamiento implementado.
          </Text>

          <Text style={styles.parrafo}>
            El procesamiento se realiza mediante infraestructura tecnológica que
            incluye un servicio intermedio de Cloudflare y los servicios de
            inteligencia artificial de NVIDIA. El tratamiento por parte de estos
            proveedores es necesario para el funcionamiento de las
            funcionalidades correspondientes.
          </Text>

          <Text style={styles.parrafo}>
            Los resultados generados son orientativos y pedagógicos. No
            constituyen diagnósticos psicológicos ni médicos y no reemplazan la
            intervención profesional.
          </Text>

          {/* SECCIÓN 7 */}
          <Text style={styles.seccionTitulo}>7. Menores de edad</Text>

          <Text style={styles.parrafo}>
            SENT-IA está dirigida a estudiantes de la Institución Educativa
            Técnica Industrial Rafael Navia Varón, incluidos menores de edad.
          </Text>

          <Text style={styles.parrafo}>
            La institución educativa es responsable de informar a los padres,
            madres o acudientes sobre el tratamiento de información personal de
            los estudiantes menores de edad y de gestionar la autorización
            correspondiente, de acuerdo con la normativa aplicable.
          </Text>

          <Text style={styles.parrafo}>
            El tratamiento de la información debe atender el interés superior
            del menor y respetar sus derechos fundamentales.
          </Text>

          {/* SECCIÓN 8 */}
          <Text style={styles.seccionTitulo}>
            8. Almacenamiento y proveedores tecnológicos
          </Text>

          <Text style={styles.parrafo}>
            SENT-IA utiliza los siguientes servicios tecnológicos para operar:
          </Text>

          <Text style={styles.bullet}>
            • Supabase: autenticación de usuarios, almacenamiento y gestión de
            la base de datos.
          </Text>

          <Text style={styles.bullet}>
            • Cloudflare: infraestructura intermedia para gestionar solicitudes
            relacionadas con el procesamiento de inteligencia artificial.
          </Text>

          <Text style={styles.bullet}>
            • NVIDIA: servicio utilizado para el procesamiento de información
            mediante inteligencia artificial.
          </Text>

          <Text style={styles.parrafo}>
            Estos servicios intervienen en el funcionamiento técnico de SENT-IA
            y procesan la información necesaria para prestar sus respectivas
            funcionalidades.
          </Text>

          {/* SECCIÓN 9 */}
          <Text style={styles.seccionTitulo}>
            9. Seguridad de la información
          </Text>

          <Text style={styles.parrafo}>
            La aplicación utiliza Supabase para la gestión de la información y
            cuenta con mecanismos de protección que incluyen cifrado de la
            información en tránsito y en reposo, así como políticas de seguridad
            a nivel de fila (Row Level Security o RLS).
          </Text>

          <Text style={styles.parrafo}>
            Estas medidas buscan proteger la confidencialidad, integridad y
            disponibilidad de la información, restringiendo el acceso según los
            permisos establecidos en la plataforma.
          </Text>

          <Text style={styles.parrafo}>
            Ningún sistema informático puede garantizar seguridad absoluta. La
            institución y el equipo responsable procurarán mantener medidas
            técnicas y organizativas apropiadas para proteger los datos
            tratados.
          </Text>

          {/* SECCIÓN 10 */}
          <Text style={styles.seccionTitulo}>
            10. Conservación de la información
          </Text>

          <Text style={styles.parrafo}>
            La información se conserva durante el tiempo necesario para cumplir
            las finalidades académicas y de seguimiento pedagógico para las que
            fue recopilada, así como las obligaciones legales que puedan
            resultar aplicables.
          </Text>

          <Text style={styles.parrafo}>
            Cuando la información deje de ser necesaria para estas finalidades,
            se aplicarán los procedimientos correspondientes de eliminación o
            conservación permitida según las disposiciones aplicables.
          </Text>

          {/* SECCIÓN 11 */}
          <Text style={styles.seccionTitulo}>
            11. Derechos de los titulares
          </Text>

          <Text style={styles.parrafo}>
            Los titulares de la información, o sus representantes legales cuando
            corresponda, pueden ejercer los derechos reconocidos por la
            normativa de protección de datos personales, entre ellos:
          </Text>

          <Text style={styles.bullet}>
            • Conocer, actualizar y rectificar sus datos personales.
          </Text>

          <Text style={styles.bullet}>
            • Solicitar información sobre el tratamiento de sus datos.
          </Text>

          <Text style={styles.bullet}>
            • Solicitar la supresión de la información cuando sea procedente.
          </Text>

          <Text style={styles.bullet}>
            • Revocar la autorización cuando sea legalmente procedente.
          </Text>

          <Text style={styles.parrafo}>
            Las solicitudes pueden enviarse al correo sentia2807@gmail.com. La
            institución dará respuesta dentro del plazo establecido para la
            atención de estas solicitudes, que para SENT-IA se ha definido en
            siete (7) días.
          </Text>

          {/* SECCIÓN 12 */}
          <Text style={styles.seccionTitulo}>
            12. Eliminación de cuenta e información
          </Text>

          <Text style={styles.parrafo}>
            Los usuarios o sus representantes legales, cuando corresponda,
            pueden solicitar la eliminación de una cuenta mediante el correo
            electrónico:
          </Text>

          <Text style={styles.bullet}>• sentia2807@gmail.com</Text>

          <Text style={styles.parrafo}>
            Para tramitar la solicitud se podrá verificar la identidad del
            solicitante y su autorización para actuar en nombre del titular,
            cuando corresponda.
          </Text>

          <Text style={styles.parrafo}>
            Una vez recibida y validada la solicitud, el procedimiento de
            eliminación se realizará en un plazo máximo de siete (7) días
            hábiles. La confirmación del proceso se enviará al correo
            electrónico correspondiente.
          </Text>

          {/* SECCIÓN 13 */}
          <Text style={styles.seccionTitulo}>
            13. Modificaciones de esta política
          </Text>

          <Text style={styles.parrafo}>
            La institución educativa podrá actualizar este documento cuando
            existan cambios en el funcionamiento de SENT-IA, en sus servicios
            tecnológicos o en las condiciones del tratamiento de información.
          </Text>

          <Text style={styles.parrafo}>
            Las modificaciones serán notificadas a través de los medios
            disponibles en la aplicación. Cuando los cambios afecten finalidades
            del tratamiento, datos sensibles o condiciones sustanciales, se
            solicitará la autorización o aceptación expresa que corresponda.
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
              Institución Educativa Técnica Industrial{"\n"}
              Rafael Navia Varón
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
    flex: 1,
    fontSize: 17,
    fontFamily: "Poppins_700Bold",
    color: Colors.blanco,
    marginRight: 12,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
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
