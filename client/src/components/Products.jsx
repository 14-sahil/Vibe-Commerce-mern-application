import React from 'react'
import { Link } from 'react-router-dom'

export default function Products({ products, onAdd, currentUser }) {
  return (
    <section className="products">
      <h2>Products</h2>
      <div className="grid">
        {products.map(p => (
          <div className="card" key={p.id}>
            <div className="card-body">
              <Link to={`/product/${p.id}`} style={{textDecoration:'none',color:'inherit'}}>
                <img src={p.image || 'https://picsum.photos/seed/placeholder/600/400'} alt={p.name} style={{width:'100%',height:150,objectFit:'cover',borderRadius:8}} />
                <h4 style={{marginTop:10}}>{p.name}</h4>
              </Link>
              <p className="price">${p.price.toFixed(2)}</p>
              <p className="desc">{p.description}</p>
              {currentUser ? (
                <button onClick={() => onAdd(p.id)}>Add to Cart</button>
              ) : (
                <button onClick={() => { window.location.href = '/auth' }} title="Sign in to add to cart">Sign in to add</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
