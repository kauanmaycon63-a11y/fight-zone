module.exports=async(req,res)=>{
  if(req.method!=='POST')return res.status(405).json({error:'method'});
  try{
    const product=String(req.body?.product||'');
    const source=String(req.body?.source||'store').slice(0,40);
    if(!['guia','pack','combo'].includes(product))return res.status(400).json({error:'invalid_product'});
    console.log(JSON.stringify({event:'store_click',product,source,ts:Date.now()}));
    return res.status(204).end();
  }catch(e){
    return res.status(204).end();
  }
};
