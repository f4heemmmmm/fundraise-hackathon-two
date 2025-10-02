import Nylas, { Webhook, WebhookTriggers } from 'nylas';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

if (!process.env.NYLAS_API_KEY) {
  throw new Error('NYLAS_API_KEY is required');
}

const nylas = new Nylas({
  apiKey: process.env.NYLAS_API_KEY,
});

// Define custom trigger types since the Nylas SDK doesn't include notetaker triggers yet
const NotetakerTriggers = {
  Created: 'notetaker.created' as WebhookTriggers,
  Media: 'notetaker.media' as WebhookTriggers,
  MeetingState: 'notetaker.meeting_state' as WebhookTriggers
};

export async function setupNylasWebhooks(baseUrl: string) {
  try {
    console.log('Setting up Nylas webhooks...');
    
    // List and delete any existing webhooks
    const webhooks = await nylas.webhooks.list();
    for (const webhook of webhooks.data || []) {
      if (webhook.id) {
        try {
          await nylas.webhooks.destroy({ webhookId: webhook.id });
          console.log(`Deleted existing webhook: ${webhook.id}`);
        } catch (error) {
          console.warn(`Failed to delete webhook ${webhook.id}:`, error);
        }
      }
    }

    // Create new webhook with retries
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        console.log(`Creating webhook (attempt ${attempts + 1}/${maxAttempts})...`);
        console.log('Using webhook URL:', `${baseUrl}/webhooks/nylas`);
        
        const webhook = await nylas.webhooks.create({
          requestBody: {
            triggerTypes: [
              NotetakerTriggers.Created,
              NotetakerTriggers.Media,
              NotetakerTriggers.MeetingState
            ] as WebhookTriggers[],
            webhookUrl: `${baseUrl}/webhooks/nylas`,
            description: 'Notetaker events webhook',
          }
        });

        console.log('Webhook created successfully:', webhook);
        return webhook;
      } catch (error: any) {
        attempts++;
        console.error(`Webhook creation attempt ${attempts} failed:`, error?.message || error);
        
        if (attempts === maxAttempts) {
          throw new Error(`Failed to create webhook after ${maxAttempts} attempts`);
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  } catch (error) {
    console.error('Error setting up Nylas webhooks:', error);
    throw error;
  }
}