import React, { useEffect, useState } from 'react'

export default function Orders() {
  const [orders, setOrders] = useState([])

  const fetchOrders = async () => {
    const res = await fetch('/api/orders')
    if (res.ok) setOrders(await res.json())
  }

  useEffect(()=>{ fetchOrders() }, [])

  return (
    <section className="orders">
      <h2>Orders</h2>
      {orders.length===0 ? <p>No orders yet</p> : (
        <div>
          {orders.map(o => (
            <div key={o.id} className="order-card">
              <div><strong>{o.name}</strong> <span className="muted">{o.email}</span></div>
              <div>Total: ${o.total.toFixed(2)}</div>
              <div className="muted">{new Date(o.timestamp).toLocaleString()}</div>
              <details>
                <summary>Items ({o.items.length})</summary>
                <ul>
                  {o.items.map((it, i) => (<li key={i}>{it.name || it.productId} x {it.qty} — ${((it.price||0)*it.qty).toFixed(2)}</li>))}
                </ul>
              </details>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
