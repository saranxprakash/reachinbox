import { Request, Response } from "express";
import fs from "fs";
import csvParser from "csv-parser";
import { emailQueue } from "../queues/emailQueue";
import { esClient } from "../config/elasticsearch";

export const getQueueStats = async (req: Request, res: Response) => {
  try {
    // Fetch the actual jobs from BullMQ
    const delayedJobs = await emailQueue.getDelayed();
    const completedJobs = await emailQueue.getCompleted();

    res.status(200).json({
      scheduled: delayedJobs.length,
      sent: completedJobs.length,
      // Map the job data so the frontend can display it
      scheduledList: delayedJobs.map((job) => ({
        id: job.id,
        to: job.data?.leadEmail || "Unknown",
        subject: job.data?.subject || "No Subject",
        body: job.data?.body || "",
        // Calculate the future time it will send
        time: job.opts?.delay
          ? new Date(job.timestamp + job.opts.delay).toLocaleString()
          : new Date(job.timestamp).toLocaleString(),
      })),
      sentList: completedJobs.map((job) => ({
        id: job.id,
        to: job.data?.leadEmail || "Unknown",
        subject: job.data?.subject || "No Subject",
        body: job.data?.body || "",
        time: job.finishedOn
          ? new Date(job.finishedOn).toLocaleString()
          : new Date().toLocaleString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch queue statistics" });
  }
};

export const uploadAndSchedule = async (req: Request, res: Response) => {
  try {
    const { subject, body, userId, scheduleTime } = req.body;
    const file = req.file;

    if (!file || !subject || !body || !userId) {
      return res
        .status(400)
        .json({ error: "Missing required fields or CSV file." });
    }

    // Calculate delay in milliseconds if a future time is provided
    const delay = scheduleTime
      ? new Date(scheduleTime).getTime() - Date.now()
      : 0;
    const finalDelay = delay > 0 ? delay : 0;

    const leads: string[] = [];

    // Parse CSV
    fs.createReadStream(file.path)
      .pipe(csvParser())
      .on("data", (row) => {
        // Assuming the CSV has an 'email' column
        if (row.email) leads.push(row.email.trim());
      })
      .on("end", async () => {
        // Add all leads to BullMQ
        for (const email of leads) {
          await emailQueue.add(
            "send-email",
            { userId, leadEmail: email, subject, body },
            {
              delay: finalDelay,
              attempts: 3, // Idempotency/Resilience: retry failed jobs
              backoff: { type: "exponential", delay: 5000 },
            },
          );
        }

        // Cleanup temp file
        fs.unlinkSync(file.path);

        res.status(200).json({
          message: `Successfully scheduled ${leads.length} emails.`,
          scheduledFor: scheduleTime || "Immediately",
        });
      });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getEmailStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const result = await esClient.search({
      index: "emails",
      size: 100,
      query: {
        match: { userId: userId as string },
      },
      sort: [{ sentAt: { order: "desc" } }],
    });
    const emails = result.hits.hits.map((hit) => hit._source);
    res.status(200).json(emails);
  } catch (error) {
    console.error("Failed to fetch email status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
