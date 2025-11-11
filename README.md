# 🛰️ Monitoreo de Red con Kafka y Next.js

Proyecto desarrollado para la materia **Programación Avanzada**, cuyo objetivo es **simular y monitorear el estado de una red en tiempo real**, utilizando **Apache Kafka**, **Node.js** y **Next.js (React)**.

El sistema genera eventos simulados de red (nodos que cambian de estado), los procesa en un servidor Node.js y los muestra dinámicamente en una interfaz web.

---

## 🚀 Tecnologías utilizadas

- **Node.js** – Entorno de ejecución de JavaScript.  
- **Express.js** – Servidor backend para manejar eventos y sockets.  
- **Apache Kafka** – Simulador de flujo de mensajes (productor/consumidor).  
- **Next.js** – Framework de React para el frontend.  
- **Socket.io** – Comunicación en tiempo real entre backend y frontend.  
- **TypeScript** – Tipado estático para mayor seguridad en el código.  
- **Recharts** – Biblioteca para gráficos y visualización de datos.  
- **CSS Modules** – Estilos modernos y adaptables.

---

## ⚙️ Instalación

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/AlexanderGBordaa/MonitoreoRed-Kafka-Next.js.git
cd MonitoreoRed-Kafka-Next.js
```

### 2️⃣ Instalar dependencias del backend
```bash
npm install
```

### 3️⃣ Instalar dependencias del frontend
```bash
cd frontend
npm install
cd ..
```

---

## ▶️ Ejecución

### 🔹 Paso 1: Iniciar el simulador Kafka
```bash
node kafka_simulator.js
```

### 🔹 Paso 2: Iniciar el servidor backend
```bash
node server.js
```

### 🔹 Paso 3: Iniciar el frontend
```bash
cd frontend
npm run dev
```

📍 Luego abrí el navegador en  
👉 [http://localhost:3000](http://localhost:3000)

---

## 🧠 Cómo probar el sistema

Una vez en el navegador:
1. El **simulador Kafka** comienza a generar mensajes aleatorios que representan nodos de red.  
2. El **servidor Node.js** recibe esos mensajes y los reenvía a los clientes conectados mediante WebSockets.  
3. El **frontend Next.js** actualiza automáticamente la interfaz con el estado actual de cada nodo:
   - 🟢 **Online** – Nodo operativo.  
   - 🟡 **Degraded** – Nodo con rendimiento bajo.  
   - 🔴 **Offline** – Nodo fuera de servicio.  

---

## 📁 Estructura completa del proyecto

```
MonitoreoRed-Kafka-Next.js/
│
├── kafka_simulator.js          # Simulador de eventos Kafka (backend)
├── server.js                    # Servidor Express + Socket.io (backend)
│
├── frontend/                    # Aplicación Next.js (frontend)
│   ├── app/
│   │   ├── layout.tsx          # Layout principal de la aplicación
│   │   └── page.tsx             # Página principal del dashboard
│   │
│   ├── components/              # Componentes React reutilizables
│   │   ├── node-card.tsx       # Tarjeta individual de cada nodo
│   │   ├── stats-overview.tsx  # Panel de estadísticas generales
│   │   ├── latency-chart.tsx   # Gráfico de latencia en tiempo real
│   │   └── event-log.tsx       # Registro de eventos y alarmas
│   │
│   ├── lib/                     # Utilidades y tipos
│   │   ├── types.ts             # Definiciones TypeScript
│   │   └── kafka-simulator.ts   # Cliente Kafka para el frontend
│   │
│   ├── styles/                  # Estilos globales
│   │   └── globals.css          # CSS global de la aplicación
│   │
│   ├── package.json             # Dependencias del frontend
│   ├── tsconfig.json            # Configuración TypeScript
│   ├── next.config.js           # Configuración de Next.js
│   └── next-env.d.ts            # Tipos de Next.js
│
└── README.md                    # Este archivo
```

---

## 📜 Explicación detallada de cada archivo y carpeta

### 🔹 **Backend (Raíz del proyecto)**

#### `kafka_simulator.js`
**Propósito:** Simula un sistema de mensajería tipo Kafka que genera eventos aleatorios de red.

**Funcionalidad:**
- Clase `KafkaSimulator` que imita el comportamiento de Apache Kafka
- Genera eventos aleatorios cada 800-1500ms (configurable)
- Crea 4 tipos de eventos:
  - **Métricas de latencia:** valores entre 50-500ms
  - **Métricas de conexiones:** valores entre 0-200 conexiones
  - **Cambios de estado:** `online`, `degraded`, `offline`
  - **Alarmas:** eventos críticos con severidad (info, warning, critical)
- Implementa patrón Publisher-Subscriber para notificar eventos
- Métodos principales:
  - `start()`: Inicia la generación de eventos
  - `stop()`: Detiene la generación
  - `subscribe(cb)`: Permite suscribirse a eventos
  - `publish(event)`: Publica un evento a todos los suscriptores

**Cómo funciona:**
1. Se inicializa con una lista de IDs de nodos
2. Cada cierto intervalo aleatorio, selecciona un nodo al azar
3. Genera un tipo de evento aleatorio según probabilidades:
   - 5% alarmas
   - 30% métricas de latencia
   - 35% métricas de conexión
   - 30% cambios de estado
4. Publica el evento a todos los suscriptores

---

#### `server.js`
**Propósito:** Servidor backend que actúa como intermediario entre el simulador Kafka y el frontend.

**Funcionalidad:**
- Crea un servidor HTTP con Express
- Configura Socket.io para comunicación en tiempo real
- Inicializa 5 nodos de red con estados aleatorios
- Se conecta al simulador Kafka y reenvía eventos al frontend
- Mantiene el estado actualizado de todos los nodos
- Actualiza métricas periódicamente (cada 1 segundo)
- Expone endpoint REST: `GET /api/nodes` para obtener estado actual

**Flujo de datos:**
1. Inicializa nodos con estado inicial `online`
2. Crea instancia de `KafkaSimulator` y se suscribe a eventos
3. Cuando recibe un evento de Kafka, lo enriquece con el nombre del nodo y lo emite vía Socket.io
4. Cada segundo, actualiza métricas de todos los nodos (latencia, conexiones, estado)
5. Emite eventos `event` y `kafka_event` a todos los clientes conectados
6. Cuando un cliente se conecta, envía un `snapshot` con el estado actual

**Eventos Socket.io emitidos:**
- `snapshot`: Estado inicial cuando un cliente se conecta
- `event`: Eventos de métricas actualizadas periódicamente
- `kafka_event`: Eventos generados por el simulador Kafka

---

### 🔹 **Frontend (`frontend/`)**

#### `app/layout.tsx`
**Propósito:** Layout raíz de la aplicación Next.js.

**Funcionalidad:**
- Define la estructura HTML base
- Importa estilos globales (`globals.css`)
- Configura metadatos de la página (título)
- Envuelve todas las páginas con el layout común

---

#### `app/page.tsx`
**Propósito:** Página principal del dashboard de monitoreo.

**Funcionalidad:**
- Componente principal que orquesta toda la interfaz
- Se conecta al servidor backend mediante Socket.io
- Maneja el estado global de:
  - `nodes`: Estado de todos los nodos
  - `alarms`: Lista de alarmas activas
  - `logs`: Registro de eventos en tiempo real
  - `latencyData`: Datos históricos de latencia para gráficos
- Escucha eventos del servidor:
  - `snapshot`: Recibe estado inicial al conectar
  - `event`: Actualiza métricas de nodos
  - `kafka_event`: Procesa eventos del simulador Kafka
- Calcula estadísticas agregadas (nodos activos, latencia media, etc.)
- Renderiza todos los componentes del dashboard

**Flujo de trabajo:**
1. Al montar el componente, establece conexión Socket.io
2. Recibe `snapshot` con estado inicial
3. Escucha eventos continuamente y actualiza el estado
4. Cuando recibe un evento:
   - Si es `alarm`: lo agrega a la lista de alarmas
   - Si es `metric`: actualiza el estado del nodo correspondiente
5. Re-renderiza la UI automáticamente cuando cambia el estado

---

#### `components/node-card.tsx`
**Propósito:** Componente que muestra la información de un nodo individual.

**Funcionalidad:**
- Renderiza una tarjeta visual para cada nodo
- Muestra:
  - Nombre del nodo
  - Estado actual (online/degraded/offline) con color correspondiente
  - Latencia en milisegundos
  - Número de conexiones activas
  - Timestamp de última actualización
  - Alarma activa (si existe)
- Colores dinámicos según estado:
  - 🟢 Verde (`#4ade80`) para `online`
  - 🟡 Amarillo (`#fbbf24`) para `degraded`
  - 🔴 Rojo (`#f87171`) para `offline`

---

#### `components/stats-overview.tsx`
**Propósito:** Panel de estadísticas generales del sistema.

**Funcionalidad:**
- Muestra 4 métricas clave en tarjetas:
  1. **Nodos activos:** Cantidad de nodos que no están offline
  2. **Latencia media:** Promedio de latencia de todos los nodos
  3. **Conexiones totales:** Suma de todas las conexiones activas
  4. **Alarmas activas:** Cantidad de alarmas en el sistema
- Recibe las estadísticas calculadas desde `page.tsx`
- Diseño responsive con grid layout

---

#### `components/latency-chart.tsx`
**Propósito:** Gráfico de líneas que muestra la evolución de la latencia en tiempo real.

**Funcionalidad:**
- Utiliza la biblioteca Recharts para renderizar gráficos
- Muestra una línea por cada nodo con color único
- Actualiza automáticamente cuando llegan nuevos datos de latencia
- Mantiene los últimos 20 puntos de datos por nodo
- Incluye:
  - Ejes X (tiempo) e Y (latencia en ms)
  - Grid de fondo
  - Tooltip interactivo
  - Leyenda con colores por nodo
- Paleta de colores: azul, amarillo, verde, rojo, púrpura, rosa

---

#### `components/event-log.tsx`
**Propósito:** Panel que muestra el registro de eventos y alarmas.

**Funcionalidad:**
- Dividido en dos secciones:
  1. **Log de eventos:** Muestra todos los eventos del sistema en tiempo real
     - Formato: `[HH:MM:SS] Mensaje del evento`
     - Estilo tipo terminal (fondo oscuro, texto verde)
     - Scroll automático, máximo 200 eventos
  2. **Lista de alarmas:** Muestra las últimas 50 alarmas
     - Iconos según severidad:
       - ⛔ Crítico (rojo)
       - ⚠️ Advertencia (amarillo)
       - ℹ️ Info (azul)
     - Muestra: tipo, nodo, descripción y timestamp
- Actualización en tiempo real cuando llegan nuevos eventos

---

#### `lib/types.ts`
**Propósito:** Definiciones de tipos TypeScript para garantizar consistencia de datos.

**Funcionalidad:**
- Define 4 tipos principales:
  1. **`NodeState`:** Estado completo de un nodo
     - `id`, `name`, `state`, `connections`, `latency`, `lastUpdated`
  2. **`MetricEvent`:** Evento de métrica (latencia, conexiones, estado)
     - `type: 'metric'`, `timestamp`, `nodeId`, `nodeName`, etc.
  3. **`AlarmEvent`:** Evento de alarma
     - `type: 'alarm'`, `severity`, `reason`, `description`, etc.
  4. **`KafkaEvent`:** Unión de tipos (MetricEvent | AlarmEvent)
- Permite autocompletado y validación de tipos en el IDE
- Previene errores de tipo en tiempo de desarrollo

---

#### `lib/kafka-simulator.ts`
**Propósito:** Cliente Kafka para el frontend (actualmente no se usa directamente, pero está disponible).

**Funcionalidad:**
- Clase `KafkaClient` que encapsula la conexión Socket.io
- Métodos:
  - `connect()`: Establece conexión con el servidor
  - `disconnect()`: Cierra la conexión
  - `subscribe(cb, opts)`: Suscribe callbacks a eventos específicos
- Filtra eventos por tipo si se especifica
- Exporta una instancia singleton del cliente

---

#### `styles/globals.css`
**Propósito:** Estilos CSS globales para toda la aplicación.

**Funcionalidad:**
- Define estilos base:
  - Altura completa para html, body y #__next
  - Fuente del sistema (Inter, sistema, Segoe UI, etc.)
  - Fondo oscuro (`#0f0f0f`) y texto claro (`#e0e0e0`)
  - Sin márgenes por defecto
- Tema oscuro consistente en toda la aplicación

---

#### `package.json` (frontend)
**Propósito:** Configuración y dependencias del proyecto frontend.

**Dependencias principales:**
- `next`: Framework React con SSR
- `react` y `react-dom`: Biblioteca React
- `recharts`: Gráficos y visualizaciones
- `socket.io-client`: Cliente Socket.io para comunicación en tiempo real
- `typescript`: Tipado estático
- `@types/react`: Tipos TypeScript para React

**Scripts:**
- `npm run dev`: Inicia servidor de desarrollo
- `npm run build`: Compila para producción
- `npm start`: Inicia servidor de producción

---

#### `tsconfig.json`
**Propósito:** Configuración del compilador TypeScript.

**Funcionalidad:**
- Target: ES2020
- Módulos: ESNext
- JSX: preserve (Next.js maneja la transformación)
- Incluye tipos de DOM y ESNext
- Configuración para Next.js con plugin específico

---

#### `next.config.js`
**Propósito:** Configuración personalizada de Next.js.

**Funcionalidad:**
- Configura webpack para resolver fallbacks:
  - `supports-color`, `bufferutil`, `utf-8-validate`: false
- Necesario para evitar errores con dependencias nativas en el navegador

---

## 🔄 Flujo completo del sistema

### 1. **Inicialización**
```
kafka_simulator.js → Genera eventos aleatorios
         ↓
server.js → Recibe eventos y actualiza estado de nodos
         ↓
Socket.io → Transmite eventos a clientes conectados
         ↓
frontend/page.tsx → Recibe eventos y actualiza UI
```

### 2. **Ciclo de eventos**
1. **Kafka Simulator** genera un evento aleatorio cada 800-1500ms
2. **Server.js** recibe el evento y:
   - Actualiza el estado del nodo correspondiente
   - Enriquece el evento con información adicional
   - Emite el evento vía Socket.io a todos los clientes
3. **Frontend** recibe el evento y:
   - Actualiza el estado local del nodo
   - Si es alarma, la agrega a la lista
   - Actualiza los gráficos y estadísticas
   - Re-renderiza los componentes afectados

### 3. **Actualización periódica**
- Cada 1 segundo, `server.js` actualiza métricas de todos los nodos:
  - Cambia estados probabilísticamente (online ↔ degraded ↔ offline)
  - Ajusta latencia según el estado
  - Varía el número de conexiones
  - Emite eventos de actualización

### 4. **Visualización**
- Los componentes React se actualizan automáticamente cuando cambia el estado
- `StatsOverview` recalcula estadísticas agregadas
- `LatencyChart` agrega nuevos puntos de datos
- `NodeCard` muestra el estado actualizado con colores
- `EventLog` registra todos los eventos en tiempo real

---

## 🧩 Conceptos clave del proyecto

### **Arquitectura**
- **Backend:** Node.js + Express + Socket.io
- **Simulador:** Clase personalizada que imita Kafka
- **Frontend:** Next.js (React) con TypeScript
- **Comunicación:** WebSockets bidireccionales (Socket.io)

### **Patrones de diseño utilizados**
- **Publisher-Subscriber:** Kafka Simulator publica eventos, múltiples suscriptores escuchan
- **Singleton:** Cliente Kafka en frontend
- **Component-based:** Arquitectura React con componentes reutilizables
- **State Management:** React Hooks (useState, useEffect)

### **Estados de nodos**
- **Online:** Nodo funcionando correctamente (verde)
- **Degraded:** Nodo con rendimiento reducido (amarillo)
- **Offline:** Nodo fuera de servicio (rojo)

### **Tipos de eventos**
- **Métricas:** Latencia, conexiones, cambios de estado
- **Alarmas:** Eventos críticos con severidad (info, warning, critical)

---

## 🎯 Características principales

✅ **Monitoreo en tiempo real** de múltiples nodos de red  
✅ **Visualización gráfica** de latencia histórica  
✅ **Sistema de alarmas** con diferentes niveles de severidad  
✅ **Actualización automática** sin necesidad de recargar  
✅ **Interfaz moderna** con tema oscuro  
✅ **Tipado fuerte** con TypeScript  
✅ **Arquitectura escalable** y modular  

---

## 🔧 Configuración avanzada

### Variables de entorno
- `PORT`: Puerto del servidor backend (default: 4000)
- `USE_KAFKA_SIMULATOR`: Activar/desactivar simulador (default: 'true')

### Personalización
- Modificar `NODES` en `server.js` para cambiar cantidad de nodos
- Ajustar intervalos en `kafka_simulator.js` para cambiar frecuencia de eventos
- Modificar probabilidades de eventos en `_tick()` del simulador

---

## 👨‍💻 Autor

**Alexander G. Borda**  
Licenciatura en Sistemas — 3er Año
Ultimo año de Analista en Sistemas
Materia: **Programación Avanzada**

📎 [Repositorio en GitHub](https://github.com/AlexanderGBordaa/MonitoreoRed-Kafka-Next.js)

---

## 📝 Notas adicionales

- El proyecto utiliza un **simulador de Kafka** en lugar de Kafka real para facilitar la ejecución sin dependencias externas
- Todos los datos son **simulados** y se generan aleatoriamente
- El sistema está diseñado para ser **educativo** y demostrar conceptos de sistemas distribuidos y tiempo real
- La arquitectura puede extenderse fácilmente para usar Kafka real conectando a un cluster de Kafka

