import React from 'react';
import { useNavigate } from 'react-router-dom';
import { File, Trash2 } from 'lucide-react';
import { useDocuments } from '../context/DocumentContext';
import { formatFileSize, formatDate } from '../utils/format';

/**
 * This component displays a grid of uploaded documents.
 * 
 * - If no documents are available, it prompts the user to upload one.
 * - Each document card allows navigation to a chat page.
 * - Documents can also be deleted via a trash icon.
 */
const DocumentList: React.FC = () => {
  // Access documents and removal function from context
  const { documents, removeDocument } = useDocuments();
  // Hook to navigate
  const navigate = useNavigate();

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No documents uploaded yet.</p>
        <p className="text-sm mt-2">Upload a PDF to get started.</p>
      </div>
    );
  }
// Handle click on a document card to navigate to its chat interface
  
  const handleDocumentClick = (documentId: string) => {
    navigate(`/chat/${documentId}`);
  };
// Handle delete icon click.
  const handleDeleteClick = (e: React.MouseEvent, documentId: string) => {
    e.stopPropagation();
    removeDocument(documentId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((document) => (
        <div 
          key={document.id}
          onClick={() => handleDocumentClick(document.id)}
          className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="p-4 flex items-start space-x-3">
            <div className="bg-gray-100 rounded-md p-2 flex-shrink-0">
              <File className="h-6 w-6 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">{document.name}</h3>
              <div className="mt-1 flex items-center justify-between">
                <p className="text-xs text-gray-500">{formatFileSize(document.size)}</p>
                <p className="text-xs text-gray-500">{formatDate(document.uploadDate)}</p>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-500">Click to chat</span>
            <button 
              onClick={(e) => handleDeleteClick(e, document.id)}
              className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentList;