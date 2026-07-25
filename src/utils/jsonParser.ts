export interface ParsedApiPayload {
  isJson: boolean;
  cleanPromptText: string;
  extractedQuery?: string;
  model?: string;
  estimatedTokens?: number;
  userName?: string;
  rawObject?: any;
}

export function parseApiJsonPayload(input: string): ParsedApiPayload {
  const trimmed = input.trim();
  if (!trimmed.startsWith('{') && !trimmed.includes('"messages"')) {
    return { isJson: false, cleanPromptText: trimmed };
  }

  try {
    const obj = JSON.parse(trimmed);

    // Extract Model
    const model = obj.model || 'DeepSeek-V4-Flash';

    // Calculate tokens based on payload size (avg 3.2 chars/token for bilingual context)
    const rawLength = JSON.stringify(obj).length;
    const estimatedTokens = Math.max(Math.round(rawLength / 3.2), 85000);

    let cleanPromptText = '';
    let extractedQuery = '';
    let userName = 'Сергей (Промпт-Инженер)';

    // Parse OpenAI / DeepSeek format messages
    if (Array.isArray(obj.messages)) {
      // Find system or user context for user name
      for (const m of obj.messages) {
        if (m.content && typeof m.content === 'string') {
          const nameMatch = m.content.match(/user\s*-\s*([А-Яа-яA-Za-z]+)/);
          if (nameMatch && nameMatch[1]) {
            userName = `${nameMatch[1]} (DevOps / P&G)`;
          }
        }
      }

      // Find last user message
      const userMessages = obj.messages.filter((m: any) => m.role === 'user');
      if (userMessages.length > 0) {
        const lastUserMsg = userMessages[userMessages.length - 1].content || '';

        // Extract <user_query> if present
        const queryMatch = lastUserMsg.match(/<user_query>([\s\S]*?)<\/user_query>/);
        if (queryMatch && queryMatch[1]?.trim()) {
          extractedQuery = queryMatch[1].trim();
        } else {
          // Fallback: take last line or main prompt
          const lines = lastUserMsg.split('\n').map((l: string) => l.trim()).filter(Boolean);
          extractedQuery = lines[lines.length - 1] || lastUserMsg;
        }

        // Clean user query
        cleanPromptText = extractedQuery;
      }
    }

    if (!cleanPromptText) {
      cleanPromptText = obj.prompt || obj.content || 'Анализ ТЗ по проекту Честный знак';
    }

    // Append context tag if large context
    if (estimatedTokens > 50000) {
      cleanPromptText = `${cleanPromptText} [Большой контекст ТЗ / ${estimatedTokens.toLocaleString('ru-RU')} токенов]`;
    }

    return {
      isJson: true,
      cleanPromptText,
      extractedQuery: extractedQuery || cleanPromptText,
      model,
      estimatedTokens,
      userName,
      rawObject: obj,
    };
  } catch (err) {
    return { isJson: false, cleanPromptText: trimmed };
  }
}
