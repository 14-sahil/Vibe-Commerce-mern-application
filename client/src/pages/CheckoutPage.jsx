import React from 'react'
import Checkout from '../components/Checkout'

export default function CheckoutPage({ cart, onComplete, token }) {
  return (
    <section className="page checkout-page">
      <h2>Checkout</h2>
      <Checkout cart={cart} onComplete={onComplete} token={token} />
    </section>
  )
}
