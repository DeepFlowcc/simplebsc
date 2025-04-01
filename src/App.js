import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import './App.css';

// Components
import Transactions from './components/Transactions';
import PancakeSwap from './components/PancakeSwap';
import BatchSwap from './components/BatchSwap';

function App() {
  return (
    <WalletProvider>
      <Router>
        <div className="App">
          <nav className="navbar">
            <ul>
              <li><Link to="/">Transactions</Link></li>
              <li><Link to="/pancakeswap">PancakeSwap</Link></li>
              <li><Link to="/batchswap">Batch Swap</Link></li>
            </ul>
          </nav>
          
          <div className="container">
            <Routes>
              <Route path="/" element={<Transactions />} />
              <Route path="/pancakeswap" element={<PancakeSwap />} />
              <Route path="/batchswap" element={<BatchSwap />} />
            </Routes>
          </div>
        </div>
      </Router>
    </WalletProvider>
  );
}

export default App; 