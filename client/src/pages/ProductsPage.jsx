import React from 'react'
import Products from '../components/Products'

export default function ProductsPage({ products, onAdd, currentUser }) {
  return (
    <section className="page products-page">
      <h2>Browse Products</h2>
      <Products products={products} onAdd={onAdd} currentUser={currentUser} />
    </section>
  )
}
