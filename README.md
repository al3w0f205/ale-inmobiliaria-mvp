# Marketplace Inmobiliario MVP

Este repositorio contiene el Producto Minimo Viable (MVP) para la plataforma de marketplace e intermediacion inmobiliaria. El sistema esta estructurado con un backend robusto en Django y un frontend moderno con Next.js, completamente contenedorizados usando Docker.

---

## 1. Arquitectura del Sistema

La arquitectura de la plataforma esta diseñada para desacoplar el renderizado y las interacciones del cliente (Next.js) de la persistencia de datos y logica de negocio (Django REST Framework), comunicandose a traves de una red interna en Docker y consultas REST sobre HTTPS.

### Diagrama de Arquitectura General

```mermaid
graph TD
    User([Usuario / Navegador]) -->|HTTPS / WSS| Frontend[Client Next.js 14]
    Frontend -->|API Gateway / Proxy| Backend[Server Django / Daphne]
    Backend -->|Canales / Redis Layers| Redis[Cache & Broker Redis]
    Backend -->|Transacciones ACID / Geo| DB[(PostgreSQL + PostGIS)]
    Backend -.->|Almacenamiento Local| Media[Volumen Media / Archivos]
```

---

## 2. Diagramas de Flujo Clave

### Flujo de Publicacion de una Propiedad con Cache y Optimizacion

Este flujo detalla como se procesa y optimiza una imagen en el backend al subirla, y como se gestiona la consistencia de la cache de Redis reactivamente para que los listados siempre esten actualizados.

```mermaid
sequenceDiagram
    autonumber
    Broker->>Frontend: Sube datos de propiedad + Imagen (RAW)
    Frontend->>Backend: POST /api/properties/ (JSON + Multi-part form)
    Note over Backend: El middleware valida JWT en Cookie HttpOnly
    Backend->>Backend: Intercepta imagen en save() (Pillow)
    Backend->>Backend: Convierte a RGB, escala a max 1200x800 y comprime a JPEG (Calidad 75)
    Backend->>DB: Guarda registro e inserta coordenadas en tabla PostGIS
    Backend->>Redis: Invalida cache de consultas GET (cache.clear())
    Backend-->>Frontend: Retorna status 201 Created + GeoJSON de la propiedad
    Frontend-->>Broker: Muestra propiedad creada y recarga mapa/lista
```

### Flujo de Autenticacion Segura mediante JWT con Cookies

El sistema de autenticacion prescinde del almacenamiento de JWT en LocalStorage para evitar vulnerabilidades XSS, utilizando en su lugar cookies seguras configuradas desde el backend.

```mermaid
sequenceDiagram
    autonumber
    User->>Frontend: Ingresa credenciales (Login)
    Frontend->>Backend: POST /api/token/ (Username / Password)
    Backend->>Backend: Valida credenciales y genera tokens JWT
    Backend->>Backend: Configura Cookies: 'access' (HttpOnly, SameSite, Secure) y 'refresh'
    Backend-->>Frontend: Retorna Status 200 OK (sin tokens en el body de respuesta)
    Note over Frontend: El estado del usuario se sincroniza llamando a /api/auth/me/
```

---

## 3. Funcionalidades del MVP

*   **Busquedas Geoespaciales:** Utiliza coordenadas en formato WGS 84 (SRID 4326) integradas con mapas interactivos de Leaflet (importados dinamicamente para evitar errores de renderizado en el lado del servidor).
*   **Procesamiento Inteligente de Media:** Compresion reactiva de imagenes a formato JPEG en el momento de la persistencia para optimizar el ancho de banda y la velocidad de carga de las tarjetas de propiedades.
*   **Suscripciones e Integracion de Pagos:** Soporte para pasarela Payphone (tarjetas) y administracion de metodos de pago manuales (DeUna / Transferencias bancarias) con flujo de aprobacion administrativa en el panel de control.
*   **Mensajeria en Tiempo Real:** Historial de mensajeria directa entre brokers y clientes potenciales integrada de forma nativa en la base de datos con control estricto de privacidad.

---

## 4. Decisiones de Diseño: Pros y Contras

### Next.js App Router (SSR) vs. React Single Page App (SPA)
*   **Pros:**
    *   Indexacion automatica por motores de busqueda (SEO) ideal para un portal de propiedades publico.
    *   Mayor velocidad de carga inicial (FCP y LCP) mediante Server-Side Rendering (SSR).
*   **Contras:**
    *   Mayor complejidad en el manejo de dependencias de cliente que utilizan la API de `window` (como Leaflet, requiriendo importaciones dinamicas).
    *   Curva de aprendizaje mas pronunciada para la gestion de layouts y estados de servidor.

### Cache Redis Nativo en Django vs. Consultas Directas a DB
*   **Pros:**
    *   Reduce drasticamente la carga en PostgreSQL al cachear consultas de busqueda de propiedades repetitivas.
    *   Tiempos de respuesta inferiores a los 10ms en lecturas concurrentes.
*   **Contras:**
    *   Complejidad adicional al tener que manejar la invalidacion de cache manual en cada mutacion (`create`, `update`, `delete`).
    *   Consumo de memoria RAM adicional por parte del servicio Redis.

### Almacenamiento Local de Media vs. Almacenamiento en la Nube (S3 / GCS)
*   **Pros:**
    *   Facilidad de desarrollo y configuracion inicial sin costos adicionales.
    *   Acceso directo e instantaneo para procesamiento y manipulacion de imagenes en memoria de contenedor.
*   **Contras:**
    *   Dificulta la escalabilidad horizontal (requiere volumenes distribuidos si hay multiples instancias de contenedores backend).
    *   Riesgo de perdida de datos si los volumenes locales no estan respaldados de forma externa.

---

## 5. Guia de Inicio Rapido

### Requisitos Previos
*   Docker y Docker Compose
*   Node.js (para desarrollo local sin contenedores)
*   Python 3.11 (para desarrollo local sin contenedores)

### Levantar la Plataforma Completa
Para ejecutar toda la plataforma (Base de datos PostgreSQL, Redis, Django y Next.js) ejecute:

```bash
docker-compose up --build
```

### Ejecutar Pruebas Automatizadas
Para correr el conjunto de pruebas unitarias y de integracion del backend:

```bash
docker-compose exec backend python manage.py test
```

### Validacion de TypeScript
Para verificar que no existan errores de tipos en el codigo del frontend antes de realizar un despliegue:

```bash
docker-compose exec frontend npx tsc --noEmit
```
