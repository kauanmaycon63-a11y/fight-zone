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
})();
