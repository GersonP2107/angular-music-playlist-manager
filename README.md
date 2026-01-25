# Angular Music Playlist Manager

## Descripción del Proyecto
Una aplicación web moderna para gestionar listas de reproducción de música, construida con la última tecnología de **Angular 19+**. Permite a los usuarios autenticarse, crear playlists personalizadas, buscar canciones utilizando la **iTunes Search API**, previsualizar pistas de audio y gestionar el contenido de sus listas.

Diseñada con un enfoque "Pixel Perfect" inspirado en interfaces de streaming líderes (estilo Spotify), priorizando la experiencia de usuario (UX) y una estética "Dark Mode" premium.

## Características Principales
- 🔐 **Autenticación Completa**: Registro e inicio de sesión seguro mediante Supabase Auth.
- 🎵 **Gestión de Playlists**: Crear, editar (con imagen personalizada) y eliminar playlists.
- 🔍 **Búsqueda Avanzada**: Integración con iTunes API para buscar millones de canciones.
- ▶️ **Previsualización de Audio**: Reproducción de previews de 30 segundos directamente en la interfaz.
- 📱 **Diseño Responsivo**: Totalmente adaptado a móviles y escritorio con TailwindCSS.
- 🚀 **Server-Side Rendering (SSR)**: Optimizado para carga inicial rápida y SEO.

## Tecnologías Utilizadas

- **Framework Frontend**: [Angular 19/21](https://angular.dev/) (Standalone Components, Signals, SSR).
- **Estilos**: [TailwindCSS v4](https://tailwindcss.com/) para un diseño rápido, mantenible y responsivo.
- **Backend & Base de Datos**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage).
- **API Musical**: [iTunes Search API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/index.html).
- **Testing**: Vitest.

## Instrucciones de Instalación

### Prerrequisitos
- Node.js (v18 o superior)
- NPM

### Pasos
1. **Clonar el repositorio**:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd angular-music-playlist-manager
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar Variables de Entorno**:
   Crea/Modifica el archivo `src/environments/environment.development.ts` con tus credenciales de Supabase:
   ```typescript
   export const environment = {
     production: false,
     supabase: {
       url: 'TU_SUPA_URL',
       key: 'TU_SUPA_ANON_KEY'
     }
   };
   ```

4. **Ejecutar en Desarrollo**:
   ```bash
   npm start
   # o
   ng serve
   ```
   Abre tu navegador en `http://localhost:4200/`.

## Decisiones de Diseño y Arquitectura

### 1. Standalone Components
Se decidió utilizar **Standalone Components** para modernizar la arquitectura de Angular, eliminando la necesidad de `NgModules`. Esto reduce el "boilerplate", facilita el "Lazy Loading" de rutas y hace que el árbol de dependencias sea mucho más claro y fácil de mantener.

### 2. Supabase como Backend as a Service (BaaS)
Elegido por su rapidez de implementación y potencia.
- **Auth**: Gestión de sesiones segura lista para usar.
- **PostgreSQL**: Base de datos relacional robusta con Row Level Security (RLS) para proteger los datos de usuario.
- **Storage**: Almacenamiento eficiente para las imágenes de portada de las playlists.

### 3. Server-Side Rendering (SSR)
Implementado para mejorar el "First Contentful Paint" (FCP).
- **Desafío**: Las APIs del navegador como `localStorage` o `Audio` no existen en el servidor.
- **Solución**: Uso de `PLATFORM_ID` e inyección de dependencias para ejecutar lógica específica solo en el navegador, y configuración de rutas dinámicas en modo `RenderMode.Server` para evitar errores 404 en recargas.

### 4. Estética y UX
Se optó por **TailwindCSS** para un desarrollo ágil de la interfaz "Dark Mode". Se priorizó el feedback visual (spinners de carga, modales de confirmación en lugar de alertas nativas) para ofrecer una experiencia de usuario fluida y profesional.

### 5. Manejo de Estado
Uso de **Servicios Reactivos** con RxJS para la comunicación con APIs y gestión de datos entre componentes, asegurando que la interfaz siempre refleje el estado actual de la aplicación.
