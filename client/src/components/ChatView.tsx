import { useState, useEffect } from 'react';
import { getFullPath } from '@/lib/basePath';
import { MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Message {
  sender: string;
  text: string;
}

interface Conversation {
  fromName: string;
  fromEmail: string;
  subject: string;
  date?: string;
  displayDate?: string;
  conversationNumber?: number;
  messages: Message[];
}

interface ChatData {
  totalConversations: number;
  participants: string[];
  conversations: Conversation[];
}

export default function ChatView() {
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [expandedConvIndex, setExpandedConvIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadChats() {
      try {
        console.log('🔄 ChatView: Starting to load conversations...');
        const timestamp = new Date().getTime();
        const url = getFullPath(`content/chat-list.json?v=${timestamp}`);
        console.log('🔄 ChatView: Fetching from:', url);
        
        const response = await fetch(url, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
        });
        console.log('🔄 ChatView: Response status:', response.status);
        
        if (!response.ok) {
          const errorMsg = `HTTP ${response.status}: ${response.statusText}`;
          console.error('❌ ChatView: Failed to load:', errorMsg);
          setError(errorMsg);
          return;
        }

        const data = await response.json();
        console.log('✅ ChatView: JSON parsed successfully');
        console.log('💬 Loaded', data.totalConversations, 'chat conversations');
        console.log('📊 First conversation:', data.conversations[0]?.displayDate || data.conversations[0]?.date);
        
        setChatData(data);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ ChatView: Error loading chat conversations:', error);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    }

    loadChats();
  }, []);

  const toggleConversation = (index: number) => {
    setExpandedConvIndex(expandedConvIndex === index ? null : index);
  };

  const formatDate = (conv: Conversation) => {
    // If displayDate exists (numbered conversation), return it
    if (conv.displayDate) {
      return conv.displayDate;
    }
    
    // Otherwise format the actual date
    if (conv.date) {
      const date = new Date(conv.date);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    
    return 'Unknown Date';
  };

  const formatTime = (conv: Conversation) => {
    // Only show time if there's an actual date (not numbered)
    if (!conv.date || conv.displayDate) {
      return null;
    }
    
    const date = new Date(conv.date);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md px-4">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <p className="text-destructive font-medium mb-2">Error loading conversations</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!chatData || chatData.conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No conversations found</p>
          <p className="text-xs text-muted-foreground mt-2">Data loaded but no conversations available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-24">
      <div className="p-4">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-1">Chat Archive</h2>
          <p className="text-sm text-muted-foreground">
            {chatData.totalConversations} conversations between {chatData.participants.join(' & ')}
          </p>
        </div>

        <div className="space-y-3">
          {chatData.conversations.map((conv, index) => (
            <Card key={index} className="overflow-hidden">
              <button
                onClick={() => toggleConversation(index)}
                className="w-full text-left p-4 hover-elevate active-elevate-2"
                data-testid={`button-conversation-${index}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm font-medium truncate">
                        {formatDate(conv)}
                      </span>
                      {formatTime(conv) && (
                        <span className="text-xs text-muted-foreground">
                          {formatTime(conv)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {conv.messages.length} message{conv.messages.length !== 1 ? 's' : ''}
                    </p>
                    {conv.messages.length > 0 && (
                      <p className="text-sm mt-1 truncate">
                        <span className="font-medium">{conv.messages[0].sender}:</span>{' '}
                        {conv.messages[0].text}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {expandedConvIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </button>

              {expandedConvIndex === index && (
                <div className="border-t bg-muted/30 p-4 space-y-2">
                  {conv.messages.map((msg, msgIndex) => (
                    <div
                      key={msgIndex}
                      className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                      data-testid={`message-${index}-${msgIndex}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 ${
                          msg.sender === 'me'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card border'
                        }`}
                      >
                        {msg.sender !== 'me' && (
                          <div className="text-xs font-medium mb-1 opacity-70">
                            {msg.sender}
                          </div>
                        )}
                        <div className="text-sm break-words">{msg.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
