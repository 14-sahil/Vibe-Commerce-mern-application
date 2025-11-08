import React, { useState } from 'react'

export default function AuthPage({ onLogin, onSignup, currentUser }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    try {
      if (mode === 'login') await onLogin({ email, password })
      else await onSignup({ name, email, password })
    } catch (err) {
      console.error(err)
      alert(err.message || 'Auth failed')
    }
    setLoading(false)
  }

  if (currentUser) {
    return (
      <section className="page auth-page">
        <h2>Account</h2>
        <p>Signed in as <strong>{currentUser.name || currentUser.email}</strong></p>
        <p>Use the header logout link to sign out.</p>
      </section>
    )
  }

  return (
    <section className="page auth-page">
      <h2>{mode === 'login' ? 'Sign in' : 'Create account'}</h2>
      {mode === 'signup' && (
        <div className="form-row"><label>Name</label><input value={name} onChange={e=>setName(e.target.value)} /></div>
      )}
      <div className="form-row"><label>Email</label><input value={email} onChange={e=>setEmail(e.target.value)} /></div>
      <div className="form-row"><label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
      <div style={{marginTop:12}}>
        <button onClick={submit} disabled={loading}>{loading ? 'Working...' : (mode === 'login' ? 'Sign in' : 'Create account')}</button>
        <button onClick={()=>setMode(mode === 'login' ? 'signup' : 'login')} style={{marginLeft:8}}>{mode === 'login' ? 'Create account' : 'Have account? Sign in'}</button>
      </div>
    </section>
  )
}
