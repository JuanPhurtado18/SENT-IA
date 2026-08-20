# SENT-IA

### Sistema de Seguimiento Emocional Estudiantil con Inteligencia Artificial

SENT-IA es una aplicación móvil orientada a instituciones educativas que permite realizar un **seguimiento continuo del bienestar emocional de los estudiantes** mediante actividades semanales.

El sistema envía las respuestas de los estudiantes a un modelo de lenguaje (Meta Llama 3.1 8B mediante NVIDIA NIM), genera indicadores por diferentes áreas y proporciona a docentes y orientadores un panel de seguimiento con **indicadores, tendencias y alertas**.

El objetivo es facilitar la **detección temprana de posibles dificultades emocionales**, manteniendo la privacidad del estudiante y evitando exponer sus respuestas individuales al personal docente.

> Proyecto desarrollado con React Native, TypeScript, Supabase, PostgreSQL y Edge Functions.

---

## Objetivo

SENT-IA busca proporcionar a las instituciones educativas una herramienta tecnológica que permita identificar patrones que puedan requerir seguimiento por parte de docentes u orientadores.

El sistema funciona mediante actividades semanales compuestas por diferentes situaciones. A partir de las respuestas, el tiempo de respuesta y el historial del estudiante, el backend procesa la información mediante un modelo de lenguaje y genera indicadores de bienestar.

Los estudiantes **no tienen acceso a sus propios indicadores ni a los resultados del análisis**. Los docentes y orientadores acceden únicamente a la información necesaria para realizar seguimiento.

---

## Características principales

### Módulo del estudiante

- Registro e inicio de sesión.
- Autenticación mediante correo y contraseña.
- Inicio de sesión con Google.
- Gestión del perfil.
- Actividad semanal interactiva.
- 10 situaciones por actividad.
- 4 opciones de respuesta por situación.
- Registro del tiempo de respuesta.
- Clasificación de situaciones por área temática.
- Historial de actividades.
- Registro del estado emocional.
- Confirmación de actividad completada.
- Acceso a información personal sin mostrar los indicadores generados por el sistema.

Las actividades están diseñadas para completarse en aproximadamente **10 a 15 minutos** y contienen situaciones relacionadas con las áreas escolar, familiar, personal, social y afectiva.

---

### Módulo docente / orientador

Los docentes disponen de herramientas para realizar seguimiento de los estudiantes:

- Dashboard general.
- Total de estudiantes.
- Estudiantes activos.
- Visualización de alertas.
- Listado de estudiantes.
- Búsqueda de estudiantes.
- Filtros por estado.
- Reportes individuales.
- Indicadores por área.
- Tendencias semanales.
- Observaciones confidenciales.
- Exportación de reportes.
- Historial de alertas.

El docente no tiene acceso a las respuestas exactas proporcionadas por el estudiante, sino a los indicadores calculados por el sistema.

---

## Motor de análisis

El módulo de análisis de SENT-IA procesa diferentes variables relacionadas con las actividades:

- Respuestas seleccionadas.
- Tiempo empleado en cada situación.
- Historial de semanas anteriores.
- Tendencias.
- Consistencia de las respuestas.

El análisis se ejecuta cuando el estudiante completa una actividad. Las respuestas y variables asociadas se envían desde una **Supabase Edge Function** al modelo de lenguaje **Meta Llama 3.1 8B**, servido mediante la infraestructura de inferencia de **NVIDIA NIM**. El modelo genera los indicadores por área y el contenido de los reportes PDF para el docente. El tiempo de respuesta del motor es de entre **10 y 15 segundos** por análisis.

El sistema no analiza:

- Cámara.
- Micrófono.
- Voz.
- Fotografías para realizar análisis emocional.
- Datos de otras aplicaciones.
- Ubicación del estudiante.

Esto corresponde al principio de privacidad definido para el proyecto.

---

## Áreas de evaluación

Los indicadores se organizan en cinco áreas:

| Área     | Descripción                                               |
| -------- | --------------------------------------------------------- |
| Escolar  | Rendimiento académico, motivación y relación con docentes |
| Familiar | Dinámica familiar, comunicación y situaciones de estrés   |
| Personal | Autoconcepto, autoestima y manejo de emociones            |
| Social   | Relaciones con compañeros, pertenencia y conflictos       |
| Afectiva | Estado emocional y estabilidad                            |

Además, el sistema calcula un indicador de **bienestar general** a partir de las diferentes áreas.

### Niveles de indicadores

| Nivel                | Descripción                                                |
| -------------------- | ---------------------------------------------------------- |
| Estable              | Respuestas saludables y consistentes                       |
| Observación          | Variaciones leves que pueden requerir seguimiento informal |
| Seguimiento          | Tendencia preocupante que requiere seguimiento activo      |
| Atención prioritaria | Patrones de alto riesgo que requieren atención inmediata   |

Los niveles se utilizan como mecanismo de apoyo para que docentes y orientadores puedan identificar estudiantes que requieren mayor atención.

---

## Sistema de alertas

SENT-IA genera alertas automáticamente a partir de los indicadores obtenidos.

| Alerta               | Condición                                                               |
| -------------------- | ----------------------------------------------------------------------- |
| Seguimiento          | Un área permanece en nivel "Seguimiento" durante 2 semanas consecutivas |
| Atención prioritaria | Un área permanece en nivel crítico durante 3 semanas consecutivas       |
| Inactividad          | El estudiante no completa la actividad durante 3 semanas                |
| Bienestar general    | El bienestar general presenta una disminución significativa             |

Las alertas permanecen registradas en el historial incluso después de ser marcadas como revisadas.

---

# Arquitectura

SENT-IA está dividido en dos módulos principales:
┌──────────────────────────────────────────────┐
│ SENT-IA │
│ │
│ Aplicación móvil + Backend │
└──────────────────────┬───────────────────────┘
│
┌─────────▼─────────┐
│ React Native │
│ + Expo │
└─────────┬─────────┘
│
│ Supabase
▼
┌───────────────────┐
│ Supabase │
│ │
│ PostgreSQL │
│ Authentication │
│ Storage │
│ Edge Functions │
└─────────┬─────────┘
│
▼
┌───────────────────┐
│ Motor de análisis │
│ │
│ Meta Llama 3.1 8B │
│ NVIDIA NIM │
│ Indicadores │
│ Tendencias │
│ Alertas │
└───────────────────┘



---

# Stack tecnológico

## Aplicación móvil

- **React Native**
- **Expo**
- **Expo Router**
- **TypeScript**
- **Zustand**
- **React Hook Form**
- **Zod**
- **React Native Reanimated**
- **Expo Image Picker**
- **Expo Print**
- **Expo Sharing**
- **Google Sign-In**

La configuración actual del proyecto utiliza Expo Router como entry point y React Native 0.85.3 junto con Expo SDK 56.

## Backend

- **Supabase**
- **PostgreSQL**
- **Supabase Authentication**
- **Supabase Edge Functions**
- **Supabase Storage**

## Análisis e IA

- **Meta Llama 3.1 8B** (modelo de lenguaje)
- **NVIDIA NIM** (infraestructura de inferencia)
- Análisis de respuestas y generación de indicadores por área.
- Generación del contenido de reportes PDF.
- Clasificación por niveles de seguimiento.
- Análisis de tendencias semanales.
- Sistema de alertas automáticas.

---

# Estructura del proyecto

La estructura principal del repositorio está organizada de la siguiente manera:


SENT-IA/
│
├── .claude/ # Configuración relacionada con Claude
├── .vscode/ # Configuración del editor
│
├── app-mobile/ # Componentes/configuración relacionada
│ # con la aplicación móvil
│
├── assets/ # Recursos gráficos y multimedia
│
├── backend/ # Lógica y funciones del backend
│ ├── cloudflare/
│ └── supabase/
│
├── src/
│ ├── app/ # Rutas y pantallas con Expo Router
│ ├── components/ # Componentes reutilizables
│ ├── constants/ # Constantes de la aplicación
│ ├── hooks/ # Custom hooks
│ ├── lib/ # Configuraciones y utilidades
│ ├── service/ # Servicios y comunicación con backend
│ └── store/ # Estado global con Zustand
│
├── supabase/
│ └── .temp/ # Archivos temporales de Supabase
│
├── app.json # Configuración de Expo
├── eas.json # Configuración de EAS
├── package.json # Dependencias y scripts
├── tsconfig.json # Configuración de TypeScript
├── AGENTS.md
├── CLAUDE.md
├── LICENSE
└── README.md

---

# Autenticación y roles

SENT-IA implementa dos perfiles principales:

         ┌──────────────┐
         │     Login    │
         └──────┬───────┘
                │
   ┌────────────┴────────────┐
   │                         │
   ▼                         ▼
 ┌──────────────┐ ┌──────────────┐
 │  Estudiante  │ │  Docente     │
 └──────┬───────┘ └──────┬───────┘
        │                │
        ▼                ▼
   Actividades         Dashboard
   Historial           Estudiantes
   Perfil              Indicadores
   Alertas
   Reportes




La autenticación se gestiona mediante Supabase Authentication y el sistema diferencia las funcionalidades disponibles según el rol del usuario.

---

# Base de datos

La arquitectura de datos está construida sobre **PostgreSQL mediante Supabase**, con 8 tablas que gestionan las entidades principales del sistema.


Usuarios
│
├── Actividades
│ │
│ └── Situaciones
│ │
│ └── Respuestas
│
├── Indicadores
│
├── Alertas
│
└── Observaciones



### Privacidad

Una de las reglas principales del sistema es que:
> Los docentes no deben acceder a las respuestas individuales de los estudiantes.

En su lugar, reciben los indicadores calculados por el motor de análisis.

---

# Flujo del estudiante
Login
│
▼
Dashboard
│
├───────────────┐
▼ ▼
Estudiantes Alertas
│
▼
Estudiante
│
▼
Reporte individual
│
├── Indicadores
├── Tendencias
├── Observaciones
└── Exportar PDF



---

# Reportes

El sistema genera reportes individuales para docentes con contenido producido por el modelo de lenguaje.

Los reportes incluyen:

- Información del estudiante.
- Indicadores por área.
- Nivel actual.
- Tendencias.
- Observaciones del docente.

Los reportes se generan en formato PDF mediante Expo Print y Expo Sharing.

---

# Privacidad

SENT-IA fue diseñado bajo un principio de **mínima exposición de información sensible**.

El estudiante:

- No puede consultar sus indicadores.
- No puede consultar las alertas generadas.
- No conoce los resultados del análisis.

El docente:

- Puede consultar indicadores.
- Puede consultar tendencias.
- Puede consultar alertas.
- Puede agregar observaciones.
- No puede consultar las respuestas exactas de cada estudiante.

Estas restricciones forman parte del diseño funcional del sistema.

> **Nota:** SENT-IA es una herramienta tecnológica de seguimiento y apoyo. Los indicadores no deben interpretarse como un diagnóstico clínico.

---

# Lógica de indicadores

El motor toma las respuestas de las actividades y las envía al modelo de lenguaje, que las transforma en puntuaciones asociadas a las diferentes áreas.

El flujo conceptual es:

Respuesta
│
▼
Envío a Edge Function
│
▼
Meta Llama 3.1 8B
(NVIDIA NIM)
│
▼
Indicador por área
│
▼
Nivel
│
├── Estable
├── Observación
├── Seguimiento
└── Atención prioritaria
│
▼
Alertas

Posteriormente, los resultados históricos permiten identificar tendencias semana a semana.

---

# Análisis de tendencias

SENT-IA no se limita a observar una única actividad.

El sistema contempla el historial semanal para identificar si un indicador:

- Mejora.
- Se mantiene estable.
- Empeora.

Esto permite que una situación puntual tenga un contexto temporal antes de generar determinados tipos de alerta.

---

# 👨‍💻 Autor

**Juan Pablo Hurtado**

Desarrollador del proyecto SENT-IA.

GitHub: [@JuanPhurtado18](https://github.com/JuanPhurtado18)
