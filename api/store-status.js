const PRODUCTS={guia:990,pack:1490,combo:1990};

module.exports=async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST')return res.status(405).json({verified:false,error:'method'});
  try{
    const q=req.body||{};
    const order_nsu=String(q.order_nsu||'');
    const transaction_nsu=String(q.transaction_nsu||'');
    const slug=String(q.slug||'');
    const requestedProduct=String(q.product||'');
    const m=order_nsu.match(/^fzstore-(guia|pack|combo)-/);
    const orderProduct=m?.[1]||'';
    const product=requestedProduct||orderProduct;
    const expected=PRODUCTS[product];
    if(!order_nsu||!transaction_nsu||!slug||!expected)return res.status(400).json({verified:false,error:'missing'});
    if(!orderProduct||orderProduct!==product)return res.status(400).json({verified:false,error:'order_mismatch'});
    if(order_nsu.length>160||transaction_nsu.length>200||slug.length>300)return res.status(400).json({verified:false,error:'invalid'});

    const r=await fetch('https://api.checkout.infinitepay.io/payment_check',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({handle:'studioelianenascimento',order_nsu,transaction_nsu,slug})
    });
    let d={};
    try{d=await r.json()}catch(e){}
    if(!r.ok)return res.status(502).json({verified:false,error:'provider_unavailable'});
    const amount=Number(d.amount||0);
    const verified=!!d.paid&&amount===expected;
    res.status(200).json({verified,paid:!!d.paid,amount,receipt_url:d.receipt_url||'',product});
  }catch(e){
    res.status(500).json({verified:false,error:'status_error'});
  }
};
