import React from 'react'

export default function Receipt({ receipt, onClose }) {
  if (!receipt) return null

  const date = receipt.timestamp ? new Date(receipt.timestamp).toLocaleString() : ''

  return (
    <div className="receipt modal">
      <div className="receipt-inner">
        <div className="receipt-header">
          <div>
            <h3>Receipt</h3>
            <div className="muted">Order ID: {receipt.id}</div>
            <div className="muted">{date}</div>
          </div>
          <div>
            <button onClick={onClose} className="btn">Close</button>
          </div>
        </div>

        <div className="receipt-body">
          <table className="receipt-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(receipt.items) && receipt.items.map((it, idx) => (
                <tr key={idx}>
                  <td>{it.name || it.productId}</td>
                  <td>${(it.price || 0).toFixed(2)}</td>
                  <td>{it.qty || 1}</td>
                  <td>${(((it.price||0) * (it.qty||1)) ).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="receipt-footer">
          <div className="muted">Billed to: {receipt.name || ''} {receipt.email ? `(${receipt.email})` : ''}</div>
          <div className="receipt-total">Total: <strong>${(receipt.total||0).toFixed(2)}</strong></div>
        </div>
      </div>
    </div>
  )
}
