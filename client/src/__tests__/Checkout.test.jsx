import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Checkout from '../components/Checkout'

describe('Checkout component', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ receipt: { id: 'r1' } }) }))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('submits checkout payload and calls onComplete', async () => {
    const cart = { items: [{ productId: 'p1', name: 'Test', price: 5, qty: 2 }], total: 10 }
    const onComplete = vi.fn()
    render(<Checkout cart={cart} onComplete={onComplete} />)

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Alice' } })
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'a@b.com' } })
    fireEvent.click(screen.getByText(/Place Order/i))

    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    expect(global.fetch.mock.calls[0][0]).toContain('/api/checkout')
    await waitFor(() => expect(onComplete).toHaveBeenCalled())
  })
})
