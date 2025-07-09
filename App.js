// frontend/src/App.js
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import AuctionPage from './components/AuctionPage';
import PaymentSuccess from './components/PaymentSuccess';
import Adminpage from './components/Adminpage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/auction/:id" element={<AuctionPage />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/adminpage" element={<Adminpage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
