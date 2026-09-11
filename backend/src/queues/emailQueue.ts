import { Queue, Worker, Job } from "bullmq";
import Redis from "ioredis";
import * as nodemailer from "nodemailer";
import axios from "axios";
import { esClient } from "../config/elasticsearch";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redisOptions = { maxRetriesPerRequest: null };

// 1. Create a dedicated Redis client purely for our manual rate-limit tracking
const manualRedisClient = new Redis(redisUrl, redisOptions);

// 2. Let the Queue have its own distinct connection
export const emailQueue = new Queue("email-queue", {
  connection: new Redis(redisUrl, redisOptions),
});

// Ethereal Email Setup
let transporter: nodemailer.Transporter;

// Helper function to guarantee transporter is ready before processing jobs
async function getTransporter() {
  if (!transporter) {
    const account = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: { user: account.user, pass: account.pass },
    });
    console.log(`✉️ Ethereal Email ready: ${account.user}`);
  }
  return transporter;
}

// Kick off initialization in the background on startup
getTransporter();

interface EmailJob {
  userId: string;
  leadEmail: string;
  subject: string;
  body: string;
}

// Worker to process emails
export const emailWorker = new Worker<EmailJob>(
  "email-queue",
  async (job: Job<EmailJob>) => {
    const { userId, leadEmail, subject, body } = job.data;
    const currentHourKey = `rate_limit:${userId}:${new Date().getHours()}`;

    // IMPORTANT: Use the independent manual client to track limits, avoiding deadlocks
    const count = await manualRedisClient.incr(currentHourKey);
    if (count === 1) await manualRedisClient.expire(currentHourKey, 3600);

    const HOURLY_LIMIT = 100;

    if (count > HOURLY_LIMIT) {
      console.log(`Rate limit hit for ${userId}. Delaying job.`);

      // Trigger Slack Webhook
      if (process.env.SLACK_WEBHOOK_URL) {
        await axios
          .post(process.env.SLACK_WEBHOOK_URL, {
            text: `⚠️ User ${userId} hit hourly email limit. Messages delayed.`,
          })
          .catch(() => console.error("Slack webhook failed"));
      }

      // Push job back to queue with a 1-hour delay
      await emailQueue.add("send-email", job.data, { delay: 3600000 });
      return;
    }

    // 2. Send Email
    try {
      // Ensure we have a valid transporter before proceeding
      const activeTransporter = await getTransporter();

      const info = await activeTransporter.sendMail({
        from: '"Email Scheduler" <test@ethereal.email>',
        to: leadEmail,
        subject: subject,
        text: body,
      });

      console.log(
        `Sent to ${leadEmail}. Preview: ${nodemailer.getTestMessageUrl(info)}`,
      );

      // 3. Index in Elasticsearch
      await esClient.index({
        index: "emails",
        document: {
          userId,
          leadEmail,
          subject,
          status: "sent",
          sentAt: new Date(),
        },
      });
    } catch (error) {
      console.error(`Failed to send to ${leadEmail}`, error);
      throw error; // Let BullMQ handle retries natively
    }
  },
  {
    // 3. Let the Worker have its own distinct connection
    connection: new Redis(redisUrl, redisOptions),
    concurrency: 5,
    limiter: { max: 1, duration: 1000 },
  },
);
