import React from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
// import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Tools from './pages/Tools';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <Link to="/" className="logo">PDFTool</Link>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/tools">Tools</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tools" element={<Tools />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;