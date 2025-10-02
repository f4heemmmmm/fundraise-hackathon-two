import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/database';
import meetingsRouter from './routes/meetings';
import nylasWebhookRouter from './routes/webhooks';
import { setupNylasWebhooks } from './services/nylasWebhook';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Verify env loading

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(meetingsRouter);
app.use(nylasWebhookRouter);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the API' });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error((err as Error).stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
const server = app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  try {
    // Instructions for setting up VS Code port forwarding
    console.log('\nTo set up webhooks:');
    console.log('1. In VS Code, click on "Ports" tab in the bottom panel');
    console.log('2. Right-click on port 4000');
    console.log('3. Select "Port Visibility" -> "Public"');
    console.log('4. Click "Forward a Port" if port 4000 isn\'t listed');
    console.log('5. Copy the HTTPS URL from the "Forwarded Address" column');
    console.log('6. Press Ctrl+C (Cmd+C on Mac) to stop the server');
    console.log('7. Set the URL as WEBHOOK_URL in your .env file');
    console.log('8. Restart the server\n');

    // Use WEBHOOK_URL from environment
    if (!process.env.WEBHOOK_URL) {
      console.log('\nWEBHOOK_URL not set in .env file. Please follow the instructions above.\n');
      return;
    }

    const webhookUrl = process.env.WEBHOOK_URL;
    console.log('Setting up webhook with URL:', webhookUrl);
    await setupNylasWebhooks(webhookUrl);
  } catch (error) {
    console.error('Failed to set up Nylas webhooks:', error);
  }
});
