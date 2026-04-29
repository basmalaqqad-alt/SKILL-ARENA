// ─────────────────────────────────────────────────────────────────
//  PaymentStep.jsx
//  The full payment flow: Apple Pay / Card / Bank Transfer.
//  Props:
//    course     – the course object (needs .title, .price)
//    onPay      – async fn(payload) called when user confirms payment
//    onCancel   – fn() called when user goes back
//    submitting – bool, disables buttons while API call is in flight
// ─────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
  Box, Typography, Paper, Stack, Chip, Avatar,
  TextField, Button, Collapse,
} from '@mui/material';
import { Smartphone, CreditCard, Building2 } from 'lucide-react';
import { MAROON, MAROON_DARK, MAROON_LIGHT } from './coursesConstants';

// ── Format card number as "1234 5678 9012 3456" ──────────────────
const formatCard = (v) => {
  const digits = v.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

// ────────────────────────────────────────────────────────────────
const PaymentStep = ({ course, onPay, submitting }) => {
  const [method, setMethod] = useState(null);

  // Card fields
  const [name,    setName]    = useState('');
  const [cardNum, setCardNum] = useState('');
  const [mm,      setMm]      = useState('');
  const [yyyy,    setYyyy]    = useState('');
  const [cvv,     setCvv]     = useState('');

  // Bank transfer field
  const [ref, setRef] = useState('');

  const price    = 'SAR ' + Number(course.price || 0).toFixed(2);
  const cardReady =
    name.trim() &&
    cardNum.replace(/\s/g, '').length >= 13 &&
    mm && yyyy &&
    cvv.length >= 3;

  // ── Shared focus style for text fields ───────────────────────
  const focusSx = {
    '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: MAROON },
    '& label.Mui-focused': { color: MAROON },
  };

  return (
    <Box>

      {/* ── Header banner ─────────────────────────────────────── */}
      <Box sx={{
        background: `linear-gradient(135deg, ${MAROON} 0%, ${MAROON_DARK} 100%)`,
        borderRadius: 3, p: 3, mb: 3, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Box>
          <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', mb: 0.25 }}>
            Secure Checkout
          </Typography>
          <Typography sx={{ opacity: 0.8, fontSize: '0.85rem' }}>
            {course.title}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ fontWeight: 900, fontSize: '1.6rem', lineHeight: 1 }}>
            {price}
          </Typography>
          <Chip
            label="🔒 Secure"
            size="small"
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700, mt: 0.5 }}
          />
        </Box>
      </Box>

      {/* ── Method picker ─────────────────────────────────────── */}
      <Typography sx={{
        fontWeight: 800, mb: 1.5, fontSize: '0.85rem',
        color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        Choose Payment Method
      </Typography>
      <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
        {[
          { id: 'apple_pay',     label: 'Apple Pay',     Icon: Smartphone },
          { id: 'card',          label: 'Card',          Icon: CreditCard  },
          { id: 'bank_transfer', label: 'Bank Transfer', Icon: Building2   },
        ].map(({ id, label, Icon }) => {
          const active = method === id;
          return (
            <Box
              key={id}
              onClick={() => setMethod(id)}
              sx={{
                flex: 1, py: 1.75, px: 1, borderRadius: 2.5, cursor: 'pointer',
                border: `2px solid ${active ? MAROON : 'rgba(0,0,0,0.12)'}`,
                bgcolor: active ? MAROON_LIGHT : '#fafaf9',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5,
                transition: 'all 0.18s',
                '&:hover': { borderColor: MAROON, bgcolor: MAROON_LIGHT },
              }}
            >
              <Icon size={22} color={active ? MAROON : '#888'} />
              <Typography sx={{
                fontWeight: 700, fontSize: '0.78rem',
                color: active ? MAROON : 'text.secondary',
              }}>
                {label}
              </Typography>
            </Box>
          );
        })}
      </Stack>

      {/* ── Apple Pay ─────────────────────────────────────────── */}
      <Collapse in={method === 'apple_pay'}>
        <Paper sx={{
          p: 2.5, borderRadius: 2.5,
          border: `1.5px solid ${MAROON_LIGHT}`, mb: 2, textAlign: 'center',
        }}>
          <Smartphone size={40} color={MAROON} style={{ marginBottom: 8 }} />
          <Typography sx={{ fontWeight: 800, mb: 0.5 }}>Pay with Apple Pay</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Use Face ID or Touch ID to authorize {price}
          </Typography>
          <Button
            fullWidth variant="contained" size="large"
            onClick={() => onPay({ payment_method: 'apple_pay' })}
            disabled={submitting}
            sx={{
              bgcolor: '#000', color: '#fff', fontWeight: 800,
              borderRadius: 2.5, fontSize: '1rem', py: 1.4,
              '&:hover': { bgcolor: '#222' },
            }}
          >
            {submitting ? 'Processing…' : ` Pay ${price}`}
          </Button>
        </Paper>
      </Collapse>

      {/* ── Credit / Debit Card ───────────────────────────────── */}
      <Collapse in={method === 'card'}>
        <Paper sx={{ p: 2.5, borderRadius: 2.5, border: `1.5px solid ${MAROON_LIGHT}`, mb: 2 }}>

          {/* Visual card preview */}
          <Box sx={{
            background: `linear-gradient(135deg, ${MAROON} 0%, #5c1a1a 100%)`,
            borderRadius: 2.5, p: 2.5, mb: 2.5, color: '#fff',
            minHeight: 130, position: 'relative', overflow: 'hidden',
          }}>
            {/* Decorative circles */}
            <Box sx={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.07)' }} />
            <Box sx={{ position: 'absolute', bottom: -40, right: 30,  width: 100, height: 100, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />

            <Typography sx={{ fontSize: '0.72rem', opacity: 0.7, mb: 2, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Credit / Debit Card
            </Typography>
            <Typography sx={{ fontWeight: 700, letterSpacing: '0.2em', fontSize: '1.05rem', mb: 1.5 }}>
              {cardNum || '•••• •••• •••• ••••'}
            </Typography>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
              <Box>
                <Typography sx={{ fontSize: '0.6rem', opacity: 0.6, textTransform: 'uppercase' }}>Cardholder</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{name || 'YOUR NAME'}</Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontSize: '0.6rem', opacity: 0.6, textTransform: 'uppercase' }}>Expires</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                  {mm || 'MM'}/{yyyy ? yyyy.slice(-2) : 'YY'}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Card input fields */}
          <Stack spacing={1.5}>
            <TextField
              fullWidth size="small" label="Cardholder Name"
              value={name} onChange={(e) => setName(e.target.value)}
              sx={focusSx}
            />
            <TextField
              fullWidth size="small" label="Card Number"
              value={cardNum}
              onChange={(e) => setCardNum(formatCard(e.target.value))}
              inputProps={{ maxLength: 19 }}
              InputProps={{ startAdornment: <CreditCard size={16} color="#888" style={{ marginRight: 6 }} /> }}
              sx={focusSx}
            />
            <Stack direction="row" spacing={1}>
              <TextField size="small" label="MM"   value={mm}   onChange={(e) => setMm(e.target.value.replace(/\D/g, '').slice(0, 2))}   sx={{ width: 80,  ...focusSx }} />
              <TextField size="small" label="YYYY" value={yyyy} onChange={(e) => setYyyy(e.target.value.replace(/\D/g, '').slice(0, 4))} sx={{ width: 100, ...focusSx }} />
              <TextField size="small" label="CVV"  type="password" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} sx={{ width: 80, ...focusSx }} />
            </Stack>
            <Button
              fullWidth variant="contained" size="large"
              onClick={() => onPay({
                payment_method: 'card',
                card_holder_name: name,
                card_number: cardNum.replace(/\s/g, ''),
                expiry_month: mm,
                expiry_year: yyyy,
                cvv,
              })}
              disabled={submitting || !cardReady}
              sx={{
                bgcolor: MAROON, fontWeight: 800, borderRadius: 2.5, py: 1.4,
                '&:hover': { bgcolor: MAROON_DARK },
                '&:disabled': { bgcolor: 'rgba(0,0,0,0.12)' },
              }}
            >
              {submitting ? 'Processing…' : `Pay ${price} Securely`}
            </Button>
          </Stack>
        </Paper>
      </Collapse>

      {/* ── Bank Transfer ─────────────────────────────────────── */}
      <Collapse in={method === 'bank_transfer'}>
        <Paper sx={{ p: 2.5, borderRadius: 2.5, border: `1.5px solid ${MAROON_LIGHT}`, mb: 2 }}>
          <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 2 }}>
            <Avatar sx={{ bgcolor: MAROON_LIGHT, width: 44, height: 44 }}>
              <Building2 size={22} color={MAROON} />
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 800 }}>Bank Transfer</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Transfer {price} and enter the reference below
              </Typography>
            </Box>
          </Stack>

          {/* Transfer details box */}
          <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#fafaf9', border: '1px dashed rgba(0,0,0,0.15)', mb: 2 }}>
            <Typography variant="caption" sx={{
              fontWeight: 700, color: 'text.secondary',
              textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', mb: 1,
            }}>
              Transfer Details
            </Typography>
            <Stack spacing={0.5}>
              {[
                ['Bank',         'Al Rajhi Bank'],
                ['Account Name', 'SkillArena Platform'],
                ['IBAN',         'SA03 8000 0000 6080 1016 7519'],
                ['Amount',       price],
              ].map(([k, v]) => (
                <Stack key={k} direction="row" justifyContent="space-between">
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{k}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800 }}>{v}</Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>

          <TextField
            fullWidth size="small"
            label="Transaction Reference Number"
            placeholder="e.g. TRF-2025-XXXXX"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            sx={{ mb: 1.5, ...focusSx }}
          />
          <Button
            fullWidth variant="contained" size="large"
            onClick={() => onPay({ payment_method: 'bank_transfer', transaction_reference: ref })}
            disabled={submitting || !ref.trim()}
            sx={{ bgcolor: MAROON, fontWeight: 800, borderRadius: 2.5, py: 1.4, '&:hover': { bgcolor: MAROON_DARK } }}
          >
            {submitting ? 'Verifying…' : 'Confirm Transfer & Enroll'}
          </Button>
        </Paper>
      </Collapse>

      {/* Hint when no method selected */}
      {!method && (
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 1 }}>
          👆 Select a payment method above to continue
        </Typography>
      )}

      {/* Trust badges */}
      <Stack direction="row" spacing={0.75} justifyContent="center" sx={{ mt: 2 }}>
        {['🔒 Secure', '✅ Encrypted', '💳 Safe Checkout'].map((t) => (
          <Chip
            key={t} label={t} size="small"
            sx={{ bgcolor: 'rgba(0,0,0,0.05)', fontSize: '0.7rem', fontWeight: 600 }}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default PaymentStep;