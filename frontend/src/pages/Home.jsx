import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('http://localhost:5005/api/books');
        if (response.ok) {
          const data = await response.json();
          setBooks(data);
        }
      } catch (error) {
        console.error('Failed to fetch books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div>
      <h1>Welcome to ShareBook</h1>
      <p>Buy, sell, and auction books with ease.</p>
      
      <h3>Featured Books</h3>
      
      {loading ? (
        <p>Loading books...</p>
      ) : books.length === 0 ? (
        <div className="card">
          <p>No books available yet. Check back later!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
          {books.map(book => (
            <div key={book._id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1rem' }}>
              {book.image && <img src={book.image} alt={book.title} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px', marginBottom: '1rem' }} />}
              <h4 style={{ margin: '0 0 0.5rem 0' }}>{book.title}</h4>
              <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>by {book.author}</p>
              <p style={{ flex: 1, fontSize: '0.85rem' }}>{book.description.substring(0, 80)}...</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <strong style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>₹{book.price}</strong>
                <span style={{ fontSize: '0.8rem', backgroundColor: '#e5e7eb', padding: '2px 8px', borderRadius: '12px' }}>{book.condition}</span>
              </div>
              <button 
                onClick={() => addToCart(book)}
                style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
