// Utility to handle Midtrans Snap flow and refresh server state after success.

export async function handleSnapPayment({
		orderId,
		snapToken,
		onStatus = () => {},
		onUserRefresh = () => {},
		onError = () => {},
		authToken // optional, e.g. 'Bearer ...'
	}) {
	// minimal header helper
	const headers = authToken ? { 'Authorization': authToken } : {};
	// helper to call /payment/status
	async function fetchPaymentStatus() {
		try {
			const url = `/payment/status?order_id=${encodeURIComponent(orderId)}`;
			const res = await fetch(url, { method: 'GET', headers, credentials: 'same-origin' });
			if (!res.ok) throw new Error(`status fetch ${res.status}`);
			return await res.json();
		} catch (err) {
			console.error('fetchPaymentStatus error', err);
			throw err;
		}
	}
	// helper to call /user
	async function fetchUser() {
		try {
			const res = await fetch('/user', { method: 'GET', headers, credentials: 'same-origin' });
			if (!res.ok) throw new Error(`user fetch ${res.status}`);
			return await res.json();
		} catch (err) {
			console.error('fetchUser error', err);
			throw err;
		}
	}

	// ensure snap is available
	if (!window.snap || typeof window.snap.pay !== 'function') {
		const err = new Error('Midtrans snap not available on window.snap');
		onError(err);
		throw err;
	}

	// invoke snap
	return new Promise((resolve, reject) => {
		window.snap.pay(snapToken, {
			onSuccess: async (result) => {
				try {
					// first refresh payment status
					const statusPayload = await fetchPaymentStatus().catch((e) => ({ error: e }));
					onStatus(statusPayload);

					// then refresh user
					const userPayload = await fetchUser().catch((e) => ({ error: e }));
					onUserRefresh(userPayload);

					resolve({ result, statusPayload, userPayload });
				} catch (err) {
					console.error('handleSnapPayment onSuccess error', err);
					onError(err);
					reject(err);
				}
			},
			onPending: async (result) => {
				try {
					const statusPayload = await fetchPaymentStatus().catch((e) => ({ error: e }));
					onStatus(statusPayload);
					resolve({ result, statusPayload });
				} catch (err) {
					onError(err);
					reject(err);
				}
			},
			onError: (err) => {
				console.error('Midtrans snap onError', err);
				onError(err);
				reject(err);
			},
			onClose: () => {
				// user closed the popup without finishing payment
				resolve({ closed: true });
			}
		});
	});
}
