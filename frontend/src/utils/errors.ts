export function extractErrorMessage(err: any): string {
  if (!err) return 'An unexpected error occurred';
  if (typeof err === 'string') return err;

  const responseData = err.response?.data;
  if (responseData) {
    if (typeof responseData.error === 'string') return responseData.error;
    if (typeof responseData.message === 'string') return responseData.message;
    if (Array.isArray(responseData.message)) return responseData.message.join(', ');
    if (typeof responseData.error === 'object' && responseData.error?.message) {
      return String(responseData.error.message);
    }
  }

  if (err.message && typeof err.message === 'string') {
    return err.message;
  }

  return 'An error occurred. Please try again.';
}
