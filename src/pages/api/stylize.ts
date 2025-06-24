// pages/api/stylize.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { base64 } = req.body;

  if (!base64) {
    return res.status(400).json({ error: "Missing base64 image" });
  }

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/akhaliq/RealTime-StyleTransfer",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: base64 }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error });
    }

    const buffer = await response.arrayBuffer();
    const result = Buffer.from(buffer).toString("base64");

    res.status(200).json({ result: `data:image/jpeg;base64,${result}` });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Stylization failed", details: (error as Error).message });
  }
}
