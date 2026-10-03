import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.PREVIEW_URL||'http://127.0.0.1:3000';
const browser=await chromium.launch({args:['--no-sandbox']});
const results=[],errors=[];await mkdir('docs/preview-evidence',{recursive:true});
async function check(name,fn,options={}){
 const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce',...options}),page=await context.newPage();page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));
 try{await fn(page);results.push({name,result:'pass'});}catch(e){results.push({name,result:'fail',detail:e.message});}finally{await context.close();}
}
async function readable(page,selector,backgroundSelector){
 const values=await page.locator(selector).evaluateAll((nodes,backgroundSelector)=>{
  const luminance=color=>color.match(/[\d.]+/g).slice(0,3).map(Number).map(value=>{const c=value/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
  const background=luminance(getComputedStyle(document.querySelector(backgroundSelector)).backgroundColor);
  return nodes.filter(node=>node.getBoundingClientRect().width>0).map(node=>{const color=luminance(getComputedStyle(node).color);return {text:node.textContent,ratio:(Math.max(color,background)+.05)/(Math.min(color,background)+.05)};});
 },backgroundSelector);
 assert.ok(values.length>0);for(const item of values)assert.ok(item.ratio>=4.5,item.text+': unreadable contrast '+item.ratio);
}
await check('All public destinations keep the same readable dark navigation',async page=>{
 for(const route of ['/','/work','/how-we-work','/pricing','/contact']){
  await page.goto(base+route);await page.evaluate(()=>document.fonts.ready);await readable(page,'.ff-navigation .mk-wordmark,.ff-navigation .mk-nav-links>a','.ff-navigation');
  if(route!=='/')await page.screenshot({path:'docs/preview-evidence/brand-'+route.slice(1)+'.png'});
 }
});
await check('Portal navigation stays legible around an unchanged customer website',async page=>{
 await page.goto(base+'/portal-preview/index.html');await page.locator('#moriPage').waitFor();await readable(page,'.brand,#leftRail .nav button.active','#leftRail');assert.match(await page.locator('#moriPage h1').textContent(),/Dinner/);
 await page.screenshot({path:'docs/preview-evidence/brand-portal-review.png'});
 await page.locator('#leftRail [data-view="overview"]').click();await page.screenshot({path:'docs/preview-evidence/brand-portal-overview.png'});
 await page.locator('#leftRail [data-view="pages"]').click();const field=page.locator('[data-field="heading"]');await field.fill('One consistent workspace');await page.locator('#leftRail [data-view="analytics"]').click();await page.locator('#leftRail [data-view="pages"]').click();assert.equal(await field.inputValue(),'One consistent workspace');await page.screenshot({path:'docs/preview-evidence/brand-portal-pages.png'});
});
await check('Motion is finite in editing surfaces and switching views preserves input focus',async page=>{
 await page.goto(base+'/portal-preview/index.html?view=pages');const field=page.locator('[data-field="heading"]');await field.fill('A stable editing surface');await page.waitForTimeout(650);assert.ok(await field.evaluate(node=>node===document.activeElement));assert.equal(await field.inputValue(),'A stable editing surface');
 const infinite=await page.locator('.shell').evaluate(node=>node.getAnimations({subtree:true}).filter(animation=>animation.effect?.getTiming().iterations===Infinity).length);assert.equal(infinite,0);
},{reducedMotion:'no-preference'});
await check('The shared theme reflows on phones and retains reduced-motion preferences',async page=>{
 for(const width of [320,390,768]){
  await page.setViewportSize({width,height:844});await page.goto(base+'/how-we-work');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.goto(base+'/portal-preview/index.html?view=pages');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:'docs/preview-evidence/brand-portal-'+width+'.png'});
  assert.equal(await page.locator('.view.active').evaluate(node=>getComputedStyle(node).animationName),'none');
 }
});
await writeFile('docs/preview-evidence/brand-results.json',JSON.stringify({results,uncaughtErrors:errors},null,2));console.log(JSON.stringify({results,uncaughtErrors:errors},null,2));await browser.close();if(results.some(result=>result.result==='fail')||errors.length)process.exitCode=1;
