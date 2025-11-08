import React from 'react'
import Cart from '../components/Cart'
import { Link } from 'react-router-dom'

export default function CartPage({ cart, onRefresh, onNotify, token }) {
  return (
    <section className="page cart-page">
      <h2>Your Cart</h2>
      <Cart cart={cart} onRefresh={onRefresh} onNotify={onNotify} token={token} />
      <div style={{marginTop:12}}>
        <Link to="/checkout" className="btn">Proceed to Checkout</Link>
      </div>
    </section>
  )
}
