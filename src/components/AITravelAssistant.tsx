import { useState, useRef, useEffect } from 'react';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { MessageCircle, Send, X, Minimize2, Maximize2, Sparkles, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface AITravelAssistantProps {
  initialContext?: any;
}

export const AITravelAssistant = ({ initialContext }: AITravelAssistantProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { messages, isLoading, sendMessage, clearConversation, getGreeting } = useAIAssistant();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim(), initialContext);
    setInput('');
  };

  const suggestedPrompts = [
    "What are some hidden gems near me?",
    "Suggest a mission for today",
    "Give me a cultural tip",
    "Plan a weekend adventure"
  ];

  if (!user) return null;

  return (
    <>
      {/* Floating trigger button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 'auto' : 'auto'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)]"
          >
            <Card className="overflow-hidden shadow-2xl border-border/50 bg-background/95 backdrop-blur-xl">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10 border-2 border-primary/30">
                      <AvatarImage src="/logo.png" />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Sparkles className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success border-2 border-background" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Tix - Travel AI</h3>
                    <p className="text-xs text-muted-foreground">Your adventure companion</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearConversation}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-8 w-8"
                  >
                    {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Chat content */}
              {!isMinimized && (
                <>
                  <ScrollArea className="h-[350px] p-4" ref={scrollRef}>
                    {messages.length === 0 ? (
                      <div className="space-y-4">
                        <div className="text-center py-4">
                          <Sparkles className="h-12 w-12 mx-auto text-primary/50 mb-3" />
                          <h4 className="font-semibold">{getGreeting()}, {profile?.full_name?.split(' ')[0] || 'Traveler'}!</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            I'm Tix, your AI travel companion. How can I help you today?
                          </p>
                        </div>
                        <div className="grid gap-2">
                          {suggestedPrompts.map((prompt, i) => (
                            <Button
                              key={i}
                              variant="outline"
                              size="sm"
                              className="justify-start text-left h-auto py-2 px-3"
                              onClick={() => sendMessage(prompt, initialContext)}
                            >
                              <span className="text-xs">{prompt}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((msg, i) => (
                          <div
                            key={i}
                            className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                          >
                            <Avatar className="h-7 w-7 flex-shrink-0">
                              {msg.role === 'assistant' ? (
                                <>
                                  <AvatarImage src="/logo.png" />
                                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                    T
                                  </AvatarFallback>
                                </>
                              ) : (
                                <>
                                  <AvatarImage src={profile?.avatar_url || undefined} />
                                  <AvatarFallback className="text-xs">
                                    {profile?.full_name?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </>
                              )}
                            </Avatar>
                            <div
                              className={`rounded-2xl px-3 py-2 max-w-[80%] ${
                                msg.role === 'user'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              {msg.role === 'assistant' ? (
                                <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                              ) : (
                                <p className="text-sm">{msg.content}</p>
                              )}
                            </div>
                          </div>
                        ))}
                        {isLoading && messages[messages.length - 1]?.role === 'user' && (
                          <div className="flex gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarImage src="/logo.png" />
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                T
                              </AvatarFallback>
                            </Avatar>
                            <div className="bg-muted rounded-2xl px-4 py-3">
                              <div className="flex gap-1">
                                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </ScrollArea>

                  {/* Input */}
                  <form onSubmit={handleSubmit} className="p-3 border-t">
                    <div className="flex gap-2">
                      <Input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me anything..."
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
