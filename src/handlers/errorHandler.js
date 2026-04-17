import { useState } from 'react';

export function useErrorHandler() {
  const [error, setError] = useState(null);

  const handleError = (message) => {
    setError(message);
  };

  const clearError = () => {
    setError(null);
  };

  return { error, handleError, clearError };
}