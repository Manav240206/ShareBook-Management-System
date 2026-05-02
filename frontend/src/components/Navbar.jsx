import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function Navbar({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();
  const { cartItems } = useCart();

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to={isLoggedIn ? "/home" : "/login"} className="navbar-brand">ShareBook</Link>
      <div className="nav-links">
        {isLoggedIn ? (
          <>
            <Link to="/home">Home</Link>
            <Link to="/auctions">Auctions</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/cart" style={{ fontWeight: 'bold', color: 'var(--primary)' }}>Cart ({cartItems.length})</Link>
            <button onClick={handleLogout} style={{ marginLeft: '1.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', fontWeight: 500, padding: 0 }}>Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
