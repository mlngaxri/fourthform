import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.PREVIEW_URL||'http://127.0.0.1:3000';
const browser=await chromium.launch({args:['--no-sandbox']});
const results=[],errors=[];await mkdir('docs/preview-evidence',{recursive:true});
async function check(name,fn,options={}){
 const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'no-preference',...options}),page=await context.newPage();page.setDefaultTimeout(10000);page.on('pageerror',error=>errors.push({name,error:error.message}));
 try{await page.goto(base);await page.locator('.mk-orbit-hero[data-orbit-running]').waitFor();await fn(page);results.push({name,result:'pass'});}catch(error){results.push({name,result:'fail',detail:error.message});}finally{await context.close();}
}
const point=page=>page.locator('.orbit-card').first().evaluate(card=>{const r=card.getBoundingClientRect();return {x:r.x,y:r.y};});
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const moving=page=>page.waitForFunction(()=>document.querySelector('.mk-orbit-hero')?.dataset.orbitRunning==='true');
await check('The desktop circle moves visibly with the cursor over the message or the imagery',async page=>{
 for(const width of [1024,1440,1920]){await page.setViewportSize({width,height:900});await page.mouse.move(width/2,400);await moving(page);const before=await point(page);await page.waitForTimeout(550);assert.ok(distance(before,await point(page))>8,`Circular motion at ${width}px`);}
 const box=await page.locator('.orbit-card').first().boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);const before=await point(page);await page.waitForTimeout(500);assert.ok(distance(before,await point(page))>8,'Decorative cards do not pause the gallery on hover');
 await page.screenshot({path:'docs/preview-evidence/orbit-desktop-depth.png'});
});
await check('A busy JavaScript thread cannot slow the circle to a capped frame clock',async page=>{
 await moving(page);await page.waitForTimeout(100);const before=await point(page);await page.evaluate(()=>{const end=performance.now()+700;while(performance.now()<end){/* A slow desktop task. */}});await page.waitForTimeout(80);assert.ok(distance(before,await point(page))>18,'Native animation advances by elapsed time after a blocked frame');
});
await check('Motion preferences stop and restore the scene without a visible control',async page=>{
 await moving(page);assert.equal(await page.getByRole('button',{name:/Pause motion|Play motion/}).count(),0);await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('.orbit-card').getAnimations().every(animation=>animation.playState==='paused'&&!animation.pending));const held=await point(page);await page.waitForTimeout(300);assert.ok(distance(held,await point(page))<.5);assert.equal(await page.locator('.orbit-depth-glow').evaluate(node=>getComputedStyle(node).animationName),'none');await page.emulateMedia({reducedMotion:'no-preference'});await moving(page);const before=await point(page);await page.waitForTimeout(500);assert.ok(distance(before,await point(page))>8);
});
await check('Reduced motion starts still with no decorative animation controls',async page=>{
 await page.waitForFunction(()=>document.querySelector('.mk-orbit-hero').dataset.orbitRunning==='false');const held=await point(page);await page.waitForTimeout(300);assert.ok(distance(held,await point(page))<.5);assert.equal(await page.locator('.orbit-depth-glow').evaluate(node=>getComputedStyle(node).animationName),'none');assert.equal(await page.getByRole('button',{name:/Pause motion|Play motion/}).count(),0);
},{reducedMotion:'reduce'});
await check('A reduced-motion visitor can start the scene once and keep that choice after reload',async page=>{
 const start=page.getByRole('button',{name:'Start animation',exact:true});await start.waitFor();await start.click();await moving(page);assert.equal(await start.count(),0);const before=await point(page);await page.waitForTimeout(550);assert.ok(distance(before,await point(page))>8);assert.equal(await page.locator('.orbit-depth-glow').evaluate(node=>getComputedStyle(node).animationName),'orbit-light-drift');
 await page.reload();await moving(page);assert.equal(await start.count(),0);const reloaded=await point(page);await page.waitForTimeout(550);assert.ok(distance(reloaded,await point(page))>8,'The saved explicit choice starts automatically');
},{reducedMotion:'reduce'});
await check('Motion still starts when browser storage is unavailable',async page=>{
 await page.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Storage unavailable','SecurityError');}});});await page.reload();await page.getByRole('button',{name:'Start animation',exact:true}).click();await moving(page);const before=await point(page);await page.waitForTimeout(550);assert.ok(distance(before,await point(page))>8);assert.equal(await page.getByRole('button',{name:'Start animation',exact:true}).count(),0);
},{reducedMotion:'reduce'});
await check('The staircase drops left to right, reveals right to left and returns focus to the destination',async page=>{
 const links=[['/work','Selected designs.'],['/how-we-work','Good work. Clear collaboration.'],['/pricing','Built around you.']];
 for(const [href] of links){
  await page.locator(`.ff-navigation .mk-nav-links a[href="${href}"]`).click();await page.waitForFunction(()=>{const nodes=[...document.querySelectorAll('.ff-staircase>div')],positions=nodes.map(node=>new DOMMatrixReadOnly(getComputedStyle(node).transform).m42);return document.querySelector('.ff-staircase').dataset.state==='covering'&&positions[0]>positions.at(-1)+100;});
  const descending=await page.locator('.ff-staircase>div').evaluateAll(nodes=>nodes.map(node=>new DOMMatrixReadOnly(getComputedStyle(node).transform).m42));assert.ok(descending[0]>descending.at(-1)+100,'Left panel drops first');
  await page.waitForFunction(()=>{const nodes=[...document.querySelectorAll('.ff-staircase>div')],positions=nodes.map(node=>new DOMMatrixReadOnly(getComputedStyle(node).transform).m42);return document.querySelector('.ff-staircase').dataset.state==='revealing'&&positions.at(-1)<positions[0]-100;});
  const ascending=await page.locator('.ff-staircase>div').evaluateAll(nodes=>nodes.map(node=>new DOMMatrixReadOnly(getComputedStyle(node).transform).m42));assert.ok(ascending.at(-1)<ascending[0]-100,'Right panel rises first');
  await page.waitForFunction(()=>document.querySelector('.ff-staircase').dataset.state==='idle');assert.equal(new URL(page.url()).pathname,href);assert.ok(await page.locator('main h1').evaluate(node=>node===document.activeElement));assert.equal(await page.locator('.ff-staircase').evaluate(node=>getComputedStyle(node).pointerEvents),'none');
  const contrasts=await page.locator('.ff-navigation').evaluate(nav=>{
   const luminance=color=>color.match(/[\d.]+/g).slice(0,3).map(Number).map(value=>{const c=value/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;}).reduce((sum,value,index)=>sum+value*[.2126,.7152,.0722][index],0);
   const background=luminance(getComputedStyle(nav).backgroundColor);
   return [...nav.querySelectorAll('.mk-wordmark,.mk-nav-links>a')].map(link=>{const text=luminance(getComputedStyle(link).color);return {label:link.textContent,ratio:(Math.max(text,background)+.05)/(Math.min(text,background)+.05)};});
  });
  for(const contrast of contrasts)assert.ok(contrast.ratio>=4.5,`${href}: ${contrast.label} must remain readable against its navigation background`);
 }
 await page.getByRole('link',{name:'Fourthform home',exact:true}).click();await moving(page);await page.waitForFunction(()=>document.querySelector('.ff-staircase').dataset.state==='idle');assert.equal(await page.locator('.orbit-card').count(),8);
});
await check('Reduced-motion navigation bypasses the curtain and still exposes all three views',async page=>{
 for(const href of ['/work','/how-we-work','/pricing']){await page.locator(`.ff-navigation .mk-nav-links a[href="${href}"]`).click();await page.waitForURL('**'+href);assert.equal(await page.locator('.ff-staircase').getAttribute('data-state'),'idle');assert.ok(await page.locator('main h1').isVisible());}
},{reducedMotion:'reduce'});
await check('The entrance fits generously across phones, tablets, desktop and landscape screens',async page=>{
 for(const [width,height] of [[320,568],[390,844],[768,1024],[844,390],[900,480],[1024,768],[1280,720],[1440,900],[1920,1080],[2560,1440]]){
  await page.setViewportSize({width,height});await page.goto(base);await page.evaluate(async()=>document.fonts.ready);await page.locator('.orbit-card img').first().evaluate(image=>image.decode());
  await page.locator('.mk-orbit-hero[data-orbit-running]').waitFor();await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('.mk-orbit-hero').dataset.orbitRunning==='false');await page.waitForFunction(()=>[...document.querySelectorAll('[data-intro]')].every(node=>node.getAnimations().every(animation=>animation.playState==='finished')));
  const layout=await page.evaluate(()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,title:document.querySelector('h1').getBoundingClientRect().toJSON(),body:document.querySelector('.mk-hero-copy .mk-body').getBoundingClientRect().toJSON()}));
  assert.ok(layout.scrollWidth<=width+1,`${width}x${height}: horizontal overflow`);assert.ok(layout.scrollHeight<=height+2,`${width}x${height}: homepage should be one screen`);assert.ok(layout.title.top>70&&layout.body.bottom<height-40,`${width}x${height}: generous copy spacing`);
  const phases=width>=900?[0,10000,20000,30000,40000,50000,60000,70000]:[0];
  for(const time of phases){
   if(width>=900)await page.evaluate(time=>document.querySelectorAll('.orbit-card').forEach(card=>card.getAnimations().forEach(animation=>{animation.currentTime=time;})),time);
   const boxes=await page.locator('.orbit-card').evaluateAll(cards=>cards.filter(card=>getComputedStyle(card).display!=='none').map(card=>card.getBoundingClientRect().toJSON()));
   for(const box of boxes)assert.ok(box.x>=5&&box.right<=width-5&&box.y>=65&&box.bottom<=height-5,`${width}x${height}, ${time}: portfolio card must fit on the screen (${Math.round(box.x)},${Math.round(box.y)},${Math.round(box.right)},${Math.round(box.bottom)})`);
  }
  if([320,390,768,844,1440].includes(width))await page.screenshot({path:`docs/preview-evidence/entrance-${width}x${height}.png`});
 }
});
await writeFile('docs/preview-evidence/motion-results.json',JSON.stringify({results,uncaughtErrors:errors},null,2));console.log(JSON.stringify({results,uncaughtErrors:errors},null,2));await browser.close();if(results.some(result=>result.result==='fail')||errors.length)process.exitCode=1;
