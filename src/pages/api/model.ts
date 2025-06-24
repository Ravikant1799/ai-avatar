// pages/api/model.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const modelUrl =
    "https://tfhub.dev/google/magenta/arbitrary-image-stylization-v1-256/2/model.json?tfjs-format=file";

  try {
    const response = await fetch(modelUrl);

    if (!response.ok) {
      res.status(response.status).json({ error: "Failed to fetch model" });
      return;
    }

    // Forward content-type and model.json data
    res.setHeader(
      "Content-Type",
      response.headers.get("Content-Type") || "application/json"
    );
    res.setHeader("Access-Control-Allow-Origin", "*");

    const data = await response.text();
    res.status(200).send(data);
  } catch (err) {
    console.error("Model fetch error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
