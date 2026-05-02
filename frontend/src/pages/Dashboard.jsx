import { useState, useEffect } from 'react';

function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [myBooks, setMyBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showListForm, setShowListForm] = useState(false);
  
  // Book Form State
  const [bookForm, setBookForm] = useState({
    title: '', author: '', description: '', price: '', image: ''
  });

  const getUserId = () => {
    const token = localStorage.getItem('token');
    let userId = "64c9d924151b1f0a2569b3f3"; // fallback
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.id;
      } catch (err) {}
    }
    return userId;
  };

  const getUserRole = () => {
    return localStorage.getItem('role') || 'user';
  };

  const fetchData = async () => {
    try {
      const userId = getUserId();
      const role = getUserRole();
      
      // Fetch Orders
      const orderEndpoint = role === 'admin' ? 'http://localhost:5005/api/orders/all' : `http://localhost:5005/api/orders/${userId}`;
      const resOrders = await fetch(orderEndpoint);
      if (resOrders.ok) {
        const data = await resOrders.json();
        const validOrders = data.map(order => ({
          ...order,
          items: order.items.filter(item => item.bookId != null)
        }));
        setOrders(validOrders);
      }
      
      // Fetch My Books
      const resBooks = await fetch(`http://localhost:5005/api/books/seller/${userId}`);
      if (resBooks.ok) {
        const allMyBooks = await resBooks.json();
        setMyBooks(allMyBooks.filter(book => book.status !== 'sold'));
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (orderId) => {
    try {
      const res = await fetch(`http://localhost:5005/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'delivered' })
      });
      if (res.ok) {
        alert("Order marked as delivered!");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleListBook = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5005/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookForm,
          sellerId: getUserId(),
          condition: 'Good',
          status: 'available'
        })
      });
      if (res.ok) {
        alert("Book listed successfully!");
        setShowListForm(false);
        setBookForm({ title: '', author: '', description: '', price: '', image: '' });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartAuction = async (bookId, basePrice) => {
    const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    try {
      const res = await fetch('http://localhost:5005/api/auctions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          sellerId: getUserId(),
          basePrice,
          endTime
        })
      });
      if (res.ok) {
        alert("Auction started successfully! It will be active for 24 hours.");
        // We should also mark the book as auctioned so it doesn't appear in store
        await fetch(`http://localhost:5005/api/books/${bookId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'auctioned' })
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const libraryBooks = [];
  orders.forEach(order => {
    order.items.forEach(item => {
      if (item.bookId) libraryBooks.push(item.bookId);
    });
  });

  const role = getUserRole();

  return (
    <div>
      <h2>{role === 'admin' ? 'Admin Dashboard' : 'User Dashboard'}</h2>
      <p>Manage your orders, listed books, and start auctions here.</p>
      
      {loading ? (
        <p>Loading dashboard data...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>
          
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>My Books (Listed for Sale)</h3>
              <button 
                onClick={() => setShowListForm(!showListForm)}
                style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                {showListForm ? 'Cancel' : 'List a Book'}
              </button>
            </div>

            {showListForm && (
              <form onSubmit={handleListBook} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
                <input required placeholder="Book Title" value={bookForm.title} onChange={e => setBookForm({...bookForm, title: e.target.value})} style={{ padding: '0.5rem' }}/>
                <input required placeholder="Author" value={bookForm.author} onChange={e => setBookForm({...bookForm, author: e.target.value})} style={{ padding: '0.5rem' }}/>
                <textarea required placeholder="Description" value={bookForm.description} onChange={e => setBookForm({...bookForm, description: e.target.value})} style={{ padding: '0.5rem' }}/>
                <input required type="number" placeholder="Price (₹)" value={bookForm.price} onChange={e => setBookForm({...bookForm, price: e.target.value})} style={{ padding: '0.5rem' }}/>
                <input placeholder="Image URL (optional)" value={bookForm.image} onChange={e => setBookForm({...bookForm, image: e.target.value})} style={{ padding: '0.5rem' }}/>
                <button type="submit" style={{ padding: '0.75rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Submit Listing</button>
              </form>
            )}

            {myBooks.length === 0 ? (
              <p style={{ marginTop: '1rem' }}>You have 0 books listed.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                {myBooks.map(book => (
                  <div key={book._id} style={{ display: 'flex', flexDirection: 'column', padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>{book.title}</h4>
                    <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)' }}>Status: {book.status}</p>
                    <strong style={{ marginBottom: '1rem' }}>₹{book.price}</strong>
                    {book.status === 'available' && (
                      <button 
                        onClick={() => handleStartAuction(book._id, book.price)}
                        style={{ padding: '0.5rem', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Start Auction
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3>{role === 'admin' ? 'All System Orders' : 'My Orders'}</h3>
            {orders.length === 0 ? (
              <p>You have not placed any orders yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #eee' }}>
                      <th style={{ padding: '0.75rem' }}>Order ID</th>
                      <th style={{ padding: '0.75rem' }}>Date</th>
                      <th style={{ padding: '0.75rem' }}>Items</th>
                      <th style={{ padding: '0.75rem' }}>Total</th>
                      <th style={{ padding: '0.75rem' }}>Status</th>
                      <th style={{ padding: '0.75rem' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order._id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '0.75rem', fontSize: '0.9rem' }}>{order._id}</td>
                        <td style={{ padding: '0.75rem' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '0.75rem' }}>{order.items.length}</td>
                        <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>₹{order.totalAmount}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ 
                            padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem',
                            backgroundColor: order.status === 'pending' ? '#fef3c7' : '#d1fae5',
                            color: order.status === 'pending' ? '#92400e' : '#065f46'
                          }}>
                            {order.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          {order.status === 'pending' && role === 'admin' && (
                            <button 
                              onClick={() => handleUpdateStatus(order._id)}
                              style={{ padding: '0.25rem 0.5rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                              Mark Delivered
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="card">
            <h3>My Library (Purchased Books)</h3>
            {libraryBooks.length === 0 ? (
              <p>Your library is empty. Buy some books from the Home page!</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                {libraryBooks.map((book, index) => (
                  <div key={`${book._id}-${index}`} style={{ display: 'flex', flexDirection: 'column', padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
                    {book.image && <img src={book.image} alt={book.title} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '4px', marginBottom: '1rem' }} />}
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{book.title}</h4>
                    <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>by {book.author}</p>
                    <button style={{ marginTop: 'auto', padding: '0.5rem', backgroundColor: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>
                      Read Now
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

export default Dashboard;
