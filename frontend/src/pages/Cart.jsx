import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

function Cart() {
  const { cartItems, removeFromCart, clearCart, cartTotal } = useCart();
  const [address, setAddress] = useState({
    locality: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return alert("Cart is empty");

    setLoading(true);
    const token = localStorage.getItem('token');
    let userId = "64c9d924151b1f0a2569b3f3"; // fallback dummy 
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.id;
      } catch (err) {}
    }

    const fullAddress = `${address.locality}, ${address.city}, ${address.state} - ${address.pincode}`;

    try {
      const response = await fetch('http://localhost:5005/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          items: cartItems.map(item => ({ bookId: item._id, price: item.price })),
          shippingAddress: fullAddress
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert("Order placed successfully with Cash on Delivery!");
        clearCart();
        navigate('/dashboard');
      } else {
        alert(data.message || "Failed to place order");
      }
    } catch (err) {
      console.error(err);
      alert("Server error connecting to backend.");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div>
        <h2>Your Cart</h2>
        <div className="card">
          <p>Your cart is completely empty. Go to the Home page to add some books!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>Your Cart</h2>
      
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 2 }}>
          {cartItems.map((item, index) => (
            <div key={`${item._id}-${index}`} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>{item.title}</h4>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>{item.author}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <strong style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>₹{item.price}</strong>
                <button 
                  onClick={() => removeFromCart(item._id)}
                  style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', textDecoration: 'underline' }}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ flex: 1, position: 'sticky', top: '2rem' }}>
          <h3>Order Summary</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
            <span>Total Items:</span>
            <strong>{cartItems.length}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <span style={{ fontSize: '1.2rem' }}>Total Amount:</span>
            <strong style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>₹{cartTotal}</strong>
          </div>

          <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Shipping Address</h4>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Locality / Street</label>
                <input required name="locality" value={address.locality} onChange={handleAddressChange} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>City</label>
                  <input required name="city" value={address.city} onChange={handleAddressChange} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>State</label>
                  <input required name="state" value={address.state} onChange={handleAddressChange} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Pincode</label>
                <input required name="pincode" value={address.pincode} onChange={handleAddressChange} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Payment Method</h4>
              <select disabled style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#f3f4f6', color: '#6b7280' }}>
                <option>Cash on Delivery (COD)</option>
              </select>
              <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>* Only COD is available right now.</small>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              style={{ padding: '1rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold', marginTop: '1rem' }}>
              {loading ? 'Placing Order...' : 'Place Order (COD)'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Cart;
