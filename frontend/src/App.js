import React, { useState, useEffect } from 'react';
import './App.css';

// In production, our Nginx reverse proxy will route this.
// In development, you'd set up a proxy in package.json.
const API_BASE_URL = '/api';

function App() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    // Fetch users
    fetch(`${API_BASE_URL}/users`)
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error("Failed to fetch users:", err));

    // Fetch products
    fetch(`${API_BASE_URL}/products`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Failed to fetch products:", err));
  }, []);

  const handleOrder = (productId, productName) => {
    // Simple order for user 1 (john_doe) and the selected product
    setStatusMessage(`Placing order for ${productName}...`);
    fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 1, productId: productId, quantity: 1 }),
    })
    .then(res => {
      if (!res.ok) {
        throw new Error(`Order failed with status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      setStatusMessage(`Order successful! Order ID: ${data.orderId}`);
    })
    .catch(err => {
      console.error(err);
      setStatusMessage(`Order failed! Check console for details.`);
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Micro-Shop EKS Demo</h1>
      </header>
      <main className="container">
        <section className="card">
          <h2>Available Users</h2>
          <ul>{users.length > 0 ? users.map(u => <li key={u.id}>{u.username} (ID: {u.id})</li>) : <li>Loading...</li>}</ul>
        </section>

        <section className="card">
          <h2>Available Products</h2>
          <div className="product-list">
            {products.length > 0 ? products.map(p => (
              <div key={p.id} className="product-item">
                <span>{p.name} - ${p.price}</span>
                <button onClick={() => handleOrder(p.id, p.name)}>Order 1</button>
              </div>
            )) : <p>Loading...</p>}
          </div>
        </section>

        <section className="card">
          <h2>Order Status</h2>
          <p className="status-message">{statusMessage || 'Click an "Order" button to place an order for John Doe.'}</p>
        </section>
      </main>
    </div>
  );
}

export default App;