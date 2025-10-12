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
  date: string;
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

  useEffect(() => {
    async function loadChats() {
      try {
        const response = await fetch(getFullPath('content/chat-list.json'));
        if (!response.ok) {
          console.error('Failed to load chat conversations');
          return;
        }

        const data = await response.json();
        setChatData(data);
        console.log('💬 Loaded', data.totalConversations, 'chat conversations');
      } catch (error) {
        console.error('Error loading chat conversations:', error);
      } finally {
        setLoading(false);
      }
    }

    loadChats();
  }, []);

  const toggleConversation = (index: number) => {
    setExpandedConvIndex(expandedConvIndex === index ? null : index);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
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

  if (!chatData || chatData.conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No conversations found</p>
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
                        {formatDate(conv.date)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(conv.date)}
                      </span>
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
