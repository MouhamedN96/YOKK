// Generate HMAC-SHA256 signature using SubtleCrypto API
const items = $input.all();

const webhookSecret = 'n8n-njooba-secure-webhook-2025';
const payload = {
  workflowType: 'rss-feed',
  items: items.map(i => i.json)
};

const bodyString = JSON.stringify(payload);

// Polyfill for TextEncoder if not available
class TextEncoderPolyfill {
  encode(str) {
    const utf8 = [];
    for (let i = 0; i < str.length; i++) {
      let charcode = str.charCodeAt(i);
      if (charcode < 0x80) utf8.push(charcode);
      else if (charcode < 0x800) {
        utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
      }
      else if (charcode < 0xd800 || charcode >= 0xe000) {
        utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode>>6) & 0x3f), 0x80 | (charcode & 0x3f));
      }
      else {
        i++;
        charcode = 0x10000 + (((charcode & 0x3ff)<<10) | (str.charCodeAt(i) & 0x3ff));
        utf8.push(0xf0 | (charcode >>18), 0x80 | ((charcode>>12) & 0x3f), 0x80 | ((charcode>>6) & 0x3f), 0x80 | (charcode & 0x3f));
      }
    }
    return new Uint8Array(utf8);
  }
}

// Use native or polyfill
const encoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : new TextEncoderPolyfill();
const keyData = encoder.encode(webhookSecret);
const messageData = encoder.encode(bodyString);

// Use SubtleCrypto to generate HMAC
async function generateHMAC() {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    messageData
  );

  // Convert ArrayBuffer to hex string
  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

// Generate signature and return
const signature = await generateHMAC();

return [{
  json: {
    payload: payload,
    signature: signature,
    bodyString: bodyString
  }
}];
