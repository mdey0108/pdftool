import React, { useState } from 'react';
import FileUploader from './FileUploader';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import '../App.css';

const PdfCreator = () => {
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isCreating, setIsCreating] = useState(false);

  const handleFilesAdded = (newFiles) => {
    setFiles([...files, ...newFiles]);
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const createPdf = async () => {
    if (files.length === 0) return;
    
    setIsCreating(true);
    setProgress(0);
    
    const pdf = new jsPDF();
    const updateProgress = (value) => {
      setProgress(Math.min(100, Math.max(0, value)));
    };
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        updateProgress((i / files.length) * 100);
        
        if (file.type === 'text/plain') {
          const text = await file.text();
          pdf.text(text, 10, 10);
          if (i < files.length - 1) pdf.addPage();
        } 
        else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          // For DOCX files, we would need a docx parser library
          // This is a simplified example
          pdf.text(`DOCX content would go here for ${file.name}`, 10, 10);
          if (i < files.length - 1) pdf.addPage();
        } 
        else if (file.type.startsWith('image/')) {
          const imgData = await readFileAsDataURL(file);
          const imgProps = pdf.getImageProperties(imgData);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          
          pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
          if (i < files.length - 1) pdf.addPage();
        }
      }
      
      updateProgress(100);
      pdf.save('created.pdf');
    } catch (error) {
      console.error('Error creating PDF:', error);
    } finally {
      setIsCreating(false);
    }
  };
  
  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="pdf-creator">
      <h2>Create PDF from Files</h2>
      <p>Upload text (.txt), Word (.docx), or image files to combine into a PDF</p>
      
      <FileUploader 
        onFilesAdded={handleFilesAdded} 
        accept=".txt,.docx,.jpg,.jpeg,.png,.gif,image/*,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      />
      
      <div className="file-list">
        {files.map((file, index) => (
          <div key={index} className="file-item">
            <span>{file.name}</span>
            <button onClick={() => removeFile(index)}>Remove</button>
          </div>
        ))}
      </div>
      
      {files.length > 0 && (
        <div className="action-section">
          <button onClick={createPdf} disabled={isCreating}>
            {isCreating ? `Creating PDF... ${progress}%` : 'Create PDF'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PdfCreator;