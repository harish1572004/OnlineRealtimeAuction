import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Card,
  CardContent
} from '@mui/material';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [soldProducts, setSoldProducts] = useState([]);
  const [form, setForm] = useState({ name: '', basePrice: '' });
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) return navigate('/');
    fetchProducts();
    fetchSoldProducts();
  }, [userId, navigate]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchSoldProducts = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/products/sold/${username}`);
      setSoldProducts(res.data);
    } catch (err) {
      console.error('Error fetching sold products:', err);
    }
  };

  const addProduct = async () => {
    if (!form.name || !form.basePrice) return alert('Please fill out all fields');
    try {
      await axios.post('http://localhost:5000/api/products', {
        ...form,
        addedBy: username,
        basePrice: Number(form.basePrice),
      });
      setForm({ name: '', basePrice: '' });
      fetchProducts();
    } catch (err) {
      console.error('Failed to add product:', err);
    }
  };

  const goToAuction = (id) => {
    navigate(`/auction/${id}`);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to right top, #1f1c2c, #928dab)',
        color: '#fff',
        padding: 4,
        fontFamily: 'Roboto, sans-serif',
      }}
    >
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
        Welcome, <span style={{ color: '#00e5ff' }}>{username}</span>
      </Typography>

      {/* Add Product Form */}
      <Paper
        sx={{
          p: 4,
          borderRadius: 3,
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 0 15px rgba(0, 229, 255, 0.2)',
          mb: 5,
        }}
      >
        <Typography variant="h5" sx={{ mb: 2 }}>
          Add Product for Auction
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label="Product Name"
              name="name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              sx={{ backgroundColor: '#fff', borderRadius: 1 }}
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label="Base Price (₹)"
              name="basePrice"
              type="number"
              value={form.basePrice}
              onChange={e => setForm({ ...form, basePrice: e.target.value })}
              sx={{ backgroundColor: '#fff', borderRadius: 1 }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={addProduct}
              sx={{
                height: '100%',
                background: 'linear-gradient(to right, #ff4081, #f50057)',
                fontWeight: 'bold',
                borderRadius: '30px',
                color: '#fff',
                '&:hover': {
                  transform: 'scale(1.03)',
                  background: 'linear-gradient(to right, #f50057, #ff4081)',
                },
              }}
            >
              Add
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Available Products */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Available Products
      </Typography>
      <Grid container spacing={2} mb={4}>
        {products.filter(p => !p.sold).map(product => (
          <Grid item xs={12} sm={6} md={4} key={product._id}>
            <Card
              onClick={() => goToAuction(product._id)}
              sx={{
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.07)',
                color: '#fff',
                transition: '0.3s',
                backdropFilter: 'blur(8px)',
                '&:hover': {
                  transform: 'scale(1.03)',
                  boxShadow: '0 0 12px #00e5ff',
                },
              }}
            >
              <CardContent>
                <Typography variant="h6">{product.name}</Typography>
                <Typography>
                  Current Bid: ₹{product.currentBid ?? product.basePrice}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Sold Products */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Sold Products
      </Typography>
      <Grid container spacing={2}>
        {soldProducts.map(product => (
          <Grid item xs={12} sm={6} md={4} key={product._id}>
            <Card
              sx={{
                background: 'rgba(255,255,255,0.05)',
                color: '#fff',
                backdropFilter: 'blur(8px)',
                borderLeft: '5px solid #f50057',
              }}
            >
              <CardContent>
                <Typography variant="h6">{product.name}</Typography>
                <Typography color="text.secondary">Status: Sold</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
