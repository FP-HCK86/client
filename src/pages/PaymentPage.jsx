import React, { useEffect } from 'react';
import api from '../api/client';

export default function PaymentPage() {
  const handlePayment = async () => {
    try {
      const { data } = await api.post('/payment/create');
      // Load Midtrans Snap
      window.snap.pay(data.token, {
        onSuccess: (result) => {
          console.log('Payment success:', result);
          // Redirect atau update UI
          window.location.href = '/dashboard';
        },
        onPending: (result) => console.log('Payment pending:', result),
        onError: (result) => console.log('Payment error:', result),
      });
    } catch (error) {
      alert('Error creating payment');
    }
  };

  useEffect(() => {
    // Load Snap.js script
    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY);
    document.head.appendChild(script);
  }, []);

  return (
    <div>
      <h1>Upgrade ke Premium</h1>
      <p>Anda telah mencapai limit 3 posting. Bayar Rp 50.000 untuk akses unlimited.</p>
      <button onClick={handlePayment}>Bayar Sekarang</button>
    </div>
  );
}