const PRODUCTS={guia:990,pack:1490,combo:1990};

module.exports=async(req,res)=>{
  try{
    const q=req.method==='POST'?req.body:req.query;
    const {order_nsu,transaction_nsu,slug,product}=q||{};
    const expected=PRODUCTS[String(product||'')];
    if(!order_nsu||!transaction_nsu||!slug||!expected)return res.status(400).json({verified:false,error:'missing'});
    if(!String(order_nsu).startsWith(`fzstore-${product}-`))return res.status(400).json({verified:false,error:'order_mismatch'});
    const r=await fetch('https://api.checkout.infinitepay.io/payment_check',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({handle:'studioelianenascimento',order_nsu,transaction_nsu,slug})
    });
    const d=await r.json();
    const verified=!!d.paid&&Number(d.amount)===expected;
    res.status(200).json({verified,paid:!!d.paid,amount:d.amount||0,receipt_url:d.receipt_url||'',product});
  }catch(e){
    res.status(500).json({verified:false,error:'status_error'});
  }
};
