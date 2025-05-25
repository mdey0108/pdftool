import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const Home = () => {
  return (
    <div className="home-container">
      <h1>Welcome to PDFTool</h1>
      <p>Your all-in-one PDF solution</p>
      
      <div className="tool-cards">
        <Link to="/tools?tool=create" className="tool-card">
          <h3>Create PDF</h3>
          <p>From text, docx, or images</p>
        </Link>
        
        <Link to="/tools?tool=convert" className="tool-card">
          <h3>Convert PDF</h3>
          <p>PDF to images</p>
        </Link>
        
        <Link to="/tools?tool=edit" className="tool-card">
          <h3>Edit PDF</h3>
          <p>Modify existing PDFs</p>
        </Link>
        
        <Link to="/tools?tool=merge" className="tool-card">
          <h3>Merge PDF</h3>
          <p>Combine multiple PDFs</p>
        </Link>
        
        <Link to="/tools?tool=split" className="tool-card">
          <h3>Split PDF</h3>
          <p>Divide PDF into parts</p>
        </Link>
      </div>
    </div>
  );
};

export default Home;