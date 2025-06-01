<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/tRPC-11-2596BE?style=for-the-badge&logo=trpc&logoColor=white" alt="tRPC" />
  <img src="https://img.shields.io/badge/Prisma-6.0-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</div>

# 🚀 CryptoVault

**Plataforma profesional de gestión de portafolios de criptomonedas con análisis en tiempo real y herramientas avanzadas de trading.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ftu-usuario%2Fcryptovault)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/tu-usuario/cryptovault)

---

## 📸 Captura de la Aplicación

![Captura de CryptoVault](screenshot.png)
*Interfaz principal de CryptoVault mostrando el dashboard con datos en tiempo real*

---

## ✨ Características Principales

### 🎯 **Gestión de Portafolios**
- ✅ **Tracking en tiempo real** de más de 10,000 criptomonedas
- ✅ **Análisis de rendimiento** con métricas avanzadas
- ✅ **Gestión de transacciones** (compra/venta) con historial completo
- ✅ **Cálculo automático** de ganancias, pérdidas y diversificación

### 📊 **Dashboard Inteligente**
- ✅ **Datos en vivo** desde CoinGecko API
- ✅ **Gráficos interactivos** de precios e históricos
- ✅ **Alertas personalizadas** de precios
- ✅ **Watchlists ilimitadas** para seguimiento

### 🛡️ **Tecnología de Vanguardia**
- ✅ **Next.js 15** con App Router y Turbopack
- ✅ **TypeScript** strict para máxima seguridad de tipos
- ✅ **tRPC** para APIs type-safe de extremo a extremo
- ✅ **Tailwind CSS 4.0** con Oxide Engine
- ✅ **Prisma ORM** con PostgreSQL para persistencia robusta

---

## 🚀 Stack Tecnológico

### **Frontend**
- **Framework:** Next.js 15 (App Router, Turbopack, React 19)
- **Lenguaje:** TypeScript 5.0+ (Configuración estricta)
- **Estilos:** Tailwind CSS 4.0 con Oxide Engine
- **Estado:** TanStack Query + tRPC para gestión de estado servidor
- **Componentes:** Arquitectura modular con componentes reutilizables

### **Backend**
- **API:** tRPC v11 con validación Zod
- **Base de datos:** PostgreSQL 15+ con Prisma ORM
- **Autenticación:** NextAuth.js (preparado)
- **APIs externas:** CoinGecko API para datos de mercado

### **DevOps & Deployment**
- **Deployment:** Vercel (recomendado) / Netlify / Docker
- **CI/CD:** GitHub Actions con testing automatizado
- **Monitoreo:** Análisis de performance integrado
- **Seguridad:** Headers de seguridad + validación estricta

---

## 🛠️ Instalación y Configuración

### **Prerrequisitos**
- Node.js 18+ 
- PostgreSQL 15+
- npm/yarn/pnpm

### **1. Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/cryptovault.git
cd cryptovault
```

### **2. Instalar dependencias**
```bash
npm install
```

### **3. Configurar variables de entorno**
```bash
cp .env.example .env
```

Edita `.env` con tus configuraciones:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/cryptovault"
NEXTAUTH_SECRET="tu-secreto-super-seguro"
COINGECKO_API_KEY="tu-api-key-opcional"
```

### **4. Configurar base de datos**
```bash
# Generar cliente Prisma
npm run db:generate

# Ejecutar migraciones
npm run db:migrate

# Poblar con datos de ejemplo (opcional)
npm run db:seed
```

### **5. Ejecutar en desarrollo**
```bash
npm run dev
```

🎉 **Abre [http://localhost:3000](http://localhost:3000) en tu navegador**

---

## 📦 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Construye para producción |
| `npm run start` | Inicia servidor de producción |
| `npm run lint` | Ejecuta linter y correcciones |
| `npm run type-check` | Verifica tipos TypeScript |
| `npm run db:migrate` | Ejecuta migraciones |
| `npm run db:seed` | Pobla la base de datos |
| `npm run db:studio` | Abre Prisma Studio |

---

## 🌍 Deployment

### **Vercel (Recomendado)**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ftu-usuario%2Fcryptovault)

1. Conecta tu repositorio GitHub
2. Configura variables de entorno en Vercel Dashboard
3. ¡Deploy automático en cada push!

### **Netlify**
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/tu-usuario/cryptovault)

### **Docker**
```bash
docker build -t cryptovault .
docker run -p 3000:3000 cryptovault
```

---

## 🗄️ Estructura del Proyecto

```
cryptovault/
├── prisma/                 # Esquemas y migraciones de BD
├── src/
│   ├── app/                # Next.js 15 App Router
│   │   ├── api/            # API Routes con tRPC
│   │   └── globals.css     # Estilos globales Tailwind
│   ├── components/         # Componentes reutilizables
│   │   └── ui/             # Sistema de diseño
│   ├── lib/                # Utilidades y configuraciones
│   │   ├── services/       # Servicios externos (CoinGecko)
│   │   ├── trpc.ts         # Configuración tRPC
│   │   └── utils.ts        # Funciones auxiliares
│   └── server/             # Backend tRPC
│       └── routers/        # Rutas de API organizadas
├── .env.example            # Template de variables
├── Dockerfile              # Containerización
└── vercel.json             # Configuración deployment
```

---

## 🔧 API y Funcionalidades

### **Endpoints principales tRPC**
- `crypto.getTopCoins` - Top criptomonedas del mercado
- `crypto.getCoinDetails` - Detalles específicos de moneda
- `crypto.getGlobalMarketData` - Estadísticas globales del mercado
- `portfolio.create` - Crear nuevo portafolio
- `portfolio.getUserPortfolios` - Obtener portafolios del usuario
- `watchlist.create` - Crear lista de seguimiento

### **Integración CoinGecko**
- ✅ **Rate limiting inteligente** para API gratuita
- ✅ **Fallback data** cuando API no disponible  
- ✅ **Caché optimizado** para minimizar requests
- ✅ **Soporte API Pro** para producción

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. **Fork** el proyecto
2. **Crea** tu feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. **Push** al branch (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

## 👨‍💻 Autor

**Tu Nombre**
- GitHub: [@Piodois](https://github.com/piodois)
- LinkedIn: [Pio Cerda](https://linkedin.com/in/piocerda)

---

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/) por el increíble framework
- [CoinGecko](https://coingecko.com) por la API de datos crypto
- [Vercel](https://vercel.com) por el hosting
- [Tailwind CSS](https://tailwindcss.com) por el sistema de diseño

---

<div align="center">
  <p>Si este proyecto te resulta útil, ¡dale una ⭐!</p>
  
  **[🚀 Ver Demo en Vivo](https://cryptovault.vercel.app)** | **[📖 Documentación](https://github.com/tu-usuario/cryptovault/wiki)**
</div>
