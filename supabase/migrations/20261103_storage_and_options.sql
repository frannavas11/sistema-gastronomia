-- Migración: Bucket store-assets y políticas RLS para grupos de opciones

-- 1. Configurar bucket 'store-assets'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'store-assets',
  'store-assets',
  true,
  5242880, -- 5 MB límite
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 2. Políticas de Supabase Storage para store-assets
CREATE POLICY "store_assets_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'store-assets');

CREATE POLICY "store_assets_owner_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'store-assets'
  AND EXISTS (
    SELECT 1 FROM public.stores
    WHERE stores.id::text = split_part(name, '/', 1)
      AND stores.owner_id = auth.uid()
  )
);

CREATE POLICY "store_assets_owner_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'store-assets'
  AND EXISTS (
    SELECT 1 FROM public.stores
    WHERE stores.id::text = split_part(name, '/', 1)
      AND stores.owner_id = auth.uid()
  )
);

CREATE POLICY "store_assets_owner_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'store-assets'
  AND EXISTS (
    SELECT 1 FROM public.stores
    WHERE stores.id::text = split_part(name, '/', 1)
      AND stores.owner_id = auth.uid()
  )
);

-- 3. Políticas de seguridad para product_option_groups
ALTER TABLE public.product_option_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pog_public_select" ON public.product_option_groups
FOR SELECT USING (true);

CREATE POLICY "pog_owner_all" ON public.product_option_groups
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.stores
    WHERE stores.id = product_option_groups.store_id
      AND stores.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.stores
    WHERE stores.id = product_option_groups.store_id
      AND stores.owner_id = auth.uid()
  )
);

-- 4. Políticas de seguridad para product_option_items
ALTER TABLE public.product_option_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "poi_public_select" ON public.product_option_items
FOR SELECT USING (true);

CREATE POLICY "poi_owner_all" ON public.product_option_items
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.product_option_groups pog
    JOIN public.stores s ON s.id = pog.store_id
    WHERE pog.id = product_option_items.group_id
      AND s.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.product_option_groups pog
    JOIN public.stores s ON s.id = pog.store_id
    WHERE pog.id = product_option_items.group_id
      AND s.owner_id = auth.uid()
  )
);
