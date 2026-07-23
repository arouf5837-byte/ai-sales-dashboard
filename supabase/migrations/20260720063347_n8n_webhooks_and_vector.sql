-- 1. Enable pgvector and pg_net extensions
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Create products_vector table (if not exists)
CREATE TABLE IF NOT EXISTS public.products_vector (
  id bigserial primary key,
  content text,
  metadata jsonb,
  embedding extensions.vector(1536),
  client_id uuid references public.clients(client_id)
);

-- Index for fast lookups by product_id inside metadata
CREATE INDEX IF NOT EXISTS idx_products_vector_product_id ON public.products_vector ((metadata->>'product_id'));

-- 3. Webhook Trigger Function for n8n (Generic)
-- This function sends the row data to n8n asynchronously.
CREATE OR REPLACE FUNCTION public.trigger_n8n_webhook()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  -- Hardcoding for simplicity based on your environment
  webhook_url text := 'https://2248-1556.n8nbysnbd.top/webhook/regenerate-embedding';
  payload jsonb;
BEGIN
  payload := jsonb_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'record', row_to_json(NEW),
    'old_record', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE null END
  );

  -- Call pg_net HTTP POST asynchronously
  PERFORM net.http_post(
    url := webhook_url,
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := payload
  );

  RETURN NEW;
END;
$$;

-- 4. Create triggers on products and faq for INSERT/UPDATE
DROP TRIGGER IF EXISTS products_n8n_webhook_trigger ON public.products;
CREATE TRIGGER products_n8n_webhook_trigger
AFTER INSERT OR UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.trigger_n8n_webhook();

DROP TRIGGER IF EXISTS faq_n8n_webhook_trigger ON public.faq;
CREATE TRIGGER faq_n8n_webhook_trigger
AFTER INSERT OR UPDATE ON public.faq
FOR EACH ROW EXECUTE FUNCTION public.trigger_n8n_webhook();

-- 5. Trigger Function to auto-delete from products_vector on product deletion
CREATE OR REPLACE FUNCTION public.auto_delete_products_vector()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.products_vector 
  WHERE metadata->>'product_id' = OLD.id::text;
  
  RETURN OLD;
END;
$$;

-- 6. Create trigger on products for DELETE
DROP TRIGGER IF EXISTS products_vector_delete_trigger ON public.products;
CREATE TRIGGER products_vector_delete_trigger
AFTER DELETE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.auto_delete_products_vector();
