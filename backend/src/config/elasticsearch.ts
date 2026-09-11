import { Client } from "@elastic/elasticsearch";
import dotenv from "dotenv";

dotenv.config();

export const esClient = new Client({
  node:
    process.env.ELASTICSEARCH_NODE ||
    process.env.ES_URL ||
    "http://localhost:9200",
});

export const initElasticsearch = async () => {
  try {
    const info = await esClient.info();
    console.log("✅ Elasticsearch connected");

    // Create index if it doesn't exist
    const indexExists = await esClient.indices.exists({ index: "emails" });
    if (!indexExists) {
      await esClient.indices.create({
        index: "emails",
        mappings: {
          properties: {
            lead_id: { type: "keyword" },
            campaign_id: { type: "keyword" },
            user_id: { type: "keyword" },
            email: { type: "keyword" },
            subject: { type: "text" },
            status: { type: "keyword" },
            sent_at: { type: "date" },
          },
        },
      });
      console.log("✅ Elasticsearch index 'emails' created");
    }
  } catch (error) {
    console.error("❌ Elasticsearch initialization failed:", error);
  }
};
