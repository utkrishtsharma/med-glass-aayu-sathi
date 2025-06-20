
import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, User, Moon, Sun, Menu, X, Trash2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Chat {
  id: string;
  title: string;
  created_at: string;
  messages: Message[];
}

interface UserProfile {
  name: string;
  chats: Record<string, Chat>;
}

const Index = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<Record<string, Chat>>({});
  const [userProfile, setUserProfile] = useState<UserProfile>({ name: 'Guest', chats: {} });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [newName, setNewName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, currentChatId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const createNewChat = () => {
    const chatId = Math.random().toString(36).substr(2, 9);
    const newChat: Chat = {
      id: chatId,
      title: 'New Chat',
      created_at: new Date().toISOString(),
      messages: []
    };
    
    setChats(prev => ({ ...prev, [chatId]: newChat }));
    setCurrentChatId(chatId);
    setSidebarOpen(false);
  };

  const selectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    setSidebarOpen(false);
  };

  const deleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedChats = { ...chats };
    delete updatedChats[chatId];
    setChats(updatedChats);
    
    if (currentChatId === chatId) {
      setCurrentChatId(null);
    }
    
    toast({
      title: "Chat deleted",
      description: "Your chat has been successfully deleted.",
    });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    if (!currentChatId) {
      createNewChat();
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    };

    // Update chat with user message
    setChats(prev => ({
      ...prev,
      [currentChatId]: {
        ...prev[currentChatId],
        messages: [...(prev[currentChatId]?.messages || []), userMessage],
        title: prev[currentChatId]?.title === 'New Chat' && prev[currentChatId]?.messages.length === 0 
          ? message.slice(0, 30) + (message.length > 30 ? '...' : '')
          : prev[currentChatId]?.title || 'New Chat'
      }
    }));

    setMessage('');
    setIsLoading(true);

    // Simulate API call (replace with actual backend integration)
    setTimeout(() => {
      const assistantMessage: Message = {
        role: 'assistant',
        content: `Thank you for your question: "${userMessage.content}"\n\nThis is a demo response. In a real implementation, this would connect to your Flask backend with the Groq API to provide medical assistance.\n\n**Important Medical Disclaimer**: This information is for educational purposes only. Always consult qualified healthcare professionals for personalized medical advice.`,
        timestamp: new Date().toISOString()
      };

      setChats(prev => ({
        ...prev,
        [currentChatId]: {
          ...prev[currentChatId],
          messages: [...prev[currentChatId].messages, assistantMessage]
        }
      }));

      setIsLoading(false);
    }, 1500);
  };

  const saveProfile = () => {
    if (newName.trim()) {
      setUserProfile(prev => ({ ...prev, name: newName.trim() }));
      setShowProfileModal(false);
      toast({
        title: "Profile updated",
        description: "Your name has been updated successfully.",
      });
    }
  };

  const currentChat = currentChatId ? chats[currentChatId] : null;
  const sortedChats = Object.values(chats).sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-50 backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border-b border-white/20 dark:border-gray-800/20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden backdrop-blur-md bg-white/20 dark:bg-gray-800/20 hover:bg-white/30 dark:hover:bg-gray-700/30 border border-white/30 dark:border-gray-700/30"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AayuSathi
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="backdrop-blur-md bg-white/20 dark:bg-gray-800/20 hover:bg-white/30 dark:hover:bg-gray-700/30 border border-white/30 dark:border-gray-700/30"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              className="backdrop-blur-md bg-white/20 dark:bg-gray-800/20 hover:bg-white/30 dark:hover:bg-gray-700/30 border border-white/30 dark:border-gray-700/30 flex items-center space-x-2"
              onClick={() => {
                setNewName(userProfile.name);
                setShowProfileModal(true);
              }}
            >
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  {userProfile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline">{userProfile.name}</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)] relative">
        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-40 w-80 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="h-full backdrop-blur-xl bg-white/10 dark:bg-gray-900/10 border-r border-white/20 dark:border-gray-800/20 flex flex-col">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-white/20 dark:border-gray-800/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 dark:text-white">Chats</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden backdrop-blur-md bg-white/20 dark:bg-gray-800/20 hover:bg-white/30 dark:hover:bg-gray-700/30"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <Button 
                onClick={createNewChat}
                className="w-full backdrop-blur-md bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border border-white/30 shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto p-2">
              {sortedChats.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
                  <p className="text-sm">No chats yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedChats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`
                        group p-3 rounded-xl cursor-pointer transition-all duration-200 backdrop-blur-md border
                        ${currentChatId === chat.id
                          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 dark:border-purple-500/30'
                          : 'bg-white/10 dark:bg-gray-800/10 border-white/20 dark:border-gray-700/20 hover:bg-white/20 dark:hover:bg-gray-800/20'
                        }
                      `}
                      onClick={() => selectChat(chat.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 mr-2">
                          <p className="font-medium text-gray-900 dark:text-white truncate text-sm">
                            {chat.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatDate(chat.created_at)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 hover:bg-red-500/20 hover:text-red-500"
                          onClick={(e) => deleteChat(chat.id, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {!currentChat ? (
            // Welcome Screen
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-md backdrop-blur-xl bg-white/10 dark:bg-gray-900/10 rounded-3xl p-8 border border-white/20 dark:border-gray-800/20 shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Welcome to AayuSathi
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Your personal medical assistant powered by AI. Ask any health-related questions and get evidence-based answers.
                </p>
                <Button 
                  onClick={createNewChat}
                  className="backdrop-blur-md bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border border-white/30 shadow-lg"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start New Chat
                </Button>
                <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                  <p className="font-semibold mb-2">Example Questions:</p>
                  <ul className="text-left space-y-1">
                    <li>• What are the symptoms of diabetes?</li>
                    <li>• How can I lower my blood pressure?</li>
                    <li>• What are the side effects of ibuprofen?</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            // Chat Interface
            <>
              {/* Chat Header */}
              <div className="p-4 backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border-b border-white/20 dark:border-gray-800/20">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {currentChat.title}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-red-500/20 hover:text-red-500"
                    onClick={() => deleteChat(currentChatId, {} as React.MouseEvent)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentChat.messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`
                        max-w-[80%] p-4 rounded-2xl backdrop-blur-md border shadow-lg
                        ${msg.role === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-500/30 ml-4'
                          : 'bg-white/20 dark:bg-gray-800/20 text-gray-900 dark:text-white border-white/30 dark:border-gray-700/30 mr-4'
                        }
                      `}
                    >
                      <div className="prose prose-sm max-w-none">
                        {msg.content.split('\n').map((line, i) => (
                          <p key={i} className={`${i > 0 ? 'mt-2' : ''} ${msg.role === 'user' ? 'text-white' : ''}`}>
                            {line}
                          </p>
                        ))}
                      </div>
                      <div className={`text-xs mt-2 ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] p-4 rounded-2xl backdrop-blur-md bg-white/20 dark:bg-gray-800/20 border border-white/30 dark:border-gray-700/30 mr-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border-t border-white/20 dark:border-gray-800/20">
                <form onSubmit={sendMessage} className="flex space-x-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask about symptoms, medications, or health concerns..."
                    className="flex-1 backdrop-blur-md bg-white/20 dark:bg-gray-800/20 border-white/30 dark:border-gray-700/30 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    disabled={!message.trim() || isLoading}
                    className="backdrop-blur-md bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border border-white/30 shadow-lg"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-white/20 dark:bg-gray-900/20 rounded-3xl p-6 w-full max-w-md border border-white/30 dark:border-gray-700/30 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowProfileModal(false)}
                className="hover:bg-white/20 dark:hover:bg-gray-800/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Name
                </label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="backdrop-blur-md bg-white/20 dark:bg-gray-800/20 border-white/30 dark:border-gray-700/30"
                  placeholder="Enter your name"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => setShowProfileModal(false)}
                  className="hover:bg-white/20 dark:hover:bg-gray-800/20"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveProfile}
                  className="backdrop-blur-md bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
