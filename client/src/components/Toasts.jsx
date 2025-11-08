import React from 'react'

export default function Toasts({ items }) {
  if (!items || items.length === 0) return null
  return (
    <div style={{ position: 'fixed', right: 16, top: 16, zIndex: 9999 }}>
      {items.map(t => (
        <div key={t.id} style={{ background: 'linear-gradient(#fff,#f8fbff)', padding: 12, marginBottom: 8, borderRadius: 8, boxShadow: '0 10px 30px rgba(2,6,23,0.08)' }}>
          {t.message}
        </div>
      ))}
    </div>
  )
}
