import React, { useEffect, useRef, useState } from 'react';
import { getDemoBlob } from '../../service/mentorservice';

export default function DemoPlayer({ mentorUserId, onClose }) {
  const [src, setSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const objectUrlRef = useRef(null);

  useEffect(() => {
    if (!mentorUserId) {
      return;
    }

    let mounted = true;
    const load = async () => {
      setLoading(true);
      setSrc(null);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }

      try {
        const blob = await getDemoBlob(mentorUserId);
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;
        if (mounted) {
          setSrc(url);
        }
      } catch (err) {
        console.error('Failed to load demo:', err.message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [mentorUserId]);

  if (loading) return <div>Loading demo...</div>;
  if (!src) return <div>No demo available</div>;

  return (
    <div className="demo-player-container" style={{ position: 'relative' }}>
      {onClose && (
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}
          onClick={onClose}
        >
          Close
        </button>
      )}
      <video src={src} controls style={{ maxWidth: '100%', borderRadius: 8 }} />
    </div>
  );
}
