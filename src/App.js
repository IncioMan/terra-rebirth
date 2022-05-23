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
          <div style={{paddingTop: "10px", paddingLeft: "16px"}}>
            Proposal <a target='_blank' style={{color:'#1876d1'}} href='https://station.terra.money/proposal/1623'>#1623</a> - Rebirth Terra Network
          </div>
        </div>
        <PoolChart/>
      </header>
    </div>
  );
}

export default App;
