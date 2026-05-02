import { useState, useEffect } from 'react';

function Auctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidAmounts, setBidAmounts] = useState({});

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

  const fetchAuctions = async () => {
    try {
      const response = await fetch('http://localhost:5005/api/auctions');
      if (response.ok) {
        setAuctions(await response.json());
      }
    } catch (error) {
      console.error('Failed to fetch auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  const handleBidChange = (auctionId, value) => {
    setBidAmounts({ ...bidAmounts, [auctionId]: value });
  };

  const handlePlaceBid = async (e, auctionId, currentHighestBid) => {
    e.preventDefault();
    const amount = Number(bidAmounts[auctionId]);

    if (!amount || amount <= currentHighestBid) {
      return alert("Your bid must be higher than the current highest bid!");
    }

    try {
      const response = await fetch(`http://localhost:5005/api/auctions/${auctionId}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: getUserId(), amount })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert("Bid placed successfully!");
        setBidAmounts({ ...bidAmounts, [auctionId]: '' });
        fetchAuctions(); // Refresh the data
      } else {
        alert(data.message || "Failed to place bid");
      }
    } catch (error) {
      console.error(error);
      alert("Server error connecting to backend.");
    }
  };

  // Helper to format remaining time
  const getRemainingTime = (endTime) => {
    const total = Date.parse(endTime) - Date.parse(new Date());
    if (total <= 0) return "Ended";
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    return `${hours}h ${minutes}m remaining`;
  };

  return (
    <div>
      <h2>Live Auctions Room</h2>
      <p>Bid on rare and unused books listed by other users.</p>
      
      {loading ? (
        <p>Loading auctions...</p>
      ) : auctions.length === 0 ? (
        <div className="card" style={{ marginTop: '2rem' }}>
          <p>No active auctions right now. Check back later or start your own from the Dashboard!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
          {auctions.map(auction => (
            <div key={auction._id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  ⏳ {getRemainingTime(auction.endTime)}
                </span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Base: ₹{auction.basePrice}
                </span>
              </div>
              
              <h3 style={{ margin: '0 0 0.5rem 0' }}>{auction.bookId ? auction.bookId.title : 'Unknown Book'}</h3>
              <p style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)' }}>
                {auction.bookId ? `by ${auction.bookId.author}` : ''}
              </p>
              
              <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Current Highest Bid</p>
                <strong style={{ fontSize: '2rem', color: 'var(--primary)' }}>₹{auction.currentHighestBid}</strong>
              </div>

              {auction.sellerId && auction.sellerId._id === getUserId() ? (
                <button 
                  onClick={async () => {
                    if (!window.confirm("Are you sure you want to end this auction and sell to the highest bidder?")) return;
                    try {
                      const res = await fetch(`http://localhost:5005/api/auctions/${auction._id}/end`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: getUserId() })
                      });
                      if (res.ok) {
                        alert("Auction ended! The book has been sold to the highest bidder.");
                        fetchAuctions();
                      } else {
                        const data = await res.json();
                        alert(data.message || "Failed to end auction");
                      }
                    } catch (err) {
                      alert("Server error");
                    }
                  }}
                  style={{ marginTop: 'auto', padding: '0.75rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
                  End Auction & Sell
                </button>
              ) : (
                <form onSubmit={(e) => handlePlaceBid(e, auction._id, auction.currentHighestBid)} style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                  <input 
                    type="number" 
                    required
                    placeholder={`> ₹${auction.currentHighestBid}`}
                    value={bidAmounts[auction._id] || ''}
                    onChange={(e) => handleBidChange(auction._id, e.target.value)}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                  <button 
                    type="submit" 
                    style={{ padding: '0.75rem 1rem', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Place Bid
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Auctions;
