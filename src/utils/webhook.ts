export async function triggerWebhook(table: 'products' | 'faq', record_id: string, text: string) {
  const url = process.env.N8N_WEBHOOK_URL

  if (!url || url.includes('YOUR-N8N-DOMAIN')) {
    console.warn('N8N_WEBHOOK_URL is not configured properly. Skipping webhook trigger.')
    return
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ table, record_id, text }),
    })
    
    if (!res.ok) {
      console.error(`Webhook responded with status: ${res.status}`)
    }
  } catch (error) {
    console.error('Failed to trigger N8N webhook:', error)
  }
}
