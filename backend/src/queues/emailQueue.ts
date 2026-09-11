import { Queue, Worker, Job } from "bullmq";
import Redis from "ioredis";
import * as nodemailer from "nodemailer";
import axios from "axios";
import { esClient } from "../config/elasticsearch";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const redisOptions = {
  maxRetriesPerRequest: null,
};

// ============================================================
// REDIS CONNECTION FOR RATE LIMITING
// ============================================================

const manualRedisClient = new Redis(redisUrl, redisOptions);

// ============================================================
// EMAIL QUEUE
// ============================================================

export const emailQueue = new Queue("email-queue", {
  connection: new Redis(redisUrl, redisOptions),

  // Keep completed jobs so the dashboard can display them
  defaultJobOptions: {
    removeOnComplete: false,
    removeOnFail: false,
  },
});

// ============================================================
// ETHEREAL EMAIL SETUP
// ============================================================

let transporter: nodemailer.Transporter;

async function getTransporter() {
  if (!transporter) {
    const account = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: {
        user: account.user,
        pass: account.pass,
      },
    });

    console.log(`✉️ Ethereal Email ready: ${account.user}`);
  }

  return transporter;
}

// Initialize transporter when server starts
getTransporter();

// ============================================================
// EMAIL JOB TYPE
// ============================================================

interface EmailJob {
  userId: string;
  leadEmail: string;
  subject: string;
  body: string;

  // Original date/time selected by the user
  scheduleTime?: string | null;
}

// ============================================================
// EMAIL WORKER
// ============================================================

export const emailWorker = new Worker<EmailJob>(
  "email-queue",

  async (job: Job<EmailJob>) => {
    const { userId, leadEmail, subject, body, scheduleTime } = job.data;

    console.log("========================================");
    console.log(`📨 Processing email job: ${job.id}`);
    console.log(`📧 To: ${leadEmail}`);
    console.log(`📝 Subject: ${subject}`);
    console.log(`⏰ Scheduled time: ${scheduleTime || "Immediately"}`);
    console.log("========================================");

    // ========================================================
    // RATE LIMITING
    // ========================================================

    const currentHourKey = `rate_limit:${userId}:${new Date().getHours()}`;

    const count = await manualRedisClient.incr(currentHourKey);

    if (count === 1) {
      await manualRedisClient.expire(currentHourKey, 3600);
    }

    const HOURLY_LIMIT = 100;

    if (count > HOURLY_LIMIT) {
      console.log(`⚠️ Rate limit hit for ${userId}. Delaying job.`);

      // Slack notification
      if (process.env.SLACK_WEBHOOK_URL) {
        await axios
          .post(process.env.SLACK_WEBHOOK_URL, {
            text: `⚠️ User ${userId} hit hourly email limit. Messages delayed.`,
          })
          .catch(() => {
            console.error("⚠️ Slack webhook failed");
          });
      }

      // Re-add the email with a one-hour delay
      await emailQueue.add("send-email", job.data, {
        delay: 3600000,
        removeOnComplete: false,
        removeOnFail: false,
      });

      return;
    }

    // ========================================================
    // SEND EMAIL
    // ========================================================

    try {
      const activeTransporter = await getTransporter();

      const info = await activeTransporter.sendMail({
        from: '"Email Scheduler" <test@ethereal.email>',
        to: leadEmail,
        subject,
        text: body,
      });

      console.log(
        `✅ Sent to ${leadEmail}. Preview: ${nodemailer.getTestMessageUrl(info)}`,
      );

      // ======================================================
      // ELASTICSEARCH LOGGING
      // ======================================================
      //
      // Elasticsearch is only for logging/analytics.
      // If it fails, the email should STILL be considered
      // successfully sent.
      //

      try {
        await esClient.index({
          index: "emails",
          document: {
            userId,
            leadEmail,
            subject,
            status: "sent",
            sentAt: new Date(),
            scheduleTime: scheduleTime || null,
          },
        });

        console.log(`📊 Email indexed in Elasticsearch: ${leadEmail}`);
      } catch (esError) {
        console.error(
          "⚠️ Elasticsearch logging failed, but email was sent:",
          esError,
        );
      }

      // IMPORTANT:
      // No error is thrown here.
      //
      // Therefore BullMQ marks this job as COMPLETED.
      return;
    } catch (error) {
      console.error(`❌ Failed to send to ${leadEmail}:`, error);

      // Throwing makes BullMQ mark the job as failed
      // and retry according to the configured attempts.
      throw error;
    }
  },

  // ==========================================================
  // WORKER OPTIONS
  // ==========================================================

  {
    connection: new Redis(redisUrl, redisOptions),

    concurrency: 5,

    limiter: {
      max: 1,
      duration: 1000,
    },
  },
);

// ============================================================
// WORKER EVENTS
// ============================================================

emailWorker.on("completed", (job) => {
  console.log(`✅ BullMQ job completed: ${job.id} → ${job.data.leadEmail}`);
});

emailWorker.on("failed", (job, error) => {
  console.error(
    `❌ BullMQ job failed: ${job?.id} → ${job?.data?.leadEmail}`,
    error,
  );
});

emailWorker.on("error", (error) => {
  console.error("❌ Email worker error:", error);
});
