import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setConnectionStatus, handleSnapshot, handleUpdate, updateStandings, updateScorers } from '../store/matchSlice';

export function useLiveScores() {
  const dispatch = useDispatch();
  const wsRef = useRef(null);

  useEffect(() => {
    let fallbackTimeout = null;
    let isMounted = true;

    const connectRealSocket = () => {
      dispatch(setConnectionStatus('connecting'));
      const ws = new WebSocket('ws://localhost:8080/live');
      let hasConnected = false;

      let pingInterval;
      ws.onopen = () => {
        hasConnected = true;
        if (isMounted) dispatch(setConnectionStatus('connected'));
        pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'PING' }));
          }
        }, 15000);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'SNAPSHOT_FULL') {
          dispatch(handleSnapshot(data.payload));
        } else if (data.type === 'MATCHES_UPDATE') {
          dispatch(handleUpdate(data.payload));
        } else if (data.type === 'STANDINGS_UPDATE') {
          dispatch(updateStandings(data.payload));
        } else if (data.type === 'SCORERS_UPDATE') {
          dispatch(updateScorers(data.payload));
        }
      };

      ws.onclose = () => {
        clearInterval(pingInterval);
        if (isMounted) {
          if (!hasConnected) {
            console.log('Real backend connection refused, retrying in 5s...');
          } else {
            dispatch(setConnectionStatus('disconnected'));
          }
          // Reconnect logic
          setTimeout(connectRealSocket, 5000);
        }
      };

      wsRef.current = ws;
    };

    connectRealSocket();

    return () => {
      isMounted = false;
      if (wsRef.current) wsRef.current.close();
    };
  }, [dispatch]);
}
