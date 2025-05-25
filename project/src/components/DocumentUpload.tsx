import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { useDocuments } from '../context/DocumentContext';
import { uploadDocument } from '../services/api';
import { cn } from '../utils/cn';

const DocumentUpload: React.FC = () => {
  const { addDocument } = useDocuments();
   // Upload status
  const [uploading, setUploading] = useState(false);
  // Upload error
  const [error, setError] = useState<string | null>(null);
   // Selected file
  const [file, setFile] = useState<File | null>(null);
  // validates file type and updates state.
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (selectedFile.type !== 'application/pdf') {
        setError('Only PDF files are accepted');
        return;
      }
      setFile(selectedFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });
//Uploads the selected PDF file to the backend,
  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const result = await uploadDocument(file);
      
      addDocument({
        id: result.document_id,
        name: file.name,
        uploadDate: new Date(),
        size: file.size
      });
      
      setFile(null);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const cancelUpload = () => {
    setFile(null);
    setError(null);
  };

  return (
    /* When no file is selected: Shows a drag-and-drop zone with a file selection button.
      When a file is selected: Displays the file preview with size and an "Upload" button.
      Upload error: Displays a red error message.
*/
    <div className="w-full max-w-3xl mx-auto">
      <div className={cn(
        "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center",
        isDragActive ? "border-emerald-500 bg-emerald-50" : "border-gray-300 bg-white",
        file ? "border-emerald-400" : ""
      )}>
        {!file ? (
          <div {...getRootProps()} className="w-full cursor-pointer py-8">
            <input {...getInputProps()} />
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-50 mb-4">
              <Upload className="h-6 w-6 text-emerald-500" />
            </div>
            <p className="text-gray-700 font-medium mb-1">
              {isDragActive ? "Drop your PDF here" : "Upload a PDF document"}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Drag and drop or click to browse
            </p>
            <button 
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-500 hover:bg-emerald-600"
            >
              Select PDF
            </button>
          </div>
        ) : (
          <div className="w-full py-4">
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 rounded-md">
                  <FileText className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="truncate max-w-[200px] sm:max-w-xs">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button 
                onClick={cancelUpload}
                className="p-1 rounded-full hover:bg-gray-200"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Uploading...
                  </>
                ) : "Upload Document"}
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 text-center text-red-500 text-sm">{error}</div>
      )}
    </div>
  );
};

export default DocumentUpload;