import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PdfCreator from '../components/PdfCreator';
import PdfToImage from '../components/PdfToImage';
import PdfEditor from '../components/PdfEditor';
import PdfMerger from '../components/PdfMerger';
import PdfSplitter from '../components/PdfSplitter';
import '../App.css';

const Tools = () => {
  const [searchParams] = useSearchParams();
  const [activeTool, setActiveTool] = useState('create');

  useEffect(() => {
    const tool = searchParams.get('tool') || 'create';
    setActiveTool(tool);
  }, [searchParams]);

  const renderTool = () => {
    switch (activeTool) {
      case 'create':
        return <PdfCreator />;
      case 'convert':
        return <PdfToImage />;
      case 'edit':
        return <PdfEditor />;
      case 'merge':
        return <PdfMerger />;
      case 'split':
        return <PdfSplitter />;
      default:
        return <PdfCreator />;
    }
  };

  return (
    <div className="tools-container">
      <div className="tool-selector">
        <button 
          onClick={() => setActiveTool('create')} 
          className={activeTool === 'create' ? 'active' : ''}
        >
          Create PDF
        </button>
        <button 
          onClick={() => setActiveTool('convert')} 
          className={activeTool === 'convert' ? 'active' : ''}
        >
          Convert to Images
        </button>
        <button 
          onClick={() => setActiveTool('edit')} 
          className={activeTool === 'edit' ? 'active' : ''}
        >
          Edit PDF
        </button>
        <button 
          onClick={() => setActiveTool('merge')} 
          className={activeTool === 'merge' ? 'active' : ''}
        >
          Merge PDFs
        </button>
        <button 
          onClick={() => setActiveTool('split')} 
          className={activeTool === 'split' ? 'active' : ''}
        >
          Split PDF
        </button>
      </div>
      
      <div className="tool-content">
        {renderTool()}
      </div>
    </div>
  );
};

export default Tools;