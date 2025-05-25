import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import ChatInterface from '../components/ChatInterface';
import { useDocuments } from '../context/DocumentContext';

/**
 * ChatPage displays the chat interface for a specific document.
 * It sets the active document based on the route parameter (documentId).
 * If the document doesn't exist in context, it redirects back to the home page.
 */
const ChatPage: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const { documents, setActiveDocument } = useDocuments();
  const navigate = useNavigate();
  /**
   * Effect to find the matching document when component mounts or documentId changes.
   * If no match is found, user is redirected to home.
   */
  useEffect(() => {
    if (documentId) {
      const document = documents.find(doc => doc.id === documentId);
      if (document) {
        setActiveDocument(document);
      } else {
        // document not found, redirect to home
        navigate('/');
      }
    }
        // Cleanup: reset active document on unmount
    return () => {
      setActiveDocument(null);
    };
  }, [documentId, documents, navigate, setActiveDocument]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-4 px-4 flex flex-col">
        <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
          <div className="mb-4">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back to Documents</span>
            </button>
          </div>
          
          <div className="flex-1 flex flex-col">
            <ChatInterface />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;