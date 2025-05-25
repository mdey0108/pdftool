import React, { useState } from 'react';
import FileUploader from './FileUploader';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import '../App.css';

const PdfMerger = () => {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [mergedPdf, setMergedPdf] = useState(null);
  const [isMerging, setIsMerging] = useState(false);

  const handleFilesAdded = (newFiles) => {
    setPdfFiles([...pdfFiles, ...newFiles]);
    setMergedPdf(null);
  };

  const removeFile = (index) => {
    const newFiles = [...pdfFiles];
    newFiles.splice(index, 1);
    setPdfFiles(newFiles);
    setMergedPdf(null);
  };

  const mergePdfs = async () => {
    if (pdfFiles.length < 2) return;
    
    setIsMerging(true);
    
    try {
      const mergedPdfDoc = await PDFDocument.create();
      
      for (const file of pdfFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
        pages.forEach(page => mergedPdfDoc.addPage(page));
      }
      
      const mergedPdfBytes = await mergedPdfDoc.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      setMergedPdf(URL.createObjectURL(blob));
    } catch (error) {
      console.error('Error merging PDFs:', error);
    } finally {
      setIsMerging(false);
    }
  };

  const downloadMergedPdf = () => {
    if (mergedPdf) {
      saveAs(mergedPdf, 'merged.pdf');
    }
  };

  return (
    <div className="pdf-merger">
      <h2>Merge PDFs</h2>
      <p>Combine multiple PDF files into one</p>
      
      <FileUploader 
        onFilesAdded={handleFilesAdded} 
        accept=".pdf,application/pdf"
      />
      
      <div className="file-list">
        {pdfFiles.map((file, index) => (
          <div key={index} className="file-item">
            <span>{file.name}</span>
            <button onClick={() => removeFile(index)}>Remove</button>
          </div>
        ))}
      </div>
      
      {pdfFiles.length >= 2 && (
        <div className="action-section">
          <button onClick={mergePdfs} disabled={isMerging}>
            {isMerging ? 'Merging...' : 'Merge PDFs'}
          </button>
        </div>
      )}
      
      {mergedPdf && (
        <div className="result-section">
          <h3>Merged PDF Preview</h3>
          <iframe 
            src={mergedPdf} 
            title="Merged PDF Preview"
            width="100%" 
            height="500px"
          />
          <button onClick={downloadMergedPdf}>Download Merged PDF</button>
        </div>
      )}
    </div>
  );
};

export default PdfMerger;