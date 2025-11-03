# Product Search Frontend

Aplicación web Angular con Material Design para búsqueda y gestión de productos. Interfaz de usuario moderna con autocompletado, paginación y carga de archivos CSV.

## Stack Tecnológico

### Framework y Lenguaje

- Angular: 20.3.0
- TypeScript: 5.x
- Angular CLI: 20.3.2

### UI Components

- Angular Material: 20.2.10
- Angular CDK: 20.2.10
- Material Design Theme: Indigo-Pink

### Características Angular

- Angular SSR (Server-Side Rendering): 20.3.2
- Standalone Components
- Signal-based architecture
- Reactive Forms
- HttpClient con interceptors

### Herramientas

- Express: 5.1.0 (SSR server)
- RxJS: 7.8.0 (Programación reactiva)
- Karma: 6.4.0 (Testing)
- Jasmine: 5.9.0 (Testing framework)

## Arquitectura

### Estructura de Directorios

```
pf-bases-II-frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── search/
│   │   │       ├── search.component.ts      # Componente de búsqueda
│   │   │       ├── search.component.html    # Template
│   │   │       └── search.component.css     # Estilos
│   │   ├── services/
│   │   │   └── product.service.ts           # Servicio HTTP
│   │   ├── models/
│   │   │   └── product.model.ts             # Modelos de datos
│   │   ├── interceptors/
│   │   │   └── timeout.interceptor.ts       # HTTP timeout
│   │   ├── app.component.ts                 # Componente raíz
│   │   ├── app.config.ts                    # Configuración app
│   │   ├── app.config.server.ts             # Configuración SSR
│   │   └── app.routes.ts                    # Definición de rutas
│   ├── environments/
│   │   ├── environment.ts                   # Desarrollo
│   │   └── environment.prod.ts              # Producción
│   ├── main.ts                              # Bootstrap client
│   ├── main.server.ts                       # Bootstrap server
│   └── server.ts                            # Express SSR server
├── public/                                  # Assets estáticos
├── angular.json                             # Configuración Angular
├── tsconfig.json                            # Configuración TypeScript
└── Dockerfile                               # Imagen de producción
```

### Componentes

**SearchComponent**

- Búsqueda de productos con autocompletado
- Paginación de resultados
- Display de productos en tarjetas Material
- Upload de archivos CSV
- Gestión de estado de carga

### Servicios

**ProductService**

- `search(query, page, limit)`: Búsqueda paginada de productos
- `getSuggestions(prefix, limit)`: Autocompletado de búsqueda
- `loadData()`: Carga de datos en índice
- `getStats()`: Estadísticas del sistema
- `uploadCSV(file)`: Upload de archivo CSV

### Modelos de Datos

**Product**

```typescript
{
  _id: string,
  id: number,
  title: string,
  brand: string,
  category: string,
  product_type: string,
  description: string,
  price: number,
  currency: string,
  stock: number,
  sku: string,
  rating: number,
  created_at: Date
}
```

**SearchResult**

```typescript
{
  products: Product[],
  total: number,
  page: number,
  limit: number,
  totalPages: number
}
```

### Interceptors

**TimeoutInterceptor**

- Timeout global de 30 segundos para peticiones HTTP
- Manejo de errores de timeout
- Retry logic (opcional)

## Configuración

### Variables de Entorno

**environment.ts** (Desarrollo)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
};
```

**environment.prod.ts** (Producción)

```typescript
export const environment = {
  production: true,
  apiUrl: 'http://localhost:3000',
};
```

### Configuración de Proxy (Desarrollo)

Crear `proxy.conf.json` en la raíz:

```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": {
      "^/api": ""
    }
  }
}
```

Ejecutar con proxy:

```bash
ng serve --proxy-config proxy.conf.json
```

## Instalación y Ejecución

### Requisitos Previos

- Node.js: 20.x
- npm: 10.x
- Angular CLI: 20.3.2

Instalar Angular CLI globalmente:

```bash
npm install -g @angular/cli@20.3.2
```

### Opción 1: Modo Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
ng serve

# Abrir en navegador
# http://localhost:4200
```

### Opción 2: Build de Producción (Local)

```bash
# Build optimizado
ng build

# Servir build con SSR
npm run serve:ssr:pf-bases-II-frontend
```

### Opción 3: Docker

```bash
# Build de imagen
docker build -t pf-frontend .

# Ejecutar contenedor
docker run -p 4200:80 pf-frontend
```

### Opción 4: Docker Compose (Full Stack)

```bash
# Desde directorio backend
cd ../pf-bases-II-backend
docker-compose up -d

# Frontend disponible en http://localhost:4200
```

## Scripts Disponibles

```bash
ng serve              # Servidor desarrollo (puerto 4200)
ng build              # Build de producción
ng test               # Ejecutar tests unitarios
ng generate           # Generar componentes/servicios
npm run serve:ssr     # Servidor SSR
```

## Características de la Interfaz

### Búsqueda de Productos

- Campo de búsqueda con autocompletado en tiempo real
- Debounce de 300ms para optimizar peticiones
- Resultados mostrados en tarjetas Material Design
- Información detallada: título, marca, categoría, precio, stock, rating

### Paginación

- Navegación por páginas de resultados
- Configuración de items por página (10, 20, 50, 100)
- Indicadores de página actual y total
- Botones de navegación (Primera, Anterior, Siguiente, Última)

### Upload de Archivos

- Drag and drop de archivos CSV
- Validación de tipo de archivo
- Progress bar durante upload
- Feedback de éxito/error

### Gestión de Estado

- Loading spinners durante operaciones
- Mensajes de error descriptivos
- Estado vacío cuando no hay resultados
- Indicadores de carga de datos

## Optimizaciones

### Rendimiento

- Lazy loading de rutas
- OnPush change detection strategy
- Virtual scrolling para listas grandes
- Image lazy loading
- Tree-shaking en build de producción

### Bundle Size

- Budget inicial: 1MB
- Budget por componente: 8KB
- Code splitting automático
- Compression gzip habilitada

### SEO y SSR

- Server-Side Rendering habilitado
- Meta tags dinámicos
- Pre-rendering de rutas estáticas
- Tiempo de carga optimizado

## Deployment

### Build de Producción

```bash
ng build --configuration production
```

Output en `dist/pf-bases-II-frontend/`:

- `browser/`: Archivos estáticos del cliente
- `server/`: Archivos del servidor SSR

### Nginx (Producción)

Configuración incluida en `nginx.conf`:

- Serving de archivos estáticos
- Proxy pass a backend API
- Gzip compression
- Cache headers
- Fallback a index.html para SPA routing

### Variables de Entorno en Docker

Build con variables:

```bash
docker build --build-arg API_URL=http://api.example.com -t pf-frontend .
```

## Troubleshooting

### Puerto 4200 ocupado

```bash
ng serve --port 4300
```

### Limpiar caché de npm

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Rebuild completo

```bash
ng build --configuration production --delete-output-path
```
