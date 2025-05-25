import React, { useState } from 'react';
import FileUploader from './FileUploader';
import { pdfjs } from 'react-pdf';
import { saveAs } from 'file-saver';
import '../App.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PdfToImage = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [images, setImages] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState(null);
  const [imageQuality, setImageQuality] = useState(1.5); // Default scale factor
  const [imageType, setImageType] = useState('png'); // 'png' or 'jpeg'

  const handleFileAdded = (files) => {
    if (files.length > 0) {
      setPdfFile(files[0]);
      setImages([]);
      setError(null);
    }
  };

  const convertToImages = async () => {
    if (!pdfFile) return;

    setIsConverting(true);
    setImages([]);
    setError(null);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;
      const newImages = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: imageQuality });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;

        let imageData;
        if (imageType === 'jpeg') {
          imageData = canvas.toDataURL('image/jpeg', 0.92); // 0.92 is JPEG quality
        } else {
          imageData = canvas.toDataURL('image/png');
        }

        newImages.push({
          data: imageData,
          pageNumber: i,
          width: viewport.width,
          height: viewport.height
        });
      }

      setImages(newImages);
    } catch (err) {
      console.error('Error converting PDF to images:', err);
      setError('Failed to convert PDF. The file might be corrupted or password protected.');
    } finally {
      setIsConverting(false);
    }
  };

  const downloadImage = (imageData, pageNumber) => {
    const extension = imageType === 'jpeg' ? 'jpg' : 'png';
    saveAs(imageData, `page_${pageNumber}.${extension}`);
  };

  const downloadAllImages = () => {
    const extension = imageType === 'jpeg' ? 'jpg' : 'png';
    images.forEach((image) => {
      saveAs(image.data, `page_${image.pageNumber}.${extension}`);
    });
  };

  return (
    <div className="pdf-to-image">
      <h2>Convert PDF to Images</h2>
      <p>Upload a PDF file to convert its pages to high-quality images</p>

      <FileUploader
        onFilesAdded={handleFileAdded}
        accept=".pdf,application/pdf"
        multiple={false}
      />

      {pdfFile && (
        <div className="conversion-options">
          <div className="option-group">
            <label>Image Quality (Scale):</label>
            <select
              value={imageQuality}
              onChange={(e) => setImageQuality(parseFloat(e.target.value))}
              disabled={isConverting}
            >
              <option value={1.0}>Low (1.0x)</option>
              <option value={1.5}>Medium (1.5x)</option>
              <option value={2.0}>High (2.0x)</option>
              <option value={3.0}>Very High (3.0x)</option>
            </select>
          </div>

          <div className="option-group">
            <label>Image Format:</label>
            <select
              value={imageType}
              onChange={(e) => setImageType(e.target.value)}
              disabled={isConverting}
            >
              <option value="png">PNG (Lossless)</option>
              <option value="jpeg">JPEG (Smaller file size)</option>
            </select>
          </div>

          <button
            onClick={convertToImages}
            disabled={isConverting}
            className="convert-button"
          >
            {isConverting ? 'Converting...' : 'Convert to Images'}
          </button>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {images.length > 0 && (
        <div className="results-section">
          <div className="results-header">
            <h3>Converted Images ({images.length} pages)</h3>
            <button
              onClick={downloadAllImages}
              className="download-all-button"
            >
              Download All as {imageType.toUpperCase()}
            </button>
          </div>

          <div className="image-grid">
            {images.map((image, index) => (
              <div key={index} className="image-item">
                <div className="image-container">
                  <img
                    src={image.data}
                    alt={`Page ${image.pageNumber}`}
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </div>
                <div className="image-info">
                  <span>Page {image.pageNumber}</span>
                  <span>{Math.round(image.width)}×{Math.round(image.height)} px</span>
                  <button
                    onClick={() => downloadImage(image.data, image.pageNumber)}
                    className="download-button"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfToImage;