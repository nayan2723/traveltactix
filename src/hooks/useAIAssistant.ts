import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  feedback?: 'positive' | 'negative';
}

export const useAIAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Load most recent conversation on mount
  useEffect(() => {
    if (!user) return;
    const loadConversation = async () => {
      const { data } = await supabase
        .from('ai_conversations')
        .select('id, messages')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setConversationId(data.id);
        const parsed = Array.isArray(data.messages) ? data.messages : [];
        setMessages(parsed as unknown as Message[]);
      }
    };
    loadConversation();
  }, [user]);

  // Debounced save to DB
  const saveConversation = useCallback(async (msgs: Message[]) => {
    if (!user || msgs.length === 0) return;
    
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      const title = msgs[0]?.content?.slice(0, 50) || 'New Conversation';
      if (conversationId) {
        await supabase
          .from('ai_conversations')
          .update({ messages: msgs as any, title, updated_at: new Date().toISOString() })
          .eq('id', conversationId);
      } else {
        const { data } = await supabase
          .from('ai_conversations')
          .insert({ user_id: user.id, messages: msgs as any, title })
          .select('id')
          .maybeSingle();
        if (data) setConversationId(data.id);
      }
    }, 1000);
  }, [user, conversationId]);

  const sendMessage = useCallback(async (content: string, context?: any) => {
    if (!user) {
      toast.error('Please log in to use the AI assistant');
      return;
    }

    const userMessage: Message = { role: 'user', content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);
    setIsStreaming(false);

    let assistantContent = '';

    try {
      const response = await fetch(
        `https://buoablhkbfctwmjzeisk.supabase.co/functions/v1/ai-travel-assistant`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            messages: newMessages.map(m => ({ role: m.role, content: m.content })),
            context
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast.error('Rate limit exceeded. Please try again later.');
          setMessages(messages);
          return;
        }
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      setIsStreaming(true);
      const decoder = new TextDecoder();
      let textBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const chunk = parsed.choices?.[0]?.delta?.content;
            if (chunk) {
              assistantContent += chunk;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => 
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { role: 'assistant', content: assistantContent }];
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Save after streaming complete
      const finalMessages = [...newMessages, { role: 'assistant' as const, content: assistantContent }];
      saveConversation(finalMessages);

    } catch (error) {
      console.error('AI Assistant error:', error);
      toast.error('Failed to get response from AI');
      setMessages(messages);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [user, messages, saveConversation]);

  const rateFeedback = useCallback(async (messageIndex: number, feedback: 'positive' | 'negative') => {
    setMessages(prev => {
      const updated = prev.map((m, i) => i === messageIndex ? { ...m, feedback } : m);
      saveConversation(updated);
      return updated;
    });
    toast.success(feedback === 'positive' ? 'Thanks for the feedback!' : 'We\'ll improve our suggestions');
  }, [saveConversation]);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return {
    messages,
    isLoading,
    isStreaming,
    sendMessage,
    clearConversation,
    getGreeting,
    rateFeedback
  };
};
