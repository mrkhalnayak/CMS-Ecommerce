import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = '/api';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');
  const [view, setView] = useState('products'); // 'products' or 'orders'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, you'd have authentication flow
        const userRes = await fetch(`${API_BASE_URL}/users/1`);
        const user = await userRes.json();
        setCurrentUser(user);

        const productsRes = await fetch(`${API_BASE_URL}/products`);
        const productsData = await productsRes.json();
        setProducts(productsData);

        const ordersRes = await fetch(`${API_BASE_URL}/orders?userId=1`);
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  const handleOrder = async () => {
    if (!selectedProduct) return;

    setStatus(`Placing order for ${selectedProduct.name}...`);
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          productId: selectedProduct.id,
          quantity: quantity,
          shippingAddress: currentUser.address || 'Default address'
        }),
      });

      if (!response.ok) throw new Error('Order failed');

      const data = await response.json();
      setStatus(`Order successful! ID: ${data.orderId}`);
      
      // Refresh orders
      const ordersRes = await fetch(`${API_BASE_URL}/orders?userId=1`);
      setOrders(await ordersRes.json());
      
      // Refresh products (stock may have changed)
      const productsRes = await fetch(`${API_BASE_URL}/products`);
      setProducts(await productsRes.json());
      
      setSelectedProduct(null);
    } catch (error) {
      setStatus(`Order failed: ${error.message}`);
      console.error(error);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Micro-Shop</h1>
        {currentUser && (
          <div className="user-info">
            <span>Welcome, {currentUser.username}</span>
          </div>
        )}
      </header>

      <nav className="app-nav">
        <button 
          className={view === 'products' ? 'active' : ''}
          onClick={() => setView('products')}
        >
          Products
        </button>
        <button 
          className={view === 'orders' ? 'active' : ''}
          onClick={() => setView('orders')}
        >
          My Orders
        </button>
      </nav>

      <main className="app-main">
        {view === 'products' ? (
          <section className="products-section">
            <h2>Available Products</h2>
            <div className="product-grid">
              {products.map(product => (
                <div 
                  key={product.id} 
                  className={`product-card ${selectedProduct?.id === product.id ? 'selected' : ''}`}
                  onClick={() => setSelectedProduct(product)}
                >
                  {product.image_url && (
                    <div className="product-image">
                      <img src={product.image_url} alt={product.name} />
                    </div>
                  )}
                  <div className="product-details">
                    <h3>{product.name}</h3>
                    <p className="price">${product.price.toFixed(2)}</p>
                    <p className="stock">Stock: {product.stock}</p>
                    <p className="description">{product.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {selectedProduct && (
              <div className="order-form">
                <h3>Order {selectedProduct.name}</h3>
                <div className="form-group">
                  <label>Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                </div>
                <button 
                  onClick={handleOrder}
                  disabled={selectedProduct.stock < quantity}
                >
                  {selectedProduct.stock < quantity ? 'Out of Stock' : 'Place Order'}
                </button>
              </div>
            )}
          </section>
        ) : (
          <section className="orders-section">
            <h2>My Order History</h2>
            {orders.length > 0 ? (
              <div className="order-list">
                {orders.map(order => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <span>Order #{order.id}</span>
                      <span className={`status ${order.status}`}>{order.status}</span>
                    </div>
                    <div className="order-details">
                      <p>{order.product_name} (x{order.quantity})</p>
                      <p>Total: ${order.total_price.toFixed(2)}</p>
                      <p>Order Date: {new Date(order.order_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No orders found.</p>
            )}
          </section>
        )}

        {status && (
          <div className={`status-message ${status.includes('failed') ? 'error' : 'success'}`}>
            {status}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;