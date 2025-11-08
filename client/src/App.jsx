import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Products from './components/Products'
import Cart from './components/Cart'
import Checkout from './components/Checkout'
import Orders from './components/Orders'
import Toasts from './components/Toasts'
import ProductsPage from './pages/ProductsPage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrdersPage from './pages/OrdersPage'
import AuthPage from './pages/AuthPage'
import Receipt from './components/Receipt'

export default function App() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState({ items: [], total: 0 })
  const [receipt, setReceipt] = useState(null)
  const [toasts, setToasts] = useState([])
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch(e){ return null }
  })

  const fetchProducts = async () => {
    const res = await fetch('/api/products')
    const list = await res.json()
    // normalize: some code/tests expect `id`, server returns `productId`
    setProducts(list.map(p => ({ ...p, id: p.id || p.productId })))
  }

  const fetchCart = async () => {
    const headers = {}
    if (token) headers['authorization'] = `Bearer ${token}`
    const res = await fetch('/api/cart', { headers })
    setCart(await res.json())
  }

  useEffect(() => { fetchProducts(); fetchCart(); }, [])

  const addToCart = async (pid) => {
    try {
      const headers = { 'content-type':'application/json' }
      if (token) headers['authorization'] = `Bearer ${token}`
      const res = await fetch('/api/cart', { method: 'POST', headers, body: JSON.stringify({ productId: pid, qty: 1 }) })
      if (!res.ok) throw new Error('Add failed')
      await fetchCart();
      showToast('Added to cart')
    } catch (err) {
      console.error(err)
      showToast('Failed to add to cart')
    }
  }

  const onLogin = async ({ email, password }) => {
    const res = await fetch('/api/login', { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ email, password }) })
    const body = await res.json()
    if (!res.ok) throw new Error(body.error || 'Login failed')
    setToken(body.token)
    setCurrentUser(body.user)
    localStorage.setItem('token', body.token)
    localStorage.setItem('user', JSON.stringify(body.user))
    showToast('Signed in')
    await fetchCart()
  }

  const onSignup = async ({ name, email, password }) => {
    const res = await fetch('/api/signup', { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ name, email, password }) })
    const body = await res.json()
    if (!res.ok) throw new Error(body.error || 'Signup failed')
    setToken(body.token)
    setCurrentUser(body.user)
    localStorage.setItem('token', body.token)
    localStorage.setItem('user', JSON.stringify(body.user))
    showToast('Account created and signed in')
    await fetchCart()
  }

  const onLogout = () => {
    setToken(null)
    setCurrentUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    showToast('Signed out')
    fetchCart()
  }

  const showToast = (message, ms = 3000) => {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, message }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), ms)
  }

  return (
    <BrowserRouter>
      <div className="app">
        <header className="site-header">
          <div className="brand"><h1>Vibe Commerce</h1></div>
          <nav className="main-nav">
            <Link to="/">Products</Link>
            <Link to="/cart">Cart ({cart.items.length})</Link>
            <Link to="/checkout">Checkout</Link>
            <Link to="/orders">Orders</Link>
            {currentUser ? (
              <>
                <span style={{marginLeft:12}}>Hi, {currentUser.name || currentUser.email}</span>
                <a href="#" onClick={(e)=>{ e.preventDefault(); onLogout(); }} style={{marginLeft:12}}>Logout</a>
              </>
            ) : (
              <Link to="/auth" style={{marginLeft:12}}>Sign in</Link>
            )}
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<ProductsPage products={products} onAdd={addToCart} currentUser={currentUser} />} />
            <Route path="/cart" element={<CartPage cart={cart} onRefresh={fetchCart} onNotify={showToast} token={token} />} />
            <Route path="/checkout" element={<CheckoutPage cart={cart} token={token} onComplete={(r)=>{ setReceipt(r); fetchCart(); showToast('Payment successful') }} />} />
            <Route path="/product/:id" element={<ProductPage products={products} />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/auth" element={<AuthPage onLogin={onLogin} onSignup={onSignup} currentUser={currentUser} />} />
          </Routes>

          {receipt && (
            <Receipt receipt={receipt} onClose={() => setReceipt(null)} />
          )}
          <Toasts items={toasts} />
        </main>

        <footer className="site-footer">Demo shopping cart for Vibe Commerce</footer>
      </div>
    </BrowserRouter>
  )
}
