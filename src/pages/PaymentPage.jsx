import React, { useEffect } from 'react';
import api from '../api/client';
import { useToast } from '../hooks/use-toast';

export default function PaymentPage() {
  const { toast } = useToast();
  
  const handlePayment = async () => {
    try {
      const { data } = await api.post('/payment/create');
      // Load Midtrans Snap
      window.snap.pay(data.token, {
        onSuccess: (result) => {
          console.log('Payment success:', result);
          toast({
            title: "Pembayaran Berhasil",
            description: "Terima kasih! Akun Anda telah diupgrade ke Premium",
            className: "bg-gradient-to-r from-purple-600 via-purple-500 to-purple-300 border-purple-300 text-white",
          });
          // Redirect atau update UI
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
        },
        onPending: (result) => {
          console.log('Payment pending:', result);
          toast({
            title: "Pembayaran Pending",
            description: "Pembayaran Anda sedang diproses. Silakan tunggu konfirmasi.",
            className: "bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-300 border-yellow-300 text-white",
          });
        },
        onError: (result) => {
          console.log('Payment error:', result);
          toast({
            title: "Pembayaran Gagal",
            description: "Terjadi kesalahan dalam proses pembayaran. Silakan coba lagi.",
            className: "bg-gradient-to-r from-red-500 via-red-400 to-red-300 border-red-300 text-white",
          });
        },
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat pembayaran. Silakan coba lagi.",
        className: "bg-gradient-to-r from-red-500 via-red-400 to-red-300 border-red-300 text-white",
      });
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