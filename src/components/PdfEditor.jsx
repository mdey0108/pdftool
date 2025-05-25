import React, { useState } from 'react';
import FileUploader from './FileUploader';
import { PDFDocument, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';
import '../App.css';

const PdfEditor = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [editedPdf, setEditedPdf] = useState(null);
  const [textToAdd, setTextToAdd] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleFileAdded = (files) => {
    if (files.length > 0) {
      setPdfFile(files[0]);
      setEditedPdf(null);
    }
  };

  const editPdf = async () => {
    if (!pdfFile || !textToAdd.trim()) return;
    
    setIsEditing(true);
    
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      
      // Add text to each page
      pages.forEach(page => {
        const { width, height } = page.getSize();
        page.drawText(textToAdd, {
          x: 50,
          y: height - 50,
          size: 12,
          color: rgb(0, 0, 0),
        });
      });
      
      const editedPdfBytes = await pdfDoc.save();
      const blob = new Blob([editedPdfBytes], { type: 'application/pdf' });
      setEditedPdf(URL.createObjectURL(blob));
    } catch (error) {
      console.error('Error editing PDF:', error);
    } finally {
      setIsEditing(false);
    }
  };

  const downloadEditedPdf = () => {
    if (editedPdf) {
      saveAs(editedPdf, 'edited.pdf');
    }
  };

  return (
    <div className="pdf-editor">
      <h2>Edit PDF</h2>
      <p>Add text to an existing PDF document</p>
      
      <FileUploader 
        onFilesAdded={handleFileAdded} 
        accept=".pdf,application/pdf"
        multiple={false}
      />
      
      {pdfFile && (
        <div className="edit-section">
          <textarea
            value={textToAdd}
            onChange={(e) => setTextToAdd(e.target.value)}
            placeholder="Enter text to add to the PDF"
            rows={4}
          />
          
          <button onClick={editPdf} disabled={isEditing || !textToAdd.trim()}>
            {isEditing ? 'Editing...' : 'Edit PDF'}
          </button>
        </div>
      )}
      
      {editedPdf && (
        <div className="result-section">
          <h3>Edited PDF Preview</h3>
          <iframe 
            src={editedPdf} 
            title="Edited PDF Preview"
            width="100%" 
            height="500px"
          />
          <button onClick={downloadEditedPdf}>Download Edited PDF</button>
        </div>
      )}
    </div>
  );
};

export default PdfEditor;