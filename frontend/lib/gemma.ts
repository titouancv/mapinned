import { OpenRouter } from "@openrouter/sdk";

const openrouter = new OpenRouter({
  apiKey: process.env.NEXT_PUBLIC_GEMMA_API_KEY,
});

export async function analyzeImageWithGemma(
  imageUrl: string,
  onChunk?: (chunk: string) => void
) {
  const stream = await openrouter.chat.send({
    model: "google/gemma-3-27b-it:free",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Provide a technical and concise description of the image content. Focus on visual elements, composition, and lighting. Do not use markdown, bullet points, or any formatting. Output plain text only.",
          },
          {
            type: "image_url",
            imageUrl: {
              url: imageUrl,
            },
          },
        ],
      },
    ],
    stream: true,
  });

  let fullContent = "";
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      if (onChunk) onChunk(content);
      fullContent += content;
    }
  }
  return fullContent;
}
