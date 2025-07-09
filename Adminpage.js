import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Grid, CircularProgress, Divider
} from '@mui/material';
import axios from 'axios';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const userRes = await axios.get('http://localhost:5000/api/users');
        const productRes = await axios.get('http://localhost:5000/api/products');
        setUsers(userRes.data);
        setProducts(productRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const getProductNameById = (id) => {
    const prod = products.find(p => p._id === id);
    return prod ? prod.name : 'Unknown';
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', mt: 10 }}>
        <CircularProgress color="secondary" />
        <Typography mt={2} color="white">Loading Admin Dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(to right, #1f1c2c, #928dab)',
      padding: 4,
    }}>
      <Typography
        variant="h3"
        gutterBottom
        sx={{
          textAlign: 'center',
          color: 'white',
          fontWeight: 'bold',
          mb: 5,
          textShadow: '1px 1px 10px #000'
        }}
      >
        Admin Dashboard
      </Typography>

      <Grid container spacing={4}>
        {users.map(user => (
          <Grid item xs={12} md={6} lg={4} key={user._id}>
            <Paper elevation={6} sx={{
              background: 'rgba(255,255,255,0.08)',
              color: 'white',
              padding: 3,
              borderRadius: 4,
              backdropFilter: 'blur(8px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'scale(1.03)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
              }
            }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#00e5ff' }}>
                👤 {user.userId}
              </Typography>

              <Typography variant="subtitle2" sx={{ color: '#bdbdbd' }}>
                Password: <strong style={{ color: '#ff4081' }}>{user.password}</strong>
              </Typography>

              <Divider sx={{ my: 2, backgroundColor: '#ffffff44' }} />

              <Typography variant="subtitle1" sx={{ color: '#ffcc80', mb: 1 }}>
                Purchase History:
              </Typography>
              {user.purchases?.length > 0 ? (
                user.purchases.map((p, idx) => (
                  <Box key={idx} sx={{ ml: 1, mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#90caf9' }}>
                      🆔 <strong>{p.product}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#ffffff' }}>
                      🛍️ <strong>{getProductNameById(p.product)}</strong> – ₹{p.amount}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#cfd8dc' }}>
                      📅 {new Date(p.date).toLocaleString()}
                    </Typography>
                    <Divider sx={{ my: 1, backgroundColor: '#ffffff22' }} />
                  </Box>
                ))
              ) : (
                <Typography variant="body2" sx={{ color: '#f48fb1' }}>No purchases yet.</Typography>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
