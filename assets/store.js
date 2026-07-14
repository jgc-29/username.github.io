/* ============================================================
   UNCLENCH — store engine
   Product catalogue, cart state, drawer UI, checkout hook.
   Cart persists in memory for the session (see note in checklist
   about swapping to a real backend + Stripe).
   ============================================================ */

/* ---- PRODUCT CATALOGUE ----
   priceId is where your Stripe Price ID goes once created.
   Leave as null and checkout falls back to demo mode.        */
const CATALOGUE = {
  "the-complete": {
    id:"the-complete", name:"The Complete", price:299, priceId:"https://buy.stripe.com/eVq14mdnA8DmeB3fo0frW08",
    blurb:"Hard Night Plate + Day Plate + Night Restore + Jaw Balm + Release Tool + the habit programme.",
    thumb:"COMPLETE", thumbClass:"coral"
  },
  "night-plate-soft": {
    id:"night-plate-soft", name:"The Night Plate — Soft", price:119, priceId:"https://buy.stripe.com/aFa4gybfs06Q64x2BefrW0b",
    blurb:"Custom soft nightguard for light-to-moderate clenchers. Dentist-reviewed.",
    thumb:"SOFT", thumbClass:""
  },
  "night-plate-hard": {
    id:"night-plate-hard", name:"The Night Plate — Hard", price:199, priceId:"https://buy.stripe.com/fZu4gy2IW3j20Kd1xafrW09",
    blurb:"Clinical-grade hard build for heavy grinders and restored teeth.",
    thumb:"HARD", thumbClass:""
  },
  "night-plate-hard-fitted": {
    id:"night-plate-hard-fitted", name:"Night Plate — Hard, Fitted In-Clinic", price:294, priceId:"https://buy.stripe.com/3cI3cubfs1aUgJb6RufrW0a",
    blurb:"The Hard build, fitted personally by one of our dentists in Jersey, Guernsey or London.",
    thumb:"FITTED", thumbClass:"coral"
  },
  "day-plate": {
    id:"day-plate", name:"The Day Plate", price:139, priceId:"https://buy.stripe.com/00w7sK4R4f1KdwZ1xafrW0c",
    blurb:"Ultra-thin, invisible daytime guard. Habit programme included.",
    thumb:"DAY", thumbClass:"coral"
  },
  "night-restore": {
    id:"night-restore", name:"Night Restore", price:24, priceId:"https://buy.stripe.com/5kQ14m97k4n664xb7KfrW0d",
    blurb:"Nightly magnesium glycinate + L-theanine drops. One month's supply.",
    thumb:"NIGHT RESTORE", thumbClass:"sage"
  },
  "jaw-balm": {
    id:"jaw-balm", name:"Jaw Balm", price:16, priceId:"https://buy.stripe.com/bJe4gy5V8cTC1Oh1xafrW0e",
    blurb:"Warming magnesium & arnica for masseter and temples.",
    thumb:"BALM", thumbClass:"coral"
  },
  "release-tool": {
    id:"release-tool", name:"The Release Tool", price:22, priceId:"https://buy.stripe.com/bJe6oG97k7zi8cFejWfrW0f",
    blurb:"Trigger-point tool shaped for the jaw, with video protocols.",
    thumb:"TOOL", thumbClass:"sage"
  },
  "day-plate-sub": {
    id:"day-plate-sub", name:"Day Plate Subscription", price:79, priceId:"https://buy.stripe.com/7sY28q5V8f1K9gJb7KfrW0g", sub:true,
    blurb:"A fresh Day Plate every 6 months. Scan on file.",
    thumb:"DAY SUB", thumbClass:"coral"
  },
  "hard-plate-sub": {
    id:"hard-plate-sub", name:"Hard Plate Subscription", price:99, priceId:"https://buy.stripe.com/cNi9AS6Zc4n6fF72BefrW0h", sub:true,
    blurb:"A fresh clinical-grade Hard plate every 6 months.",
    thumb:"HARD SUB", thumbClass:""
  }
};

/* ---- CART STATE ---- */
let CART = [];

function cartAdd(id, variant){
  const p = CATALOGUE[id];
  if(!p) return;
  const key = id + (variant ? "::"+variant : "");
  const existing = CART.find(l => l.key === key);
  if(existing){ existing.qty += 1; }
  else { CART.push({key, id, variant:variant||null, qty:1}); }
  renderCart();
  openCart();
  pulseCartCount();
}
function cartRemove(key){ CART = CART.filter(l => l.key !== key); renderCart(); }
function cartQty(key, delta){
  const l = CART.find(x => x.key === key);
  if(!l) return;
  l.qty += delta;
  if(l.qty < 1) cartRemove(key); else renderCart();
}
function cartCount(){ return CART.reduce((n,l)=>n+l.qty,0); }
function cartTotal(){ return CART.reduce((s,l)=>s + CATALOGUE[l.id].price * l.qty, 0); }

/* ---- DRAWER UI ---- */
function openCart(){ document.querySelector('.cart-overlay')?.classList.add('open'); document.querySelector('.cart-drawer')?.classList.add('open'); }
function closeCart(){ document.querySelector('.cart-overlay')?.classList.remove('open'); document.querySelector('.cart-drawer')?.classList.remove('open'); }

function pulseCartCount(){
  const el = document.querySelector('.cart-count');
  if(!el) return;
  el.animate([{transform:'scale(1)'},{transform:'scale(1.4)'},{transform:'scale(1)'}],{duration:300});
}

function renderCart(){
  document.querySelectorAll('.cart-count').forEach(el=>{
    const c = cartCount();
    el.textContent = c;
    el.style.display = c > 0 ? 'inline-flex' : 'none';
  });
  const items = document.querySelector('.cart-items');
  const foot = document.querySelector('.cart-foot');
  if(!items) return;

  if(CART.length === 0){
    items.innerHTML = `<div class="cart-empty">
      <div class="ce-word">Nothing held.</div>
      <p style="font-size:14px">Your cart is relaxed. Add something to change that.</p>
    </div>`;
    if(foot) foot.style.display = 'none';
    return;
  }
  if(foot) foot.style.display = 'block';

  items.innerHTML = CART.map(l=>{
    const p = CATALOGUE[l.id];
    return `<div class="ci">
      <div class="ci-thumb ${p.thumbClass}">${p.thumb}</div>
      <div class="ci-body">
        <div class="ci-name">${p.name}</div>
        <div class="ci-variant">${l.variant ? l.variant : (p.sub ? 'Subscription' : 'One-time')}</div>
        <div class="ci-controls">
          <div class="qty">
            <button onclick="cartQty('${l.key}',-1)">–</button>
            <span>${l.qty}</span>
            <button onclick="cartQty('${l.key}',1)">+</button>
          </div>
          <button class="ci-remove" onclick="cartRemove('${l.key}')">Remove</button>
        </div>
      </div>
      <div class="ci-price">£${p.price * l.qty}</div>
    </div>`;
  }).join('');

  const sub = document.querySelector('.cart-subtotal span:last-child');
  if(sub) sub.textContent = '£' + cartTotal();
}

/* ---- CHECKOUT HOOK ----
   In production this posts the cart to your server, which creates
   a Stripe Checkout Session and returns a URL to redirect to.
   Until that backend exists, we route to the local checkout page. */
function checkout(){
  if(CART.length === 0) return;

  // Stripe Payment Links are one product per link. If every line in the cart
  // is the same single product, go straight to its link. Otherwise, send the
  // customer to the highest-value item's link and note the extras (interim
  // approach until a multi-item Checkout Session backend is added).
  const linked = CART.filter(l => CATALOGUE[l.id] && CATALOGUE[l.id].priceId);
  const unlinked = CART.filter(l => !(CATALOGUE[l.id] && CATALOGUE[l.id].priceId));

  // Single distinct product, and it has a link -> direct to Stripe
  if(CART.length === 1 && linked.length === 1){
    window.location = CATALOGUE[CART[0].id].priceId;
    return;
  }

  // Multiple items: if the highest-value line has a link, use it and warn.
  if(linked.length > 0){
    const top = linked.slice().sort((a,b)=>CATALOGUE[b.id].price - CATALOGUE[a.id].price)[0];
    const others = CART.filter(l => l.key !== top.key);
    let msg = "Right now each product checks out individually. We'll take you to checkout for " + CATALOGUE[top.id].name + ".";
    if(others.length) msg += " Please check out your other item(s) separately afterwards: " + others.map(l=>CATALOGUE[l.id].name).join(", ") + ".";
    alert(msg);
    window.location = CATALOGUE[top.id].priceId;
    return;
  }

  // Nothing in cart has a link yet
  alert("Checkout for these item(s) is being set up. Please check back shortly.");
}

/* ---- INJECT SHARED CART DRAWER + FOOTER on every page ---- */
function injectChrome(){
  if(!document.querySelector('.cart-drawer')){
    const drawer = document.createElement('div');
    drawer.innerHTML = `
      <div class="cart-overlay" onclick="closeCart()"></div>
      <aside class="cart-drawer" aria-label="Cart">
        <div class="cart-head">
          <h3>Your cart</h3>
          <button class="cart-close" onclick="closeCart()">×</button>
        </div>
        <div class="cart-items"></div>
        <div class="cart-foot">
          <div class="cart-subtotal"><span>Subtotal</span><span>£0</span></div>
          <p class="cart-note">Shipping &amp; any applicable VAT calculated at checkout.</p>
          <button class="btn btn-coral btn-full" onclick="checkout()">Checkout →</button>
        </div>
      </aside>`;
    document.body.appendChild(drawer);
  }
  renderCart();
}

/* ---- scroll reveal ---- */
function initReveal(){
  const els = document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){ els.forEach(e=>e.classList.add('in')); return; }
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  },{threshold:0.12});
  els.forEach(e=>io.observe(e));
}

document.addEventListener('DOMContentLoaded', ()=>{ injectChrome(); initReveal(); });
