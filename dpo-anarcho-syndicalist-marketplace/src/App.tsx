import React from 'react';
import MarketplaceHome from './components/marketplace/MarketplaceHome';
import { RevolutionaryTheme } from './components/ui/RevolutionaryTheme';
import './App.css';

function App() {
  return (
    <RevolutionaryTheme>
      <div className="app">
        <MarketplaceHome />
      </div>
    </RevolutionaryTheme>
  );
}

export default App;