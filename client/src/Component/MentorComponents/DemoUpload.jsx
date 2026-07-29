import React, { useState } from 'react';
import { uploadDemo } from '../../service/mentorservice';
import './DemoUpload.css';

export default function DemoUpload() {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please choose a video file');
    setLoading(true);
    setProgress(0);
    try {
      await uploadDemo(file, description, (pct) => setProgress(pct));
      alert('Demo uploaded successfully');
      setFile(null);
      setDescription('');
      setProgress(0);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="demo-upload-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Demo video</label>
        <input
          type="file"
          accept="video/*"
          className="form-control-file"
          onChange={(e) => setFile(e.target.files[0])}
        />
        {file && <div className="selected-file">{file.name}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">Description (optional)</label>
        <textarea
          className="form-control-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
      </div>

      <div className="form-actions">
        <button className="btn-upload" type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload Demo'}
        </button>
      </div>

      {loading && (
        <div className="upload-progress">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="progress-label">{progress}%</div>
        </div>
      )}
    </form>
  );
}
