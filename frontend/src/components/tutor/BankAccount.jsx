import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  Alert,
  Grid,
} from '@mui/material';
import { CreditCard, Save, Building2 } from 'lucide-react';

const TUTOR_COLORS = {
  cream: '#F8F4DF',
  maroon: '#9A2F2E',
  maroonLight: 'rgba(154, 47, 46, 0.08)',
};

const BankAccount = () => {
  const [bankData, setBankData] = useState({
    bank_name: '',
    account_number: '',
    account_holder_name: '',
    iban: '',
    swift_code: '',
    branch_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchBankAccount();
  }, []);

  const fetchBankAccount = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:8000/api/accounts/tutor/bank-account/', {
        headers: { Authorization: `Token ${token}` }
      });
      setBankData(response.data);
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error('Error fetching bank account:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!bankData.bank_name || !bankData.account_number || !bankData.account_holder_name) {
      setMessage({ type: 'error', text: 'Please fill in all required fields (Bank Name, Account Number, Account Holder Name)' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://127.0.0.1:8000/api/accounts/tutor/bank-account/', bankData, {
        headers: { Authorization: `Token ${token}` }
      });
      setMessage({ type: 'success', text: 'Bank account information saved successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error saving bank account information' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field) => (e) => {
    setBankData({ ...bankData, [field]: e.target.value });
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Paper
        sx={{
          p: 4,
          borderRadius: 3,
          border: `2px solid ${TUTOR_COLORS.maroonLight}`,
          bgcolor: 'rgba(255, 255, 255, 0.6)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Building2 size={32} color={TUTOR_COLORS.maroon} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: TUTOR_COLORS.maroon }}>
              Bank Account Information
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Add your bank account details to receive payments from paid courses
            </Typography>
          </Box>
        </Box>

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Bank Name *"
              value={bankData.bank_name}
              onChange={handleChange('bank_name')}
              required
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Account Number *"
              value={bankData.account_number}
              onChange={handleChange('account_number')}
              required
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Account Holder Name *"
              value={bankData.account_holder_name}
              onChange={handleChange('account_holder_name')}
              required
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="IBAN (Optional)"
              value={bankData.iban || ''}
              onChange={handleChange('iban')}
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="SWIFT Code (Optional)"
              value={bankData.swift_code || ''}
              onChange={handleChange('swift_code')}
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Branch Name (Optional)"
              value={bankData.branch_name || ''}
              onChange={handleChange('branch_name')}
              sx={{ mb: 2 }}
            />
          </Grid>
        </Grid>

        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<Save size={20} />}
            onClick={handleSave}
            disabled={saving}
            sx={{
              bgcolor: TUTOR_COLORS.maroon,
              '&:hover': { bgcolor: '#7a2627' },
              fontWeight: 800,
            }}
          >
            {saving ? 'Saving...' : 'Save Bank Account'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default BankAccount;
