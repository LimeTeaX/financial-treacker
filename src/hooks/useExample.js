// Example hook
import { useState, useEffect } from 'react';

const useExample = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Fetch data or perform side effects
    setData('Example data');
  }, []);

  return data;
};

export default useExample;