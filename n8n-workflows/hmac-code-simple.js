// Simple version - Just prepare the payload without HMAC signature
const items = $input.all();

const payload = {
  workflowType: 'rss-feed',
  items: items.map(i => i.json)
};

const bodyString = JSON.stringify(payload);

// Return payload without signature
// We'll add a simple secret header instead
return [{
  json: {
    payload: payload,
    bodyString: bodyString,
    // Simple secret to verify it's from n8n
    secret: 'n8n-njooba-secure-webhook-2025'
  }
}];
