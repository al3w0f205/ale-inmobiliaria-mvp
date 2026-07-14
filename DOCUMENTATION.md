# Documentación Técnica Exhaustiva: Plataforma Inmobiliaria MVP

Este documento constituye la especificación técnica y de arquitectura de software para la plataforma MVP Inmobiliaria. Su propósito es servir como una guía integral para equipos de desarrollo, ingenieros de DevOps y sistemas de inteligencia artificial que requieran comprender, modificar o escalar la aplicación. Se omiten elementos informales para mantener un estándar estrictamente profesional.

---

## 1. Visión General del Sistema y Objetivos de Diseño

La plataforma está diseñada como una aplicación web Full-Stack que permite la intermediación directa entre corredores inmobiliarios (brokers) y clientes potenciales. 

### 1.1. Principios Arquitectónicos
*   **Desacoplamiento Estricto:** Separación total entre el cliente (Frontend React/Next.js) y el servidor (Backend Django API), comunicándose exclusivamente a través de interfaces RESTful JSON.
*   **Inmutabilidad del Entorno:** Todo el ciclo de vida del desarrollo se gestiona a través de Docker y Docker Compose, garantizando que el código se ejecute de manera idéntica en desarrollo, staging y producción.
*   **Diseño Basado en Datos Espaciales:** A diferencia de las plataformas tradicionales que dependen de direcciones de texto, el núcleo de esta aplicación utiliza coordenadas geoespaciales nativas mediante PostGIS, permitiendo consultas de proximidad eficientes a nivel de base de datos.
*   **Rendimiento del Cliente:** Utilización del paradigma *App Router* de Next.js para maximizar el renderizado del lado del servidor (SSR) y minimizar el tamaño del paquete JavaScript (Bundle Size).

---

## 2. Infraestructura y Contenedores (Docker)

El sistema se orquesta mediante un archivo `docker-compose.yml` que define la topología de red local y los volúmenes persistentes.

### 2.1. Definición de Servicios
1.  **`db` (PostgreSQL + PostGIS):**
    *   **Imagen:** `postgis/postgis:15-3.3`.
    *   **Propósito:** Almacenamiento transaccional ACID y motor de consultas geoespaciales.
    *   **Persistencia:** Utiliza un volumen de Docker (`postgres_data`) montado en `/var/lib/postgresql/data` para evitar la pérdida de datos entre reinicios del contenedor.
2.  **`backend` (Django API):**
    *   **Base:** Imagen oficial de Python.
    *   **Comandos de Inicio:** Se ejecuta el servidor de desarrollo `python manage.py runserver 0.0.0.0:8000`.
    *   **Volúmenes:** Se monta el directorio local `./backend` para habilitar el *Hot-Reloading* en desarrollo. Las imágenes de medios estáticos se guardan en un volumen compartido o ruta local.
3.  **`frontend` (Next.js):**
    *   **Base:** Imagen oficial de Node.js.
    *   **Comandos de Inicio:** Instala dependencias (`npm install`) y ejecuta `npm run dev`.
    *   **Puertos:** Expone el puerto `3000` para el acceso al cliente web.

### 2.2. Resolución de Redes Internas
Dentro de la red virtual de Docker (`mvp_network`), los contenedores pueden comunicarse por el nombre del servicio. El frontend utiliza la variable de entorno `INTERNAL_API_URL=http://backend:8000/api` para realizar llamadas directas de servidor a servidor (Server-Side Fetching), reduciendo la latencia al evadir la red del host.

---

## 3. Arquitectura del Frontend (Next.js 14)

El frontend está estructurado para maximizar la velocidad de carga (LCP) y la interactividad (FID), utilizando React 18 y el enrutador de aplicaciones de Next.js.

### 3.1. Gestión de Dependencias
*   `next` (v14): Motor principal.
*   `tailwindcss` (v4 Beta): Motor de estilos procesados Just-In-Time.
*   `react-leaflet` y `leaflet`: Manejo del lienzo de mapas interactivos.
*   `lucide-react`: Sistema tipográfico de iconos vectoriales.
*   `next-themes`: Contexto global para la manipulación del atributo de esquema de color (Dark Mode).

### 3.2. Árbol de Rutas y Componentes (App Router)
*   **`src/app/layout.tsx`:** Contenedor raíz (Root Layout). Inyecta las fuentes tipográficas (Inter), configura los metadatos HTML (SEO base) y envuelve toda la aplicación en el `<ThemeProvider>` para el manejo persistente del modo oscuro.
*   **`src/app/page.tsx` (Ruta: `/`):** Página de aterrizaje pre-renderizada estáticamente. Muestra la propuesta de valor sin requerir hidratación pesada del cliente.
*   **`src/app/properties/page.tsx` (Ruta: `/properties`):** Dashboard interactivo de propiedades.
    *   **Estado (React State):** Maneja los filtros activos (`searchLoc`, `filterType`, `filterPrice`).
    *   **Ciclo de Vida:** Utiliza `useEffect` para consultar la API. *(Nota de refactorización futura: Mover la consulta al servidor usando Server Actions o SWR/React Query para mejor caché).*
    *   **Renderizado Condicional:** Divide la pantalla (Split-Screen) entre la lista de propiedades y el componente de mapa general.
*   **`src/app/property/[id]/page.tsx` (Ruta: `/property/:id`):** Componente de Servidor (`async function PropertyPage`).
    *   **Obtención de Datos:** Realiza un `fetch` a la API interna antes de renderizar la página HTML al cliente, asegurando que los rastreadores web (SEO) lean el contenido de la propiedad.
    *   **Manejo de Errores:** Si el ID no existe, invoca la función `notFound()` de Next.js para renderizar la vista de error 404 estandarizada.
*   **`src/app/login/page.tsx` y `register/page.tsx`:** Rutas de autenticación. Utilizan control de estado de cliente para procesar los formularios y enviar el *payload* JSON al backend, almacenando el JWT resultante en la API de `localStorage`.

### 3.3. Sistema de Diseño y Estilos (Tailwind v4 OKLCH)
El archivo `src/app/globals.css` declara variables CSS nativas utilizando el espacio de color perceptualmente uniforme **OKLCH**.
*   **Jerarquía de Tokens:** Se definen variables base (`--bg`, `--surface`, `--border`, `--brand`).
*   **Modo Oscuro:** La clase CSS `.dark` (inyectada por `next-themes` en el elemento `<html>`) anula estos tokens para invertir la paleta de colores sin necesidad de alterar las clases utilitarias de los componentes de React.

### 3.4. Implementación Geoespacial (Leaflet)
El componente `MapComponent.tsx` es un componente de cliente que encapsula la lógica de `react-leaflet`.
*   **Importación Dinámica:** Dado que Leaflet requiere manipular el objeto `window` (el cual no existe en el contexto del servidor Node.js de Next.js), se importa exclusivamente en tiempo de ejecución del cliente mediante `next/dynamic` (`ssr: false`).
*   **Interacciones (flyTo):** La API de Leaflet se expone mediante manejadores de eventos en los marcadores, calculando distancias focales y ejecutando animaciones CSS del motor del navegador para hacer zoom dinámico a las propiedades.

---

## 4. Arquitectura del Backend (Django y DRF)

El backend opera como un proveedor de servicios sin estado (Stateless), adhiriéndose estrictamente a las convenciones de las APIs RESTful.

### 4.1. Configuración de Core (Settings)
*   **CORS (Cross-Origin Resource Sharing):** Configurado para permitir peticiones desde dominios de frontend (en desarrollo, `localhost:3000`).
*   **Base de Datos:** El motor configurado es `django.contrib.gis.db.backends.postgis`, habilitando el mapeo objeto-relacional (ORM) especializado en geometrías espaciales.
*   **Autenticación:** Las clases de autenticación por defecto de DRF están establecidas en `JWTAuthentication`. Las sesiones por defecto de Django están desactivadas para las rutas de API.

### 4.2. Definición de Modelos Estructurales (`models.py`)
1.  **`User` (Usuario Extendido):** 
    *   Hereda de `AbstractUser`.
    *   Implementa `user_type` con opciones limitadas de base de datos (Choices: `CLIENT`, `BROKER`).
    *   Implementa `phone_number` y validaciones a nivel de modelo para garantizar contacto seguro.
2.  **`Property` (Propiedad Inmobiliaria):**
    *   Relación de llave foránea (ForeignKey) estricta hacia el `User` (Corredor) que la publica (`on_delete=models.CASCADE`).
    *   **Campo Espacial:** `location = models.PointField(geography=True)`. Este campo instruye a PostGIS a realizar cálculos sobre una superficie esférica real (SRID 4326), crucial para cálculos de radio y proximidad exactos.
    *   **Procesamiento de Archivos:** Sobrescribe el método `save()` del ORM. Si se adjunta una nueva imagen a la propiedad, el motor de Django intercepta el binario, carga el módulo `PIL.Image` en memoria, redimensiona el aspecto a un máximo de 1200x800 píxeles por seguridad de ancho de banda, y convierte el formato al contenedor JPEG optimizado antes de emitir la escritura final a disco.
3.  **`Message` (Sistema Telefónico Interno):**
    *   Registro auditable de fecha, remitente, receptor y contenido, permitiendo la construcción del historial de mensajería (Inbox).

### 4.3. Serializadores (`serializers.py`)
La capa de transformación de datos (Serializadores) es responsable de la conversión entre estructuras de datos complejas del ORM (QuerySets y Model Instances) y los tipos de datos nativos de Python (y posteriormente, JSON).
*   **`PropertySerializer`:** Importa y utiliza `GeoFeatureModelSerializer` (o `GeometryField`) de la librería de apoyo `rest_framework_gis`. Esto asegura que el campo `location` de la base de datos se exponga estructurado conforme a la especificación estándar RFC 7946 (GeoJSON).
*   **`BrokerSerializer`:** Sub-serializador anidado dentro de la respuesta de propiedades. Expone el `id`, el `name` y el `phone` del creador de la propiedad sin revelar sus datos confidenciales (como la dirección de correo o hash de contraseña).

### 4.4. Controladores y Rutas (Views y URLs)
La lógica de red de DRF está controlada mediante instancias de `ModelViewSet`.
*   **Control de Acceso (`permissions`):** 
    *   La clase `IsBrokerOrReadOnly` evalúa el nivel de permisos a nivel de objeto y a nivel de vista HTTP. Protege los verbos peligrosos (`POST`, `PUT`, `DELETE`) bloqueando a cualquier entidad que no coincida con el usuario propietario de la llave foránea de la propiedad y que no ostente el rol de `broker`. Los métodos seguros (`GET`, `OPTIONS`) están permitidos a nivel global.
*   **Endpoint de Mensajes (`MessageViewSet`):** El método `get_queryset()` se sobreescribe para prevenir filtraciones de información (Data Leaks). Filtra los resultados del ORM limitándolos al conjunto donde el `request.user` coincide lógicamente con el remitente (`sender`) o el receptor (`receiver`).

---

## 5. Deuda Técnica Actual (Refactorizaciones Requeridas)

Esta sección delimita de manera explícita las áreas arquitectónicas que han sido simplificadas para el alcance del MVP, y que deben ser abordadas para la iteración de producción v1.0.

1.  **Orquestación de Puntos de Interés (POI):**
    *   **Estado Actual:** En `src/components/MapComponent.tsx`, la función `generateMockPOIs()` inyecta ruido matemático a las coordenadas nativas de la propiedad para crear representaciones visuales simuladas de clínicas y transporte público.
    *   **Acción Requerida:** Integración de la API de Overpass (OpenStreetMap) en el servidor Backend. El servidor debe emitir una consulta radial a OSM, decodificar el resultado XML/JSON, parsear los nodos categorizados y enviarlos estructurados al Frontend.
2.  **Sistema Abstracto de Calificaciones (Ratings):**
    *   **Estado Actual:** La UI de Next.js (en `ContactBrokerCard.tsx` y las tarjetas de la grilla principal) inyecta de manera codificada (`hard-coded`) un valor estático de "4.9" estrellas y "(24)" reseñas para la métrica visual.
    *   **Acción Requerida:** Crear un nuevo modelo Django `Review` (User ForeignKey, Rating Integer, Comment Text). El `UserSerializer` debe agregar (Sum/Count) la calificación promedio mediante anotaciones del ORM (`annotate`) para exponer un valor matemático real.
3.  **Seguridad y Transporte de Tokens (JWT):**
    *   **Estado Actual:** El Payload de Autenticación se transfiere al `localStorage` del cliente del navegador web. Si ocurre una vulnerabilidad de *Cross-Site Scripting (XSS)* en dependencias de terceros, los tokens son legibles mediante `window.localStorage`.
    *   **Acción Requerida:** Desplegar el Backend y el Frontend bajo un subdominio común. Modificar la respuesta del token de autenticación para que la capa DRF emita los tokens de acceso y refresco dentro de encabezados de cookies `Set-Cookie` marcados como `HttpOnly`, `Secure` y `SameSite=Lax`. Modificar la lógica de Axios/Fetch en el frontend para incluir credenciales implícitas en las peticiones.
4.  **Integración Formal de Pasarelas (Webhook Flow):**
    *   **Estado Actual:** La estructura transaccional del webhook (`payphone_webhook`) está presente y funcional dentro de `views.py`. Sin embargo, no existe en la UI la llamada para detonar el flujo y emitir el ID de cliente (`clientTxId`) contra la pasarela pública.
    *   **Acción Requerida:** Desarrollo del portal (Dashboard) del corredor para gestionar los planes de pago y detonar la solicitud inicial de compra mediante el componente de integración.

---

## 6. Procedimientos Estándar de Operación y Mantenimiento (SOP)

Instrucciones directas para el manejo rutinario y la resolución de incidentes en el entorno Docker.

### 6.1. Gestión de Estados Corruptos en Next.js
Debido al mecanismo agresivo de compilación persistente en Next.js, si el entorno de desarrollo arroja errores de hidratación de React (`Hydration Mismatch`) o desincronización de contexto (Reference Errors):

```bash
docker-compose stop frontend
# Se eliminan de manera forzosa y recursiva las entidades de caché pre-procesadas.
rm -rf frontend/.next frontend/node_modules/.cache
docker-compose start frontend
```

### 6.2. Verificaciones y Pipeline de Calidad
Antes de autorizar una integración en el control de versiones, se debe validar que no existan discrepancias estrictas en la estructura de tipos del código de cliente:

```bash
docker-compose exec -T frontend npx tsc --noEmit
```

### 6.3. Operaciones de Eschema de Base de Datos
Cada mutación de los modelos estructurales en `models.py` (ej. adición de la tabla Review o cambios en opciones numéricas) requiere sincronizar la estructura relacional subyacente. Se ejecuta:

```bash
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate
```

### 6.4. Análisis de Trazas de Red
Para realizar inspecciones de errores de código interno (Error 500) del backend en tiempo real:

```bash
docker-compose logs --tail=200 -f backend
```

---
*Revisión de Arquitectura: v1.0. (Aprobado para Transferencia Técnica).*
