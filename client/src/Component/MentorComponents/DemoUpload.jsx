import React, { useState } from 'react';
import { uploadDemo } from '../../service/mentorservice';

export default function DemoUpload() {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please choose a video file');
    setLoading(true);
    try {
      await uploadDemo(file, description);
      alert('Demo uploaded successfully');
      setFile(null);
      setDescription('');
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Demo video</label>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
      </div>
      <div>
        <label>Description (optional)</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <button type="submit" disabled={loading}>{loading ? 'Uploading...' : 'Upload Demo'}</button>
    </form>
  );
}
