import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Lock, Person } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function LoginPage() {
  const [form, setForm] = useState({ userId: '', password: '' });
  const [adminForm, setAdminForm] = useState({ adminId: '', adminPass: '' });
  const [adminOpen, setAdminOpen] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    if (!form.userId || !form.password) {
      return alert("Please enter both User ID and Password");
    }

    try {
      const res = await axios.post('http://localhost:5000/api/login', form);
      const { user } = res.data;
      localStorage.setItem('userId', user._id);
      localStorage.setItem('username', user.userId);
      navigate('/dashboard');
    } catch (err) {
      alert('Login failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAdminLogin = () => {
    const { adminId, adminPass } = adminForm;
    if (adminId === 'admin' && adminPass === 'admin123') {
      localStorage.setItem('admin', 'true');
      navigate('/adminpage');
    } else {
      alert('Invalid Admin Credentials');
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        background: 'linear-gradient(120deg, #1f1c2c, #928dab)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '100%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.05), rgba(0,0,0,0.3))',
          zIndex: 1
        }}
      />

      <Typography
        variant="h2"
        gutterBottom
        sx={{
          fontWeight: 'bold',
          letterSpacing: 2,
          zIndex: 2,
          textAlign: 'center',
          color: '#fff',
          mb: 5,
          userSelect: 'none'
        }}
      >
        <span style={{ color: '#ffffff' }}>Online </span>
        <span style={{ color: '#ff4081' }}>Auction </span>
        <span style={{ color: '#00e5ff' }}>Platform</span>
      </Typography>

      <Paper
        elevation={10}
        sx={{
          width: 360,
          maxWidth: '90%',
          padding: '40px 30px',
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
          zIndex: 2,
          textAlign: 'center',
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#fff' }}>
          Login to Continue
        </Typography>

        <TextField
          name="userId"
          label="User ID"
          variant="outlined"
          fullWidth
          margin="normal"
          value={form.userId}
          onChange={handleChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Person />
              </InputAdornment>
            )
          }}
          sx={{ backgroundColor: '#fff', borderRadius: 1 }}
        />

        <TextField
          name="password"
          type="password"
          label="Password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={form.password}
          onChange={handleChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock />
              </InputAdornment>
            )
          }}
          sx={{ backgroundColor: '#fff', borderRadius: 1 }}
        />

        <Button
          fullWidth
          variant="contained"
          onClick={handleLogin}
          sx={{
            mt: 2,
            background: 'linear-gradient(45deg, #ff4081, #f50057)',
            color: '#fff',
            fontWeight: 'bold',
            borderRadius: '30px',
            padding: '10px',
            fontSize: '16px',
            transition: 'all 0.3s',
            '&:hover': {
              transform: 'scale(1.05)',
              background: 'linear-gradient(45deg, #f50057, #ff4081)'
            }
          }}
        >
          User Login
        </Button>

        <Button
          fullWidth
          onClick={() => setAdminOpen(true)}
          sx={{
            mt: 2,
            border: '1px solid #fff',
            color: '#fff',
            fontWeight: 'bold',
            borderRadius: '30px',
            padding: '10px',
            fontSize: '16px',
            '&:hover': {
              background: 'rgba(255,255,255,0.1)'
            }
          }}
        >
          Admin Login
        </Button>
      </Paper>

      {/* Admin Login Modal */}
      <Dialog open={adminOpen} onClose={() => setAdminOpen(false)}>
        <DialogTitle>Admin Login</DialogTitle>
        <DialogContent>
          <TextField
            label="Admin ID"
            fullWidth
            margin="dense"
            value={adminForm.adminId}
            onChange={e => setAdminForm({ ...adminForm, adminId: e.target.value })}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="dense"
            value={adminForm.adminPass}
            onChange={e => setAdminForm({ ...adminForm, adminPass: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdminOpen(false)} color="error">Cancel</Button>
          <Button onClick={handleAdminLogin} color="primary">Login</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
