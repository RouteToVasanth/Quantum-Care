// Entry point for the React application. It renders the App component into the DOM.

// Import React library and ReactDOM for rendering the app.
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css' // Import global styles.
import App from './App' // Import the main App component.
import reportWebVitals from './reportWebVitals' // Import script for measuring performance.

// Create a root DOM node and render the App component within it, wrapped in React.StrictMode for highlighting potential problems.
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

reportWebVitals() // Call reportWebVitals to measure and report on app performance.
