import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import './index.css';  // Se você tiver um arquivo de estilos global

const rootElement = document.getElementById('root') as HTMLElement;

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  rootElement
);
