import React, { useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Stack,
  Alert,
} from '@mui/material';
import config from '../config';

function UserForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting form data:', formData);
      
      const response = await fetch(`${config.apiUrl}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.error || 'Something went wrong');
      }

      const data = await response.json();
      console.log('Success response:', data);
      
      // Clear form and show success message
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
      });
      setStatus({
        type: 'success',
        message: 'Form submitted successfully!'
      });

    } catch (error) {
      console.error('Submission error:', error);
      setStatus({
        type: 'error',
        message: 'Failed to submit form. Please try again.'
      });
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        py: 4,
      }}
    >
      <Card sx={{ maxWidth: 600, width: '100%' }}>
        <CardContent>
          <Typography
            variant="h1"
            sx={{
              mb: 4,
              fontSize: '2rem',
              textAlign: 'center',
              background: 'linear-gradient(45deg, #2196f3, #f50057)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Welcome
          </Typography>
          
          {status.message && (
            <Alert 
              severity={status.type} 
              sx={{ mb: 2 }}
              onClose={() => setStatus({ type: '', message: '' })}
            >
              {status.message}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Name"
                variant="outlined"
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              
              <TextField
                label="Phone"
                variant="outlined"
                fullWidth
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
              
              <TextField
                label="Address"
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
              
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  mt: 2,
                  background: 'linear-gradient(45deg, #2196f3 30%, #f50057 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976d2 30%, #dc004e 90%)',
                  },
                }}
              >
                Submit
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}

export default UserForm; 