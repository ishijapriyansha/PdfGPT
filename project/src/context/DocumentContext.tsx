import React, { createContext, useState, useContext, ReactNode } from 'react';
// Document interface represents an uploaded PDF.
interface Document {
  id: string;
  name: string;
  uploadDate: Date;
  size: number;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  documentId: string;
  timestamp: Date;
}
// Context type defining the shape of data and functions provided by the DocumentContext.
interface DocumentContextType {
  documents: Document[];
  messages: Record<string, Message[]>;
  addDocument: (document: Document) => void;
  removeDocument: (id: string) => void;
  addMessage: (message: Message) => void;
  getDocumentMessages: (documentId: string) => Message[];
  activeDocument: Document | null;
  setActiveDocument: (document: Document | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);
//  DocumentProvider wraps the app and provides document and chat message state.
export const DocumentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [activeDocument, setActiveDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
   // Adds a new document and initializes its message list.
  const addDocument = (document: Document) => {
    setDocuments(prev => [...prev, document]);
    setMessages(prev => ({ ...prev, [document.id]: [] }));
  };
 
   //Removes a document and its associated messages.
  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    setMessages(prev => {
      const newMessages = { ...prev };
      delete newMessages[id];
      return newMessages;
    });
    
    if (activeDocument?.id === id) {
      setActiveDocument(null);
    }
  };
  //  Adds a chat message to the specified document's message list.
  const addMessage = (message: Message) => {
    setMessages(prev => {
      const documentMessages = prev[message.documentId] || [];
      return {
        ...prev,
        [message.documentId]: [...documentMessages, message],
      };
    });
  };
// Retrieves the list of messages for a given document ID.
  const getDocumentMessages = (documentId: string) => {
    return messages[documentId] || [];
  };

  return (
    <DocumentContext.Provider
      value={{
        documents,
        messages,
        addDocument,
        removeDocument,
        addMessage,
        getDocumentMessages,
        activeDocument,
        setActiveDocument,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};
// Custom hook to access the DocumentContext.
export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};