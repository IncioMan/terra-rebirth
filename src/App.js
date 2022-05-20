import logo from './images/terra.svg';
import './App.css';
import PoolChart from './components/PoolChart/PoolChart';
import { useState } from 'react';

function App() {

  return (
    <div className="App">
      <header className="App-header">
        <div className='div-logo'>
          <img src={logo} className="App-logo" alt="logo" />
        </div>
        <div></div>
        <PoolChart/>
      </header>
    </div>
  );
}

export default App;
