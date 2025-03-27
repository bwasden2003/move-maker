import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import HomeScreen from './HomeScreen';
import MoveCreator from './MoveCreator';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
		<head>
			<link href="https://fonts.googleapis.com/css2?family=Faustina:ital,wght@0,300..800;1,300..800&family=PT+Sans+Caption:wght@400;700&display=swap" rel="stylesheet"></link>
		</head>
    <HomeScreen />
    <MoveCreator />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
