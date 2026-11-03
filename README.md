# Sistema Gastronómico - Carta Digital y Pedidos por WhatsApp

Plataforma SaaS para comercios gastronómicos orientada a resolver pedidos con cero fricción y sin intermediarios:
- **Catálogo público mobile-first** por comercio (`/[storeSlug]`).
- **Personalización dinámica de productos**, modificadores, adicionales y opciones obligatorias/opcionales.
- **Carrito persistente** sincronizado en el dispositivo (`Zustand` + `localStorage`).
- **Checkout seguro y recálculo de precios en el servidor** (`POST /api/orders` con `service_role`).
- **Disparo automático de pedidos formateados a WhatsApp** (`wa.me`).

## Stack Tecnológico

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Server Components, Route Handlers)
- **Lenguaje:** TypeScript estricto
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **Base de datos & Auth:** [Supabase](https://supabase.com/) (PostgreSQL + RLS)
- **Gestión de estado:** [Zustand](https://github.com/pmndrs/zustand)
- **Iconos:** [Lucide React](https://lucide.dev/)

## Configuración y Desarrollo

1. **Clonar repositorio e instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   Copia el archivo `.env.example` como `.env.local` y completa con las credenciales de tu proyecto Supabase:
   ```bash
   cp .env.example .env.local
   ```

3. **Ejecutar en desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

4. **Compilar para producción:**
   ```bash
   npm run build
   ```
