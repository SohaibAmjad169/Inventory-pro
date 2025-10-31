import { PrismaClient, ChatMessageRole } from '@prisma/client';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export class ChatbotService {
  /**
   * Get or create chat session
   */
  static async getOrCreateSession(userId?: string, guestId?: string): Promise<string> {
    // Try to find existing active session
    let session = await prisma.chatSession.findFirst({
      where: {
        OR: [
          userId ? { user_id: userId } : {},
          guestId ? { guest_id: guestId } : {},
        ],
        is_active: true,
      },
      orderBy: { last_message_at: 'desc' },
    });

    if (!session) {
      // Create new session
      session = await prisma.chatSession.create({
        data: {
          user_id: userId,
          guest_id: guestId,
          session_name: `Chat ${new Date().toLocaleString()}`,
          is_active: true,
        },
      });
    }

    return session.id;
  }

  /**
   * Send message and get AI response
   */
  static async sendMessage(params: {
    sessionId: string;
    message: string;
    userId?: string;
  }): Promise<{ response: string; messageId: string }> {
    const startTime = Date.now();

    // Save user message
    await prisma.chatMessage.create({
      data: {
        session_id: params.sessionId,
        role: ChatMessageRole.USER,
        content: params.message,
      },
    });

    // Get AI response
    let response: string;
    let model = 'gemini-2.0-flash';

    try {
      if (!GOOGLE_API_KEY) {
        throw new Error('GOOGLE_API_KEY is not set. Please check your environment variables.');
      }

      console.log('GOOGLE_API_KEY (partial):', GOOGLE_API_KEY.slice(0, 5) + '...');

      console.log('Sending request to Gemini API:', {
        url: GOOGLE_API_URL,
        payload: {
          contents: [
            {
              parts: [
                { text: params.message }
              ]
            }
          ]
        }
      });

      const geminiResponse = await axios.post(
        GOOGLE_API_URL,
        {
          contents: [
            {
              parts: [
                { text: params.message }
              ]
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': GOOGLE_API_KEY,
          },
        }
      );

      console.log('Gemini API response:', geminiResponse.data);

      // Debugging: Log the full content of the first candidate
      const firstCandidateContent = geminiResponse.data?.candidates?.[0]?.content;
      console.log('First Candidate Content:', firstCandidateContent);

      // Extract the response text from the first candidate's first part
      response = firstCandidateContent?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('Gemini AI error (full):', error);
      response = 'Sorry, I could not generate a response.';
    }

    // Save assistant response
    const responseTime = Date.now() - startTime;
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        session_id: params.sessionId,
        role: ChatMessageRole.ASSISTANT,
        content: response,
        model,
        response_time: responseTime,
      },
    });

    // Update session
    await prisma.chatSession.update({
      where: { id: params.sessionId },
      data: {
        message_count: { increment: 2 },
        last_message_at: new Date(),
      },
    });

    return {
      response,
      messageId: assistantMessage.id,
    };
  }

  /**
   * Get chat history
   */
  static async getChatHistory(sessionId: string, limit: number = 50) {
    const messages = await prisma.chatMessage.findMany({
      where: { session_id: sessionId },
      orderBy: { created_at: 'asc' },
      take: limit,
    });

    return messages;
  }

  /**
   * Provide feedback on message
   */
  static async provideFeedback(messageId: string, isHelpful: boolean, feedbackText?: string) {
    return await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        is_helpful: isHelpful,
        feedback_text: feedbackText,
      },
    });
  }

  /**
   * End chat session
   */
  static async endSession(sessionId: string) {
    return await prisma.chatSession.update({
      where: { id: sessionId },
      data: { is_active: false },
    });
  }

  /**
   * Get user's chat sessions
   */
  static async getUserSessions(userId: string) {
    return await prisma.chatSession.findMany({
      where: { user_id: userId },
      orderBy: { last_message_at: 'desc' },
      take: 10,
      select: {
        id: true,
        session_name: true,
        message_count: true,
        is_active: true,
        created_at: true,
        last_message_at: true,
      },
    });
  }
}

