import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
  Container,
  Typography,
  Button,
  TextField,
  Box,
  Paper
} from '@mui/material';

export default function AuctionPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const socket = useRef();

  const [product, setProduct] = useState(null);
  const [currentBid, setCurrentBid] = useState(0);
  const [currentBidder, setCurrentBidder] = useState('');
  const [bidValue, setBidValue] = useState('');
  const [timer, setTimer] = useState(20);
  const [ended, setEnded] = useState(false);

  const userId = localStorage.getItem('userId');

  // Fetch product
  useEffect(() => {
    axios.get(`http://localhost:5000/api/products/${id}`)
      .then(res => {
        setProduct(res.data);
        setCurrentBid(res.data.currentBid ?? res.data.basePrice);
        setCurrentBidder(res.data.currentBidder ?? '');
      })
      .catch(() => nav('/dashboard'));
  }, [id, nav]);

  // Initialize socket
  useEffect(() => {
    socket.current = io('http://localhost:5000');
    socket.current.emit('joinAuction', { productId: id });

    socket.current.on('newBid', data => {
      setCurrentBid(data.bid);
      setCurrentBidder(data.userId);
      setTimer(20);
    });

    socket.current.on('auctionEnded', data => {
      setCurrentBid(data.finalBid);
      setCurrentBidder(data.soldTo);
      setEnded(true);
    });

    return () => socket.current.disconnect();
  }, [id]);

  // Timer handling
  useEffect(() => {
    if (ended) return;
    if (timer <= 0) {
      socket.current.emit('finishAuction', { productId: id });
      setEnded(true);
      return;
    }
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer, ended, id]);

  const placeBid = () => {
    const val = Number(bidValue);
    if (!val || val <= currentBid) return alert('Bid must be higher than current bid');
    socket.current.emit('bid', { productId: id, userId, bid: val });
    setBidValue('');
  };

  const payNow = () => {
    axios.post('http://localhost:5000/api/checkout', {
      userId,
      productId: id,
      bid: currentBid
    }).then(() => nav(`/payment-success?product=${id}&amount=${currentBid}`))
      .catch(() => alert('Payment failed'));
  };

  if (!product) return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(to right top, #1f1c2c, #928dab)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff'
    }}>
      <Typography variant="h4">Loading...</Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to right top, #1f1c2c, #928dab)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
      }}
    >
      <Paper
        sx={{
          width: '100%',
          maxWidth: 600,
          padding: 4,
          borderRadius: 3,
          background: 'rgba(255,255,255,0.07)',
          color: '#fff',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 0 20px rgba(0, 229, 255, 0.2)',
        }}
      >
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
          {product.name}
        </Typography>
        <Typography>💰 Base Price: ₹{product.basePrice}</Typography>
        <Typography>🔼 Current Bid: ₹{currentBid}</Typography>
        <Typography>👤 Highest Bidder: {currentBidder || 'None'}</Typography>
        <Typography
          sx={{
            mt: 1,
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: timer <= 5 ? '#ff5252' : '#00e5ff',
            animation: timer <= 5 ? 'blinker 1s infinite' : 'none',
          }}
        >
          ⏳ Time Left: {timer}s
        </Typography>

        {!ended ? (
          <>
            <TextField
              label="Enter Your Bid"
              type="number"
              value={bidValue}
              onChange={e => setBidValue(e.target.value)}
              fullWidth
              sx={{
                mt: 3,
                backgroundColor: '#fff',
                borderRadius: 1
              }}
            />
            <Button
              fullWidth
              variant="contained"
              onClick={placeBid}
              sx={{
                mt: 2,
                background: 'linear-gradient(to right, #00e5ff, #00c853)',
                color: '#fff',
                fontWeight: 'bold',
                borderRadius: '30px',
                '&:hover': {
                  background: 'linear-gradient(to right, #00c853, #00e5ff)',
                  transform: 'scale(1.02)',
                }
              }}
            >
              Place Bid
            </Button>
          </>
        ) : (
          <>
            <Typography
              variant="h6"
              sx={{ mt: 4, color: currentBidder === userId ? '#00e676' : '#ff4081' }}
            >
              Auction Ended. Winner: {currentBidder === userId ? 'You 🎉' : currentBidder}
            </Typography>
            {currentBidder === userId && (
              <Button
                fullWidth
                variant="contained"
                onClick={payNow}
                sx={{
                  mt: 2,
                  background: 'linear-gradient(to right, #ff4081, #f50057)',
                  color: '#fff',
                  fontWeight: 'bold',
                  borderRadius: '30px',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    background: 'linear-gradient(to right, #f50057, #ff4081)',
                  },
                }}
              >
                Pay ₹{currentBid}
              </Button>
            )}
          </>
        )}
      </Paper>

      {/* Blinking style */}
      <style>
        {`
          @keyframes blinker {
            50% { opacity: 0; }
          }
        `}
      </style>
    </Box>
  );
}
