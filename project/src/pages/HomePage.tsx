import React from 'react';
import Header from '../components/Header';
import DocumentUpload from '../components/DocumentUpload';
import DocumentList from '../components/DocumentList';

/**
 * HomePage is the landing screen of the application.
 * It allows users to upload a PDF and see their existing documents.
 * 
 * Layout:
 * - Header
 * - Hero section with upload prompt
 * - Document upload area
 * - List of uploaded documents
 * - Footer with branding
 */
const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
           {/* Main content section */}
      <main className="flex-1 py-8 px-4">
        <div className="max-w-7xl mx-auto">
                    {/* Hero/intro section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Upload and Chat with Your PDFs</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Upload your PDF documents and ask questions to get instant answers based on the content.
            </p>
          </div>
           {/* Upload form */}
          <div className="mb-12">
            <DocumentUpload />
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Documents</h2>
            <DocumentList />
          </div>
        </div>
      </main>
        {/* Footer with copyright and branding */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} AI Planet • Powered by LangChain
        </div>
      </footer>
    </div>
  );
};

export default HomePage;