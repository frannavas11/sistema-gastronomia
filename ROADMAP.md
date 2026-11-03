# Roadmap de Desarrollo - Plataforma Gastronómica

## Fase 1: Setup, Modelado y Seguridad (Supabase)
- [x] Inicializar proyecto Next.js (App Router, TypeScript, Tailwind CSS, Lucide Icons).
- [x] Ejecutar script SQL de tablas en Supabase incorporando `owner_id REFERENCES auth.users(id)` en `stores`.
- [x] Configurar buckets en Supabase Storage para logos e imágenes de productos (lectura pública).
- [x] Configurar políticas RLS: lectura pública de catálogos y permisos de edición solo para `owner_id = auth.uid()`.
- [x] Generar definiciones de tipos TypeScript para Supabase (`types/supabase.ts`).

## Fase 2: Carta Pública Mobile-First (`/[storeSlug]`)
- [x] Crear Server Component en `src/app/(public)/[storeSlug]/page.tsx` para fetching de datos del local y productos.
- [x] Inyectar variables CSS personalizadas según `theme_colors` del comercio.
- [x] Implementar componentes visuales:
  - Header compacto (logo, nombre, estado abierto/cerrado, banner).
  - Barra horizontal de categorías (pills con scroll táctil).
  - Listado vertical de productos con badge de "Agotado".
- [x] Implementar modal de producto para selección de modificadores/adicionales y notas.

## Fase 3: Estado del Carrito y Checkout
- [x] Crear store con Zustand para gestión de ítems seleccionados y persistencia local.
- [x] Implementar barra flotante inferior del carrito (`[Ver pedido (X) - $Total Estimado]`).
- [x] Desarrollar pantalla/modal de checkout:
  - Selector de método de entrega: Envío a domicilio o Retiro en local.
  - Validación de campos requeridos: Nombre, Teléfono, Dirección (si aplica).
  - Selector de método de pago: Efectivo, Transferencia, Mercado Pago.
  - Campo de aclaraciones para la cocina.

## Fase 4: Persistencia Segura y Disparo a WhatsApp
- [x] Desarrollar Route Handler `/api/orders`:
  - Recibe array de productos seleccionados y opciones.
  - Consulta precios reales en la base de datos usando `SUPABASE_SERVICE_ROLE_KEY`.
  - Calcula subtotales, aplica costo de envío si corresponde e inserta en `orders` y `order_items` con estado `pending`.
  - Devuelve el ID público del pedido (`order_id`).
- [x] Construir función formateadora del texto legible para WhatsApp (`buildWhatsAppUrl`).
- [x] Integrar apertura de `wa.me` tras la respuesta 200 de la API.
- [x] Diseñar pantalla final: confirmación limpia informando que el pedido fue enviado y debe ser confirmado por el local.

## Fase 5: Panel de Administración Rápido (`/admin`)
- [x] Flujo de autenticación con Supabase Auth para dueños de local (`/admin/login`).
- [x] Layout protegido (`/admin/(dashboard)/layout.tsx`) con verificación de sesión y Sidebar responsive (Dashboard, Pedidos, Menú, Configuración).
- [x] Dashboard base (`/admin/(dashboard)/page.tsx`) con detalle del usuario autenticado, métricas rápidas y cierre de sesión seguro.
- [x] Middleware (`middleware.ts`) configurado para interceptar `/admin/*` y proteger rutas privadas.
- [x] Panel de control operativo completo:
  - [x] Switch maestro de local "Abierto / Cerrado" ([`StoreStatusToggle.tsx`](src/components/admin/StoreStatusToggle.tsx)) con actualización en tiempo real.
  - [x] Lista y gestión de menú ([`/admin/menu`](src/app/admin/(dashboard)/menu/page.tsx)) con toggle directo "Disponible / Agotado" ([`ProductAvailabilityToggle.tsx`](src/components/admin/ProductAvailabilityToggle.tsx)).
  - [x] Editor rápido de precios base inline ([`QuickPriceEditor.tsx`](src/components/admin/QuickPriceEditor.tsx)).
  - [x] Modal para dar de alta nuevas categorías y productos ([`CreateProductModal.tsx`](src/components/admin/CreateProductModal.tsx)).
  - [x] Módulo de historial de pedidos ([`/admin/orders`](src/app/admin/(dashboard)/orders/page.tsx)).
  - [x] Módulo de configuración de datos comerciales y WhatsApp ([`/admin/settings`](src/app/admin/(dashboard)/settings/page.tsx)).
