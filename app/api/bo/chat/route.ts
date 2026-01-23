import { robustAiQuery } from '@/lib/ai/hybrid-router';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();

  try {
    const response = await robustAiQuery(messages);
    return response.toTextStreamResponse();
  } catch (error) {
    console.error('AI request failed:', error);

    // Return a helpful error message as a stream
    const errorMessage = "I'm having trouble connecting to the AI service right now. Please try again in a moment.";
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(errorMessage));
        controller.close();
      }
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}
