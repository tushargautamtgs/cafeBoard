import React, { useState, useEffect } from "react";
import "./App.css";

// ===== MENU DATA =====
const MENU = [
  { id: 1,  title: "Espresso", price: 150, cat:"coffee", popular: true,  rating: 4.9, img:"https://images.unsplash.com/photo-1512568400610-62da28bc8a13?q=80&w=1200&auto=format&fit=crop",   tags:["strong","hot"] },
  { id: 2,  title: "Latte", price: 190, cat:"coffee", popular: true, rating: 4.8, img:"https://images.unsplash.com/photo-1517705008128-361805f42e86?q=80&w=1200&auto=format&fit=crop", tags:["milky","hot"] },
  { id: 3,  title: "Cappuccino", price: 190, cat:"coffee", popular: false, rating: 4.6, img:"https://images.unsplash.com/photo-1497515114629-f71d768fd07c?q=80&w=1200&auto=format&fit=crop", tags:["foam","hot"] },
  { id: 4,  title: "Mocha", price: 210, cat:"coffee", popular: false, rating: 4.5, img:"https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1200&auto=format&fit=crop", tags:["chocolate","sweet"] },
  { id: 5,  title: "Cold Brew", price: 230, cat:"cold", popular: true, rating: 4.7, img:"https://images.unsplash.com/photo-1527169402691-a98e8d6f6b5b?q=80&w=1200&auto=format&fit=crop", tags:["cold","bold"] },
  { id: 6,  title: "Iced Latte", price: 220, cat:"cold", popular: true, rating: 4.6, img:"https://images.unsplash.com/photo-1461988625982-7e46a099bf4f?q=80&w=1200&auto=format&fit=crop", tags:["cold","milky"] },
  { id: 7,  title: "Matcha Latte", price: 200, cat:"tea", popular: true, rating: 4.5, img:"https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=1200&auto=format&fit=crop", tags:["green","vegan"] },
  { id: 8,  title: "Masala Chai", price: 140, cat:"tea", popular: true, rating: 4.9, img:"https://images.unsplash.com/photo-1542367597-8849ebf9bde2?q=80&w=1200&auto=format&fit=crop", tags:["spiced","hot"] },
  { id: 9,  title: "Blueberry Muffin", price: 120, cat:"food", popular: true, rating: 4.4, img:"https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop", tags:["baked"] },
  { id:10,  title: "Avocado Toast", price: 240, cat:"food", popular: false, rating: 4.3, img:"https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1200&auto=format&fit=crop", tags:["vegan","savoury"] },
  { id:11,  title: "Brownie", price: 130, cat:"food", popular: true, rating: 4.7, img:"https://images.unsplash.com/photo-1606313564200-e75d5e30476e?q=80&w=1200&auto=format&fit=crop", tags:["chocolate","sweet"] },
  { id:12,  title: "Lemon Iced Tea", price: 160, cat:"cold", popular: false, rating: 4.2, img:"https://images.unsplash.com/photo-1465929639680-64ee08f0f13b?q=80&w=1200&auto=format&fit=crop", tags:["cold","refreshing"] },
];

// ===== UTILITY =====
const money = n => Number(n).toFixed(0);

// ===== TOAST COMPONENT =====
const Toast = ({ msg }) => <div className="toast">✅ <span>{msg}</span></div>;

function App() {
  const [theme, setTheme] = useState(localStorage.getItem("cc_theme") || (window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light"));
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [priceMax, setPriceMax] = useState(600);
  const [sort, setSort] = useState("popular");
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("cc_cart_v1") || "[]"));
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    document.documentElement.className = theme === "dark" ? "dark" : "";
    localStorage.setItem("cc_theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("cc_cart_v1", JSON.stringify(cart));
  }, [cart]);

  const showToast = (msg, duration=1800) => {
    const id = Date.now();
    setToasts(prev => [...prev, {id, msg}]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration+300);
  };

  const filteredMenu = MENU.filter(m =>
    (category === "all" || m.cat === category) &&
    m.price <= priceMax &&
    (m.title.toLowerCase().includes(search.toLowerCase()) || m.tags.some(t=>t.includes(search.toLowerCase())))
  ).sort((a,b)=>{
    switch(sort){
      case "price-asc": return a.price-b.price;
      case "price-desc": return b.price-a.price;
      case "rating-desc": return b.rating-a.rating;
      default: return Number(b.popular)-Number(a.popular) || b.rating-a.rating;
    }
  });

  const addToCart = (id) => {
    setCart(prev => {
      const found = prev.find(c => c.id === id);
      if(found) return prev.map(c=>c.id===id?{...c, qty:c.qty+1}:c);
      return [...prev, {id, qty:1}];
    });
    const title = MENU.find(m=>m.id===id)?.title || "Item";
    showToast(`${title} added to cart`);
  };

  const changeQty = (id, delta) => {
    setCart(prev => prev.map(c => c.id===id?{...c, qty:c.qty+delta}:c).filter(c=>c.qty>0));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(c=>c.id!==id));
    showToast("Removed from cart");
  };

  const clearCart = () => { setCart([]); showToast("Cart cleared"); };

  const cartTotal = cart.reduce((sum, c) => sum + (MENU.find(m=>m.id===c.id)?.price || 0)*c.qty, 0);

  const handleSubmit = e => {
    e.preventDefault();
    const form = e.target;
    const name = form.fullName.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const guests = form.guests.value;
    if(!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^[0-9]{10}$/.test(phone) || !guests){
      showToast("Please fill all required fields correctly", 2500);
      return;
    }
    showToast(`Thanks ${name}! We’ll confirm your booking soon.`, 2500);
    form.reset();
  };

  return (
    <div>
      {/* NAVBAR */}
      <header>
        <div className="container nav">
          <div className="brand">
            <div className="logo">☕</div>
            <a href="#top">Coffee Corner</a>
            <span className="chip" title="Open 7:00–21:00">Open • 7am–9pm</span>
          </div>
          <nav className="nav-links">
            <a href="#menu">Menu</a>
            <a href="#pricing">Pricing</a>
            <a href="#contact">Contact</a>
            <button className="dark-toggle" onClick={()=>setTheme(theme==="dark"?"light":"dark")} aria-label="Toggle dark mode"></button>
          </nav>
        </div>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="container hero">
          <div>
            <h1>Sip. Smile. Repeat.</h1>
            <p className="muted">Freshly roasted beans, handcrafted with love. Practice project to master <strong>React + CSS</strong>.</p>
            <div style={{display:"flex", gap:10, marginTop:12}}>
              <a href="#menu" className="btn">Explore Menu</a>
              <a href="#contact" className="btn ghost">Book a Table</a>
            </div>
          </div>
          <div className="banner" role="img" aria-label="A cup of coffee on a wooden table">
            <div className="floating">⭐ 4.8 / 5 — Loved by 10k+</div>
          </div>
        </section>

        {/* ABOUT */}
        <section className="container about">
          <div>
            <h2 className="section-title">About Coffee Corner</h2>
            <p>We brew with ethically sourced beans, slow-roasting to unlock layered flavors. Demonstrates React, hooks, state management and responsive design.</p>
            <div className="info-grid">
              <div className="item"><strong>Since</strong><br/>2015</div>
              <div className="item"><strong>Roasts</strong><br/>Light • Medium • Dark</div>
              <div className="item"><strong>Wi-Fi</strong><br/>Free & Fast</div>
              <div className="item"><strong>Pet-Friendly</strong><br/>Yes 🐾</div>
            </div>
          </div>
          <img src="https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=1300&auto=format&fit=crop" alt="Barista pouring latte art" loading="lazy"/>
        </section>

        {/* MENU & CART */}
        <section className="container" id="menu">
          <h2 className="section-title">Our Menu</h2>
          <div className="toolbar">
            <div className="left">
              <input className="input" type="search" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}/>
              <div className="range">
                <label className="muted">Max ₹</label>
                <input type="range" min="80" max="600" step="10" value={priceMax} onChange={e=>setPriceMax(Number(e.target.value))}/>
                <output>{priceMax}</output>
              </div>
              <select value={category} onChange={e=>setCategory(e.target.value)}>
                <option value="all">All categories</option>
                <option value="coffee">Coffee</option>
                <option value="tea">Tea</option>
                <option value="cold">Cold</option>
                <option value="food">Food</option>
              </select>
              <select value={sort} onChange={e=>setSort(e.target.value)}>
                <option value="popular">Sort: Popular</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="rating-desc">Rating: High → Low</option>
              </select>
            </div>
            <div className="right">
              <button className="btn ghost" type="button" onClick={()=>{
                setSearch(""); setCategory("all"); setPriceMax(600); setSort("popular");
                showToast("Filters cleared");
              }}>Clear</button>
            </div>
          </div>

          <div className="grid-2">
            {/* MENU GRID */}
            <div className="menu-grid">
              {filteredMenu.length === 0 && <div className="empty">No items match your filters.</div>}
              {filteredMenu.map(m=>(
                <article key={m.id} className="card menu-card">
                  <img src={m.img} alt={m.title}/>
                  <div className="content">
                    <div className="price-row">
                      <h3>{m.title}</h3>
                      <strong>₹{money(m.price)}</strong>
                    </div>
                    <div className="price-row muted">
                      <span className="stars">{"★".repeat(Math.round(m.rating))}<span className="muted">{"☆".repeat(5-Math.round(m.rating))}</span></span>
                      <span>{m.cat.toUpperCase()}</span>
                    </div>
                    <div className="tag-row">{m.tags.map(t=><span key={t} className="chip">{t}</span>)}</div>
                    <div style={{display:"flex", gap:8, marginTop:10}}>
                      <button className="btn" onClick={()=>addToCart(m.id)}>Add</button>
                      <button className="btn ghost" onClick={()=>showToast(`${m.title}: ₹${money(m.price)} • ${m.tags.join(", ")}`,3000)}>Details</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* CART */}
            <aside className="cart">
              <h3>Your Cart</h3>
              <div className="cart-list">
                {cart.length===0 && <div className="empty muted">Cart is empty. Add something tasty!</div>}
                {cart.map(c=>{
                  const item = MENU.find(m=>m.id===c.id);
                  return item?(
                    <div key={c.id} className="cart-item">
                      <img src={item.img} alt="" style={{width:52,height:52,objectFit:"cover",borderRadius:10}}/>
                      <div>
                        <div style={{display:"flex",justifyContent:"space-between",gap:8}}>
                          <strong>{item.title}</strong>
                          <span>₹{money(item.price*c.qty)}</span>
                        </div>
                        <div className="qty">
                          <button onClick={()=>changeQty(item.id,-1)}>−</button>
                          <span aria-live="polite">Qty: <strong>{c.qty}</strong></span>
                          <button onClick={()=>changeQty(item.id,1)}>+</button>
                          <button className="btn ghost" style={{marginLeft:"auto"}} onClick={()=>removeFromCart(item.id)}>Remove</button>
                        </div>
                      </div>
                    </div>
                  ):null;
                })}
              </div>
              {cart.length>0 && (
                <div className="cart-footer">
                  <div>
                    <div className="muted">Subtotal</div>
                    <div><strong>₹ {cartTotal}</strong></div>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button className="btn ghost" onClick={clearCart}>Clear</button>
                    <button className="btn" onClick={()=>{showToast("Checkout successful (demo)"); clearCart();}}>Checkout</button>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </section>

        {/* PRICING TABLE */}
        <section className="container" id="pricing">
          <h2 className="section-title">Beverage Sizes & Base Prices</h2>
          <div className="table-wrap card">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Small (8oz)</th>
                  <th>Medium (12oz)</th>
                  <th>Large (16oz)</th>
                </tr>
              </thead>
              <tbody>
                <tr><th>Espresso</th><td>₹120</td><td>₹150</td><td>₹180</td></tr>
                <tr><th>Latte</th><td>₹160</td><td>₹190</td><td>₹220</td></tr>
                <tr><th>Cappuccino</th><td>₹160</td><td>₹190</td><td>₹220</td></tr>
                <tr><th>Cold Brew</th><td>₹180</td><td>₹220</td><td>₹260</td></tr>
                <tr><th>Matcha</th><td>₹170</td><td>₹200</td><td>₹230</td></tr>
              </tbody>
            </table>
          </div>
          <p className="muted" style={{marginTop:8}}>* Actual prices may vary by milk type and add-ons.</p>
        </section>

        {/* CONTACT */}
        <section className="container" id="contact">
          <h2 className="section-title">Contact / Book a Table</h2>
          <form onSubmit={handleSubmit} noValidate>
            <fieldset>
              <legend>Your Info</legend>
              <div className="row">
                <div>
                  <label>Full Name</label>
                  <input name="fullName" required placeholder="e.g., Tushar Gautam"/>
                  <div className="help">Required</div>
                </div>
                <div>
                  <label>Email</label>
                  <input name="email" type="email" required placeholder="you@example.com"/>
                  <div className="help">We’ll send confirmation here.</div>
                </div>
              </div>
              <div className="row">
                <div>
                  <label>Phone</label>
                  <input name="phone" type="tel" pattern="^[0-9]{10}$" required placeholder="10-digit number"/>
                  <div className="help">Digits only, no spaces.</div>
                </div>
                <div>
                  <label>Guests</label>
                  <select name="guests" required>
                    <option value="" disabled selected>Select</option>
                    <option>1</option><option>2</option><option>3</option><option>4</option><option>5+</option>
                  </select>
                </div>
              </div>
              <div>
                <label>Message / Requests</label>
                <textarea name="message" rows={4} placeholder="Allergies, celebration notes, etc."></textarea>
              </div>
            </fieldset>
            <div style={{display:"flex",gap:10,alignItems:"center",marginTop:8}}>
              <button className="btn" type="submit">Send</button>
              <span className="muted">We usually reply within a few hours.</span>
            </div>
          </form>
        </section>
      </main>

      <footer>
        © {new Date().getFullYear()} Coffee Corner • <a href="#top">Back to top ↑</a>
      </footer>

      {/* TOASTS */}
      <div className="toast-wrap" aria-live="polite" aria-atomic="true">
        {toasts.map(t => <Toast key={t.id} msg={t.msg}/>)}
      </div>
    </div>
  );
}

export default App;
