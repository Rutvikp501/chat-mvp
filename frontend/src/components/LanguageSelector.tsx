import React from 'react';

export default function LanguageSelector({ lang, onChange }: { lang: string, onChange: (s:string) => void }) {
  return (
    <select value={lang} onChange={(e) => onChange(e.target.value)} className="p-2 border rounded">
      <option value="en">English</option>
      <option value="hi">Hindi</option>
      <option value="mr">Marathi</option>
      <option value="es">Spanish</option>
      <option value="fr">French</option>
      <option value="de">German</option>
    </select>
  );
}
