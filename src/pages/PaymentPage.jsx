import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useToast } from '../hooks/use-toast';

export default function PaymentPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Load Snap script once
  useEffect(() => {
    if (window.snap) return; // already loaded
    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY);
    script.async = true;
    document.head.appendChild(script);
    return () => {
      // keep script; removing may break other pages
    };
  }, []);

  // Trigger payment flow: call /payment/create then open snap
  const startPaymentFlow = async () => {
    try {
      setLoading(true);
      const { data } = await api.post('/payment/create');
      if (!data || !data.token) throw new Error('No payment token');

      const openSnap = () => {
        window.snap.pay(data.token, {
          onSuccess: async (result) => {
            toast({ title: 'Pembayaran Berhasil', description: 'Terima kasih! Akun Anda telah diupgrade ke Premium' });
            // Verify status with server and refresh user later
            try {
              await api.get(`/payment/status?order_id=${encodeURIComponent(data.order_id)}`);
            } catch (e) {
              // ignore
            }
            setTimeout(() => (window.location.href = '/schedules/create'), 1200);
          },
          onPending: (result) => {
            toast({ title: 'Pembayaran Pending', description: 'Pembayaran Anda sedang diproses. Silakan tunggu konfirmasi.' });
          },
          onError: (result) => {
            toast({ title: 'Pembayaran Gagal', description: 'Terjadi kesalahan dalam proses pembayaran. Silakan coba lagi.' });
          },
          onClose: () => {
            // user closed snap popup
          }
        });
      };

      if (window.snap) {
        openSnap();
      } else {
        // Wait for script to load
        const maxWait = 5000; // ms
        const start = Date.now();
        const poll = setInterval(() => {
          if (window.snap) {
            clearInterval(poll);
            openSnap();
          } else if (Date.now() - start > maxWait) {
            clearInterval(poll);
            toast({ title: 'Error', description: 'Gagal memuat Midtrans. Coba lagi nanti.' });
          }
        }, 200);
      }
    } catch (err) {
      console.error('startPaymentFlow error', err);
      toast({ title: 'Error', description: 'Terjadi kesalahan saat memulai pembayaran.' });
    } finally {
      setLoading(false);
    }
  };

  // Auto-trigger when the route is /upgrade OR query param auto=true
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const auto = params.get('auto') === 'true';
      if (auto || window.location.pathname === '/upgrade') {
        startPaymentFlow();
      }
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-2">Upgrade ke Premium</h1>
      <p className="mb-4">Anda telah mencapai limit 3 posting. Bayar untuk akses unlimited 1 bulan.</p>
      <div className="flex gap-2">
        <button onClick={startPaymentFlow} disabled={loading} className="rounded-md bg-purple-600 px-4 py-2 text-white">
          {loading ? 'Memproses...' : 'Bayar Sekarang'}
        </button>
  <a href="/dashboard" className="rounded-md px-4 py-2 bg-white border-black">Batal</a>
      </div>
    </div>
  );
}