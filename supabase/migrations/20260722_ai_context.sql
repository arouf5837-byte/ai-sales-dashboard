-- Migration for AI Context table
CREATE TABLE IF NOT EXISTS public.ai_context (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES public.clients(client_id) NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger for n8n webhook (so it syncs to vector database like products and faq)
DROP TRIGGER IF EXISTS ai_context_n8n_webhook_trigger ON public.ai_context;
CREATE TRIGGER ai_context_n8n_webhook_trigger
AFTER INSERT OR UPDATE ON public.ai_context
FOR EACH ROW EXECUTE FUNCTION public.trigger_n8n_webhook();
