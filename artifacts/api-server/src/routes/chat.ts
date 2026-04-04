import { Router } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { ChatAsCandidateBody } from "@workspace/api-zod";

const router = Router();

router.post("/", async (req, res) => {
  const body = ChatAsCandidateBody.parse(req.body);

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    ...(body.system ? { system: body.system } : {}),
    messages: body.messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  });

  const reply = message.content.map((c) => (c.type === "text" ? c.text : "")).join("").trim();
  res.json({ reply });
});

export default router;
