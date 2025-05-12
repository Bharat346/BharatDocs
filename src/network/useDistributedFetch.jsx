import { useState, useEffect } from 'react';
import axios from 'axios';

export function useDistributedFetch({ apiUrl, storageKey, sendToAllPeers }) {
  const [data, setData] = useState([]); // Initialize as empty array
  const [dataSource, setDataSource] = useState(null);
  const [peerId, setPeerId] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  async function handlePeerResponse(msg) {
    if (msg?.type === 'response' && msg.key === storageKey) {
      try {
        console.log('Received from peer:', msg.peerId, msg.data);
        
        // Validate data is an array
        const receivedData = Array.isArray(msg.data) ? msg.data : [];
        
        localStorage.setItem(storageKey, JSON.stringify(receivedData));
        setData(receivedData);
        setDataSource('peer');
        setPeerId(msg.peerId);
      } catch (err) {
        console.error('Error handling peer response:', err);
      }
    }
  }

  async function fetchFromAPI() {
    try {
      console.log('Fetching from API...');
      const res = await axios.get(apiUrl);
      
      // Ensure response is an array
      const responseData = Array.isArray(res.data) ? res.data : [];
      
      localStorage.setItem(storageKey, JSON.stringify(responseData));
      setData(responseData);
      setDataSource('api');
      
      // Share with peers
      sendToAllPeers({
        type: 'response',
        key: storageKey,
        data: responseData,
        peerId: window.myPeerId
      });
      
      return responseData;
    } catch (err) {
      console.error('API fetch failed:', err);
      throw err;
    }
  }

  async function fetchData() {
    if (isFetching) return;
    setIsFetching(true);
    
    try {
      // 1. Check localStorage first
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const validatedData = Array.isArray(parsed) ? parsed : [];
          console.log('Using cached data:', validatedData);
          setData(validatedData);
          setDataSource('cache');
          setIsFetching(false);
          return;
        } catch (err) {
          console.error('Invalid cache data:', err);
          localStorage.removeItem(storageKey);
        }
      }

      // 2. Ask peers
      console.log('Requesting data from peers...');
      sendToAllPeers({ type: 'search', key: storageKey });

      // Wait for peer responses with a timeout
      await new Promise((resolve) => {
        const timeout = setTimeout(async () => {
          console.log('Peer timeout, trying API...');
          try {
            await fetchFromAPI();
          } finally {
            resolve();
          }
        }, 3000); // 3 second timeout for peers

        // Early resolve if we get data
        const checkInterval = setInterval(() => {
          if (data.length > 0 || localStorage.getItem(storageKey)) {
            clearTimeout(timeout);
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      });
    } finally {
      setIsFetching(false);
    }
  }

  // Initialize with cached data if available
  useEffect(() => {
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setData(Array.isArray(parsed) ? parsed : []);
      } catch (err) {
        console.error('Error parsing cached data:', err);
      }
    }
  }, [storageKey]);

  return { 
    data, 
    fetchData, 
    handlePeerResponse, 
    dataSource, 
    peerId,
    isFetching
  };
}