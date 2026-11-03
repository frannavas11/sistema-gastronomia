# Reglas y Arquitectura del Proyecto

## Principios de Producto y Alcance
1. **Cero fricción en el local:** El personal atiende por WhatsApp. No obligar a usar un panel para cambiar estados de cocina o envío.
2. **Honestidad operativa:** No inventar barras de tiempo simuladas para el cliente.
3. **Persistencia obligatoria:** Todo pedido se guarda primero en Supabase y luego se abre `wa.me`.
4. **Fuera de alcance (MVP Fase 1):**
   - POS de mostrador / comandera física.
   - Dominios personalizados por local (se usa ruta `/[storeSlug]`).
   - Integración transaccional con pasarelas de pago (Mercado Pago es solo una etiqueta indicativa para transferencia).
   - Simuladores ficticios de progreso de cocina.

## Reglas de Seguridad Críticas
- **Recálculo de totales:** Los subtotales y totales se recalculan SIEMPRE en el servidor con los precios vigentes en la DB. Jamás confiar en montos enviados desde el frontend.
- **Inserción de pedidos:** Los inserts en `orders` y `order_items` los ejecuta únicamente el servidor mediante un Route Handler con `service_role`. El cliente web anónimo nunca escribe directo en esas tablas.
- **Políticas RLS:**
  - Lectura pública: únicamente para registros activos (`is_active = true`, `is_available = true`).
  - Escritura: restringida exclusivamente al dueño del local (`owner_id = auth.uid()` en la tabla `stores`).

## Stack Tecnológico
- **Framework:** Next.js 14+ (App Router, Server Components por defecto).
- **Estilos:** Tailwind CSS (Mobile-First estricto en catálogo y checkout).
- **Backend / Database:** Supabase (PostgreSQL + RLS + Auth + Storage).
- **Gestión de Estado del Carrito:** Zustand (sincronizado con `localStorage`).
- **Lenguaje:** TypeScript estricto.

## Variables de Entorno Requeridas
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (uso exclusivo en backend/route handlers)