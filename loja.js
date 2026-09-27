const STORE_PRODUCTS={
  guia:{name:'Guia Fight Zone · MMA sem enrolação',price:'R$ 9,90'},
  pack:{name:'Pack Fight Night',price:'R$ 14,90'},
  combo:{name:'Combo PRO + Pack Fight Night',price:'R$ 19,90'}
};

function getEntitlements(){
  try{return JSON.parse(localStorage.getItem('FZ_STORE_ENTITLEMENTS')||'{}')}catch(e){return {}}
}
function saveEntitlements(v){localStorage.setItem('FZ_STORE_ENTITLEMENTS',JSON.stringify(v))}

function initStore(){
  document.querySelectorAll('[data-buy]').forEach(btn=>{
    btn.addEventListener('click',async()=>{
      const product=btn.dataset.buy;
      if(!STORE_PRODUCTS[product])return;
      const old=btn.textContent;
      btn.disabled=true;
      btn.textContent='Abrindo PIX…';
      try{
        const r=await fetch('/api/create-store-checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({product})});
        const d=await r.json();
        if(!r.ok||!d.url)throw new Error('checkout');
        location.href=d.url;
      }catch(e){
        btn.disabled=false;
        btn.textContent=old;
        alert('Não foi possível abrir o checkout agora. Tente novamente em alguns instantes.');
      }
    });
  });
}

async function confirmStorePayment(){
  const el=document.getElementById('store-confirm');
  if(!el)return;
  const p=new URLSearchParams(location.search);
  const product=p.get('product');
  const payload={product,order_nsu:p.get('order_nsu'),transaction_nsu:p.get('transaction_nsu'),slug:p.get('slug')};
  if(!STORE_PRODUCTS[product]||!payload.order_nsu||!payload.transaction_nsu||!payload.slug){
    el.innerHTML='<div class="store-status error"><h1>Não consegui identificar o pagamento</h1><p>Volte à loja e tente novamente. Se você acabou de pagar, aguarde alguns segundos e atualize esta página.</p><a class="btn" href="/loja.html">Voltar à loja</a></div>';
    return;
  }
  try{
    const r=await fetch('/api/store-status',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const d=await r.json();
    if(d.verified){
      const ent=getEntitlements();
      if(product==='guia')ent.guia=true;
      if(product==='pack'||product==='combo'){ent.guia=true;ent.pack=true;}
      if(product==='combo')localStorage.setItem('FZ_PRO_UNTIL',String(Date.now()+30*864e5));
      saveEntitlements(ent);
      const target=product==='guia'?'/produto.html?item=guia':'/produto.html?item=pack';
      el.innerHTML=`<div class="store-status success"><div class="status-icon">✓</div><span class="kicker">PAGAMENTO CONFIRMADO</span><h1>Compra liberada!</h1><p>${STORE_PRODUCTS[product].name} já está disponível neste dispositivo.</p><div class="store-actions"><a class="btn" href="${target}">Acessar agora</a><a class="btn ghost" href="/loja.html">Voltar à loja</a>${d.receipt_url?`<a class="text-link" href="${d.receipt_url}" target="_blank" rel="noopener">Ver comprovante</a>`:''}</div></div>`;
    }else{
      el.innerHTML='<div class="store-status pending"><div class="status-icon">…</div><h1>Pagamento sendo confirmado</h1><p>Se você já pagou no PIX, aguarde alguns segundos e atualize esta página.</p><button class="btn" onclick="location.reload()">Verificar novamente</button></div>';
    }
  }catch(e){
    el.innerHTML='<div class="store-status error"><h1>Não foi possível confirmar agora</h1><p>Seu pagamento não será perdido. Aguarde alguns segundos e atualize a página.</p><button class="btn" onclick="location.reload()">Tentar novamente</button></div>';
  }
}

document.addEventListener('DOMContentLoaded',()=>{initStore();confirmStorePayment()});
