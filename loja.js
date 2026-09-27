const STORE_PRODUCTS={
  guia:{name:'Guia Fight Zone · MMA sem enrolação',price:'R$ 9,90'},
  pack:{name:'Pack Fight Night',price:'R$ 14,90'},
  combo:{name:'Combo PRO + Pack Fight Night',price:'R$ 19,90'}
};

function getReceipts(){try{return JSON.parse(localStorage.getItem('FZ_STORE_RECEIPTS')||'{}')}catch(e){return {}}}
function saveReceipt(product,payload){const r=getReceipts();r[product]=payload;localStorage.setItem('FZ_STORE_RECEIPTS',JSON.stringify(r))}
function inferProduct(order){const m=String(order||'').match(/^fzstore-(guia|pack|combo)-/);return m?.[1]||''}

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
        if(typeof gtag==='function')gtag('event','begin_checkout',{currency:'BRL',value:Number(STORE_PRODUCTS[product].price.replace('R$ ','').replace(',','.')),items:[{item_name:STORE_PRODUCTS[product].name}]});
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
  const order_nsu=p.get('order_nsu')||'';
  const product=p.get('product')||inferProduct(order_nsu);
  const payload={product,order_nsu,transaction_nsu:p.get('transaction_nsu')||'',slug:p.get('slug')||''};
  if(!STORE_PRODUCTS[product]||!payload.order_nsu||!payload.transaction_nsu||!payload.slug){
    el.innerHTML='<div class="store-status error"><h1>Não consegui identificar o pagamento</h1><p>Volte à loja e tente novamente. Se você acabou de pagar, aguarde alguns segundos e atualize esta página.</p><a class="btn" href="/loja.html">Voltar à loja</a></div>';
    return;
  }
  let attempts=0;
  const check=async()=>{
    attempts++;
    try{
      const r=await fetch('/api/store-status',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),cache:'no-store'});
      const d=await r.json();
      if(d.verified){
        saveReceipt(product,payload);
        if(product==='combo')localStorage.setItem('FZ_PRO_UNTIL',String(Date.now()+30*864e5));
        const value={guia:9.9,pack:14.9,combo:19.9}[product];
        if(typeof gtag==='function')gtag('event','purchase',{transaction_id:payload.order_nsu,currency:'BRL',value,items:[{item_name:STORE_PRODUCTS[product].name}]});
        const target=product==='guia'?'/produto.html?item=guia':'/produto.html?item=pack';
        const receipt=/^https:\/\//i.test(d.receipt_url||'')?`<a class="text-link" href="${d.receipt_url}" target="_blank" rel="noopener">Ver comprovante</a>`:'';
        el.innerHTML=`<div class="store-status success"><div class="status-icon">✓</div><span class="kicker">PAGAMENTO CONFIRMADO</span><h1>Compra liberada!</h1><p>${STORE_PRODUCTS[product].name} já está disponível neste dispositivo.</p><div class="store-actions"><a class="btn" href="${target}">Acessar agora</a><a class="btn ghost" href="/loja.html">Voltar à loja</a>${receipt}</div></div>`;
        return;
      }
      if(attempts<7){
        el.innerHTML='<div class="store-status pending"><div class="status-icon">…</div><h1>Pagamento sendo confirmado</h1><p>Se você já pagou no PIX, estamos verificando automaticamente.</p></div>';
        setTimeout(check,3000);
      }else{
        el.innerHTML='<div class="store-status pending"><div class="status-icon">…</div><h1>Pagamento ainda não confirmado</h1><p>Seu pagamento não será perdido. Aguarde alguns segundos e tente novamente.</p><button class="btn" onclick="location.reload()">Verificar novamente</button></div>';
      }
    }catch(e){
      if(attempts<4)setTimeout(check,3000);
      else el.innerHTML='<div class="store-status error"><h1>Não foi possível confirmar agora</h1><p>Seu pagamento não será perdido. Aguarde alguns segundos e atualize a página.</p><button class="btn" onclick="location.reload()">Tentar novamente</button></div>';
    }
  };
  check();
}

document.addEventListener('DOMContentLoaded',()=>{initStore();confirmStorePayment()});
