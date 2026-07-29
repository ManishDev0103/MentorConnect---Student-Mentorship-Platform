import React, { useEffect, useState } from 'react';
import { getDemoBlob } from '../../service/mentorservice';

export default function DemoPlayer({ mentorUserId }) {
  const [src, setSrc] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!mentorUserId) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const blob = await getDemoBlob(mentorUserId);
        const url = URL.createObjectURL(blob);
        if (mounted) setSrc(url);
      } catch (err) {
        console.error('Failed to load demo:', err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
      if (src) URL.revokeObjectURL(src);
    };
  }, [mentorUserId]);

  if (loading) return <div>Loading demo...</div>;
  if (!src) return <div>No demo available</div>;

  return (
    <div>
      <video src={src} controls style={{ maxWidth: '100%' }} />
    </div>
  );
}
