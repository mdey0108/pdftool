import React, { useState } from 'react';
import FileUploader from './FileUploader';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import '../App.css';

const PdfSplitter = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [splitRanges, setSplitRanges] = useState('');
  const [splitPdfs, setSplitPdfs] = useState([]);
  const [isSplitting, setIsSplitting] = useState(false);

  const handleFileAdded = (files) => {
    if (files.length > 0) {
      setPdfFile(files[0]);
      setSplitPdfs([]);
    }
  };

  const splitPdf = async () => {
    if (!pdfFile || !splitRanges.trim()) return;
    
    setIsSplitting(true);
    setSplitPdfs([]);
    
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      const pageCount = originalPdf.getPageCount();
      
      // Parse ranges (e.g., "1-3,5,7-9")
      const ranges = splitRanges.split(',').map(range => {
        const [start, end] = range.split('-').map(num => parseInt(num.trim()));
        return {
          start: isNaN(start) ? 1 : Math.max(1, Math.min(start, pageCount)),
          end: isNaN(end) ? start : Math.max(start, Math.min(end, pageCount))
        };
      });
      
      const newSplitPdfs = [];
      
      for (const range of ranges) {
        const splitPdf = await PDFDocument.create();
        const pages = await splitPdf.copyPages(originalPdf, 
          Array.from({ length: range.end - range.start + 1 }, (_, i) => range.start - 1 + i)
        );
        pages.forEach(page => splitPdf.addPage(page));
        
        const splitPdfBytes = await splitPdf.save();
        const blob = new Blob([splitPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        newSplitPdfs.push({
          url,
          range: `${range.start}-${range.end}`,
          pageCount: range.end - range.start + 1
        });
      }
      
      setSplitPdfs(newSplitPdfs);
    } catch (error) {
      console.error('Error splitting PDF:', error);
    } finally {
      setIsSplitting(false);
    }
  };

  const downloadSplitPdf = (url, range) => {
    saveAs(url, `split_${range}.pdf`);
  };

  return (
    <div className="pdf-splitter">
      <h2>Split PDF</h2>
      <p>Split a PDF file into multiple files by page ranges</p>
      
      <FileUploader 
        onFilesAdded={handleFileAdded} 
        accept=".pdf,application/pdf"
        multiple={false}
      />
      
      {pdfFile && (
        <div className="split-section">
          <div className="input-group">
            <label>Page ranges to split (e.g., "1-3,5,7-9"):</label>
            <input
              type="text"
              value={splitRanges}
              onChange={(e) => setSplitRanges(e.target.value)}
              placeholder="Enter page ranges"
            />
          </div>
          
          <button onClick={splitPdf} disabled={isSplitting || !splitRanges.trim()}>
            {isSplitting ? 'Splitting...' : 'Split PDF'}
          </button>
        </div>
      )}
      
      {splitPdfs.length > 0 && (
        <div className="result-section">
          <h3>Split PDF Results</h3>
          <div className="split-results">
            {splitPdfs.map((splitPdf, index) => (
              <div key={index} className="split-item">
                <div>
                  <span>Pages: {splitPdf.range} ({splitPdf.pageCount} pages)</span>
                  <button onClick={() => downloadSplitPdf(splitPdf.url, splitPdf.range)}>
                    Download
                  </button>
                </div>
                <iframe 
                  src={splitPdf.url} 
                  title={`Split PDF ${splitPdf.range}`}
                  width="100%" 
                  height="300px"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfSplitter;