/* Each focused space keeps its own local draft. The complete workspace uses its existing keys. */
(()=>{
 const spaces={
  design:{label:'Design & feedback',view:'review',views:['overview','direction','build','review']},
  content:{label:'Content updates',view:'pages',views:['pages','states','settings']},
  insight:{label:'Visitors & search',view:'analytics',views:['analytics','seo','connections','settings']},
  launch:{label:'Launch & account',view:'launch',views:['launch','domains','billing','settings']},
 };
 const params=new URLSearchParams(location.search),id=params.get('space');
 window.ffPreviewPackage=params.get('package')==='first'?{id:'first',label:'One-page website',rounds:1,initial:199,balance:0}:{id:'site',label:'Custom website',rounds:3,initial:200,balance:1300};
 if(params.get('embed')==='1')document.documentElement.dataset.previewEmbed='true';
 window.ffPreviewSpace=Object.hasOwn(spaces,id)?{id,...spaces[id]}:null;
 window.ffStorageKey=key=>`${key}${window.ffPreviewSpace?`:space:${window.ffPreviewSpace.id}`:''}${window.ffPreviewPackage.id==='first'?':package:first':''}`;
})();
