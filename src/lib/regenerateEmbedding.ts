interface RegenerateEmbeddingParams {
  table: string;
  recordId: string;
  clientId: string;
  mergedText: string;
}

export async function regenerateEmbedding({ table, recordId, clientId, mergedText }: RegenerateEmbeddingParams) {
  try {
    const n8nUrl = process.env.N8N_WEBHOOK_URL;
    if (!n8nUrl) {
      console.warn('N8N_WEBHOOK_URL not configured. Skipping embedding regeneration.');
      return null;
    }

    const res = await fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table,
        record_id: recordId,
        client_id: clientId,
        text: mergedText
      })
    });
    
    // Fire and forget, don't throw on error
    return await res.json().catch(() => null);
  } catch (err) {
    console.error('Embedding regeneration failed:', err);
    // Don't block product save if this fails
  }
}
