  // Reveal on scroll
  const reveals = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  },{threshold:0.15});
  reveals.forEach(el=>io.observe(el));

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach(item=>{
    item.querySelector('.faq-q').addEventListener('click',()=>{
      const isActive = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(i=>i.classList.remove('active'));
      if(!isActive) item.classList.add('active');
    });
  });

  // Mobile burger menu (simple toggle of nav-links)
  const burger = document.getElementById('burgerBtn');
  const navLinks = document.querySelector('.nav-links');
  burger.addEventListener('click',()=>{
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    navLinks.style.position='absolute';
    navLinks.style.top='64px';
    navLinks.style.left='0';
    navLinks.style.right='0';
    navLinks.style.background='var(--cream)';
    navLinks.style.flexDirection='column';
    navLinks.style.padding='20px 24px';
    navLinks.style.boxShadow='var(--shadow-sm)';
  });

  /* ============ CART ============ */
  const CHECKOUT_WA_NUMBER = '628811927531';
  const CHECKOUT_EMAIL = 'alfariziy76@gmail.com';
  const CART_KEY = 'rotieskrim_cart';

  let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');

  const cartOverlay = document.getElementById('cartOverlay');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartItemsWrap = document.getElementById('cartItemsWrap');
  const cartEmptyState = document.getElementById('cartEmptyState');
  const cartFoot = document.getElementById('cartFoot');
  const cartTotalText = document.getElementById('cartTotalText');
  const cartBadges = [document.getElementById('cartBadge'), document.getElementById('cartBadgeMobile')];
  const cartToast = document.getElementById('cartToast');
  const cartToastText = document.getElementById('cartToastText');

  function formatRupiah(num){
    return 'Rp' + num.toLocaleString('id-ID');
  }

  function saveCart(){
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function showToast(msg){
    cartToastText.textContent = msg;
    cartToast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(()=>cartToast.classList.remove('show'), 2200);
  }

  function openCart(){
    cartOverlay.classList.add('open');
    cartDrawer.classList.add('open');
  }
  function closeCart(){
    cartOverlay.classList.remove('open');
    cartDrawer.classList.remove('open');
  }

  function addToCart(name, price, emoji){
    const existing = cart.find(i=>i.name === name);
    if(existing){
      existing.qty += 1;
    } else {
      cart.push({name, price, emoji, qty:1});
    }
    saveCart();
    renderCart();
    showToast(`${emoji} ${name} ditambahkan ke keranjang`);
  }

  function updateQty(name, delta){
    const item = cart.find(i=>i.name === name);
    if(!item) return;
    item.qty += delta;
    if(item.qty <= 0){
      cart = cart.filter(i=>i.name !== name);
    }
    saveCart();
    renderCart();
  }

  function removeItem(name){
    cart = cart.filter(i=>i.name !== name);
    saveCart();
    renderCart();
  }

  function cartTotal(){
    return cart.reduce((sum,i)=>sum + i.price*i.qty, 0);
  }

  function cartCount(){
    return cart.reduce((sum,i)=>sum + i.qty, 0);
  }

  function renderCart(){
    const count = cartCount();
    cartBadges.forEach(b=>{
      if(!b) return;
      b.textContent = count;
      b.classList.toggle('hide', count === 0);
    });

    if(cart.length === 0){
      cartEmptyState.style.display = 'block';
      cartFoot.style.display = 'none';
      cartItemsWrap.querySelectorAll('.cart-item').forEach(el=>el.remove());
      return;
    }

    cartEmptyState.style.display = 'none';
    cartFoot.style.display = 'block';
    cartItemsWrap.querySelectorAll('.cart-item').forEach(el=>el.remove());

    cart.forEach(item=>{
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <div class="ci-emoji">${item.emoji}</div>
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <div class="ci-price">${formatRupiah(item.price)}</div>
          <div class="qty-control">
            <button class="qty-minus" aria-label="Kurangi">−</button>
            <span>${item.qty}</span>
            <button class="qty-plus" aria-label="Tambah">+</button>
            <button class="cart-remove" aria-label="Hapus"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
      `;
      el.querySelector('.qty-minus').addEventListener('click', ()=>updateQty(item.name, -1));
      el.querySelector('.qty-plus').addEventListener('click', ()=>updateQty(item.name, 1));
      el.querySelector('.cart-remove').addEventListener('click', ()=>removeItem(item.name));
      cartItemsWrap.appendChild(el);
    });

    cartTotalText.textContent = formatRupiah(cartTotal());
  }

  function buildOrderText(){
    let lines = ['Halo, saya mau pesan Roti Es Krim:', ''];
    cart.forEach(item=>{
      lines.push(`- ${item.name} x${item.qty} = ${formatRupiah(item.price*item.qty)}`);
    });
    lines.push('');
    lines.push(`Total: ${formatRupiah(cartTotal())}`);
    return lines.join('\n');
  }

  document.querySelectorAll('.add-cart-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      addToCart(btn.dataset.name, parseInt(btn.dataset.price,10), btn.dataset.emoji);
    });
  });

  document.getElementById('cartOpenBtn').addEventListener('click', openCart);
  document.getElementById('cartOpenBtnMobile').addEventListener('click', openCart);
  document.getElementById('cartCloseBtn').addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  document.getElementById('checkoutWaBtn').addEventListener('click', ()=>{
    if(cart.length === 0) return;
    const text = encodeURIComponent(buildOrderText());
    window.open(`https://wa.me/${CHECKOUT_WA_NUMBER}?text=${text}`, '_blank');
  });

  document.getElementById('checkoutEmailBtn').addEventListener('click', ()=>{
    if(cart.length === 0) return;
    const subject = encodeURIComponent('Pesanan Roti Es Krim');
    const body = encodeURIComponent(buildOrderText());
    window.location.href = `mailto:${CHECKOUT_EMAIL}?subject=${subject}&body=${body}`;
  });

  renderCart();
