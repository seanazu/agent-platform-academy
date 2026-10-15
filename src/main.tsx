import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import './styles/tokens.css';
import './styles/app.css';
import './styles/v2.css';
import './styles/widgets.css';

const root = document.getElementById('root');
if (root) createRoot(root).render(<StrictMode><App /></StrictMode>);
