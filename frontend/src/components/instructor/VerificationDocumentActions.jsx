import { useEffect, useId, useRef, useState } from 'react';
import { FiDownload, FiEye, FiX } from 'react-icons/fi';

const button = 'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-semibold disabled:opacity-50';

export default function VerificationDocumentActions({ document: metadata, file, loadDocument, label = 'Document' }) {
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const modal = useRef(null);
  const request = useRef(0);
  const locked = useRef(false);
  const titleId = useId();
  const name = file?.name || metadata?.originalName || label;
  useEffect(() => () => { request.current++; }, []);
  useEffect(() => {
    if (!preview) return;
    modal.current?.showModal();
    return () => URL.revokeObjectURL(preview.url);
  }, [preview]);
  async function open(download = false) {
    if (locked.current) return;
    locked.current = true; setBusy(true); setError('');
    const current = ++request.current;
    try {
      const blob = file || (await loadDocument()).data;
      if (current !== request.current) return;
      const url = URL.createObjectURL(blob);
      if (download) {
        const anchor = window.document.createElement('a');
        anchor.href = url; anchor.download = name;
        window.document.body.appendChild(anchor); anchor.click(); anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else setPreview({ url, type: blob.type || metadata?.mimeType || '', name });
    } catch { if (current === request.current) setError('Unable to open this document. Please try again.'); }
    finally { locked.current = false; if (current === request.current) setBusy(false); }
  }
  return <div>
    <div className="flex flex-wrap gap-2"><button type="button" className={`${button} text-indigo-600 dark:text-indigo-300`} disabled={busy} onClick={() => open()}><FiEye />{busy ? 'Opening…' : `View ${label}`}</button><button type="button" className={button} disabled={busy} onClick={() => open(true)}><FiDownload />Download</button></div>
    {error && <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    {preview && <dialog ref={modal} onClose={() => setPreview(null)} aria-labelledby={titleId} className="m-auto w-[calc(100%-2rem)] max-w-5xl max-h-[92dvh] overflow-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 sm:p-6 text-slate-900 dark:text-slate-100 backdrop:bg-slate-950/70">
      <header className="mb-4 flex items-start justify-between gap-4"><div className="min-w-0"><h2 id={titleId} className="text-lg font-bold">{label} Preview</h2><p className="break-all text-sm text-slate-500 dark:text-slate-400">{preview.name}</p></div><button autoFocus type="button" className={button} aria-label="Close preview" onClick={() => modal.current.close()}><FiX /></button></header>
      {preview.type === 'application/pdf' ? <iframe title={`${label} PDF preview`} src={preview.url} className="h-[65dvh] w-full rounded-xl border border-slate-300 bg-white" /> : ['image/jpeg', 'image/png'].includes(preview.type) ? <img src={preview.url} alt={preview.name} className="mx-auto max-h-[65dvh] max-w-full rounded-xl object-contain" /> : <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-8 text-center">Preview is not available for this file format. Download the original document to open it.</div>}
      <footer className="mt-4 flex flex-wrap justify-between gap-3"><a className={button} href={preview.url} download={preview.name}><FiDownload />Download</a><button type="button" className={button} onClick={() => modal.current.close()}>Close</button></footer>
    </dialog>}
  </div>;
}
