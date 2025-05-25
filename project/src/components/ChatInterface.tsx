import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Loader2, User, Bot } from 'lucide-react';
import { useDocuments } from '../context/DocumentContext';
import { askQuestion } from '../services/api';
import { cn } from '../utils/cn';

/**
 * ChatInterface component enables a chat UI where the user can
 * interact with an AI assistant about a specific uploaded document.
 */
const ChatInterface: React.FC = () => {
  // Get document ID from route params
  const { documentId } = useParams<{ documentId: string }>();
  const { getDocumentMessages, addMessage, documents, isLoading, setIsLoading } = useDocuments();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Get the current document by ID and its associated messages
  const document = documents.find(doc => doc.id === documentId);
  const messages = documentId ? getDocumentMessages(documentId) : [];
  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  // Auto-focus input field when document changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [documentId]);
  /**
   * Handles form submission:
   * - Adds user message
   * - Sends question to backend
   * - Adds assistant response or error message
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || !documentId || isLoading) return;
    
    // add user message
    const userMessage = {
      id: Date.now().toString(),
      content: input,
      role: 'user' as const,
      documentId,
      timestamp: new Date()
    };
    
    addMessage(userMessage);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await askQuestion(documentId, input);
      
      // add assistant message
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        content: response.answer,
        role: 'assistant' as const,
        documentId,
        timestamp: new Date()
      };
      
      addMessage(assistantMessage);
    } catch (error) {
      console.error('Error asking question:', error);
      
      // add error message
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, there was an error processing your question. Please try again.",
        role: 'assistant' as const,
        documentId,
        timestamp: new Date()
      };
      
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  // If document not found, show error message
  if (!document) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Document not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
        <h2 className="text-sm font-medium text-gray-700 truncate">{document.name}</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-gray-100 p-3 rounded-full mb-3">
              <Bot className="h-6 w-6 text-emerald-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-800">Ask a question about this document</h3>
            <p className="text-sm text-gray-500 max-w-md mt-2">
              You can ask specific questions about the content, request summaries, or inquire about details within the document.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start space-x-3",
                message.role === 'assistant' ? "justify-start" : "justify-end"
              )}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 bg-emerald-100 rounded-full p-1.5">
                  <Bot className="h-4 w-4 text-emerald-600" />
                </div>
              )}
              
              <div
                className={cn(
                  "rounded-lg py-2 px-3 max-w-[80%]",
                  message.role === 'assistant'
                    ? "bg-gray-100 text-gray-800"
                    : "bg-emerald-500 text-white"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              
              {message.role === 'user' && (
                <div className="flex-shrink-0 bg-emerald-500 rounded-full p-1.5">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about the document..."
            className="flex-1 border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-300 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;