(function(){
  var id='G-70B346T2ZZ';
  window.dataLayer=window.dataLayer||[];
  window.gtag=window.gtag||function(){dataLayer.push(arguments)};
  gtag('js',new Date());
  gtag('config',id,{send_page_view:true});
  var s=document.createElement('script');
  s.async=true;
  s.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(id);
  document.head.appendChild(s);

  if(!document.querySelector('script[src="/_vercel/insights/script.js"]')){
    var v=document.createElement('script');
    v.defer=true;
    v.src='/_vercel/insights/script.js';
    document.head.appendChild(v);
  }

  document.addEventListener('DOMContentLoaded',function(){
    if(location.pathname==='/loja.html'||location.pathname==='/loja'){
      gtag('event','store_view',{page_path:location.pathname});
      gtag('event','view_item_list',{item_list_name:'Loja Fight Zone'});
    }
    document.addEventListener('click',function(e){
      var el=e.target.closest('[data-track="store_cta"],a[href="/loja.html"],a[href="/loja"]');
      if(!el)return;
      gtag('event','store_cta_click',{
        cta_position:el.dataset.position||'site_link',
        link_text:(el.textContent||'').trim().slice(0,80),
        page_path:location.pathname
      });
    });
  });
})();
