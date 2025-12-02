import React from 'react';
import api from '../api/api';

export default function FileUploader({ onUpload }: { onUpload: (attachment: any) => void }) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // 1) presign
    const res = await api.post('/upload/presign', { filename: file.name, contentType: file.type });
    const { url, key } = res.data;
    // 2) PUT file to S3
    await fetch(url, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
    // 3) notify parent
    onUpload({ key, filename: file.name, type: file.type });
  }

  return (
    <div>
      <input ref={inputRef} type="file" className="hidden" onChange={handleFile} />
      <button onClick={() => inputRef.current?.click()} className="px-3 py-2 bg-slate-100 rounded">Attach</button>
    </div>
  );
}
