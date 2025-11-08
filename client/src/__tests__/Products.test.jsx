import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Products from '../components/Products'

describe('Products component', () => {
  test('renders product cards and Add to Cart triggers handler', () => {
    const products = [{ id: 'p1', name: 'Test', price: 10, description: 'd' }]
    const onAdd = vi.fn()
    render(<Products products={products} onAdd={onAdd} />)

    expect(screen.getByText('Test')).toBeTruthy()
    const btn = screen.getByText(/Add to Cart/i)
    fireEvent.click(btn)
    expect(onAdd).toHaveBeenCalledWith('p1')
  })
})
