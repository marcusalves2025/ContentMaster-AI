import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/gerar", async (req, res) => {
  const { tipo, prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt vazio!" });
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: `Você é um especialista em ${tipo}. Responda de forma clara e criativa.` }, { role: "user", content: prompt }],
        max_tokens: 600
      })
    });
    const data = await response.json();
    res.json({ conteudo: data.choices[0].message.content });
  } catch (err) {
    console.error("Erro na API:", err);
    res.status(500).json({ error: "Erro ao gerar conteúdo" });
  }
});

app.listen(3000, () => console.log("✅ Backend rodando em http://localhost:3000"));