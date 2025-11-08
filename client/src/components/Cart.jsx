import React from 'react'

export default function Cart({ cart, onRefresh, onNotify, token }) {
  const updateQty = async (productId, qty) => {
    try {
      const headers = { 'content-type':'application/json' }
      if (token) headers['authorization'] = `Bearer ${token}`
      const res = await fetch('/api/cart', { method: 'POST', headers, body: JSON.stringify({ productId, qty }) })
      if (!res.ok) throw new Error('update failed')
      onRefresh()
      onNotify && onNotify('Cart updated')
    } catch (err) {
      console.error(err)
      onNotify && onNotify('Failed to update cart')
    }
  }

  const remove = async (cartId) => {
    try {
      const headers = {}
      if (token) headers['authorization'] = `Bearer ${token}`
      const res = await fetch(`/api/cart/${cartId}`, { method: 'DELETE', headers })
      if (!res.ok) throw new Error('delete failed')
      onRefresh()
      onNotify && onNotify('Removed from cart')
    } catch (err) {
      console.error(err)
      onNotify && onNotify('Failed to remove item')
    }
  }

  return (
    <aside className="cart">
      <h2>Your Cart</h2>
      {cart.items.length === 0 ? <p>Empty</p> : (
        <div>
          {cart.items.map(it => (
            <div className="cart-item" key={it.cartId}>
              <div className="ci-left">
                <strong>{it.name}</strong>
                <div>${it.price.toFixed(2)}</div>
              </div>
              <div className="ci-right">
                <input type="number" min="0" value={it.qty} onChange={(e)=> updateQty(it.productId, Number(e.target.value))} />
                <button onClick={()=> remove(it.cartId)}>Remove</button>
              </div>
            </div>
          ))}
          <div className="cart-total">Total: ${cart.total.toFixed(2)}</div>
        </div>
      )}
    </aside>
  )
}
