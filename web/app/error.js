'use client';
import React from 'react';

export default function GlobalError({ error, reset }) {
  console.error('Global app error:', error);
  return (
    <div style={{padding: 24, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif'}}>
      <h1 style={{marginTop:0}}>Something went wrong</h1>
      <p style={{color:'#666'}}>{error?.message ?? 'An unexpected error occurred.'}</p>
      <div style={{marginTop:16}}>
        <button onClick={() => reset && reset()} style={{padding:'8px 12px', borderRadius:6, border:'1px solid #ccc', background:'#fff'}}>Try again</button>
      </div>
    </div>
  );
}
