import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('sharebook_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('sharebook_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (book) => {
    if (cartItems.find(item => item._id === book._id)) {
      alert("This book is already in your cart!");
      return;
    }
    setCartItems([...cartItems, book]);
    alert(`${book.title} added to cart!`);
  };

  const removeFromCart = (bookId) => {
    setCartItems(cartItems.filter(item => item._id !== bookId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((total, item) => total + item.price, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};
