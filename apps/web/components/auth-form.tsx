'use client';
import { useState } from 'react';
import { apiPost } from '../lib/api';

type Field = { name: string; label: string; type?: string; placeholder: string };
export function AuthForm({ action, fields, cta }: { action: string; fields: Field[]; cta: string }) {
  const [message, setMessage] = useState('');
  async function submit(formData: FormData): Promise<void> {
    const body = Object.fromEntries(fields.map((field) => [field.name, formData.get(field.name)]));
    try { await apiPost(action, body); setMessage('Request completed successfully.'); } catch (error) { setMessage(error instanceof Error ? error.message : 'Request failed'); }
  }
  return <form action={submit} className="grid gap-4">{fields.map((field)=><label className="grid gap-2 text-sm font-bold text-white/70" key={field.name}>{field.label}<input className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none focus:border-gold" name={field.name} type={field.type ?? 'text'} placeholder={field.placeholder} required /></label>)}<button className="rounded-2xl bg-gold p-4 font-black text-ink" type="submit">{cta}</button>{message && <p className="rounded-2xl bg-white/10 p-3 text-sm text-white/70">{message}</p>}</form>;
}
