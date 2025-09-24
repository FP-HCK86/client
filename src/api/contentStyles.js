import api from './client';

// Fetch content style summary for current user
export async function fetchContentStyles() {
  try {
    const res = await api.get('/analytics/content-styles');
    if (res.data && res.data.success) return res.data.data;
    throw new Error('Unexpected response format');
  } catch (err) {
    console.error('[fetchContentStyles] error', err);
    throw err;
  }
}
