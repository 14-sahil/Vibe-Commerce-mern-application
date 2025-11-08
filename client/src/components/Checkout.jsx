import React, { useState } from 'react'

export default function Checkout({ cart, onComplete, token }) {
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!cart.items.length) return alert('Cart empty')
    if (!token) return alert('Please sign in to complete checkout')
    setLoading(true)
    const headers = { 'content-type':'application/json' }
    if (token) headers['authorization'] = `Bearer ${token}`
    // send cart items only; server will use authenticated user info
    const res = await fetch('/api/checkout', { method: 'POST', headers, body: JSON.stringify({ cartItems: cart.items }) })
    const body = await res.json()
    setLoading(false)
    if (res.ok) onComplete(body.receipt)
    else alert(body.error || 'Checkout failed')
  }

  return (
    <section className="checkout">
      <h2>Checkout</h2>
      <p>Select a payment option below. This demo uses a dummy payment integration.</p>
      <div className="form-row">
        <label><input type="radio" name="pay" value="upi" checked={paymentMethod==='upi'} onChange={()=>setPaymentMethod('upi')} /> UPI (scan QR)</label>
        <label style={{marginLeft:12}}><input type="radio" name="pay" value="card" checked={paymentMethod==='card'} onChange={()=>setPaymentMethod('card')} /> Card</label>
        <label style={{marginLeft:12}}><input type="radio" name="pay" value="cod" checked={paymentMethod==='cod'} onChange={()=>setPaymentMethod('cod')} /> Cash on Delivery</label>
      </div>

      {paymentMethod === 'upi' && (
        <div style={{marginTop:12}}>
          <p>Scan this dummy UPI QR to "pay":</p>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi:dummy@upi" alt="Dummy UPI QR" style={{width:250,height:250}} />
          <p style={{fontSize:12,color:'#666'}}>This is a placeholder QR for demo purposes only.</p>
        </div>
      )}

      <div style={{marginTop:12}}>
        <button onClick={submit} disabled={loading}>{loading? 'Processing...':'Place Order'}</button>
      </div>
    </section>
  )
}
