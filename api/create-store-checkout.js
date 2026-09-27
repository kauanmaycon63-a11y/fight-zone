const PRODUCTS={
  guia:{price:490,description:'Fight Zone - Guia MMA sem enrolacao'},
  pack:{price:790,description:'Fight Zone - Pack Fight Night'},
  combo:{price:1090,description:'Fight Zone - Combo PRO + Pack Fight Night'}
};

module.exports=async(req,res)=>{
  if(req.method!=='POST')return res.status(405).json({error:'method'});
  try{
    const product=String(req.body?.product||'');
    const item=PRODUCTS[product];
    if(!item)return res.status(400).json({error:'invalid_product'});
    const proto=req.headers['x-forwarded-proto']||'https';
    const host=req.headers.host;
    const origin=process.env.SITE_URL||`${proto}://${host}`;
    const order_nsu=`fzstore-${product}-${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
    const redirect_url=`${origin}/loja-sucesso.html?product=${encodeURIComponent(product)}`;
    const r=await fetch('https://api.checkout.infinitepay.io/links',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        handle:'studioelianenascimento',
        redirect_url,
        webhook_url:`${origin}/api/infinitepay-webhook`,
        order_nsu,
        items:[{quantity:1,price:item.price,description:item.description}]
      })
    });
    const d=await r.json();
    if(!r.ok||!d.url)return res.status(502).json({error:'checkout_unavailable',details:d});
    res.status(200).json({url:d.url,order_nsu,product});
  }catch(e){
    res.status(500).json({error:'checkout_error'});
  }
};
