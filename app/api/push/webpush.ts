import webpush from 'web-push';

// Persist the generated keys in memory during development hot-reloads
const globalForVapid = globalThis as unknown as {
  vapidKeys?: { publicKey: string; privateKey: string };
};

export function getVapidKeys() {
  if (!globalForVapid.vapidKeys) {
    try {
      globalForVapid.vapidKeys = webpush.generateVAPIDKeys();
      console.log('Generated fresh VAPID keypair successfully.');
    } catch (e) {
      // Fallback keys in case generation fails
      globalForVapid.vapidKeys = {
        publicKey: 'BEl62iUYg5t9QrUNFl7z5t3ODGPpvElG5f57J3zo7mq7dqA2k18_8w5W785t3ODGPpvElG5f57J3zo7mq7dqA',
        privateKey: 'MockPrivateKeyForDevelopmentUseOnly12345='
      };
    }
  }
  return globalForVapid.vapidKeys;
}
