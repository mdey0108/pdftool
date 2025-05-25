import React, { useState } from 'react';
import FileUploader from './FileUploader';
import { pdfjs } from 'react-pdf';
import { saveAs } from 'file-saver';
import '../App.css';

// Configure PDF.js worker
// pdfjs.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PdfToImage = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [images, setImages] = useState([]);
  const [isConverting, setIsConverting] = useState(false);

  const handleFileAdded = (files) => {
    if (files.length > 0) {
      setPdfFile(files[0]);
      setImages([]);
    }
  };

  const convertToImages = async () => {
    if (!pdfFile) return;

    setIsConverting(true);
    setImages([]);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;
      const newImages = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;

        const imageData = canvas.toDataURL('image/png');
        newImages.push({
          data: imageData,
          pageNumber: i
        });
      }

      setImages(newImages);
    } catch (error) {
      console.error('Error converting PDF to images:', error);
    } finally {
      setIsConverting(false);
    }
  };

  const downloadImage = (imageData, pageNumber) => {
    saveAs(imageData, `page_${pageNumber}.png`);
  };

  const downloadAllImages = () => {
    images.forEach((image) => {
      saveAs(image.data, `page_${image.pageNumber}.png`);
    });
  };

  return (
    <div className="pdf-to-image">
      <h2>Convert PDF to Images</h2>
      <p>Upload a PDF file to convert its pages to images</p>

      <FileUploader
        onFilesAdded={handleFileAdded}
        accept=".pdf,application/pdf"
        multiple={false}
      />

      {pdfFile && (
        <div className="action-section">
          <button onClick={convertToImages} disabled={isConverting}>
            {isConverting ? 'Converting...' : 'Convert to Images'}
          </button>
        </div>
      )}

      {images.length > 0 && (
        <div className="results-section">
          <h3>Converted Images</h3>
          <button onClick={downloadAllImages}>Download All</button>

          <div className="image-grid">
            {images.map((image, index) => (
              <div key={index} className="image-item">
                <img src={image.data} alt={`Page ${image.pageNumber}`} />
                <button onClick={() => downloadImage(image.data, image.pageNumber)}>
                  Download Page {image.pageNumber}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfToImage;