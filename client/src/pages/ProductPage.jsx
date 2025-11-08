import React from 'react'
import { useParams, Link } from 'react-router-dom'

export default function ProductPage({ products }) {
  const { id } = useParams()
  const p = products.find(x => x.id === id || x.productId === id)
  if (!p) return (
    <section className="page products-page">
      <h2>Product not found</h2>
      <Link to="/">Back to products</Link>
    </section>
  )

  return (
    <section className="page product-detail">
      <div style={{display:'flex',gap:20,flexWrap:'wrap'}}>
        <div style={{flex:'1 1 420px'}}>
          <img src={p.image || 'https://picsum.photos/seed/placeholder/800/600'} alt={p.name} style={{width:'100%',borderRadius:12,objectFit:'cover'}} />
        </div>
        <div style={{flex:'1 1 320px'}}>
          <h2>{p.name}</h2>
          <div style={{fontWeight:800,margin:'8px 0'}}>${p.price.toFixed(2)}</div>
          <p className="desc">{p.description}</p>
          <div style={{marginTop:12}}>
            <button className="btn" onClick={() => { /* navigate to add to cart handled on Products list */ alert('Use Add to Cart on products page') }}>Add to Cart</button>
          </div>
          <div style={{marginTop:12}}><Link to="/">← Back to products</Link></div>
        </div>
      </div>
    </section>
  )
}
