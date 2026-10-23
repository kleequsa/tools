/* Kleeq pattern engine — extracted from Kleeq Pattern Studio.
   Single source of truth for motif generation. Do not hand-edit: regenerate from pattern-studio-src.html. */
(function(){
  class DCLogicStub {
    constructor(){ this.state={}; }
    setState(o){ Object.assign(this.state, typeof o==='function'?o(this.state):(o||{})); }
    forceUpdate(){}
  }
  /* The engine is built from a factory so it can sit on two bases: the inert stub for
     Tumbler Wrap and Block Projection, which only call its draw helpers (a real runtime
     instance there would push React updates from every helper and lock the page), and
     the runtime's DCLogic for Pattern Studio, where it IS the page's component. */
  const makeEngine = (Base) => class KleeqPatternEngine extends Base {
  state = {
    motif: 'flowdash', scale: 80, gap: 20, stroke: 3, rotation: 0,
    jitter: 0, seed: 7, style: 'fill', ink: '#201e1d', ground: '#f3f2f2',
    accent: '#ec3013', accentOn: true, accentStyle: 'ticks', copied: false,
    aspect: '17x11', gradient: 'lr',
    cmpOn: false, cmpMotif: 'pixel', zoom: 'fit', cutStats: '',
    mirrorX: false, mirrorY: false,
    histOn: false, batchOn: false, batchSel: [], wallOn: false, presetSel: '',
    watermark: false, q: '', sortBy: 'family', rulerOn: false, topoMix: 35, topoOn: false, topoBands: 10, topoSmooth: 70, topoSoften: 0, topoWeights: 3, hatchGround: 105, blotchQty: 100,
  };

  _PARAMS=['motif','scale','gap','stroke','rotation','jitter','seed','style','ink','ground','accent','accentOn','accentStyle','aspect','gradient','mirrorX','mirrorY','tileMode','watermark','topoMix','topoOn','topoBands','topoSmooth','topoSoften','topoWeights','hatchGround','blotchQty'];
  _DEF={ scale:80, gap:20, stroke:3, rotation:0, jitter:0, seed:7, style:'fill', ink:'#201e1d', ground:'#f3f2f2', accent:'#ec3013', accentOn:true, accentStyle:'ticks', gradient:'lr', mirrorX:false, mirrorY:false, tileMode:'seamless', watermark:false, topoMix:0, topoSoften:0 };
  set(k, v) {
    if(this._PARAMS.includes(k) && this.state[k]!==v){ (this._undoQ||(this._undoQ=[])).push({k,v:this.state[k]}); if(this._undoQ.length>150) this._undoQ.shift(); this._redoQ=[]; }
    this.setState({ [k]: v });
  }
  undoParam=()=>{ const qh=this._undoQ; if(!qh||!qh.length) return false; const e=qh.pop(); (this._redoQ||(this._redoQ=[])).push({k:e.k,v:this.state[e.k]}); this.setState({[e.k]:e.v}); return true; }
  redoParam=()=>{ const qh=this._redoQ; if(!qh||!qh.length) return; const e=qh.pop(); (this._undoQ||(this._undoQ=[])).push({k:e.k,v:this.state[e.k]}); this.setState({[e.k]:e.v}); }
  _resetKeys(keys){ const o={}; keys.forEach(k=>{ if(k in this._DEF) o[k]=this._DEF[k]; }); this.setState(o); }
  resetPattern=()=>this._resetKeys(['scale','gap','rotation','mirrorX','mirrorY']);
  resetVariation=()=>this._resetKeys(['seed','jitter','gradient','topoOn','topoMix','topoBands','topoSmooth','topoSoften','topoWeights','hatchGround','blotchQty']);
  resetInk=()=>this._resetKeys(['style','stroke','ink','ground']);
  resetMarks=()=>this._resetKeys(['watermark','accentOn','accentStyle','accent']);
  resetOutput=()=>this._resetKeys(['tileMode']);
  resetAll=()=>this._resetKeys(Object.keys(this._DEF));
  toggleBA=()=>{ this._ba=!this._ba; this.forceUpdate(); }
  _baSrc(){ const p={...this.getParams()}; Object.keys(this._DEF).forEach(k=>{ p[k]=this._DEF[k]; }); p.motif=this.state.motif; p.aspect=this.state.aspect;
    const key=p.motif+'|'+this.state.aspect;
    if(this._baKey!==key){ const d=this.aspectDims(p); this._baSrc_='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(this.buildSVG(d.W,d.H,p,false)); this._baKey=key; }
    return this._baSrc_; }
  toggleRuler=()=>this.setState({rulerOn:!this.state.rulerOn});
  resetView=()=>this.setState({zoom:'fit',rulerOn:false});
  setZoomTrue=()=>this.set('zoom','true');
  onQ=e=>{ this._motifKey=null; this.setState({q:e.target.value}); }
  onSortBy=e=>{ this._motifKey=null; this.setState({sortBy:e.target.value}); }
  toggleTopo=()=>{ const on=!this.state.topoOn;
    this.setState({topoOn:on, topoMix:(on && !this.state.topoMix)?35:this.state.topoMix}); };
  onTopoMix=e=>this.set('topoMix',Math.max(0,Math.min(100,+e.target.value||0)));
  onTopoBands=e=>this.set('topoBands',Math.max(3,Math.min(24,+e.target.value||10)));
  onBlotchQty=e=>this.set('blotchQty',Math.max(25,Math.min(250,+e.target.value||100)));
  onHatchGround=e=>this.set('hatchGround',Math.max(30,Math.min(220,+e.target.value||105)));
  onTopoWeights=e=>this.set('topoWeights',Math.max(3,Math.min(5,+e.target.value||3)));
  onTopoSmooth=e=>this.set('topoSmooth',Math.max(0,Math.min(100,+e.target.value===0?0:(+e.target.value||70))));
  _inW(){ const m=(this.state.aspect||'').match(/^(\d+)x(\d+)$/); return m?+m[1]:32; }
  _panDown=(e)=>{ if(this.state.zoom==='fit') return; e.preventDefault();
    let el=e.currentTarget.parentElement;
    while(el && el.scrollWidth<=el.clientWidth && el.scrollHeight<=el.clientHeight) el=el.parentElement;
    if(!el) return;
    const sx=e.clientX, sy=e.clientY, sl=el.scrollLeft, st=el.scrollTop;
    const mv=ev=>{ el.scrollLeft=sl-(ev.clientX-sx); el.scrollTop=st-(ev.clientY-sy); };
    const up=()=>{ window.removeEventListener('mousemove',mv); window.removeEventListener('mouseup',up); };
    window.addEventListener('mousemove',mv); window.addEventListener('mouseup',up); }

  _customLoad(){ try{ return JSON.parse(localStorage.getItem('kleeq-custom-motifs')||'[]'); }catch(e){ return []; } }
  _customSave(l){ try{ localStorage.setItem('kleeq-custom-motifs',JSON.stringify(l)); }catch(e){} }
  _glyph(g,cx,cy,r,ink){
    const F=v=>v.toFixed(1);
    if(g==='circle') return `<circle cx="${F(cx)}" cy="${F(cy)}" r="${F(r)}" fill="${ink}"/>`;
    if(g==='square') return `<rect x="${F(cx-r)}" y="${F(cy-r)}" width="${F(2*r)}" height="${F(2*r)}" fill="${ink}"/>`;
    if(g==='diamond') return `<path d="M${F(cx)} ${F(cy-r)}L${F(cx+r)} ${F(cy)}L${F(cx)} ${F(cy+r)}L${F(cx-r)} ${F(cy)}Z" fill="${ink}"/>`;
    if(g==='triangle') return `<path d="M${F(cx)} ${F(cy-r)}L${F(cx+r*0.87)} ${F(cy+r*0.5)}L${F(cx-r*0.87)} ${F(cy+r*0.5)}Z" fill="${ink}"/>`;
    if(g==='plus'){ const t=r*0.36; return `<path d="M${F(cx-t)} ${F(cy-r)}H${F(cx+t)}V${F(cy-t)}H${F(cx+r)}V${F(cy+t)}H${F(cx+t)}V${F(cy+r)}H${F(cx-t)}V${F(cy+t)}H${F(cx-r)}V${F(cy-t)}H${F(cx-t)}Z" fill="${ink}"/>`; }
    if(g==='star'){ let d=''; for(let k=0;k<10;k++){ const a=-Math.PI/2+k*Math.PI/5, rad=k%2?r*0.42:r; d+=(k?'L':'M')+F(cx+Math.cos(a)*rad)+' '+F(cy+Math.sin(a)*rad); } return `<path d="${d}Z" fill="${ink}"/>`; }
    if(g==='hex'){ let d=''; for(let k=0;k<6;k++){ const a=Math.PI/6+k*Math.PI/3; d+=(k?'L':'M')+F(cx+Math.cos(a)*r)+' '+F(cy+Math.sin(a)*r); } return `<path d="${d}Z" fill="${ink}"/>`; }
    if(g==='hash'){ // hashed lines: 3 short parallel 45° strokes, closed fills
      const t=Math.max(1.2,r*0.22), s2=r*0.66; let d='';
      for(let k=-1;k<=1;k++){ const ox=k*s2*0.7071, oy=k*s2*0.7071;
        const x1=cx-r*0.7071+ox+oy, y1=cy+r*0.7071+oy-ox, x2=cx+r*0.7071+ox+oy, y2=cy-r*0.7071+oy-ox;
        const nx2=t*0.7071, ny2=t*0.7071;
        d+=`M${F(x1-nx2)} ${F(y1-ny2)}L${F(x2-nx2)} ${F(y2-ny2)}L${F(x2+nx2)} ${F(y2+ny2)}L${F(x1+nx2)} ${F(y1+ny2)}Z`; }
      return `<path d="${d}" fill="${ink}"/>`; }
    const K=0.55, w=r, t2=r*0.55, F2=F; // chevron
    return `<path d="M${F2(cx-w)} ${F2(cy)}L${F2(cx)} ${F2(cy-K*w)}L${F2(cx+w)} ${F2(cy)}L${F2(cx+w)} ${F2(cy+t2)}L${F2(cx)} ${F2(cy-K*w+t2)}L${F2(cx-w)} ${F2(cy+t2)}Z" fill="${ink}"/>`;
  }
  buildCustomTile(p,spec){
    const cell=Math.max(4,p.scale);
    const u=Math.max(16,cell*0.6+(p.gap||18)*0.5);
    const n=Math.max(8,Math.round(cell*14/u));
    const Tw=n*u, Th=n*u;
    const rnd=this.rng(p.seed*131+7), jf=(p.jitter||0)/100;
    const ph=[rnd()*6.283,rnd()*6.283,rnd()*6.283,rnd()*6.283];
    const fld=(x,y)=>{ const a=x/Tw*6.283, b=y/Th*6.283; const v=Math.sin(a+ph[0])+Math.sin(b*1.4+ph[1])+0.8*Math.sin(a*2+b+ph[2]); return Math.max(0,Math.min(1,(v+2.6)/5.2)); };
    // organic: domain-warped field — blotches meander like the triangle/quadtree camos
    const wfld=(x,y)=>{ const a=x/Tw*6.283, b=y/Th*6.283;
      const wa=a+0.9*Math.sin(b*2+ph[3]), wb=b+0.9*Math.sin(a*2+ph[2]);
      const v=Math.sin(wa+ph[0])+Math.sin(wb*1.4+ph[1])+0.8*Math.sin(wa*2+wb+ph[2]);
      return Math.max(0,Math.min(1,(v+2.6)/5.2)); };
    const B=2; const blockV=(i,j)=>fld((Math.floor(i/B)*B+B/2)*u,(Math.floor(j/B)*B+B/2)*u);
    let inner='';
    for(let j=0;j<n;j++) for(let i=0;i<n;i++){
      const off=((spec.layout==='brick'||spec.layout==='hexoff')&&j%2)?u/2:0;
      const x=((i*u+off)%Tw)+u/2, y=j*u+u/2;
      let t;
      const w=spec.weight;
      if(w==='uniform') t=0.7;
      else if(w==='organic'||w==='camo'){ t=wfld(x,y)+(rnd()-0.5)*0.08; if(t<0.16){ if(rnd()>0.12) continue; t=0.2; } }
      else if(w==='digital'){ const v=blockV(i,j); const lvl=Math.min(5,Math.floor(v*6)); if(lvl===0&&rnd()>0.25) continue; t=0.18+lvl*0.16; }
      else if(w==='gradient') t=1-j/(n-1);
      else if(w==='rings'){ const v=wfld(x,y); const b=(v*4)%1; t=b<0.3?0.95:0.3; }
      else if(w==='halftone'){ const v=fld(x*2,y*2); t=0.2+v*0.8; }
      else t=0.3+rnd()*0.7;
      const r=(u/2-1)*(0.25+0.72*Math.max(0,Math.min(1,t)));
      const jx=(rnd()*2-1)*u*0.1*jf, jy=(rnd()*2-1)*u*0.1*jf;
      // wrap-aware emit at both seams so no glyph is cut at the tile edge
      const gx2=x+jx, gy2=y+jy, e=r+2;
      const xs=[gx2]; if(gx2+e>Tw) xs.push(gx2-Tw); if(gx2-e<0) xs.push(gx2+Tw);
      const ys=[gy2]; if(gy2+e>Th) ys.push(gy2-Th); if(gy2-e<0) ys.push(gy2+Th);
      for(const xx of xs) for(const yy of ys) inner+=this._glyph(spec.glyph,xx,yy,r,p.ink);
    }
    return { Tw, Th, inner };
  }
  toggleMirX=()=>this.set('mirrorX',!this.state.mirrorX);
  toggleMirY=()=>this.set('mirrorY',!this.state.mirrorY);
  stopProp=e=>{ if(e&&e.stopPropagation) e.stopPropagation(); };
  openWiz=()=>this.setState({wizOn:true,wizStep:1,wizGlyph:'plus',wizLayout:'brick',wizWeight:'organic',wizName:'',wizSeed:7});
  closeWiz=()=>this.set('wizOn',false);
  _wizAutoName(){ const s=this.state;
    const g={plus:'Plus',circle:'Dot',square:'Square',diamond:'Diamond',triangle:'Triangle',star:'Star',hex:'Hex',chevron:'Chevron',hash:'Hash'}[s.wizGlyph]||'Custom';
    const l={grid:'grid',brick:'brick',hexoff:'offset'}[s.wizLayout]||'';
    const w={organic:'organic camo',digital:'digital camo',halftone:'halftone',rings:'topo',gradient:'gradient',uniform:'field',random:'scatter'}[s.wizWeight]||'';
    return (g+' '+l+' '+w).replace(/\s+/g,' ').trim(); }
  wizNext=()=>{ const next=Math.min(3,(this.state.wizStep||1)+1);
    const patch={wizStep:next};
    if(next===3&&!(this.state.wizName||'').trim()) patch.wizName=this._wizAutoName();
    this.setState(patch); };
  wizBack=()=>this.set('wizStep',Math.max(1,(this.state.wizStep||1)-1));
  wizShuffle=()=>this.set('wizSeed',Math.floor(Math.random()*9999)+1);
  onWizName=e=>this.set('wizName',e.target.value);
  _wizSet(k,v){ this._wizC=this._wizC||{}; const kk=k+'|'+v; return this._wizC[kk]||(this._wizC[kk]=()=>this.set(k,v)); }
  wizCreate=()=>{ const s=this.state; const list=this._customLoad();
    const id='custom-'+Date.now().toString(36);
    const label=(s.wizName||'').trim()||this._wizAutoName();
    list.unshift({ id, label, created:new Date().toISOString().slice(0,10), spec:{glyph:s.wizGlyph,layout:s.wizLayout,weight:s.wizWeight} });
    this._customSave(list); this._motifKey=null; this._thumbs={};
    this.setState({wizOn:false,motif:id}); };

  KPATH = "M202.6,7.8h-81c-8.4,0-16.4,3.5-22.3,9.7L13.4,108h0,0s0,0,0,0h0l85.9,90.5c5.9,6.2,13.9,9.7,22.3,9.7h81l-48.7-51.2,48.7-49h0s-48.7-49-48.7-49L202.6,7.8ZM138,135.6l-30.8-10.5-19,27.5v-34l-30.8-10.5,30.8-10.5v-34.1s19,27.5,19,27.5l30.8-10.5-19.1,27.5,19.1,27.5Z";
  KLOGO = '<polygon points="194 24.7 85.7 24.7 85.7 65.4 102.4 48.8 102.4 41.4 194 41.4 194 174.6 102.4 174.6 102.4 167.2 85.7 150.6 85.7 191.3 102.4 191.3 210.7 191.3 210.7 24.7 194 24.7"></polygon><polygon points="152.4 133 139.9 120.5 127.4 108 139.9 95.5 152.4 83 164.9 70.5 177.4 58 152.4 58 139.9 70.5 127.4 83 114.9 95.5 102.4 108 114.9 120.5 127.4 133 139.9 145.5 152.4 158 177.4 158 164.9 145.5 152.4 133"></polygon><path d="M85.7,65.4h-34.4c-3.6,0-7,1.5-9.5,4.1L5.3,108h0,0s0,0,0,0h0l36.5,38.4c2.5,2.6,5.9,4.1,9.5,4.1h34.4l-20.7-21.8,20.7-20.8h0s-20.7-20.8-20.7-20.8l20.7-21.8ZM58.3,119.7l-13.1-4.5-8.1,11.7v-14.5l-13.1-4.5,13.1-4.5v-14.5s8.1,11.7,8.1,11.7l13.1-4.5-8.1,11.7,8.1,11.7Z"></path>';

  rng(seed) {
    let a = (seed >>> 0) || 1;
    return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  hexToRgb(h){ h=h.replace('#',''); if(h.length===3) h=h.split('').map(c=>c+c).join(''); return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]; }
  rgbToHex(r,g,b){ const f=x=>Math.max(0,Math.min(255,Math.round(x))).toString(16).padStart(2,'0'); return '#'+f(r)+f(g)+f(b); }
  mix(hex,t,a){ const[r,g,b]=this.hexToRgb(hex); const[tr,tg,tb]=this.hexToRgb(t); return this.rgbToHex(r+(tr-r)*a,g+(tg-g)*a,b+(tb-b)*a); }
  lighten(h,a){ return this.mix(h,'#ffffff',a); }
  darken(h,a){ return this.mix(h,'#000000',a); }

  getParams(){ const s=this.state; return { motif:s.motif, scale:s.scale, gap:s.gap, stroke:s.stroke, rotation:s.rotation, jitter:s.jitter, seed:s.seed, style:s.style, ink:s.ink, ground:s.ground, accent:s.accent, accentOn:s.accentOn, accentStyle:s.accentStyle, aspect:s.aspect, gradient:s.gradient, watermark:s.watermark, mirrorX:!!s.mirrorX, mirrorY:!!s.mirrorY, tileMode:s.tileMode||'seamless', topoMix:(s.topoOn?(s.topoMix||0):0), topoBands:s.topoBands||10, topoSmooth:(s.topoSmooth==null?70:s.topoSmooth), topoSoften:(s.topoSoften==null?0:s.topoSoften), topoWeights:s.topoWeights||3, hatchGround:(s.hatchGround==null?105:s.hatchGround), blotchQty:(s.blotchQty==null?100:s.blotchQty), canvasW:(s.canvasW||24), canvasH:(s.canvasH||12), canvasUnit:(s.canvasUnit||'in') }; }

  motifMarkup(p,m,cx,cy,cell){
    const ink=p.ink, gap=p.gap, stroke=p.stroke, fillMode=p.style==='fill';
    const r=Math.max(1,(cell-gap)/2);
    const so=`fill="none" stroke="${ink}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"`;
    const fx=fillMode?`fill="${ink}"`:`fill="none" stroke="${ink}" stroke-width="${stroke}"`;
    if(m==='dots') return `<circle cx="${cx}" cy="${cy}" r="${r}" ${fx}/>`;
    if(m==='rings') return [r,r*0.6,r*0.24].map(rr=>`<circle cx="${cx}" cy="${cy}" r="${rr.toFixed(2)}" fill="none" stroke="${ink}" stroke-width="${stroke}"/>`).join('');
    if(m==='plus'){
      if(fillMode){ const t=Math.max(stroke,r*0.42), a=r, b=t/2;
        return `<path d="M${cx-b},${cy-a} h${t} v${a-b} h${a-b} v${t} h${-(a-b)} v${a-b} h${-t} v${-(a-b)} h${-(a-b)} v${-t} h${a-b} z" fill="${ink}"/>`; }
      return `<path d="M${cx},${cy-r} V${cy+r} M${cx-r},${cy} H${cx+r}" ${so}/>`;
    }
    if(m==='triangles'){ const pts=`${cx},${(cy-r).toFixed(2)} ${(cx+r*0.866).toFixed(2)},${(cy+r*0.5).toFixed(2)} ${(cx-r*0.866).toFixed(2)},${(cy+r*0.5).toFixed(2)}`;
      return `<polygon points="${pts}" ${fillMode?`fill="${ink}"`:`fill="none" stroke="${ink}" stroke-width="${stroke}" stroke-linejoin="round"`}/>`; }
    if(m==='kleeq'){ const size=Math.max(2,cell-gap), k=size/216;
      const inner=fillMode?`fill="${ink}" fill-rule="evenodd"`:`fill="none" stroke="${ink}" stroke-width="${(stroke/k).toFixed(2)}" stroke-linejoin="round"`;
      return `<g transform="translate(${cx},${cy}) scale(${k.toFixed(4)}) translate(-108,-108)"><path d="${this.KPATH}" ${inner}/></g>`;
    }
    if(m==='kleeqK'){ const size=Math.max(2,cell-gap), k=size/216;
      const attr=fillMode?`fill="${ink}" fill-rule="evenodd"`:`fill="none" stroke="${ink}" stroke-width="${(stroke/k).toFixed(2)}" stroke-linejoin="round"`;
      return `<g transform="translate(${cx},${cy}) scale(${k.toFixed(4)}) translate(-108,-108)" ${attr}>${this.KLOGO}</g>`;
    }
    if(m==='cubes'){ const s=r, kx=0.866*s;
      const poly=(a,c)=>`<polygon points="${a.map(q=>q.map(n=>n.toFixed(2)).join(',')).join(' ')}" fill="${c}" stroke="${this.darken(ink,0.35)}" stroke-width="${Math.max(0.5,stroke*0.35).toFixed(2)}" stroke-linejoin="round"/>`;
      const top=[[cx,cy-s],[cx+kx,cy-s/2],[cx,cy],[cx-kx,cy-s/2]];
      const right=[[cx+kx,cy-s/2],[cx+kx,cy+s/2],[cx,cy+s],[cx,cy]];
      const left=[[cx-kx,cy-s/2],[cx,cy],[cx,cy+s],[cx-kx,cy+s/2]];
      return poly(top,this.lighten(ink,0.22))+poly(left,this.darken(ink,0.22))+poly(right,ink);
    }
    return '';
  }

  buildTile(p){
    const cell=Math.max(4,p.scale), ink=p.ink;
    const so=`fill="none" stroke="${ink}" stroke-width="${p.stroke}" stroke-linecap="round" stroke-linejoin="round"`;
    const m=p.motif;
    if(m&&m.indexOf('custom-')===0){ const c=this._customLoad().find(x=>x.id===m); if(c&&c.spec) return this.buildCustomTile(p,c.spec); }
    /* ---------- Motion & tech family ---------- */
    if(m==='hexdash'||m==='techframe'||m==='trispeed'){
      // the reference artwork is split into its individual elements (measured once), then
      // the elements are re-laid as a regular, seamless pattern: lanes, a brick grid or a
      // triangular lattice. All ink: the red parts of the art take the ink colour.
      const A=(window.KLEEQ_REF_ART||{})[m]; if(!A) return { T:cell, inner:'' };
      if(!A.els){ // element bounds were measured once from the source art and baked in with it; no DOM measurement at render time
        const div=document.createElement('div'); div.innerHTML='<svg xmlns="http://www.w3.org/2000/svg">'+A.mk.replace(/__INK__|__ACC__/g,'__INK__')+'</svg>';
        const kids=div.firstChild?Array.from(div.firstChild.children):[], els=[];
        kids.forEach((el,i)=>{ const b=(A.bb||[])[i]; if(!b||(b[2]<0.5&&b[3]<0.5)) return; els.push({ mk:el.outerHTML.replace(/<\/(path|circle|polygon|rect)>/g,'').replace(/<(path|circle|polygon|rect)([^>]*)>/g,'<$1$2/>'), x:b[0], y:b[1], w:b[2], h:b[3], ar:b[2]/Math.max(0.01,b[3]) }); });
        A.els=els; }
      const els=A.els; if(!els||!els.length) return { T:cell, inner:'' };
      const F=v=>v.toFixed(2), rnd=this.rng(p.seed*53+9), gf=Math.max(0,p.gap==null?20:p.gap)/100, jf=(p.jitter||0)/100;
      const bySize=els.slice().sort((a,b)=>b.w*b.h-a.w*a.h);
      const big=bySize.slice(0,Math.max(2,Math.round(els.length*0.3))), small=bySize.slice(Math.round(els.length*0.3));
      const wide=els.filter(e=>e.ar>3), lines=els.filter(e=>e.ar>8||e.ar<0.125), shapes=els.filter(e=>e.ar<=3&&e.ar>=0.33);
      const pick=l=>l.length?l[Math.floor(rnd()*l.length)]:els[0];
      // place element e with its box fitted inside (cx,cy,bw,bh), optional mirror / rotate
      const place=(e,cx,cy,bw,bh,mir,rot,col)=>{ const k=Math.min(bw/e.w,bh/e.h), sw=Math.max(0.6,p.stroke*0.55)/k, c=col||ink; // the art's hairline double contours are reinforced with a real stroke so weight follows the Stroke slider
        return '<g transform="translate('+F(cx)+','+F(cy)+') rotate('+F(rot||0)+') scale('+F(mir?-k:k)+','+F(k)+') translate('+F(-e.x-e.w/2)+','+F(-e.y-e.h/2)+')" stroke="'+c+'" stroke-width="'+F(sw)+'" stroke-linejoin="round">'+e.mk.replace(/__INK__/g,c)+'</g>'; };
      const ACC=null, fillOK=p.style!=='outline'; // these motifs stay strictly ink on ground
      let inner='';
      const hair=Math.max(0.5,p.stroke*0.3), ln=(x0,y,L)=>'<path d="M'+F(x0)+','+F(y)+' H'+F(x0+L)+'" fill="none" stroke="'+ink+'" stroke-width="'+F(hair)+'" stroke-linecap="round"/>';
      const dot=(x,y,r)=>'<circle cx="'+F(x)+'" cy="'+F(y)+'" r="'+F(r)+'" fill="'+ink+'"/>';
      const wrapX=(s,Tw)=>{ for(const ox of [-Tw,0,Tw]) inner+='<g transform="translate('+ox+',0)">'+s+'</g>'; };
      if(m==='hexdash'){
        // motion lanes: every lane runs one way (alternating), a hex arrow in three size tiers
        // leads, trailing speed lines stream behind it, small chevrons and dots in the wake
        const hexes=big.filter(e=>e.ar>1.5&&e.ar<6), hexSrc=hexes.length?hexes:big, chev=shapes.filter(e=>e.w<bySize[0].w*0.4), chSrc=chev.length?chev:small;
        const lane=Math.max(18,cell*0.75*(1+gf*1.6)), slot=cell*3.2*(1+gf*1.8), nx=Math.max(3,Math.round(cell*14/slot)), ny=Math.max(4,Math.round(cell*14/lane))&~1;
        const Tw=nx*slot, Th=ny*lane, hl=Math.max(1.2,p.stroke*0.7), lnH=(x0,y,L)=>'<path d="M'+F(x0)+','+F(y)+' H'+F(x0+L)+'" fill="none" stroke="'+ink+'" stroke-width="'+F(hl)+'" stroke-linecap="round"/>';
        for(let j=0;j<ny;j++){ const dir=rnd()<0.5, y=j*lane+lane/2+(rnd()*2-1)*lane*0.18, off=rnd()*slot, sgn=dir?-1:1;   // each lane picks its own direction, phase and drift
          for(let i=0;i<nx;i++){ const x=((i*slot+off+slot/2)%Tw), jx=(rnd()*2-1)*slot*(0.22+0.15*jf), r=rnd();
            const tier=r<0.3?1:(r<0.7?0.68:0.42), hw=slot*0.42*tier, hh=lane*0.78*tier, bqH=(p.blotchQty==null?100:p.blotchQty)/100;
            let s='';
            if(rnd()>Math.min(1,bqH)) continue;
            if(r<0.88){ s+=place(pick(hexSrc),x+jx,y,hw,hh,dir);
              // speed lines trail from the back edge, staggered lengths
              const back=x+jx-sgn*hw/2, nL=2+Math.floor(rnd()*2);
              for(let q=0;q<nL;q++){ const L=slot*(0.18+rnd()*0.3)*tier, yy=y+(q-(nL-1)/2)*hh*0.3; s+=lnH(sgn>0?back-L-hair*3:back+hair*3,yy,L); }
            } else { s+=lnH(x+jx-sgn*slot*0.3-(sgn>0?slot*0.25:0),y,slot*0.25); }
            wrapX(s,Tw); } }
        return { Tw, Th, inner };
      }
      if(m==='techframe'){
        // interface frames: rounded outline frames in two sizes on a brick grid; a filled tab
        // hangs under or rises over an edge, hairline connectors run out to a dot, the odd
        // ring or disc sits in a gap
        const frames=big.filter(e=>e.ar<8), frSrc=frames.length?frames:big, tabs=small.filter(e=>e.ar>1.2&&e.ar<5), tbSrc=tabs.length?tabs:small, rings=els.filter(e=>e.ar>0.85&&e.ar<1.18), rgSrc=rings.length?rings:small;
        const bw=cell*2.6*(1+gf*1.6), bh=cell*1.3*(1+gf*1.6), nx=Math.max(3,Math.round(cell*12/bw)), ny=Math.max(4,Math.round(cell*12/bh))&~1;
        const Tw=nx*bw, Th=ny*bh;
        for(let j=0;j<ny;j++){ const rowOff=rnd()*bw, rowDy=(rnd()*2-1)*bh*0.12; for(let i=0;i<nx;i++){ const cx=(i*bw+rowOff+bw/2)%Tw, cy=j*bh+bh/2+rowDy, mir=rnd()<0.5, r=rnd(), jx=(rnd()*2-1)*bw*(0.16+0.1*jf), bqT=(p.blotchQty==null?100:p.blotchQty)/100;
          let s='';
          if(rnd()>Math.min(1,bqT)) continue;
          if(r<0.7){ const k=r<0.22?0.55:0.86, W=bw*0.8*k, H=bh*0.66*k, rr=Math.min(W,H)*(0.2+rnd()*0.25), x=cx+jx-W/2, y=cy-H/2;
            // the frame itself is drawn: a rounded outline, open on one short side now and then, like the art's brackets
            const open=rnd()<0.3, sw=Math.max(0.8,p.stroke*0.6);
            s+=open?'<path d="M'+F(x+W*0.6)+','+F(y)+' H'+F(x+W-rr)+' A'+F(rr)+','+F(rr)+' 0 0 1 '+F(x+W)+','+F(y+rr)+' V'+F(y+H-rr)+' A'+F(rr)+','+F(rr)+' 0 0 1 '+F(x+W-rr)+','+F(y+H)+' H'+F(x+W*0.6)+' M'+F(x+W*0.4)+','+F(y)+' H'+F(x+rr)+' A'+F(rr)+','+F(rr)+' 0 0 0 '+F(x)+','+F(y+rr)+' V'+F(y+H-rr)+' A'+F(rr)+','+F(rr)+' 0 0 0 '+F(x+rr)+','+F(y+H)+' H'+F(x+W*0.4)+'" fill="none" stroke="'+ink+'" stroke-width="'+F(sw)+'"/>'
                   :'<rect x="'+F(x)+'" y="'+F(y)+'" width="'+F(W)+'" height="'+F(H)+'" rx="'+F(rr)+'" fill="none" stroke="'+ink+'" stroke-width="'+F(sw)+'"/>';
            if(rnd()<0.25&&fillOK) s+='<rect x="'+F(x+W*0.12)+'" y="'+F(y+H*0.22)+'" width="'+F(W*0.76)+'" height="'+F(H*0.56)+'" rx="'+F(rr*0.5)+'" fill="'+(ACC&&rnd()<0.5?ACC:ink)+'"/>';
            const down=rnd()<0.5, tw=W*(0.28+rnd()*0.25), th=bh*0.14, tx=cx+jx+(rnd()*2-1)*(W/2-tw/2)*0.8;
            s+=place(pick(tbSrc),tx,down?cy+H/2+th/2:cy-H/2-th/2,tw,th,false,down?0:180,ACC&&rnd()<0.6?ACC:null);
            if(rnd()<0.7){ const side=rnd()<0.5?-1:1, L=bw*(0.08+rnd()*0.1), x0=cx+jx+side*W/2, yy=cy+(rnd()*2-1)*H*0.3; s+=ln(side>0?x0:x0-L,yy,L); s+=dot(x0+side*L,yy,hair*1.6); }
            if(rnd()<0.4){ const L=bh*(0.1+rnd()*0.12), xx=cx+jx+(rnd()*2-1)*W*0.35, y0=rnd()<0.5?cy-H/2:cy+H/2, up=y0<cy; s+='<path d="M'+F(xx)+','+F(y0)+' V'+F(up?y0-L:y0+L)+'" fill="none" stroke="'+ink+'" stroke-width="'+F(hair)+'"/>'+dot(xx,up?y0-L:y0+L,hair*1.6); }
          } else if(r<0.85){ s+=place(pick(rgSrc),cx+jx,cy,bh*0.42,bh*0.42,mir); if(rnd()<0.5){ s+=ln(cx+jx+bh*0.3,cy,bw*0.15); s+=dot(cx+jx+bh*0.3+bw*0.15,cy,hair*1.6); } }
          else if(r<0.95){ s+=ln(cx+jx-bw*0.25,cy,bw*0.5); s+=dot(cx+jx-bw*0.25,cy,hair*1.6); }
          else continue;
          wrapX(s,Tw); } }
        return { Tw, Th, inner };
      }
      // trispeed: triangle camo. The art's outline triangles sit on a strict triangular
      // lattice (never overlapping, a gap between neighbours); a slow seeded field makes
      // patches: dense outline masses, thinner mid zones with smaller triangles, open ground
      // where only the odd tiny triangle and a hairline remain
      const tris0=els.filter(e=>e.ar>1.08&&e.ar<1.24&&e.w>2).sort((a,b)=>b.w*b.h-a.w*a.h), tris=tris0.slice(0,Math.max(3,Math.round(tris0.length*0.6))), srcT=tris.length?tris:shapes;
      const u=Math.max(14,cell*0.55*(1+gf*1.4)), hh=u*0.866, nx=Math.max(6,Math.round(cell*14/u)), ny=Math.max(6,Math.round(cell*14/hh))&~1;
      const Tw=nx*u, Th=ny*hh, ph=[rnd()*6.283,rnd()*6.283,rnd()*6.283,rnd()*6.283,rnd()*6.283,rnd()*6.283];
      // three octaves: broad patches, mid-size islands, fine break-up, so masses are irregular and never repeat visibly
      const fld=(x,y)=>{ const a2=x/Tw*6.283, b2=y/Th*6.283;
        const v=Math.sin(a2*2+ph[0])+Math.sin(b2*2+ph[1])+0.9*Math.sin(a2*3-b2*2+ph[2])+0.7*Math.sin(a2*5+b2*3+ph[3])+0.5*Math.sin(a2*7-b2*6+ph[4])+0.35*Math.sin(a2*11+b2*9+ph[5]);
        return Math.max(0,Math.min(1,(v+3.6)/7.2+bq)); };
      const bq=((p.blotchQty==null?100:p.blotchQty)-100)/100*0.22;
      const fit=Math.max(0.3,0.8-gf*0.35);
      const ast=p.accentStyle||'ticks';
      // accent: 'dots' / 'ticks' mark lattice nodes in the open ground, 'grid' / 'diagonals' draw the lattice itself, 'brackets' outlines a few empty cells; a share of solid triangles take the accent colour
      if(ACC&&(ast==='grid'||ast==='diagonals')){ const sw3=Math.max(0.6,p.stroke*0.3); for(let j=0;j<=ny;j++) inner+='<path d="M0,'+F(j*hh)+' H'+F(Tw)+'" stroke="'+ACC+'" stroke-width="'+F(sw3)+'" fill="none"/>'; if(ast==='diagonals') for(let i=-ny/2-1;i<=nx+1;i++){ inner+='<path d="M'+F(i*u)+',0 L'+F(i*u+Th/0.866/2*1)+','+F(Th)+'" stroke="'+ACC+'" stroke-width="'+F(sw3)+'" fill="none"/><path d="M'+F(i*u)+',0 L'+F(i*u-Th/0.866/2)+','+F(Th)+'" stroke="'+ACC+'" stroke-width="'+F(sw3)+'" fill="none"/>'; } }                           // share of the lattice cell a full triangle fills, leaves the web
      for(let j=0;j<ny;j++) for(let i=0;i<nx*2;i++){
        // two triangles per lattice cell: up at even i, down at odd i, both in row j
        const up=((i+j)%2===0), cx=(i*u/2+u/2)%Tw, cy=j*hh+hh/2, v=fld(cx,cy), r=rnd(), jx=(rnd()*2-1)*u*(0.08+0.18*jf), jy=(rnd()*2-1)*hh*(0.06+0.12*jf), jr=(rnd()*2-1)*25*jf;
        let k=0, hairOnly=false;
        const sz=[fit,fit*0.78,fit*0.58,fit*0.4][Math.floor(rnd()*4)];       // size varies cell by cell
        if(v>0.6) k=r<0.82?(r<0.6?fit:sz):(r<0.92?fit*0.5:0);
        else if(v>0.45) k=r<0.55?sz:(r<0.72?fit*0.4:0);
        else if(v>0.3) k=r<0.28?sz*0.8:0;
        else { if(r<0.08) k=fit*(0.25+rnd()*0.25); }
        let s='';
        const triA=(cx2,cy2,w,h2,isUp,solid,col)=>{ const sg=isUp?1:-1, sw2=Math.max(0.8,p.stroke*0.6), c=col||ink; return '<polygon transform="rotate('+F(jr)+' '+F(cx2)+' '+F(cy2)+')" points="'+F(cx2)+','+F(cy2-sg*h2/2)+' '+F(cx2+w/2)+','+F(cy2+sg*h2/2)+' '+F(cx2-w/2)+','+F(cy2+sg*h2/2)+'" '+(solid&&fillOK?'fill="'+c+'"':'fill="none" stroke="'+c+'" stroke-width="'+F(sw2)+'" stroke-linejoin="round"')+'/>'; };
        if(k>0){ const solid=rnd()<(v>0.6?0.35:0.18)+rnd()*0.15, useA=ACC&&solid&&rnd()<0.35; s+=triA(cx+jx,cy+jy,u*k,hh*k,up,solid,useA?ACC:null); }
        else if(ACC&&v<=0.3&&!hairOnly){ if(ast==='dots'&&rnd()<0.35) s+=dot(cx,cy,Math.max(1,p.stroke*0.5)).replace(ink,ACC); else if(ast==='ticks'&&rnd()<0.3){ const tk=u*0.12; s+='<path d="M'+F(cx-tk)+','+F(cy)+' H'+F(cx+tk)+' M'+F(cx)+','+F(cy-tk)+' V'+F(cy+tk)+'" fill="none" stroke="'+ACC+'" stroke-width="'+F(Math.max(0.8,p.stroke*0.5))+'" stroke-linecap="round"/>'; } else if(ast==='brackets'&&rnd()<0.18){ const sg=up?1:-1, w=u*fit*0.7, h2=hh*fit*0.7, L=w*0.25, ax=cx-w/2, bx2=cx+w/2, by=cy+sg*h2/2; s+='<path d="M'+F(ax+L)+','+F(by)+' H'+F(ax)+' L'+F(ax+L*0.5)+','+F(by-sg*L*0.87)+' M'+F(bx2-L)+','+F(by)+' H'+F(bx2)+' L'+F(bx2-L*0.5)+','+F(by-sg*L*0.87)+'" fill="none" stroke="'+ACC+'" stroke-width="'+F(Math.max(0.8,p.stroke*0.5))+'" stroke-linecap="square"/>'; } }
        else if(hairOnly) {}
        if(s) wrapX(s,Tw); }
      return { Tw, Th, inner };
    }
    if(m==='triclusters'){
      // triangle clusters: outline triangles of mixed size (1, 2 and 3 lattice units) sharing
      // edges on a triangular lattice, grouped into loose islands with open ground between.
      // Big triangles are placed first, small ones fill around them; no triangle overlaps.
      const u=Math.max(12,cell*0.42+(p.gap||18)*0.5), hh=u*0.866, nx=Math.max(8,Math.round(cell*18/u)), ny=Math.max(8,Math.round(cell*18/hh))&~1;
      const gf=Math.max(0,p.gap==null?20:p.gap)/100, Tw=nx*u, Th=ny*hh, rnd=this.rng(p.seed*67+13), sw=Math.max(0.8,p.stroke*0.5), fillMode=p.style!=='outline', jf=(p.jitter||0)/100, F=v=>v.toFixed(2);
      const ph=[rnd()*6.283,rnd()*6.283,rnd()*6.283,rnd()*6.283];
      const fld=(x,y)=>{ const a=x/Tw*6.283, b=y/Th*6.283; const v=Math.sin(a*2+ph[0])+Math.sin(b*2+ph[1])+0.9*Math.sin(a*3-b*2+ph[2])+0.6*Math.sin(a*5+b*3+ph[3])+0.4*Math.sin(a*7-b*5+ph[0]*2); return Math.max(0,Math.min(1,(v+3.9)/7.8+bq)); };
      const bq=((p.blotchQty==null?100:p.blotchQty)-100)/100*0.22;   // Blotch quantity lifts or lowers the whole field: more or fewer islands
      // lattice: unit triangles indexed (i,j,up). Column i half-steps of u/2, row j of hh.
      // up triangle at (i,j): apex (x, y0), base y0+hh; down triangle: base at y0, apex y0+hh.
      const occ=new Uint8Array(nx*2*ny), key=(i,j)=>((((j%ny)+ny)%ny)*nx*2)+(((i%(nx*2))+nx*2)%(nx*2));
      // a size-s up triangle with bottom-left unit (i,j) [must be an up unit]: rows above shrink by
      // one unit on each side; a size-s down triangle with top-left unit (i,j) [a down unit] mirrors it
      const cellsOf=(i,j,s,up)=>{ const out=[]; for(let r=0;r<s;r++){ const n=2*(s-r)-1, row=up?j-r:j+r; for(let q=0;q<n;q++) out.push([i+r+q,row]); } return out; };
      const isUp=(i,j)=>((i+j)%2===0);
      const free=cells=>cells.every(([a,b])=>!occ[key(a,b)]);
      const take=cells=>cells.forEach(([a,b])=>{ occ[key(a,b)]=1; });
      // a 1-cell margin so neighbouring triangles never share an edge unless intended (Gap widens it)
      const ring=cells=>{ const s=new Set(cells.map(([a,b])=>key(a,b))), out=[]; for(const [a,b] of cells) for(const [da,db] of [[-1,0],[1,0],[0,isUp(a,b)?1:-1]]){ const k=key(a+da,b+db); if(!s.has(k)) out.push([a+da,b+db]); } return out; };
      let inner='';
      const tri=(i,j,s,up,solid)=>{ // vertices from the unit lattice; apex row for up = j-s+1
        const x0=i*u/2, bx1=x0+s*u, by=up?(j+1)*hh:j*hh, ax=x0+s*u/2, ay=up?(j+1-s)*hh:(j+s)*hh;
        const jx=(rnd()*2-1)*u*0.06*jf, jy=(rnd()*2-1)*hh*0.06*jf;
        const pts=[[x0+jx,by+jy],[bx1+jx,by+jy],[ax+jx,ay+jy]];
        const d=pts.map(q=>F(q[0])+','+F(q[1])).join(' ');
        return `<polygon points="${d}" ${solid&&fillMode?`fill="${ink}"`:`fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linejoin="round"`}/>`; };
      const put=(i,j,s,up,solid)=>{ const g=tri(i,j,s,up,solid); for(const [ox,oy] of [[0,0],[Tw,0],[-Tw,0],[0,Th],[0,-Th],[Tw,Th],[-Tw,-Th],[Tw,-Th],[-Tw,Th]]) inner+=`<g transform="translate(${ox},${oy})">${g}</g>`; };
      // pass 1: big triangles (3 and 2 units) seeded where the field is high
      for(const s of [3,2]){ const tries=nx*ny*(s===3?0.3:0.9);
        for(let t=0;t<tries;t++){ const i=Math.floor(rnd()*nx*2), j=Math.floor(rnd()*ny), up=isUp(i,j);
          const cx=(i*u/2+s*u/2), cy=(up?(j+1-s/3):(j+s/3))*hh, v=fld(((cx%Tw)+Tw)%Tw,((cy%Th)+Th)%Th);
          if(rnd()>(v-0.5)*(s===3?1.0:2.2)) continue;
          const cells=cellsOf(i,j,s,up); if(!free(cells)) continue;
          const shared=rnd()<Math.max(0.05,0.35-gf*0.5);                          // a third of the big ones touch a neighbour edge-to-edge, the rest stand clear
          take(cells); if(!shared) take(ring(cells)); put(i,j,s,up,rnd()<0.06); } }
      // pass 2: unit triangles cluster around the big ones inside the islands, sparser outward
      for(let j=0;j<ny;j++) for(let i=0;i<nx*2;i++){ if(occ[key(i,j)]) continue;
        const up=isUp(i,j), cx=i*u/2+u/2, cy=(j+0.5)*hh, v=fld(cx,cy), r=rnd();
        const pr=v>0.66?0.16:(v>0.56?0.1:(v>0.46?0.04:0.004));
        if(r>pr) continue; const cells=[[i,j]]; occ[key(i,j)]=1; if(rnd()<Math.min(1,0.5+gf)) take(ring(cells)); put(i,j,1,up,rnd()<0.08); }
      return { Tw, Th, inner };
    }
    if(m==='trisolid'){
      // triangle tessellation: left and right pointing triangles on a strict grid; a seeded
      // field decides solid, hollow ring or empty, so solids cluster into masses
      // triangle camo: left and right pointing triangles on a strict grid. Two seeded fields
      // (large blotches + a finer break-up) carve the lattice into fused solid masses with
      // ragged edges, a halo of hollow triangles around each mass, and open ground between
      const u=Math.max(14,cell*0.55+(p.gap||18)*0.7), hh=u*0.866, cols=Math.max(8,Math.round(cell*18/hh))&~1, rows=Math.max(8,Math.round(cell*18/u)), Tw=cols*hh, Th=rows*u;
      const rnd=this.rng(p.seed*41+5), fillMode=p.style!=='outline', sw=Math.max(0.8,p.stroke*0.6), inset=Math.max(0.6,(p.gap||18)*0.09), F=v=>v.toFixed(1), jf=(p.jitter||0)/100;
      const ph=[rnd()*6.283,rnd()*6.283,rnd()*6.283,rnd()*6.283,rnd()*6.283,rnd()*6.283,rnd()*6.283];
      const fld=(x,y)=>{ const a=x/Tw*6.283, b=y/Th*6.283;
        const big=Math.sin(a*2+ph[0])+Math.sin(b*2+ph[1])+0.9*Math.sin(a*3-b*2+ph[2])+0.6*Math.sin(a*5+b*3+ph[3]*0.7)+0.5*Math.sin(a*4-b*5+ph[5]);               // blotch shapes
        const fine=0.6*Math.sin(a*5+b*3+ph[3])+0.5*Math.sin(a*3-b*6+ph[4])+0.45*Math.sin(a*9+b*7+ph[6])+0.35*Math.cos(a*13-b*11+ph[5]*1.9);                       // ragged edges + fine break-up
        return Math.max(0,Math.min(1,(big+fine*(0.6+jf)+3.6)/7.2+bq)); };
      const bq=((p.blotchQty==null?100:p.blotchQty)-100)/100*0.22;
      let inner='';
      const poly=(pts,k)=>{ const cx=(pts[0][0]+pts[1][0]+pts[2][0])/3, cy=(pts[0][1]+pts[1][1]+pts[2][1])/3; return pts.map(q=>[cx+(q[0]-cx)*k,cy+(q[1]-cy)*k]); };
      const str=pts=>pts.map(q=>F(q[0])+','+F(q[1])).join(' ');
      const draw=(pts,kind)=>{ const r=u/Math.sqrt(3), k0=1-inset/r;
        if(kind==='mass'){ // inside a blotch the triangles fuse: no inset, so the mass reads as one shape
          const o=poly(pts,1.002); return fillMode?`<polygon points="${str(o)}" fill="${ink}"/>`:`<polygon points="${str(poly(pts,k0))}" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linejoin="round"/>`; }
        const o=poly(pts,k0);
        if(kind==='solid') return fillMode?`<polygon points="${str(o)}" fill="${ink}"/>`:`<polygon points="${str(o)}" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linejoin="round"/>`;
        if(kind==='small'){ const s=poly(pts,0.3+rnd()*0.28); return fillMode?`<polygon points="${str(s)}" fill="${ink}"/>`:`<polygon points="${str(s)}" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linejoin="round"/>`; }
        const i2=poly(pts,k0*0.55);
        return fillMode?`<path d="M${str(o).replace(/ /g,'L')}Z M${str(i2).replace(/ /g,'L')}Z" fill-rule="evenodd" fill="${ink}"/>`:`<polygon points="${str(o)}" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linejoin="round"/><polygon points="${str(i2)}" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linejoin="round"/>`; };
      const wrapY=pts=>{ const out=[]; for(const oy of [0,Th,-Th]) out.push(pts.map(q=>[q[0],q[1]+oy])); return out; };
      for(let i=0;i<cols;i++) for(let j=0;j<rows;j++){
        const x0=i*hh, x1=(i+1)*hh, odd=i%2;
        const R=odd?[[x0,(j-0.5)*u],[x0,(j+0.5)*u],[x1,j*u]]:[[x0,j*u],[x0,(j+1)*u],[x1,(j+0.5)*u]];
        const L=odd?[[x1,j*u],[x1,(j+1)*u],[x0,(j+0.5)*u]]:[[x1,(j-0.5)*u],[x1,(j+0.5)*u],[x0,j*u]];
        for(const pts of [R,L]){ const cx=(pts[0][0]+pts[1][0]+pts[2][0])/3, cy=(pts[0][1]+pts[1][1]+pts[2][1])/3, v=fld(cx,((cy%Th)+Th)%Th)+(rnd()*2-1)*0.045, roll=rnd();   // per-cell noise frays every threshold
          let kind=null;
          if(v>0.72) kind=roll<0.07?(roll<0.03?null:'ring'):'mass';            // fused core, with the odd hole or ring punched in
          else if(v>0.64) kind=roll<0.5?'solid':(roll<0.7?'mass':(roll<0.78?'ring':null));        // ragged edge: separate solids breaking off
          else if(v>0.56) kind=roll<0.3?'ring':(roll<0.42?'solid':(roll<0.5?'small':null));       // halo of hollow triangles
          else if(v>0.46) kind=roll<0.1?'small':(roll<0.16?'ring':(roll<0.19?'solid':null));       // scatter fading into ground
          else if(roll<0.025) kind=roll<0.018?'small':'ring';
          if(!kind) continue; for(const w of wrapY(pts)) inner+=draw(w,kind); }
      }
      return { Tw, Th, inner };
    }
    /* ---------- Medical family ---------- */
    if(m==='ecg'){
      // one heartbeat per cell row: flat baseline, P bump, QRS spike, T wave; rows brick-offset
      const T=cell*4, rows=2, sw=Math.max(1.5,p.stroke), rnd=this.rng(p.seed), jf=0;
      let inner='';
      for(let r=0;r<rows;r++){ const y0=cell*(r*2+1), off=r?T/2:0, a=cell*(0.55+0.3*jf*(rnd()-0.5));
        const beat=(x)=>`L${(x+T*0.18).toFixed(1)},${y0} q${(T*0.025).toFixed(1)},${(-a*0.18).toFixed(1)} ${(T*0.05).toFixed(1)},0 L${(x+T*0.30).toFixed(1)},${y0} l${(T*0.02).toFixed(1)},${(a*0.14).toFixed(1)} l${(T*0.03).toFixed(1)},${(-a*1.0).toFixed(1)} l${(T*0.03).toFixed(1)},${(a*1.3).toFixed(1)} l${(T*0.02).toFixed(1)},${(-a*0.44).toFixed(1)} L${(x+T*0.50).toFixed(1)},${y0} q${(T*0.05).toFixed(1)},${(-a*0.42).toFixed(1)} ${(T*0.10).toFixed(1)},0 L${(x+T).toFixed(1)},${y0}`;
        inner+=`<g transform="translate(${off},0)"><path d="M${-T},${y0} ${beat(-T)} ${beat(0)}" fill="none" stroke="${ink}" stroke-linecap="round" stroke-linejoin="round" stroke-width="${sw}"/></g>`; }
      return { T, inner };
    }
    if(m==='helix'){
      // DNA: two sine strands a half-period apart, rungs where they are far enough apart
      const T=cell*3, sw=Math.max(1.5,p.stroke), amp=cell*0.42, cy=T/2, N=48;
      const strand=(ph)=>{ let d=''; for(let i=0;i<=N;i++){ const x=i/N*T, y=cy+amp*Math.sin(2*Math.PI*i/N+ph); d+=(i?'L':'M')+x.toFixed(1)+','+y.toFixed(1); } return d; };
      let inner=`<path d="${strand(0)}" fill="none" stroke="${ink}" stroke-linecap="round" stroke-linejoin="round" stroke-width="${sw}"/><path d="${strand(Math.PI)}" fill="none" stroke="${ink}" stroke-linecap="round" stroke-linejoin="round" stroke-width="${sw}"/>`;
      for(let i=1;i<10;i++){ const x=i/10*T, y1=cy+amp*Math.sin(2*Math.PI*i/10), y2=cy-amp*Math.sin(2*Math.PI*i/10); if(Math.abs(y1-y2)>amp*0.5) inner+=`<path d="M${x.toFixed(1)},${y1.toFixed(1)} L${x.toFixed(1)},${y2.toFixed(1)}" fill="none" stroke="${ink}" stroke-linecap="round" stroke-linejoin="round" stroke-width="${(sw*0.7).toFixed(2)}"/>`; }
      if(p.style!=='outline') for(let i=0;i<=N;i+=4){ const x=i/N*T, y=cy+amp*Math.sin(2*Math.PI*i/N); inner+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(sw*1.1).toFixed(2)}" fill="${ink}"/>`; }
      return { T, inner };
    }
    if(m==='cells'){
      // cell field: rounded organic cells with a nucleus, packed with a membrane gap
      const T=cell*4, rnd=this.rng(p.seed), sw=Math.max(1.2,p.stroke), n=9;
      const pts=[]; for(let k=0;k<n;k++) pts.push([rnd()*T,rnd()*T]);
      let inner='';
      for(const [cx,cy] of pts){ const r=cell*(0.36+rnd()*0.26); let d='';
        for(let a=0;a<=12;a++){ const t=a/12*Math.PI*2, rr=r*(0.86+0.14*Math.sin(t*3+cx)); const x=cx+rr*Math.cos(t), y=cy+rr*Math.sin(t); d+=(a?'L':'M')+x.toFixed(1)+','+y.toFixed(1); }
        for(const [ox,oy] of [[0,0],[T,0],[-T,0],[0,T],[0,-T],[T,T],[-T,-T],[T,-T],[-T,T]]){
          inner+=`<g transform="translate(${ox},${oy})"><path d="${d}Z" fill="${p.style!=='outline'?this.mix(ink,p.ground,0.85):'none'}" stroke="${ink}" stroke-width="${sw}" stroke-linejoin="round"/><circle cx="${(cx+r*0.15).toFixed(1)}" cy="${(cy-r*0.1).toFixed(1)}" r="${(r*0.28).toFixed(1)}" fill="${ink}"/></g>`; } }
      return { T, inner };
    }
    if(m==='molecule'){
      // hex lattice of atoms joined by bonds, a few double bonds, like a benzene sheet
      const s=Math.max(14,cell*0.9), R3=Math.sqrt(3), Tw=3*s, Th=R3*s, sw=Math.max(1.5,p.stroke), ar=sw*1.1;
      const hexPts=(cx,cy)=>{ const o=[]; for(let a=0;a<6;a++){ const ang=Math.PI/3*a; o.push([cx+s*Math.cos(ang),cy+s*Math.sin(ang)]); } return o; };
      let inner='';
      for(const [cx,cy] of [[0,0],[Tw,0],[0,Th],[Tw,Th],[1.5*s,Th/2]]){ const P=hexPts(cx,cy);
        for(let a=0;a<6;a++){ const A=P[a],B=P[(a+1)%6]; inner+=`<path d="M${A[0].toFixed(1)},${A[1].toFixed(1)} L${B[0].toFixed(1)},${B[1].toFixed(1)}" fill="none" stroke="${ink}" stroke-linecap="round" stroke-linejoin="round" stroke-width="${sw}"/>`;
          if(a%2===0){ const nx=(B[1]-A[1]), ny=-(B[0]-A[0]), L=Math.hypot(nx,ny)||1, k=sw*1.8/L; inner+=`<path d="M${(A[0]*0.8+B[0]*0.2+nx*k).toFixed(1)},${(A[1]*0.8+B[1]*0.2+ny*k).toFixed(1)} L${(A[0]*0.2+B[0]*0.8+nx*k).toFixed(1)},${(A[1]*0.2+B[1]*0.8+ny*k).toFixed(1)}" fill="none" stroke="${ink}" stroke-linecap="round" stroke-linejoin="round" stroke-width="${(sw*0.7).toFixed(2)}"/>`; } }
        for(const [x,y] of P) inner+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${ar.toFixed(2)}" fill="${p.style!=='outline'?ink:p.ground}" stroke="${ink}" stroke-width="${(sw*0.8).toFixed(2)}"/>`; }
      return { T:Tw, Th, inner };
    }
    if(m==='medcross'){
      // medical crosses on a brick grid, alternating solid and outline
      const T=cell*2, a=cell*0.62, w=a*0.36;
      const cross=(cx,cy,solid)=>{ const d=`M${(cx-w/2).toFixed(1)},${(cy-a/2).toFixed(1)} h${w.toFixed(1)} v${((a-w)/2).toFixed(1)} h${((a-w)/2).toFixed(1)} v${w.toFixed(1)} h${(-(a-w)/2).toFixed(1)} v${((a-w)/2).toFixed(1)} h${(-w).toFixed(1)} v${(-(a-w)/2).toFixed(1)} h${(-(a-w)/2).toFixed(1)} v${(-w).toFixed(1)} h${((a-w)/2).toFixed(1)}Z`;
        return solid?`<path d="${d}" fill="${ink}"/>`:`<path d="${d}" fill="none" stroke="${ink}" stroke-linecap="round" stroke-linejoin="round" stroke-width="${Math.max(1.2,p.stroke*0.7).toFixed(2)}"/>`; };
      return { T, inner: cross(cell*0.5,cell*0.5,true)+cross(cell*1.5,cell*1.5,true)+cross(cell*1.5,cell*0.5,p.style!=='outline'?false:false)+cross(cell*0.5,cell*1.5,false) };
    }
    if(m==='pulse'){
      // concentric pulse rings fading outward, like a monitor ping, on a staggered grid
      const T=cell*3, sw=Math.max(1.2,p.stroke), rings=4;
      let inner='';
      for(const [cx,cy] of [[T*0.25,T*0.25],[T*0.75,T*0.75]]){ inner+=`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(sw*1.6).toFixed(2)}" fill="${ink}"/>`;
        for(let k=1;k<=rings;k++){ const r=cell*0.28*k, w=sw*(1.15-k*0.2); inner+=`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="none" stroke="${ink}" stroke-width="${Math.max(0.6,w).toFixed(2)}" opacity="${(1-(k-1)*0.18).toFixed(2)}"/>`; } }
      return { T, inner };
    }
    /* ---------- Engineering family ---------- */
    if(m==='gears'){
      // meshing spur gears on a square lattice: large at corners, small at centre, teeth as a toothed path
      const T=cell*4, sw=Math.max(1.5,p.stroke);
      const gear=(cx,cy,r,n,ph)=>{ let d=''; const ro=r, ri=r*0.82; for(let i=0;i<n*2;i++){ const a0=(i/(n*2))*Math.PI*2+ph, a1=((i+0.5)/(n*2))*Math.PI*2+ph, rr=i%2?ri:ro; d+=(i?'L':'M')+(cx+rr*Math.cos(a0)).toFixed(1)+','+(cy+rr*Math.sin(a0)).toFixed(1)+' L'+(cx+rr*Math.cos(a1)).toFixed(1)+','+(cy+rr*Math.sin(a1)).toFixed(1); }
        const fill=p.style!=='outline'?this.mix(ink,p.ground,0.88):'none';
        return `<path d="${d}Z" fill="${fill}" stroke="${ink}" stroke-width="${sw}" stroke-linejoin="round"/><circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(r*0.5).toFixed(1)}" fill="none" stroke="${ink}" stroke-width="${sw}"/><circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(r*0.14).toFixed(1)}" fill="${ink}"/>`+
          [0,1,2,3].map(k=>{ const a=k*Math.PI/2+ph; return `<path d="M${(cx+r*0.17*Math.cos(a)).toFixed(1)},${(cy+r*0.17*Math.sin(a)).toFixed(1)} L${(cx+r*0.47*Math.cos(a)).toFixed(1)},${(cy+r*0.47*Math.sin(a)).toFixed(1)}" fill="none" stroke="${ink}" stroke-linecap="round" stroke-linejoin="round" stroke-width="${sw}"/>`; }).join(''); };
      let inner='';
      for(const [ox,oy] of [[0,0],[T,0],[0,T],[T,T]]) inner+=gear(ox,oy,cell*1.05,12,0);
      inner+=gear(T/2,T/2,cell*0.72,8,Math.PI/8);
      inner+=gear(T/2,0,cell*0.5,6,Math.PI/6)+gear(T/2,T,cell*0.5,6,Math.PI/6)+gear(0,T/2,cell*0.5,6,0)+gear(T,T/2,cell*0.5,6,0);
      return { T, inner };
    }
    if(m==='circuit'){
      // PCB traces: orthogonal and 45° runs between pads on a fine grid, seeded, tile-wrapped
      const T=cell*4, g=cell/2, N=8, rnd=this.rng(p.seed), sw=Math.max(1.5,p.stroke), pr=sw*1.3;
      const occ={}; let inner=''; const key=(x,y)=>((x%N)+N)%N+','+(((y%N)+N)%N);
      for(let t=0;t<N*1.6;t++){ let x=Math.floor(rnd()*N), y=Math.floor(rnd()*N); if(occ[key(x,y)]) continue; occ[key(x,y)]=1;
        let d='M'+(x*g).toFixed(1)+','+(y*g).toFixed(1); const len=2+Math.floor(rnd()*4); let dir=Math.floor(rnd()*8);
        const pads=[[x,y]];
        for(let s=0;s<len;s++){ if(rnd()<0.35) dir=(dir+(rnd()<0.5?1:7))%8; const dx=[1,1,0,-1,-1,-1,0,1][dir], dy=[0,1,1,1,0,-1,-1,-1][dir]; const nx=x+dx, ny=y+dy; if(occ[key(nx,ny)]) break; occ[key(nx,ny)]=1; x=nx; y=ny; d+=' L'+(x*g).toFixed(1)+','+(y*g).toFixed(1); }
        pads.push([x,y]);
        for(const [ox,oy] of [[0,0],[T,0],[-T,0],[0,T],[0,-T],[T,T],[-T,-T],[T,-T],[-T,T]]){
          inner+=`<g transform="translate(${ox},${oy})"><path d="${d}" fill="none" stroke="${ink}" stroke-linecap="round" stroke-linejoin="round" stroke-width="${sw}"/>`+pads.map(([px,py])=>`<circle cx="${(px*g).toFixed(1)}" cy="${(py*g).toFixed(1)}" r="${pr.toFixed(2)}" fill="${p.ground}" stroke="${ink}" stroke-width="${sw}"/>`).join('')+'</g>'; } }
      return { T, inner };
    }
    if(m==='blueprint'){
      // drafting grid: fine grid, heavy every 4th line, with dimension ticks and a centre mark
      const T=cell*4, f=Math.max(0.5,p.stroke*0.25), h=Math.max(1,p.stroke*0.6);
      let inner='';
      for(let i=0;i<4;i++){ const q=i*cell; inner+=`<path d="M${q},0 V${T} M0,${q} H${T}" stroke="${ink}" stroke-width="${i?f:h}" fill="none"/>`; }
      const c=cell*0.5; inner+=`<path d="M${(T/2-c).toFixed(1)},${T/2} H${(T/2+c).toFixed(1)} M${T/2},${(T/2-c).toFixed(1)} V${(T/2+c).toFixed(1)}" stroke="${ink}" stroke-width="${h}"/><circle cx="${T/2}" cy="${T/2}" r="${(c*0.55).toFixed(1)}" fill="none" stroke="${ink}" stroke-width="${h}" stroke-dasharray="${(c*0.3).toFixed(1)} ${(c*0.15).toFixed(1)}"/>`;
      // dimension line with arrowheads along the top of the tile
      const y=cell*0.5, x0=cell*0.3, x1=T-cell*0.3, ah=cell*0.14;
      inner+=`<path d="M${x0},${y} H${x1} M${x0},${y} l${ah},${-ah*0.45} M${x0},${y} l${ah},${ah*0.45} M${x1},${y} l${-ah},${-ah*0.45} M${x1},${y} l${-ah},${ah*0.45} M${x0},${(y-cell*0.35).toFixed(1)} V${(y+cell*0.2).toFixed(1)} M${x1},${(y-cell*0.35).toFixed(1)} V${(y+cell*0.2).toFixed(1)}" stroke="${ink}" stroke-width="${h}" fill="none"/>`;
      return { T, inner };
    }
    if(m==='bolts'){
      // hex bolt heads on a staggered grid: hex outline, inner circle, cross slot on alternates
      const s=Math.max(8,cell*0.42), R3=Math.sqrt(3), Tw=3*s*1.3, Th=R3*s*1.3, sw=Math.max(1.5,p.stroke);
      const hex=(cx,cy)=>{ let d=''; for(let a=0;a<6;a++){ const ang=Math.PI/3*a; d+=(a?'L':'M')+(cx+s*Math.cos(ang)).toFixed(1)+','+(cy+s*Math.sin(ang)).toFixed(1); } return d+'Z'; };
      const bolt=(cx,cy,slot)=>`<path d="${hex(cx,cy)}" fill="${p.style!=='outline'?this.mix(ink,p.ground,0.88):'none'}" stroke="${ink}" stroke-width="${sw}" stroke-linejoin="round"/><circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(s*0.55).toFixed(1)}" fill="none" stroke="${ink}" stroke-width="${sw}"/>`+(slot?`<path d="M${(cx-s*0.38).toFixed(1)},${cy.toFixed(1)} H${(cx+s*0.38).toFixed(1)} M${cx.toFixed(1)},${(cy-s*0.38).toFixed(1)} V${(cy+s*0.38).toFixed(1)}" fill="none" stroke="${ink}" stroke-linecap="round" stroke-linejoin="round" stroke-width="${sw}"/>`:`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(s*0.16).toFixed(1)}" fill="${ink}"/>`);
      let inner='';
      for(const [cx,cy,sl] of [[0,0,1],[Tw,0,1],[0,Th,1],[Tw,Th,1],[Tw/2,Th/2,0]]) inner+=bolt(cx,cy,sl);
      return { T:Tw, Th, inner };
    }
    if(m==='truss'){
      // Warren truss lattice: chords and alternating diagonals, gusset dots at joints
      const T=cell*2, sw=Math.max(1.5,p.stroke), rows=2, h=T/rows;
      let inner='';
      for(let r=0;r<rows;r++){ const y0=r*h, y1=(r+1)*h, flip=r%2;
        inner+=`<path d="M0,${y0} H${T}" fill="none" stroke="${ink}" stroke-linecap="round" stroke-linejoin="round" stroke-width="${sw}"/>`;
        for(let i=0;i<2;i++){ const x0=i*T/2, x1=(i+1)*T/2, xm=(x0+x1)/2; inner+=flip?`<path d="M${x0},${y1} L${xm},${y0} L${x1},${y1}" fill="none" stroke="${ink}" stroke-linecap="round" stroke-linejoin="round" stroke-width="${sw}"/>`:`<path d="M${x0},${y0} L${xm},${y1} L${x1},${y0}" fill="none" stroke="${ink}" stroke-linecap="round" stroke-linejoin="round" stroke-width="${sw}"/>`; }
        for(let i=0;i<=2;i++){ inner+=`<circle cx="${i*T/2}" cy="${y0}" r="${(sw*1.3).toFixed(2)}" fill="${ink}"/>`; } }
      return { T, inner };
    }
    if(m==='isobolt'){
      // isometric fastener field: cylinders seen in iso with hex heads, brick layout
      const T=cell*3, sw=Math.max(1.5,p.stroke), r=cell*0.42, hgt=cell*0.55;
      const one=(cx,cy)=>{ const top=`M${(cx-r).toFixed(1)},${cy.toFixed(1)} a${r.toFixed(1)},${(r*0.5).toFixed(1)} 0 1 0 ${(2*r).toFixed(1)},0 a${r.toFixed(1)},${(r*0.5).toFixed(1)} 0 1 0 ${(-2*r).toFixed(1)},0`;
        const side=`M${(cx-r).toFixed(1)},${cy.toFixed(1)} v${hgt.toFixed(1)} a${r.toFixed(1)},${(r*0.5).toFixed(1)} 0 0 0 ${(2*r).toFixed(1)},0 v${(-hgt).toFixed(1)}`;
        return `<path d="${side}" fill="${p.style!=='outline'?this.mix(ink,p.ground,0.7):'none'}" stroke="${ink}" stroke-width="${sw}" stroke-linejoin="round"/><path d="${top}" fill="${p.style!=='outline'?this.mix(ink,p.ground,0.92):'none'}" stroke="${ink}" stroke-width="${sw}"/><path d="M${(cx-r*0.5).toFixed(1)},${cy.toFixed(1)} H${(cx+r*0.5).toFixed(1)}" fill="none" stroke="${ink}" stroke-linecap="round" stroke-linejoin="round" stroke-width="${sw}"/>`; };
      let inner=''; for(const [cx,cy] of [[cell*0.75,cell*0.6],[cell*2.25,cell*0.6],[cell*1.5,cell*2.1],[cell*0,cell*2.1],[cell*3,cell*2.1]]) inner+=one(cx,cy);
      return { T, inner };
    }
    if(m==='jacks'){
      // Four balls joined by concave arcs, nesting on the lattice u=(9,4)k, v=(-4,9)k so every
      // tip sits snug in a neighbour's hollow; period 97k square. Seeded drop-out opens the field.
      const k=Math.max(3,cell*0.16), lam=4.1, L=lam*k, r=0.22*L, g=L*(0.07+Math.max(0,p.gap||0)/60*0.33), T=97*k;
      const P=[L-9*k,-4*k];
      const fR=c=>Math.hypot(c-L,c)-r, fd=c=>Math.hypot(P[0]+c,P[1]+c)-(fR(c)+r+g);
      let lo=0.3*L, hi=3*L; for(let i=0;i<60;i++){ const mid=(lo+hi)/2; if((fd(mid)>0)===(fd(lo)>0)) lo=mid; else hi=mid; }
      const c=(lo+hi)/2, Rc=fR(c), F=v=>v.toFixed(2);
      const balls=[0,1,2,3].map(q=>[L*Math.cos(q*Math.PI/2),L*Math.sin(q*Math.PI/2)]);
      const cen=[0,1,2,3].map(q=>{ const a=q*Math.PI/2+Math.PI/4, d=c*Math.SQRT2; return [d*Math.cos(a),d*Math.sin(a)]; });
      const tw=(B,C)=>{ const dx=C[0]-B[0], dy=C[1]-B[1], n=Math.hypot(dx,dy); return [B[0]+dx/n*r,B[1]+dy/n*r]; };
      let d='';
      for(let q=0;q<4;q++){ const B=balls[q], Cprev=cen[(q+3)%4], Cnext=cen[q];
        const tin=tw(B,Cprev), tout=tw(B,Cnext), nb=balls[(q+1)%4], tn=tw(nb,Cnext);
        d+=(q?'':'M'+F(tin[0])+','+F(tin[1]))+' A'+F(r)+','+F(r)+' 0 1 1 '+F(tout[0])+','+F(tout[1])+' A'+F(Rc)+','+F(Rc)+' 0 0 0 '+F(tn[0])+','+F(tn[1]); }
      d+='Z';
      const rnd=this.rng(p.seed), drop=0.24, fill=p.style==='outline'?'none':ink, st=p.style==='outline'?'stroke="'+ink+'" stroke-width="'+Math.max(1,p.stroke*0.6)+'"':'';
      let inner='';
      // lattice points inside one period: i*u + j*v, reduced mod T
      // 97 = 9²+4², so the lattice (9,4),(-4,9) has exactly 97 points per period and the T×T square
      // tiles exactly; dropping is keyed on the reduced lattice index so copies across the seam agree.
      // a lattice point and its copies one period away share (x mod 97, y mod 97), so keying the
      // drop-out on that pair keeps both sides of the seam identical
      const dropped={}, idx=(i,j)=>{ const x=i*9-j*4, y=i*4+j*9; return (((x%97)+97)%97)+','+(((y%97)+97)%97); };
      for(let i=-30;i<=30;i++) for(let j=-30;j<=30;j++){ const key=idx(i,j); if(!(key in dropped)) dropped[key]=rnd()<drop; }
      const pad=L+r;
      for(let i=-30;i<=30;i++) for(let j=-30;j<=30;j++){ const x=(i*9-j*4)*k, y=(i*4+j*9)*k; if(x<-pad||y<-pad||x>T+pad||y>T+pad) continue; if(dropped[idx(i,j)]) continue; inner+='<path d="'+d+'" transform="translate('+F(x)+','+F(y)+')" fill="'+fill+'" '+st+'/>'; }
      return { T, inner };
    }
    if(m==='hatch') return { T:cell, inner:`<path d="M0,${cell} L${cell},0" ${so}/>` };
    if(m==='crosshatch') return { T:cell, inner:`<path d="M0,${cell} L${cell},0 M0,0 L${cell},${cell}" ${so}/>` };
    if(m==='chevron'){ const h=cell*0.28; return { T:cell, inner:`<path d="M0,${cell/2+h} L${cell/2},${cell/2-h} L${cell},${cell/2+h}" ${so}/>` }; }
    if(m==='scallop'){ const r=cell/2; return { T:cell, inner:
      `<path d="M0,0 A${r},${r} 0 0 0 ${cell},0" ${so}/>`+
      `<path d="M${-r},${r} A${r},${r} 0 0 0 ${r},${r}" ${so}/>`+
      `<path d="M${r},${r} A${r},${r} 0 0 0 ${cell+r},${r}" ${so}/>` }; }
    if(m==='scatter'){
      const T=cell*4, rnd=this.rng(p.seed), n=Math.max(6,Math.round((T*T)/(cell*cell)*1.4)), margin=cell*0.55;
      let inner='';
      for(let k=0;k<n;k++){ const x=margin+rnd()*(T-2*margin), y=margin+rnd()*(T-2*margin), sz=cell*(0.25+rnd()*0.5), kind=rnd();
        if(kind<0.5) inner+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(sz/2).toFixed(1)}" fill="${ink}"/>`;
        else if(kind<0.8) inner+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(sz/2).toFixed(1)}" fill="none" stroke="${ink}" stroke-width="${p.stroke}"/>`;
        else inner+=`<path d="M${x.toFixed(1)},${(y-sz/2).toFixed(1)} V${(y+sz/2).toFixed(1)} M${(x-sz/2).toFixed(1)},${y.toFixed(1)} H${(x+sz/2).toFixed(1)}" ${so}/>`;
      }
      return { T, inner };
    }
    if(m==='camo'){
      const T=cell*5, rnd=this.rng(p.seed);
      const pal=[ink, this.darken(ink,0.34), this.lighten(ink,0.3), this.mix(ink,p.ground,0.5)];
      const n=Math.max(10,Math.round((T*T)/(cell*cell)*1.6));
      let inner='';
      for(let q=0;q<n;q++){
        const x=rnd()*T, y=rnd()*T, size=cell*(0.55+rnd()*0.95), a=Math.floor(rnd()*360);
        const col=pal[Math.floor(rnd()*pal.length)], k=size/216, rad=size*0.72;
        const fill=p.style==='outline'?`fill="none" stroke="${col}" stroke-width="${(p.stroke/k).toFixed(2)}" stroke-linejoin="round"`:`fill="${col}" fill-rule="evenodd"`;
        const ox=[0]; if(x+rad>T)ox.push(-T); if(x-rad<0)ox.push(T);
        const oy=[0]; if(y+rad>T)oy.push(-T); if(y-rad<0)oy.push(T);
        for(const dx of ox) for(const dy of oy) inner+=`<g transform="translate(${(x+dx).toFixed(1)},${(y+dy).toFixed(1)}) rotate(${a}) scale(${k.toFixed(4)}) translate(-108,-108)"><path d="${this.KPATH}" ${fill}/></g>`;
      }
      return { T, inner };
    }
    if(m==='ucamo'){
      const N=6, T=cell*N, rnd=this.rng(p.seed);
      const pal=['#201e1d', '#605d5d', '#9b9797', '#d7d3d3'];
      const size=Math.max(2,cell-p.gap), k=size/216, edge='#201e1d', rad=size*0.55;
      let inner='';
      for(let j=0;j<N;j++){
        const shift=(j%2===1)?cell/2:0;
        for(let i=0;i<N;i++){
          let cx=((cell/2+i*cell+shift)%T+T)%T; const cy=cell/2+j*cell;
          const col=pal[Math.floor(rnd()*pal.length)], sw=(0.4+rnd()*1.9)*p.stroke, outline=rnd()<0.45;
          const path=outline
            ? `<path d="${this.KPATH}" fill="none" stroke="${col}" stroke-width="${(sw/k).toFixed(2)}" stroke-linejoin="round"/>`
            : `<path d="${this.KPATH}" fill="${col}" fill-rule="evenodd" stroke="${edge}" stroke-width="${(sw/k).toFixed(2)}" stroke-linejoin="round"/>`;
          const ox=[0]; if(cx+rad>T)ox.push(-T); if(cx-rad<0)ox.push(T);
          for(const dx of ox) inner+=`<g transform="translate(${(cx+dx).toFixed(1)},${cy}) scale(${k.toFixed(4)}) translate(-108,-108)">${path}</g>`;
        }
      }
      return { T, inner };
    }
    if(m==='kleeqK'){
      const N=4, T=cell*N, rnd=this.rng(p.seed), size=Math.max(2,cell-p.gap), k=size/216, fillMode=p.style!=='outline', brad=size*0.55;
      const bx=(i,j)=>((cell/2+i*cell+(j%2?cell/2:0))%T+T)%T;
      let inner='';
      if(p.accentOn){
        const A=p.accent, st=p.accentStyle||'ticks', sw=Math.max(1,p.stroke*0.7), tk=Math.max(3,cell*0.11), half=size/2;
        const node=(fn)=>{ for(let i=0;i<=N;i++) for(let j=0;j<=N;j++) inner+=fn(i*cell,j*cell); };
        if(st==='ticks') node((x,y)=>`<path d="M${x-tk},${y} H${x+tk} M${x},${y-tk} V${y+tk}" fill="none" stroke="${A}" stroke-width="${sw}" stroke-linecap="round"/>`);
        else if(st==='dots') node((x,y)=>`<circle cx="${x}" cy="${y}" r="${(tk*0.55).toFixed(1)}" fill="${A}"/>`);
        else if(st==='grid'){ for(let i=0;i<=N;i++){ inner+=`<path d="M${i*cell},0 V${T}" stroke="${A}" stroke-width="${sw}" fill="none"/><path d="M0,${i*cell} H${T}" stroke="${A}" stroke-width="${sw}" fill="none"/>`; } }
        else if(st==='brackets'){ const L=half*0.42;
          const brk=(cx,cy)=>{ const x0=cx-half, x1=cx+half, y0=cy-half, y1=cy+half;
            return `<path d="M${x0},${y0+L} V${y0} H${x0+L} M${x1-L},${y0} H${x1} V${y0+L} M${x1},${y1-L} V${y1} H${x1-L} M${x0+L},${y1} H${x0} V${y1-L}" fill="none" stroke="${A}" stroke-width="${sw}" stroke-linecap="square"/>`; };
          for(let j=0;j<N;j++) for(let i=0;i<N;i++){ const cx=bx(i,j), cy=cell/2+j*cell; const ox=[0]; if(cx+half>T)ox.push(-T); if(cx-half<0)ox.push(T); for(const dx of ox) inner+=brk(cx+dx,cy); } }
        else if(st==='diagonals'){ for(let c=-T; c<=T; c+=cell) inner+=`<path d="M${c},0 L${c+T},${T}" stroke="${A}" stroke-width="${sw}" fill="none"/>`; }
      }
      for(let j=0;j<N;j++) for(let i=0;i<N;i++){
        const cx=bx(i,j), cy=cell/2+j*cell, useAccent=p.accentOn&&rnd()<0.16, col=useAccent?p.accent:p.ink;
        const attr=fillMode?`fill="${col}" fill-rule="evenodd"`:`fill="none" stroke="${col}" stroke-width="${(p.stroke/k).toFixed(2)}" stroke-linejoin="round"`;
        const ox=[0]; if(cx+brad>T)ox.push(-T); if(cx-brad<0)ox.push(T);
        for(const dx of ox) inner+=`<g transform="translate(${(cx+dx).toFixed(1)},${cy}) scale(${k.toFixed(4)}) translate(-108,-108)" ${attr}>${this.KLOGO}</g>`;
      }
      return { T, inner };
    }
    if(m==='weave'){
      const N=6, T=cell*N, size=Math.max(2,cell-p.gap), k=size/216, rad=size*0.72, fillMode=p.style!=='outline';
      const attr=fillMode?`fill="${ink}" fill-rule="evenodd"`:`fill="none" stroke="${ink}" stroke-width="${(p.stroke/k).toFixed(2)}" stroke-linejoin="round"`;
      let inner='';
      for(let i=0;i<N;i++) for(let j=0;j<N;j++){
        const rot=(i%2)?-45:45;
        const cx=((cell/2+i*cell)%T+T)%T;
        const cy=((cell/2+j*cell+(i%2?cell/2:0))%T+T)%T;
        const ox=[0]; if(cx+rad>T)ox.push(-T); if(cx-rad<0)ox.push(T);
        const oy=[0]; if(cy+rad>T)oy.push(-T); if(cy-rad<0)oy.push(T);
        for(const dx of ox) for(const dy of oy)
          inner+=`<g transform="translate(${(cx+dx).toFixed(1)},${(cy+dy).toFixed(1)}) rotate(${rot}) scale(${k.toFixed(4)}) translate(-108,-108)" ${attr}><path d="${this.KPATH}"/></g>`;
      }
      return { T, inner };
    }
    if(m==='qquilt'){
      // quarter-circle quilt: one quarter-disc per cell, seeded rotation, arcs chain into loops
      const N=6, T=cell*N, rnd=this.rng(p.seed), fillMode=p.style!=='outline';
      const g=Math.max(1,p.gap*0.15), jmax=(p.gap/2)*((p.jitter||0)/100);
      let inner='';
      for(let i=0;i<N;i++) for(let j=0;j<N;j++){
        const s=cell-g*2, rot=90*Math.floor(rnd()*4);
        const dx=(rnd()*2-1)*jmax, dy=(rnd()*2-1)*jmax;
        const x=i*cell+g+dx, y=j*cell+g+dy;
        const d='M'+x.toFixed(1)+' '+(y+s).toFixed(1)+'L'+x.toFixed(1)+' '+y.toFixed(1)+'A'+s.toFixed(1)+' '+s.toFixed(1)+' 0 0 1 '+(x+s).toFixed(1)+' '+(y+s).toFixed(1)+'Z';
        const attr=fillMode?('fill="'+ink+'"'):('fill="none" stroke="'+ink+'" stroke-width="'+p.stroke+'" stroke-linejoin="round"');
        inner+='<g transform="rotate('+rot+' '+(x+s/2).toFixed(1)+' '+(y+s/2).toFixed(1)+')"><path d="'+d+'" '+attr+'/></g>';
      }
      return { T, inner };
    }
    if(m==='conoff'){
      // concentric offsets: nested rings, centers drift toward a seeded corner per cell
      const N=4, T=cell*N, rnd=this.rng(p.seed);
      const sw=Math.max(1,p.stroke*0.6), jf=(p.jitter||0)/100;
      let inner='';
      for(let i=0;i<N;i++) for(let j=0;j<N;j++){
        const cx0=cell/2+i*cell, cy0=cell/2+j*cell, rMax=(cell-Math.max(2,p.gap*0.6))/2;
        const ang=rnd()*6.283, drift=rMax*0.32*(0.5+jf), nR=5;
        for(let k=0;k<nR;k++){
          const t=k/(nR-1), r=rMax*(1-t*0.82);
          const cx=cx0+Math.cos(ang)*drift*t, cy=cy0+Math.sin(ang)*drift*t;
          inner+='<circle cx="'+cx.toFixed(1)+'" cy="'+cy.toFixed(1)+'" r="'+r.toFixed(1)+'" fill="none" stroke="'+ink+'" stroke-width="'+sw.toFixed(2)+'"/>';
        }
      }
      return { T, inner };
    }
    if(m==='cbite'){
      // circle bite: full disc with a crescent bite punched from the edge, bite angle seeded
      const N=4, T=cell*N, rnd=this.rng(p.seed), fillMode=p.style!=='outline';
      const jmax=(p.gap/2)*((p.jitter||0)/100);
      let inner='';
      for(let i=0;i<N;i++) for(let j=0;j<N;j++){
        const r=Math.max(2,(cell-p.gap)/2), cx=cell/2+i*cell+(rnd()*2-1)*jmax, cy=cell/2+j*cell+(rnd()*2-1)*jmax;
        const ang=rnd()*6.283, br=r*(0.42+rnd()*0.25);
        const bx=cx+Math.cos(ang)*r, by=cy+Math.sin(ang)*r;
        const attr=fillMode?('fill="'+ink+'" fill-rule="evenodd"'):('fill="none" stroke="'+ink+'" stroke-width="'+p.stroke+'"');
        const d='M'+(cx-r).toFixed(1)+' '+cy.toFixed(1)+'a'+r.toFixed(1)+' '+r.toFixed(1)+' 0 1 0 '+(2*r).toFixed(1)+' 0a'+r.toFixed(1)+' '+r.toFixed(1)+' 0 1 0 -'+(2*r).toFixed(1)+' 0Z M'+(bx-br).toFixed(1)+' '+by.toFixed(1)+'a'+br.toFixed(1)+' '+br.toFixed(1)+' 0 1 0 '+(2*br).toFixed(1)+' 0a'+br.toFixed(1)+' '+br.toFixed(1)+' 0 1 0 -'+(2*br).toFixed(1)+' 0Z';
        inner+='<path d="'+d+'" '+attr+'/>';
      }
      return { T, inner };
    }
    if(m==='halfdrift'){
      // halftone drift: circle grid, diameter follows a diagonal wave (wraps seamlessly), jitter at light end
      const N=10, T=cell*N*0.5, u=T/N, rnd=this.rng(p.seed), fillMode=p.style!=='outline';
      let inner='';
      for(let i=0;i<N;i++) for(let j=0;j<N;j++){
        const ph=2*Math.PI*(i+j)/N;
        const t=0.5+0.5*Math.sin(ph);
        const r=Math.max(0.8,(u-Math.max(1,p.gap*0.12))/2*(0.18+0.82*t));
        const jmax=u*0.3*(1-t)*((p.jitter||0)/100);
        const cx=u/2+i*u+(rnd()*2-1)*jmax, cy=u/2+j*u+(rnd()*2-1)*jmax;
        const attr=fillMode?('fill="'+ink+'"'):('fill="none" stroke="'+ink+'" stroke-width="'+Math.max(0.8,p.stroke*0.4).toFixed(2)+'"');
        inner+='<circle cx="'+cx.toFixed(1)+'" cy="'+cy.toFixed(1)+'" r="'+r.toFixed(1)+'" '+attr+'/>';
      }
      return { T, inner };
    }
    if(m==='rotfield'){
      // rotated square field: equal squares, rotation grows across the tile (wraps via sine) — order to chaos
      const N=8, T=cell*N*0.75, u=T/N, rnd=this.rng(p.seed), fillMode=p.style!=='outline';
      let inner='';
      for(let i=0;i<N;i++) for(let j=0;j<N;j++){
        const ph=2*Math.PI*i/N;
        const chaos=0.5+0.5*Math.sin(ph);
        const rot=chaos*(10+35*((p.jitter||40)/100+0.4))*(rnd()*2-1);
        const s=Math.max(2,u-Math.max(2,p.gap*0.25));
        const cx=u/2+i*u, cy=u/2+j*u;
        const attr=fillMode?('fill="'+ink+'"'):('fill="none" stroke="'+ink+'" stroke-width="'+p.stroke+'" stroke-linejoin="round"');
        inner+='<rect x="'+(cx-s/2).toFixed(1)+'" y="'+(cy-s/2).toFixed(1)+'" width="'+s.toFixed(1)+'" height="'+s.toFixed(1)+'" transform="rotate('+rot.toFixed(1)+' '+cx.toFixed(1)+' '+cy.toFixed(1)+')" '+attr+'/>';
      }
      return { T, inner };
    }
    if(m==='sqspiral'){
      // nested square spiral: insets rotated ~8 deg each step, alternate cells CW/CCW
      const N=4, T=cell*N;
      const sw=Math.max(1,p.stroke*0.6), steps=6, stepRot=6+((p.jitter||0)/100)*8;
      let inner='';
      for(let i=0;i<N;i++) for(let j=0;j<N;j++){
        const cx=cell/2+i*cell, cy=cell/2+j*cell, dir=((i+j)%2?1:-1);
        let s=cell-Math.max(2,p.gap*0.5);
        for(let k=0;k<steps;k++){
          const rot=dir*stepRot*k;
          inner+='<rect x="'+(cx-s/2).toFixed(1)+'" y="'+(cy-s/2).toFixed(1)+'" width="'+s.toFixed(1)+'" height="'+s.toFixed(1)+'" transform="rotate('+rot.toFixed(1)+' '+cx.toFixed(1)+' '+cy.toFixed(1)+')" fill="none" stroke="'+ink+'" stroke-width="'+sw.toFixed(2)+'" stroke-linejoin="round"/>';
          s*=0.76;
        }
      }
      return { T, inner };
    }
    if(m==='splitsq'){
      // split squares: each square halved H or V, one half shifted — a quiet glitch in rectangles
      const N=5, T=cell*N, rnd=this.rng(p.seed), fillMode=p.style!=='outline';
      let inner='';
      for(let i=0;i<N;i++) for(let j=0;j<N;j++){
        const s=Math.max(4,cell-p.gap), x=i*cell+(cell-s)/2, y=j*cell+(cell-s)/2;
        const horiz=rnd()<0.5, shift=s*(0.06+0.22*((p.jitter||30)/100+0.2))*(rnd()<0.5?1:-1);
        const g2=Math.max(1,p.gap*0.08);
        const attr=fillMode?('fill="'+ink+'"'):('fill="none" stroke="'+ink+'" stroke-width="'+p.stroke+'"');
        if(horiz){
          inner+='<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+s.toFixed(1)+'" height="'+(s/2-g2).toFixed(1)+'" '+attr+'/>';
          inner+='<rect x="'+(x+shift).toFixed(1)+'" y="'+(y+s/2+g2).toFixed(1)+'" width="'+s.toFixed(1)+'" height="'+(s/2-g2).toFixed(1)+'" '+attr+'/>';
        } else {
          inner+='<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+(s/2-g2).toFixed(1)+'" height="'+s.toFixed(1)+'" '+attr+'/>';
          inner+='<rect x="'+(x+s/2+g2).toFixed(1)+'" y="'+(y+shift).toFixed(1)+'" width="'+(s/2-g2).toFixed(1)+'" height="'+s.toFixed(1)+'" '+attr+'/>';
        }
      }
      return { T, inner };
    }
    if(m==='circheck'){
      // circle-in-square checker: square with circle knockout alternating with plain disc; weight ramps diagonally
      const N=6, T=cell*N, fillMode=p.style!=='outline';
      let inner='';
      for(let i=0;i<N;i++) for(let j=0;j<N;j++){
        const ph=2*Math.PI*(i+j)/N, w=0.45+0.55*(0.5+0.5*Math.sin(ph));
        const s=Math.max(3,(cell-p.gap)*w), cx=cell/2+i*cell, cy=cell/2+j*cell;
        if((i+j)%2===0){
          const r=s*0.32;
          const attr=fillMode?('fill="'+ink+'" fill-rule="evenodd"'):('fill="none" stroke="'+ink+'" stroke-width="'+p.stroke+'"');
          const d='M'+(cx-s/2).toFixed(1)+' '+(cy-s/2).toFixed(1)+'h'+s.toFixed(1)+'v'+s.toFixed(1)+'h-'+s.toFixed(1)+'Z M'+(cx-r).toFixed(1)+' '+cy.toFixed(1)+'a'+r.toFixed(1)+' '+r.toFixed(1)+' 0 1 0 '+(2*r).toFixed(1)+' 0a'+r.toFixed(1)+' '+r.toFixed(1)+' 0 1 0 -'+(2*r).toFixed(1)+' 0Z';
          inner+='<path d="'+d+'" '+attr+'/>';
        } else {
          const attr=fillMode?('fill="'+ink+'"'):('fill="none" stroke="'+ink+'" stroke-width="'+p.stroke+'"');
          inner+='<circle cx="'+cx.toFixed(1)+'" cy="'+cy.toFixed(1)+'" r="'+(s*0.42).toFixed(1)+'" '+attr+'/>';
        }
      }
      return { T, inner };
    }
    if(m==='basket'||m==='pinwheel'){
      const N=2, T=cell*N, size=Math.max(2,cell-p.gap), k=size/216, fillMode=p.style!=='outline';
      const attr=fillMode?`fill="${ink}" fill-rule="evenodd"`:`fill="none" stroke="${ink}" stroke-width="${(p.stroke/k).toFixed(2)}" stroke-linejoin="round"`;
      let inner='';
      for(let i=0;i<N;i++) for(let j=0;j<N;j++){
        const rot = m==='basket' ? (((i+j)%2)?90:0) : (i%2? (j%2?180:90) : (j%2?270:0));
        const cx=cell/2+i*cell, cy=cell/2+j*cell;
        inner+=`<g transform="translate(${cx},${cy}) rotate(${rot}) scale(${k.toFixed(4)}) translate(-108,-108)" ${attr}><path d="${this.KPATH}"/></g>`;
      }
      return { T, inner };
    }
    if(m==='mixed'){
      const N=5, T=cell*N, rnd=this.rng(p.seed), fillMode=p.style!=='outline';
      let inner='';
      for(let i=0;i<N;i++) for(let j=0;j<N;j++){
        const f=[0.55,0.85,1.25][Math.floor(rnd()*3)], size=Math.max(2,(cell-p.gap)*f), k=size/216, rad=size*0.6;
        const attr=fillMode?`fill="${ink}" fill-rule="evenodd"`:`fill="none" stroke="${ink}" stroke-width="${(p.stroke/k).toFixed(2)}" stroke-linejoin="round"`;
        const cx=cell/2+i*cell, cy=cell/2+j*cell;
        const ox=[0]; if(cx+rad>T)ox.push(-T); if(cx-rad<0)ox.push(T);
        const oy=[0]; if(cy+rad>T)oy.push(-T); if(cy-rad<0)oy.push(T);
        for(const dx of ox) for(const dy of oy) inner+=`<g transform="translate(${(cx+dx).toFixed(1)},${(cy+dy).toFixed(1)}) scale(${k.toFixed(4)}) translate(-108,-108)" ${attr}>${this.KLOGO}</g>`;
      }
      return { T, inner };
    }
    if(m==='mixedmark'){
      const N=5, T=cell*N, rnd=this.rng(p.seed), fillMode=p.style!=='outline';
      let inner='';
      for(let i=0;i<N;i++) for(let j=0;j<N;j++){
        const f=[0.55,0.85,1.25][Math.floor(rnd()*3)], size=Math.max(2,(cell-p.gap)*f), k=size/216, rad=size*0.6;
        const attr=fillMode?`fill="${ink}" fill-rule="evenodd"`:`fill="none" stroke="${ink}" stroke-width="${(p.stroke/k).toFixed(2)}" stroke-linejoin="round"`;
        const cx=cell/2+i*cell, cy=cell/2+j*cell;
        const ox=[0]; if(cx+rad>T)ox.push(-T); if(cx-rad<0)ox.push(T);
        const oy=[0]; if(cy+rad>T)oy.push(-T); if(cy-rad<0)oy.push(T);
        for(const dx of ox) for(const dy of oy) inner+=`<g transform="translate(${(cx+dx).toFixed(1)},${(cy+dy).toFixed(1)}) scale(${k.toFixed(4)}) translate(-108,-108)" ${attr}><path d="${this.KPATH}"/></g>`;
      }
      return { T, inner };
    }
    if(m==='flowmark'){
      const N=7, T=cell*N, fillMode=p.style!=='outline';
      let inner='';
      for(let i=0;i<N;i++) for(let j=0;j<N;j++){
        const f=0.32+0.62*(0.5+0.5*Math.sin(2*Math.PI*i/N)), size=Math.max(2,(cell-p.gap*0.4)*f), k=size/216, rad=size*0.6;
        const attr=fillMode?`fill="${ink}" fill-rule="evenodd"`:`fill="none" stroke="${ink}" stroke-width="${(p.stroke/k).toFixed(2)}" stroke-linejoin="round"`;
        const cx=cell/2+i*cell, cy=cell/2+j*cell;
        const ox=[0]; if(cx+rad>T)ox.push(-T); if(cx-rad<0)ox.push(T);
        const oy=[0]; if(cy+rad>T)oy.push(-T); if(cy-rad<0)oy.push(T);
        for(const dx of ox) for(const dy of oy) inner+=`<g transform="translate(${(cx+dx).toFixed(1)},${(cy+dy).toFixed(1)}) scale(${k.toFixed(4)}) translate(-108,-108)" ${attr}><path d="${this.KPATH}"/></g>`;
      }
      return { T, inner };
    }
    if(m==='tilerug'){
      const N=4, T=cell*N, size=Math.max(2,cell-p.gap), k=size/216, fillMode=p.style!=='outline', bw=Math.max(2,p.stroke);
      const attr=fillMode?`fill="${ink}" fill-rule="evenodd"`:`fill="none" stroke="${ink}" stroke-width="${(p.stroke/k).toFixed(2)}" stroke-linejoin="round"`;
      const inset=cell*0.5;
      let inner=`<rect x="0" y="0" width="${T}" height="${T}" fill="none" stroke="${ink}" stroke-width="${bw*1.6}"/>`+
        `<rect x="${inset*0.5}" y="${inset*0.5}" width="${T-inset}" height="${T-inset}" fill="none" stroke="${ink}" stroke-width="${bw}"/>`;
      for(let i=0;i<N;i++) for(let j=0;j<N;j++){
        const cx=cell/2+i*cell, cy=cell/2+j*cell;
        inner+=`<g transform="translate(${cx},${cy}) scale(${(k*0.82).toFixed(4)}) translate(-108,-108)" ${attr}>${this.KLOGO}</g>`;
      }
      return { T, inner };
    }
    if(m==='overlap'){
      const N=5, T=cell*N, size=cell*1.5, k=size/216, rad=size*0.62, cols=[ink,p.accent];
      let inner='';
      for(let i=0;i<N;i++) for(let j=0;j<N;j++){
        const cx=cell/2+i*cell, cy=cell/2+j*cell, col=cols[(i+j)%2], rot=((i+j)%2)?12:-12;
        const ox=[0]; if(cx+rad>T)ox.push(-T); if(cx-rad<0)ox.push(T);
        const oy=[0]; if(cy+rad>T)oy.push(-T); if(cy-rad<0)oy.push(T);
        for(const dx of ox) for(const dy of oy)
          inner+=`<g transform="translate(${(cx+dx).toFixed(1)},${(cy+dy).toFixed(1)}) rotate(${rot}) scale(${k.toFixed(4)}) translate(-108,-108)" fill="${col}" fill-rule="evenodd" fill-opacity="0.72" style="mix-blend-mode:multiply"><path d="${this.KPATH}"/></g>`;
      }
      return { T, inner };
    }
    if(m==='flow'){
      const N=7, T=cell*N, fillMode=p.style!=='outline';
      let inner='';
      for(let i=0;i<N;i++) for(let j=0;j<N;j++){
        const f=0.32+0.62*(0.5+0.5*Math.sin(2*Math.PI*i/N)), size=Math.max(2,(cell-p.gap*0.4)*f), k=size/216, rad=size*0.6;
        const attr=fillMode?`fill="${ink}" fill-rule="evenodd"`:`fill="none" stroke="${ink}" stroke-width="${(p.stroke/k).toFixed(2)}" stroke-linejoin="round"`;
        const cx=cell/2+i*cell, cy=cell/2+j*cell;
        const ox=[0]; if(cx+rad>T)ox.push(-T); if(cx-rad<0)ox.push(T);
        const oy=[0]; if(cy+rad>T)oy.push(-T); if(cy-rad<0)oy.push(T);
        for(const dx of ox) for(const dy of oy)
          inner+=`<g transform="translate(${(cx+dx).toFixed(1)},${(cy+dy).toFixed(1)}) scale(${k.toFixed(4)}) translate(-108,-108)" ${attr}>${this.KLOGO}</g>`;
      }
      return { T, inner };
    }
    if(m==='isostack'){
      const N=4, T=cell*N, size=Math.max(2,(cell-p.gap)*0.8), k=size/216, ex=size*0.14, steps=6, rad=size*0.6+ex;
      const front=ink, back=this.darken(ink,0.42);
      let inner='';
      for(let i=0;i<N;i++) for(let j=0;j<N;j++){
        const cx=cell/2+i*cell, cy=cell/2+j*cell;
        const ox=[0]; if(cx+rad>T)ox.push(-T); if(cx-rad<0)ox.push(T);
        const oy=[0]; if(cy+rad>T)oy.push(-T); if(cy-rad<0)oy.push(T);
        for(const dx of ox) for(const dy of oy){ const bx=cx+dx, by=cy+dy;
          for(let t=steps;t>=0;t--){ const off=t/steps, col=t===0?front:back;
            inner+=`<g transform="translate(${(bx+ex*off).toFixed(1)},${(by+ex*off).toFixed(1)}) scale(${k.toFixed(4)}) translate(-108,-108)" fill="${col}" fill-rule="evenodd">${this.KLOGO}</g>`; }
        }
      }
      return { T, inner };
    }
    if(m==='pixel'){
      const px=Math.max(6,Math.round(p.scale/4)), P=8, sf=3, F=P*sf, T=F*px, rnd=this.rng(p.seed);
      const pal=[this.darken(ink,0.5), ink, this.lighten(ink,0.28), this.mix(ink,p.ground,0.55)];
      const A=[],B=[],P2=P*2;
      for(let a=0;a<P;a++){A[a]=[];for(let b=0;b<P;b++)A[a][b]=Math.floor(rnd()*4);}
      for(let a=0;a<P2;a++){B[a]=[];for(let b=0;b<P2;b++)B[a][b]=Math.floor(rnd()*4);}
      let inner='';
      for(let x=0;x<F;x++) for(let y=0;y<F;y++){
        const ca=A[Math.floor(x/sf)%P][Math.floor(y/sf)%P], cb=B[Math.floor(x*2/sf)%P2][Math.floor(y*2/sf)%P2];
        const idx=Math.min(3,Math.round((ca*2+cb)/3));
        inner+=`<rect x="${x*px}" y="${y*px}" width="${px}" height="${px}" fill="${pal[idx]}"/>`;
      }
      return { T, inner };
    }
    if(m==='molle'){
      const T=cell*4, sw=Math.max(2,p.stroke), strapH=cell*0.62, gapV=(cell-strapH)/2;
      let inner='';
      for(let j=0;j<4;j++){ const y=j*cell+gapV;
        inner+=`<rect x="0" y="${y.toFixed(1)}" width="${T}" height="${strapH.toFixed(1)}" fill="none" stroke="${ink}" stroke-width="${sw}"/>`;
        for(let s=0;s<4;s++){ const x=s*cell+cell*0.5; inner+=`<path d="M${x},${y.toFixed(1)} V${(y+strapH).toFixed(1)}" stroke="${ink}" stroke-width="${sw}"/>`; }
      }
      return { T, inner };
    }
    if(m==='hexmesh'){
      const s=Math.max(6,p.scale*0.5), sw=Math.max(1.5,p.stroke), fillMode=p.style!=='outline', R3=Math.sqrt(3);
      const Tw=3*s, Th=R3*s;
      const hex=(cx,cy)=>{ let pts=[]; for(let a=0;a<6;a++){ const ang=Math.PI/180*60*a; pts.push(`${(cx+s*Math.cos(ang)).toFixed(2)},${(cy+s*Math.sin(ang)).toFixed(2)}`);} return pts.join(' '); };
      const attr=fillMode?`fill="${this.mix(ink,p.ground,0.12)}" stroke="${ink}" stroke-width="${sw}"`:`fill="none" stroke="${ink}" stroke-width="${sw}"`;
      let inner='';
      for(let col=-1;col<=2;col++){ const cx=col*1.5*s, off=(((col%2)+2)%2)?R3*s/2:0;
        for(let row=-1;row<=1;row++) inner+=`<polygon points="${hex(cx,row*R3*s+off)}" ${attr}/>`; }
      return { T:Tw, Tw, Th, inner };
    }
    if(m==='tread'){
      const N=2, T=cell*N, L=cell*0.72, W=cell*0.26, fillMode=p.style!=='outline';
      const st=fillMode?`fill="${ink}"`:`fill="none" stroke="${ink}" stroke-width="${Math.max(1.5,p.stroke)}"`;
      let inner='';
      for(let i=0;i<N;i++) for(let j=0;j<N;j++){ const cx=cell/2+i*cell, cy=cell/2+j*cell, rot=((i+j)%2)?45:-45;
        inner+=`<g transform="translate(${cx},${cy}) rotate(${rot})"><rect x="${(-L/2).toFixed(1)}" y="${(-W/2).toFixed(1)}" width="${L.toFixed(1)}" height="${W.toFixed(1)}" ${st}/></g>`; }
      return { T, inner };
    }
    if(m==='hazard'){
      const T=cell, w=cell*0.5;
      return { T, inner:`<path d="M0,${cell} L${cell},0" stroke="${ink}" stroke-width="${w}"/>` };
    }
    if(m==='linecamo'){
      const cp=Math.max(20,p.scale), P=6, T=cp*P, rnd=this.rng(p.seed);
      const pal=[this.darken(ink,0.5), ink, this.lighten(ink,0.28), this.mix(ink,p.ground,0.55)];
      const angs=[-60,-30,0,30,60,90];
      const lw=Math.max(1.2,p.stroke*0.7), gp=Math.max(4,cp*0.16);
      let inner='';
      for(let i=0;i<P;i++) for(let j=0;j<P;j++){
        const x0=i*cp, y0=j*cp, col=pal[Math.floor(rnd()*4)], a=angs[Math.floor(rnd()*angs.length)], cid='lc'+i+'x'+j;
        let lines='';
        for(let yy=y0-cp; yy<=y0+cp*2; yy+=gp) lines+=`<line x1="${x0-cp}" y1="${yy.toFixed(1)}" x2="${x0+cp*2}" y2="${yy.toFixed(1)}" stroke="${col}" stroke-width="${lw}"/>`;
        inner+=`<clipPath id="${cid}"><rect x="${x0}" y="${y0}" width="${cp}" height="${cp}"/></clipPath>`+
          `<g clip-path="url(#${cid})"><g transform="rotate(${a} ${x0+cp/2} ${y0+cp/2})">${lines}</g></g>`;
      }
      return { T, inner };
    }
    if(m==='wave'){
      const spacing=Math.max(12,p.scale*0.5), wl=Math.max(40,p.scale*(1+p.gap/16));
      const amp=Math.min(spacing/2-p.stroke, spacing*0.14+p.gap*0.16);
      const step=wl/28; let d=`M0,${(spacing/2).toFixed(2)}`;
      for(let x=step;x<=wl+0.001;x+=step){ const y=spacing/2+amp*Math.sin(2*Math.PI*x/wl); d+=` L${x.toFixed(2)},${y.toFixed(2)}`; }
      return { Tw:wl, Th:spacing, inner:`<path d="${d}" fill="none" stroke="${ink}" stroke-width="${p.stroke}" stroke-linecap="round"/>` };
    }
    if(m==='kleeq6'){ const N=6, T=cell*N, rnd=this.rng(p.seed), jmax=(p.gap/2)*(p.jitter/100), fillMode=p.style==='fill';
      const ws=[0.34,0.47,0.6,0.73,0.86,1];
      let inner='';
      for(let i=0;i<N;i++) for(let j=0;j<N;j++){ const w=ws[Math.floor(rnd()*6)]; const dx=(rnd()*2-1)*jmax, dy=(rnd()*2-1)*jmax;
        const size=Math.max(2,(cell-p.gap)*w), k=size/216;
        const attr=fillMode?`fill="${p.ink}" fill-rule="evenodd"`:`fill="none" stroke="${p.ink}" stroke-width="${(p.stroke/k).toFixed(2)}" stroke-linejoin="round"`;
        inner+=`<g transform="translate(${(cell/2+i*cell+dx).toFixed(1)},${(cell/2+j*cell+dy).toFixed(1)}) scale(${k.toFixed(4)}) translate(-108,-108)"><path d="${this.KPATH}" ${attr}/></g>`;
      }
      return { T, inner };
    }
    if(m==='ordchaos'){ const Tw=cell*10, Th=cell*10, rnd=this.rng(p.seed);
      let inner='';
      // one large annulus of nested ring lines: parallel and calm on the left,
      // vibrating with low-frequency waves (rings crossing each other) on the right
      const scx=Tw/2, scy=Th/2, rOut=Tw*0.42, rIn=Tw*0.24;
      const nR=Math.max(16,Math.round((rOut-rIn)/Math.max(3.5,p.gap*0.55)));
      for(let k=0;k<nR;k++){
        const r=rIn+(rOut-rIn)*k/(nR-1);
        const n=220;
        const ph1=rnd()*6.28, ph2=rnd()*6.28, ph3=rnd()*6.28;
        const l1=2+Math.floor(rnd()*3), l2=5+Math.floor(rnd()*4), l3=9+Math.floor(rnd()*6);
        const jf=(p.jitter||0)/100;
        const amp=(rOut-rIn)*(0.10+rnd()*0.14)*(1+jf*1.6);
        const jx=(rnd()*2-1)*(rOut-rIn)*0.22*jf, jy=(rnd()*2-1)*(rOut-rIn)*0.22*jf;
        let d='';
        for(let q=0;q<=n;q++){ const a=q/n*6.283;
          // side factor: 0 on the left (a≈π), 1 on the right (a≈0), smooth
          const s=Math.pow((Math.cos(a)+1)/2,2.4);
          const w=Math.sin(a*l1+ph1)*0.5+Math.sin(a*l2+ph2)*0.32+Math.sin(a*l3+ph3)*0.18;
          const rr=r+w*amp*s;
          const sx2=scx+jx*s, sy2=scy+jy*s;
          d+=(q?'L':'M')+(sx2+Math.cos(a)*rr).toFixed(1)+' '+(sy2+Math.sin(a)*rr).toFixed(1); }
        d+='Z';
        inner+='<path d="'+d+'" fill="none" stroke="'+p.ink+'" stroke-width="'+(p.stroke*0.8).toFixed(2)+'" stroke-linejoin="round"/>';
      }
      return { Tw, Th, inner };
    }
    if(m==='viblines'){ const Tw=cell*10, Th=cell*10, rnd=this.rng(p.seed), jf=(p.jitter||0)/100;
      let inner='';
      const nL=Math.max(18,Math.round(Th/Math.max(4,p.gap*0.6)));
      for(let k=0;k<nL;k++){
        const y=Th*k/nL+Th/(2*nL);
        const t=Math.pow(k/(nL-1),2); // calm top → chaos bottom
        const ph1=rnd()*6.28, ph2=rnd()*6.28;
        const l1=2+Math.floor(rnd()*3), l2=6+Math.floor(rnd()*5);
        const amp=(Th/nL)*(0.5+jf*1.8)*t*(0.6+rnd()*0.8);
        const n=160; let d='';
        for(let q=0;q<=n;q++){ const x=Tw*q/n;
          const w=Math.sin(q/n*6.283*l1+ph1)*0.6+Math.sin(q/n*6.283*l2+ph2)*0.4;
          d+=(q?'L':'M')+x.toFixed(1)+' '+(y+w*amp).toFixed(1); }
        inner+='<path d="'+d+'" fill="none" stroke="'+p.ink+'" stroke-width="'+(p.stroke*0.8).toFixed(2)+'" stroke-linejoin="round"/>';
      }
      return { Tw, Th, inner };
    }
    if(m==='vibwake'){ const Tw=cell*12, Th=cell*8, rnd=this.rng(p.seed), jf=(p.jitter||0)/100;
      let inner='';
      // horizontal lines calm at left, a vibration wake spreading from a point mid-right
      const nL=Math.max(16,Math.round(Th/Math.max(4,p.gap*0.6)));
      const fx=Tw*0.62, fy=Th*0.5;
      for(let k=0;k<nL;k++){
        const y=Th*k/nL+Th/(2*nL);
        const ph=rnd()*6.28;
        const n=200; let d='';
        for(let q=0;q<=n;q++){ const x=Tw*q/n;
          const dd2=Math.hypot(x-fx,(y-fy)*1.6);
          const fall=Math.exp(-dd2/(Tw*0.22));
          const amp=(Th/nL)*(2.4+jf*3)*fall;
          const w=Math.sin(dd2*0.045-ph)*amp;
          d+=(q?'L':'M')+x.toFixed(1)+' '+(y+w).toFixed(1); }
        inner+='<path d="'+d+'" fill="none" stroke="'+p.ink+'" stroke-width="'+(p.stroke*0.8).toFixed(2)+'" stroke-linejoin="round"/>';
      }
      return { Tw, Th, inner };
    }
    if(m==='vibpulse'){ const Tw=cell*10, Th=cell*10, rnd=this.rng(p.seed), jf=(p.jitter||0)/100;
      let inner='';
      // concentric rings from center; alternating calm and vibrating bands (pulse)
      const scx=Tw/2, scy=Th/2, rOut=Tw*0.47;
      const step=Math.max(4,p.gap*0.6);
      let idx=0;
      for(let r=step; r<=rOut; r+=step, idx++){
        const band=Math.sin(r*0.02+idx*0.3);
        const vib=Math.max(0,band)*(0.5+jf*1.4);
        const ph1=rnd()*6.28, ph2=rnd()*6.28;
        const l1=8+Math.floor(rnd()*6), l2=17+Math.floor(rnd()*9);
        const n=Math.max(90,Math.round(r*0.9)); let d='';
        for(let q=0;q<=n;q++){ const a=q/n*6.283;
          const w=Math.sin(a*l1+ph1)*0.6+Math.sin(a*l2+ph2)*0.4;
          const rr=r+w*step*vib;
          d+=(q?'L':'M')+(scx+Math.cos(a)*rr).toFixed(1)+' '+(scy+Math.sin(a)*rr).toFixed(1); }
        d+='Z';
        inner+='<path d="'+d+'" fill="none" stroke="'+p.ink+'" stroke-width="'+(p.stroke*0.8).toFixed(2)+'" stroke-linejoin="round"/>';
      }
      return { Tw, Th, inner };
    }
    if(m==='deffrag'){ const N=10, unit=Math.max(5,cell*0.22), Tw=unit*Math.floor(cell*N/unit), Th=Tw, rnd=this.rng(p.seed);
      const glyphs=[[[0,1],[1,0],[4,0],[4,1],[2,1],[2,2],[0,2]],[[0,1],[1,0],[6,0],[5,1]],[[0,0],[2,0],[2,2],[3,2],[4,3],[0,3]],[[0,0],[2.5,0],[0,2.5]],[[0,0],[3,0],[3,3],[2,3],[2,1],[0,1]],[[0,2],[2,0],[3,0],[3,1],[5,1],[5,2],[4,3],[1,3]],[[0,0],[4,0],[5,1],[3,1],[3,2],[1,2],[1,1],[0,1]],[[0,0],[5,0],[4,1],[1,1],[1,2],[0,2]],[[1,0],[3,0],[4,1],[4,2],[2,2],[2,3],[0,3],[0,1]],[[0,0],[2,0],[3,1],[5,1],[6,2],[3,2],[2,1],[0,1]],[[0,1],[1,0],[2,0],[2,2],[4,2],[4,3],[1,3],[0,2]],[[0,0],[3,0],[3,1],[5,1],[5,3],[4,3],[4,2],[0,2]],[[1,0],[4,0],[3,1],[5,3],[2,3],[3,2],[0,2]],[[0,0],[2,0],[4,2],[4,3],[2,3],[2,2],[0,2]],[[0,1],[2,0],[5,0],[3,1],[4,2],[1,2]]];
      // procedural shards: staircase random-walk polygons in the same 45° language
      const randShard=()=>{ const pts=[[0,0]]; let x=0,y=0; const steps=3+Math.floor(rnd()*4);
        for(let s2=0;s2<steps;s2++){ const dl=1+Math.floor(rnd()*3); const dir=Math.floor(rnd()*3); if(dir===0){x+=dl;} else if(dir===1){y+=dl;} else {x+=dl;y+=dl;} pts.push([x,y]); }
        pts.push([0,Math.max(...pts.map(q=>q[1]))]);
        return pts; };
      const gc=Math.floor(Tw/unit), gr=Math.floor(Th/unit), occ=new Uint8Array(gc*gr);
      const margin=Math.round((p.gap||0)/10), bigShare=0.3, fillMode=p.style==='fill';
      let inner='';
      for(let att=0; att<3200; att++){
        const g=rnd()<0.22? randShard() : glyphs[Math.floor(rnd()*glyphs.length)];
        const sx=rnd()<0.5?1:-1, sy=rnd()<0.5?1:-1, sc=rnd()<bigShare?1.25:1;
        const bw=Math.ceil(Math.max(...g.map(q=>q[0]))*sc), bh=Math.ceil(Math.max(...g.map(q=>q[1]))*sc);
        if(bw>=gc||bh>=gr) continue;
        const ci=Math.floor(rnd()*(gc-bw)), cj=Math.floor(rnd()*(gr-bh));
        let free=true;
        for(let j=cj-margin;j<=cj+bh+margin&&free;j++) for(let i=ci-margin;i<=ci+bw+margin&&free;i++){ if(i<0||j<0||i>=gc||j>=gr) continue; if(occ[j*gc+i]) free=false; }
        if(!free) continue;
        for(let j=cj;j<=cj+bh;j++) for(let i=ci;i<=ci+bw;i++) occ[j*gc+i]=1;
        const jmax=unit*0.4*((p.jitter||0)/100), jx=(rnd()*2-1)*jmax, jy=(rnd()*2-1)*jmax;
        const ox=ci*unit+(sx<0?bw*unit:0)+jx, oy=cj*unit+(sy<0?bh*unit:0)+jy;
        const d='M'+g.map(q=>(ox+q[0]*sc*unit*sx).toFixed(1)+' '+(oy+q[1]*sc*unit*sy).toFixed(1)).join('L')+'Z';
        inner+= fillMode? '<path d="'+d+'" fill="'+p.ink+'"/>' : '<path d="'+d+'" fill="none" stroke="'+p.ink+'" stroke-width="'+p.stroke+'" stroke-linejoin="round"/>';
      }
      return { Tw, Th, inner };
    }
    if(m==='defcamo'){ const N=10, unit=Math.max(5,cell*0.22), Tw=unit*Math.floor(cell*N/unit), Th=Tw, rnd=this.rng(p.seed);
      const glyphs=[[[0,1],[1,0],[4,0],[4,1],[2,1],[2,2],[0,2]],[[0,1],[1,0],[6,0],[5,1]],[[0,0],[2,0],[2,2],[3,2],[4,3],[0,3]],[[0,0],[2.5,0],[0,2.5]],[[0,0],[3,0],[3,3],[2,3],[2,1],[0,1]],[[0,2],[2,0],[3,0],[3,1],[5,1],[5,2],[4,3],[1,3]],[[0,0],[4,0],[5,1],[3,1],[3,2],[1,2],[1,1],[0,1]],[[0,0],[5,0],[4,1],[1,1],[1,2],[0,2]],[[1,0],[3,0],[4,1],[4,2],[2,2],[2,3],[0,3],[0,1]],[[0,0],[2,0],[3,1],[5,1],[6,2],[3,2],[2,1],[0,1]],[[0,1],[1,0],[2,0],[2,2],[4,2],[4,3],[1,3],[0,2]],[[0,0],[3,0],[3,1],[5,1],[5,3],[4,3],[4,2],[0,2]],[[1,0],[4,0],[3,1],[5,3],[2,3],[3,2],[0,2]],[[0,0],[2,0],[4,2],[4,3],[2,3],[2,2],[0,2]],[[0,1],[2,0],[5,0],[3,1],[4,2],[1,2]]];
      // camo blob centers (wrap-aware density via 3x3 image copies)
      const nB=Math.max(2,Math.round((6+Math.floor(rnd()*2))*((p.blotchQty==null?100:p.blotchQty)/100))), blobs=[];
      for(let att2=0; att2<200 && blobs.length<nB; att2++){ const bx=rnd()*Tw, by=rnd()*Th; let ok=true; for(const [ox,oy] of blobs){ let dx=Math.abs(bx-ox); dx=Math.min(dx,Tw-dx); let dy=Math.abs(by-oy); dy=Math.min(dy,Th-dy); if(Math.hypot(dx,dy)<Tw*0.3){ ok=false; break; } } if(ok) blobs.push([bx, by, Tw*(0.11+rnd()*0.05)]); }
      const den=(x,y)=>{ let v=0; for(const [bx,by,bs] of blobs){ for(let wx=-1;wx<=1;wx++) for(let wy=-1;wy<=1;wy++){ const dx=x-(bx+wx*Tw), dy=y-(by+wy*Th); v+=Math.exp(-(dx*dx+dy*dy)/(2*bs*bs)); } } return v; };
      const gc=Math.floor(Tw/unit), gr=Math.floor(Th/unit), occ=new Uint8Array(gc*gr);
      const fillMode=p.style==='fill';
      const jmaxG=unit*0.4*((p.jitter||0)/100);
      let inner='';
      for(let att=0; att<4200; att++){
        const g=glyphs[Math.floor(rnd()*glyphs.length)];
        const sx=rnd()<0.5?1:-1, sy=rnd()<0.5?1:-1, sc=rnd()<0.25?1.25:1;
        const bw=Math.ceil(Math.max(...g.map(q=>q[0]))*sc), bh=Math.ceil(Math.max(...g.map(q=>q[1]))*sc);
        if(bw>=gc||bh>=gr) continue;
        const ci=Math.floor(rnd()*(gc-bw)), cj=Math.floor(rnd()*(gr-bh));
        const cxm=(ci+bw/2)*unit, cym=(cj+bh/2)*unit;
        const v=den(cxm,cym);
        // camo gate: inside blobs almost always accepted, in between rarely
        if(rnd()>Math.min(1, v*0.95+0.18)) continue;
        // uniform 1-cell gap everywhere for consistent spacing
        const margin=1;
        let free=true;
        for(let j=cj-margin;j<=cj+bh+margin&&free;j++) for(let i=ci-margin;i<=ci+bw+margin&&free;i++){ if(i<0||j<0||i>=gc||j>=gr) continue; if(occ[j*gc+i]) free=false; }
        if(!free) continue;
        for(let j=cj;j<=cj+bh;j++) for(let i=ci;i<=ci+bw;i++) occ[j*gc+i]=1;
        const jx=(rnd()*2-1)*jmaxG, jy=(rnd()*2-1)*jmaxG;
        const ox=ci*unit+(sx<0?bw*unit:0)+jx, oy=cj*unit+(sy<0?bh*unit:0)+jy;
        const d='M'+g.map(q=>(ox+q[0]*sc*unit*sx).toFixed(1)+' '+(oy+q[1]*sc*unit*sy).toFixed(1)).join('L')+'Z';
        inner+= fillMode? '<path d="'+d+'" fill="'+p.ink+'"/>' : '<path d="'+d+'" fill="none" stroke="'+p.ink+'" stroke-width="'+p.stroke+'" stroke-linejoin="round"/>';
      }
      return { Tw, Th, inner };
    }
    if(m==='defcamo2'||m==='defcamo3'||m==='defcamo4'||m==='defcamo5'){
      const N=10, unit=Math.max(5,cell*0.22), Tw=unit*Math.floor(cell*N/unit), Th=Tw, rnd=this.rng(p.seed);
      const glyphs=[[[0,1],[1,0],[4,0],[4,1],[2,1],[2,2],[0,2]],[[0,1],[1,0],[6,0],[5,1]],[[0,0],[2,0],[2,2],[3,2],[4,3],[0,3]],[[0,0],[2.5,0],[0,2.5]],[[0,0],[3,0],[3,3],[2,3],[2,1],[0,1]],[[0,2],[2,0],[3,0],[3,1],[5,1],[5,2],[4,3],[1,3]],[[0,0],[4,0],[5,1],[3,1],[3,2],[1,2],[1,1],[0,1]],[[0,0],[5,0],[4,1],[1,1],[1,2],[0,2]],[[1,0],[3,0],[4,1],[4,2],[2,2],[2,3],[0,3],[0,1]],[[0,0],[2,0],[3,1],[5,1],[6,2],[3,2],[2,1],[0,1]],[[0,1],[1,0],[2,0],[2,2],[4,2],[4,3],[1,3],[0,2]],[[0,0],[3,0],[3,1],[5,1],[5,3],[4,3],[4,2],[0,2]],[[1,0],[4,0],[3,1],[5,3],[2,3],[3,2],[0,2]],[[0,0],[2,0],[4,2],[4,3],[2,3],[2,2],[0,2]],[[0,1],[2,0],[5,0],[3,1],[4,2],[1,2]]];
      const flow=(m==='defcamo2');
      const nB=Math.max(2,Math.round((6+Math.floor(rnd()*2))*((p.blotchQty==null?100:p.blotchQty)/100))), blobs=[];
      for(let att2=0; att2<200 && blobs.length<nB; att2++){ const bx=rnd()*Tw, by=rnd()*Th; let ok=true; for(const [ox,oy] of blobs){ let dx=Math.abs(bx-ox); dx=Math.min(dx,Tw-dx); let dy=Math.abs(by-oy); dy=Math.min(dy,Th-dy); if(Math.hypot(dx,dy)<Tw*0.3){ ok=false; break; } } if(ok) blobs.push([bx, by, Tw*(0.11+rnd()*0.05)]); }
      // diagonal stretch for flow variant
      const denRaw=(x,y)=>{ let v=0; for(const [bx,by,bs] of blobs){ for(let wx=-1;wx<=1;wx++) for(let wy=-1;wy<=1;wy++){ let dx=x-(bx+wx*Tw), dy=y-(by+wy*Th); if(flow){ const u=(dx+dy)*0.7071, w2=(dx-dy)*0.7071; dx=u*0.45; dy=w2*1.6; } v+=Math.exp(-(dx*dx+dy*dy)/(2*bs*bs)); } } return v; };
      // normalize to 0..1 over a coarse sample grid so thresholds mean what they say
      let dMax=0.0001, dMin=1e9;
      for(let sy2=0; sy2<24; sy2++) for(let sx2=0; sx2<24; sx2++){ const v=denRaw(sx2*Tw/24, sy2*Th/24); if(v>dMax) dMax=v; if(v<dMin) dMin=v; }
      const den=(x,y)=>{ const v=(denRaw(x,y)-dMin)/(dMax-dMin); return v<0?0:v>1?1:v; };
      const gc=Math.floor(Tw/unit), gr=Math.floor(Th/unit), occ=new Uint8Array(gc*gr);
      const fillMode=p.style==='fill';
      const jmaxG=unit*0.4*((p.jitter||0)/100);
      let inner='';
      let redPlaced=false, redBest=null;
      const shards=[];
      for(let att=0; att<4200; att++){
        const g=glyphs[Math.floor(rnd()*glyphs.length)];
        const sx=rnd()<0.5?1:-1, sy=rnd()<0.5?1:-1;
        // two-scale: big cores in dense zones, small at edges (flow variant); else default mix
        const ci0=Math.floor(rnd()*gc), cj0=Math.floor(rnd()*gr);
        const vProbe=den((ci0+1)*unit,(cj0+1)*unit);
        let sc;
        if(m==='defcamo2') sc = vProbe>0.6 ? (rnd()<0.5?1.5:1.25) : (vProbe>0.25? 1 : 0.75);
        else sc = rnd()<0.25?1.25:1;
        const bw=Math.ceil(Math.max(...g.map(q=>q[0]))*sc), bh=Math.ceil(Math.max(...g.map(q=>q[1]))*sc);
        if(bw>=gc||bh>=gr) continue;
        const ci=Math.min(ci0,gc-bw-1), cj=Math.min(cj0,gr-bh-1);
        const cxm=(ci+bw/2)*unit, cym=(cj+bh/2)*unit;
        const v=den(cxm,cym);
        if(m==='defcamo4'){ if(rnd()>0.95) continue; } // negative: near-full field
        else if(rnd()>Math.min(1, v*1.5+0.04)) continue;
        const margin=(m==='defcamo4')?0:(v>0.55?0:1);
        let free=true;
        for(let j=cj-margin;j<=cj+bh+margin&&free;j++) for(let i=ci-margin;i<=ci+bw+margin&&free;i++){ if(i<0||j<0||i>=gc||j>=gr) continue; if(occ[j*gc+i]) free=false; }
        if(!free) continue;
        // negative variant: blobs are VOIDS — skip shards inside blobs
        if(m==='defcamo4' && v>0.55) continue;
        for(let j=cj;j<=cj+bh;j++) for(let i=ci;i<=ci+bw;i++) occ[j*gc+i]=1;
        const jx=(rnd()*2-1)*jmaxG, jy=(rnd()*2-1)*jmaxG;
        const ox=ci*unit+(sx<0?bw*unit:0)+jx, oy=cj*unit+(sy<0?bh*unit:0)+jy;
        const d='M'+g.map(q=>(ox+q[0]*sc*unit*sx).toFixed(1)+' '+(oy+q[1]*sc*unit*sy).toFixed(1)).join('L')+'Z';
        shards.push({d, v, cxm, cym});
        if(m==='defcamo3' && !redBest && v>0.7 && cxm>Tw*0.3 && cxm<Tw*0.7 && cym>Th*0.3 && cym<Th*0.7){ redBest=shards.length-1; }
      }
      for(let si=0; si<shards.length; si++){
        const s2=shards[si];
        if(m==='defcamo3' && si===redBest){ inner+='<path d="'+s2.d+'" fill="#ec3013"/>'; continue; }
        if(m==='defcamo5'){
          // halo: solid inside blobs, outline-only at the fringe
          if(s2.v>0.5) inner+='<path d="'+s2.d+'" fill="'+p.ink+'"/>';
          else inner+='<path d="'+s2.d+'" fill="none" stroke="'+p.ink+'" stroke-width="'+p.stroke+'" stroke-linejoin="round"/>';
          continue;
        }
        inner+= fillMode? '<path d="'+s2.d+'" fill="'+p.ink+'"/>' : '<path d="'+s2.d+'" fill="none" stroke="'+p.ink+'" stroke-width="'+p.stroke+'" stroke-linejoin="round"/>';
      }
      return { Tw, Th, inner };
    }
    if(m==='defdigi'){
      // digital version: same camo-blob logic but rendered as quantized pixel blocks —
      // shards rasterized onto a coarse grid, merged into stepped 90° patches
      const N=10, px=Math.max(4,cell*0.16), Tw=px*Math.floor(cell*N/px), Th=Tw, rnd=this.rng(p.seed);
      const nB=Math.max(4,Math.round(15*((p.blotchQty==null?100:p.blotchQty)/100))), blobs=[];
      for(let b=0;b<nB;b++) blobs.push([rnd()*Tw, rnd()*Th, Tw*(0.07+rnd()*0.07)]);
      const denRaw=(x,y)=>{ let v=0; for(const [bx,by,bs] of blobs){ for(let wx=-1;wx<=1;wx++) for(let wy=-1;wy<=1;wy++){ const dx=x-(bx+wx*Tw), dy=y-(by+wy*Th); v+=Math.exp(-(dx*dx+dy*dy)/(2*bs*bs)); } } return v; };
      let dMax=0.0001, dMin=1e9;
      for(let sy2=0; sy2<24; sy2++) for(let sx2=0; sx2<24; sx2++){ const v=denRaw(sx2*Tw/24, sy2*Th/24); if(v>dMax) dMax=v; if(v<dMin) dMin=v; }
      const den=(x,y)=>{ const v=(denRaw(x,y)-dMin)/(dMax-dMin); return v<0?0:v>1?1:v; };
      const gc=Math.floor(Tw/px), gr=Math.floor(Th/px);
      const on=new Uint8Array(gc*gr);
      const jf=1-((p.jitter||0)/100)*0.5; // jitter loosens the dither threshold
      for(let j=0;j<gr;j++) for(let i=0;i<gc;i++){
        const v=den((i+0.5)*px,(j+0.5)*px);
        const th=0.3*jf;
        if(v>th && rnd()<Math.min(1,(v-th)*3.2+0.05)) on[j*gc+i]=1;
      }
      // despeckle: drop isolated single pixels, fill single holes inside solids (wrap-aware)
      const at=(i,j)=>on[((j+gr)%gr)*gc+((i+gc)%gc)];
      const on2=new Uint8Array(on);
      for(let j=0;j<gr;j++) for(let i=0;i<gc;i++){
        const nsum=at(i-1,j)+at(i+1,j)+at(i,j-1)+at(i,j+1);
        if(on[j*gc+i]&&nsum===0) on2[j*gc+i]=0;
        if(!on[j*gc+i]&&nsum===4) on2[j*gc+i]=1;
      }
      // trace stepped outlines: boundary-follow each patch (non-wrap grid edges act as off)
      const A=(i,j)=>(i<0||j<0||i>=gc||j>=gr)?0:on2[j*gc+i];
      // horizontal boundary edges: between cell (i,j-1) above and (i,j) below
      const hEdge=new Uint8Array((gr+1)*gc), vEdge=new Uint8Array(gr*(gc+1));
      for(let j=0;j<=gr;j++) for(let i=0;i<gc;i++){ if(A(i,j)!==A(i,j-1)) hEdge[j*gc+i]=1; }
      for(let j=0;j<gr;j++) for(let i=0;i<=gc;i++){ if(A(i,j)!==A(i-1,j)) vEdge[j*(gc+1)+i]=1; }
      let inner='';
      // walk boundaries: start at any unused h-edge, follow right-hand rule around the filled region
      const usedH=new Uint8Array(hEdge.length), usedV=new Uint8Array(vEdge.length);
      for(let j0=0;j0<=gr;j0++) for(let i0=0;i0<gc;i0++){
        if(!hEdge[j0*gc+i0]||usedH[j0*gc+i0]) continue;
        // determine initial direction: fill below => go right along top; fill above => go left along bottom
        let d='', x=i0, y=j0, dir;
        dir = A(i0,j0)? 0 : 2; // 0=right,1=down,2=left,3=up
        const sx0=x, sy0=y, sd0=dir;
        d='M'+(x*px).toFixed(1)+' '+(y*px).toFixed(1);
        let guard=0;
        do{
          if(dir===0){ usedH[y*gc+x]=1; x++; }
          else if(dir===2){ x--; usedH[y*gc+x]=1; }
          else if(dir===1){ usedV[y*(gc+1)+x]=1; y++; }
          else { y--; usedV[y*(gc+1)+x]=1; }
          d+='L'+(x*px).toFixed(1)+' '+(y*px).toFixed(1);
          // choose next dir, right-hand rule keeping fill on the right of travel
          const cand = dir===0? [1,0,3] : dir===1? [2,1,0] : dir===2? [3,2,1] : [0,3,2];
          let picked=-1;
          for(const nd of cand){
            if(nd===0&&x<gc&&hEdge[y*gc+x]&&!usedH[y*gc+x]&&(A(x,y)!==A(x,y-1))){picked=nd;break;}
            if(nd===2&&x>0&&hEdge[y*gc+(x-1)]&&!usedH[y*gc+(x-1)]){picked=nd;break;}
            if(nd===1&&y<gr&&vEdge[y*(gc+1)+x]&&!usedV[y*(gc+1)+x]){picked=nd;break;}
            if(nd===3&&y>0&&vEdge[(y-1)*(gc+1)+x]&&!usedV[(y-1)*(gc+1)+x]){picked=nd;break;}
          }
          if(picked===-1) break;
          dir=picked;
        } while(!(x===sx0&&y===sy0)&&++guard<20000);
        d+='Z';
        inner+='<path d="'+d+'" fill="'+p.ink+'" fill-rule="evenodd"/>';
      }
      return { Tw, Th, inner };
    }
    if(m==='trihalf'){
      // like the reference: solid triangular mesh in the dark wave bands (triangles touching,
      // leaving white counter-triangles), dissolving to tiny randomly-rotated triangles in the light zones,
      // over a gently warped grid
      const unit=Math.max(9,cell*0.24+(p.gap||18)*0.25), gc2=Math.floor(cell*12/unit), gr2=Math.floor(cell*12/(unit*0.866))&~1;
      const Tw=gc2*unit, Th=gr2*(unit*0.866), rnd=this.rng(p.seed);
      const jf=(p.jitter||0)/100;
      // smooth seamless blob field (no wave bands): a few dark spots per tile
      const nB2=3+Math.floor(rnd()*2), spots=[];
      for(let b=0;b<nB2;b++) spots.push([rnd()*Tw, rnd()*Th, Tw*(0.16+rnd()*0.1)]);
      const den=(x,y)=>{ let v=0;
        for(const sp of spots){ for(let wx=-1;wx<=1;wx++) for(let wy=-1;wy<=1;wy++){ const dx=x-(sp[0]+wx*Tw), dy=y-(sp[1]+wy*Th); v+=Math.exp(-(dx*dx+dy*dy)/(2*sp[2]*sp[2])); } } return Math.min(1, Math.pow(v,1.2)); };
      const warp=(x,y)=>[x,y]; // straight grid, no wave
      let inner='';
      for(let j=0;j<gr2;j++) for(let i=0;i<gc2;i++){
        for(let up=0;up<2;up++){
          const gx=(i+(j%2?0.5:0)+(up?0.5:0))*unit, gy=(j+0.5)*(unit*0.866);
          const [cx3,cy3]=warp(gx,gy);
          let v=den(gx,gy)+(rnd()-0.5)*0.14*(1+jf);
          if(v<0.1) continue;
          v=Math.min(1,v);
          const dir=up?1:-1;
          const oxs=[0]; if(cx3<unit*1.5) oxs.push(Tw); if(cx3>Tw-unit*1.5) oxs.push(-Tw);
          const oys=[0]; if(cy3<unit*1.5) oys.push(Th); if(cy3>Th-unit*1.5) oys.push(-Th);
          let dBase='';
          if(v>0.55){
            const s2=(0.55+(v-0.55))*unit*0.5*Math.min(1,v*1.15);
            const h=s2*0.866*2;
            for(const ox2 of oxs) for(const oy2 of oys){ const X=cx3+ox2, Y=cy3+oy2;
              inner+='<path d="M'+(X-s2).toFixed(1)+' '+(Y+dir*h/2).toFixed(1)+'L'+(X+s2).toFixed(1)+' '+(Y+dir*h/2).toFixed(1)+'L'+X.toFixed(1)+' '+(Y-dir*h/2).toFixed(1)+'Z" fill="'+p.ink+'"/>'; }
          } else {
            const s2=Math.max(unit*0.09, v*unit*0.34);
            const a0=rnd()*6.283;
            for(const ox2 of oxs) for(const oy2 of oys){ const X=cx3+ox2, Y=cy3+oy2;
              let d='';
              for(let k=0;k<3;k++){ const a=a0+k*2.094; d+=(k?'L':'M')+(X+Math.cos(a)*s2).toFixed(1)+' '+(Y+Math.sin(a)*s2).toFixed(1); }
              inner+='<path d="'+d+'Z" fill="'+p.ink+'"/>'; }
          }
        }
      }
      return { Tw, Th, inner };
    }
    if(m==='orgweb'){
      // organic voronoi web: black ligament network with rounded white cells (evenodd holes)
      const Tw=cell*12, Th=cell*12, rnd=this.rng(p.seed);
      const nS=26+Math.floor(rnd()*6), seeds=[];
      for(let att=0; att<400 && seeds.length<nS; att++){ const x=rnd()*Tw, y=rnd()*Th; let ok=true;
        for(const s2 of seeds){ let dx=Math.abs(x-s2[0]); dx=Math.min(dx,Tw-dx); let dy=Math.abs(y-s2[1]); dy=Math.min(dy,Th-dy); if(dx*dx+dy*dy<(Tw*0.11)*(Tw*0.11)){ ok=false; break; } }
        if(ok) seeds.push([x,y]); }
      // 3x3 wrapped copies for seamless cells
      const all=[]; for(const [x,y] of seeds) for(let wx=-1;wx<=1;wx++) for(let wy=-1;wy<=1;wy++) all.push([x+wx*Tw,y+wy*Th]);
      const inset=Math.max(3,(p.gap||18)*0.35)*(1+((p.jitter||0)/100)*0.6);
      let inner='<path fill-rule="evenodd" fill="'+p.ink+'" d="M0 0H'+Tw+'V'+Th+'H0Z';
      for(const [sx2,sy2] of seeds){
        // build voronoi cell by half-plane clipping
        let poly=[[sx2-Tw*0.5,sy2-Th*0.5],[sx2+Tw*0.5,sy2-Th*0.5],[sx2+Tw*0.5,sy2+Th*0.5],[sx2-Tw*0.5,sy2+Th*0.5]];
        for(const [ox,oy] of all){
          if(ox===sx2&&oy===sy2) continue;
          const mx=(sx2+ox)/2, my2=(sy2+oy)/2, nx=ox-sx2, ny=oy-sy2;
          const out=[];
          for(let i=0;i<poly.length;i++){
            const a=poly[i], b=poly[(i+1)%poly.length];
            const fa=(a[0]-mx)*nx+(a[1]-my2)*ny, fb=(b[0]-mx)*nx+(b[1]-my2)*ny;
            if(fa<=0) out.push(a);
            if((fa<0)!==(fb<0)){ const t=fa/(fa-fb); out.push([a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t]); }
          }
          poly=out; if(poly.length<3) break;
        }
        if(poly.length<3) continue;
        // inset each vertex along bisector-ish: move toward centroid by fixed distance
        const cx3=poly.reduce((s2,q)=>s2+q[0],0)/poly.length, cy3=poly.reduce((s2,q)=>s2+q[1],0)/poly.length;
        const shr=poly.map(q=>{ const dx=cx3-q[0], dy=cy3-q[1], L=Math.hypot(dx,dy)||1; const k=Math.min(0.42, inset*1.6/L); return [q[0]+dx*k, q[1]+dy*k]; });
        // rounded cell: quadratic through edge midpoints
        const n=shr.length;
        // bbox to skip copies that don't touch the tile
        const xs2=shr.map(q=>q[0]), ys2=shr.map(q=>q[1]);
        const bx0=Math.min(...xs2), bx1=Math.max(...xs2), by0=Math.min(...ys2), by1=Math.max(...ys2);
        for(let wx=-1;wx<=1;wx++) for(let wy=-1;wy<=1;wy++){
          if(bx1+wx*Tw<0||bx0+wx*Tw>Tw||by1+wy*Th<0||by0+wy*Th>Th) continue;
          // catmull-rom through edge midpoints => everywhere-smooth closed curve, zero corners
          const mids=[]; for(let i=0;i<n;i++){ mids.push([(shr[i][0]+shr[(i+1)%n][0])/2+wx*Tw,(shr[i][1]+shr[(i+1)%n][1])/2+wy*Th]); }
          let d='M'+mids[0][0].toFixed(1)+' '+mids[0][1].toFixed(1);
          for(let i=0;i<n;i++){
            const p0=mids[(i-1+n)%n], p1=mids[i], p2=mids[(i+1)%n], p3=mids[(i+2)%n];
            const c1x=p1[0]+(p2[0]-p0[0])/6, c1y=p1[1]+(p2[1]-p0[1])/6;
            const c2x=p2[0]-(p3[0]-p1[0])/6, c2y=p2[1]-(p3[1]-p1[1])/6;
            d+='C'+c1x.toFixed(1)+' '+c1y.toFixed(1)+' '+c2x.toFixed(1)+' '+c2y.toFixed(1)+' '+p2[0].toFixed(1)+' '+p2[1].toFixed(1);
          }
          inner+=d+'Z';
        }
      }
      inner+='"/>';
      return { Tw, Th, inner };
    }
    if(m==='tricamo'){
      // triangle halftone driven by DIGITAL camo patches: blocky random-walk zones on a coarse grid
      // set the triangle size — full touching mesh in heavy patches, mid mesh, tiny rotated strays outside
      const unit=Math.max(9,cell*0.24+(p.gap||18)*0.25), gc2=Math.floor(cell*12/unit), gr2=Math.floor(cell*12/(unit*0.866))&~1;
      const Tw=gc2*unit, Th=gr2*(unit*0.866), rnd=this.rng(p.seed);
      const jf=(p.jitter||0)/100;
      // coarse digital patch grid (wrap-aware walks)
      const pc=Math.max(6,Math.round(Tw/(unit*3.2))), pr=pc;
      const patch=new Uint8Array(pc*pr);
      const nW=10+Math.floor(rnd()*4);
      for(let w2=0;w2<nW;w2++){
        let x2=Math.floor(rnd()*pc), y2=Math.floor(rnd()*pr);
        const wgt=1+(w2%3), steps2=14+Math.floor(rnd()*12);
        for(let s3=0;s3<steps2;s3++){
          patch[((y2+pr)%pr)*pc+((x2+pc)%pc)]=wgt;
          if(rnd()<0.5) x2+=rnd()<0.5?1:-1; else y2+=rnd()<0.5?1:-1;
        }
      }
      const lvl=(x,y)=>patch[Math.floor(((y/Th)%1+1)%1*pr)*pc+Math.floor(((x/Tw)%1+1)%1*pc)];
      let inner='';
      for(let j=0;j<gr2;j++) for(let i=0;i<gc2;i++){
        for(let up=0;up<2;up++){
          const cx3=(i+(j%2?0.5:0)+(up?0.5:0))*unit, cy3=(j+0.5)*(unit*0.866);
          const L=lvl(cx3,cy3);
          const dir=up?1:-1;
          if(L===3){
            const s2=unit*0.4, h=s2*0.866*2;
            inner+='<path d="M'+(cx3-s2).toFixed(1)+' '+(cy3+dir*h/2).toFixed(1)+'L'+(cx3+s2).toFixed(1)+' '+(cy3+dir*h/2).toFixed(1)+'L'+cx3.toFixed(1)+' '+(cy3-dir*h/2).toFixed(1)+'Z" fill="'+p.ink+'"/>';
          } else if(L===2){
            const s2=unit*0.27, h=s2*0.866*2;
            inner+='<path d="M'+(cx3-s2).toFixed(1)+' '+(cy3+dir*h/2).toFixed(1)+'L'+(cx3+s2).toFixed(1)+' '+(cy3+dir*h/2).toFixed(1)+'L'+cx3.toFixed(1)+' '+(cy3-dir*h/2).toFixed(1)+'Z" fill="'+p.ink+'"/>';
          } else if(L===1){
            const s2=unit*0.15, h=s2*0.866*2;
            inner+='<path d="M'+(cx3-s2).toFixed(1)+' '+(cy3+dir*h/2).toFixed(1)+'L'+(cx3+s2).toFixed(1)+' '+(cy3+dir*h/2).toFixed(1)+'L'+cx3.toFixed(1)+' '+(cy3-dir*h/2).toFixed(1)+'Z" fill="'+p.ink+'"/>';
          } else {
            // outside patches: sparse tiny rotated strays
            if(rnd()>0.1*(1+jf)) continue;
            const s2=unit*0.12, a0=rnd()*6.283;
            let d='';
            for(let k=0;k<3;k++){ const a=a0+k*2.094; d+=(k?'L':'M')+(cx3+Math.cos(a)*s2).toFixed(1)+' '+(cy3+Math.sin(a)*s2).toFixed(1); }
            inner+='<path d="'+d+'Z" fill="'+p.ink+'"/>';
          }
        }
      }
      return { Tw, Th, inner };
    }
    if(m==='tricamo2'||m==='tricamo3'||m==='tricamo4'){
      const unit=Math.max(9,cell*0.24+(p.gap||18)*0.25), gc2=Math.floor(cell*12/unit), gr2=Math.floor(cell*12/(unit*0.866))&~1;
      const Tw=gc2*unit, Th=gr2*(unit*0.866), rnd=this.rng(p.seed);
      const jf=(p.jitter||0)/100;
      const pc=Math.max(6,Math.round(Tw/(unit*3.2))), pr=pc;
      const patch=new Uint8Array(pc*pr);
      const nW=10+Math.floor(rnd()*4);
      const diag=(m==='tricamo4');
      for(let w2=0;w2<nW;w2++){
        let x2=Math.floor(rnd()*pc), y2=Math.floor(rnd()*pr);
        const wgt=1+(w2%3), steps2=14+Math.floor(rnd()*12);
        for(let s3=0;s3<steps2;s3++){
          patch[((y2+pr)%pr)*pc+((x2+pc)%pc)]=wgt;
          if(diag){ // drift: walks biased along one diagonal, patches streak
            if(rnd()<0.72){ x2+=1; y2+=1; } else if(rnd()<0.5) x2+=rnd()<0.5?1:-1; else y2+=rnd()<0.5?1:-1;
          } else {
            if(rnd()<0.5) x2+=rnd()<0.5?1:-1; else y2+=rnd()<0.5?1:-1;
          }
        }
      }
      const lvl=(x,y)=>patch[Math.floor(((y/Th)%1+1)%1*pr)*pc+Math.floor(((x/Tw)%1+1)%1*pc)];
      let inner='';
      const tri=(X,Y,s2,dir,fill)=>{
        const h=s2*0.866*2;
        const d='M'+(X-s2).toFixed(1)+' '+(Y+dir*h/2).toFixed(1)+'L'+(X+s2).toFixed(1)+' '+(Y+dir*h/2).toFixed(1)+'L'+X.toFixed(1)+' '+(Y-dir*h/2).toFixed(1)+'Z';
        return fill? '<path d="'+d+'" fill="'+p.ink+'"/>' : '<path d="'+d+'" fill="none" stroke="'+p.ink+'" stroke-width="'+p.stroke+'" stroke-linejoin="round"/>';
      };
      const triRot=(X,Y,s2,a0,fill)=>{
        let d='';
        for(let k=0;k<3;k++){ const a=a0+k*2.094; d+=(k?'L':'M')+(X+Math.cos(a)*s2).toFixed(1)+' '+(Y+Math.sin(a)*s2).toFixed(1); }
        return fill? '<path d="'+d+'Z" fill="'+p.ink+'"/>' : '<path d="'+d+'Z" fill="none" stroke="'+p.ink+'" stroke-width="'+p.stroke+'" stroke-linejoin="round"/>';
      };
      for(let j=0;j<gr2;j++) for(let i=0;i<gc2;i++){
        for(let up=0;up<2;up++){
          const cx3=(i+(j%2?0.5:0)+(up?0.5:0))*unit, cy3=(j+0.5)*(unit*0.866);
          const L=lvl(cx3,cy3);
          const dir=up?1:-1;
          if(m==='tricamo2'){
            // mixed orientation: heavy patches aligned mesh, mid patches rotated 30°, light patches rotated random
            if(L===3) inner+=tri(cx3,cy3,unit*0.46,dir,true);
            else if(L===2) inner+=triRot(cx3,cy3,unit*0.26,(dir>0?0.524:-0.524)+0.524,true);
            else if(L===1) inner+=triRot(cx3,cy3,unit*0.16,rnd()*6.283,true);
            else if(rnd()<0.1*(1+jf)) inner+=triRot(cx3,cy3,unit*0.11,rnd()*6.283,true);
          } else if(m==='tricamo3'){
            // outline mix: heavy solid, mid outline, light tiny solid — three tones from one color
            if(L===3) inner+=tri(cx3,cy3,unit*0.46,dir,true);
            else if(L===2) inner+=tri(cx3,cy3,unit*0.34,dir,false);
            else if(L===1) inner+=tri(cx3,cy3,unit*0.16,dir,true);
            else if(rnd()<0.08*(1+jf)) inner+=tri(cx3,cy3,unit*0.12,dir,false);
          } else {
            // diagonal drift: same tones as base, streaked patches — equal gap at every weight
            if(L===3) inner+=tri(cx3,cy3,unit*0.4,dir,true);
            else if(L===2) inner+=tri(cx3,cy3,unit*0.3,dir,true);
            else if(L===1) inner+=tri(cx3,cy3,unit*0.21,dir,true);
            else if(rnd()<0.1*(1+jf)) inner+=triRot(cx3,cy3,unit*0.15,rnd()*6.283,true);
          }
        }
      }
      return { Tw, Th, inner };
    }
    if(m==='tridis'){
      // dissolved: solid mesh patches whose edges crumble — triangles at a patch fringe
      // shrink, rotate loose, and scatter with position jitter, like the camo is eroding
      const unit=Math.max(9,cell*0.24+(p.gap||18)*0.25), gc2=Math.floor(cell*12/unit), gr2=Math.floor(cell*12/(unit*0.866))&~1;
      const Tw=gc2*unit, Th=gr2*(unit*0.866), rnd=this.rng(p.seed);
      const jf=(p.jitter||0)/100;
      const pc=Math.max(6,Math.round(Tw/(unit*3.2))), pr=pc;
      const patch=new Uint8Array(pc*pr);
      const nW=9+Math.floor(rnd()*4);
      for(let w2=0;w2<nW;w2++){
        let x2=Math.floor(rnd()*pc), y2=Math.floor(rnd()*pr);
        const steps2=16+Math.floor(rnd()*12);
        for(let s3=0;s3<steps2;s3++){
          patch[((y2+pr)%pr)*pc+((x2+pc)%pc)]=1;
          if(rnd()<0.5) x2+=rnd()<0.5?1:-1; else y2+=rnd()<0.5?1:-1;
        }
      }
      const at2=(i,j)=>patch[((j+pr)%pr)*pc+((i+pc)%pc)];
      // distance-to-edge (in patch cells, 0..2+) via neighbor erosion rings
      const distIn=(x,y)=>{
        const pi=Math.floor(((x/Tw)%1+1)%1*pc), pj=Math.floor(((y/Th)%1+1)%1*pr);
        if(!at2(pi,pj)) return -1; // outside
        let ring=2;
        for(let r2=1;r2<=2;r2++){
          for(let dj=-r2;dj<=r2&&ring>=r2;dj++) for(let di=-r2;di<=r2;di++){
            if(Math.max(Math.abs(di),Math.abs(dj))!==r2) continue;
            if(!at2(pi+di,pj+dj)){ ring=r2-1; break; }
          }
        }
        return ring; // 0=fringe cell, 1=one in, 2=core
      };
      let inner='';
      for(let j=0;j<gr2;j++) for(let i=0;i<gc2;i++){
        for(let up=0;up<2;up++){
          const gx=(i+(j%2?0.5:0)+(up?0.5:0))*unit, gy=(j+0.5)*(unit*0.866);
          const dIn=distIn(gx,gy);
          const dir=up?1:-1;
          if(dIn>=2){
            // core: intact touching-ish mesh
            const s2=unit*0.46, h=s2*0.866*2;
            inner+='<path d="M'+(gx-s2).toFixed(1)+' '+(gy+dir*h/2).toFixed(1)+'L'+(gx+s2).toFixed(1)+' '+(gy+dir*h/2).toFixed(1)+'L'+gx.toFixed(1)+' '+(gy-dir*h/2).toFixed(1)+'Z" fill="'+p.ink+'"/>';
          } else if(dIn===1){
            // inner fringe: slight shrink + small rotation + tiny drift
            if(rnd()<0.12) continue;
            const s2=unit*(0.28+rnd()*0.08), h2=s2*0.866*2;
            const X=gx+(rnd()-0.5)*unit*0.2, Y=gy+(rnd()-0.5)*unit*0.2;
            inner+='<path d="M'+(X-s2).toFixed(1)+' '+(Y+dir*h2/2).toFixed(1)+'L'+(X+s2).toFixed(1)+' '+(Y+dir*h2/2).toFixed(1)+'L'+X.toFixed(1)+' '+(Y-dir*h2/2).toFixed(1)+'Z" fill="'+p.ink+'"/>';
          } else if(dIn===0){
            // outer fringe: crumbling — many dropped, survivors small, spun and drifting outward
            if(rnd()<0.45) continue;
            const s2=unit*(0.11+rnd()*0.09), h2=s2*0.866*2;
            const drift=unit*(0.3+rnd()*0.7)*(1+jf);
            const da=rnd()*6.283;
            const X=(((gx+Math.cos(da)*drift)%Tw)+Tw)%Tw, Y=(((gy+Math.sin(da)*drift)%Th)+Th)%Th;
            inner+='<path d="M'+(X-s2).toFixed(1)+' '+(Y+dir*h2/2).toFixed(1)+'L'+(X+s2).toFixed(1)+' '+(Y+dir*h2/2).toFixed(1)+'L'+X.toFixed(1)+' '+(Y-dir*h2/2).toFixed(1)+'Z" fill="'+p.ink+'"/>';
          } else {
            // open field: rare dust
            if(rnd()>0.045*(1+jf)) continue;
            const s2=unit*(0.07+rnd()*0.05), h2=s2*0.866*2;
            inner+='<path d="M'+(gx-s2).toFixed(1)+' '+(gy+dir*h2/2).toFixed(1)+'L'+(gx+s2).toFixed(1)+' '+(gy+dir*h2/2).toFixed(1)+'L'+gx.toFixed(1)+' '+(gy-dir*h2/2).toFixed(1)+'Z" fill="'+p.ink+'"/>';
          }
        }
      }
      return { Tw, Th, inner };
    }
    if(m==='tritopo'){
      // advanced topo: ridged multi-peak terrain (peaks + a ridge chain), quantized contour bands,
      // crisp contour rings at level edges, clean valley floor, full-weight summit
      const unit=Math.max(9,cell*0.24+(p.gap||18)*0.25), gc2=Math.floor(cell*12/unit), gr2=Math.floor(cell*12/(unit*0.866))&~1;
      const Tw=gc2*unit, Th=gr2*(unit*0.866), rnd=this.rng(p.seed);
      const jf=(p.jitter||0)/100;
      const nP=3+Math.floor(rnd()*2), peaks=[];
      for(let b=0;b<nP;b++) peaks.push([rnd()*Tw, rnd()*Th, Tw*(0.12+rnd()*0.08), 0.55+rnd()*0.45]);
      const ra=rnd()*6.283, rx0=rnd()*Tw, ry0=rnd()*Th;
      for(let k2=0;k2<7;k2++) peaks.push([rx0+Math.cos(ra)*k2*Tw*0.12, ry0+Math.sin(ra)*k2*Th*0.12, Tw*0.055, 0.5]);
      const hgt=(x,y)=>{ let v=0;
        for(const [bx,by,bs,bw] of peaks){ for(let wx=-1;wx<=1;wx++) for(let wy=-1;wy<=1;wy++){ const dx=x-(((bx%Tw)+Tw)%Tw+wx*Tw), dy=y-(((by%Th)+Th)%Th+wy*Th); v+=bw*Math.exp(-(dx*dx+dy*dy)/(2*bs*bs)); } }
        return Math.min(1, Math.pow(v,1.1)); };
      const LEVELS=10;
      const lvlOf=v=>{ let L=Math.floor(v*LEVELS); return L>=LEVELS?LEVELS-1:L; };
      let inner='';
      for(let j=0;j<gr2;j++) for(let i=0;i<gc2;i++){
        for(let up=0;up<2;up++){
          const cx3=(i+(j%2?0.5:0)+(up?0.5:0))*unit, cy3=(j+0.5)*(unit*0.866);
          const v=hgt(cx3,cy3);
          let L=lvlOf(v);
          const nbrs=[[unit,0],[-unit,0],[0,unit*0.866],[0,-unit*0.866]];
          let edge=false;
          for(const [dx,dy] of nbrs){ if(lvlOf(hgt(cx3+dx,cy3+dy))<L){ edge=true; break; } }
          const dir=up?1:-1;
          // topo-map read: triangles trace the CONTOUR LINES only
          let s2=0;
          if(edge && L>0){
            // heavier index contour every 3rd level, like a real map
            s2=unit*((L%3===0)?0.4:0.26);
          } else if(L===LEVELS-1){
            s2=unit*0.4; // summit cap solid
          } else {
            if(rnd()>0.02*(1+jf)) continue; // open slopes: rare dust
            s2=unit*0.09;
          }
          const h=s2*0.866*2;
          inner+='<path d="M'+(cx3-s2).toFixed(1)+' '+(cy3+dir*h/2).toFixed(1)+'L'+(cx3+s2).toFixed(1)+' '+(cy3+dir*h/2).toFixed(1)+'L'+cx3.toFixed(1)+' '+(cy3-dir*h/2).toFixed(1)+'Z" fill="'+p.ink+'"/>';
        }
      }
      return { Tw, Th, inner };
    }
    if(m==='geoblocks'){
      // Bauhaus geometric grid: each cell gets a circle / semicircle / quarter-round / drop;
      // some pills span 2 cells. Single-ink, gap-inset for clean vinyl weeding.
      const n=6, u=cell*2, Tw=n*u, Th=n*u, rnd=this.rng(p.seed);
      const g=Math.max(2,(p.gap||18)*0.18), jf=(p.jitter||0)/100;
      const occ=new Uint8Array(n*n);
      const F=v=>v.toFixed(1);
      let inner='';
      const circle2=(cx,cy,r)=>'<circle cx="'+F(cx)+'" cy="'+F(cy)+'" r="'+F(r)+'" fill="'+p.ink+'"/>';
      // half-disc: dir 0=flat bottom(dome up),1=flat top,2=flat right,3=flat left
      const semi=(x,y,s,dir)=>{ const r=s/2, cx=x+r, cy=y+r;
        if(dir===0) return '<path d="M'+F(x)+' '+F(y+s)+'A'+F(r)+' '+F(r)+' 0 0 1 '+F(x+s)+' '+F(y+s)+'Z" fill="'+p.ink+'"/>';
        if(dir===1) return '<path d="M'+F(x+s)+' '+F(y)+'A'+F(r)+' '+F(r)+' 0 0 1 '+F(x)+' '+F(y)+'Z" fill="'+p.ink+'"/>';
        if(dir===2) return '<path d="M'+F(x+s)+' '+F(y)+'L'+F(x+s)+' '+F(y+s)+'A'+F(r)+' '+F(r)+' 0 0 1 '+F(x+s)+' '+F(y)+'Z" fill="'+p.ink+'"/>';
        return '<path d="M'+F(x)+' '+F(y+s)+'L'+F(x)+' '+F(y)+'A'+F(r)+' '+F(r)+' 0 0 1 '+F(x)+' '+F(y+s)+'Z" fill="'+p.ink+'"/>'; };
      // quarter disc anchored in corner c: 0=TL,1=TR,2=BR,3=BL
      const quarter=(x,y,s,c)=>{
        if(c===0) return '<path d="M'+F(x)+' '+F(y)+'L'+F(x+s)+' '+F(y)+'A'+F(s)+' '+F(s)+' 0 0 1 '+F(x)+' '+F(y+s)+'Z" fill="'+p.ink+'"/>';
        if(c===1) return '<path d="M'+F(x+s)+' '+F(y)+'L'+F(x+s)+' '+F(y+s)+'A'+F(s)+' '+F(s)+' 0 0 1 '+F(x)+' '+F(y)+'Z" fill="'+p.ink+'"/>';
        if(c===2) return '<path d="M'+F(x+s)+' '+F(y+s)+'L'+F(x)+' '+F(y+s)+'A'+F(s)+' '+F(s)+' 0 0 1 '+F(x+s)+' '+F(y)+'Z" fill="'+p.ink+'"/>';
        return '<path d="M'+F(x)+' '+F(y+s)+'L'+F(x)+' '+F(y)+'A'+F(s)+' '+F(s)+' 0 0 1 '+F(x+s)+' '+F(y+s)+'Z" fill="'+p.ink+'"/>'; };
      // drop: circle with one squared corner c
      const drop=(x,y,s,c)=>{ const r=s/2;
        if(c===0) return '<path d="M'+F(x)+' '+F(y)+'L'+F(x+s-r)+' '+F(y)+'A'+F(r)+' '+F(r)+' 0 0 1 '+F(x+s)+' '+F(y+r)+'L'+F(x+s)+' '+F(y+s-r)+'A'+F(r)+' '+F(r)+' 0 0 1 '+F(x+s-r)+' '+F(y+s)+'L'+F(x+r)+' '+F(y+s)+'A'+F(r)+' '+F(r)+' 0 0 1 '+F(x)+' '+F(y+s-r)+'Z" fill="'+p.ink+'"/>';
        if(c===1) return '<path d="M'+F(x+s)+' '+F(y)+'L'+F(x+s)+' '+F(y+s-r)+'A'+F(r)+' '+F(r)+' 0 0 1 '+F(x+s-r)+' '+F(y+s)+'L'+F(x+r)+' '+F(y+s)+'A'+F(r)+' '+F(r)+' 0 0 1 '+F(x)+' '+F(y+s-r)+'L'+F(x)+' '+F(y+r)+'A'+F(r)+' '+F(r)+' 0 0 1 '+F(x+r)+' '+F(y)+'Z" fill="'+p.ink+'"/>';
        if(c===2) return '<path d="M'+F(x+s)+' '+F(y+s)+'L'+F(x+r)+' '+F(y+s)+'A'+F(r)+' '+F(r)+' 0 0 1 '+F(x)+' '+F(y+s-r)+'L'+F(x)+' '+F(y+r)+'A'+F(r)+' '+F(r)+' 0 0 1 '+F(x+r)+' '+F(y)+'L'+F(x+s-r)+' '+F(y)+'A'+F(r)+' '+F(r)+' 0 0 1 '+F(x+s)+' '+F(y+r)+'Z" fill="'+p.ink+'"/>';
        return '<path d="M'+F(x)+' '+F(y+s)+'L'+F(x)+' '+F(y+r)+'A'+F(r)+' '+F(r)+' 0 0 1 '+F(x+r)+' '+F(y)+'L'+F(x+s-r)+' '+F(y)+'A'+F(r)+' '+F(r)+' 0 0 1 '+F(x+s)+' '+F(y+r)+'L'+F(x+s)+' '+F(y+s-r)+'A'+F(r)+' '+F(r)+' 0 0 1 '+F(x+s-r)+' '+F(y+s)+'Z" fill="'+p.ink+'"/>'; };
      const pill=(x,y,w,h)=>{ const r=Math.min(w,h)/2;
        return '<rect x="'+F(x)+'" y="'+F(y)+'" width="'+F(w)+'" height="'+F(h)+'" rx="'+F(r)+'" fill="'+p.ink+'"/>'; };
      for(let j=0;j<n;j++) for(let i=0;i<n;i++){
        if(occ[j*n+i]) continue;
        const x=i*u+g, y=j*u+g, s=u-2*g;
        // 2-cell pill (never wrapping the tile edge)
        if(rnd()<0.16 && i<n-1 && !occ[j*n+i+1]){ occ[j*n+i+1]=1; inner+=pill(x,y,u*2-2*g,s); continue; }
        if(rnd()<0.12 && j<n-1 && !occ[(j+1)*n+i]){ occ[(j+1)*n+i]=1; inner+=pill(x,y,s,u*2-2*g); continue; }
        if(rnd()<0.1+jf*0.2) continue; // breathing room like the reference
        const pick=rnd();
        if(pick<0.24) inner+=circle2(x+s/2,y+s/2,s/2);
        else if(pick<0.32) inner+=circle2(x+s/2,y+s/2,s*0.34); // small dot
        else if(pick<0.56) inner+=semi(x,y,s,Math.floor(rnd()*4));
        else if(pick<0.8) inner+=quarter(x,y,s,Math.floor(rnd()*4));
        else inner+=drop(x,y,s,Math.floor(rnd()*4));
      }
      return { Tw, Th, inner };
    }
    if(m==='geoflow'||m==='geowave'){
      // organic-flow geometric grid: a smooth seamless field steers each cell —
      // quarter-rounds and semis orient ALONG the field so curves chain into
      // meandering S-runs instead of random confetti
      const n=8, u=cell*1.6, Tw=n*u, Th=n*u, rnd=this.rng(p.seed);
      const g=Math.max(2,(p.gap||18)*0.16), jf=(p.jitter||0)/100;
      const F=v=>v.toFixed(1);
      const ph1=rnd()*6.283, ph2=rnd()*6.283, ph3=rnd()*6.283;
      // seamless scalar field + its flow angle
      const fld=(x,y)=>{ const a=x/Tw*6.283, b=y/Th*6.283;
        return Math.sin(a+ph1)+Math.sin(b+ph2)+0.8*Math.sin(a+b+ph3)+0.6*Math.sin(a*2-b+ph1*2); };
      const ang=(x,y)=>{ const e=u*0.5, dx=fld(x+e,y)-fld(x-e,y), dy=fld(x,y+e)-fld(x,y-e);
        return Math.atan2(dy,dx)+1.5708; }; // tangent to iso-lines
      const circle2=(cx,cy,r)=>'<circle cx="'+F(cx)+'" cy="'+F(cy)+'" r="'+F(r)+'" fill="'+p.ink+'"/>';
      const semi=(x,y,s,dir)=>{ const r=s/2;
        if(dir===0) return '<path d="M'+F(x)+' '+F(y+s)+'A'+F(r)+' '+F(r)+' 0 0 1 '+F(x+s)+' '+F(y+s)+'Z" fill="'+p.ink+'"/>';
        if(dir===1) return '<path d="M'+F(x+s)+' '+F(y)+'A'+F(r)+' '+F(r)+' 0 0 1 '+F(x)+' '+F(y)+'Z" fill="'+p.ink+'"/>';
        if(dir===2) return '<path d="M'+F(x+s)+' '+F(y)+'L'+F(x+s)+' '+F(y+s)+'A'+F(r)+' '+F(r)+' 0 0 1 '+F(x+s)+' '+F(y)+'Z" fill="'+p.ink+'"/>';
        return '<path d="M'+F(x)+' '+F(y+s)+'L'+F(x)+' '+F(y)+'A'+F(r)+' '+F(r)+' 0 0 1 '+F(x)+' '+F(y+s)+'Z" fill="'+p.ink+'"/>'; };
      const quarter=(x,y,s,c)=>{
        if(c===0) return '<path d="M'+F(x)+' '+F(y)+'L'+F(x+s)+' '+F(y)+'A'+F(s)+' '+F(s)+' 0 0 1 '+F(x)+' '+F(y+s)+'Z" fill="'+p.ink+'"/>';
        if(c===1) return '<path d="M'+F(x+s)+' '+F(y)+'L'+F(x+s)+' '+F(y+s)+'A'+F(s)+' '+F(s)+' 0 0 1 '+F(x)+' '+F(y)+'Z" fill="'+p.ink+'"/>';
        if(c===2) return '<path d="M'+F(x+s)+' '+F(y+s)+'L'+F(x)+' '+F(y+s)+'A'+F(s)+' '+F(s)+' 0 0 1 '+F(x+s)+' '+F(y)+'Z" fill="'+p.ink+'"/>';
        return '<path d="M'+F(x)+' '+F(y+s)+'L'+F(x)+' '+F(y)+'A'+F(s)+' '+F(s)+' 0 0 1 '+F(x+s)+' '+F(y+s)+'Z" fill="'+p.ink+'"/>'; };
      const pill=(x,y,w,h)=>{ const r=Math.min(w,h)/2;
        return '<rect x="'+F(x)+'" y="'+F(y)+'" width="'+F(w)+'" height="'+F(h)+'" rx="'+F(r)+'" fill="'+p.ink+'"/>'; };
      const occ=new Uint8Array(n*n);
      let inner='';
      for(let j=0;j<n;j++) for(let i=0;i<n;i++){
        if(occ[j*n+i]) continue;
        const x=i*u+g, y=j*u+g, s=u-2*g;
        const cx=x+s/2, cy=y+s/2;
        const v=fld(cx,cy);                       // -3.4..3.4 roughly
        const t=(v+3.4)/6.8;                       // 0..1 tone
        const a=ang(cx,cy);
        const oct=((Math.round(a/0.7854)%8)+8)%8;  // flow direction in 8ths
        const horiz=(oct===0||oct===4), vert=(oct===2||oct===6);
        if(m==='geowave'){
          // wave: size follows the field — big shapes on crests, dots in troughs (no empty holes)
          if(t<0.18){ inner+=circle2(cx,cy,s*(0.14+t*0.3)); continue; }
          if(t<0.42){ inner+=circle2(cx,cy,s*(0.2+t*0.5)); continue; }
        }
        // pills stretch along the flow direction
        if(t>0.6 && horiz && i<n-1 && !occ[j*n+i+1] && rnd()<0.55){ occ[j*n+i+1]=1; inner+=pill(x,y,u*2-2*g,s); continue; }
        if(t>0.6 && vert && j<n-1 && !occ[(j+1)*n+i] && rnd()<0.55){ occ[(j+1)*n+i]=1; inner+=pill(x,y,s,u*2-2*g); continue; }
        if(m!=='geowave' && rnd()<0.06+jf*0.2) continue;
        // quarter-rounds chain: corner picked from flow octant so arcs run together
        const qmap=[1,1,2,2,3,3,0,0], smap=[2,2,0,0,3,3,1,1];
        const pick=rnd();
        if(pick<0.42) inner+=quarter(x,y,s,qmap[oct]);
        else if(pick<0.72) inner+=semi(x,y,s,smap[oct]);
        else if(pick<0.86) inner+=circle2(cx,cy,s/2);
        else inner+=circle2(cx,cy,s*0.3);
      }
      return { Tw, Th, inner };
    }
    if(m==='geocamo'){
      // camo blotches in the geo-flow vocabulary: metaball blobs define camo masses;
      // inside them cells fill with quarter-rounds/semis/pills oriented along the flow,
      // outside stays sparse — single-ink, gap-inset for clean vinyl weeding
      const n=14, u=cell*1.1, Tw=n*u, Th=n*u, rnd=this.rng(p.seed*131+Math.round(p.scale||0)*17);
      const g=Math.max(0.8,(p.gap||18)*0.05), jf=(p.jitter||0)/100;
      const F=v=>v.toFixed(1);
      const ph1=rnd()*6.283, ph2=rnd()*6.283, ph3=rnd()*6.283;
      const fld=(x,y)=>{ const a=x/Tw*6.283, b=y/Th*6.283;
        return Math.sin(a+ph1)+Math.sin(b+ph2)+0.8*Math.sin(a+b+ph3)+0.6*Math.sin(a*2-b+ph1*2); };
      const ang=(x,y)=>{ const e=u*0.5, dx=fld(x+e,y)-fld(x-e,y), dy=fld(x,y+e)-fld(x,y-e);
        return Math.atan2(dy,dx)+1.5708; };
      const circle2=(cx,cy,r)=>'<circle cx="'+F(cx)+'" cy="'+F(cy)+'" r="'+F(r)+'" fill="'+p.ink+'"/>';
      const semi=(x,y,s,dir)=>{ const r=s/2;
        if(dir===0) return '<path d="M'+F(x)+' '+F(y+s)+'A'+F(r)+' '+F(r)+' 0 0 1 '+F(x+s)+' '+F(y+s)+'Z" fill="'+p.ink+'"/>';
        if(dir===1) return '<path d="M'+F(x+s)+' '+F(y)+'A'+F(r)+' '+F(r)+' 0 0 1 '+F(x)+' '+F(y)+'Z" fill="'+p.ink+'"/>';
        if(dir===2) return '<path d="M'+F(x+s)+' '+F(y)+'L'+F(x+s)+' '+F(y+s)+'A'+F(r)+' '+F(r)+' 0 0 1 '+F(x+s)+' '+F(y)+'Z" fill="'+p.ink+'"/>';
        return '<path d="M'+F(x)+' '+F(y+s)+'L'+F(x)+' '+F(y)+'A'+F(r)+' '+F(r)+' 0 0 1 '+F(x)+' '+F(y+s)+'Z" fill="'+p.ink+'"/>'; };
      const quarter=(x,y,s,c)=>{
        if(c===0) return '<path d="M'+F(x)+' '+F(y)+'L'+F(x+s)+' '+F(y)+'A'+F(s)+' '+F(s)+' 0 0 1 '+F(x)+' '+F(y+s)+'Z" fill="'+p.ink+'"/>';
        if(c===1) return '<path d="M'+F(x+s)+' '+F(y)+'L'+F(x+s)+' '+F(y+s)+'A'+F(s)+' '+F(s)+' 0 0 1 '+F(x)+' '+F(y)+'Z" fill="'+p.ink+'"/>';
        if(c===2) return '<path d="M'+F(x+s)+' '+F(y+s)+'L'+F(x)+' '+F(y+s)+'A'+F(s)+' '+F(s)+' 0 0 1 '+F(x+s)+' '+F(y)+'Z" fill="'+p.ink+'"/>';
        return '<path d="M'+F(x)+' '+F(y+s)+'L'+F(x)+' '+F(y)+'A'+F(s)+' '+F(s)+' 0 0 1 '+F(x+s)+' '+F(y+s)+'Z" fill="'+p.ink+'"/>'; };
      const pill=(x,y,w,h)=>{ const r=Math.min(w,h)/2;
        return '<rect x="'+F(x)+'" y="'+F(y)+'" width="'+F(w)+'" height="'+F(h)+'" rx="'+F(r)+'" fill="'+p.ink+'"/>'; };
      // camo blobs: wandering lobe chains, min-distance placement, wrap-aware influence
      const nB=Math.max(4,Math.round(15*((p.blotchQty==null?100:p.blotchQty)/100))), blobs=[];
      for(let att=0; att<300 && blobs.length<nB; att++){
        const bx=rnd()*Tw, by=rnd()*Th; let ok=true;
        for(const b2 of blobs){ let dx=Math.abs(bx-b2.x); dx=Math.min(dx,Tw-dx);
          let dy=Math.abs(by-b2.y); dy=Math.min(dy,Th-dy);
          if(Math.hypot(dx,dy)<Tw*0.13){ ok=false; break; } }
        if(!ok) continue;
        const lobes=[[bx,by,Tw*(0.055+rnd()*0.04)]];
        let px2=bx, py2=by, a=rnd()*6.283;
        for(let l2=0;l2<3+Math.floor(rnd()*3);l2++){ a+=(rnd()-0.5)*2.4; const d2=Tw*(0.04+rnd()*0.05);
          px2+=Math.cos(a)*d2; py2+=Math.sin(a)*d2; lobes.push([px2,py2,Tw*(0.035+rnd()*0.045)]); }
        blobs.push({x:bx,y:by,lobes,w:0});
      }
      // 8 shape weights dealt from a shuffled deck — one per blob
      const gwts=[]; for(let k=0;k<15;k++) gwts.push(0.55+k*(1.0-0.55)/14);
      const gord=gwts.map((_,k)=>k);
      for(let k=gord.length-1;k>0;k--){ const q=Math.floor(rnd()*(k+1)); const t2=gord[k]; gord[k]=gord[q]; gord[q]=t2; }
      blobs.forEach((b2,k)=>{ b2.w=gwts[gord[k%gwts.length]]; });
      const infl=(b2,x,y)=>{ let v=0;
        for(const [lx,ly,lr] of b2.lobes){ let dx=Math.abs(x-lx); dx=Math.min(dx,Tw-dx);
          let dy=Math.abs(y-ly); dy=Math.min(dy,Th-dy);
          const d2=Math.hypot(dx,dy); v=Math.max(v, 1-d2/(lr*2.2)); }
        return v; };
      const wp=[rnd()*6.283,rnd()*6.283,rnd()*6.283];
      const wob=(x,y)=>{ const a2=x/Tw*6.283, b3=y/Th*6.283;
        return 0.17*Math.sin(a2*3.1+wp[0])+0.14*Math.sin(b3*4.3+wp[1])+0.12*Math.sin((a2+b3)*5.7+wp[2]); };
      const occ=new Uint8Array(n*n);
      let inner='';
      for(let j=0;j<n;j++) for(let i=0;i<n;i++){
        if(occ[j*n+i]) continue;
        const x=i*u+g, y=j*u+g, s=u-2*g;
        const cx=x+s/2, cy=y+s/2;
        let v=0, bw=1; for(const b2 of blobs){ const v2=infl(b2,cx,cy); if(v2>v){ v=v2; bw=b2.w; } }
        const th=0.42+wob(cx,cy);
        const a=ang(cx,cy), oct=((Math.round(a/0.7854)%8)+8)%8;
        const horiz=(oct===0||oct===4), vert=(oct===2||oct===6);
        if(v>th){
          // inside a camo mass: geo vocabulary at this blob's weight, randomized
          const sMax=u-2*g;                                  // uniform envelope: equal gap everywhere
          const s2=Math.min(sMax, sMax*bw);
          const ccx=cx, ccy=cy, x2=ccx-s2/2, y2=ccy-s2/2;    // centered on the grid
          const pdir=rnd();
          if(pdir<0.35 && i<n-1 && !occ[j*n+i+1] && rnd()<0.45){ occ[j*n+i+1]=1; inner+=pill(cx-s2/2,ccy-s2/2,u+s2,s2); continue; }
          if(pdir>=0.35 && pdir<0.7 && j<n-1 && !occ[(j+1)*n+i] && rnd()<0.45){ occ[(j+1)*n+i]=1; inner+=pill(ccx-s2/2,cy-s2/2,s2,u+s2); continue; }
          const qc=Math.floor(rnd()*4), sc3=Math.floor(rnd()*4); // fully random orientation
          const pick=rnd();
          if(pick<0.38) inner+=quarter(x2,y2,s2,qc);
          else if(pick<0.68) inner+=semi(x2,y2,s2,sc3);
          else if(pick<0.88) inner+=circle2(ccx,ccy,s2/2);
          else inner+=circle2(ccx,ccy,s2*0.3);
        } else if(v>th*0.78){
          if(rnd()<0.75) inner+=circle2(cx,cy,(u-2*g)*0.16); // fringe: small circles, same grid
        } else {
          if(rnd()<0.05*(1+jf)) inner+=circle2(cx,cy,s*0.12); // open field: sparse dust
        }
      }
      return { Tw, Th, inner };
    }
    if(m==='dotnetcamo'||m==='dotdiscamo'){
      const Tw=cell*12, Th=cell*12, rnd=this.rng(p.seed*131+Math.round(p.scale||0)*17), jf=(p.jitter||0)/100;
      const F=v=>v.toFixed(1);
      const sw=Math.max(0.7,(p.stroke||1.4)*0.6).toFixed(2);
      // camo blobs: wandering lobe chains, wrap-aware influence
      const nB=Math.max(2,Math.round((6+Math.floor(rnd()*3))*((p.blotchQty==null?100:p.blotchQty)/100))), blobs=[];
      for(let att=0; att<260 && blobs.length<nB; att++){
        const bx=rnd()*Tw, by=rnd()*Th; let ok=true;
        for(const b2 of blobs){ let dx=Math.abs(bx-b2.x); dx=Math.min(dx,Tw-dx);
          let dy=Math.abs(by-b2.y); dy=Math.min(dy,Th-dy);
          if(Math.hypot(dx,dy)<Tw*0.22){ ok=false; break; } }
        if(!ok) continue;
        const lobes=[[bx,by,Tw*(0.07+rnd()*0.05)]];
        let px2=bx, py2=by, a=rnd()*6.283;
        for(let l2=0;l2<3+Math.floor(rnd()*3);l2++){ a+=(rnd()-0.5)*2.4; const d2=Tw*(0.04+rnd()*0.05);
          px2+=Math.cos(a)*d2; py2+=Math.sin(a)*d2; lobes.push([px2,py2,Tw*(0.035+rnd()*0.045)]); }
        blobs.push({x:bx,y:by,lobes});
      }
      const infl=(x,y)=>{ let v=0;
        for(const b2 of blobs) for(const [lx,ly,lr] of b2.lobes){ let dx=Math.abs(x-lx); dx=Math.min(dx,Tw-dx);
          let dy=Math.abs(y-ly); dy=Math.min(dy,Th-dy);
          v=Math.max(v, 1-Math.hypot(dx,dy)/(lr*2.2)); }
        return v; };
      // dots: min-distance scatter, density follows the camo field (toroidal distances)
      const minD=Tw*0.028, pts=[];
      const wdist=(x1,y1,x2,y2)=>{ let dx=Math.abs(x1-x2); dx=Math.min(dx,Tw-dx); let dy=Math.abs(y1-y2); dy=Math.min(dy,Th-dy); return Math.hypot(dx,dy); };
      for(let att=0; att<4200 && pts.length<340; att++){
        const x=rnd()*Tw, y=rnd()*Th, v=infl(x,y);
        const keep=v>0.55?0.95:v>0.4?0.45+jf*0.3:0.06*(1+jf);
        if(rnd()>keep) continue;
        let ok=true;
        for(const q of pts){ if(wdist(q[0],q[1],x,y)<minD*(v>0.55?1:1.6)){ ok=false; break; } }
        if(!ok) continue;
        pts.push([x,y,v]);
      }
      let lines='', dots='';
      const noLines=(m==='dotdiscamo');
      // network links: connect near neighbors — solid in cores, breaking up at the
      // fringe (dissolve), none in the open field
      const linkR=minD*2.1;
      if(!noLines) for(let a2=0;a2<pts.length;a2++) for(let b3=a2+1;b3<pts.length;b3++){
        const P=pts[a2], Q=pts[b3];
        // nearest toroidal image of Q relative to P
        let qx=Q[0], qy=Q[1];
        if(Math.abs(qx-P[0])>Tw/2) qx+=(qx<P[0]?Tw:-Tw);
        if(Math.abs(qy-P[1])>Th/2) qy+=(qy<P[1]?Th:-Th);
        const d2=Math.hypot(P[0]-qx,P[1]-qy);
        if(d2>linkR) continue;
        const vm=Math.min(P[2],Q[2]);
        const prob=vm>0.62?0.9:vm>0.5?0.45:vm>0.42?0.15:0;
        if(rnd()>prob) continue;
        // draw the segment plus its wrapped twin so it appears on both sides of the seam
        const segs=[[P[0],P[1],qx,qy]];
        if(qx!==Q[0]||qy!==Q[1]) segs.push([P[0]-(qx-Q[0]),P[1]-(qy-Q[1]),Q[0],Q[1]]);
        for(const [x1,y1,x2,y2] of segs) lines+='<line x1="'+F(x1)+'" y1="'+F(y1)+'" x2="'+F(x2)+'" y2="'+F(y2)+'" stroke="'+p.ink+'" stroke-width="'+sw+'" stroke-linecap="round"/>';
      }
      for(const [x,y,v] of pts){
        const r=noLines?(v>0.62?minD*0.42:v>0.5?minD*0.33:v>0.42?minD*0.24:minD*0.15)
                       :(v>0.62?minD*0.34:v>0.45?minD*0.26:minD*0.18);
        const xs=[x]; if(x<r) xs.push(x+Tw); else if(x>Tw-r) xs.push(x-Tw);
        const ys=[y]; if(y<r) ys.push(y+Th); else if(y>Th-r) ys.push(y-Th);
        for(const x2 of xs) for(const y2 of ys) dots+='<circle cx="'+F(x2)+'" cy="'+F(y2)+'" r="'+F(r)+'" fill="'+p.ink+'"/>';
      }
      return { Tw, Th, inner: lines+dots };
    }
    if(m==='gradbase'||m==='gradbase2'){
      // gradient-base wainscot: dot-weight digital camo whose density fades with height —
      // solid at the floor line, dissolving to nothing near the top. Tiles horizontally
      // (left-right seamless); vertically it is a banner, not a repeat.
      const bold=(m==='gradbase2');
      const unit=Math.max(6.5,cell*(bold?0.32:0.23)+(p.gap||18)*0.14);
      const nx=Math.max(16,Math.round(cell*12/unit)), ny=nx;
      const Tw=nx*unit, Th=ny*unit, rnd=this.rng(p.seed*113+Math.round(p.scale||0)*7), jf=(p.jitter||0)/100;
      const ph=[rnd()*6.283,rnd()*6.283,rnd()*6.283];
      // full wrap in both axes (integer harmonics) => seamless tile on every edge
      const fld=(x,y)=>{ const a=x/Tw*6.283, b=y/Th*6.283;
        return Math.sin(a*1+ph[0])+Math.sin(b*2+ph[1])+0.9*Math.sin(a*2+b*1+ph[2]); };
      const B=bold?4:3, bxN=Math.ceil(nx/B), byN=Math.ceil(ny/B);
      const lvlOfBlock=(bi,bj)=>{
        const v=fld(((bi%bxN)*B+B/2)*unit,(bj*B+B/2)*unit);
        const t=(v+2.9)/5.8;
        return Math.max(0,Math.min(5,Math.floor(t*6)));
      };
      const wts=bold?[0.0,0.4,0.55,0.7,0.85,1.0]:[0.0,0.28,0.42,0.56,0.7,0.84];
      const F=v=>v.toFixed(1);
      let inner='';
      for(let j=0;j<ny;j++) for(let i=0;i<nx;i++){
        const fy=(j+0.5)/ny;                              // 0 top .. 1 floor
        // fade gate: same curve as the wall version — nothing above ~20%, solid at base
        // seamless vertical cycle: dense where tiles meet (fy 0 and 1), open at mid
        const gate=Math.pow(0.5+0.5*Math.cos(fy*6.283),bold?1.1:1.3);
        if(rnd()>gate) continue;
        const L=lvlOfBlock(Math.floor(i/B),Math.floor(j/B));
        let r=wts[L]*unit*0.5;                             // true dot-weight radii (wts are diameters of cell fraction)
        if(L===0){
          if(gate>0.8){ r=wts[1+Math.floor(rnd()*3)]*unit*0.5; } // voids fill in inside the dense band
          else { if(rnd()>0.12*(1+jf)) continue; r=unit*0.09; }
        }
        const jmax=unit*0.1*jf;
        const rCap=unit*0.5-jmax-Math.max(1,unit*0.08);    // guaranteed gap, jitter included
        r=Math.min(r,rCap);
        const x=(i+0.5)*unit+(rnd()*2-1)*jmax, y=(j+0.5)*unit+(rnd()*2-1)*jmax;
        inner+='<circle cx="'+F(x)+'" cy="'+F(y)+'" r="'+F(Math.max(0.8,r))+'" fill="'+p.ink+'"/>';
      }
      return { Tw, Th, inner };
    }
    if(m==='dotcamo'){
      // digital camo drawn entirely with circles in 6 discrete weights:
      // a seamless density field is quantized on a COARSE block grid (stepped 90°
      // patch edges = digital read), each fine cell gets one dot whose radius is
      // one of 6 fixed weights for its block's level
      const unit=Math.max(8,cell*0.3+(p.gap||18)*0.2);
      const nx=Math.max(18,Math.round(cell*12/unit)), ny=nx;
      const Tw=nx*unit, Th=ny*unit, rnd=this.rng(p.seed), jf=(p.jitter||0)/100;
      const ph=[rnd()*6.283,rnd()*6.283,rnd()*6.283];
      const fld=(x,y)=>{ const a=x/Tw*6.283, b=y/Th*6.283;
        return Math.sin(a*1.3+ph[0])+Math.sin(b*1.7+ph[1])+0.9*Math.sin(a*2.1+b*1.2+ph[2]); };
      // coarse blocks of 3x3 cells -> stepped patch edges
      const B=3, bx=Math.ceil(nx/B), by=Math.ceil(ny/B);
      const lvlOfBlock=(bi,bj)=>{
        const v=fld((bi*B+B/2)*unit,(bj*B+B/2)*unit); // -2.9..2.9
        const t=(v+2.9)/5.8;
        return Math.max(0,Math.min(5,Math.floor(t*6)));
      };
      // 6 fixed dot weights (fraction of cell half-size); level 0 mostly empty
      const wts=[0.0,0.14,0.22,0.3,0.38,0.46];
      const F=v=>v.toFixed(1);
      let inner='';
      for(let j=0;j<ny;j++) for(let i=0;i<nx;i++){
        const L=lvlOfBlock(Math.floor(i/B)%bx,Math.floor(j/B)%by);
        let r=wts[L]*unit;
        if(L===0){ if(rnd()>0.12*(1+jf)) continue; r=unit*0.09; } // sparse dust in voids
        const jmax=unit*0.12*jf;
        const x=(i+0.5)*unit+(rnd()*2-1)*jmax, y=(j+0.5)*unit+(rnd()*2-1)*jmax;
        inner+='<circle cx="'+F(x)+'" cy="'+F(y)+'" r="'+F(r)+'" fill="'+p.ink+'"/>';
      }
      return { Tw, Th, inner };
    }
    if(m==='dotcamo6'){
      // like dot-weights camo, but each cell is a stacked CLUSTER of 6 equal circles
      // (3 columns x 2 rows); the whole cluster takes one of 6 weights from its block level
      const unit=Math.max(14,cell*0.5+(p.gap||18)*0.3);   // cluster cell pitch
      const nx=Math.max(10,Math.round(cell*12/unit)), ny=nx;
      const Tw=nx*unit, Th=ny*unit, rnd=this.rng(p.seed), jf=(p.jitter||0)/100;
      const ph=[rnd()*6.283,rnd()*6.283,rnd()*6.283];
      const fld=(x,y)=>{ const a=x/Tw*6.283, b=y/Th*6.283;
        return Math.sin(a*1.3+ph[0])+Math.sin(b*1.7+ph[1])+0.9*Math.sin(a*2.1+b*1.2+ph[2]); };
      const B=2, bxN=Math.ceil(nx/B), byN=Math.ceil(ny/B);
      const lvlOfBlock=(bi,bj)=>{
        const v=fld((bi*B+B/2)*unit,(bj*B+B/2)*unit);
        const t=(v+2.9)/5.8;
        return Math.max(0,Math.min(9,Math.floor(t*10)));
      };
      // 10 cluster weights: dot radius as fraction of sub-cell half-pitch
      const wts=[0.0,0.1,0.16,0.22,0.28,0.34,0.4,0.46,0.52,0.58];
      const F=v=>v.toFixed(1);
      // 3x2 sub-grid inside each cell
      const sx=unit/3, sy=unit/2;
      const outline=p.style==='outline', osw=Math.max(0.8,(p.stroke||1.4)).toFixed(2);
      let inner='';
      for(let j=0;j<ny;j++) for(let i=0;i<nx;i++){
        const L=lvlOfBlock(Math.floor(i/B)%bxN,Math.floor(j/B)%byN);
        let w=wts[L];
        if(L===0){ if(rnd()>0.08*(1+jf)) continue; w=0.1; }
        else { const airy=(fld((i+7.3)*unit*1.9,(j+3.1)*unit*1.9)+2.9)/5.8; // second field: airy vs tight zones
          if(rnd()<0.04+airy*0.22) continue; }              // hole chance varies by zone
        const damp=1-w*0.9;                                  // heavy weights: steadier gap
        const gapF=0.62+rnd()*0.28*damp;
        const rMax=Math.min(sx,sy)/2-Math.max(1.2,unit*0.045); // hard gap guarantee
        const r=Math.min(rMax, Math.min(sx,sy)/2*w*2*gapF);               // keep a weeding gap between dots
        if(r<0.6) continue;
        const jmax=unit*0.05*jf;
        const ox=i*unit+(rnd()*2-1)*jmax, oy=j*unit+(rnd()*2-1)*jmax;
        const attr=outline?('fill="none" stroke="'+p.ink+'" stroke-width="'+osw+'"'):('fill="'+p.ink+'"');
        for(let cj=0;cj<2;cj++) for(let ci=0;ci<3;ci++){
          inner+='<circle cx="'+F(ox+(ci+0.5)*sx)+'" cy="'+F(oy+(cj+0.5)*sy)+'" r="'+F(r)+'" '+attr+'/>';
        }
      }
      return { Tw, Th, inner };
    }
    if(m==='pluswcamo'){
      // digital camo drawn with plus glyphs in 6 discrete weights — same engine as hex/tri weights
      const unit=Math.max(8,cell*0.3+(p.gap||18)*0.2);
      const nx=Math.max(18,Math.round(cell*12/unit)), ny=nx;
      const Tw=nx*unit, Th=ny*unit, rnd=this.rng(p.seed), jf=(p.jitter||0)/100;
      const ph=[rnd()*6.283,rnd()*6.283,rnd()*6.283];
      const fld=(x,y)=>{ const a=x/Tw*6.283, b=y/Th*6.283;
        return Math.sin(a*1.3+ph[0])+Math.sin(b*1.7+ph[1])+0.9*Math.sin(a*2.1+b*1.2+ph[2]); };
      const B=3, bxN=Math.ceil(nx/B), byN=Math.ceil(ny/B);
      const lvlOfBlock=(bi,bj)=>{ const v=fld((bi*B+B/2)*unit,(bj*B+B/2)*unit); const t=(v+2.9)/5.8;
        return Math.max(0,Math.min(10,Math.floor(t*11))); };
      // 11 weights, slim arms — the heaviest plus stays a cross, not a blob
      const wts=[0.0,0.09,0.13,0.17,0.21,0.26,0.31,0.36,0.4,0.44,0.47];
      const F=v=>v.toFixed(1);
      const outline=p.style==='outline', osw=Math.max(0.8,(p.stroke||1.4)).toFixed(2);
      const attr=outline?('fill="none" stroke="'+p.ink+'" stroke-width="'+osw+'" stroke-linejoin="miter"'):('fill="'+p.ink+'"');
      const plus=(cx2,cy2,r)=>{ const t=Math.max(0.7,Math.min(r*0.24,unit*0.09));
        const d='M'+F(cx2-t)+' '+F(cy2-r)+'L'+F(cx2+t)+' '+F(cy2-r)+'L'+F(cx2+t)+' '+F(cy2-t)+'L'+F(cx2+r)+' '+F(cy2-t)+'L'+F(cx2+r)+' '+F(cy2+t)+'L'+F(cx2+t)+' '+F(cy2+t)+'L'+F(cx2+t)+' '+F(cy2+r)+'L'+F(cx2-t)+' '+F(cy2+r)+'L'+F(cx2-t)+' '+F(cy2+t)+'L'+F(cx2-r)+' '+F(cy2+t)+'L'+F(cx2-r)+' '+F(cy2-t)+'L'+F(cx2-t)+' '+F(cy2-t)+'Z';
        return '<path d="'+d+'" '+attr+'/>'; };
      let inner='';
      for(let j=0;j<ny;j++) for(let i=0;i<nx;i++){
        const L=lvlOfBlock(Math.floor(i/B)%bxN,Math.floor(j/B)%byN);
        let r=wts[L]*unit;
        if(L===0){ if(rnd()>0.12*(1+jf)) continue; r=unit*0.08; }
        else { const airy=(fld((i+7.3)*unit*1.9,(j+3.1)*unit*1.9)+2.9)/5.8;
          if(rnd()<0.03+airy*0.2) continue;
          r*=0.92+rnd()*0.08; }   // near-uniform size per weight -> even spacing
        const jmax=unit*0.12*jf;
        const rCap=unit*0.47-jmax;   // ≥ 0.06·unit clear gap between neighboring tips, even at max weight
        r=Math.min(r,rCap);
        const x=(i+0.5)*unit+(rnd()*2-1)*jmax, y=(j+0.5)*unit+(rnd()*2-1)*jmax;
        inner+=plus(x,y,r);
      }
      return { Tw, Th, inner };
    }
    if(m==='quadtree'){
      // seamless quadtree halftone: a toroidal density field drives recursive cell
      // subdivision — solid rounded squares in dense zones (some punched with white dots),
      // shrinking squares then circles at the fringe, sparse dust in the open field
      const base=Math.max(30,cell*1.3+(p.gap||18)*0.8);
      const nx=Math.max(8,Math.round(cell*18/base)), ny=nx;
      const Tw=nx*base, Th=ny*base, rnd=this.rng(p.seed*97+13), jf=(p.jitter||0)/100;
      const ph=[rnd()*6.283,rnd()*6.283,rnd()*6.283,rnd()*6.283];
      // seed-driven integer frequencies: each seed builds a genuinely different (and seamless) field
      const k=[1+Math.floor(rnd()*2),1+Math.floor(rnd()*2),2+Math.floor(rnd()*2),1+Math.floor(rnd()*2),2+Math.floor(rnd()*3),2+Math.floor(rnd()*2)];
      const w2=[0.7+rnd()*0.4,0.45+rnd()*0.35];
      const fld=(x,y)=>{ const a=x/Tw*6.283, b=y/Th*6.283;
        const v=Math.sin(a*k[0]+ph[0])+Math.sin(b*k[1]+ph[1])+w2[0]*Math.sin(a*k[2]+b*k[3]+ph[2])+w2[1]*Math.sin(a*k[4]-b*k[5]+ph[3])+0.35*Math.sin(a*(k[2]+2)-b*(k[1]+3)+ph[0]*1.7);
        // contrast-stretched and biased dense: a mostly-filled field, camo voids read as negative blotches
        const n01=Math.max(0,Math.min(1,(v+2.45)/4.9));
        return Math.max(0,Math.min(1,(n01-0.18)/0.26)); };
      const F=v=>v.toFixed(1);
      let inner='';
      const leaf=(x,y,sz,v)=>{
        const g=Math.max(1.4,sz*0.085);
        if(v>0.86){ const a=sz-2*g, r=a*0.24;
          inner+='<rect x="'+F(x+g)+'" y="'+F(y+g)+'" width="'+F(a)+'" height="'+F(a)+'" rx="'+F(r)+'" fill="'+p.ink+'"/>';
          if(sz>base*0.4&&rnd()<0.12) inner+='<circle cx="'+F(x+sz/2)+'" cy="'+F(y+sz/2)+'" r="'+F(sz*0.15)+'" fill="'+p.ground+'"/>';
        } else if(v>0.42){
          // 5 discrete square weights between fringe and solid
          const step=Math.min(4,Math.floor((v-0.42)/0.088));
          const a=(sz-2*g)*(0.52+step*0.11), o=(sz-a)/2, r=a*0.28;
          inner+='<rect x="'+F(x+o)+'" y="'+F(y+o)+'" width="'+F(a)+'" height="'+F(a)+'" rx="'+F(r)+'" fill="'+p.ink+'"/>';
        } else if(v>0.16){
          // 3 discrete circle weights at the outer fringe
          const step=Math.min(2,Math.floor((v-0.16)/0.087));
          inner+='<circle cx="'+F(x+sz/2)+'" cy="'+F(y+sz/2)+'" r="'+F((sz/2-g)*(0.42+step*0.2))+'" fill="'+p.ink+'"/>';
        } else if(rnd()<0.06*(1+jf)){
          inner+='<circle cx="'+F(x+sz/2)+'" cy="'+F(y+sz/2)+'" r="'+F(Math.max(2.2,sz*(0.1+rnd()*0.08)))+'" fill="'+p.ink+'"/>';
        } };
      const maxD=3;
      const node=(x,y,sz,depth)=>{
        const v=fld(x+sz/2,y+sz/2);
        const mixed=v>0.16&&v<0.8;
        if(depth<maxD&&sz>base*0.2&&(mixed||(v>=0.8&&rnd()<0.45)||(v>0.06&&rnd()<0.05*(1+jf)))){
          const h=sz/2;
          node(x,y,h,depth+1); node(x+h,y,h,depth+1); node(x,y+h,h,depth+1); node(x+h,y+h,h,depth+1);
          return; }
        leaf(x,y,sz,v); };
      for(let j=0;j<ny;j++) for(let i=0;i<nx;i++) node(i*base,j*base,base,0);
      return { Tw, Th, inner };
    }
    if(m==='flowdash'||m==='raindash'){
      // flow field / rain: grids of rounded dashes — flowdash rotates and thickens the
      // dashes where a toroidal field runs strong; raindash keeps a fixed 45° with a
      // length ramp — both seamless with wrap-aware emit at the tile seams
      const u=Math.max(20,cell*0.8+(p.gap||18)*0.5);
      const nx=Math.max(10,Math.round(cell*14/u)), ny=nx;
      const Tw=nx*u, Th=ny*u, rnd=this.rng(p.seed*173+3), jf=(p.jitter||0)/100;
      const ph=[rnd()*6.283,rnd()*6.283,rnd()*6.283,rnd()*6.283];
      const k=[1+Math.floor(rnd()*2),1+Math.floor(rnd()*2),2+Math.floor(rnd()*2)];
      const fld=(x,y)=>{ const a=x/Tw*6.283, b=y/Th*6.283;
        const wa=a+0.7*Math.sin(b*1.7+ph[3]), wb=b+0.7*Math.sin(a*1.7+ph[2]);
        const v=Math.sin(wa*k[0]+ph[0])+Math.sin(wb*k[1]+ph[1])+0.7*Math.sin(wa*k[2]+wb+ph[2]);
        return Math.max(0,Math.min(1,(v+2.4)/4.8)); };
      const F=v=>v.toFixed(1);
      let inner='';
      const dash=(x,y,len,t,ang)=>{ const hl=len/2, ht=Math.min(t,len*0.8)/2;
        const d='M'+F(x-hl)+' '+F(y-ht)+'L'+F(x+hl)+' '+F(y-ht)+'L'+F(x+hl)+' '+F(y+ht)+'L'+F(x-hl)+' '+F(y+ht)+'Z';
        return '<path d="'+d+'" fill="'+p.ink+'" transform="rotate('+ang.toFixed(1)+' '+F(x)+' '+F(y)+')"/>'; };
      const emit=(x,y,len,t,ang)=>{ const m2=len/2+2;
        const xs=[0]; if(x-m2<0)xs.push(Tw); if(x+m2>Tw)xs.push(-Tw);
        const ys=[0]; if(y-m2<0)ys.push(Th); if(y+m2>Th)ys.push(-Th);
        for(const a of xs) for(const b of ys) inner+=dash(x+a,y+b,len,t,ang); };
      if(m==='flowdash'){
        const rowGap=u*1.15, stepX=u*1.3;
        for(let y=u/2; y<Th; y+=rowGap) for(let x=u/2; x<Tw; x+=stepX){
          const v=fld(x,y);
          const ang=-v*62+(rnd()*2-1)*4*jf;
          emit(x,y,u*(0.6+v*0.5),Math.max(1.4,u*(0.05+Math.pow(v,1.6)*0.24)),ang);
        }
      } else {
        const rowGap=u*1.2, stepX=u*1.2;
        let r2=0;
        for(let y=u/2; y<Th; y+=rowGap, r2++) for(let x=u/2+(r2%2)*stepX/2; x<Tw; x+=stepX){
          const v=fld(x,y);
          emit(x,y,u*(0.28+Math.pow(v,1.3)*1.3),Math.max(1.4,u*(0.045+Math.pow(v,1.6)*0.2)),-45+(rnd()*2-1)*3*jf);
        }
      }
      return { Tw, Th, inner };
    }
    if(m==='sqmerge'){
      // squircle merge halftone: rounded squares on a strict grid grow with a toroidal
      // field until they fuse — dense cores read solid, pierced by 4-point star gaps
      const u=Math.max(24,cell*0.9+(p.gap||18)*0.6);
      const nx=Math.max(10,Math.round(cell*14/u)), ny=nx;
      const Tw=nx*u, Th=ny*u, rnd=this.rng(p.seed*181+9), jf=(p.jitter||0)/100;
      const ph=[rnd()*6.283,rnd()*6.283,rnd()*6.283,rnd()*6.283];
      const k=[1+Math.floor(rnd()*2),1+Math.floor(rnd()*2),2+Math.floor(rnd()*2)];
      const fld=(x,y)=>{ const a=x/Tw*6.283, b=y/Th*6.283;
        const wa=a+0.7*Math.sin(b*1.7+ph[3]), wb=b+0.7*Math.sin(a*1.7+ph[2]);
        const v=Math.sin(wa*k[0]+ph[0])+Math.sin(wb*k[1]+ph[1])+0.7*Math.sin(wa*k[2]+wb+ph[2]);
        return Math.max(0,Math.min(1,(v+2.4)/4.8)); };
      const F=v=>v.toFixed(1);
      let inner='';
      const sq=(x,y,s,r2)=>{ inner+='<rect x="'+F(x-s/2)+'" y="'+F(y-s/2)+'" width="'+F(s)+'" height="'+F(s)+'" rx="'+F(r2)+'" fill="'+p.ink+'"/>'; };
      const emit=(x,y,s,r2)=>{ const m2=s/2+1;
        const xs=[0]; if(x-m2<0)xs.push(Tw); if(x+m2>Tw)xs.push(-Tw);
        const ys=[0]; if(y-m2<0)ys.push(Th); if(y+m2>Th)ys.push(-Th);
        for(const a of xs) for(const b of ys) sq(x+a,y+b,s,r2); };
      for(let y=u/2; y<Th; y+=u) for(let x=u/2; x<Tw; x+=u){
        const v=fld(x,y);
        if(v<0.3){ if(rnd()<0.06*(1+jf)) emit(x,y,u*0.55,u*0.16); continue; }
        const t=(v-0.3)/0.7;
        // cap below the cell pitch so every square keeps a uniform gutter — the merge
        // read comes from the corner radius tightening, not from overlap
        const s=u*(0.55+t*0.37), r2=Math.max(1.5,s*(0.5-0.3*t));
        emit(x,y,s,r2);
      }
      return { Tw, Th, inner };
    }
    if(m==='crossdig'){
      // digital cross camo: blocky pixel-camo blotches built from plus/cross glyphs on a strict
      // grid — solid crosses fuse into blotch cores, outline crosses at the fringe, dots in the ground
      const u=Math.max(24,cell*0.9+(p.gap||18)*0.5);
      const n2=Math.max(14,Math.round(cell*22/u));
      const Tw=n2*u, Th=n2*u, rnd=this.rng(p.seed*131+7), jf=(p.jitter||0)/100;
      const F=v=>v.toFixed(1);
      let inner='';
      const ph=[rnd()*6.283,rnd()*6.283,rnd()*6.283,rnd()*6.283];
      const k=[1+Math.floor(rnd()*2),1+Math.floor(rnd()*2),2+Math.floor(rnd()*2)];
      const warp=(a,b)=>[a+0.8*Math.sin(b*2+ph[3]), b+0.8*Math.sin(a*2+ph[2])];
      const fldRaw=(i,j)=>{ const ii=((i%n2)+n2)%n2, jj=((j%n2)+n2)%n2;
        const a0=ii/n2*6.283, b0=jj/n2*6.283; const w=warp(a0,b0), a=w[0], b=w[1];
        const v=Math.sin(a*k[0]+ph[0])+Math.sin(b*k[1]+ph[1])+0.7*Math.sin(a*k[2]+b+ph[2]);
        return Math.max(0,Math.min(1,(v+2.4)/4.8)); };
      // sample on 2x2 blocks for the blocky digital read
      const quant=(i,j)=>fldRaw(Math.floor(i/2)*2,Math.floor(j/2)*2);
      const crossPath=(cx2,cy2,r,t)=>'M'+F(cx2-t/2)+' '+F(cy2-r)+'H'+F(cx2+t/2)+'V'+F(cy2-t/2)+'H'+F(cx2+r)+'V'+F(cy2+t/2)+'H'+F(cx2+t/2)+'V'+F(cy2+r)+'H'+F(cx2-t/2)+'V'+F(cy2+t/2)+'H'+F(cx2-r)+'V'+F(cy2-t/2)+'H'+F(cx2-t/2)+'Z';
      const cross=(cx2,cy2,r,t)=>'<path d="'+crossPath(cx2,cy2,r,t)+'" fill="'+p.ink+'"/>';
      const crossO=(cx2,cy2,r,t,sw)=>'<path d="'+crossPath(cx2,cy2,r,t)+'" fill="none" stroke="'+p.ink+'" stroke-width="'+F(sw)+'"/>';
      for(let j=0;j<n2;j++) for(let i=0;i<n2;i++){
        const x=(i+0.5)*u, y=(j+0.5)*u;
        const lvl=Math.max(0,Math.min(3,Math.floor(quant(i,j)*4+(rnd()-0.5)*0.5)));
        const jx=(rnd()*2-1)*u*0.05*jf, jy=(rnd()*2-1)*u*0.05*jf;
        // 4 weights tuned for even visual steps: arm length and thickness scale together
        if(lvl>=3){ inner+=cross(x+jx,y+jy,u*0.44,u*0.26); }   // largest: pulled in for a clear gap
        else if(lvl===2){ inner+=cross(x+jx,y+jy,u*0.43,u*0.24); }
        else if(lvl===1){ inner+=cross(x+jx,y+jy,u*0.36,u*0.19); }
        else { inner+=cross(x+jx,y+jy,u*0.29,u*0.15); }
      }
      return { Tw, Th, inner };
    }
    if(m==='trimosaiccamo'){
      // triangle-mosaic camo: the half-square-triangle vocabulary, but a strong toroidal
      // field carves the tile into solid ink blotches, jagged triangle fringes, and open ground
      const u=Math.max(28,cell*1.1+(p.gap||18)*0.5);
      const n2=Math.max(14,Math.round(cell*24/u));
      const Tw=n2*u, Th=n2*u, rnd=this.rng(p.seed*83+41), jf=(p.jitter||0)/100;
      const F=v=>v.toFixed(1);
      let inner='';
      const ph=[rnd()*6.283,rnd()*6.283,rnd()*6.283,rnd()*6.283];
      const k=[1+Math.floor(rnd()*2),1+Math.floor(rnd()*2),2+Math.floor(rnd()*2),2+Math.floor(rnd()*3)];
      // domain-warped field: a second wave pair bends the coordinates before sampling,
      // so blotches meander and bulge instead of following clean sine lobes
      const warp=(a,b)=>[a+0.9*Math.sin(b*2+ph[3])+0.5*Math.sin(a*3-b+ph[1]), b+0.9*Math.sin(a*2+ph[2])+0.5*Math.sin(b*3+a+ph[0])];
      const fld=(i,j)=>{ const a0=i/n2*6.283, b0=j/n2*6.283; const w=warp(a0,b0), a=w[0], b=w[1];
        const v=Math.sin(a*k[0]+ph[0])+Math.sin(b*k[1]+ph[1])+0.8*Math.sin(a*k[2]+b+ph[2])+0.5*Math.sin(a-b*k[3]+ph[3]);
        return Math.max(0,Math.min(1,(v+2.65)/5.3)); };
      const e=0.5;
      const tri=(x,y,c)=>{ const x0=x-e, y0=y-e, x1=x+u+e, y1=y+u+e;
        const pts=[[[x0,y0],[x1,y0],[x0,y1]],[[x0,y0],[x1,y0],[x1,y1]],[[x1,y0],[x1,y1],[x0,y1]],[[x0,y0],[x1,y1],[x0,y1]]][c];
        return '<path d="M'+pts.map(q=>F(q[0])+' '+F(q[1])).join('L')+'Z" fill="'+p.ink+'"/>'; };
      const sq=(x,y)=>'<rect x="'+F(x-e)+'" y="'+F(y-e)+'" width="'+F(u+2*e)+'" height="'+F(u+2*e)+'" fill="'+p.ink+'"/>';
      for(let j=0;j<n2;j++) for(let i=0;i<n2;i++){
        const x=i*u, y=j*u, v=fld(i,j)+ (rnd()-0.5)*0.06;  // per-cell dither roughens the coastline
        if(v>0.62){ inner+=sq(x,y); continue; }          // blotch core: solid ink
        if(v>0.46){                                      // fringe: triangle pointing toward the blotch
          // gradient direction decides which corner stays ink so edges look carved, not random
          const gx=fld(i+1,j)-fld(i-1,j), gy=fld(i,j+1)-fld(i,j-1);
          const c=gx>=0?(gy>=0?1:2):(gy>=0?0:3);         // corner facing uphill
          inner+=tri(x,y,[1,2,0,3][c]===undefined?c:c);
          continue; }
        if(v>0.4&&rnd()<0.5){ inner+=tri(x,y,Math.floor(rnd()*4)); continue; }
        if(v<=0.4&&rnd()<0.16+jf*0.1){                   // even scatter in the open ground — no dead pools
          const c=Math.floor(rnd()*4);
          if(rnd()<0.3) inner+=tri(x,y,c)+tri(x,y,(c+2)%4); else inner+=tri(x,y,c); }
      }
      return { Tw, Th, inner };
    }
    if(m==='trimosaic'){
      // half-square-triangle mosaic (quilt/truchet): each cell is solid, empty,
      // a corner triangle, or an hourglass pair — diagonals chain into arrows and zigzags
      const u=Math.max(28,cell*1.1+(p.gap||18)*0.5);
      const n2=Math.max(8,Math.round(cell*16/u));
      const Tw=n2*u, Th=n2*u, rnd=this.rng(p.seed*83+41), jf=(p.jitter||0)/100;
      const F=v=>v.toFixed(1);
      let inner='';
      // low-frequency toroidal field varies the mix across the tile — solid-heavy zones,
      // airy zones, triangle-dense zones — so no single texture rhythm gives the repeat away
      const ph=[rnd()*6.283,rnd()*6.283,rnd()*6.283];
      const zone=(i,j)=>{ const a=i/n2*6.283, b=j/n2*6.283;
        const v=Math.sin(a+ph[0])+Math.sin(b+ph[1])+0.7*Math.sin(a*2-b+ph[2]);
        return Math.max(0,Math.min(1,(v+2.7)/5.4)); };
      const tri=(x,y,c)=>{ // corner triangle, c=0..3 — bled 0.5px on all sides so neighbors fuse with no hairline
        const e=0.5, x0=x-e, y0=y-e, x1=x+u+e, y1=y+u+e;
        const pts=[[[x0,y0],[x1,y0],[x0,y1]],[[x0,y0],[x1,y0],[x1,y1]],[[x1,y0],[x1,y1],[x0,y1]],[[x0,y0],[x1,y1],[x0,y1]]][c];
        return '<path d="M'+pts.map(q=>F(q[0])+' '+F(q[1])).join('L')+'Z" fill="'+p.ink+'"/>'; };
      const sq=(x,y)=>'<rect x="'+F(x-0.5)+'" y="'+F(y-0.5)+'" width="'+F(u+1)+'" height="'+F(u+1)+'" fill="'+p.ink+'"/>';
      for(let j=0;j<n2;j++) for(let i=0;i<n2;i++){
        const x=i*u, y=j*u, r=rnd(), z=zone(i,j);
        const pSolid=0.08+z*0.12, pOpen=0.1+z*0.04;      // open cells rare and evenly spread \u2014 no big white pools
        if(r<pSolid){ inner+=sq(x,y); }
        else if(r<pSolid+pOpen){ }
        else if(r<1-0.1-jf*0.08){ inner+=tri(x,y,Math.floor(rnd()*4)); }
        else { const c=Math.floor(rnd()*4); inner+=tri(x,y,c)+tri(x,y,(c+2)%4); }
      }
      return { Tw, Th, inner };
    }
    if(m==='chevmix'||m==='chevud'||m==='chevherr'||m==='chevgrad'||m==='chevfield'||m==='chevkey'||m==='chevacc'||m==='chevanchor'||m==='chevkleeq'){
      // chevron family: brick-offset rows, one shared footprint, weighted treatments —
      // variants change direction, weight distribution, accents or anchors
      const ux=Math.max(56,(cell*2.2+(p.gap||18)*1.4)), uy=ux*0.72;
      const nxC=Math.max(4,Math.round(cell*10/ux)), nyC=Math.max(4,Math.round(cell*10/uy))&~1;
      const Tw=nxC*ux, Th=nyC*uy, rnd=this.rng(p.seed*61+29), jf=(p.jitter||0)/100;
      const F=v=>v.toFixed(1);
      const K=0.55;                                     // arm slope
      let inner='';
      const band=(cx2,cy2,w,t,s,fill)=>{ s=s||1; fill=fill||p.ink; // closed chevron band, apex at (cx2,cy2), s=-1 flips down
        return '<path d="M'+F(cx2-w)+' '+F(cy2+s*K*w)+'L'+F(cx2)+' '+F(cy2)+'L'+F(cx2+w)+' '+F(cy2+s*K*w)+'L'+F(cx2+w)+' '+F(cy2+s*(K*w+t))+'L'+F(cx2)+' '+F(cy2+s*t)+'L'+F(cx2-w)+' '+F(cy2+s*(K*w+t))+'Z" fill="'+fill+'"/>'; };
      const bandH=(cx2,cy2,w,t,s)=>{ s=s||1; // horizontal chevron band, apex points left (s=1) / right (s=-1)
        return '<path d="M'+F(cx2+s*K*w)+' '+F(cy2-w)+'L'+F(cx2)+' '+F(cy2)+'L'+F(cx2+s*K*w)+' '+F(cy2+w)+'L'+F(cx2+s*(K*w+t))+' '+F(cy2+w)+'L'+F(cx2+s*t)+' '+F(cy2)+'L'+F(cx2+s*(K*w+t))+' '+F(cy2-w)+'Z" fill="'+p.ink+'"/>'; };
      const dotchev=(cx2,cy2,w,rows,rr,D,s)=>{ s=s||1;
        let s2=''; const nA=5, dx3=w/nA, stepY=rows>1?D/(rows-1):0;
        for(let r2=0;r2<rows;r2++){ const ay=cy2+s*r2*stepY;
          for(let q=0;q<=nA;q++){ const dx2=q*dx3, dy2=s*q*dx3*K;
            s2+='<circle cx="'+F(cx2+dx2)+'" cy="'+F(ay+dy2)+'" r="'+F(rr)+'" fill="'+p.ink+'"/>';
            if(q>0) s2+='<circle cx="'+F(cx2-dx2)+'" cy="'+F(ay+dy2)+'" r="'+F(rr)+'" fill="'+p.ink+'"/>'; } }
        return s2; };
      const keyline=(cx2,cy2,w,D)=>{ const i2=D*0.3, w2=w-i2*1.5, y0=cy2+i2*1.15, t2=D-2.1*i2; // hollow chevron, closed evenodd fill
        const o2='M'+F(cx2-w)+' '+F(cy2+K*w)+'L'+F(cx2)+' '+F(cy2)+'L'+F(cx2+w)+' '+F(cy2+K*w)+'L'+F(cx2+w)+' '+F(cy2+K*w+D)+'L'+F(cx2)+' '+F(cy2+D)+'L'+F(cx2-w)+' '+F(cy2+K*w+D)+'Z';
        const i3='M'+F(cx2-w2)+' '+F(y0+K*w2)+'L'+F(cx2)+' '+F(y0)+'L'+F(cx2+w2)+' '+F(y0+K*w2)+'L'+F(cx2+w2)+' '+F(y0+K*w2+t2)+'L'+F(cx2)+' '+F(y0+t2)+'L'+F(cx2-w2)+' '+F(y0+K*w2+t2)+'Z';
        return '<path d="'+o2+' '+i3+'" fill-rule="evenodd" fill="'+p.ink+'"/>'; };
      const kglyph=(cx2,cy2,w,D)=>{ const sc=(K*w+D)/180, pts=[[240,40],[190,40],[100,130],[190,220],[240,220],[150,130]];
        const ox=cx2-170*sc, oy=cy2-40*sc;
        return '<path d="M'+pts.map(q=>F(ox+q[0]*sc)+' '+F(oy+q[1]*sc)).join('L')+'Z" fill="'+p.ink+'"/>'; };
      const ph=[rnd()*6.283,rnd()*6.283,rnd()*6.283];
      const fld=(x,y)=>{ const a=x/Tw*6.283, b=y/Th*6.283;
        const v=Math.sin(a+ph[0])+Math.sin(b*2+ph[1])+0.8*Math.sin(a*2+b+ph[2]);
        return Math.max(0,Math.min(1,(v+2.8)/5.6)); };
      const seedOff=Math.floor(rnd()*6);
      const drawWt=(wt,cxx,cyy,w,D,s)=>{ s=s||1;
        if(wt<=0){ inner+=band(cxx,cyy,w,D,s); }
        else if(wt<4){ const n3=wt+1, t=D/(2*n3-1);
          for(let s3=0;s3<n3;s3++) inner+=band(cxx,cyy+s*s3*t*2,w,t,s); }
        else if(wt===4){ inner+=dotchev(cxx,cyy,w,4,Math.max(1.6,D/7),D,s); }
        else if(wt===5){ inner+=dotchev(cxx,cyy,w,3,Math.max(1.2,D/10),D,s); }
        else { inner+=keyline(cxx,cyy,w,D); } };
      const skip=new Set();
      for(let j=0;j<nyC;j++) for(let i=0;i<nxC;i++){
        if(skip.has(j*nxC+i)) continue;
        const off=(j%2)?ux/2:0;
        const cx2=(i*ux+off+ux/2)%Tw, cy2=j*uy+uy*0.18;
        const jx=(rnd()*2-1)*ux*0.06*jf, jy=(rnd()*2-1)*uy*0.08*jf;
        const w=ux*0.32, D=w*0.5, hgt=K*w+D;
        let wt=(i*3+j*5+seedOff)%6;
        if(m==='chevkey') wt=(i*3+j*5+seedOff)%7;
        if(m==='chevgrad') wt=Math.min(5,Math.floor((1-(j+0.5)/nyC)*6));   // solid at the floor, dots at the top
        if(m==='chevfield') wt=5-Math.min(5,Math.floor(fld(cx2,cy2)*6));   // bold chevrons cluster in field blobs
        const roll=rnd();
        // wrap-aware emit on both seams so no chevron is cut
        const X=cx2+jx, Y=cy2+jy;
        const xs=[X]; if(X-w*2.1<0) xs.push(X+Tw); if(X+w*2.1>Tw) xs.push(X-Tw);
        const ys=[Y]; if(Y-w<0) ys.push(Y+Th); if(Y+hgt*2.1>Th) ys.push(Y-Th);
        for(const cxx of xs) for(const cyy of ys){
          if(m==='chevherr'){                            // herringbone: horizontal, alternating point
            const s=(i%2)?1:-1, wtH=wt%5, cyH=cyy+w*0.55, cxH=cxx-(K*w+D)/2;
            if(wtH===0) inner+=bandH(cxH,cyH,w,D,s);
            else { const n3=wtH+1, t=D/(2*n3-1);
              for(let s3=0;s3<n3;s3++) inner+=bandH(cxH+s*s3*t*2,cyH,w,t,s); }
            continue; }
          if(m==='chevud'&&(j%2)){                       // alternate rows point down
            drawWt(wt,cxx,cyy+hgt,w,D,-1); continue; }
          if(m==='chevkleeq'&&roll<0.08){ inner+=kglyph(cxx,cyy,w,D); continue; }
          if(m==='chevacc'&&roll<0.06){ inner+=band(cxx,cyy,w,D,1,'#ec3013'); continue; }
          if(m==='chevanchor'&&roll<0.07&&i<nxC-1&&!skip.has(j*nxC+i+1)&&(j%2)===0){
            skip.add(j*nxC+i+1);                         // double-size anchor spans two cells
            inner+=band(cxx+ux/2,cyy,w*1.9,w*0.9);
            continue; }
          drawWt(wt,cxx,cyy,w,D,1);
        }
      }
      return { Tw, Th, inner };
    }
    if(m==='hexwcamo'||m==='pentwcamo'||m==='triwcamo'){
      // same engine as dot-weights camo, but each cell draws a regular hexagon / pentagon
      const unit=Math.max(8,cell*0.3+(p.gap||18)*0.2);
      const nx=Math.max(18,Math.round(cell*12/unit)), ny=nx;
      const Tw=nx*unit, Th=ny*unit, rnd=this.rng(p.seed), jf=(p.jitter||0)/100;
      const ph=[rnd()*6.283,rnd()*6.283,rnd()*6.283];
      const fld=(x,y)=>{ const a=x/Tw*6.283, b=y/Th*6.283;
        return Math.sin(a*1.3+ph[0])+Math.sin(b*1.7+ph[1])+0.9*Math.sin(a*2.1+b*1.2+ph[2]); };
      const B=3, bxN=Math.ceil(nx/B), byN=Math.ceil(ny/B);
      const lvlOfBlock=(bi,bj)=>{
        const v=fld((bi*B+B/2)*unit,(bj*B+B/2)*unit);
        const t=(v+2.9)/5.8;
        return Math.max(0,Math.min(5,Math.floor(t*6)));
      };
      const wts=[0.0,0.14,0.22,0.3,0.38,0.46];
      const F=v=>v.toFixed(1);
      const sides=(m==='hexwcamo')?6:(m==='pentwcamo')?5:3;
      const a0=(m==='hexwcamo')?0.5236:-1.5708;          // flat-top hex; point-up pentagon/triangle
      const outline=p.style==='outline', osw=Math.max(0.8,(p.stroke||1.4)).toFixed(2);
      const attr=outline?('fill="none" stroke="'+p.ink+'" stroke-width="'+osw+'" stroke-linejoin="round"'):('fill="'+p.ink+'"');
      const poly=(cx2,cy2,r)=>{ let d='';
        for(let k=0;k<sides;k++){ const a=a0+k*6.2832/sides; d+=(k?'L':'M')+F(cx2+Math.cos(a)*r)+' '+F(cy2+Math.sin(a)*r); }
        return '<path d="'+d+'Z" '+attr+'/>'; };
      let inner='';
      for(let j=0;j<ny;j++) for(let i=0;i<nx;i++){
        const L=lvlOfBlock(Math.floor(i/B)%bxN,Math.floor(j/B)%byN);
        let r=wts[L]*unit;
        if(L===0){ if(rnd()>0.12*(1+jf)) continue; r=unit*0.09; }
        else { const airy=(fld((i+7.3)*unit*1.9,(j+3.1)*unit*1.9)+2.9)/5.8;
          if(rnd()<0.03+airy*0.2) continue;                 // airy zones drop more shapes
          r*=0.78+rnd()*0.22; }                             // per-shape random whitespace
        const jmax=unit*0.12*jf;
        const rCap=unit*0.5-jmax-Math.max(1,unit*0.06);     // guaranteed gap, jitter included
        r=Math.min(r,rCap);
        const x=(i+0.5)*unit+(rnd()*2-1)*jmax, y=(j+0.5)*unit+(rnd()*2-1)*jmax;
        inner+=poly(x,y,r);
      }
      return { Tw, Th, inner };
    }
    if(m==='blobwcamo'||m==='blobwhex'||m==='blobwtri'){
      // camo blotches drawn as dot fields: each blotch is a metaball blob filled with
      // circles of ONE weight — a different weight per blob, so the weight itself
      // differentiates the camo shapes. Background stays open with sparse dust.
      const unit=Math.max(8,cell*0.3+(p.gap||18)*0.2);
      const nx=Math.max(20,Math.round(cell*13/unit)), ny=nx;
      const Tw=nx*unit, Th=ny*unit, rnd=this.rng(p.seed*131+Math.round(p.scale||0)*17+Math.round(p.gap||0)*7), jf=(p.jitter||0)/100;
      // blobs: 2-3 lobes each, wrap-aware; weight index cycles so neighbors differ
      const wts=[]; for(let k=0;k<30;k++) wts.push(0.08+k*(0.52-0.08)/29);
      // shuffle so which weight lands on which shape varies by seed
      const order=wts.map((_,k)=>k);
      for(let k=order.length-1;k>0;k--){ const q=Math.floor(rnd()*(k+1)); const t2=order[k]; order[k]=order[q]; order[q]=t2; }
      const shpOrder=[0,1,2,3,4,5,6,7,8,9];
      while(shpOrder.length<30) shpOrder.push(Math.floor(rnd()*10));
      for(let k=shpOrder.length-1;k>0;k--){ const q=Math.floor(rnd()*(k+1)); const t2=shpOrder[k]; shpOrder[k]=shpOrder[q]; shpOrder[q]=t2; }
      const nB=Math.max(8,Math.round(30*((p.blotchQty==null?100:p.blotchQty)/100)));  // two passes through the 15 weights
      const blobs=[];
      for(let att=0; att<300 && blobs.length<nB; att++){
        const bx=rnd()*Tw, by=rnd()*Th;
        let ok=true;
        for(const b2 of blobs){ let dx=Math.abs(bx-b2.x); dx=Math.min(dx,Tw-dx); let dy=Math.abs(by-b2.y); dy=Math.min(dy,Th-dy);
          if(Math.hypot(dx,dy)<Tw*(0.085+rnd()*0.035)){ ok=false; break; } }
        if(!ok) continue;
        // 6 blotch archetypes -> clearly different silhouettes
        const shape=shpOrder[blobs.length%30], sc2=0.45+rnd()*0.75, lobes=[[bx,by,Tw*(0.065+rnd()*0.05)*sc2]];
        let a=rnd()*6.283;
        if(shape===0){ // wandering spine (amoeba)
          let px2=bx, py2=by;
          for(let l2=0;l2<3+Math.floor(rnd()*4);l2++){ a+=(rnd()-0.5)*2.8; const d2=Tw*(0.035+rnd()*0.055)*sc2;
            px2+=Math.cos(a)*d2; py2+=Math.sin(a)*d2; lobes.push([px2,py2,Tw*(0.03+rnd()*0.05)*sc2]); }
        } else if(shape===1){ // long straight streak
          for(let l2=1;l2<=3+Math.floor(rnd()*3);l2++){ const bend=a+(rnd()-0.5)*0.5; lobes.push([bx+Math.cos(bend)*Tw*0.05*l2*sc2, by+Math.sin(bend)*Tw*0.05*l2*sc2, Tw*(0.028+rnd()*0.035)*sc2]); }
        } else if(shape===2){ // compact rounded mass
          for(let l2=0;l2<3+Math.floor(rnd()*4);l2++){ const a2=rnd()*6.283, d2=Tw*(0.015+rnd()*0.04)*sc2;
            lobes.push([bx+Math.cos(a2)*d2, by+Math.sin(a2)*d2, Tw*(0.04+rnd()*0.045)*sc2]); }
        } else if(shape===3){ // arc / hook
          const curv=0.35+rnd()*0.5, rad2=Tw*(0.06+rnd()*0.05)*sc2;
          for(let l2=1;l2<=4+Math.floor(rnd()*3);l2++){ const a2=a+l2*curv; lobes.push([bx+Math.cos(a2)*rad2, by+Math.sin(a2)*rad2, Tw*(0.028+rnd()*0.03)*sc2]); }
        } else if(shape===4){ // branched Y
          for(const br of [a, a+1.6+rnd()*1.2, a+3.6+rnd()*1.4]){ for(let l2=1;l2<=1+Math.floor(rnd()*3);l2++){
            lobes.push([bx+Math.cos(br)*Tw*0.05*l2*sc2, by+Math.sin(br)*Tw*0.05*l2*sc2, Tw*(0.028+rnd()*0.035)*sc2]); } }
        } else if(shape===6){ // S-curve
          const curv=0.4+rnd()*0.3, rad2=Tw*(0.05+rnd()*0.04)*sc2;
          for(let l2=1;l2<=5;l2++){ const a2=a+(l2<3?l2*curv:-(l2-2)*curv); lobes.push([bx+Math.cos(a2)*rad2*l2*0.5, by+Math.sin(a2)*rad2*l2*0.5, Tw*(0.026+rnd()*0.03)*sc2]); }
        } else if(shape===7){ // scatter cloud
          for(let l2=0;l2<5+Math.floor(rnd()*3);l2++){ const a2=rnd()*6.283, d2=Tw*(0.03+rnd()*0.08)*sc2;
            lobes.push([bx+Math.cos(a2)*d2, by+Math.sin(a2)*d2, Tw*(0.018+rnd()*0.03)*sc2]); }
        } else if(shape===8){ // wedge taper — big head thinning to a tail
          for(let l2=1;l2<=4+Math.floor(rnd()*2);l2++){ const bend=a+(rnd()-0.5)*0.4;
            lobes.push([bx+Math.cos(bend)*Tw*0.045*l2*sc2, by+Math.sin(bend)*Tw*0.045*l2*sc2, Tw*(0.05-l2*0.007+rnd()*0.012)*sc2]); }
        } else if(shape===9){ // L-elbow
          const a2=a+1.5708*(rnd()<0.5?1:-1);
          for(let l2=1;l2<=3;l2++) lobes.push([bx+Math.cos(a)*Tw*0.05*l2*sc2, by+Math.sin(a)*Tw*0.05*l2*sc2, Tw*(0.03+rnd()*0.025)*sc2]);
          const ex=bx+Math.cos(a)*Tw*0.15*sc2, ey=by+Math.sin(a)*Tw*0.15*sc2;
          for(let l2=1;l2<=2+Math.floor(rnd()*2);l2++) lobes.push([ex+Math.cos(a2)*Tw*0.05*l2*sc2, ey+Math.sin(a2)*Tw*0.05*l2*sc2, Tw*(0.028+rnd()*0.025)*sc2]);
        } else { // small twin islands
          const nIsl=1+Math.floor(rnd()*2);
          for(let l2=0;l2<nIsl;l2++){ const a2=rnd()*6.283;
            lobes.push([bx+Math.cos(a2)*Tw*(0.08+rnd()*0.05)*sc2, by+Math.sin(a2)*Tw*(0.08+rnd()*0.05)*sc2, Tw*(0.035+rnd()*0.035)*sc2]); }
        }
        blobs.push({x:bx,y:by,lobes,w:wts[order[blobs.length%order.length]]});
      }
      // small satellite scraps between the main blotches
      const nS=6+Math.floor(rnd()*4);
      for(let att=0; att<200 && blobs.length<nB+nS; att++){
        const bx=rnd()*Tw, by=rnd()*Th;
        let ok=true;
        for(const b2 of blobs){ let dx=Math.abs(bx-b2.x); dx=Math.min(dx,Tw-dx); let dy=Math.abs(by-b2.y); dy=Math.min(dy,Th-dy);
          if(Math.hypot(dx,dy)<Tw*0.09){ ok=false; break; } }
        if(!ok) continue;
        const sc2=0.22+rnd()*0.2, lobes=[[bx,by,Tw*(0.05+rnd()*0.04)*sc2]];
        const nL=Math.floor(rnd()*2);
        for(let l2=0;l2<nL;l2++){ const a2=rnd()*6.283;
          lobes.push([bx+Math.cos(a2)*Tw*0.04*sc2*3, by+Math.sin(a2)*Tw*0.04*sc2*3, Tw*(0.035+rnd()*0.03)*sc2]); }
        blobs.push({x:bx,y:by,lobes,w:wts[Math.floor(rnd()*3)]});  // lightest weights
      }
      // influence of blob at point (wrap-aware metaball sum)
      const infl=(b2,x,y)=>{ let s=0;
        for(const [lx,ly,lr] of b2.lobes){
          let dx=Math.abs(x-lx); dx=Math.min(dx,Tw-dx);
          let dy=Math.abs(y-ly); dy=Math.min(dy,Th-dy);
          const d2=dx*dx+dy*dy; s+=lr*lr/(d2+1); }
        return s; };
      const F=v=>v.toFixed(1);
      const outline=p.style==='outline', osw=Math.max(0.8,(p.stroke||1.4)).toFixed(2);
      const attr=outline?('fill="none" stroke="'+p.ink+'" stroke-width="'+osw+'"'):('fill="'+p.ink+'"');
      // edge-wobble noise: modulates the boundary so blotch edges bite in and out
      const wp=[rnd()*6.283,rnd()*6.283,rnd()*6.283];
      const wob=(x,y)=>{ const a2=x/Tw*6.283, b3=y/Th*6.283;
        return 0.2*Math.sin(a2*3.1+wp[0])+0.16*Math.sin(b3*4.3+wp[1])+0.14*Math.sin((a2+b3)*5.7+wp[2]); };
      // domain warp field: bends space before the influence test so each boundary meanders uniquely
      const dp=[rnd()*6.283,rnd()*6.283,rnd()*6.283,rnd()*6.283];
      const warp=(x,y)=>{ const a2=x/Tw*6.283, b3=y/Th*6.283;
        return [x+unit*(1.4*Math.sin(b3*2.3+dp[0])+0.9*Math.sin((a2*1.7+b3*0.6)+dp[1])),
                y+unit*(1.4*Math.sin(a2*2.7+dp[2])+0.9*Math.sin((b3*1.9+a2*0.8)+dp[3]))]; };
      let inner='';
      for(let j=0;j<ny;j++) for(let i=0;i<nx;i++){
        const x=(i+0.5)*unit, y=(j+0.5)*unit;
        const [wx,wy]=warp(x,y);
        let best=null, bestV=0;
        for(const b2 of blobs){ const v=infl(b2,wx,wy); if(v>bestV){ bestV=v; best=b2; } }
        const th=0.55+wob(wx,wy);                           // wobbling boundary in warped space
        let r;
        if(bestV>th) r=best.w*unit*(0.94+rnd()*0.06);        // inside a blotch: solid mass, its weight
        else if(bestV>th*0.82 && rnd()<0.4) r=best.w*unit*0.55; // thin ragged fringe
        else { if(rnd()>0.06*(1+jf)) continue; r=unit*0.08; } // open field: sparse dust
        const jmax=unit*(0.07+0.1*jf);                       // organic base jitter + slider
        const rCap=unit*0.5-jmax-Math.max(1,unit*0.05);      // guaranteed gap even when jittered together
        const gx=x+(rnd()*2-1)*jmax, gy=y+(rnd()*2-1)*jmax, gr=Math.min(r,rCap);
        if(m==='blobwcamo'){ inner+='<circle cx="'+F(gx)+'" cy="'+F(gy)+'" r="'+F(gr)+'" '+attr+'/>'; }
        else { const sides=(m==='blobwhex')?6:3, a0=(m==='blobwhex')?0.5236:-1.5708;
          let d='';
          for(let q=0;q<sides;q++){ const a2=a0+q*6.2832/sides; d+=(q?'L':'M')+F(gx+Math.cos(a2)*gr)+' '+F(gy+Math.sin(a2)*gr); }
          inner+='<path d="'+d+'Z" '+attr+'/>'; }
      }
      return { Tw, Th, inner };
    }
    const jset={ dots:1, rings:1, plus:1, triangles:1, cubes:1, kleeq:1 };
    if(p.jitter>0 && jset[m]){
      const N=4, T=cell*N, rnd=this.rng(p.seed), jmax=(p.gap/2)*(p.jitter/100);
      let inner='';
      for(let i=0;i<N;i++) for(let j=0;j<N;j++){ const dx=(rnd()*2-1)*jmax, dy=(rnd()*2-1)*jmax; inner+=this.motifMarkup(p,m,cell/2+i*cell+dx,cell/2+j*cell+dy,cell); }
      return { T, inner };
    }
    return { T:cell, inner:this.motifMarkup(p,m,cell/2,cell/2,cell) };
  }

  /* Digital blotch camo — the engraving case: one ink, one ground, a handful of large
     masses. Everything here serves a cutter or a laser rather than a screen.
     The field is a chain of overlapping gaussians that walks a random heading, so each
     mass reads as one elongated camo shape instead of a circle, and a gentle domain warp
     bends the coastline. It is then quantised onto a block grid — that quantisation IS
     the digital look, and it also guarantees every edge is axis-aligned.
     Output is the BOUNDARY of the blotches, not a pile of squares: every cell edge with
     an empty neighbour is emitted clockwise around its cell, and chaining those edges
     closes into loops — outer boundaries clockwise, enclosed voids counter-clockwise — so
     a single nonzero-fill path carries the masses and knocks out their holes. That gives
     one selectable object with a real cut line, where merged rectangles would have left
     thousands of internal seams for a laser to trace. */
  buildDigBlotch(W,H,p){
    const px=Math.max(6,(p.scale||80)*0.34);
    const gw=Math.max(2,Math.ceil(W/px)), gh=Math.max(2,Math.ceil(H/px));
    const rnd=this.rng((p.seed||7)*911+37);
    const jf=(p.jitter||0)/100;
    const bq=(p.blotchQty==null?100:p.blotchQty)/100;
    /* Blotch size is ONE length. A sum of placed gaussians could not give that: the cut
       level is a coverage quantile, so shrinking the masses just packed more of them into
       the same 45% and the marbling came out the same size every time. Value noise has a
       single correlation length instead — halve L and every blotch halves with it. */
    /* gap==null, not gap||20 — a gap of 0 is a legitimate setting (the smallest
       blotches) and the falsy fallback was silently promoting it to 20. */
    const L=Math.min(W,H)*(0.030+(p.gap==null?20:p.gap)/100*0.195)/Math.sqrt(Math.max(0.35,bq));
    const sd=(p.seed||7)|0;
    const hsh=(x,y,k)=>{
      let n=x*374761393+y*668265263+(sd*31+k)*1274126177;
      n=(n^(n>>>13))*1274126177;
      return ((n^(n>>>16))>>>0)/4294967295;
    };
    const nz=(x,y,k)=>{
      const x0=Math.floor(x), y0=Math.floor(y), fx=x-x0, fy=y-y0;
      const sx=fx*fx*(3-2*fx), sy=fy*fy*(3-2*fy);
      const a0=hsh(x0,y0,k), b0=hsh(x0+1,y0,k), c0=hsh(x0,y0+1,k), d0=hsh(x0+1,y0+1,k);
      return (a0*(1-sx)+b0*sx)*(1-sy)+(c0*(1-sx)+d0*sx)*sy;
    };
    /* Rotation spins the FIELD, not the drawing: only the coordinates fed to it are
       turned, so the block grid stays axis-aligned. The orthogonal steps are the whole
       point of a digital camo and a cutter wants them square — rotating the finished
       geometry would put every edge off-axis and turn each step into a bevel. */
    const rr=((p.rotation||0)*Math.PI)/180, rc=Math.cos(rr), rs=Math.sin(rr);
    const ccx=W/2, ccy=H/2, wA=0.26+jf*0.5;
    const fld=(x0,y0)=>{
      let x=x0, y=y0;
      if(rr){ const ox=x0-ccx, oy=y0-ccy; x=ccx+ox*rc-oy*rs; y=ccy+ox*rs+oy*rc; }
      const ux=x/L, uy=y/L;
      /* domain warp — without it the masses sit in rounded lattice cells and read as a
         grid of spots rather than as camo that wanders */
      const dx=wA*(nz(ux*0.55+11.3,uy*0.55+4.1,4)-0.5)*2;
      const dy=wA*(nz(ux*0.55-7.7,uy*0.55+19.5,4)-0.5)*2;
      const sx2=ux+dx, sy2=uy+dy;
      return 0.62*nz(sx2,sy2,1)+0.26*nz(sx2*2.2,sy2*2.2,2)+0.12*nz(sx2*4.5,sy2*4.5,3);
    };
    const v=new Float32Array(gw*gh);
    for(let j=0;j<gh;j++) for(let i=0;i<gw;i++){
      /* the dither only roughens the coastline; at jitter 0 the edges stay perfectly
         blocky, which is what an engraver wants */
      v[j*gw+i]=fld((i+0.5)*px,(j+0.5)*px)+(rnd()-0.5)*jf*0.30;
    }
    /* The cut level is a QUANTILE of the field, not a fixed number. A sum of gaussians
       has no bounded range — it scales with how many masses overlap — so a fixed
       threshold floods the sheet solid at one setting and leaves it bare at the next.
       Taking the level that leaves ~45% ink keeps figure and ground legible at every
       mass size and count, which is the whole point of a two-tone camo. */
    const srt=Float32Array.from(v).sort();
    const lvl=srt[Math.floor(srt.length*0.55)];
    let cur=new Uint8Array(gw*gh);
    for(let i=0;i<v.length;i++) if(v[i]>lvl) cur[i]=1;
    /* Majority smoothing, run to a fixed point rather than once. A single sweep reads
       its input and writes a separate output, so it never sees what it just did — and a
       plus of five blocks is the failing case: the centre has four set neighbours and
       survives while all four arms have one each and are deleted, leaving a brand-new
       lone block that nothing revisits. Iterating until nothing changes closes that. */
    {
      let nxt=new Uint8Array(gw*gh);
      const nAt=(src,i,j)=>(i<0||j<0||i>=gw||j>=gh)?0:src[j*gw+i];
      for(let pass=0;pass<4;pass++){
        let changed=0;
        for(let j=0;j<gh;j++) for(let i=0;i<gw;i++){
          const o=j*gw+i, n=nAt(cur,i-1,j)+nAt(cur,i+1,j)+nAt(cur,i,j-1)+nAt(cur,i,j+1);
          const w=cur[o] ? (n<=1?0:1) : (n>=3?1:0);
          nxt[o]=w; if(w!==cur[o]) changed++;
        }
        const t=cur; cur=nxt; nxt=t;
        if(!changed) break;
      }
    }
    const g=cur;
    /* Then a hard floor on feature size, because majority smoothing alone still leaves
       two-block dominoes standing. Every connected run of blocks below the floor is
       flipped to whatever surrounds it — applied to voids as well as to ink, since a
       pinhole costs an engraver the same wasted traverse as a speck. */
    {
      const MINB=4, lab=new Int32Array(gw*gh).fill(-1), stack=new Int32Array(gw*gh);
      for(let s0=0;s0<g.length;s0++){
        if(lab[s0]>=0) continue;
        const val=g[s0], cells=[];
        let sp=0;
        lab[s0]=s0; stack[sp++]=s0;
        while(sp){
          const o=stack[--sp]; cells.push(o);
          const i=o%gw, j=(o-i)/gw;
          if(i>0&&lab[o-1]<0&&g[o-1]===val){ lab[o-1]=s0; stack[sp++]=o-1; }
          if(i<gw-1&&lab[o+1]<0&&g[o+1]===val){ lab[o+1]=s0; stack[sp++]=o+1; }
          if(j>0&&lab[o-gw]<0&&g[o-gw]===val){ lab[o-gw]=s0; stack[sp++]=o-gw; }
          if(j<gh-1&&lab[o+gw]<0&&g[o+gw]===val){ lab[o+gw]=s0; stack[sp++]=o+gw; }
        }
        /* a flipped run always merges into the mass that already enclosed it, so this
           can never mint a new undersized run of its own */
        if(cells.length<MINB){ const w=val?0:1; for(let q=0;q<cells.length;q++) g[cells[q]]=w; }
      }
    }
    const at=(i,j)=>(i<0||j<0||i>=gw||j>=gh)?0:g[j*gw+i];

    const KV=(x,y)=>x+y*(gw+2);
    const es=[], byStart=new Map();
    const push=(x0,y0,x1,y1)=>{ const id=es.length; es.push([x0,y0,x1,y1]);
      const k=KV(x0,y0), a=byStart.get(k); if(a) a.push(id); else byStart.set(k,[id]); };
    for(let j=0;j<gh;j++) for(let i=0;i<gw;i++){
      if(!g[j*gw+i]) continue;
      if(!at(i,j-1)) push(i,j,i+1,j);
      if(!at(i+1,j)) push(i+1,j,i+1,j+1);
      if(!at(i,j+1)) push(i+1,j+1,i,j+1);
      if(!at(i-1,j)) push(i,j+1,i,j);
    }
    const used=new Uint8Array(es.length);
    /* The block grid covers the canvas by rounding UP, so the last column and row run
       past the edge by up to one block. On screen the viewport hides it, but this file
       is a cut path: art outside the document lands outside the declared work area on a
       laser bed. Clamping per axis trims that last block flush and keeps every edge
       axis-aligned, since it only ever moves a coordinate along one axis. */
    const FX=n=>+Math.min(n*px,W).toFixed(1), FY=n=>+Math.min(n*px,H).toFixed(1);
    let d='';
    for(let s=0;s<es.length;s++){
      if(used[s]) continue;
      used[s]=1;
      const st0=es[s], pts=[[st0[0],st0[1]]];
      let cx=st0[2], cy=st0[3], dx=st0[2]-st0[0], dy=st0[3]-st0[1], guard=0;
      while(guard++<400000){
        const list=byStart.get(KV(cx,cy)); if(!list) break;
        let nid=-1;
        /* Continue STRAIGHT wherever possible. Two blotches that touch only at a corner
           share a vertex, and turning there would weld them into one loop. */
        for(const id of list){ if(used[id]) continue;
          const q=es[id]; if(q[2]-q[0]===dx&&q[3]-q[1]===dy){ nid=id; break; } }
        if(nid<0) for(const id of list){ if(!used[id]){ nid=id; break; } }
        if(nid<0) break;
        used[nid]=1;
        const q=es[nid], ndx=q[2]-q[0], ndy=q[3]-q[1];
        if(ndx!==dx||ndy!==dy){ pts.push([q[0],q[1]]); dx=ndx; dy=ndy; }
        cx=q[2]; cy=q[3];
        if(cx===st0[0]&&cy===st0[1]) break;
      }
      if(pts.length<3) continue;
      d+='M'+FX(pts[0][0])+' '+FY(pts[0][1]);
      for(let q2=1;q2<pts.length;q2++) d+='L'+FX(pts[q2][0])+' '+FY(pts[q2][1]);
      d+='Z';
    }
    if(!d) return '';
    return '<path d="'+d+'" fill="'+p.ink+'" fill-rule="nonzero"/>';
  }
  isField(m){ return ['digblotch','stepbars','slabdiag','hatchcamo','hatchdig','hatchshift','dotsqcamo','topocont','topodisc','wavegrad','warp','warpflow','warpfocal','skulls','burst','nova','comettrail','shower','skullnet','skullcamo','skullhex','skullhexflat','skullhexlaser','kleeqhex','kleeqkhex','kleeqhexlaser','kleeqkhexlaser','kleeqduo','kleeqduolaser','kleeqduoflat','kleeqscatter','kleeqscatterlaser','kleeqtrio','kleeqscale','kleeqhalfdrop','kleeqtwo','archweave','ribbons','isocity','isogrid','isowire','isoink','hexcamo','hexhalf','hexcube','hexcubemil','hexcubelaser','rhombhalf','rhomblaser','blobcamo'].includes(m); }
  isLaser(m){ return ['rhomblaser','hexcubelaser','skullhexlaser','kleeqduolaser'].includes(m); }

  buildKleeqDuo(W,H,p,mode,maskMode,scatter,flat,opts){
    const o=opts||{}, glyphs=o.glyphs||2, scaleVary=o.scaleVary, halfDrop=o.halfDrop, twoColor=o.twoColor;
    const laser=mode==='laser', ink=laser?'#000000':p.ink, gnd=p.ground, acc=p.accent||'#ec3013', f=n=>n.toFixed(1);
    const mw=150, mh=150, md1=this._kleeqMask(mw,mh), md2=this._kleeqKMask(mw,mh), md3=glyphs>=3?this._hexGlyphMask(mw,mh):null;
    const inside=(md,lx,ly,kW,kH)=>{ const mx=Math.floor(lx/kW*mw), my=Math.floor(ly/kH*mh); if(mx<0||my<0||mx>=mw||my>=mh) return 0; return md[(my*mw+mx)*4]<128?1:0; };
    const kW=Math.max(150,p.scale*2.2), kH=kW, gapX=p.gap*1.5, gapY=p.gap*1.5;
    const stepX=kW*0.92+gapX, stepY=kH*0.92+gapY, R=kW*0.048, dx=1.5*R, dy=Math.sqrt(3)*R;
    const G=Math.max(8,Math.round(18*(W/1700))), n1=this._camoNoise(p.seed,G), n2=this._camoNoise(p.seed*7+3,G*2);
    const palInk=[this.mix(ink,gnd,0.1),this.mix(ink,gnd,0.32),this.mix(ink,gnd,0.54),this.mix(ink,gnd,0.76)];
    const palAcc=[this.mix(acc,gnd,0.1),this.mix(acc,gnd,0.32),this.mix(acc,gnd,0.54),this.mix(ink,gnd,0.76)];
    const th=[0.34,0.5,0.66], idx=v=>{ if(v>th[2])return 3; if(v>th[1])return 2; if(v>th[0])return 1; return 0; };
    const rnd=this.rng(p.seed*3+1), jit=p.jitter/100, sw=Math.max(0.6,p.stroke*0.4).toFixed(2);
    const strokeAttr=(!laser&&p.stroke>0)?` stroke="${this.mix(ink,gnd,0.92)}" stroke-width="${(p.stroke*0.4).toFixed(2)}" stroke-linejoin="round"`:'';
    const masks = maskMode==='arrow'?[md1] : maskMode==='k'?[md2] : glyphs>=3?[md1,md2,md3] : [md1,md2];
    const glyphAt=(rr,cc)=>{ const n=masks.length; return (((rr+cc)%n)+n)%n; };
    const rotFor=(rr,cc)=>{ const h=((rr*73856093)^(cc*19349663))>>>0; return (h%4)*90; };
    const rotPt=(lx,ly,rot)=>{ if(!rot) return [lx,ly]; const c0=kW/2,dx0=lx-c0,dy0=ly-c0,r=-rot*Math.PI/180,co=Math.cos(r),si=Math.sin(r); return [c0+dx0*co-dy0*si, c0+dx0*si+dy0*co]; };
    const sfFor=(rr,cc)=>{ if(!scaleVary) return 1; const h=((rr*2654435761)^(cc*40503))>>>0; return (h%3===0)?0.52:1; };
    const posOf=(rr,cc)=>[ cc*stepX+(halfDrop?0:((((rr%2)+2)%2)?stepX/2:0)), rr*stepY+(halfDrop?((((cc%2)+2)%2)?stepY/2:0):0) ];
    const glyphHit=(cx,cy)=>{ const ri=Math.round(cy/stepY), ci=Math.round(cx/stepX);
      for(let rr=ri-1;rr<=ri+1;rr++) for(let cc=ci-1;cc<=ci+1;cc++){ const pos=posOf(rr,cc), sf=sfFor(rr,cc);
        let lx=cx-pos[0], ly=cy-pos[1]; if(sf!==1){ lx=(lx-kW/2)/sf+kW/2; ly=(ly-kH/2)/sf+kH/2; }
        if(scatter){ const q=rotPt(lx,ly,rotFor(rr,cc)); lx=q[0]; ly=q[1]; }
        if(lx>=0&&ly>=0&&lx<kW&&ly<kH&&inside(masks[glyphAt(rr,cc)],lx,ly,kW,kH)) return glyphAt(rr,cc)+1; }
      return 0; };
    const ext=0.12+(Math.min(90,Math.abs(p.rotation))/90)*0.6, mc=Math.ceil(ext*W/dx), mr=Math.ceil(ext*H/dy);
    const cols=Math.ceil(W/dx)+2, rows=Math.ceil(H/dy)+2; let s='';
    for(let c=-1-mc;c<cols+mc;c++) for(let rw=-1-mr;rw<rows+mr;rw++){ const cx=c*dx, cy=rw*dy+(c&1?dy/2:0);
      const P=this._hexPts(cx,cy,R-0.6); let base=0.6*n1(cx/W,cy/H)+0.4*n2(cx/W,cy/H); base=(base-0.5)*1.4+0.5;
      const which=glyphHit(cx,cy); base+= which?-0.34:0.28; if(jit>0) base+=(rnd()-0.5)*jit;
      const pal=(twoColor&&which===1)?palAcc:palInk;
      if(flat){ if(Math.max(0,Math.min(0.999,base))<0.5) s+=`<path d="M${P.map(q=>f(q[0])+','+f(q[1])).join(' L')} Z" fill="${(twoColor&&which===1)?acc:ink}"${strokeAttr}/>`; continue; }
      const rh=[[P[5],P[0],P[1]],[P[1],P[2],P[3]],[P[3],P[4],P[5]]], offs=[0.1,0,-0.1];
      rh.forEach((tr,k)=>{ const v=Math.max(0,Math.min(0.999,base+offs[k])), id=idx(v);
        if(!laser){ s+=`<path d="M${f(cx)},${f(cy)} L${tr.map(q=>f(q[0])+','+f(q[1])).join(' L')} Z" fill="${pal[id]}"${strokeAttr}/>`; return; }
        const edge=`M${f(cx)},${f(cy)} L${f(tr[0][0])},${f(tr[0][1])} L${f(tr[1][0])},${f(tr[1][1])} L${f(tr[2][0])},${f(tr[2][1])} Z`;
        const hatch=nn=>{ let d=''; for(let q=1;q<=nn;q++){ const t=q/(nn+1); d+=`M${f(cx+(tr[0][0]-cx)*t)},${f(cy+(tr[0][1]-cy)*t)} L${f(cx+(tr[2][0]-cx)*t)},${f(cy+(tr[2][1]-cy)*t)} `; } return d; };
        if(id===0) s+=`<path d="${hatch(4)}" stroke="${ink}" stroke-width="${sw}" fill="none"/><path d="${edge}" stroke="${ink}" stroke-width="${sw}" fill="none"/>`;
        else if(id===1) s+=`<path d="${hatch(2)}" stroke="${ink}" stroke-width="${sw}" fill="none"/><path d="${edge}" stroke="${ink}" stroke-width="${sw}" fill="none"/>`;
        else if(id===2) s+=`<path d="${edge}" stroke="${ink}" stroke-width="${sw}" fill="none"/>`; }); }
    return this._isoRot(s,W,H,p);
  }
  _hexGlyphMask(mw,mh){
    const c=document.createElement('canvas'); c.width=mw; c.height=mh;
    const ctx=c.getContext('2d'); ctx.fillStyle='#fff'; ctx.fillRect(0,0,mw,mh);
    ctx.fillStyle='#000'; ctx.beginPath(); const cx=mw/2,cy=mh/2,r=mw*0.42;
    for(let k=0;k<6;k++){ const a=Math.PI/180*(60*k-90), x=cx+r*Math.cos(a), y=cy+r*Math.sin(a); k?ctx.lineTo(x,y):ctx.moveTo(x,y); }
    ctx.closePath(); ctx.fill(); return ctx.getImageData(0,0,mw,mh).data;
  }

  _kleeqKMask(mw,mh){
    const c=document.createElement('canvas'); c.width=mw; c.height=mh;
    const ctx=c.getContext('2d'); ctx.fillStyle='#fff'; ctx.fillRect(0,0,mw,mh);
    ctx.save(); ctx.scale(mw/216,mh/216); ctx.fillStyle='#000';
    const p2p=pts=>{ const n=pts.trim().split(/\s+/); let d='M'+n[0]+','+n[1]; for(let i=2;i<n.length;i+=2) d+=' L'+n[i]+','+n[i+1]; return d+' Z'; };
    ctx.fill(new Path2D(p2p('194 24.7 85.7 24.7 85.7 65.4 102.4 48.8 102.4 41.4 194 41.4 194 174.6 102.4 174.6 102.4 167.2 85.7 150.6 85.7 191.3 102.4 191.3 210.7 191.3 210.7 24.7 194 24.7')));
    ctx.fill(new Path2D(p2p('152.4 133 139.9 120.5 127.4 108 139.9 95.5 152.4 83 164.9 70.5 177.4 58 152.4 58 139.9 70.5 127.4 83 114.9 95.5 102.4 108 114.9 120.5 127.4 133 139.9 145.5 152.4 158 177.4 158 164.9 145.5 152.4 133')));
    ctx.fill(new Path2D('M85.7,65.4h-34.4c-3.6,0-7,1.5-9.5,4.1L5.3,108h0,0s0,0,0,0h0l36.5,38.4c2.5,2.6,5.9,4.1,9.5,4.1h34.4l-20.7-21.8,20.7-20.8h0s-20.7-20.8-20.7-20.8l20.7-21.8ZM58.3,119.7l-13.1-4.5-8.1,11.7v-14.5l-13.1-4.5,13.1-4.5v-14.5s8.1,11.7,8.1,11.7l13.1-4.5-8.1,11.7,8.1,11.7Z'),'evenodd');
    ctx.restore(); return ctx.getImageData(0,0,mw,mh).data;
  }
  buildKleeqKHex(W,H,p){
    const ink=p.ink, gnd=p.ground, f=n=>n.toFixed(1);
    const mw=150, mh=150, md=this._kleeqKMask(mw,mh);
    const inside=(lx,ly,kW,kH)=>{ const mx=Math.floor(lx/kW*mw), my=Math.floor(ly/kH*mh); if(mx<0||my<0||mx>=mw||my>=mh) return 0; return md[(my*mw+mx)*4]<128?1:0; };
    const kW=Math.max(150,p.scale*2.4), kH=kW, gapX=p.gap*1.6, gapY=p.gap*1.6;
    const stepX=kW*0.9+gapX, stepY=kH*0.9+gapY, R=kW*0.05, dx=1.5*R, dy=Math.sqrt(3)*R;
    const G=Math.max(8,Math.round(18*(W/1700))), n1=this._camoNoise(p.seed,G), n2=this._camoNoise(p.seed*7+3,G*2);
    const pal=[this.mix(ink,gnd,0.1),this.mix(ink,gnd,0.32),this.mix(ink,gnd,0.54),this.mix(ink,gnd,0.76)];
    const th=[0.34,0.5,0.66], idx=v=>{ if(v>th[2])return 3; if(v>th[1])return 2; if(v>th[0])return 1; return 0; };
    const rnd=this.rng(p.seed*3+1), jit=p.jitter/100, strokeAttr=p.stroke>0?` stroke="${this.mix(ink,gnd,0.92)}" stroke-width="${(p.stroke*0.4).toFixed(2)}" stroke-linejoin="round"`:'';
    const inAny=(cx,cy)=>{ const ri=Math.round(cy/stepY);
      for(let rr=ri-1;rr<=ri+1;rr++){ const oy=rr*stepY, offb=(((rr%2)+2)%2)?stepX/2:0, ci=Math.round((cx-offb)/stepX);
        for(let cc=ci-1;cc<=ci+1;cc++){ const ox=cc*stepX+offb, lx=cx-ox, ly=cy-oy; if(lx>=0&&ly>=0&&lx<kW&&ly<kH&&inside(lx,ly,kW,kH)) return 1; } }
      return 0; };
    const ext=0.12+(Math.min(90,Math.abs(p.rotation))/90)*0.6, mc=Math.ceil(ext*W/dx), mr=Math.ceil(ext*H/dy);
    const cols=Math.ceil(W/dx)+2, rows=Math.ceil(H/dy)+2; let s='';
    for(let c=-1-mc;c<cols+mc;c++) for(let rw=-1-mr;rw<rows+mr;rw++){ const cx=c*dx, cy=rw*dy+(c&1?dy/2:0);
      const P=this._hexPts(cx,cy,R-0.6); let base=0.6*n1(cx/W,cy/H)+0.4*n2(cx/W,cy/H); base=(base-0.5)*1.4+0.5;
      base+= inAny(cx,cy) ? -0.34 : 0.28; if(jit>0) base+=(rnd()-0.5)*jit;
      const rh=[[P[5],P[0],P[1]],[P[1],P[2],P[3]],[P[3],P[4],P[5]]], offs=[0.1,0,-0.1];
      rh.forEach((tr,k)=>{ const v=Math.max(0,Math.min(0.999,base+offs[k]));
        s+=`<path d="M${f(cx)},${f(cy)} L${tr.map(q=>f(q[0])+','+f(q[1])).join(' L')} Z" fill="${pal[idx(v)]}"${strokeAttr}/>`; }); }
    return this._isoRot(s,W,H,p);
  }

  _kleeqMask(mw,mh){
    const c=document.createElement('canvas'); c.width=mw; c.height=mh;
    const ctx=c.getContext('2d'); ctx.fillStyle='#fff'; ctx.fillRect(0,0,mw,mh);
    ctx.save(); ctx.scale(mw/216,mh/216); ctx.fillStyle='#000'; ctx.fill(new Path2D(this.KPATH),'evenodd'); ctx.restore();
    return ctx.getImageData(0,0,mw,mh).data;
  }
  buildKleeqHex(W,H,p){
    const ink=p.ink, gnd=p.ground, f=n=>n.toFixed(1);
    const mw=150, mh=150, md=this._kleeqMask(mw,mh);
    const inside=(lx,ly,kW,kH)=>{ const mx=Math.floor(lx/kW*mw), my=Math.floor(ly/kH*mh); if(mx<0||my<0||mx>=mw||my>=mh) return 0; return md[(my*mw+mx)*4]<128?1:0; };
    const kW=Math.max(150,p.scale*2.4), kH=kW, gapX=p.gap*1.6, gapY=p.gap*1.6;
    const stepX=kW*0.9+gapX, stepY=kH*0.9+gapY, R=kW*0.05, dx=1.5*R, dy=Math.sqrt(3)*R;
    const G=Math.max(8,Math.round(18*(W/1700))), n1=this._camoNoise(p.seed,G), n2=this._camoNoise(p.seed*7+3,G*2);
    const pal=[this.mix(ink,gnd,0.1),this.mix(ink,gnd,0.32),this.mix(ink,gnd,0.54),this.mix(ink,gnd,0.76)];
    const th=[0.34,0.5,0.66], idx=v=>{ if(v>th[2])return 3; if(v>th[1])return 2; if(v>th[0])return 1; return 0; };
    const rnd=this.rng(p.seed*3+1), jit=p.jitter/100, strokeAttr=p.stroke>0?` stroke="${this.mix(ink,gnd,0.92)}" stroke-width="${(p.stroke*0.4).toFixed(2)}" stroke-linejoin="round"`:'';
    const inAny=(cx,cy)=>{ const ri=Math.round(cy/stepY);
      for(let rr=ri-1;rr<=ri+1;rr++){ const oy=rr*stepY, offb=(((rr%2)+2)%2)?stepX/2:0, ci=Math.round((cx-offb)/stepX);
        for(let cc=ci-1;cc<=ci+1;cc++){ const ox=cc*stepX+offb, lx=cx-ox, ly=cy-oy; if(lx>=0&&ly>=0&&lx<kW&&ly<kH&&inside(lx,ly,kW,kH)) return 1; } }
      return 0; };
    const ext=0.12+(Math.min(90,Math.abs(p.rotation))/90)*0.6, mc=Math.ceil(ext*W/dx), mr=Math.ceil(ext*H/dy);
    const cols=Math.ceil(W/dx)+2, rows=Math.ceil(H/dy)+2; let s='';
    for(let c=-1-mc;c<cols+mc;c++) for(let rw=-1-mr;rw<rows+mr;rw++){ const cx=c*dx, cy=rw*dy+(c&1?dy/2:0);
      const P=this._hexPts(cx,cy,R-0.6); let base=0.6*n1(cx/W,cy/H)+0.4*n2(cx/W,cy/H); base=(base-0.5)*1.4+0.5;
      base+= inAny(cx,cy) ? -0.34 : 0.28; if(jit>0) base+=(rnd()-0.5)*jit;
      const rh=[[P[5],P[0],P[1]],[P[1],P[2],P[3]],[P[3],P[4],P[5]]], offs=[0.1,0,-0.1];
      rh.forEach((tr,k)=>{ const v=Math.max(0,Math.min(0.999,base+offs[k]));
        s+=`<path d="M${f(cx)},${f(cy)} L${tr.map(q=>f(q[0])+','+f(q[1])).join(' L')} Z" fill="${pal[idx(v)]}"${strokeAttr}/>`; }); }
    return this._isoRot(s,W,H,p);
  }

  isLaser(m){ return ['rhomblaser','hexcubelaser','skullhexlaser','kleeqduolaser','kleeqhexlaser','kleeqkhexlaser','kleeqscatterlaser'].includes(m); }

  buildSkullHexLaser(W,H,p){
    const ink='#000000', f=n=>n.toFixed(1);
    const mw=150, mh=Math.round(mw*1.16), md=this._skullMask(mw,mh);
    const inside=(lx,ly,skW,skH)=>{ const mx=Math.floor(lx/skW*mw), my=Math.floor(ly/skH*mh); if(mx<0||my<0||mx>=mw||my>=mh) return 0; return md[(my*mw+mx)*4]<128?1:0; };
    const skW=Math.max(160,p.scale*2.6), skH=skW*1.16, gapX=p.gap*1.6, gapY=p.gap*1.2;
    const stepX=skW*0.86+gapX, stepY=skH*0.72+gapY, R=skW*0.05, dx=1.5*R, dy=Math.sqrt(3)*R;
    const sw=Math.max(0.6,p.stroke*0.4).toFixed(2);
    const G=Math.max(8,Math.round(18*(W/1700))), n1=this._camoNoise(p.seed,G), n2=this._camoNoise(p.seed*7+3,G*2);
    const th=[0.34,0.5,0.66], idx=v=>{ if(v>th[2])return 3; if(v>th[1])return 2; if(v>th[0])return 1; return 0; };
    const inAny=(cx,cy)=>{ const ri=Math.round((cy+skH*0.2)/stepY);
      for(let rr=ri-1;rr<=ri+1;rr++){ const oy=rr*stepY-skH*0.2, offb=(((rr%2)+2)%2)?stepX/2:0, ci=Math.round((cx-offb)/stepX);
        for(let cc=ci-1;cc<=ci+1;cc++){ const ox=cc*stepX+offb, lx=cx-ox, ly=cy-oy; if(lx>=0&&ly>=0&&lx<skW&&ly<skH&&inside(lx,ly,skW,skH)) return 1; } }
      return 0; };
    const ext=0.12+(Math.min(90,Math.abs(p.rotation))/90)*0.6, mc=Math.ceil(ext*W/dx), mr=Math.ceil(ext*H/dy);
    const cols=Math.ceil(W/dx)+2, rows=Math.ceil(H/dy)+2; let s='';
    for(let c=-1-mc;c<cols+mc;c++) for(let rw=-1-mr;rw<rows+mr;rw++){ const cx=c*dx, cy=rw*dy+(c&1?dy/2:0);
      const P=this._hexPts(cx,cy,R-0.6); let base=0.6*n1(cx/W,cy/H)+0.4*n2(cx/W,cy/H); base=(base-0.5)*1.4+0.5;
      base+= inAny(cx,cy) ? -0.34 : 0.28;
      const rh=[[P[5],P[0],P[1]],[P[1],P[2],P[3]],[P[3],P[4],P[5]]], offs=[0.1,0,-0.1];
      rh.forEach((tr,k)=>{ const v=Math.max(0,Math.min(0.999,base+offs[k])), id=idx(v);
        const edge=`M${f(cx)},${f(cy)} L${f(tr[0][0])},${f(tr[0][1])} L${f(tr[1][0])},${f(tr[1][1])} L${f(tr[2][0])},${f(tr[2][1])} Z`;
        const hatch=nn=>{ let d=''; for(let q=1;q<=nn;q++){ const t=q/(nn+1); d+=`M${f(cx+(tr[0][0]-cx)*t)},${f(cy+(tr[0][1]-cy)*t)} L${f(cx+(tr[2][0]-cx)*t)},${f(cy+(tr[2][1]-cy)*t)} `; } return d; };
        if(id===0){ s+=`<path d="${hatch(4)}" stroke="${ink}" stroke-width="${sw}" fill="none"/><path d="${edge}" stroke="${ink}" stroke-width="${sw}" fill="none"/>`; }
        else if(id===1){ s+=`<path d="${hatch(2)}" stroke="${ink}" stroke-width="${sw}" fill="none"/><path d="${edge}" stroke="${ink}" stroke-width="${sw}" fill="none"/>`; }
        else if(id===2){ s+=`<path d="${edge}" stroke="${ink}" stroke-width="${sw}" fill="none"/>`; } }); }
    return this._isoRot(s,W,H,p);
  }

  buildSkullHex(W,H,p,flat){
    const ink=p.ink, gnd=p.ground, f=n=>n.toFixed(1);
    const mw=150, mh=Math.round(mw*1.16), md=this._skullMask(mw,mh);
    const inside=(lx,ly,skW,skH)=>{ const mx=Math.floor(lx/skW*mw), my=Math.floor(ly/skH*mh); if(mx<0||my<0||mx>=mw||my>=mh) return 0; return md[(my*mw+mx)*4]<128?1:0; };
    const skW=Math.max(160,p.scale*2.6), skH=skW*1.16, gapX=p.gap*1.6, gapY=p.gap*1.2;
    const stepX=skW*0.86+gapX, stepY=skH*0.72+gapY, R=skW*0.05, dx=1.5*R, dy=Math.sqrt(3)*R;
    const G=Math.max(8,Math.round(18*(W/1700))), n1=this._camoNoise(p.seed,G), n2=this._camoNoise(p.seed*7+3,G*2);
    const pal=[this.mix(ink,gnd,0.1),this.mix(ink,gnd,0.32),this.mix(ink,gnd,0.54),this.mix(ink,gnd,0.76)];
    const th=[0.34,0.5,0.66], idx=v=>{ if(v>th[2])return 3; if(v>th[1])return 2; if(v>th[0])return 1; return 0; };
    const rnd=this.rng(p.seed*3+1), jit=p.jitter/100, strokeAttr=p.stroke>0?` stroke="${this.mix(ink,gnd,0.92)}" stroke-width="${(p.stroke*0.4).toFixed(2)}" stroke-linejoin="round"`:'';
    const inAny=(cx,cy)=>{ const ri=Math.round((cy+skH*0.2)/stepY);
      for(let rr=ri-1;rr<=ri+1;rr++){ const oy=rr*stepY-skH*0.2, offb=(((rr%2)+2)%2)?stepX/2:0, ci=Math.round((cx-offb)/stepX);
        for(let cc=ci-1;cc<=ci+1;cc++){ const ox=cc*stepX+offb, lx=cx-ox, ly=cy-oy; if(lx>=0&&ly>=0&&lx<skW&&ly<skH&&inside(lx,ly,skW,skH)) return 1; } }
      return 0; };
    const ext=0.12+(Math.min(90,Math.abs(p.rotation))/90)*0.6, mc=Math.ceil(ext*W/dx), mr=Math.ceil(ext*H/dy);
    const cols=Math.ceil(W/dx)+2, rows=Math.ceil(H/dy)+2; let s='';
    for(let c=-1-mc;c<cols+mc;c++) for(let rw=-1-mr;rw<rows+mr;rw++){ const cx=c*dx, cy=rw*dy+(c&1?dy/2:0);
      const P=this._hexPts(cx,cy,R-0.6); let base=0.6*n1(cx/W,cy/H)+0.4*n2(cx/W,cy/H); base=(base-0.5)*1.4+0.5;
      base+= inAny(cx,cy) ? -0.34 : 0.28; if(jit>0) base+=(rnd()-0.5)*jit;
      if(flat){ if(Math.max(0,Math.min(0.999,base))<0.5) s+=`<path d="M${P.map(q=>f(q[0])+','+f(q[1])).join(' L')} Z" fill="${ink}"${strokeAttr}/>`; continue; }
      const rh=[[P[5],P[0],P[1]],[P[1],P[2],P[3]],[P[3],P[4],P[5]]], offs=[0.1,0,-0.1];
      rh.forEach((tr,k)=>{ const v=Math.max(0,Math.min(0.999,base+offs[k]));
        s+=`<path d="M${f(cx)},${f(cy)} L${tr.map(q=>f(q[0])+','+f(q[1])).join(' L')} Z" fill="${pal[idx(v)]}"${strokeAttr}/>`; }); }
    return this._isoRot(s,W,H,p);
  }

  buildHexCubeLaser(W,H,p){
    const ink='#000000', f=n=>n.toFixed(1);
    const R=Math.max(18,p.scale*0.42), gap=Math.max(0.5,p.gap*0.08), sw=Math.max(0.7,p.stroke*0.42).toFixed(2);
    const G=Math.max(6,Math.round(9*(80/Math.max(30,p.scale))*(W/1700))), n1=this._camoNoise(p.seed,G), n2=this._camoNoise(p.seed*7+3,G*2);
    const th=[0.34,0.5,0.66], idx=v=>{ if(v>th[2])return 3; if(v>th[1])return 2; if(v>th[0])return 1; return 0; };
    const dx=1.5*R, dy=Math.sqrt(3)*R;
    const ext=0.12+(Math.min(90,Math.abs(p.rotation))/90)*0.6, mc=Math.ceil(ext*W/dx), mr=Math.ceil(ext*H/dy);
    const cols=Math.ceil(W/dx)+2, rows=Math.ceil(H/dy)+2; let s='';
    for(let c=-1-mc;c<cols+mc;c++) for(let rw=-1-mr;rw<rows+mr;rw++){ const cx=c*dx, cy=rw*dy+(c&1?dy/2:0);
      const P=this._hexPts(cx,cy,R-gap); let base=0.6*n1(cx/W,cy/H)+0.4*n2(cx/W,cy/H); base=(base-0.5)*1.5+0.5;
      const rh=[[P[5],P[0],P[1]],[P[1],P[2],P[3]],[P[3],P[4],P[5]]], offs=[0.12,0,-0.12];
      rh.forEach((tr,k)=>{ const v=Math.max(0,Math.min(0.999,base+offs[k])), id=idx(v);
        const edge=`M${f(cx)},${f(cy)} L${f(tr[0][0])},${f(tr[0][1])} L${f(tr[1][0])},${f(tr[1][1])} L${f(tr[2][0])},${f(tr[2][1])} Z`;
        if(id===0){ let d=''; for(let q=1;q<=4;q++){ const t=q/5; d+=`M${f(cx+(tr[0][0]-cx)*t)},${f(cy+(tr[0][1]-cy)*t)} L${f(cx+(tr[2][0]-cx)*t)},${f(cy+(tr[2][1]-cy)*t)} `; } s+=`<path d="${d}" stroke="${ink}" stroke-width="${sw}" fill="none"/><path d="${edge}" stroke="${ink}" stroke-width="${sw}" fill="none"/>`; }
        else if(id===1){ let d=''; for(let q=1;q<=2;q++){ const t=q/3; d+=`M${f(cx+(tr[0][0]-cx)*t)},${f(cy+(tr[0][1]-cy)*t)} L${f(cx+(tr[2][0]-cx)*t)},${f(cy+(tr[2][1]-cy)*t)} `; } s+=`<path d="${d}" stroke="${ink}" stroke-width="${sw}" fill="none"/><path d="${edge}" stroke="${ink}" stroke-width="${sw}" fill="none"/>`; }
        else if(id===2){ s+=`<path d="${edge}" stroke="${ink}" stroke-width="${sw}" fill="none"/>`; }
      }); }
    return this._isoRot(s,W,H,p);
  }

  buildHexCubeMil(W,H,p){
    const rnd=this.rng(p.seed), ink=p.ink, gnd=p.ground, f=n=>n.toFixed(1);
    const R=Math.max(16,p.scale*0.4), gap=Math.max(0,p.gap*0.1), jit=p.jitter/100;
    const G=Math.max(6,Math.round(9*(80/Math.max(30,p.scale))*(W/1700))), n1=this._camoNoise(p.seed,G), n2=this._camoNoise(p.seed*7+3,G*2);
    const pal=[this.mix(ink,gnd,0.14),this.mix(ink,gnd,0.36),this.mix(ink,gnd,0.58),this.mix(ink,gnd,0.8)];
    const th=[0.34,0.5,0.66], idx=v=>{ if(v>th[2])return 3; if(v>th[1])return 2; if(v>th[0])return 1; return 0; };
    const dx=1.5*R, dy=Math.sqrt(3)*R;
    const ext=0.12+(Math.min(90,Math.abs(p.rotation))/90)*0.6, mc=Math.ceil(ext*W/dx), mr=Math.ceil(ext*H/dy);
    const cols=Math.ceil(W/dx)+2, rows=Math.ceil(H/dy)+2; let s='';
    for(let c=-1-mc;c<cols+mc;c++) for(let rw=-1-mr;rw<rows+mr;rw++){ const cx=c*dx, cy=rw*dy+(c&1?dy/2:0);
      const P=this._hexPts(cx,cy,R-gap); let base=0.6*n1(cx/W,cy/H)+0.4*n2(cx/W,cy/H); base=(base-0.5)*1.5+0.5; if(jit>0) base+=(rnd()-0.5)*jit;
      const rh=[[P[5],P[0],P[1]],[P[1],P[2],P[3]],[P[3],P[4],P[5]]], offs=[0.12,0,-0.12];
      rh.forEach((tr,k)=>{ const v=Math.max(0,Math.min(0.999,base+offs[k]));
        s+=`<path d="M${f(cx)},${f(cy)} L${tr.map(q=>f(q[0])+','+f(q[1])).join(' L')} Z" fill="${pal[idx(v)]}"/>`; }); }
    return this._isoRot(s,W,H,p);
  }

  buildSkullCamo(W,H,p){
    const ink=p.ink, gnd=p.ground, f=n=>n.toFixed(1);
    const mw=140, mh=Math.round(mw*1.16), md=this._skullMask(mw,mh);
    const inside=(lx,ly,skW,skH)=>{ const mx=Math.floor(lx/skW*mw), my=Math.floor(ly/skH*mh); if(mx<0||my<0||mx>=mw||my>=mh) return 0; return md[(my*mw+mx)*4]<128?1:0; };
    const skW=Math.max(140,p.scale*2.4), skH=skW*1.16, gapX=Math.max(20,p.gap*2.2), gapY=gapX*0.8;
    const a=skW*0.06, b=a*0.62, stepX=skW+gapX, stepY=skH+gapY;
    const G=Math.max(8,Math.round(16*(W/1700))), n1=this._camoNoise(p.seed,G), n2=this._camoNoise(p.seed*7+3,G*2);
    const pal=[this.mix(ink,gnd,0.12),this.mix(ink,gnd,0.36),this.mix(ink,gnd,0.6)];
    const th=[0.4,0.62], idx=v=>{ if(v>th[1])return 2; if(v>th[0])return 1; return 0; };
    let s='';
    for(let row=-1;row*stepY<H+skH;row++){ const oy=row*stepY-skH*0.2, off=(row&1)?stepX/2:0;
      for(let col=-1;col*stepX-off<W+skW;col++){ const ox=col*stepX+off;
        const ci=Math.ceil(skW/a)+2, cj=Math.ceil(skH/b)+2;
        for(let i=-1;i<ci;i++) for(let j=-1;j<cj;j++){ if((i+j)&1) continue; const lx=i*a, ly=j*b; if(!inside(lx,ly,skW,skH)) continue;
          const cx=ox+lx, cy=oy+ly; let v=0.6*n1(cx/W,cy/H)+0.4*n2(cx/W,cy/H); v=(v-0.5)*1.5+0.5; v=Math.max(0,Math.min(0.999,v));
          s+=`<path d="M${f(cx)},${f(cy-b)} L${f(cx+a)},${f(cy)} L${f(cx)},${f(cy+b)} L${f(cx-a)},${f(cy)} Z" fill="${pal[idx(v)]}"/>`; } } }
    return this._isoRot(s,W,H,p);
  }

  buildRhombLaser(W,H,p){
    const ink='#000000', gnd=p.ground, f=n=>n.toFixed(1);
    const a=Math.max(16,p.scale*0.42), b=a*0.62, sw=Math.max(0.8,p.stroke*0.5).toFixed(2);
    const G=Math.max(6,Math.round(9*(80/Math.max(30,p.scale))*(W/1700))), n1=this._camoNoise(p.seed,G), n2=this._camoNoise(p.seed*7+3,G*2);
    const th=[0.34,0.5,0.66], idx=v=>{ if(v>th[2])return 3; if(v>th[1])return 2; if(v>th[0])return 1; return 0; };
    const hH=(cx,cy,nn)=>{ let d=''; for(let k=1;k<=nn;k++){ const dy=(k/(nn+1)*2-1)*b, hw=a*(1-Math.abs(dy)/b); d+=`M${f(cx-hw)},${f(cy+dy)} L${f(cx+hw)},${f(cy+dy)} `; } return d; };
    const hV=(cx,cy,nn)=>{ let d=''; for(let k=1;k<=nn;k++){ const dx=(k/(nn+1)*2-1)*a, hh=b*(1-Math.abs(dx)/a); d+=`M${f(cx+dx)},${f(cy-hh)} L${f(cx+dx)},${f(cy+hh)} `; } return d; };
    const ext=0.12+(Math.min(90,Math.abs(p.rotation))/90)*0.6, mc=Math.ceil(ext*W/a), mr=Math.ceil(ext*H/b);
    const cols=Math.ceil(W/a)+2, rows=Math.ceil(H/b)+2; let s='';
    for(let i=-1-mc;i<cols+mc;i++) for(let j=-1-mr;j<rows+mr;j++){ if((i+j)&1) continue; const cx=i*a, cy=j*b;
      let v=0.6*n1(cx/W,cy/H)+0.4*n2(cx/W,cy/H); v=(v-0.5)*1.5+0.5; v=Math.max(0,Math.min(0.999,v)); const id=idx(v);
      const outline=`M${f(cx)},${f(cy-b)} L${f(cx+a)},${f(cy)} L${f(cx)},${f(cy+b)} L${f(cx-a)},${f(cy)} Z`;
      if(id===0){ s+=`<path d="${hH(cx,cy,6)+hV(cx,cy,6)}" stroke="${ink}" stroke-width="${sw}" fill="none"/><path d="${outline}" stroke="${ink}" stroke-width="${sw}" fill="none"/>`; }
      else if(id===1){ s+=`<path d="${hH(cx,cy,4)}" stroke="${ink}" stroke-width="${sw}" fill="none"/><path d="${outline}" stroke="${ink}" stroke-width="${sw}" fill="none"/>`; }
      else if(id===2){ s+=`<path d="${hH(cx,cy,2)}" stroke="${ink}" stroke-width="${sw}" fill="none"/>`; }
    }
    return this._isoRot(s,W,H,p);
  }

  _camoNoise(seed,G){ const r=this.rng(seed), g=[]; for(let i=0;i<=G;i++){ g[i]=[]; for(let j=0;j<=G;j++) g[i][j]=r(); }
    return (nx,ny)=>{ let x=nx*G,y=ny*G,xi=Math.floor(x),yi=Math.floor(y),fx=x-xi,fy=y-yi; xi=((xi%G)+G)%G; yi=((yi%G)+G)%G;
      const x1=(xi+1)%G,y1=(yi+1)%G,sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy); const a=g[xi][yi],b=g[x1][yi],c=g[xi][y1],d=g[x1][y1],t=a+(b-a)*sx,bt=c+(d-c)*sx; return t+(bt-t)*sy; }; }
  buildRhombHalf(W,H,p){
    const rnd=this.rng(p.seed), ink=p.ink, gnd=p.ground, f=n=>n.toFixed(1);
    const a=Math.max(12,p.scale*0.36), b=a*0.62, jit=p.jitter/100;
    const G=Math.max(6,Math.round(9*(80/Math.max(30,p.scale))*(W/1700))), n1=this._camoNoise(p.seed,G), n2=this._camoNoise(p.seed*7+3,G*2);
    const pal=[this.mix(ink,gnd,0.14),this.mix(ink,gnd,0.36),this.mix(ink,gnd,0.58),this.mix(ink,gnd,0.8)];
    const th=[0.34,0.5,0.66], idx=v=>{ if(v>th[2])return 3; if(v>th[1])return 2; if(v>th[0])return 1; return 0; };
    const ext=0.12+(Math.min(90,Math.abs(p.rotation))/90)*0.6, mc=Math.ceil(ext*W/a), mr=Math.ceil(ext*H/b);
    const cols=Math.ceil(W/a)+2, rows=Math.ceil(H/b)+2; let s='';
    for(let i=-1-mc;i<cols+mc;i++) for(let j=-1-mr;j<rows+mr;j++){ if((i+j)&1) continue; const cx=i*a, cy=j*b;
      let v=0.6*n1(cx/W,cy/H)+0.4*n2(cx/W,cy/H); v=(v-0.5)*1.5+0.5; if(jit>0) v+=(rnd()-0.5)*jit; v=Math.max(0,Math.min(0.999,v));
      s+=`<path d="M${f(cx)},${f(cy-b)} L${f(cx+a)},${f(cy)} L${f(cx)},${f(cy+b)} L${f(cx-a)},${f(cy)} Z" fill="${pal[idx(v)]}"/>`; }
    return this._isoRot(s,W,H,p);
  }

  _hexField(W,H,ph){ return (x,y)=>{ const nx=x/W,ny=y/H; return (Math.sin(nx*5.5+ph[0])+Math.cos(ny*4.7+ph[1])+Math.sin((nx+ny)*4.1+ph[2])+Math.sin((nx-ny)*6.3+ph[3]))*0.25+0.5; }; }
  _hexPts(cx,cy,r){ const a=[]; for(let k=0;k<6;k++){ const t=Math.PI/180*60*k; a.push([cx+r*Math.cos(t),cy+r*Math.sin(t)]); } return a; }
  buildHexHalf(W,H,p){
    const rnd=this.rng(p.seed), ink=p.ink, f=n=>n.toFixed(1), ph=[rnd()*6.28,rnd()*6.28,rnd()*6.28,rnd()*6.28];
    const field=this._hexField(W,H,ph), R=Math.max(14,p.scale*0.34), dx=1.5*R, dy=Math.sqrt(3)*R, jit=p.jitter/100;
    const ext=0.12+(Math.min(90,Math.abs(p.rotation))/90)*0.6, mc=Math.ceil(ext*W/dx), mr=Math.ceil(ext*H/dy);
    const cols=Math.ceil(W/dx)+2, rows=Math.ceil(H/dy)+2; let s='';
    for(let c=-1-mc;c<cols+mc;c++) for(let rw=-1-mr;rw<rows+mr;rw++){ const cx=c*dx, cy=rw*dy+(c&1?dy/2:0);
      let v=field(cx,cy); if(jit>0) v+=(rnd()-0.5)*jit*0.9; v=Math.max(0,Math.min(1,v));
      const r=(R-1)*(0.55+0.45*v); if(r<0.6) continue; const pts=this._hexPts(cx,cy,r);
      s+=`<path d="M${pts.map(q=>f(q[0])+','+f(q[1])).join(' L')} Z" fill="${ink}"/>`; }
    return this._isoRot(s,W,H,p);
  }
  buildHexCube(W,H,p){
    const rnd=this.rng(p.seed), ink=p.ink, gnd=p.ground, f=n=>n.toFixed(1), ph=[rnd()*6.28,rnd()*6.28,rnd()*6.28,rnd()*6.28];
    const field=this._hexField(W,H,ph), R=Math.max(16,p.scale*0.4), gap=Math.max(0,p.gap*0.1), jit=p.jitter/100;
    const pal=[ink,this.mix(ink,gnd,0.3),this.mix(ink,gnd,0.55),this.mix(ink,gnd,0.78)];
    const dx=1.5*R, dy=Math.sqrt(3)*R, idx=v=>Math.max(0,Math.min(3,Math.floor(v*4)));
    const ext=0.12+(Math.min(90,Math.abs(p.rotation))/90)*0.6, mc=Math.ceil(ext*W/dx), mr=Math.ceil(ext*H/dy);
    const cols=Math.ceil(W/dx)+2, rows=Math.ceil(H/dy)+2; let s='';
    for(let c=-1-mc;c<cols+mc;c++) for(let rw=-1-mr;rw<rows+mr;rw++){ const cx=c*dx, cy=rw*dy+(c&1?dy/2:0);
      const P=this._hexPts(cx,cy,R-gap); let base=field(cx,cy); if(jit>0) base+=(rnd()-0.5)*jit*0.9;
      const rh=[[P[5],P[0],P[1]],[P[1],P[2],P[3]],[P[3],P[4],P[5]]], offs=[0,0.16,0.32];
      rh.forEach((tr,k)=>{ const v=Math.max(0,Math.min(0.999,base+offs[k]-0.16));
        s+=`<path d="M${f(cx)},${f(cy)} L${tr.map(q=>f(q[0])+','+f(q[1])).join(' L')} Z" fill="${pal[idx(v)]}"/>`; }); }
    return this._isoRot(s,W,H,p);
  }

  buildIsoInk(W,H,p){
    const rnd=this.rng(p.seed), ink=p.ink, gnd=p.ground, f=n=>n.toFixed(1);
    const s=Math.max(50,p.scale*0.9), w=s*Math.cos(Math.PI/6), hh=s*Math.sin(Math.PI/6), mg=0.05+(p.gap/100)*0.4;
    const N=Math.max(6,Math.ceil(W/(2*w))+3), ox=W*0.5, oy=H*0.14, maxD=(N-1)*2;
    const P=(X,Y,z)=>[ox+(X-Y)*w, oy+(X+Y)*hh - z];
    const wMin=Math.max(0.5,p.stroke*0.3), wMax=Math.max(wMin+2,p.stroke*2.4);
    const cells=[];
    for(let i=0;i<N;i++) for(let j=0;j<N;j++){ if(rnd()<0.09) continue; cells.push([i,j,s*(0.3+Math.pow(rnd(),2.1)*3.6)]); }
    cells.sort((a,b)=>(a[0]+a[1])-(b[0]+b[1]));
    let out='';
    for(const [i,j,h] of cells){ const a0=i+mg,a1=i+1-mg,b0=j+mg,b1=j+1-mg;
      const B=P(a1,b0,0),Cc=P(a1,b1,0),D=P(a0,b1,0),At=P(a0,b0,h),Bt=P(a1,b0,h),Ct=P(a1,b1,h),Dt=P(a0,b1,h);
      const sw=wMin+(wMax-wMin)*((i+j)/maxD);
      out+=`<path d="M${f(D[0])},${f(D[1])} L${f(Cc[0])},${f(Cc[1])} L${f(B[0])},${f(B[1])} L${f(Bt[0])},${f(Bt[1])} L${f(At[0])},${f(At[1])} L${f(Dt[0])},${f(Dt[1])} Z" fill="${ink}"/>`;
      const edge=(a,b)=>`<path d="M${f(a[0])},${f(a[1])} L${f(b[0])},${f(b[1])}" stroke="${gnd}" stroke-width="${sw.toFixed(2)}" fill="none" stroke-linecap="round"/>`;
      out+=edge(Cc,Ct)+edge(Ct,Bt)+edge(Ct,Dt)+edge(At,Bt)+edge(At,Dt);
    }
    return this._isoRot(out,W,H,p);
  }

  buildHexCamo(W,H,p){
    const rnd=this.rng(p.seed), ink=p.ink, gnd=p.ground, f=n=>n.toFixed(1);
    const R=Math.max(16,p.scale*0.4), gap=Math.max(0,p.gap*0.12), jit=p.jitter/100;
    const G=Math.max(6,Math.round(9*(80/Math.max(30,p.scale))*(W/1700))), n1=this._camoNoise(p.seed,G), n2=this._camoNoise(p.seed*7+3,G*2);
    const pal=[this.mix(ink,gnd,0.14),this.mix(ink,gnd,0.36),this.mix(ink,gnd,0.6),gnd];
    const th=[0.34,0.5,0.66], idx=v=>{ if(v>th[2])return 3; if(v>th[1])return 2; if(v>th[0])return 1; return 0; };
    const dx=1.5*R, dy=Math.sqrt(3)*R;
    const hp=(cx,cy,r)=>{ let d=''; for(let k=0;k<6;k++){ const t=Math.PI/180*60*k; d+=(k?' L':'M')+f(cx+r*Math.cos(t))+','+f(cy+r*Math.sin(t)); } return d+' Z'; };
    const ext=0.12+(Math.min(90,Math.abs(p.rotation))/90)*0.6, mc=Math.ceil(ext*W/dx), mr=Math.ceil(ext*H/dy);
    const cols=Math.ceil(W/dx)+2, rows=Math.ceil(H/dy)+2; let s='';
    for(let c=-1-mc;c<cols+mc;c++) for(let rw=-1-mr;rw<rows+mr;rw++){ const cx=c*dx, cy=rw*dy+(c&1?dy/2:0);
      let v=0.6*n1(cx/W,cy/H)+0.4*n2(cx/W,cy/H); v=(v-0.5)*1.5+0.5; if(jit>0) v+=(rnd()-0.5)*jit; v=Math.max(0,Math.min(0.999,v));
      s+=`<path d="${hp(cx,cy,R-gap)}" fill="${pal[idx(v)]}"/>`; }
    return this._isoRot(s,W,H,p);
  }
  buildBlobCamo(W,H,p){
    const rnd=this.rng(p.seed), ink=p.ink, gnd=p.ground, f=n=>n.toFixed(1);
    const pal=[this.mix(ink,gnd,0.12),this.mix(ink,gnd,0.36),this.mix(ink,gnd,0.6),gnd];
    const grid=Math.max(80,Math.round(W/9)), sx=W/grid, jit=p.jitter/100;
    const G=Math.max(6,Math.round(9*(80/Math.max(30,p.scale))*(W/1700))), n1=this._camoNoise(p.seed,G), n2=this._camoNoise(p.seed*7+3,G*2), n3=this._camoNoise(p.seed*13+5,G*4);
    const ext=0.12+(Math.min(90,Math.abs(p.rotation))/90)*0.6, i0=-Math.ceil(ext*grid), i1=grid+Math.ceil(ext*grid);
    const j0=-Math.ceil(ext*W/sx), j1=Math.ceil((H+ext*W)/sx);
    const th=[0.36,0.52,0.68], idx=v=>{ if(v>th[2])return 3; if(v>th[1])return 2; if(v>th[0])return 1; return 0; };
    let s='';
    for(let i=i0;i<i1;i++) for(let j=j0;j<j1;j++){ const x=i*sx,y=j*sx, nx=(x+sx/2)/W, ny=(y+sx/2)/H;
      let v=0.5*n1(nx,ny)+0.32*n2(nx,ny)+0.18*n3(nx,ny); v=(v-0.5)*1.55+0.5; if(jit>0) v+=(rnd()-0.5)*jit;
      const id=idx(Math.max(0,Math.min(0.999,v))); if(id===3) continue;
      s+=`<rect x="${f(x)}" y="${f(y)}" width="${f(sx+1.2)}" height="${f(sx+1.2)}" fill="${pal[id]}"/>`; }
    return this._isoRot(s,W,H,p);
  }

  _isoRot(body,W,H,p){ return p.rotation ? `<g transform="rotate(${p.rotation}, ${(W/2).toFixed(1)}, ${(H/2).toFixed(1)})">${body}</g>` : `<g>${body}</g>`; }
  buildIsoGrid(W,H,p){
    const rnd=this.rng(p.seed), ink=p.ink, gnd=p.ground, f=n=>n.toFixed(1);
    const s=Math.max(50,p.scale*0.9), w=s*Math.cos(Math.PI/6), hh=s*Math.sin(Math.PI/6), mg=0.05+(p.gap/100)*0.42;
    const sw=Math.max(0.7,p.stroke*0.42), N=Math.max(6,Math.ceil(W/(2*w))+3);
    const ox=W*0.5, oy=H*0.14, P=(X,Y,z)=>[ox+(X-Y)*w, oy+(X+Y)*hh - z];
    const rightF=this.mix(ink,gnd,0.8), leftF=this.mix(ink,gnd,0.62);
    const face=(pts,fill)=>`<path d="M${pts.map(q=>f(q[0])+','+f(q[1])).join(' L')} Z" fill="${fill}" stroke="${ink}" stroke-width="${sw.toFixed(2)}" stroke-linejoin="round"/>`;
    const line=(a,b)=>`<path d="M${f(a[0])},${f(a[1])} L${f(b[0])},${f(b[1])}" fill="none" stroke="${ink}" stroke-width="${(sw*0.7).toFixed(2)}"/>`;
    const cells=[];
    for(let i=0;i<N;i++) for(let j=0;j<N;j++){ if(rnd()<0.1) continue; cells.push([i,j,s*(0.3+Math.pow(rnd(),2.1)*3.6),rnd()]); }
    cells.sort((a,b)=>(a[0]+a[1])-(b[0]+b[1]));
    let out='';
    for(const [i,j,h,r] of cells){ const a0=i+mg,a1=i+1-mg,b0=j+mg,b1=j+1-mg;
      const B=P(a1,b0,0),Cc=P(a1,b1,0),D=P(a0,b1,0),At=P(a0,b0,h),Bt=P(a1,b0,h),Ct=P(a1,b1,h),Dt=P(a0,b1,h);
      out+=face([B,Cc,Ct,Bt],rightF)+face([D,Cc,Ct,Dt],leftF)+face([At,Bt,Ct,Dt],gnd);
      if(h>1.8*s&&r<0.5){ const n=3+Math.floor(r*8); for(let k=1;k<n;k++){ const t=k/n; out+=line([B[0]+(Cc[0]-B[0])*t,B[1]+(Cc[1]-B[1])*t],[Bt[0]+(Ct[0]-Bt[0])*t,Bt[1]+(Ct[1]-Bt[1])*t]); } }
    }
    return this._isoRot(out,W,H,p);
  }
  buildIsoWire(W,H,p){
    const rnd=this.rng(p.seed), ink=p.ink, f=n=>n.toFixed(1);
    const s=Math.max(50,p.scale*1.1), w=s*Math.cos(Math.PI/6), hh=s*Math.sin(Math.PI/6), mg=(p.gap/100)*0.45;
    const sw=Math.max(0.6,p.stroke*0.36).toFixed(2), N=Math.max(5,Math.ceil(W/(2*w))+2);
    const ox=W*0.5, oy=H*0.18, P=(X,Y,z)=>[ox+(X-Y)*w, oy+(X+Y)*hh - z];
    const L=(a,b)=>`<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" stroke="${ink}" stroke-width="${sw}"/>`;
    let g='';
    for(let i=0;i<N;i++) for(let j=0;j<N;j++){ if(rnd()>0.5) continue; const h=s*(0.5+Math.pow(rnd(),1.5)*4); const a0=i+mg,a1=i+1-mg,b0=j+mg,b1=j+1-mg;
      const c=[P(a0,b0,0),P(a1,b0,0),P(a1,b1,0),P(a0,b1,0)], t=[P(a0,b0,h),P(a1,b0,h),P(a1,b1,h),P(a0,b1,h)];
      for(let k=0;k<4;k++){ g+=L(c[k],c[(k+1)%4])+L(t[k],t[(k+1)%4])+L(c[k],t[k]); } }
    return this._isoRot(g,W,H,p);
  }

  buildIsoCity(W,H,p){
    const rnd=this.rng(p.seed), ink=p.ink, gnd=p.ground, f=n=>n.toFixed(1);
    const s=Math.max(60,p.scale*1.2), w=s*Math.cos(Math.PI/6), hh=s*Math.sin(Math.PI/6);
    const sw=Math.max(0.8,p.stroke*0.5).toFixed(2), N=Math.max(4,Math.round(W/(w*1.3)));
    const ox=W*0.5, oy=H*0.28, louv=0.25+p.gap/200;
    const P=(X,Y,z)=>[ox+(X-Y)*w, oy+(X+Y)*hh - z];
    const faceAttr=`fill="${gnd}" stroke="${ink}" stroke-width="${sw}" stroke-linejoin="round"`;
    const poly=pts=>`<path d="M${pts.map(q=>f(q[0])+','+f(q[1])).join(' L')} Z" ${faceAttr}/>`;
    const line=(a,b)=>`<path d="M${f(a[0])},${f(a[1])} L${f(b[0])},${f(b[1])}" fill="none" stroke="${ink}" stroke-width="${sw}"/>`;
    const cells=[];
    for(let i=0;i<N;i++) for(let j=0;j<N;j++){ if(rnd()<0.5){ cells.push([i,j,s*(0.6+Math.pow(rnd(),1.5)*4)]); } }
    cells.sort((a,b)=>(a[0]+a[1])-(b[0]+b[1]));
    let out='';
    for(const [i,j,h] of cells){
      const B=P(i+1,j,0),Cc=P(i+1,j+1,0),D=P(i,j+1,0);
      const At=P(i,j,h),Bt=P(i+1,j,h),Ct=P(i+1,j+1,h),Dt=P(i,j+1,h);
      out+=poly([B,Cc,Ct,Bt])+poly([D,Cc,Ct,Dt])+poly([At,Bt,Ct,Dt]);
      if(rnd()<louv){ const n=3+Math.floor(rnd()*4); for(let k=1;k<n;k++){ const t=k/n; out+=line([B[0]+(Cc[0]-B[0])*t,B[1]+(Cc[1]-B[1])*t],[Bt[0]+(Ct[0]-Bt[0])*t,Bt[1]+(Ct[1]-Bt[1])*t]); } }
      if(rnd()<louv){ const n=3+Math.floor(rnd()*4); for(let k=1;k<n;k++){ const t=k/n; out+=line([D[0]+(Cc[0]-D[0])*t,D[1]+(Cc[1]-D[1])*t],[Dt[0]+(Ct[0]-Dt[0])*t,Dt[1]+(Ct[1]-Dt[1])*t]); } }
    }
    return this._isoRot(out,W,H,p);
  }

  buildRibbons(W,H,p){
    const rnd=this.rng(p.seed), ink=p.ink, gnd=p.ground, f=n=>n.toFixed(1);
    const bands=Math.max(5,Math.round(1500/Math.max(60,p.scale))), bandH=H/bands;
    const cols=Math.max(60,Math.round(W/10)), step=W/cols, ph=[rnd()*6.28,rnd()*6.28,rnd()*6.28,rnd()*6.28];
    const amp=(0.8+p.gap/40)*bandH;
    const warp=x=>{ const t=x/W; return (Math.sin(t*1.9+ph[0])*0.6+Math.sin(t*3.1+ph[1])*0.3+Math.sin(t*1.1+ph[2])*0.22)*amp; };
    const duty=(m,x)=>{ const t=x/W; return 0.28+0.44*(0.5+0.5*Math.sin(t*2.6+m*0.8+ph[3])); };
    let s=''; const m1=Math.ceil(H/bandH)+2;
    for(let m=-2;m<=m1;m++){
      let top='',bot='';
      for(let c=0;c<=cols;c++){ const x=c*step; top+=(c?' L':'M')+f(x)+','+f(m*bandH+warp(x)); }
      for(let c=cols;c>=0;c--){ const x=c*step; bot+=' L'+f(x)+','+f(m*bandH+warp(x)+bandH*duty(m,x)); }
      s+=`<path d="${top}${bot} Z" fill="${ink}"/>`;
    }
    return `<g>${s}</g>`;
  }

  buildArchWeave(W,H,p){
    const ink=p.ink, lerp=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
    const U=Math.max(10,Math.round(2400/Math.max(30,p.scale))), V=Math.max(10,Math.round(U*0.95));
    const C=[W*0.98,-H*0.15], aStart=Math.PI*0.6, aEnd=Math.PI*1.08;
    const Rmax=Math.hypot(W,H)*1.3, shrink=0.9+(p.gap/100)*0.08;
    const side=0.3+(p.stroke/16)*0.18, tip=0.05;
    const P=(u,v)=>{ const a=aStart+(aEnd-aStart)*(u/U), r=Rmax*Math.pow(shrink,v); return [C[0]+Math.cos(a)*r,C[1]+Math.sin(a)*r]; };
    const f=n=>n.toFixed(1); let cells='';
    for(let v=0;v<V;v++) for(let u=0;u<U;u++){
      const A=P(u,v),B=P(u+1,v),Cc=P(u+1,v+1),D=P(u,v+1);
      const G=[(A[0]+B[0]+Cc[0]+D[0])/4,(A[1]+B[1]+Cc[1]+D[1])/4];
      const tA=lerp(A,G,tip),tC=lerp(Cc,G,tip),sB=lerp(B,G,side),sD=lerp(D,G,side);
      cells+=`<path d="M${f(tA[0])},${f(tA[1])} L${f(sB[0])},${f(sB[1])} L${f(tC[0])},${f(tC[1])} L${f(sD[0])},${f(sD[1])} Z" fill="${ink}"/>`;
    }
    return `<g>${cells}</g>`;
  }

  _skullMask(mw,mh){
    const c=document.createElement('canvas'); c.width=mw; c.height=mh;
    const ctx=c.getContext('2d'); ctx.fillStyle='#fff'; ctx.fillRect(0,0,mw,mh);
    ctx.save(); ctx.scale(mw/100,mh/116);
    ctx.fillStyle='#000'; ctx.fill(new Path2D(this.SKULL));
    ctx.fillStyle='#fff';
    ctx.fill(new Path2D('M50,50 L40,64 L24,60 L26,42 Z M50,50 L60,64 L76,60 L74,42 Z M50,64 L44,82 L56,82 Z'));
    for(let i=0;i<6;i++){ const x=35+i*5.2; ctx.fillRect(x,86,2.2,24); }
    ctx.fillRect(33,95,34,2.4);
    ctx.restore();
    return ctx.getImageData(0,0,mw,mh).data;
  }
  buildSkullNet(W,H,p){
    const rnd=this.rng(p.seed), ink=p.ink, S=Math.min(W,H);
    const skW=W*0.66, skH=skW*1.16, skX=W*0.32, skY=H*0.5-skH/2;
    const mw=180, mh=Math.round(mw*1.16), md=this._skullMask(mw,mh);
    const inside=(x,y)=>{ const mx=Math.floor((x-skX)/skW*mw), my=Math.floor((y-skY)/skH*mh);
      if(mx<0||my<0||mx>=mw||my>=mh) return 0; return md[(my*mw+mx)*4]<128?1:0; };
    const gap=Math.max(7,26-p.scale*0.06), lw=Math.max(0.3,p.stroke*0.16).toFixed(2), nodes=[];
    for(let y=skY;y<skY+skH;y+=gap) for(let x=skX;x<skX+skW;x+=gap){
      const px=x+(rnd()-0.5)*gap*0.8, py=y+(rnd()-0.5)*gap*0.8;
      if(!inside(px,py)) continue;
      const frac=(px-skX)/skW; if(rnd()>0.3+frac*0.82) continue;
      const big=rnd()<0.12+(1-frac)*0.15;
      nodes.push({x:px,y:py,r:(big?(1.6+rnd()*3.2):(0.5+rnd()*1.2)).toFixed(1)});
    }
    const R=gap*1.7, cs=R, grid={}, key=(a,b)=>a+','+b;
    nodes.forEach((n,idx)=>{ const gx=Math.floor(n.x/cs),gy=Math.floor(n.y/cs); (grid[key(gx,gy)]=grid[key(gx,gy)]||[]).push(idx); });
    let edges='';
    nodes.forEach((n,idx)=>{ const gx=Math.floor(n.x/cs),gy=Math.floor(n.y/cs); let cnt=0;
      for(let ax=-1;ax<=1;ax++) for(let ay=-1;ay<=1;ay++){ const b=grid[key(gx+ax,gy+ay)]; if(!b) continue;
        for(const j of b){ if(j<=idx) continue; const m=nodes[j]; if(Math.hypot(m.x-n.x,m.y-n.y)<R&&cnt<7){ edges+=`<line x1="${n.x.toFixed(1)}" y1="${n.y.toFixed(1)}" x2="${m.x.toFixed(1)}" y2="${m.y.toFixed(1)}" stroke="${ink}" stroke-width="${lw}"/>`; cnt++; } } } });
    let dots=''; nodes.forEach(n=>{ dots+=`<circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${n.r}" fill="${ink}"/>`; });
    let tris=''; const nT=Math.round(46*(0.6+p.scale/120));
    for(let i=0;i<nT;i++){ const fx=rnd(), px=skX*fx*0.98, py=skY+rnd()*skH; if(rnd()>0.15+(1-fx)*0.9) continue;
      const sz=8+rnd()*34, rot=rnd()*6.28, pts=[];
      for(let k=0;k<3;k++){ const aa=rot+k*2.094; pts.push(`${(px+Math.cos(aa)*sz).toFixed(1)},${(py+Math.sin(aa)*sz*0.9).toFixed(1)}`); }
      tris+=`<polygon points="${pts.join(' ')}" fill="none" stroke="${ink}" stroke-width="${lw}"/>`;
      if(rnd()<0.6) dots+=`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${(0.6+rnd()*1.6).toFixed(1)}" fill="${ink}"/>`;
    }
    return `<g>${edges}${tris}${dots}</g>`;
  }

  _burstStrand(o,a,L,windK,wob){
    const rnd=o.rnd, S=o.S, wf=1+rnd()*2, steps=Math.max(6,Math.round(L/S*44)); let d='', last;
    for(let s=0;s<=steps;s++){ const t=s/steps;
      const bx=o.ox+Math.cos(a)*(S*0.02+t*L);
      const by=o.oy+Math.sin(a)*(S*0.02+t*L)*0.9 + Math.sin(t*wf*Math.PI+a)*S*0.02*wob;
      const x=bx+o.wind*windK*Math.pow(t,1.7), y=by+o.curl*o.wind*windK*Math.pow(t,2.1) + Math.sin(a)*o.wind*windK*Math.pow(t,2)*0.05;
      d+=(s?` L`:`M`)+`${x.toFixed(1)},${y.toFixed(1)}`; last=[x,y];
      if(rnd()<0.18) o.dt.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${o.dotR}" fill="${o.ink}"/>`);
    }
    o.st.push(`<path d="${d}" fill="none" stroke="${o.ink}" stroke-width="${o.lw}"/>`);
    o.dt.push(`<circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="${o.dotR}" fill="${o.ink}"/>`);
  }
  buildNova(W,H,p){
    const rnd=this.rng(p.seed), ink=p.ink, S=Math.min(W,H), ox=W/2, oy=H/2;
    const N=Math.round(500*(0.6+p.scale/120)), lw=Math.max(0.4,p.stroke*0.2).toFixed(2), dotR=Math.max(0.6,p.stroke*0.4).toFixed(2);
    let st='', dt='';
    for(let i=0;i<N;i++){ const a=rnd()*Math.PI*2, L=S*(0.1+Math.pow(rnd(),1.6)*0.42), steps=Math.max(4,Math.round(L/S*40)); let d='', last;
      for(let s=0;s<=steps;s++){ const t=s/steps, r=S*0.01+t*L, x=ox+Math.cos(a)*r, y=oy+Math.sin(a)*r; d+=(s?` L`:`M`)+`${x.toFixed(1)},${y.toFixed(1)}`; last=[x,y]; if(rnd()<0.16) dt+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${dotR}" fill="${ink}"/>`; }
      st+=`<path d="${d}" fill="none" stroke="${ink}" stroke-width="${lw}"/>`; dt+=`<circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="${dotR}" fill="${ink}"/>`; }
    return `<g>${st}${dt}</g>`;
  }
  buildCometTrail(W,H,p){
    const rnd=this.rng(p.seed), S=Math.min(W,H);
    const o={ rnd, S, ink:p.ink, ox:W*0.24, oy:H*0.62, wind:(0.9+p.gap/30)*W, curl:-0.6,
      lw:Math.max(0.4,p.stroke*0.2).toFixed(2), dotR:Math.max(0.6,p.stroke*0.4).toFixed(2), st:[], dt:[] };
    const N=Math.round(340*(0.6+p.scale/120));
    for(let i=0;i<N*0.5;i++){ const a=rnd()*Math.PI*2, L=S*(0.1+Math.pow(rnd(),1.3)*0.24); this._burstStrand(o,a,L,0.02,(rnd()-0.5)*0.5); }
    for(let i=0;i<N*0.55;i++){ const a=(rnd()-0.5)*Math.PI*1.1, bias=Math.cos(a)*0.5+0.5, L=S*(0.22+Math.pow(rnd(),1.6)*0.6); this._burstStrand(o,a,L,0.12+bias*0.5,(rnd()-0.5)*0.7); }
    return `<g>${o.st.join('')}${o.dt.join('')}</g>`;
  }
  buildShower(W,H,p){
    const rnd=this.rng(p.seed), ink=p.ink, S=Math.min(W,H);
    const lw=Math.max(0.4,p.stroke*0.18).toFixed(2), dotR=Math.max(0.5,p.stroke*0.35).toFixed(2);
    const nC=4+Math.floor(rnd()*4), ang=Math.PI*0.16; let st='', dt='';
    const comet=(cx,cy,scl)=>{ const N=Math.round(90*scl*(0.6+p.scale/120)), wind=(0.9+p.gap/30)*S*1.1*scl;
      const strand=(a,L,wk)=>{ const steps=Math.max(5,Math.round(L/S*40)); let d='', last;
        for(let s=0;s<=steps;s++){ const t=s/steps; const bx=cx+Math.cos(a)*(S*0.01+t*L), by=cy+Math.sin(a)*(S*0.01+t*L)*0.9;
          const x=bx+Math.cos(ang)*wind*wk*Math.pow(t,1.7), y=by+Math.sin(ang)*wind*wk*Math.pow(t,1.7); d+=(s?` L`:`M`)+`${x.toFixed(1)},${y.toFixed(1)}`; last=[x,y];
          if(rnd()<0.16) dt+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${dotR}" fill="${ink}"/>`; }
        st+=`<path d="${d}" fill="none" stroke="${ink}" stroke-width="${lw}"/>`; dt+=`<circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="${dotR}" fill="${ink}"/>`; };
      for(let i=0;i<N*0.5;i++){ const a=rnd()*Math.PI*2, L=S*scl*(0.06+Math.pow(rnd(),1.3)*0.14); strand(a,L,0.02); }
      for(let i=0;i<N*0.5;i++){ const a=ang+(rnd()-0.5)*Math.PI*0.9, bias=Math.cos(a-ang)*0.5+0.5, L=S*scl*(0.12+Math.pow(rnd(),1.6)*0.4); strand(a,L,0.14+bias*0.5); } };
    for(let c=0;c<nC;c++) comet(W*(0.12+rnd()*0.5),H*(0.15+rnd()*0.7),0.5+rnd()*0.7);
    return `<g>${st}${dt}</g>`;
  }

  buildBurst(W,H,p){
    const rnd=this.rng(p.seed), ink=p.ink, S=Math.min(W,H);
    const ox=W*0.28, oy=H*0.5, N=Math.round(360*(0.6+p.scale/120));
    const wind=(0.9+p.gap/30)*W, lw=Math.max(0.4,p.stroke*0.2), dotR=Math.max(0.6,p.stroke*0.4);
    let strokes='', dots='';
    const strand=(a,L,windK,wob)=>{
      const wfreq=1+rnd()*2, steps=Math.max(6,Math.round(L/S*44)); let d='', last;
      for(let s=0;s<=steps;s++){ const t=s/steps;
        const baseX=ox+Math.cos(a)*(S*0.02+t*L);
        const baseY=oy+Math.sin(a)*(S*0.02+t*L)*0.9 + Math.sin(t*wfreq*Math.PI+a)*S*0.02*wob;
        const x=baseX + wind*windK*Math.pow(t,1.8), y=baseY + Math.sin(a)*wind*windK*Math.pow(t,2)*0.05;
        d+=(s?` L`:`M`)+`${x.toFixed(1)},${y.toFixed(1)}`; last=[x,y];
        if(rnd()<0.18) dots+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${dotR.toFixed(2)}" fill="${ink}"/>`;
      }
      strokes+=`<path d="${d}" fill="none" stroke="${ink}" stroke-width="${lw.toFixed(2)}"/>`;
      dots+=`<circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="${dotR.toFixed(2)}" fill="${ink}"/>`;
    };
    for(let i=0;i<N*0.55;i++){ const a=rnd()*Math.PI*2, L=S*(0.12+Math.pow(rnd(),1.3)*0.28); strand(a,L,0.02,(rnd()-0.5)*0.5); }
    for(let i=0;i<N*0.55;i++){ const a=(rnd()-0.5)*Math.PI*1.1, bias=Math.cos(a)*0.5+0.5, L=S*(0.2+Math.pow(rnd(),1.6)*0.6); strand(a,L,0.12+bias*0.5,(rnd()-0.5)*0.7); }
    return `<g>${strokes}${dots}</g>`;
  }

  SKULL="M50,4 C24,4 12,26 13,50 C13.5,63 19,70 26,76 L30,96 C31,108 40,113 50,113 C60,113 69,108 70,96 L74,76 C81,70 86.5,63 87,50 C88,26 76,4 50,4 Z";
  skullFeats(feat){
    let teeth='';
    for(let i=0;i<6;i++){ const x=35+i*5.2; teeth+=`<rect x="${x.toFixed(1)}" y="86" width="2.2" height="24" fill="${feat}"/>`; }
    teeth+=`<rect x="33" y="95" width="34" height="2.4" fill="${feat}"/>`;
    return `<polygon points="50,50 40,64 24,60 26,42" fill="${feat}"/><polygon points="50,50 60,64 76,60 74,42" fill="${feat}"/><polygon points="50,64 44,82 56,82" fill="${feat}"/>${teeth}`;
  }
  skullGlyph(cx,cy,s,rot,fg,feat,edge){
    const k=(s/116).toFixed(4), t=`translate(${cx.toFixed(1)},${cy.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${k}) translate(-50,-58)`;
    return `<g transform="${t}"><path d="${this.SKULL}" fill="${fg}" stroke="${edge}" stroke-width="2"/>${this.skullFeats(feat)}</g>`;
  }
  buildSkulls(W,H,p){
    const rnd=this.rng(p.seed), ink=p.ink, gnd=p.ground, cell=Math.max(40,p.scale*1.1);
    const cols=Math.ceil(W/cell)+2, rows=Math.ceil(H/cell)+2, jf=0.32+p.jitter/100*0.5, pl=[];
    for(let j=-1;j<rows;j++) for(let i=-1;i<cols;i++){
      const jx=(rnd()-0.5)*cell*jf, jy=(rnd()-0.5)*cell*jf, s=cell*(1.05+rnd()*0.35), rot=(rnd()-0.5)*16;
      pl.push({x:i*cell+cell/2+jx,y:j*cell+cell/2+jy,s,rot,white:rnd()<0.3}); }
    pl.sort((a,b)=>b.s-a.s);
    let inner='';
    for(const q of pl){
      const fg=q.white?gnd:ink, feat=q.white?ink:gnd, edge=q.white?ink:gnd;
      inner+=this.skullGlyph(q.x,q.y,q.s,q.rot,fg,feat,edge);
    }
    return `<g>${inner}</g>`;
  }
  aspectDims(p){
    if(p.tileMode==='single') return { W:1920, H:1080 };   // single tile always renders 16:9
    if(p.aspect==='custom'){ const k=p.canvasUnit==='mm'?(100/25.4):(p.canvasUnit==='px'?1:100); const W=Math.round(Math.max(100,Math.min(20000,(p.canvasW||24)*k))), H=Math.round(Math.max(100,Math.min(20000,(p.canvasH||12)*k))); return { W, H }; }
    if(p.aspect==='32x22') return { W:3200, H:2200 };
    if(p.aspect==='24x12') return { W:2400, H:1200 };
    if(p.aspect==='17x11') return { W:1700, H:1100 };
    if(p.aspect==='11x17') return { W:1100, H:1700 };
    if(p.aspect==='24x11') return { W:2400, H:1100 };
    if(p.aspect==='32x11') return { W:3200, H:1100 };
    if(p.aspect==='2x1') return { W:2000, H:1000 };
    if(p.aspect==='1x2') return { W:1000, H:2000 };
    return { W:1000, H:1000 };
  }

  buildField(W,H,p){
    const ink=p.ink, spacing=Math.max(12,p.scale*0.55), amp=spacing*0.32;
    const wl=Math.max(160, W*0.55/(1+p.gap/14));
    const rnd=this.rng(p.seed), jit=p.jitter/100, grad=p.gradient||'lr';
    const hiT=0.9, loT=0.12, halfMax=spacing/2;
    const dens=(x,y)=>{ const nx=x/W, ny=y/H; let t;
      if(grad==='lr') t=1-nx; else if(grad==='rl') t=nx;
      else if(grad==='tb') t=1-ny; else if(grad==='bt') t=ny;
      else if(grad==='center'){ t=1-Math.min(1,1.9*Math.hypot(nx-0.5,ny-0.5)); }
      else t=0.55;
      return loT+(hiT-loT)*Math.max(0,Math.min(1,t)); };
    const ext=0.18+(Math.min(90,Math.abs(p.rotation))/90)*0.72, x0=-ext*W, x1=W*(1+ext), y0=-ext*H, y1=H*(1+ext);
    const step=Math.max(8, wl/16); const xs=[];
    for(let x=x0; x<=x1; x+=step) xs.push(x); if(xs[xs.length-1]<x1) xs.push(x1);
    let inner='';
    for(let yc0=y0; yc0<=y1; yc0+=spacing){
      const phase=jit*(rnd()-0.5)*2.2, rowAmp=amp*(1+jit*0.5*(rnd()-0.5));
      const base=x=> yc0 + rowAmp*Math.sin(2*Math.PI*x/wl + phase);
      let d='';
      for(let k=0;k<xs.length;k++){ const x=xs[k], yc=base(x), h=halfMax*dens(x,yc);
        d+=(k===0?`M${x.toFixed(1)},${(yc-h).toFixed(1)}`:` L${x.toFixed(1)},${(yc-h).toFixed(1)}`); }
      for(let k=xs.length-1;k>=0;k--){ const x=xs[k], yc=base(x), h=halfMax*dens(x,yc);
        d+=` L${x.toFixed(1)},${(yc+h).toFixed(1)}`; }
      inner+=`<path d="${d} Z" fill="${ink}"/>`;
    }
    const rot=p.rotation? ` transform="rotate(${p.rotation}, ${(W/2).toFixed(1)}, ${(H/2).toFixed(1)})"`:'';
    return `<g${rot}>${inner}</g>`;
  }

  buildWarp(W,H,p){
    const ink=p.ink;
    const pitch=Math.max(10,p.scale*0.42), Ax=pitch*(0.7+p.gap*0.06), wlY=Math.max(200,H*0.85);
    const dutyMax=0.92, dutyMin=0.05, Lband=Math.max(160,H*0.42/(1+p.gap/60));
    const slope=0.2+Math.min(90,Math.abs(p.rotation))/60, ridgeAmp=H*0.12, ridgeWl=W*0.95;
    const duty=(x,y)=>{ const v=y-slope*x+ridgeAmp*Math.sin(2*Math.PI*x/ridgeWl);
      const b=0.5+0.5*Math.cos(2*Math.PI*v/Lband); return dutyMin+(dutyMax-dutyMin)*Math.pow(b,1.3); };
    const ext=0.3, y0=-ext*H, y1=H*(1+ext), x0=-ext*W, x1=W*(1+ext);
    const ys=[]; const stepY=Math.max(8, wlY/50);
    for(let y=y0;y<=y1;y+=stepY) ys.push(y); if(ys[ys.length-1]<y1) ys.push(y1);
    let inner='';
    for(let cx0=x0; cx0<=x1; cx0+=pitch){
      let d='';
      for(let k=0;k<ys.length;k++){ const y=ys[k], cx=cx0+Ax*Math.sin(2*Math.PI*y/wlY), hw=pitch/2*duty(cx,y);
        d+=(k===0?`M${(cx-hw).toFixed(1)},${y.toFixed(1)}`:` L${(cx-hw).toFixed(1)},${y.toFixed(1)}`); }
      for(let k=ys.length-1;k>=0;k--){ const y=ys[k], cx=cx0+Ax*Math.sin(2*Math.PI*y/wlY), hw=pitch/2*duty(cx,y);
        d+=` L${(cx+hw).toFixed(1)},${y.toFixed(1)}`; }
      inner+=`<path d="${d} Z" fill="${ink}"/>`;
    }
    return `<g>${inner}</g>`;
  }

  buildWarpFlow(W,H,p){
    const ink=p.ink, S=Math.min(W,H), rnd=this.rng(p.seed);
    const pitch=Math.max(9,p.scale*0.4), amp=S*0.10+p.gap*2.4;
    const p1=rnd()*6.28, p2=rnd()*6.28, p3=rnd()*6.28, p4=rnd()*6.28;
    const f1=0.11+rnd()*0.05, f2=0.18+rnd()*0.08, f3=0.15+rnd()*0.07;
    const warpx=(x,y)=> amp*Math.sin(y/(H*f1)+p1) + amp*0.65*Math.sin((x+y)/(S*0.22)+p2);
    const dutyMax=0.94, dutyMin=0.04;
    const duty=(x,y)=>{ const b=0.5+0.5*Math.sin(x/(W*f2)+p3+Math.cos(y/(H*f3)+p4)*1.6); return dutyMin+(dutyMax-dutyMin)*Math.pow(b,1.25); };
    const ext=0.38, x0=-ext*W, x1=W*(1+ext), y0=-ext*H, y1=H*(1+ext), stepY=Math.max(7,H/110);
    const ys=[]; for(let y=y0;y<=y1;y+=stepY) ys.push(y);
    let inner='';
    for(let c=x0;c<=x1;c+=pitch){ let d='';
      for(let k=0;k<ys.length;k++){ const y=ys[k], cx=c+warpx(c,y), hw=pitch/2*duty(cx,y); d+=(k?` L`:`M`)+`${(cx-hw).toFixed(1)},${y.toFixed(1)}`; }
      for(let k=ys.length-1;k>=0;k--){ const y=ys[k], cx=c+warpx(c,y), hw=pitch/2*duty(cx,y); d+=` L${(cx+hw).toFixed(1)},${y.toFixed(1)}`; }
      inner+=`<path d="${d} Z" fill="${ink}"/>`; }
    return `<g>${inner}</g>`;
  }

  buildWarpFocal(W,H,p){
    const ink=p.ink, rnd=this.rng(p.seed);
    const pitch=Math.max(9,p.scale*0.4), pull=pitch*(0.6+p.gap*0.05);
    const n=2+Math.floor(rnd()*2), foci=[];
    for(let i=0;i<n;i++) foci.push([W*(0.2+rnd()*0.6), H*(0.2+rnd()*0.6), (W+H)*(0.05+rnd()*0.09)]);
    const dutyMax=0.92, dutyMin=0.05;
    const duty=(x,y)=>{ const f=foci[0]; const b=0.5+0.5*Math.cos(Math.hypot(x-f[0],y-f[1])/(f[2]*1.4)); return dutyMin+(dutyMax-dutyMin)*b; };
    const disp=(c,y)=>{ let cx=c; for(const f of foci) cx+=pull*Math.sin(Math.hypot(c-f[0],y-f[1])/f[2]); return cx; };
    const ext=0.32, x0=-ext*W, x1=W*(1+ext), y0=-ext*H, y1=H*(1+ext), stepY=Math.max(7,H/110);
    const ys=[]; for(let y=y0;y<=y1;y+=stepY) ys.push(y);
    let inner='';
    for(let c=x0;c<=x1;c+=pitch){ let d='';
      for(let k=0;k<ys.length;k++){ const y=ys[k], cx=disp(c,y), hw=pitch/2*duty(cx,y); d+=(k?` L`:`M`)+`${(cx-hw).toFixed(1)},${y.toFixed(1)}`; }
      for(let k=ys.length-1;k>=0;k--){ const y=ys[k], cx=disp(c,y), hw=pitch/2*duty(cx,y); d+=` L${(cx+hw).toFixed(1)},${y.toFixed(1)}`; }
      inner+=`<path d="${d} Z" fill="${ink}"/>`; }
    return `<g>${inner}</g>`;
  }

  _wmMark(W,H,p){
    if(!p.watermark) return '';
    const paths=['<polygon points="240 40.04 190 40.04 100 130.14 190 220.24 240 220.24 150 130.14 240 40.04"/>','<polygon points="123.38 0 100 .06 100 30.09 100 60.11 120 40.1 120 20.08 860 20.08 860.15 240.27 120 240.27 120 220.25 100 200.24 100 220.25 100 260.29 880 260.29 880 0 123.38 0"/>','<path d="M74.55,105.68l25.45-25.6h-42.62c-4.43,0-8.69,1.75-11.82,4.86L0,130.14H0h0s0,0,0,0h0l45.56,45.2c3.14,3.11,7.39,4.86,11.82,4.86h42.62l-25.45-25.6,25.45-24.46-25.45-24.46ZM60.35,141.19l-12.66-4.2-7.81,10.99v-13.58l-12.66-4.2,12.66-4.18-.02-13.59,7.83,10.99,12.66-4.2-7.83,10.99,7.83,10.99Z"/>','<path d="M250,40.04h40v143.55h80v36.65h-120V40.04Z"/>','<path d="M380,40.04h130v36.65h-90.29v33.6h90.29v36.65h-90.29v36.65h90.29v36.65h-130V40.04Z"/>','<path d="M520,40.04h130v36.65h-90.29v33.6h90.29v36.65h-90.29v36.65h90.29v36.65h-130V40.04Z"/>','<path d="M840.98,192.64l-15.64-13.2c9.27-14.17,14.66-31.1,14.66-49.3,0-49.76-40.29-90.1-90-90.1s-90,40.34-90,90.1,40.29,90.1,90,90.1c18.49,0,35.68-5.59,49.97-15.16l17.97,15.16,23.04-27.6ZM750,183.2c-29.27,0-53-23.76-53-53.06s23.73-53.06,53-53.06,53,23.76,53,53.06c0,9.09-2.29,17.65-6.31,25.13l-22.67-19.12-23.04,27.6,18.6,15.69c-6.06,2.41-12.66,3.76-19.58,3.76Z"/>'];
    const rnd=this.rng((p.seed||1)+7919);
    const stamps=[];
    // 40% ink tint baked into fill (no opacity attribute to strip)
    const ghost=this.mix(p.ink||'#201e1d', p.ground&&p.ground!=='transparent'?p.ground:'#ffffff', 0.5);
    // staggered grid of logos across the whole design
    const lw=W*0.09, lh=lw*(304/880), gx=lw*1.5, gy=lh*2.6;
    let row=0;
    for(let y=lh*0.6; y<H; y+=gy){
      const off=(row%2)?gx/2:0;
      for(let x=-lw*0.4+off; x<W; x+=gx){
        stamps.push({ x:x+(rnd()*2-1)*lw*0.06, y:y+(rnd()*2-1)*lh*0.3, s:lh/304, rot:-12+(rnd()*4-2), fill:ghost });
      }
      row++;
    }
    // emit every path of every stamp as an independent element, order shuffled across stamps
    const frags=[];
    for(const st of stamps){ for(const d of paths){
      frags.push('<g transform="translate('+st.x.toFixed(1)+' '+st.y.toFixed(1)+') rotate('+st.rot.toFixed(1)+') scale('+st.s.toFixed(4)+')" fill="'+st.fill+'">'+d+'</g>');
    } }
    for(let i=frags.length-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); const t=frags[i]; frags[i]=frags[j]; frags[j]=t; }
    let fs=Math.max(16,H*0.019); const ink2=p.ink||'#201e1d', gnd2=(p.ground&&p.ground!=='transparent')?p.ground:'#ffffff';
    const txt='DESIGNED BY KLEEQ \u00b7 \u00a9 '+(new Date().getFullYear())+' KLEEQ. ALL RIGHTS RESERVED \u00b7 UNAUTHORIZED REPRODUCTION PROHIBITED \u00b7 KLEEQ.COM \u00b7 TO PURCHASE: CONNECT@KLEEQ.COM';
    fs=Math.min(fs, (W*0.92)/(txt.length*0.645+5)); // shrink type so the line always fits with padding
    const tw=txt.length*fs*0.645, plW=tw+fs*5, plH=fs*2.2, plX=(W-plW)/2, plY=H-plH-H*0.03;
    frags.push('<rect x="'+plX.toFixed(1)+'" y="'+plY.toFixed(1)+'" width="'+plW.toFixed(1)+'" height="'+plH.toFixed(1)+'" fill="'+gnd2+'"/>');
    frags.push('<rect x="'+plX.toFixed(1)+'" y="'+plY.toFixed(1)+'" width="'+plW.toFixed(1)+'" height="'+plH.toFixed(1)+'" fill="none" stroke="'+ink2+'" stroke-width="'+(fs*0.09).toFixed(2)+'"/>');
    frags.push('<text x="'+(W/2).toFixed(1)+'" y="'+(plY+plH/2+fs*0.36).toFixed(1)+'" text-anchor="middle" font-family="Archivo, -apple-system, sans-serif" font-size="'+fs.toFixed(1)+'" font-weight="600" letter-spacing="'+(fs*0.08).toFixed(2)+'" fill="'+ink2+'">'+txt+'</text>');
    return frags.join('');
  }
  // Banded contour underlay — the same warped field as the city-map plates, traced as
  // isolines with marching squares so it stays vector. Drawn UNDER the pattern in a muted
  // ink, so it reads through the gaps instead of sitting on top of the motif.
  buildTopoUnder(W,H,p){
    const amt=(p.topoMix||0)/100;
    if(amt<=0) return '';
    const bands=Math.max(3,Math.min(24,p.topoBands||10));
    const rnd=this.rng((p.seed||7)*7919+13);
    const ph=[rnd()*6.283,rnd()*6.283,rnd()*6.283,rnd()*6.283];
    const k=[1+Math.floor(rnd()*2),1+Math.floor(rnd()*2),2+Math.floor(rnd()*2)];
    const fld=(x,y)=>{ const a=x/W*6.283, b=y/H*6.283;
      const wa=a+0.7*Math.sin(b*1.7+ph[3]), wb=b+0.7*Math.sin(a*1.7+ph[2]);
      const v=Math.sin(wa*k[0]+ph[0])+Math.sin(wb*k[1]+ph[1])+0.7*Math.sin(wa*k[2]+wb+ph[2]);
      return Math.max(0,Math.min(0.999,(v+2.4)/4.8)); };
    const sm=Math.max(0,Math.min(100,p.topoSmooth==null?70:p.topoSmooth));
    const N=Math.round(12+Math.pow(sm/100,1.4)*116), dx=W/N, dy=H/N;
    const g=new Float64Array((N+1)*(N+1));
    for(let j=0;j<=N;j++) for(let i=0;i<=N;i++) g[j*(N+1)+i]=fld(i*dx,j*dy);
    const F=n=>n.toFixed(1);
    const seg=(x1,y1,x2,y2)=>'M'+F(x1)+' '+F(y1)+'L'+F(x2)+' '+F(y2);
    let d='';
    const lerp=(a,b,t)=>a+(b-a)*t;
    for(let j=0;j<N;j++) for(let i=0;i<N;i++){
      const i0=j*(N+1)+i, a=g[i0], b=g[i0+1], c=g[i0+N+2], e=g[i0+N+1];
      const lo=Math.min(a,b,c,e), hi=Math.max(a,b,c,e);
      const l0=Math.ceil(lo*bands), l1=Math.floor(hi*bands);
      for(let L=l0;L<=l1;L++){
        const lv=L/bands;
        if(lv<=lo||lv>=hi) continue;
        const x0=i*dx, y0=j*dy, x1=x0+dx, y1=y0+dy;
        const pts=[];
        if((a<lv)!==(b<lv)) pts.push([lerp(x0,x1,(lv-a)/(b-a)), y0]);
        if((b<lv)!==(c<lv)) pts.push([x1, lerp(y0,y1,(lv-b)/(c-b))]);
        if((e<lv)!==(c<lv)) pts.push([lerp(x0,x1,(lv-e)/(c-e)), y1]);
        if((a<lv)!==(e<lv)) pts.push([x0, lerp(y0,y1,(lv-a)/(e-a))]);
        if(pts.length>=2) d+=seg(pts[0][0],pts[0][1],pts[1][0],pts[1][1]);
        if(pts.length===4) d+=seg(pts[2][0],pts[2][1],pts[3][0],pts[3][1]);
      }
    }
    if(!d) return '';
    const gnd=(p.ground&&p.ground!=='transparent')?p.ground:'#ffffff';
    const col=this.mix(p.ink,gnd,0.72-amt*0.5);
    const sw=Math.max(1,(p.stroke||3)*(0.85+amt*0.5));
    return '<path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="'+sw.toFixed(2)+'" stroke-linecap="round"/>';
  }
  // Contour field — the underlay promoted to a full pattern: the same warped field, but
  // every band traced at its own weight so the terrain reads as ridges, slopes and flats.
  buildTopoField(W,H,p){
    const bands=Math.max(3,Math.min(24,p.topoBands||10));
    const dens=Math.max(0.5,(p.scale||80)/80);
    const rnd=this.rng((p.seed||7)*7919+13);
    const jf=(p.jitter||0)/100;
    const ph=[rnd()*6.283,rnd()*6.283,rnd()*6.283,rnd()*6.283];
    const k=[1+Math.floor(rnd()*2),1+Math.floor(rnd()*2),2+Math.floor(rnd()*2)];
    const warp=0.7+jf*1.1;
    /* Rotation turns the TERRAIN, not the drawing. The marching grid stays aligned to
       the canvas — rotating the traced paths would swing empty corners into frame —
       so the sample point is rotated about the centre before the field is evaluated.
       The contours arrive on a full-bleed canvas at any angle. */
    const rad=((p.rotation||0)*Math.PI)/180, rc=Math.cos(rad), rs=Math.sin(rad);
    const fld=(px,py)=>{ let x=px, y=py;
      if(rad){ const ox=px-W/2, oy=py-H/2; x=W/2+ox*rc-oy*rs; y=H/2+ox*rs+oy*rc; }
      const a=x/W*6.283*dens, b=y/H*6.283*dens;
      const wa=a+warp*Math.sin(b*1.7+ph[3]), wb=b+warp*Math.sin(a*1.7+ph[2]);
      const v=Math.sin(wa*k[0]+ph[0])+Math.sin(wb*k[1]+ph[1])+0.7*Math.sin(wa*k[2]+wb+ph[2]);
      return Math.max(0,Math.min(0.999,(v+2.4)/4.8)); };
    const sm=Math.max(0,Math.min(100,p.topoSmooth==null?70:p.topoSmooth));
    const N=Math.round(16+Math.pow(sm/100,1.4)*180), dx=W/N, dy=H/N;
    const g=new Float64Array((N+1)*(N+1));
    for(let j=0;j<=N;j++) for(let i=0;i<=N;i++) g[j*(N+1)+i]=fld(i*dx,j*dy);
    const F=n=>n.toFixed(1), lerp=(a,b,t)=>a+(b-a)*t;
    /* Soften — how round the traced contours read.
       Marching squares emits one straight chord per cell, so at any useful grid size the
       lines arrive faceted: visible corners every few pixels that print as a sawtooth.
       At 0 the segments are written exactly as marched (the original behaviour). Above 0
       the loose chords are first CHAINED into runs by matching endpoints, then fitted
       with Catmull-Rom curves — the same vertices, curved rather than connected — so the
       contour keeps its position on the terrain while losing its corners. Chaining also
       lets the stroke join along a run instead of butting cap to cap. */
    const soft=Math.max(0,Math.min(100,p.topoSoften==null?0:p.topoSoften));
    const segs=soft>0?[]:null;
    let d='';
    for(let j=0;j<N;j++) for(let i=0;i<N;i++){
      const i0=j*(N+1)+i, a=g[i0], b=g[i0+1], c=g[i0+N+2], e=g[i0+N+1];
      const lo=Math.min(a,b,c,e), hi=Math.max(a,b,c,e);
      for(let L=Math.ceil(lo*bands); L<=Math.floor(hi*bands); L++){
        const lv=L/bands;
        if(lv<=lo||lv>=hi) continue;
        const x0=i*dx, y0=j*dy, x1=x0+dx, y1=y0+dy, pts=[];
        if((a<lv)!==(b<lv)) pts.push([lerp(x0,x1,(lv-a)/(b-a)), y0]);
        if((b<lv)!==(c<lv)) pts.push([x1, lerp(y0,y1,(lv-b)/(c-b))]);
        if((e<lv)!==(c<lv)) pts.push([lerp(x0,x1,(lv-e)/(c-e)), y1]);
        if((a<lv)!==(e<lv)) pts.push([x0, lerp(y0,y1,(lv-a)/(e-a))]);
        if(segs){
          if(pts.length>=2) segs.push([pts[0][0],pts[0][1],pts[1][0],pts[1][1]]);
          if(pts.length===4) segs.push([pts[2][0],pts[2][1],pts[3][0],pts[3][1]]);
        } else {
          if(pts.length>=2) d+='M'+F(pts[0][0])+' '+F(pts[0][1])+'L'+F(pts[1][0])+' '+F(pts[1][1]);
          if(pts.length===4) d+='M'+F(pts[2][0])+' '+F(pts[2][1])+'L'+F(pts[3][0])+' '+F(pts[3][1]);
        }
      }
    }
    if(segs) d=this._chainSmooth(segs,Math.min(dx,dy),soft);
    if(!d) return '';
    const sw=Math.max(1,p.stroke||3);
    return '<path d="'+d+'" fill="none" stroke="'+p.ink+'" stroke-width="'+sw.toFixed(2)+'" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  /* Chain loose segments into runs, then emit them as Catmull-Rom curves.
     Endpoints are keyed on a grid a fraction of a cell wide: marching squares produces
     the SAME interpolated point from both cells sharing an edge, so a coarse key would
     fuse contours that merely pass close, and an exact key would fail on float drift.
     `t` is the curve tension — at soft=0 the beziers would collapse back to the original
     straight chords, so the control is continuous across its whole range. */
  _chainSmooth(segs,cell,soft){
    const q=Math.max(1e-4,cell*0.02), F=n=>n.toFixed(1);
    const key=(x,y)=>Math.round(x/q)+','+Math.round(y/q);
    const ends=new Map();
    const add=(k,i)=>{ const a=ends.get(k); if(a) a.push(i); else ends.set(k,[i]); };
    segs.forEach((s,i)=>{ add(key(s[0],s[1]),i); add(key(s[2],s[3]),i); });
    const used=new Uint8Array(segs.length);
    const step=(x,y,from)=>{
      const list=ends.get(key(x,y)); if(!list) return null;
      for(const i of list){
        if(used[i]||i===from) continue;
        const s=segs[i]; used[i]=1;
        return key(s[0],s[1])===key(x,y) ? [s[2],s[3],i] : [s[0],s[1],i];
      }
      return null;
    };
    const runs=[];
    for(let i=0;i<segs.length;i++){
      if(used[i]) continue;
      used[i]=1;
      const s=segs[i], pts=[[s[0],s[1]],[s[2],s[3]]];
      let cur=[s[2],s[3],i], n;
      while((n=step(cur[0],cur[1],cur[2]))){ pts.push([n[0],n[1]]); cur=n; }
      cur=[s[0],s[1],i];
      while((n=step(cur[0],cur[1],cur[2]))){ pts.unshift([n[0],n[1]]); cur=n; }
      runs.push(pts);
    }
    const t=(soft/100)*0.5;
    let d='';
    for(const pts of runs){
      if(pts.length<2) continue;
      const last=pts.length-1;
      const closed=pts.length>3&&key(pts[0][0],pts[0][1])===key(pts[last][0],pts[last][1]);
      const at=k=>closed?pts[((k%last)+last)%last]:pts[Math.max(0,Math.min(last,k))];
      d+='M'+F(pts[0][0])+' '+F(pts[0][1]);
      for(let k=0;k<last;k++){
        const p0=at(k-1),p1=at(k),p2=at(k+1),p3=at(k+2);
        d+='C'+F(p1[0]+(p2[0]-p0[0])*t)+' '+F(p1[1]+(p2[1]-p0[1])*t)+
           ' '+F(p2[0]-(p3[0]-p1[0])*t)+' '+F(p2[1]-(p3[1]-p1[1])*t)+
           ' '+F(p2[0])+' '+F(p2[1]);
      }
      if(closed) d+='Z';
    }
    return d;
  }
  /* Contour medallion — the same traced terrain, but written in POLAR coordinates and
     clipped to a disc, so the rings grow outward from the centre and the pattern is
     self-contained: nothing reaches the edge of the page. Radius comes from the gap
     control, so gap widens the empty margin and the parameter set stays identical to
     Contour field. */
  buildTopoMedallion(W,H,p){
    const bands=Math.max(3,Math.min(24,p.topoBands||10));
    const dens=Math.max(0.5,(p.scale||80)/80);
    const rnd=this.rng((p.seed||7)*7919+131);
    const jf=(p.jitter||0)/100;
    const ph=[rnd()*6.283,rnd()*6.283,rnd()*6.283,rnd()*6.283];
    const kk=[2+Math.floor(rnd()*3),3+Math.floor(rnd()*4),1+Math.floor(rnd()*2)];
    const warp=0.10+jf*0.24;
    const cx=W/2, cy=H/2;
    const R=Math.min(W,H)*0.5*(1-Math.min(0.5,(p.gap==null?20:p.gap)/100*0.5));
    const rot=((p.rotation||0)*Math.PI)/180;
    /* Rings live in normalised radius, pushed off-circular by two angular harmonics and
       one radial one. Without them the field is a perfect target; with them it reads as
       terrain that happens to be round. Rotation turns the harmonics, not the disc. */
    const fld=(x,y)=>{
      const ox=x-cx, oy=y-cy;
      const rr=Math.sqrt(ox*ox+oy*oy)/R;
      const an=Math.atan2(oy,ox)+rot;
      const rw=rr*(1+warp*Math.sin(an*kk[0]+ph[0])+warp*0.6*Math.sin(an*kk[1]+ph[1]))
              +warp*0.5*Math.sin(rr*6.283*kk[2]+ph[2]);
      return Math.max(0,Math.min(0.999,(Math.sin(rw*6.283*dens*1.35+ph[3])+1.05)/2.1));
    };
    const sm=Math.max(0,Math.min(100,p.topoSmooth==null?70:p.topoSmooth));
    const N=Math.round(16+Math.pow(sm/100,1.4)*180);
    /* march the disc's bounding box only — outside it every sample is discarded anyway */
    const bx0=cx-R, by0=cy-R, dx=(2*R)/N, dy=(2*R)/N;
    const g=new Float64Array((N+1)*(N+1));
    for(let j=0;j<=N;j++) for(let i=0;i<=N;i++) g[j*(N+1)+i]=fld(bx0+i*dx,by0+j*dy);
    const F=n=>n.toFixed(1), lerp=(a,b,t)=>a+(b-a)*t;
    const R2=R*R;
    const inside=(x,y)=>{ const a=x-cx,b=y-cy; return a*a+b*b<=R2; };
    /* A contour that leaves the disc is trimmed AT the circle rather than dropped, so
       the crop is a clean radial edge instead of a ragged one a cell wide. */
    const clip=(ax,ay,bx,by)=>{
      const ai=inside(ax,ay), bi=inside(bx,by);
      if(ai&&bi) return [ax,ay,bx,by];
      if(!ai&&!bi) return null;
      const sx=bx-ax, sy=by-ay, fx=ax-cx, fy=ay-cy;
      const A=sx*sx+sy*sy; if(!A) return null;
      const B=2*(fx*sx+fy*sy), C=fx*fx+fy*fy-R2, disc=B*B-4*A*C;
      if(disc<0) return null;
      const sq=Math.sqrt(disc);
      let t=(-B-sq)/(2*A);
      if(t<0||t>1) t=(-B+sq)/(2*A);
      if(t<0||t>1) return null;
      const mx=ax+sx*t, my=ay+sy*t;
      return ai?[ax,ay,mx,my]:[mx,my,bx,by];
    };
    const soft=Math.max(0,Math.min(100,p.topoSoften==null?0:p.topoSoften));
    const segs=soft>0?[]:null;
    let d='';
    const emit=(ax,ay,bx,by)=>{
      const s=clip(ax,ay,bx,by); if(!s) return;
      if(segs) segs.push(s);
      else d+='M'+F(s[0])+' '+F(s[1])+'L'+F(s[2])+' '+F(s[3]);
    };
    for(let j=0;j<N;j++) for(let i=0;i<N;i++){
      const i0=j*(N+1)+i, a=g[i0], b=g[i0+1], c=g[i0+N+2], e=g[i0+N+1];
      const lo=Math.min(a,b,c,e), hi=Math.max(a,b,c,e);
      for(let L=Math.ceil(lo*bands); L<=Math.floor(hi*bands); L++){
        const lv=L/bands;
        if(lv<=lo||lv>=hi) continue;
        const x0=bx0+i*dx, y0=by0+j*dy, x1=x0+dx, y1=y0+dy, pts=[];
        if((a<lv)!==(b<lv)) pts.push([lerp(x0,x1,(lv-a)/(b-a)), y0]);
        if((b<lv)!==(c<lv)) pts.push([x1, lerp(y0,y1,(lv-b)/(c-b))]);
        if((e<lv)!==(c<lv)) pts.push([lerp(x0,x1,(lv-e)/(c-e)), y1]);
        if((a<lv)!==(e<lv)) pts.push([x0, lerp(y0,y1,(lv-a)/(e-a))]);
        if(pts.length>=2) emit(pts[0][0],pts[0][1],pts[1][0],pts[1][1]);
        if(pts.length===4) emit(pts[2][0],pts[2][1],pts[3][0],pts[3][1]);
      }
    }
    if(segs) d=this._chainSmooth(segs,Math.min(dx,dy),soft);
    if(!d) return '';
    const sw=Math.max(1,p.stroke||3);
    return '<path d="'+d+'" fill="none" stroke="'+p.ink+'" stroke-width="'+sw.toFixed(2)+'" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  // Dot square camo — a straight dot lattice whose dot size is quantized by a blocky camo
  // field defined in 45°-rotated space, so the clusters read as square/diamond patches of
  // graded dots rather than as blobs. Five dot steps plus an empty step.
  buildDotSqCamo(W,H,p){
    const u=Math.max(6,(p.scale||80)*0.13+(p.gap||20)*0.22);
    const rnd=this.rng((p.seed||7)*613+29), jf=(p.jitter||0)/100;
    const cols=Math.max(1,Math.floor(W/u)), rows=Math.max(1,Math.floor(H/u));
    const offX=(W-cols*u)/2, offY=(H-rows*u)/2;
    // coarse patch lattice in rotated space: random walks grow stepped diagonal patches
    const B=4;                                            // dot cells per patch cell
    const R2=0.70710678;
    const gw=Math.ceil((W+H)/(u*B))+2, gh=gw;
    const lv=new Uint8Array(gw*gh);
    const bq=(p.blotchQty==null?100:p.blotchQty)/100;
    const nWalk=Math.max(2,Math.round(gw*gh*0.055*(1+jf*0.6)*bq));
    for(let w=0;w<nWalk;w++){
      let x=Math.floor(rnd()*gw), y=Math.floor(rnd()*gh);
      const top=1+Math.floor(rnd()*5), steps=8+Math.floor(rnd()*22);
      for(let s=0;s<steps;s++){
        if(x>=0&&y>=0&&x<gw&&y<gh){ const i=y*gw+x; if(lv[i]<top) lv[i]=top; }
        if(rnd()<0.5) x+=rnd()<0.5?1:-1; else y+=rnd()<0.5?1:-1;
      }
    }
    // soften: a cell one step below its strongest neighbour keeps the staircase edges reading
    const lv2=lv.slice();
    for(let y=0;y<gh;y++) for(let x=0;x<gw;x++){
      const i=y*gw+x;
      if(lv[i]) continue;
      let mx=0;
      if(x>0) mx=Math.max(mx,lv[i-1]); if(x<gw-1) mx=Math.max(mx,lv[i+1]);
      if(y>0) mx=Math.max(mx,lv[i-gw]); if(y<gh-1) mx=Math.max(mx,lv[i+gw]);
      if(mx>1 && rnd()<0.55) lv2[i]=mx-1;
    }
    const steps=[0,0.24,0.28,0.32,0.36,0.40];          // top step leaves a 20% gap to its neighbour
    const F=n=>n.toFixed(1);
    const buckets=Array.from({length:5},()=>'');
    for(let j=0;j<rows;j++) for(let i=0;i<cols;i++){
      const x=offX+i*u+u/2, y=offY+j*u+u/2;
      const rx=(x*R2+y*R2)/(u*B)+gw*0.25, ry=(-x*R2+y*R2)/(u*B)+gh*0.5;
      const gx=Math.floor(rx), gy=Math.floor(ry);
      let L=(gx>=0&&gy>=0&&gx<gw&&gy<gh)?lv2[gy*gw+gx]:0;
      if(!L){ if(rnd()<0.22) L=1; else continue; }       // sparse ground dots, still cuttable
      const r=u*steps[Math.min(5,L)];
      if(r<0.35) continue;
      if(x-r<0||x+r>W||y-r<0||y+r>H) continue;          // never emit a clipped dot
      buckets[L-1]+='<circle cx="'+F(x)+'" cy="'+F(y)+'" r="'+r.toFixed(2)+'"/>';
    }
    let out='';
    buckets.forEach(d=>{ if(!d) return;
      const col = p.style==='outline' ? 'none' : p.ink;
      out+='<g fill="'+col+'"'+(p.style==='outline'?' stroke="'+p.ink+'" stroke-width="'+Math.max(0.6,(p.stroke||3)*0.4).toFixed(2)+'"':'')+'>'+d+'</g>';
    });
    return out;
  }
  // Hatch shift — one dense hatch whose ANGLE changes by region, so the shapes are drawn
  // purely by direction seams and the moiré where two directions meet. No fills anywhere:
  // every mark is a line, as in the reference.
  buildHatchShift(W,H,p){
    const pitch=Math.max(4,(p.scale||80)*0.05+(p.gap||20)*0.05);
    const rnd=this.rng((p.seed||7)*337+19), jf=(p.jitter||0)/100;
    // The reference is ONE family of fine parallel lines running over a creased surface:
    // nothing changes direction wholesale — the lines bend, and where the surface folds they
    // bunch into dark bands and kink into V's. So: draw the level sets of
    //   u = (x,y)·n + amp * fold(x,y)
    // where fold() is built from |sin| ridges, whose absolute value gives hard creases.
    const a0=(-52+(rnd()-0.5)*14)*Math.PI/180;
    const nx=Math.cos(a0), ny=Math.sin(a0);
    const nF=3+Math.floor(rnd()*3);
    const folds=[];
    for(let k=0;k<nF;k++){
      const fa=(rnd()*180-90)*Math.PI/180;
      folds.push({ fx:Math.cos(fa), fy:Math.sin(fa),
        per:(0.35+rnd()*0.9)*Math.min(W,H), ph:rnd()*6.283,
        amp:pitch*(2.2+rnd()*5)*(0.5+jf*1.6), sharp:rnd()<0.6 });
    }
    const fld=(x,y)=>{
      let v=0;
      for(const f of folds){
        const t=(x*f.fx+y*f.fy)/f.per*6.283+f.ph;
        v += f.amp*(f.sharp ? (Math.abs(Math.sin(t))-0.5) : Math.sin(t));
      }
      return v;
    };
    const F=n=>n.toFixed(1), lerp=(A,B,t)=>A+(B-A)*t;
    const N=Math.max(120,Math.round(Math.max(W,H)/Math.max(3,pitch*0.6)));
    const dx=W/N, dy=H/N;
    const g=new Float64Array((N+1)*(N+1));
    for(let j=0;j<=N;j++){ const y=j*dy;
      for(let i=0;i<=N;i++){ const x=i*dx; g[j*(N+1)+i]=x*nx+y*ny+fld(x,y); } }
    let d='';
    for(let j=0;j<N;j++) for(let i=0;i<N;i++){
      const i0=j*(N+1)+i, A=g[i0], B=g[i0+1], C=g[i0+N+2], E=g[i0+N+1];
      const lo=Math.min(A,B,C,E), hi=Math.max(A,B,C,E);
      for(let L=Math.ceil(lo/pitch); L<=Math.floor(hi/pitch); L++){
        const lv=L*pitch;
        if(lv<=lo||lv>=hi) continue;
        const x0=i*dx, y0=j*dy, x1=x0+dx, y1=y0+dy, pts=[];
        if((A<lv)!==(B<lv)) pts.push([lerp(x0,x1,(lv-A)/(B-A)), y0]);
        if((B<lv)!==(C<lv)) pts.push([x1, lerp(y0,y1,(lv-B)/(C-B))]);
        if((E<lv)!==(C<lv)) pts.push([lerp(x0,x1,(lv-E)/(C-E)), y1]);
        if((A<lv)!==(E<lv)) pts.push([x0, lerp(y0,y1,(lv-A)/(E-A))]);
        if(pts.length>=2) d+='M'+F(pts[0][0])+' '+F(pts[0][1])+'L'+F(pts[1][0])+' '+F(pts[1][1]);
        if(pts.length===4) d+='M'+F(pts[2][0])+' '+F(pts[2][1])+'L'+F(pts[3][0])+' '+F(pts[3][1]);
      }
    }
    const sw=Math.max(0.8,(p.stroke||3)*0.7);
    return '<path d="'+d+'" fill="none" stroke="'+p.ink+'" stroke-width="'+sw.toFixed(2)+'" stroke-linecap="round"/>';
  }
  // Hatch camo — camo shapes revealed purely by hatching: one fine diagonal line family,
  // dense inside the shapes and sparse in the ground, cut exactly at the edge. The camo is
  // drawn by where the lines stop, never by a fill. digital=true steps the edges onto a
  // coarse grid so every boundary is a 90° staircase.
  buildHatchCamo(W,H,p,digital){
    const pitch=Math.max(4,(p.scale||80)*0.055+(p.gap||20)*0.05);
    const rnd=this.rng((p.seed||7)*811+37), jf=(p.jitter||0)/100;
    const rot=(p.rotation||0)*Math.PI/180;
    const a0=(-58+(rnd()-0.5)*16)*Math.PI/180+rot;
    const ca=Math.cos(a0), sa=Math.sin(a0), nx=-sa, ny=ca;
    const rc=Math.cos(-rot), rs=Math.sin(-rot), cxp=W/2, cyp=H/2;
    const un=(x,y)=>{ const dx2=x-cxp, dy2=y-cyp;
      return [cxp+dx2*rc-dy2*rs, cyp+dx2*rs+dy2*rc]; };
    const mkBlobs=(n,R)=>{ const out=[];
      for(let b=0;b<n;b++) out.push({
        x:rnd()*W, y:rnd()*H, r:R*(0.55+rnd()*0.85),
        k1:2+Math.floor(rnd()*3), k2:4+Math.floor(rnd()*4),
        a1:0.20+rnd()*0.16, a2:0.10+rnd()*0.10,
        p1:rnd()*6.283, p2:rnd()*6.283,
        sx:0.72+rnd()*0.7, ang:rnd()*6.283 });
      return out; };
    const bq=(p.blotchQty==null?100:p.blotchQty)/100;
    const Rb=Math.min(W,H)*(0.15+jf*0.05)/Math.sqrt(Math.max(0.35,bq));
    const outer=mkBlobs(Math.max(3,Math.round((13+jf*10)*bq)), Rb);
    const inner=mkBlobs(Math.max(4,Math.round((46+jf*30)*bq)), Rb*0.34);
    const hit=(set,x,y)=>{
      let best=-1;
      for(const b of set){
        let dx2=x-b.x, dy2=y-b.y;
        const cb=Math.cos(b.ang), sb=Math.sin(b.ang);
        const u2=(dx2*cb+dy2*sb)/b.sx, v2=(-dx2*sb+dy2*cb)*b.sx;
        const d2=Math.hypot(u2,v2);
        if(d2>b.r*1.6) continue;
        const th=Math.atan2(v2,u2);
        const rr=b.r*(1+b.a1*Math.sin(th*b.k1+b.p1)+b.a2*Math.sin(th*b.k2+b.p2));
        const v3=1-d2/rr;
        if(v3>best) best=v3;
      }
      return best>0;
    };
    const blk=Math.max(pitch*3,Math.min(W,H)*0.045);
    // 0 = ground, 1 = patch, 2 = nested blotch inside a patch
    const zoneAt=(X,Y)=>{
      const q=un(X,Y); let x=q[0], y=q[1];
      if(digital){ x=Math.floor(x/blk)*blk+blk/2; y=Math.floor(y/blk)*blk+blk/2; }
      if(!hit(outer,x,y)) return 0;
      return hit(inner,x,y) ? 2 : 1;
    };
    const F=n=>n.toFixed(1);
    const L0=Math.floor(Math.min(0,W*nx,H*ny,W*nx+H*ny)/pitch)-1;
    const L1=Math.ceil(Math.max(0,W*nx,H*ny,W*nx+H*ny)/pitch)+1;
    const step=Math.max(1.4,pitch*0.35);
    let dIn='', dOut='', dNest='';
    for(let L=L0;L<=L1;L++){
      const s=L*pitch, px=nx*s, py=ny*s;
      const evy2=(((L%2)+2)%2)===0, evy3=(((L%3)+3)%3)===0;
      let t0=-1e9, t1=1e9, dead=false;
      const lim=(pq,qq)=>{ if(Math.abs(pq)<1e-12){ if(qq<0) dead=true; return; }
        const r=qq/pq; if(pq<0){ if(r>t0) t0=r; } else { if(r<t1) t1=r; } };
      lim(-ca,px); lim(ca,W-px); lim(-sa,py); lim(sa,H-py);
      if(dead||t1<=t0) continue;
      const at=t=>zoneAt(px+ca*t, py+sa*t);
      const edge=(lo,hi,want)=>{ for(let it=0;it<7;it++){ const m=(lo+hi)/2;
          if(at(m)===want) hi=m; else lo=m; } return hi; };
      let cur=at(t0), runStart=t0;
      const emit=(from2,to2,z)=>{
        if(to2-from2<0.4) return;
        const seg='M'+F(px+ca*from2)+' '+F(py+sa*from2)+'L'+F(px+ca*to2)+' '+F(py+sa*to2);
        if(z===1) dIn+=seg;                                // patch: every line
        else if(z===2){ if(evy3) dNest+=seg; }             // nested: sparse, reads lighter
        else if(evy2) dOut+=seg;                           // ground: every other line
      };
      for(let t=t0+step;t<=t1;t+=step){
        const on=at(t);
        if(on!==cur){
          const b=edge(t-step,t,on);
          emit(runStart,b,cur);
          runStart=b; cur=on;
        }
      }
      emit(runStart,t1,cur);
    }
    const sw=Math.max(0.8,(p.stroke||3)*0.75);
    let out='';
    const gk=(p.hatchGround==null?105:p.hatchGround)/100;
    if(dOut) out+='<path d="'+dOut+'" fill="none" stroke="'+p.ink+'" stroke-width="'+sw.toFixed(2)+'" stroke-linecap="butt"/>';
    if(dNest) out+='<path d="'+dNest+'" fill="none" stroke="'+p.ink+'" stroke-width="'+Math.max(0.4,sw*gk*1.35).toFixed(2)+'" stroke-linecap="butt"/>';
    if(dIn) out+='<path d="'+dIn+'" fill="none" stroke="'+p.ink+'" stroke-width="'+Math.max(0.4,sw*gk).toFixed(2)+'" stroke-linecap="butt"/>';
    return out;
  }
  // Diagonal slabs — bold sheared bars on a row grid: every bar leans on one shared 45°
  // axis, lengths and gaps quantised to a unit so the field stays architectural, and some
  // bars run two rows tall or carry a stepped notch, as in the reference poster.
  buildSlabDiag(W,H,p){
    const rnd=this.rng((p.seed||7)*457+23), jf=(p.jitter||0)/100;
    const rows=Math.max(9,Math.round(22-(p.scale||80)*0.09));
    const rh=H/rows;
    const lean=(p.rotation||0)===0 ? 1 : Math.tan((45+Math.max(-30,Math.min(30,p.rotation)))*Math.PI/180);
    const unit=Math.max(rh*0.9,(W/16)*(0.7+jf*0.8));
    const len=unit*1.92;
    const F=n=>n.toFixed(1);
    const bar=(xa,xb,y0,y1)=>{
      const s=(y1-y0)*lean;
      return 'M'+F(xa)+' '+F(y1)+'L'+F(xa+s)+' '+F(y0)+'L'+F(xb+s)+' '+F(y0)+'L'+F(xb)+' '+F(y1)+'Z';
    };
    // Nothing stands alone in the reference: every slab is a link in a stepped chain that
    // walks down the rows. Build chains, not cells — each step keeps part of the long edge
    // shared with the bar above, so the run reads as one continuous folded band.
    let d='';
    const cellW=len;                                      // occupancy grid, one cell per bar width
    const gcx=Math.max(1,Math.ceil(W/cellW)+2), gcy=rows;
    const occ=new Uint8Array(gcx*gcy);
    const claim=(bx,wl,j)=>{
      const a3=Math.floor((bx+cellW)/cellW), b3=Math.ceil((bx+wl+cellW)/cellW);
      for(let i2=a3;i2<b3;i2++){ if(i2<0||i2>=gcx) continue;
        if(occ[j*gcx+i2]) return false; }
      for(let i2=a3;i2<b3;i2++){ if(i2<0||i2>=gcx) continue; occ[j*gcx+i2]=1; }
      return true;
    };
    const bq=(p.blotchQty==null?100:p.blotchQty)/100;
    const nMass=Math.max(1,Math.round(4*bq));
    const masses=[];
    for(let b=0;b<nMass;b++) masses.push({
      x:rnd()*W, y:rnd()*H,
      r:Math.min(W,H)*(0.30+rnd()*0.22)/Math.sqrt(Math.max(0.4,bq)) });
    const inMass=(x,y)=>{ for(const q of masses){
      if(Math.hypot(x-q.x,y-q.y)<q.r*(0.8+0.4*Math.sin((x*0.011+y*0.013)))) return true; } return false; };
    const budget=gcx*gcy*0.45;                             // stop near half coverage
    let used=0;
    for(let c=0;c<600 && used<budget;c++){
      let x=-len+rnd()*(W+len*2);                          // chains keep coming until the
                                                           // coverage budget is reached
      const j0=Math.floor(rnd()*rows*0.5);
      const span=Math.max(3,Math.round(3+rnd()*(rows-j0-1)));
      let dir=rnd()<0.5?-1:1;
      let w=1+Math.floor(rnd()*3);                          // slab widths in bar units
      const links=[];
      for(let k=0;k<span;k++){
        const j=j0+k;
        if(j>=rows) break;
        const bx=x-j*rh*lean, wl=len*w;
        links.push({ j, bx, wl, on:(bx+wl>0 && bx<W) });
        if(rnd()<0.45) w=Math.max(1,Math.min(3,w+(rnd()<0.5?-1:1)));
        const r2=rnd();
        // step a full bar length or more so the run walks across the panel instead of
        // stacking on itself; the row shear keeps the long edge shared either way
        if(r2>=0.42){ if(r2>0.88) dir=-dir; x+=dir*len*(1+Math.floor(rnd()*w)); }
      }
      let bestA=0, bestN=0, a2=0, n2=0;
      links.forEach((L,idx)=>{ if(L.on){ if(n2===0) a2=idx; n2++; if(n2>bestN){ bestN=n2; bestA=a2; } } else n2=0; });
      if(bestN<2) continue;                                 // a lone link is a widow: drop it
      let placed=0;
      for(let idx=bestA; idx<bestA+bestN; idx++){
        const L=links[idx], y0=L.j*rh;
        if(!inMass(L.bx+L.wl/2, y0+rh/2)) continue;          // outside every mass: ground
        if(!claim(L.bx,L.wl,L.j)) continue;                 // never ink an occupied cell
        placed++; used+=Math.round(L.wl/cellW);
        d+=bar(L.bx, L.bx+L.wl, y0, y0+rh);
        if(idx>bestA && idx<bestA+bestN-1 && rnd()<0.18){
          const side=rnd()<0.5?-1:1;
          const bx2=side<0 ? L.bx-len : L.bx+L.wl;
          if(bx2+len>0 && bx2<W && claim(bx2,len,L.j)){ used++; d+=bar(bx2, bx2+len, y0, y0+rh); }
        }
      }
      if(placed<2){ /* the run collided away to a widow — its cells stay claimed, no ink */ }
    }
    if(p.style==='outline')
      return '<path d="'+d+'" fill="none" stroke="'+p.ink+'" stroke-width="'+Math.max(1,p.stroke||3).toFixed(2)+'"/>';
    return '<path d="'+d+'" fill="'+p.ink+'"/>';
  }
  // Stepped bar field — one family of fine parallel bars where the WEIGHT steps along each
  // bar: a hairline run swells into a heavy run and drops back, with the overall weight
  // ramping across the panel. Built in rotated (u,v) space and turned as a whole.
  buildSteppedBars(W,H,p){
    const rnd=this.rng((p.seed||7)*929+31), jf=(p.jitter||0)/100;
    const D=Math.hypot(W,H)*0.62;
    const pitch=Math.max(6,(p.scale||80)*0.14+(p.gap||20)*0.12);
    const ang=(p.rotation||0)+(-28+(rnd()-0.5)*10);
    const seg0=pitch*(3.4+jf*4);
    const ph=[rnd()*6.283,rnd()*6.283,rnd()*6.283];
    const bq=(p.blotchQty==null?100:p.blotchQty)/100;
    const nMass=Math.max(1,Math.round(5*bq));
    const masses=[];
    for(let b=0;b<nMass;b++) masses.push({
      x:(rnd()*2-1)*D*0.85, y:(rnd()*2-1)*D*0.85,
      r:D*(0.30+rnd()*0.24)/Math.sqrt(Math.max(0.4,bq)) });
    const wf=(u,v)=>{
      const g2=0.5+0.5*Math.sin((u*0.55+v*1.35)/D*3.1+ph[0]);
      const w2=0.35*Math.sin((u*1.7-v*0.6)/D*6.283+ph[1])+0.22*Math.sin(v/D*9+ph[2]);
      let m2=0;
      for(const q of masses){ const dx=u-q.x, dy=v-q.y;
        m2=Math.max(m2, 1-Math.hypot(dx,dy)/q.r); }
      return Math.max(0,Math.min(1,g2*0.42+w2*0.32+Math.max(0,m2)*0.62+0.1));
    };
    const steps=[0.06,0.2,0.42,0.68];
    const F=n=>n.toFixed(1);
    let d='';
    for(let v=-D; v<=D; v+=pitch){
      let u=-D-seg0*rnd();
      while(u<D){
        const seg=seg0*(0.55+rnd()*0.9);
        const lvl=Math.min(3,Math.max(0,Math.floor(wf(u+seg/2,v)*4+(rnd()-0.5)*0.5)));
        const t=pitch*steps[lvl];
        d+='M'+F(u)+' '+F(v-t/2)+'h'+F(seg)+'v'+F(t)+'h'+F(-seg)+'Z';
        u+=seg;
      }
    }
    const wrap=inner=>'<g transform="translate('+(W/2).toFixed(1)+' '+(H/2).toFixed(1)+') rotate('+ang.toFixed(2)+')">'+inner+'</g>';
    if(p.style==='outline')
      return wrap('<path d="'+d+'" fill="none" stroke="'+p.ink+'" stroke-width="'+Math.max(0.6,(p.stroke||3)*0.5).toFixed(2)+'"/>');
    return wrap('<path d="'+d+'" fill="'+p.ink+'"/>');
  }
  /* Expand a tiling into real repeated geometry.
     A <pattern> fill is valid vector and scales forever, but it exists as ONE rect
     referencing a tile in <defs>, so Illustrator opens it as a single rectangle wearing
     a pattern swatch — nothing to select, nothing to edit — and most cutting and
     engraving software ignores pattern fills outright. Expanding emits the tile as
     translated groups: ordinary paths every vector tool can select and edit.
     The grid is computed in the PATTERN's frame — the canvas corners are rotated back by
     the pattern angle to get the tile-space bounding box — so a rotated tiling still
     covers the page instead of leaving bare wedges at the corners. */
  _expandTiles(W,H,p,inner,Tw,Th){
    if(!(Tw>0&&Th>0)) return null;
    const r=(p.rotation||0)*Math.PI/180, c=Math.cos(r), s=Math.sin(r);
    const pts=[[0,0],[W,0],[0,H],[W,H]].map(([x,y])=>[x*c+y*s, -x*s+y*c]);
    const xs=pts.map(q=>q[0]), ys=pts.map(q=>q[1]);
    const i0=Math.floor(Math.min(...xs)/Tw)-1, i1=Math.ceil(Math.max(...xs)/Tw)+1;
    const j0=Math.floor(Math.min(...ys)/Th)-1, j1=Math.ceil(Math.max(...ys)/Th)+1;
    /* A fine tile on a large sheet runs to tens of thousands of copies; past that the
       file stops being openable and the pattern fill is the better answer. */
    if((i1-i0)*(j1-j0)>20000) return null;
    /* Some tiles carry their own defs (a clipPath per cell, say). Copying the markup
       verbatim would repeat those ids thousands of times, which is invalid SVG and the
       first thing a strict importer chokes on — so ids and their url(#) references are
       renamed per copy. Tiles without ids skip the rewrite entirely. */
    const hasIds=/id="/.test(inner);
    let g='';
    for(let j=j0;j<j1;j++) for(let i=i0;i<i1;i++){
      const body=hasIds
        ? inner.replace(/id="([^"]+)"/g,(m,d)=>'id="'+d+'-'+i+'-'+j+'"')
               .replace(/url\(#([^)]+)\)/g,(m,d)=>'url(#'+d+'-'+i+'-'+j+')')
        : inner;
      g+='<g transform="translate('+(i*Tw).toFixed(1)+' '+(j*Th).toFixed(1)+')">'+body+'<'+'/g>';
    }
    return p.rotation ? '<g transform="rotate('+p.rotation+')">'+g+'<'+'/g>' : g;
  }
  buildSVG(W,H,p,fit,expand){
    const out=this._buildSVG0(W,H,p,fit,expand);
    if(fit||!out) return out;
    const y=new Date().getFullYear(), name=((window.KLEEQ_MOTIFS||[]).find(d=>d[0]===p.motif)||[])[1]||p.motif;
    const meta=`<title>KLEEQ \u2014 ${name}</title><metadata><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:dc="http://purl.org/dc/elements/1.1/"><rdf:Description><dc:title>${name}</dc:title><dc:creator>KLEEQ</dc:creator><dc:rights>\u00a9 ${y} KLEEQ. Proprietary pattern. Licensed for use on KLEEQ products and KLEEQ-authorised projects only. Commercial licensing: connect@kleeq.com</dc:rights></rdf:Description></rdf:RDF></metadata>`;
    const i=out.indexOf('>'); return i<0?out:out.slice(0,i+1)+meta+out.slice(i+1);
  }
  _buildSVG0(W,H,p,fit,expand){
    const laser=this.isLaser(p.motif);
    const grd = (!laser && p.ground && p.ground!=='transparent') ? `<rect width="${W}" height="${H}" fill="${p.ground}"/>` : '';
    const mir=(p.mirrorX||p.mirrorY)?`<g transform="translate(${p.mirrorX?W:0} ${p.mirrorY?H:0}) scale(${p.mirrorX?-1:1} ${p.mirrorY?-1:1})">`:'';
    const mirEnd=mir?'</g>':'';
    if(this.isField(p.motif)){
      const sz = fit ? `width="100%" height="100%" preserveAspectRatio="xMidYMid meet"` : (laser ? `width="${(W*0.254).toFixed(1)}mm" height="${(H*0.254).toFixed(1)}mm"` : `width="${W}" height="${H}"`);
      const body = p.motif==='stepbars' ? this.buildSteppedBars(W,H,p) : p.motif==='slabdiag' ? this.buildSlabDiag(W,H,p) : p.motif==='hatchcamo' ? this.buildHatchCamo(W,H,p) : p.motif==='hatchdig' ? this.buildHatchCamo(W,H,p,true) : p.motif==='hatchshift' ? this.buildHatchShift(W,H,p) : p.motif==='dotsqcamo' ? this.buildDotSqCamo(W,H,p) : p.motif==='digblotch' ? this.buildDigBlotch(W,H,p) : p.motif==='topocont' ? this.buildTopoField(W,H,p) : p.motif==='topodisc' ? this.buildTopoMedallion(W,H,p) : p.motif==='warp' ? this.buildWarp(W,H,p) : p.motif==='warpflow' ? this.buildWarpFlow(W,H,p) : p.motif==='warpfocal' ? this.buildWarpFocal(W,H,p) : p.motif==='skulls' ? this.buildSkulls(W,H,p) : p.motif==='skullnet' ? this.buildSkullNet(W,H,p) : p.motif==='skullcamo' ? this.buildSkullCamo(W,H,p) : p.motif==='skullhex' ? this.buildSkullHex(W,H,p) : p.motif==='skullhexflat' ? this.buildSkullHex(W,H,p,true) : p.motif==='skullhexlaser' ? this.buildSkullHexLaser(W,H,p) : p.motif==='kleeqhex' ? this.buildKleeqHex(W,H,p) : p.motif==='kleeqkhex' ? this.buildKleeqKHex(W,H,p) : p.motif==='kleeqhexlaser' ? this.buildKleeqDuo(W,H,p,'laser','arrow') : p.motif==='kleeqkhexlaser' ? this.buildKleeqDuo(W,H,p,'laser','k') : p.motif==='kleeqduo' ? this.buildKleeqDuo(W,H,p,'fill','both') : p.motif==='kleeqduolaser' ? this.buildKleeqDuo(W,H,p,'laser','both') : p.motif==='kleeqscatter' ? this.buildKleeqDuo(W,H,p,'fill','both',true) : p.motif==='kleeqscatterlaser' ? this.buildKleeqDuo(W,H,p,'laser','both',true) : p.motif==='kleeqduoflat' ? this.buildKleeqDuo(W,H,p,'fill','both',false,true) : p.motif==='kleeqtrio' ? this.buildKleeqDuo(W,H,p,'fill','both',false,false,{glyphs:3}) : p.motif==='kleeqscale' ? this.buildKleeqDuo(W,H,p,'fill','both',false,false,{scaleVary:true}) : p.motif==='kleeqhalfdrop' ? this.buildKleeqDuo(W,H,p,'fill','both',false,false,{halfDrop:true}) : p.motif==='kleeqtwo' ? this.buildKleeqDuo(W,H,p,'fill','both',false,false,{twoColor:true}) : p.motif==='archweave' ? this.buildArchWeave(W,H,p) : p.motif==='ribbons' ? this.buildRibbons(W,H,p) : p.motif==='isocity' ? this.buildIsoCity(W,H,p) : p.motif==='isogrid' ? this.buildIsoGrid(W,H,p) : p.motif==='isowire' ? this.buildIsoWire(W,H,p) : p.motif==='isoink' ? this.buildIsoInk(W,H,p) : p.motif==='hexcamo' ? this.buildHexCamo(W,H,p) : p.motif==='hexhalf' ? this.buildHexHalf(W,H,p) : p.motif==='hexcube' ? this.buildHexCube(W,H,p) : p.motif==='hexcubemil' ? this.buildHexCubeMil(W,H,p) : p.motif==='hexcubelaser' ? this.buildHexCubeLaser(W,H,p) : p.motif==='rhombhalf' ? this.buildRhombHalf(W,H,p) : p.motif==='rhomblaser' ? this.buildRhombLaser(W,H,p) : p.motif==='blobcamo' ? this.buildBlobCamo(W,H,p) : p.motif==='burst' ? this.buildBurst(W,H,p) : p.motif==='nova' ? this.buildNova(W,H,p) : p.motif==='comettrail' ? this.buildCometTrail(W,H,p) : p.motif==='shower' ? this.buildShower(W,H,p) : this.buildField(W,H,p);
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" ${sz}>`+grd+this.buildTopoUnder(W,H,p)+mir+this.outlineize(body,p)+mirEnd+this._wmMark(W,H,p)+`</svg>`;
    }
    const r=this.buildTile(p), inner=r.inner, Tw=r.Tw||r.T, Th=r.Th||r.T;
    const sz = fit ? `width="100%" height="100%" preserveAspectRatio="xMidYMid slice"` : `width="${W}" height="${H}"`;
    const topoU=this.buildTopoUnder(W,H,p);
    if(p.tileMode==='single'){
      // regular (non-repeating): one tile, centered; Scale drives its size directly
      // (auto-cover cancelled the slider out — now 80 = 1.33x cover, growing linearly)
      const k=Math.max(W/Tw,H/Th)*(Math.max(24,p.scale||80)/60), tx=((W-Tw*k)/2).toFixed(1), ty=((H-Th*k)/2).toFixed(1);
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" ${sz}>`+
        grd+topoU+mir+`<g transform="rotate(${p.rotation} ${W/2} ${H/2}) translate(${tx} ${ty}) scale(${k.toFixed(4)})">${this.outlineize(inner,p)}</g>`+mirEnd+this._wmMark(W,H,p)+`</svg>`;
    }
    const tileInner=this.outlineize(inner,p);
    const flat=expand?this._expandTiles(W,H,p,tileInner,Tw,Th):null;
    const head=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" ${sz}>`;
    if(flat) return head+grd+topoU+mir+flat+mirEnd+this._wmMark(W,H,p)+`</svg>`;
    return head+
      `<defs><pattern id="k" width="${Tw}" height="${Th}" patternUnits="userSpaceOnUse" patternTransform="rotate(${p.rotation})">${tileInner}</pattern></defs>`+
      grd+topoU+mir+`<rect width="${W}" height="${H}" fill="url(#k)"/>`+mirEnd+this._wmMark(W,H,p)+`</svg>`;
  }

  dataUri(svg){ return 'data:image/svg+xml,'+encodeURIComponent(svg); }

  // generic outline fallback: converts filled elements to stroked outlines for motifs that don't natively support outline
  outlineize(markup,p){
    if(p.style!=='outline') return markup;
    const sw=Math.max(0.8,(p.stroke||2)*0.5).toFixed(2);
    const gnd=String(p.ground||'').toLowerCase();
    return markup.replace(/fill="(#[0-9a-fA-F]{3,8})"(?![^>]*stroke-width)/g,(m0,c)=> c.toLowerCase()===gnd ? m0 : 'fill="none" stroke="'+c+'" stroke-width="'+sw+'"');
  }

  _imgEl(src){
    const z=this.state.zoom;
    if(z==='fit'||!this._dims){ const img0=React.createElement('img',{src,alt:'pattern preview',style:{width:'100%',height:'100%',objectFit:'contain',display:'block'}});
      if(!this.state.rulerOn||!this._dims) return img0;
      // fit view: scale the inch ticks to the drawn width using a CSS calc on the container width
      const inchPct=(100/this._inW()).toFixed(3)+'%', tickF='repeating-linear-gradient(90deg, var(--color-text) 0 1px, transparent 1px '+inchPct+')';
      const ar=this._dims.W/this._dims.H;
      return React.createElement('div',{style:{width:'100%',height:'100%',display:'flex',flexDirection:'column',padding:'18px 0 0 18px',boxSizing:'border-box'}},
        React.createElement('div',{style:{flex:1,minHeight:0,display:'flex',alignItems:'flex-start',justifyContent:'flex-start'}},
          React.createElement('div',{style:{position:'relative',maxWidth:'100%',maxHeight:'100%',aspectRatio:String(ar),width:'100%'}},
            React.createElement('div',{style:{position:'absolute',left:0,right:0,top:'-18px',height:'18px',backgroundImage:tickF,borderBottom:'1px solid var(--color-divider)'}}),
            React.createElement('div',{style:{position:'absolute',top:0,bottom:0,left:'-18px',width:'18px',backgroundImage:'repeating-linear-gradient(180deg, var(--color-text) 0 1px, transparent 1px '+(100/(this._inW()/ar)).toFixed(3)+'%)',borderRight:'1px solid var(--color-divider)'}}),
            React.createElement('img',{src,alt:'pattern preview',style:{width:'100%',height:'100%',display:'block'}})))); }
    const f=z==='2'?2:z==='0.5'?0.5:z==='0.25'?0.25:(z==='true'?(96*this._inW()/this._dims.W):1);
    const img=React.createElement('img',{src,alt:'pattern preview',onMouseDown:this._panDown,draggable:false,style:{width:(this._dims.W*f)+'px',height:(this._dims.H*f)+'px',maxWidth:'none',display:'block',cursor:'grab'}});
    if(!this.state.rulerOn) return img;
    const inch=(this._dims.W/this._inW()*f).toFixed(2);
    const tick='repeating-linear-gradient(90deg, var(--color-text) 0 1px, transparent 1px '+inch+'px)';
    const tickV='repeating-linear-gradient(180deg, var(--color-text) 0 1px, transparent 1px '+inch+'px)';
    return React.createElement('div',{style:{position:'relative',width:(this._dims.W*f+18)+'px'}},
      React.createElement('div',{style:{position:'sticky',top:0,marginLeft:'18px',height:'18px',width:(this._dims.W*f)+'px',background:'var(--color-surface-2)',backgroundImage:tick,borderBottom:'1px solid var(--color-divider)',zIndex:2}}),
      React.createElement('div',{style:{display:'flex'}},
        React.createElement('div',{style:{position:'sticky',left:0,width:'18px',flex:'none',background:'var(--color-surface-2)',backgroundImage:tickV,borderRight:'1px solid var(--color-divider)',zIndex:2}}),
        img));
  }
  _queueThumb(id){
    (this._thumbQ||(this._thumbQ=[])).push(id); if(this._thumbT) return;
    const run=(deadline)=>{ this._thumbT=null; let n=0; const start=performance.now();
      while(this._thumbQ.length && n<4 && (performance.now()-start)<24){ const mid=this._thumbQ.shift(); if(this._thumbs[mid]!=null) continue; n++;
        const base={ motif:mid, scale:80, gap:20, stroke:3, rotation:0, jitter:0, seed:7, style:'fill', ink:'#201e1d', ground:'#f3f2f2', accent:'#ec3013', accentOn:true, accentStyle:'ticks', aspect:'square', gradient:'none' };
        let out=''; for(const sc of [80,130,200]){ try{ const svg=this.buildSVG(640,640,{...this.getParams(),...base,scale:sc},true); if(svg&&svg.length>140){ out=this.dataUri(svg); break; } }catch(e){} }
        this._thumbs[mid]=out; }
      if(n){ this._motifKey=null; this.forceUpdate(); }
      if(this._thumbQ.length) this._thumbT=(window.requestIdleCallback||((f)=>setTimeout(()=>f({timeRemaining:()=>16}),16)))(run);
      else if(this.onThumbsDone) this.onThumbsDone(); };
    this._thumbT=(window.requestIdleCallback||((f)=>setTimeout(()=>f({timeRemaining:()=>16}),16)))(run);
  }
  _scheduleStats(svg,d){
    clearTimeout(this._st);
    this._st=setTimeout(()=>{ try{
      let host=this._statHost;
      if(!host){ host=this._statHost=document.createElement('div'); host.style.cssText='position:absolute;left:-99999px;top:0;width:0;height:0;overflow:hidden'; document.body.appendChild(host); }
      host.innerHTML=svg;
      const els=[...host.querySelectorAll('path,circle,rect,line,polyline,polygon,ellipse')];
      const cap=3000; let sum=0, counted=0;
      for(let i=0;i<Math.min(els.length,cap);i++){ const el=els[i], tag=el.tagName.toLowerCase(); let L=0;
        if(tag==='circle') L=2*Math.PI*(parseFloat(el.getAttribute('r'))||0);
        else if(tag==='rect') L=2*((parseFloat(el.getAttribute('width'))||0)+(parseFloat(el.getAttribute('height'))||0));
        else if(tag==='line'){ L=Math.hypot(((+el.getAttribute('x2'))||0)-((+el.getAttribute('x1'))||0),((+el.getAttribute('y2'))||0)-((+el.getAttribute('y1'))||0)); }
        else { try{ L=el.getTotalLength(); }catch(e){} }
        sum+=L; counted++;
      }
      if(els.length>counted&&counted>0) sum=sum*els.length/counted;
      let n=els.length;
      const pm=svg.match(/<pattern[^>]*width="([\d.]+)"/);
      if(pm){ const T=parseFloat(pm[1]); if(T>0){ const reps=Math.max(1,(d.W/T)*(d.H/T)); sum*=reps; n=Math.round(n*reps); } }
      host.innerHTML='';
      const inches=sum/100;
      this.setState({ cutStats: n.toLocaleString()+' elements \u00b7 ~'+Math.round(inches).toLocaleString()+' in ('+(inches*0.0254).toFixed(1)+' m) cut path' });
    }catch(e){} },350);
  }
  toggleCmp=()=>{ const on=!this.state.cmpOn; this._motifKey=null; this.setState({cmpOn:on, cmpMotif:on?'':this.state.cmpMotif}); };
  onCmpChange=e=>this.set('cmpMotif',e.target.value);
  setZoomFit=()=>this.set('zoom','fit');
  _zoomSteps=['fit','0.25','0.5','1','2'];
  onPreviewWheel=e=>{ if(!(e.ctrlKey||e.metaKey)) return; e.preventDefault(); const z=this.state.zoom||'fit'; let i=this._zoomSteps.indexOf(z); if(i<0) i=0; i=Math.max(0,Math.min(this._zoomSteps.length-1,i+(e.deltaY<0?1:-1))); if(this._zoomSteps[i]!==z) this.set('zoom',this._zoomSteps[i]); };
  onPreviewDbl=()=>this.set('zoom',(this.state.zoom||'fit')==='fit'?'1':'fit');
  setZoomQ=()=>this.set('zoom','0.25');
  setZoomH=()=>this.set('zoom','0.5');
  setZoom1=()=>this.set('zoom','1');
  setZoom2=()=>this.set('zoom','2');
  copySvg = async () => {
    const p=this.getParams(), d=this.aspectDims(p);
    const svg=this.buildSVG(d.W,d.H,p,false,true);
    try { await navigator.clipboard.writeText(svg); } catch(e) {}
    this.setState({ copied:true });
    clearTimeout(this._ct); this._ct=setTimeout(()=>this.setState({ copied:false }),1500);
    this._toast('SVG copied to clipboard', `${d.W} \u00d7 ${d.H} px`);
  };
  _toast(title,sub){ clearTimeout(this._tt); this.setState({ toast:{ title, sub, id:Date.now() } }); this._tt=setTimeout(()=>this.setState({toast:null}),3200); }
  dismissToast=()=>{ clearTimeout(this._tt); this.setState({toast:null}); }
  downloadPng = () => {
    const p=this.getParams(), d=this.aspectDims(p);
    const svg=this.buildSVG(d.W,d.H,p);
    const img=new Image();
    img.onload=()=>{
      const sc=2, c=document.createElement('canvas');
      c.width=d.W*sc; c.height=d.H*sc;
      const ctx=c.getContext('2d');
      if(p.ground&&p.ground!=='transparent'){ ctx.fillStyle=p.ground; ctx.fillRect(0,0,c.width,c.height); }
      ctx.drawImage(img,0,0,c.width,c.height);
      c.toBlob(b=>{ const url=URL.createObjectURL(b), a=document.createElement('a'); a.href=url; a.download='kleeq-'+this.state.motif+'.png'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); },'image/png');
      this._logExport(p);
    };
    img.src='data:image/svg+xml,'+encodeURIComponent(svg);
  };
  downloadSvg = () => {
    const p=this.getParams(), d=this.aspectDims(p);
    const svg=this.buildSVG(d.W,d.H,p,false,true);
    const blob=new Blob([svg],{type:'image/svg+xml'}), url=URL.createObjectURL(blob), a=document.createElement('a');
    a.href=url; a.download='kleeq-'+this.state.motif+'.svg'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    this._logExport(p); this._toast('Downloaded '+a.download, `${d.W} \u00d7 ${d.H} px \u00b7 ${(svg.length/1024).toFixed(0)} KB`);
  };
  _lum(hex){ const h=hex.replace('#',''); const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16); return 0.2126*r+0.7152*g+0.0722*b; }
  isToneLayerable(m){ return this.isField(m) && !this.isLaser(m) && !['warp','warpflow','warpfocal','ribbons','archweave','isocity','isogrid','isowire','isoink','burst','nova','comettrail','shower','skulls','skullnet','wavegrad'].includes(m); }
  downloadLayers = () => {
    const p=this.getParams(), d=this.aspectDims(p), W=d.W, H=d.H;
    if(!this.isToneLayerable(p.motif)){ this.downloadSvg(); return; }
    // full render, then strip outer svg + ground rect to get raw cell elements
    let inner=this.buildSVG(W,H,p).replace(/^[\s\S]*?<svg[^>]*>/,'').replace(/<\/svg>\s*$/,'');
    inner=inner.replace(/^<rect width="[^"]*" height="[^"]*" fill="[^"]*"\/>/,'');
    const els=inner.match(/<(?:path|circle|rect|polygon)\b[^>]*\/>/g)||[];
    const buckets={};
    for(const el of els){ const m=el.match(/fill="([^"]+)"/); if(!m) continue; const c=m[1].toLowerCase(); if(c==='none') continue;
      // strip fill + any stroke so each layer is one clean color
      const clean=el.replace(/\s*fill="[^"]*"/,'').replace(/\s*stroke="[^"]*"/,'').replace(/\s*stroke-width="[^"]*"/,'').replace(/\s*stroke-linejoin="[^"]*"/,'');
      (buckets[c]=buckets[c]||[]).push(clean); }
    const tones=Object.keys(buckets).sort((a,b)=>this._lum(a)-this._lum(b)); // darkest first
    const sep=['#e6194b','#3cb44b','#4363d8','#f58231','#911eb4','#008080','#808000','#000000'];
    const mm=(W*0.254).toFixed(1), mmh=(H*0.254).toFixed(1);
    let layers='';
    tones.forEach((c,i)=>{ const col=sep[i%sep.length], n=i+1, last=i===tones.length-1;
      const label=`Tone ${n} of ${tones.length}${last?' — lightest (leave blank / bare material)':' — engrave order '+n}`;
      layers+=`<g inkscape:groupmode="layer" inkscape:label="${label}" data-tone="${n}" fill="${col}">`+buckets[c].join('')+`</g>`; });
    const legend=`<!-- Kleeq engrave layers. Tones sorted dark→light; darkest = deepest/slowest engrave. Each tone is a separate color layer for per-layer power/speed in XCS. Lightest tone left as its own layer — usually leave OFF to keep bare material. Sized ${mm}×${mmh} mm (17×11 in at export scale). -->`;
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" viewBox="0 0 ${W} ${H}" width="${mm}mm" height="${mmh}mm">${legend}${layers}</svg>`;
    const blob=new Blob([svg],{type:'image/svg+xml'}), url=URL.createObjectURL(blob), a=document.createElement('a');
    a.href=url; a.download='kleeq-'+this.state.motif+'-engrave-layers.svg'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  _num(v,min,max,fb){ v=+v; return Number.isFinite(v)?Math.max(min,Math.min(max,v)):fb; }
  onScale=e=>this.set('scale',this._num(e.target.value,24,180,this.state.scale));
  onGap=e=>this.set('gap',this._num(e.target.value,0,200,this.state.gap));
  onStroke=e=>this.set('stroke',this._num(e.target.value,1,16,this.state.stroke));
  onRotation=e=>this.set('rotation',this._num(e.target.value,-90,90,this.state.rotation));
  onTopoSoften=e=>this.set('topoSoften',this._num(e.target.value,0,100,this.state.topoSoften||0));
  rot0=()=>this.set('rotation',0);
  rot45=()=>this.set('rotation',45);
  rotN45=()=>this.set('rotation',-45);
  onJitter=e=>this.set('jitter',this._num(e.target.value,0,100,this.state.jitter));
  onSeed=e=>this.set('seed',Math.max(1,Math.floor(+e.target.value||1)));
  onInkInput=e=>this.set('ink',e.target.value);
  onGroundInput=e=>this.set('ground',e.target.value);
  onAccentInput=e=>this.set('accent',e.target.value);
  onAccentStyle=e=>this.set('accentStyle',e.target.value);
  onAspect=e=>this.set('aspect',e.target.value);
  onCanvasW=e=>this.set('canvasW',Math.max(0.1,parseFloat(e.target.value)||0.1));
  onCanvasH=e=>this.set('canvasH',Math.max(0.1,parseFloat(e.target.value)||0.1));
  onCanvasUnit=e=>this.set('canvasUnit',e.target.value);
  onGradient=e=>this.set('gradient',e.target.value);
  setFill=()=>this.set('style','fill');
  setOutline=()=>this.set('style','outline');
  accentEnable=()=>this.set('accentOn',true);
  accentDisable=()=>this.set('accentOn',false);
  shuffle=()=>this.set('seed',Math.floor(Math.random()*99999)+1);
  _sel(id){ this._selC=this._selC||{}; return this._selC[id]||(this._selC[id]=()=>{ if(this.state.batchOn){ const b=(this.state.batchSel||[]).slice(); const i=b.indexOf(id); if(i<0)b.push(id); else b.splice(i,1); this._motifKey=null; this.setState({batchSel:b}); return; } if(this.state.cmpOn && id!==this.state.motif){ this.set('cmpMotif',id); return; } this.set('motif',id); }); }
  _hiddenLoad(){ try{ return JSON.parse(localStorage.getItem('kleeq-hidden-motifs')||'[]'); }catch(e){ return []; } }
  _hiddenSave(list){ try{ localStorage.setItem('kleeq-hidden-motifs',JSON.stringify(list)); }catch(e){} }
  _pinLoad(){ try{ return JSON.parse(localStorage.getItem('kleeq-pins')||'[]'); }catch(e){ return []; } }
  _pin(id){ this._pinC=this._pinC||{}; return this._pinC[id]||(this._pinC[id]=(e)=>{ if(e&&e.stopPropagation) e.stopPropagation(); const p=this._pinLoad(); const i=p.indexOf(id); if(i<0)p.push(id); else p.splice(i,1); try{ localStorage.setItem('kleeq-pins',JSON.stringify(p)); }catch(e2){} this._motifKey=null; this.forceUpdate(); }); }
  _prLoad(){ try{ return JSON.parse(localStorage.getItem('kleeq-presets')||'{}'); }catch(e){ return {}; } }
  savePreset=()=>{ this._openSheet({ title:'Save preset', label:'Preset name', value:'', cta:'Save', placeholder:'e.g. Laser bed · bold', onOk:(name)=>this._savePresetNamed(name.trim()) }); };
  _savePresetNamed=(name)=>{ if(!name) return; const o=this._prLoad(); o[name]=this.getParams(); try{ localStorage.setItem('kleeq-presets',JSON.stringify(o)); }catch(e){} this.setState({presetSel:name}); }
  onPresetSel=e=>{ const name=e.target.value; if(!name){ this.setState({presetSel:''}); return; } const o=this._prLoad(); if(o[name]) this.setState({presetSel:name,...o[name]}); }
  delPreset=()=>{ const o=this._prLoad(); delete o[this.state.presetSel]; try{ localStorage.setItem('kleeq-presets',JSON.stringify(o)); }catch(e){} this.setState({presetSel:''}); }
  _exLoad(){ try{ return JSON.parse(localStorage.getItem('kleeq-exports')||'[]'); }catch(e){ return []; } }
  _logExport(p){ try{ const l=this._exLoad(); l.unshift({ts:Date.now(),p}); localStorage.setItem('kleeq-exports',JSON.stringify(l.slice(0,30))); }catch(e){} }
  toggleHist=()=>this.set('histOn',!this.state.histOn);
  clearHist=()=>{ try{ localStorage.setItem('kleeq-exports','[]'); }catch(e){} this.forceUpdate(); }
  toggleWall=()=>this.set('wallOn',!this.state.wallOn);
  wmEnable=()=>this.set('watermark',true);
  setTmSeam=()=>this.set('tileMode','seamless');
  setTmSingle=()=>this.set('tileMode','single');
  wmDisable=()=>this.set('watermark',false);
  toggleBatch=()=>{ this._motifKey=null; this.setState({batchOn:!this.state.batchOn,batchSel:[]}); }
  batchExport=async()=>{ const p=this.getParams(); for(const id of (this.state.batchSel||[])){ const pp={...p,motif:id}; const d=this.aspectDims(pp); const svg=this.buildSVG(d.W,d.H,pp,false,true); const blob=new Blob([svg],{type:'image/svg+xml'}), url=URL.createObjectURL(blob), a=document.createElement('a'); a.href=url; a.download='kleeq-'+id+'.svg'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); this._logExport(pp); await new Promise(r=>setTimeout(r,400)); } }
  _wallEl(src){ return React.createElement('div',{style:{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(180deg,#404046 0%,#2e2e33 64%,#212124 64%,#28282c 100%)'}},React.createElement('img',{src,alt:'wall mockup',style:{width:'70%',boxShadow:'0 34px 70px rgba(0,0,0,.6)',border:'1px solid rgba(0,0,0,.45)',display:'block'}})); }
  _exRows(defs){ return this._exLoad().map(e=>({ label:((defs.find(d=>d[0]===e.p.motif)||[])[1]||e.p.motif), when:new Date(e.ts).toLocaleString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}), apply:()=>this.setState({histOn:false,...e.p}) })); }
  _mv(){ try { return localStorage.getItem('kleeq-motif-view')||'2'; } catch(e){ return '2'; } }
  _setMv(v){ this._mvC=this._mvC||{}; return this._mvC[v]||(this._mvC[v]=()=>{ try{ localStorage.setItem('kleeq-motif-view',v); }catch(e){} this._motifKey=null; this.forceUpdate(); }); }
  _rm(id){ this._rmC=this._rmC||{}; return this._rmC[id]||(this._rmC[id]=(e)=>{ if(e&&e.stopPropagation) e.stopPropagation(); const h=this._hiddenLoad(); if(!h.includes(id)) h.push(id); this._hiddenSave(h); this._motifKey=null; this.forceUpdate(); }); }
  _namesLoad(){ try{ return JSON.parse(localStorage.getItem('kleeq-motif-names')||'{}'); }catch(e){ return {}; } }
  _namesSave(o){ try{ localStorage.setItem('kleeq-motif-names',JSON.stringify(o)); }catch(e){} }
  _ren(id,cur){ this._renC=this._renC||{}; const k=id+'|'+cur; return this._renC[k]||(this._renC[k]=(e)=>{ if(e&&e.stopPropagation) e.stopPropagation(); this._openSheet({ title:'Rename pattern', label:'Name', value:cur, cta:'Rename', onOk:(nn)=>{ const o=this._namesLoad(); const t=nn.trim(); if(t&&t!==cur) o[id]=t; else if(!t) delete o[id]; this._namesSave(o); this._motifKey=null; this.forceUpdate(); } }); }); }
  _openSheet(cfg){ this.setState({ sheet:{ ...cfg, value:cfg.value||'' } }); }
  closeSheet=()=>this.setState({sheet:null});
  onSheetInput=e=>this.setState({ sheet:{ ...this.state.sheet, value:e.target.value } });
  sheetOk=()=>{ const sh=this.state.sheet; if(!sh) return; this.setState({sheet:null}); if(sh.onOk) sh.onOk(sh.value||''); };
  onSheetKey=e=>{ if(e.key==='Enter'){ e.preventDefault(); this.sheetOk(); } else if(e.key==='Escape'){ this.closeSheet(); } };
  toggleHidden=()=>{ this.setState({ showHidden:!this.state.showHidden }); }
  _restoreOne(id){ this._roC=this._roC||{}; return this._roC[id]||(this._roC[id]=()=>{ const h=this._hiddenLoad().filter(x=>x!==id); this._hiddenSave(h); this._motifKey=null; this.forceUpdate(); }); }
  undoRemove=()=>{ const h=this._hiddenLoad(); if(h.length){ h.pop(); this._hiddenSave(h); this._motifKey=null; this.forceUpdate(); } }
  restoreHidden=()=>{ this._hiddenSave([]); this._motifKey=null; this.forceUpdate(); }
  componentDidMount(){ this._keyH=(e)=>{
    if((e.metaKey||e.ctrlKey)&&(e.key==='z'||e.key==='Z')){ e.preventDefault(); if(e.shiftKey) this.redoParam(); else if(!this.undoParam()) this.undoRemove(); return; }
    if((e.metaKey||e.ctrlKey)&&(e.key==='s'||e.key==='S')){ e.preventDefault(); if(e.shiftKey) this.downloadPng(); else this.downloadSvg(); return; }
    if(e.key==='Escape'){ if(this.state.sheet) { this.setState({sheet:null}); return; } if(this.state.licenseOn){ this.setState({licenseOn:false}); return; } }
    const t=e.target&&e.target.tagName; if(t==='INPUT'||t==='SELECT'||t==='TEXTAREA') return;
    if(e.key==='\\'){ e.preventDefault(); this.toggleBA(); return; }
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){ e.preventDefault(); const list=(this._motifs||[]).map(x=>x.id); if(!list.length) return; let i=list.indexOf(this.state.motif); i=(i+(e.key==='ArrowDown'?1:-1)+list.length)%list.length; this.set('motif',list[i]); return; }
    const k=e.key.toLowerCase();
    if(k==='s') this.shuffle();
    else if(k==='e') this.downloadSvg();
    else if(k==='c') this.toggleCmp();
    else if(k==='f'||k==='1') this.set('zoom','fit');
    else if(k==='2') this.set('zoom','0.25');
    else if(k==='3') this.set('zoom','0.5');
    else if(k==='4') this.set('zoom','1');
    else if(k==='5') this.set('zoom','2');
    else if(k==='r') this.toggleRuler();
    else if(k==='w') this.toggleWall();
  }; window.addEventListener('keydown',this._keyH); }
  componentWillUnmount(){ window.removeEventListener('keydown',this._keyH); }
  _swSel(key,c){ this._swC=this._swC||{}; const kk=key+'|'+c; return this._swC[kk]||(this._swC[kk]=()=>this.set(key,c)); }

  // creation date per motif — by build session; new motifs default to their ship date
  _createdOf(id){
    const c=this._customLoad().find(x=>x.id===id); if(c&&c.created) return c.created;
    const d3=(this._createdMap||(this._createdMap={
      triclusters:'2026-10-22', hexdash:'2026-10-21', techframe:'2026-10-21', trispeed:'2026-10-21', trisolid:'2026-10-21',
      stepbars:'2026-08-21', slabdiag:'2026-08-21', hatchcamo:'2026-08-21', hatchdig:'2026-08-21', hatchshift:'2026-08-21', dotsqcamo:'2026-08-21', topocont:'2026-08-21', topodisc:'2026-09-14', digblotch:'2026-09-15', flowdash:'2026-08-17', raindash:'2026-08-17', sqmerge:'2026-08-17',
      crossdig:'2026-08-16', tricamo:'2026-08-15', trimosaic:'2026-08-15',
      chevmix:'2026-08-15', chevud:'2026-08-15', chevherr:'2026-08-15', chevgrad:'2026-08-15', chevfield:'2026-08-15', chevkey:'2026-08-15', chevacc:'2026-08-15', chevanchor:'2026-08-15', chevkleeq:'2026-08-15',
      quadtree:'2026-08-14', pluswcamo:'2026-08-14',
      qquilt:'2026-08-13', conoff:'2026-08-13', cbite:'2026-08-13', halfdrift:'2026-08-13', rotfield:'2026-08-13', sqspiral:'2026-08-13', splitsq:'2026-08-13', circheck:'2026-08-13'
    }))[id];
    return d3||'2026-08-12';
  }
  _fmtDate(iso){ const [y,m,dd]=iso.split('-').map(Number); return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m-1]+' '+dd+', '+y; }
  renderVals(){
    const s=this.state, p=this.getParams();
    const KPS=l=>String(l).replace(/ KPS$/,'');
    const defs=this._customLoad().map(c=>[c.id,c.label]).concat(window.KLEEQ_MOTIFS).map(d0=>[d0[0],KPS(d0[1])]);
    if(!this._thumbs) this._thumbs={};
    const thumbOf=(id)=>{
      if(this._lazyThumbs && this._thumbs[id]==null){ this._queueThumb(id); return ''; }
      if(!this._thumbs[id]){
        // try several scales; some motifs need a larger cell to draw anything
        const base={ motif:id, scale:80, gap:20, stroke:3, rotation:0, jitter:0, seed:7, style:'fill', ink:'#201e1d', ground:'#f3f2f2', accent:'#ec3013', accentOn:true, accentStyle:'ticks', aspect:'square', gradient:'none' };
        for(const sc of [80,130,200]){
          try{
            const svg=this.buildSVG(640,640,{...p,...base,scale:sc},true);
            if(svg && svg.length>140){ this._thumbs[id]=this.dataUri(svg); break; }
          }catch(e){}
        }
        if(!this._thumbs[id]) this._thumbs[id]='';
      }
      return this._thumbs[id];
    };
    if(this._motifKey!==(s.motif+'|'+(this._mv?this._mv():'')+'|'+(s.q||'')+'|'+(s.sortBy||'')) || this._namesKey!==JSON.stringify(this._namesLoad())){
      const recent=['jacks','ecg','helix','cells','molecule','medcross','pulse','gears','circuit','blueprint','bolts','truss','isobolt','stepbars','slabdiag','hatchcamo','hatchdig','hatchshift','dotsqcamo','topocont','topodisc','flowdash','raindash','sqmerge','crossdig','trimosaiccamo','trimosaic','chevmix','chevud','chevherr','chevgrad','chevfield','chevkey','chevacc','chevanchor','chevkleeq','quadtree','qquilt','conoff','cbite','halfdrift','rotfield','sqspiral','splitsq','circheck','gradbase2','gradbase','dotdiscamo','dotnetcamo','geocamo','blobwtri','blobwhex','blobwcamo','pluswcamo','triwcamo','pentwcamo','hexwcamo','dotcamo6','dotcamo','tridis','tricamo4','tricamo3','tricamo2','tricamo','geowave','geoflow','geoblocks','defcamo2','defcamo','deffrag','vibwake','viblines','kleeq6','skullnet','skullcamo','skullhexflat','kleeqduoflat','kleeqhex'];
      const mvv = this._mv?this._mv():'2';
      const mvSmall = (mvv==='3');
      const mvList = (mvv==='1');
      const thumbPx = 56;
      const pins=this._pinLoad(); const bsel=this.state.batchSel||[];
      const rk=id=>{ const i=recent.indexOf(id); return i<0?999:i; };
      const famMap={}; window.KLEEQ_MOTIFS.forEach(d3=>{ famMap[d3[0]]=d3[2]; });
      const fam=(id,label)=>{ if(id.indexOf('custom-')===0) return 'Custom'; return famMap[id]||'Geometric'; };
      const famOrder=['Custom','Triangle','Hex','Chevron','Camo','Digital camo','Geometric','Topo','Flow','Medical','Mechanical','Kleeq mark'];
      const famTint={ Custom:'#2d1f2d', Triangle:'#20251f', Hex:'#252030', Chevron:'#2a211e', Camo:'#26231d', 'Digital camo':'#242322', Geometric:'#20222a', Topo:'#28261c', Flow:'#1e262b', Medical:'#1e2a28', Mechanical:'#2a2620', 'Kleeq mark':'#2e211d' };
      const fk=(id,label)=>{ const g=fam(id,label); const i=famOrder.indexOf(g); return i<0?99:i; };
      const hidden=this._hiddenLoad();
      const names=this._namesLoad();
      const qq=(s.q||'').trim().toLowerCase();
      this._motifs=defs.filter(d2=>!hidden.includes(d2[0])).map(d2=>[d2[0],KPS(names[d2[0]]||d2[1])]).filter(d2=>!qq||d2[1].toLowerCase().includes(qq)||d2[0].includes(qq)).sort((a,b)=>{ const pA=pins.includes(a[0])?0:1, pB=pins.includes(b[0])?0:1; if(pA!==pB) return pA-pB;
        if(s.sortBy==='name') return a[1].localeCompare(b[1]);
        if(s.sortBy==='date'){ const c=this._createdOf(b[0]).localeCompare(this._createdOf(a[0])); if(c!==0) return c; return a[1].localeCompare(b[1]); }
        if(s.sortBy==='recent'){ const d2=rk(a[0])-rk(b[0]); if(d2!==0) return d2; }
        const f2=fk(a[0],a[1])-fk(b[0],b[1]); if(f2!==0) return f2; const d2=rk(a[0])-rk(b[0]); return d2!==0?d2:a[1].localeCompare(b[1]); }).map(([id,label],idx)=>{ const active=s.motif===id;
        const famName=fam(id,label), byFam=(s.sortBy||'family')==='family', num=String(idx+1).padStart(2,'0');
        const shortLabel=(byFam&&label.indexOf(famName+' \u2014 ')===0)?label.slice(famName.length+3):label;
        const style=`min-width:0;overflow:hidden;position:relative;display:flex;${mvList?'align-items:center;gap:10px;':'flex-direction:column;align-items:stretch;gap:6px;'}padding:6px;cursor:pointer;text-align:left;border-radius:9px;background:${active?'color-mix(in oklab, var(--color-accent) 24%, transparent)':'transparent'};box-shadow:${bsel.includes(id)?'inset 0 0 0 1.5px var(--color-accent)':'none'};color:var(--color-text);font-size:13px;line-height:1.3;font-weight:${active?'600':'450'};letter-spacing:-.005em;transition:background .12s ease`;
        const th=thumbOf(id);
        const iconStyle='flex:none;width:'+(mvList?22:18)+'px;height:'+(mvList?22:18)+'px;display:flex;align-items:center;justify-content:center;line-height:1;border-radius:5px;cursor:pointer;color:var(--color-text);opacity:.8;';
        const dotStyle='flex:none;width:7px;height:7px;border-radius:50%;background:'+(famTint[fam(id,label)]||'#555')+';filter:saturate(2.4) brightness(1.9)';
        const actionsStyle = 'position:absolute;right:10px;top:10px;display:flex;gap:3px;align-items:center;background:var(--color-surface-2);border-radius:8px;padding:3px;box-shadow:var(--shadow-md),0 0 0 .5px rgba(255,255,255,.08)';
        const pinned=pins.includes(id);
        const pinStyle=iconStyle+(pinned?'color:var(--color-accent);opacity:1;':'');
        return { id, label:shortLabel, fullLabel:label, num, famName, pinned, labelStyle:(mvList?'min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap':'min-width:0;font-size:12px;line-height:1.3;padding:0 2px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden'), created:'Added '+this._fmtDate(this._createdOf(id)), iconStyle, dotStyle, actionsStyle, pin:this._pin(id), pinStyle, starFill:(pinned?'currentColor':'none'), remove:this._rm(id), rename:this._ren(id,names[id]||(defs.find(d3=>d3[0]===id)||[])[1]||''), thumbStyle:`${mvList?`width:${thumbPx}px;height:${thumbPx}px;`:'width:100%;aspect-ratio:1;'}flex:none;border-radius:8px;border:1px solid rgba(255,255,255,.08);background:#f3f2f2 ${th?`url("${th}") center/cover no-repeat`:''}`, style, active, select:this._sel(id) }; });
      { const byFam=(s.sortBy||'family')==='family'; let prev=null; this._motifs.forEach(x=>{ const g=x.pinned?'Pinned':(byFam?x.famName:null); x.showGroup=!!g&&g!==prev; x.groupLabel=g||''; if(g) prev=g; }); }
      this._motifKey=s.motif+'|'+(this._mv?this._mv():'')+'|'+(s.q||'')+'|'+(s.sortBy||'');
      this._namesKey=JSON.stringify(names);
      this._hiddenList=hidden.map(id=>{ const d3=defs.find(d4=>d4[0]===id); if(!d3) return null;
        const th=thumbOf(id);
        return { id, label:(names[id]||d3[1]),
          thumbStyle:'width:40px;height:40px;flex:none;border:1px solid var(--color-divider);background:#f3f2f2 '+(th?'url("'+th+'") center/cover no-repeat':''),
          restore:this._restoreOne(id) }; }).filter(Boolean);
    }
    const swatch=(list,key)=>list.map(c=>{ const on=s[key].toLowerCase()===c.toLowerCase();
      return { color:c, select:this._swSel(key,c),
        style:`width:22px;height:22px;flex:none;cursor:pointer;border-radius:50%;background:${c};border:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.12);outline:${on?'2px solid var(--color-accent)':'none'};outline-offset:2px` }; });
    if(this._inkKey!==s.ink){ this._inkSw=swatch(['#201e1d','#ec3013','#7d7979','#f3f2f2'],'ink'); this._inkKey=s.ink; }
    if(this._grKey!==s.ground){ this._grSw=swatch(['#f3f2f2','#eae9e9','#201e1d','#ec3013'],'ground'); this._grKey=s.ground; }
    if(this._acKey!==s.accent){ this._acSw=swatch(['#201e1d','#ec3013','#7d7979','#ffffff'],'accent'); this._acKey=s.accent; }
    const pkey=JSON.stringify(p);
    if(this._pkey!==pkey){
      const d=this.aspectDims(p);
      const rawSvg=this.buildSVG(d.W,d.H,p,true);
      this._preview=this.dataUri(rawSvg); this._dims=d;
      this._scheduleStats(rawSvg,d);
      this._repeat = this.isField(p.motif) ? Math.round(Math.max(12,p.scale*0.55)) : (()=>{ const r=this.buildTile(p); return Math.round(r.Tw||r.T); })();
      const aspName={ '32x22':'32 × 22 in','24x12':'24 × 12 in','17x11':'17 × 11 in','11x17':'11 × 17 in','24x11':'24 × 11 in','32x11':'32 × 11 in','2x1':'2:1','1x2':'1:2','square':'1:1', custom:`${p.canvasW} × ${p.canvasH} ${p.canvasUnit}` };
      this._exportLabel = `${d.W} \u00d7 ${d.H} px \u00b7 ${aspName[p.aspect]||p.aspect}`;
      this._pkey=pkey;
    }
    if(s.cmpOn && s.cmpMotif){
      const pb={...p,motif:s.cmpMotif}, bkey=JSON.stringify(pb);
      if(this._bkey!==bkey){ const db=this.aspectDims(pb); this._previewB=this.dataUri(this.buildSVG(db.W,db.H,pb,true)); this._bkey=bkey; }
    } else if(s.cmpOn){ this._previewB=null; this._bkey=null; }
    { const hid=this._hiddenLoad(); const ok=this._motifs?this._motifs.map(x=>x.id).join(','):''; if(this._coKey!==ok){ this._cmpOpts=(this._motifs||[]).map(x=>({id:x.id,label:x.label})); this._coKey=ok; } }
    if(s.wizOn){
      const optStyle=on=>`display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 6px;cursor:pointer;border:2px solid ${on?'var(--color-accent)':'var(--color-divider)'};background:${on?'color-mix(in oklab, var(--color-accent) 10%, var(--color-surface))':'var(--color-surface)'};font-size:12px;text-align:center`;
      const wkey=[s.wizGlyph,s.wizLayout,s.wizWeight].join('|');
      if(this._wgKey!==wkey){
        this._wizGlyphs=[['plus','Plus'],['circle','Circle'],['square','Square'],['diamond','Diamond'],['triangle','Triangle'],['star','Star'],['hex','Hexagon'],['chevron','Chevron'],['hash','Hashed lines']].map(([id,label])=>({ label, select:this._wizSet('wizGlyph',id), style:optStyle(s.wizGlyph===id), thumbStyle:'width:34px;height:34px;background:url("data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">'+this._glyph(id,24,24,17,'#201e1d')+'</svg>')+'") center/contain no-repeat' }));
        this._wizLayouts=[['grid','Straight grid'],['brick','Brick offset'],['hexoff','Hex offset']].map(([id,label])=>({ label, select:this._wizSet('wizLayout',id), style:optStyle(s.wizLayout===id) }));
        this._wizWeights=[['organic','Organic camo — warped blotches'],['digital','Digital camo — blocky weights'],['halftone','Halftone drift'],['rings','Topo contours'],['gradient','Gradient fade'],['uniform','Even field'],['random','Random scatter']].map(([id,label])=>({ label, select:this._wizSet('wizWeight',id), style:optStyle(s.wizWeight===id) }));
        this._wgKey=wkey;
      }
      const pkeyW=wkey+'|'+(s.wizSeed||7)+'|'+s.scale+'|'+s.gap+'|'+s.jitter;
      if(this._wpKey!==pkeyW){
        const spec={glyph:s.wizGlyph,layout:s.wizLayout,weight:s.wizWeight};
        const r=this.buildCustomTile({...this.getParams(),seed:s.wizSeed||7},spec);
        this._wizPrev=this.dataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r.Tw} ${r.Th}" width="560" height="560"><rect width="${r.Tw}" height="${r.Th}" fill="#f3f2f2"/>${r.inner}</svg>`);
        this._wpKey=pkeyW;
      }
    }
    return {
      ...s,
      wizOn:!!s.wizOn, wizStep:s.wizStep||1,
      wizStep1:(s.wizStep||1)===1, wizStep2:s.wizStep===2, wizStep3:s.wizStep===3,
      wizNotFirst:(s.wizStep||1)>1, wizNotLast:(s.wizStep||1)<3,
      wizTitle:(s.wizStep||1)===1?'Shape':(s.wizStep===2?'Pattern style':'Name & create'),
      wizSummary:'Shape: '+(s.wizGlyph||'')+' · Arrangement: '+(s.wizLayout||'')+' · Weights: '+(s.wizWeight||''),
      wizGlyphs:this._wizGlyphs||[], wizLayouts:this._wizLayouts||[], wizWeights:this._wizWeights||[],
      wizPreviewImg:(s.wizOn&&this._wizPrev)?React.createElement('img',{src:this._wizPrev,alt:'pattern preview',style:{width:'100%',height:'100%',objectFit:'cover',display:'block'}}):null, wizName:s.wizName||'',
      openWiz:this.openWiz, closeWiz:this.closeWiz, wizNext:this.wizNext, wizBack:this.wizBack,
      wizCreate:this.wizCreate, wizShuffle:this.wizShuffle, onWizName:this.onWizName, stopProp:this.stopProp,
      toggleMirX:this.toggleMirX, toggleMirY:this.toggleMirY,
      ...(()=>{ const pill=on=>`flex:1;padding:5px 0;font-size:12px;font-weight:500;cursor:pointer;border:none;border-radius:6px;font-family:inherit;transition:background .15s ease,color .15s ease;background:${on?'var(--color-neutral-300)':'transparent'};color:${on?'var(--color-text)':'var(--color-text-muted)'};box-shadow:${on?'0 1px 2px rgba(0,0,0,.4)':'none'}`; const r=s.rotation||0; return { rotN45Style:pill(r===-45), rot0Style:pill(r===0), rot45Style:pill(r===45), mirXStyle:pill(!!s.mirrorX), mirYStyle:pill(!!s.mirrorY) }; })(),
      motifs:this._motifs, previewSrc:this._preview, repeat:this._repeat,
      hiddenCount:this._hiddenLoad().length, hasHidden:this._hiddenLoad().length>0, restoreHidden:this.restoreHidden, undoRemove:this.undoRemove,
      mv1:(this._mv()==='1'), mv2:(this._mv()==='2'), mv3:(this._mv()==='3'),
      setMv1:this._setMv('1'), setMv2:this._setMv('2'), setMv3:this._setMv('3'),
      motifCols:(this._mv()==='1'?'1fr':'repeat(auto-fill,minmax(120px,1fr))'),
      asideW:(this._mv()==='1'?'min(360px,32vw)':'min(420px,36vw)'),
      showHidden:!!s.showHidden, toggleHidden:this.toggleHidden, hiddenList:this._hiddenList||[],
      hiddenToggleLabel:(s.showHidden?'Hide':'Show')+' '+this._hiddenLoad().length+' hidden',
      previewImg:this._preview?(s.wallOn?this._wallEl(this._preview):this._imgEl(this._ba?this._baSrc():this._preview)):null,
      motifLabel:(defs.find(d=>d[0]===s.motif)||[])[1]||'',
      inkSwatches:this._inkSw, groundSwatches:this._grSw, accentSwatches:this._acSw,
      accentIsK:s.motif==='kleeqK', accentOff:!s.accentOn,
      isField:this.isField(s.motif), isWaveGrad:s.motif==='wavegrad',
      topoCtl:(!!s.topoOn||s.motif==='topocont'||s.motif==='topodisc'), exportLabel:this._exportLabel,
      onAspect:this.onAspect, onGradient:this.onGradient,
      sheet:s.sheet||null, sheetOn:!!s.sheet, sheetTitle:s.sheet?s.sheet.title:'', sheetLabel:s.sheet?s.sheet.label:'', sheetValue:s.sheet?(s.sheet.value||''):'', sheetCta:s.sheet?s.sheet.cta:'OK', sheetPlaceholder:s.sheet?(s.sheet.placeholder||''):'', closeSheet:this.closeSheet, onSheetInput:this.onSheetInput, sheetOk:this.sheetOk, onSheetKey:this.onSheetKey,
      toastOn:!!s.toast, toastTitle:s.toast?s.toast.title:'', toastSub:s.toast?s.toast.sub:'', dismissToast:this.dismissToast,
      onPreviewWheel:this.onPreviewWheel, onPreviewDbl:this.onPreviewDbl,
      noResults:!!(s.q&&(this._motifs||[]).length===0), hasPresets:Object.keys(this._prLoad()).length>0,
      recipe:`Scale ${s.scale} \u00b7 Spacing ${s.gap} \u00b7 Rotation ${s.rotation}\u00b0 \u00b7 Seed ${s.seed}`+(s.jitter?` \u00b7 Jitter ${s.jitter}%`:'')+(s.style==='outline'?` \u00b7 Outline ${s.stroke}px`:'')+((s.blotchQty!=null&&s.blotchQty!==100)?` \u00b7 Blotch ${s.blotchQty}%`:'')+(s.topoOn?` \u00b7 Topo ${s.topoMix||0}%`:''), isCustomSize:s.aspect==='custom', canvasW:s.canvasW||24, canvasH:s.canvasH||12, canvasUnit:s.canvasUnit||'in', onCanvasW:this.onCanvasW, onCanvasH:this.onCanvasH, onCanvasUnit:this.onCanvasUnit,
      isFill:s.style==='fill', isOutline:s.style==='outline',
      onScale:this.onScale, onGap:this.onGap, onStroke:this.onStroke, onRotation:this.onRotation,
      rot0:this.rot0, rot45:this.rot45, rotN45:this.rotN45,
      onJitter:this.onJitter, onSeed:this.onSeed, onInkInput:this.onInkInput, onGroundInput:this.onGroundInput,
      onAccentInput:this.onAccentInput, onAccentStyle:this.onAccentStyle,
      setFill:this.setFill, setOutline:this.setOutline, accentEnable:this.accentEnable, accentDisable:this.accentDisable,
      cmpOn:s.cmpOn, toggleCmp:this.toggleCmp, cmpMotif:s.cmpMotif, onCmpChange:this.onCmpChange,
      cmpLabel:'Compare', cmpStyle:`padding:5px 10px;font-size:12px;font-weight:500;border:none;border-radius:6px;cursor:pointer;font-family:inherit;background:${s.cmpOn?'var(--color-neutral-300)':'transparent'};color:${s.cmpOn?'var(--color-text)':'var(--color-text-muted)'}`, rulerStyle:`padding:5px 10px;font-size:12px;font-weight:500;border:none;border-radius:6px;cursor:pointer;font-family:inherit;background:${s.rulerOn?'var(--color-neutral-300)':'transparent'};color:${s.rulerOn?'var(--color-text)':'var(--color-text-muted)'}`, wallStyle:`padding:5px 10px;font-size:12px;font-weight:500;border:none;border-radius:6px;cursor:pointer;font-family:inherit;background:${s.wallOn?'var(--color-neutral-300)':'transparent'};color:${s.wallOn?'var(--color-text)':'var(--color-text-muted)'}`, baStyle:`padding:5px 10px;font-size:12px;font-weight:500;border:none;border-radius:6px;cursor:pointer;font-family:inherit;background:${this._ba?'var(--color-neutral-300)':'transparent'};color:${this._ba?'var(--color-text)':'var(--color-text-muted)'}`,
      cmpOptions:this._cmpOpts||[],
      previewImgB:this._previewB?this._imgEl(this._previewB):null,
      cmpEmpty:s.cmpOn&&!s.cmpMotif,
      cutStats:s.cutStats,
      createdLabel:'Added '+this._fmtDate(this._createdOf(s.motif)),
      q:s.q||'', onQ:this.onQ, sortBy:s.sortBy||'family', onSortBy:this.onSortBy,
      resetPattern:this.resetPattern, resetVariation:this.resetVariation, resetInk:this.resetInk, resetMarks:this.resetMarks, resetOutput:this.resetOutput, resetAll:this.resetAll,
      baLabel:(this._ba?'Showing defaults':'Before'), toggleBA:this.toggleBA, baOn:!!this._ba,
      rulerLabel:'Ruler', toggleRuler:this.toggleRuler, resetView:this.resetView,
      zT:s.zoom==='true', setZoomTrue:this.setZoomTrue,
      blotchQty:(s.blotchQty==null?100:s.blotchQty), onBlotchQty:this.onBlotchQty,
      topoMix:s.topoMix||0, onTopoMix:this.onTopoMix,
      topoOn:!!s.topoOn, topoOff:!s.topoOn, toggleTopo:this.toggleTopo,
      topoLabel:(s.topoOn?'On':'Off'),
      topoBands:s.topoBands||10, onTopoBands:this.onTopoBands,
      topoSmooth:(s.topoSmooth==null?70:s.topoSmooth), onTopoSmooth:this.onTopoSmooth,
      topoSoften:(s.topoSoften==null?0:s.topoSoften), onTopoSoften:this.onTopoSoften,
      topoWeights:s.topoWeights||3, onTopoWeights:this.onTopoWeights,
      hatchGround:(s.hatchGround==null?105:s.hatchGround), onHatchGround:this.onHatchGround,
      isHatchCamo:(s.motif==='hatchcamo'||s.motif==='hatchdig'),
      cutWarn:(()=>{ const m2=(p.aspect||'').match(/^(\d+)x(\d+)$/); if(!m2) return false; const d2=this.aspectDims(p); const mm=((p.style==='outline'?Math.max(1,p.stroke||3):(p.scale||80)*0.2)/(d2.W/+m2[1]))*25.4; this._cutMm=mm; return mm<5; })(),
      cutWarnLabel:'Min feature ≈ '+(this._cutMm?this._cutMm.toFixed(1):'?')+' mm at this output size',
      zFit:s.zoom==='fit', zQ:s.zoom==='0.25', zH:s.zoom==='0.5', z1:s.zoom==='1', z2:s.zoom==='2',
      setZoomFit:this.setZoomFit, setZoomQ:this.setZoomQ, setZoomH:this.setZoomH, setZoom1:this.setZoom1, setZoom2:this.setZoom2,
      histOn:!!s.histOn, toggleHist:this.toggleHist, exRows:(s.histOn?this._exRows(defs):[]), clearHist:this.clearHist, hasExports:this._exLoad().length>0, noExports:this._exLoad().length===0,
      presetSel:s.presetSel||'', presetOptions:Object.keys(this._prLoad()), onPresetSel:this.onPresetSel, savePreset:this.savePreset, delPreset:this.delPreset, hasPresetSel:!!s.presetSel,
      batchOn:!!s.batchOn, toggleBatch:this.toggleBatch, batchLabel:(s.batchOn?'Done':'Batch'), batchCount:(s.batchSel||[]).length, batchExport:this.batchExport,
      wallOn:!!s.wallOn, toggleWall:this.toggleWall, wallLabel:'Wall',
      wmOn:!!s.watermark, wmOff:!s.watermark, wmEnable:this.wmEnable, wmDisable:this.wmDisable,
      tmSeam:(s.tileMode||'seamless')==='seamless', tmSingle:s.tileMode==='single', setTmSeam:this.setTmSeam, setTmSingle:this.setTmSingle,
      downloadPng:this.downloadPng,
      shuffle:this.shuffle, copySvg:this.copySvg, downloadSvg:this.downloadSvg,
      downloadLayers:this.downloadLayers, showLayers:this.isToneLayerable(s.motif),
    };
  }
  };
  let KleeqPatternEngine = makeEngine(DCLogicStub);
  window.KleeqPatternEngine = KleeqPatternEngine;
  window.KleeqPatternEngineOn = makeEngine;
  /* every studio reads this: built-ins plus the patterns made in the Pattern Studio wizard */
  window.KLEEQ_ALL_MOTIFS = function(){ let c=[]; try{ c=JSON.parse(localStorage.getItem('kleeq-custom-motifs')||'[]'); }catch(err){} return c.map(x=>[x.id,x.label,'Custom']).concat(window.KLEEQ_MOTIFS||[]); };
  /* premium set shipped with the app: ids listed here lock in published mode on every visitor's machine */
  window.KLEEQ_PREMIUM = ["trimosaiccamo","trimosaic","tricamo4","tricamo3","tricamo2","tricamo","triclusters","trispeed","trisolid","hexcube","chevanchor","chevkleeq","hatchcamo","gradbase2","gradbase","dotdiscamo","dotnetcamo","blobwtri","blobwhex","blobwcamo","defcamo","defcamo2","deffrag","skullnet","skullcamo","skullhexflat","hatchdig","dotsqcamo","pluswcamo","triwcamo","pentwcamo","hexwcamo","dotcamo6","dotcamo","digblotch","hexcubemil","pixel","blobcamo","slabdiag","geocamo","geowave","geoflow","geoblocks","topocont","topodisc","isowire","warpflow","warp","stepbars","flowdash","vibwake","viblines","jacks"]; // baked 2026-10-22 from the studio flags
  window.KLEEQ_MOTIFS = [["triclusters","Triangle — clusters","Triangle"],["hexdash","Hex — arrows & speed lines","Hex"],["techframe","Mechanical — tech frames","Mechanical"],["trispeed","Triangle — drift","Triangle"],["trisolid","Triangle — tessellation","Triangle"],["jacks","Medical — molecule jacks","Medical"],["ecg","Medical — ECG trace","Medical"],["helix","Medical — DNA helix","Medical"],["cells","Medical — cell field","Medical"],["molecule","Medical — molecule lattice","Medical"],["medcross","Medical — cross grid","Medical"],["pulse","Medical — pulse rings","Medical"],["gears","Mechanical — gear train","Mechanical"],["circuit","Mechanical — circuit traces","Mechanical"],["blueprint","Mechanical — blueprint grid","Mechanical"],["bolts","Mechanical — hex bolt heads","Mechanical"],["truss","Mechanical — truss lattice","Mechanical"],["isobolt","Mechanical — isometric fasteners","Mechanical"],["stepbars","Flow — stepped bars","Flow"],["slabdiag","Geometric — diagonal slabs","Geometric"],["hatchcamo","Camo — hatch","Camo"],["hatchdig","Digital camo — hatch","Digital camo"],["hatchshift","Camo — hatch shift","Camo"],["dotsqcamo","Digital camo — dot squares","Digital camo"],["digblotch","Digital camo — blotch","Digital camo"],["topocont","Topo — contour field","Topo"],["topodisc","Topo — contour medallion","Topo"],["flowdash","Flow — dashes","Flow"],["raindash","Flow — rain dashes","Flow"],["sqmerge","Geometric — squircle merge","Geometric"],["crossdig","Digital camo — crosses","Digital camo"],["trimosaiccamo","Triangle — mosaic camo","Triangle"],["trimosaic","Triangle — mosaic","Triangle"],["chevmix","Chevron — mix","Chevron"],["chevud","Chevron — up/down","Chevron"],["chevherr","Chevron — herringbone","Chevron"],["chevgrad","Chevron — gradient","Chevron"],["chevfield","Chevron — camo field","Chevron"],["chevkey","Chevron — keyline mix","Chevron"],["chevacc","Chevron — red accent","Chevron"],["chevanchor","Chevron — anchors","Chevron"],["chevkleeq","Chevron — Kleeq mark","Chevron"],["quadtree","Geometric — quadtree halftone","Geometric"],["qquilt","Geometric — quarter-circle quilt","Geometric"],["conoff","Geometric — concentric offsets","Geometric"],["cbite","Geometric — circle bite","Geometric"],["halfdrift","Geometric — halftone drift","Geometric"],["rotfield","Geometric — rotated squares","Geometric"],["sqspiral","Geometric — square spiral","Geometric"],["splitsq","Geometric — split squares","Geometric"],["circheck","Geometric — circle checker","Geometric"],["skullhexflat","Camo — hex skull flat","Camo"],["kleeqduoflat","Kleeq mark — hex duo flat","Kleeq mark"],["kleeqhex","Kleeq mark — hex camo","Kleeq mark"],["skullcamo","Camo — skull","Camo"],["blobcamo","Digital camo — pixel blobs","Digital camo"],["rhomblaser","Camo — rhombus keyline","Camo"],["rhombhalf","Camo — rhombus","Camo"],["hexcubelaser","Hex — cube keyline","Hex"],["hexcubemil","Digital camo — hex cubes","Digital camo"],["hexcube","Hex — cube camo","Hex"],["hexcamo","Hex — camo","Hex"],["hexhalf","Hex — halftone","Hex"],["isowire","Topo — isometric wireframe","Topo"],["archweave","Topo — architectural weave","Topo"],["skullnet","Camo — skull network","Camo"],["warp","Topo — warp relief","Topo"],["warpflow","Topo — warp flow","Topo"],["wave","Flow — wave lines","Flow"],["weave","Geometric — herringbone weave","Geometric"],["basket","Geometric — basketweave","Geometric"],["pinwheel","Geometric — pinwheel","Geometric"],["mixed","Geometric — mixed scale","Geometric"],["mixedmark","Kleeq mark — mixed scale","Kleeq mark"],["flow","Flow — field","Flow"],["flowmark","Kleeq mark — flow field","Kleeq mark"],["pixel","Digital camo — pixels","Digital camo"],["linecamo","Camo — lines","Camo"],["hexmesh","Hex — mesh","Hex"],["tread","Mechanical — tread plate","Mechanical"],["hazard","Mechanical — hazard bars","Mechanical"],["kleeq","Kleeq mark — grid","Kleeq mark"],["kleeq6","Kleeq mark — six weights","Kleeq mark"],["deffrag","Camo — defense fragments","Camo"],["tricamo","Triangle — halftone camo","Triangle"],["dotcamo","Digital camo — dot weights","Digital camo"],["gradbase","Camo — gradient base","Camo"],["gradbase2","Camo — gradient base bold","Camo"],["dotnetcamo","Camo — dissolved dot network","Camo"],["dotdiscamo","Camo — dissolved dots","Camo"],["blobwcamo","Camo — circle weights","Camo"],["blobwhex","Camo — hex weights","Camo"],["blobwtri","Camo — tri weights","Camo"],["hexwcamo","Digital camo — hex weights","Digital camo"],["pentwcamo","Digital camo — penta weights","Digital camo"],["triwcamo","Digital camo — tri weights","Digital camo"],["pluswcamo","Digital camo — plus weights","Digital camo"],["dotcamo6","Digital camo — dot clusters","Digital camo"],["geoblocks","Geometric — blocks","Geometric"],["geoflow","Geometric — blocks flow","Geometric"],["geocamo","Geometric — camo flow","Geometric"],["geowave","Geometric — blocks wave","Geometric"],["tricamo2","Triangle — mixed orientation camo","Triangle"],["tricamo3","Triangle — outline mix camo","Triangle"],["tricamo4","Triangle — diagonal drift camo","Triangle"],["tridis","Triangle — dissolved camo","Triangle"],["defcamo","Camo — defense clusters","Camo"],["defcamo2","Camo — defense two-scale flow","Camo"],["viblines","Flow — vibration lines","Flow"],["vibwake","Flow — vibration wake","Flow"],["dots","Geometric — dots","Geometric"],["rings","Geometric — rings","Geometric"],["plus","Geometric — crosses","Geometric"],["triangles","Triangle — basic","Triangle"],["cubes","Geometric — iso cubes","Geometric"],["crosshatch","Geometric — crosshatch","Geometric"],["scallop","Geometric — fish scale","Geometric"]];
})();

/* reference artwork clusters used by the hexdash / techframe / trispeed motifs (ink = __INK__, accent = __ACC__) */
window.KLEEQ_REF_ART={"hexdash":{"x":0,"y":0,"w":0,"h":0,"mk":"<path d=\"M443.25,117.15c-1.4-2.43-3.82-3.83-6.63-3.83h-195.12c-1.5,0-2.8.75-3.55,2.05-.75,1.3-.75,2.8,0,4.1l37.24,64.51c.6,1.04.9,2.14.9,3.28s-.3,2.24-.9,3.28l-37.24,64.51c-.75,1.3-.75,2.8,0,4.1.75,1.3,2.05,2.05,3.55,2.05h195.12c2.81,0,5.22-1.39,6.63-3.82l38.27-66.28c1.4-2.43,1.4-5.22,0-7.65l-38.27-66.28ZM481.04,190.81h.01-.01ZM480.57,190.54l-38.27,66.28c-1.2,2.08-3.27,3.27-5.67,3.27h-195.12c-1.1,0-2.05-.55-2.6-1.5-.55-.95-.55-2.05,0-3l37.24-64.51c.7-1.21,1.05-2.49,1.05-3.83s-.35-2.62-1.05-3.83l-37.24-64.51c-.55-.95-.55-2.05,0-3,.55-.95,1.5-1.5,2.6-1.5h195.12c2.4,0,4.47,1.19,5.67,3.28l38.27,66.28c1.2,2.08,1.2,4.47,0,6.55Z\" fill=\"__INK__\"/><path d=\"M482.34,204.03c-.38-.66-1.04-1.04-1.8-1.04h-57.21c-.38,0-.71.19-.9.52-.19.33-.19.71,0,1.04l10.92,18.91c.19.33.29.69.29,1.04s-.1.71-.29,1.04l-10.92,18.91c-.19.33-.19.71,0,1.04.19.33.52.52.9.52h57.21c.76,0,1.42-.38,1.8-1.04l11.22-19.43c.38-.66.38-1.42,0-2.08l-11.22-19.43Z\" fill=\"__ACC__\"/><path d=\"M314.04,105.95c-.75-1.3-2.05-2.05-3.55-2.05h-97.47c-.85,0-1.59.42-2.01,1.16-.43.74-.43,1.58,0,2.32l18.6,32.23c.28.48.41.98.41,1.5s-.14,1.02-.41,1.5l-18.6,32.22c-.43.74-.43,1.58,0,2.32.42.74,1.16,1.16,2.01,1.16h97.47c1.5,0,2.8-.75,3.55-2.05l19.12-33.11c.75-1.3.75-2.79,0-4.09l-19.12-33.11ZM332.21,142.61l-19.12,33.11c-.55.95-1.5,1.5-2.6,1.5h-97.47c-.46,0-.83-.22-1.06-.61-.23-.4-.23-.83,0-1.22l18.6-32.22c.37-.65.56-1.33.56-2.05s-.19-1.41-.56-2.05l-18.6-32.23c-.23-.39-.23-.83,0-1.22.23-.4.6-.61,1.06-.61h97.47c1.1,0,2.05.55,2.6,1.5l19.12,33.11c.55.95.55,2.04,0,3Z\" fill=\"__INK__\"/><path d=\"M259.6,171.95l-3.03-5.25c-.21-.36-.56-.56-.97-.56h-30.92c-.21,0-.38.1-.49.28-.1.18-.1.38,0,.56l5.9,10.22c.1.18.15.37.15.56s-.05.38-.15.56l-5.9,10.22c-.1.18-.1.38,0,.56.1.18.28.28.49.28h30.92c.41,0,.77-.2.97-.56l6.06-10.5c.1-.18.15-.37.15-.56s-.05-.38-.15-.56l-3.03-5.25Z\" fill=\"__ACC__\"/><path d=\"M521.93,163.58h-52.19c-.3,0-.55.25-.55.55s.25.55.55.55h52.19c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M545.23,163.58h-11.22c-.3,0-.55.25-.55.55s.25.55.55.55h11.22c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M602.83,213.2h-119.57c-.3,0-.55.25-.55.55s.25.55.55.55h119.57c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M622.33,213.2h-7.41c-.3,0-.55.25-.55.55s.25.55.55.55h7.41c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M389.31,126.65h-63.63c-.3,0-.55.25-.55.55s.25.55.55.55h63.63c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M399.68,126.65h-3.94c-.3,0-.55.25-.55.55s.25.55.55.55h3.94c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M325.99,188.3h-76.05c-.3,0-.55.25-.55.55s.25.55.55.55h76.05c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M352.3,188.3h-18.61c-.3,0-.55.25-.55.55s.25.55.55.55h18.61c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M276.97,149.05h-50.75c-.3,0-.55.25-.55.55s.25.55.55.55h50.75c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M286.87,149.05h-4.77c-.3,0-.55.25-.55.55s.25.55.55.55h4.77c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M529.35,235.28h-50.75c-.3,0-.55.25-.55.55s.25.55.55.55h50.75c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M539.25,235.28h-4.77c-.3,0-.55.25-.55.55s.25.55.55.55h4.77c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M548.17,244.92h-70.55c-.3,0-.55.25-.55.55s.25.55.55.55h70.55c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M568.97,244.92h-13.12c-.3,0-.55.25-.55.55s.25.55.55.55h13.12c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M348.29,133.49h-101.29c-.3,0-.55.25-.55.55s.25.55.55.55h101.29c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M378.16,133.49h-18.83c-.3,0-.55.25-.55.55s.25.55.55.55h18.83c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M625.61,115.65c.5-.86.5-1.85,0-2.72-.5-.86-1.36-1.36-2.35-1.36h-41.08c-1.79,0-3.34.89-4.24,2.45l-23.4,40.52c-.9,1.55-.9,3.34,0,4.89l23.4,40.52c.9,1.55,2.44,2.44,4.24,2.44h41.08c1,0,1.86-.49,2.35-1.36.5-.87.5-1.86,0-2.72l-22.77-39.44c-.35-.6-.52-1.24-.52-1.89s.18-1.29.53-1.9l22.77-39.44ZM601.89,159.43l22.77,39.44c.3.52.3,1.1,0,1.62-.3.52-.8.81-1.4.81h-41.08c-1.39,0-2.59-.69-3.28-1.89l-23.4-40.52c-.7-1.21-.7-2.59,0-3.79l23.4-40.52c.69-1.21,1.89-1.9,3.28-1.9h41.08c.6,0,1.1.29,1.4.81.3.52.3,1.1,0,1.62l-22.77,39.44c-.45.77-.67,1.6-.67,2.45s.23,1.69.67,2.45Z\" fill=\"__INK__\"/><path d=\"M208.05,155.42c.25-.43.25-.92,0-1.35-.25-.43-.67-.68-1.17-.68h-25.57c-.99,0-1.84.49-2.34,1.35l-14.56,25.22c-.5.86-.5,1.84,0,2.7l14.56,25.22c.5.86,1.35,1.35,2.34,1.35h25.57c.49,0,.92-.25,1.17-.68.25-.43.25-.92,0-1.35l-14.17-24.55c-.25-.43-.37-.89-.37-1.35s.12-.92.37-1.35l14.17-24.55Z\" fill=\"__ACC__\"/><path d=\"M479.33,180.74c-4.85-8.4.94-16.62,11.48-16.62h-21.07l9.59,16.62Z\" fill=\"__ACC__\"/><path d=\"M490.81,163.58h-21.08c-.2,0-.38.1-.48.27-.1.17-.1.38,0,.55l9.59,16.62c.1.18.29.27.48.27.09,0,.19-.02.27-.07.26-.15.35-.49.2-.75-2.05-3.56-2.22-7.19-.47-10.22,2.02-3.49,6.31-5.57,11.48-5.57.3,0,.55-.25.55-.55s-.25-.55-.55-.55ZM478.38,169.7c-1.07,1.85-1.49,3.94-1.28,6.1l-6.42-11.12h13.86c-2.69,1.03-4.85,2.76-6.16,5.02Z\" fill=\"__INK__\"/><path d=\"M226.39,132.36h-78.47c-.3,0-.55.25-.55.55s.25.55.55.55h78.47c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M129.74,132.36h-16.87c-.3,0-.55.25-.55.55s.25.55.55.55h16.87c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M205.31,132.91h21.07l-9.59-16.62c4.85,8.4-.94,16.62-11.48,16.62Z\" fill=\"__ACC__\"/><path d=\"M217.27,116.02c-.15-.26-.49-.36-.75-.2-.26.15-.35.49-.2.75,2.05,3.56,2.22,7.19.47,10.22-2.01,3.49-6.3,5.57-11.47,5.57-.3,0-.55.25-.55.55s.25.55.55.55h21.07c.2,0,.38-.1.48-.27.1-.17.1-.38,0-.55l-9.59-16.62ZM211.58,132.36c2.69-1.03,4.85-2.76,6.16-5.02,1.07-1.85,1.49-3.94,1.28-6.09l6.42,11.12h-13.85Z\" fill=\"__INK__\"/><path d=\"M191.5,233.78h-10.3c-.3,0-.55.25-.55.55s.25.55.55.55h10.3c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M250.55,233.78h-47.94c-.3,0-.55.25-.55.55s.25.55.55.55h47.94c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M240.95,250.95l9.59-16.62h-21.07c10.54,0,16.33,8.21,11.48,16.62Z\" fill=\"__ACC__\"/><path d=\"M250.55,233.78h-21.07c-.3,0-.55.25-.55.55s.25.55.55.55c5.17,0,9.46,2.08,11.47,5.57,1.75,3.03,1.58,6.66-.47,10.22-.15.26-.06.6.2.75.09.05.18.07.27.07.19,0,.37-.1.48-.27l9.59-16.62c.1-.17.1-.38,0-.55-.1-.17-.28-.27-.48-.27ZM243.18,246c.21-2.15-.21-4.25-1.28-6.1-1.31-2.26-3.46-3.99-6.16-5.02h13.86l-6.42,11.12Z\" fill=\"__INK__\"/><path d=\"M553.19,210.1l-1.9-3.3c-.13-.22-.35-.35-.61-.35h-19.42c-.13,0-.24.06-.31.18-.06.11-.06.24,0,.35l3.71,6.42c.06.11.1.23.1.35s-.03.24-.1.35l-3.71,6.42c-.06.11-.06.24,0,.35.06.11.18.18.31.18h19.42c.26,0,.48-.13.61-.35l3.81-6.6c.06-.11.1-.23.1-.35s-.03-.24-.1-.35l-1.9-3.3Z\" fill=\"__ACC__\"/><path d=\"M507.64,194.53l-1.05-1.82c-.07-.12-.19-.19-.34-.19h-10.69c-.07,0-.13.04-.17.1-.04.06-.04.13,0,.19l2.04,3.54c.04.06.05.13.05.19s-.02.13-.05.19l-2.04,3.54c-.04.06-.04.13,0,.19.04.06.1.1.17.1h10.69c.14,0,.27-.07.34-.19l2.1-3.63c.04-.06.05-.13.05-.19s-.02-.13-.05-.19l-1.05-1.82Z\" fill=\"__ACC__\"/><path d=\"M172.11,143.94l-1.05-1.82c-.07-.12-.19-.19-.34-.19h-10.69c-.07,0-.13.04-.17.1-.04.06-.04.13,0,.19l2.04,3.54c.04.06.05.13.05.19s-.02.13-.05.19l-2.04,3.54c-.04.06-.04.13,0,.19.04.06.1.1.17.1h10.69c.14,0,.27-.07.34-.19l2.1-3.63c.04-.06.05-.13.05-.19s-.02-.13-.05-.19l-1.05-1.82Z\" fill=\"__ACC__\"/><path d=\"M374.28,270.67c-.09-.15-.13-.32-.13-.49s.04-.33.13-.49l5.12-8.86c.09-.15.09-.33,0-.49-.09-.15-.24-.24-.42-.24h-26.81c-.36,0-.67.18-.84.49l-2.63,4.55-2.63,4.55c-.09.16-.13.32-.13.49s.04.33.13.49l5.26,9.11c.18.31.49.49.84.49h26.81c.18,0,.33-.09.42-.24.09-.15.09-.33,0-.49l-5.12-8.86Z\" fill=\"__ACC__\"/><path d=\"M293.63,97.04c-.16-.28-.24-.58-.24-.88s.08-.6.24-.88l9.27-16.06c.16-.28.16-.6,0-.88-.16-.28-.44-.44-.77-.44h-48.59c-.65,0-1.21.32-1.53.88l-4.76,8.25-4.77,8.25c-.16.28-.24.58-.24.88s.08.6.24.88l9.53,16.5c.32.56.88.88,1.53.88h48.59c.32,0,.6-.16.77-.44.16-.28.16-.6,0-.88l-9.27-16.06Z\" fill=\"__ACC__\"/><path d=\"M617.27,145.42c-.08-.14-.13-.3-.13-.46s.04-.31.13-.45l4.77-8.27c.08-.14.08-.31,0-.45-.08-.14-.23-.23-.39-.23h-25.01c-.33,0-.62.17-.79.45l-2.45,4.25-2.45,4.25c-.08.14-.13.3-.13.45s.04.31.13.46l4.9,8.5c.17.29.45.45.79.45h25.01c.17,0,.31-.08.39-.23.08-.14.08-.31,0-.45l-4.77-8.27Z\" fill=\"__ACC__\"/><path d=\"M650.35,144.42h-6.52c-.3,0-.55.25-.55.55s.25.55.55.55h6.52c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M640.26,144.42h-33.79c-.3,0-.55.25-.55.55s.25.55.55.55h33.79c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M660.72,171.77h-50.75c-.3,0-.55.25-.55.55s.25.55.55.55h50.75c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M670.62,171.77h-4.77c-.3,0-.55.25-.55.55s.25.55.55.55h4.77c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M483.47,126.21h-35.31c-.3,0-.55.25-.55.55s.25.55.55.55h35.31c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M499.8,126.21h-12.77c-.3,0-.55.25-.55.55s.25.55.55.55h12.77c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M455,138.61c-3.46-5.99.67-11.85,8.19-11.85h-15.03l6.84,11.85Z\" fill=\"__ACC__\"/><path d=\"M463.19,126.21h-15.03c-.2,0-.38.1-.48.27-.1.17-.1.38,0,.55l6.84,11.84s0,0,0,0c.1.18.29.27.48.27.09,0,.19-.02.27-.07.26-.15.35-.49.2-.75h0c-1.43-2.49-1.55-5.02-.33-7.13,1.41-2.44,4.42-3.9,8.05-3.9.3,0,.55-.25.55-.55s-.25-.55-.55-.55ZM454.19,130.66c-.67,1.15-.99,2.44-.97,3.77l-4.11-7.12h8.84c-1.62.76-2.92,1.91-3.76,3.35Z\" fill=\"__INK__\"/><path d=\"M177.71,191.13h-26.87c-.3,0-.55.25-.55.55s.25.55.55.55h26.87c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M122.44,191.68c0-.3-.25-.55-.55-.55H0v1.1h121.89c.3,0,.55-.25.55-.55Z\" fill=\"__INK__\"/><path d=\"M747.15,186.48h-128.69c-.3,0-.55.25-.55.55s.25.55.55.55h128.69c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M762.71,186.48c-.3,0-.55.25-.55.55s.25.55.55.55h37.29v-1.1h-37.29Z\" fill=\"__INK__\"/><path d=\"M208.39,224.61H49.83c-.3,0-.55.25-.55.55s.25.55.55.55h158.55c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M255.84,224.61h-30.61c-.3,0-.55.25-.55.55s.25.55.55.55h30.61c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M695.12,170.35c-.31-.54-.85-.85-1.47-.85h-16.04c-.31,0-.58.15-.73.42-.16.27-.15.58,0,.85l8.89,15.4c.16.27.23.56.23.85s-.08.58-.23.85l-8.89,15.4c-.16.27-.16.58,0,.85.16.27.42.42.73.42h16.04c.62,0,1.16-.31,1.47-.85l9.14-15.83c.31-.54.31-1.16,0-1.7l-9.14-15.83Z\" fill=\"__ACC__\"/><path d=\"M90.36,174.59c.11-.19.11-.4,0-.58-.11-.19-.29-.29-.51-.29h-11.06c-.43,0-.8.21-1.01.58l-6.3,10.91c-.21.37-.21.8,0,1.17l6.3,10.91c.21.37.58.58,1.01.58h11.06c.21,0,.4-.11.51-.29.11-.19.11-.4,0-.58l-6.13-10.61c-.11-.19-.16-.38-.16-.58s.05-.4.16-.58l6.13-10.61Z\" fill=\"__ACC__\"/><path d=\"M137.91,182.52c-.79-1.36-2.14-2.14-3.72-2.14h-35.41c-.89,0-1.65.44-2.1,1.21-.44.77-.44,1.65,0,2.42l19.63,34c.29.51.44,1.05.44,1.6s-.15,1.09-.44,1.6l-19.63,34c-.44.77-.44,1.65,0,2.42.44.77,1.21,1.21,2.1,1.21h35.41c1.57,0,2.93-.78,3.72-2.14l20.17-34.93c.79-1.36.79-2.93,0-4.29l-20.17-34.93ZM157.12,221.19l-20.17,34.93c-.58,1.01-1.59,1.6-2.76,1.6h-35.41c-.49,0-.9-.23-1.14-.66-.25-.43-.25-.9,0-1.32l19.63-34c.39-.68.59-1.4.59-2.15s-.2-1.47-.59-2.14l-19.63-34c-.25-.43-.25-.9,0-1.32.25-.43.65-.66,1.14-.66h35.41c1.17,0,2.18.58,2.76,1.6l20.17,34.93c.59,1.02.59,2.18,0,3.19Z\" fill=\"__INK__\"/><path d=\"M93.81,208.34c-.41-.71-1.11-1.12-1.93-1.12h-15.92c-.5,0-.95.26-1.2.69-.25.44-.25.96,0,1.39l8.82,15.28c.11.18.16.37.16.57s-.05.38-.16.57l-8.82,15.28c-.25.44-.25.96,0,1.39.25.44.7.7,1.2.7h15.92c.82,0,1.52-.41,1.93-1.11l9.07-15.7c.41-.71.41-1.52,0-2.23l-9.07-15.7ZM101.92,225.73l-9.07,15.7c-.21.37-.56.57-.98.57h-15.92c-.11,0-.2-.05-.25-.15-.06-.09-.06-.19,0-.29l8.82-15.28c.2-.35.3-.73.3-1.11s-.11-.77-.3-1.11l-8.82-15.28c-.06-.1-.06-.19,0-.29.06-.1.14-.15.25-.15h15.92c.42,0,.77.2.98.57l9.07,15.7c.21.37.21.77,0,1.13ZM102.4,226h.01-.01Z\" fill=\"__INK__\"/><path d=\"M360.62,87.39h-70.77c-.3,0-.55.25-.55.55s.25.55.55.55h70.77c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M393.36,87.39h-25.59c-.3,0-.55.25-.55.55s.25.55.55.55h25.59c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M536.2,111.57h-13.66c-.3,0-.55.25-.55.55s.25.55.55.55h13.66c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M582.18,111.57h-37.77c-.3,0-.55.25-.55.55s.25.55.55.55h37.77c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M362.69,269.63h-98.54c-.3,0-.55.25-.55.55s.25.55.55.55h98.54c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M254.19,269.63h-35.63c-.3,0-.55.25-.55.55s.25.55.55.55h35.63c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M404.92,178.87h-53.13c-.3,0-.55.25-.55.55s.25.55.55.55h53.13c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M566.72,178.87h-146.94c-.3,0-.55.25-.55.55s.25.55.55.55h146.94c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M59.87,178.69h-10.3c-.3,0-.55.25-.55.55s.25.55.55.55h10.3c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M39.01,179.24c0-.3-.25-.55-.55-.55H0v1.1h38.46c.3,0,.55-.25.55-.55Z\" fill=\"__INK__\"/><path d=\"M746.35,207.76c-.3,0-.55.25-.55.55s.25.55.55.55h53.65v-1.1h-53.65Z\" fill=\"__INK__\"/><path d=\"M731.6,207.76h-13.68c-.3,0-.55.25-.55.55s.25.55.55.55h13.68c.3,0,.55-.25.55-.55s-.25-.55-.55-.55Z\" fill=\"__INK__\"/><path d=\"M413.89,268.13c-.51-.88-1.38-1.38-2.39-1.38h-26.09c-.51,0-.94.25-1.19.69-.25.44-.25.94,0,1.38l14.46,25.05c.25.44.38.91.38,1.38s-.13.94-.38,1.38l-14.46,25.05c-.25.44-.25.94,0,1.38.25.44.69.69,1.19.69h26.09c1.01,0,1.88-.5,2.39-1.38l14.86-25.73c.51-.88.51-1.88,0-2.76l-14.86-25.73Z\" fill=\"__ACC__\"/><path d=\"M137.75,244.3c-.26-.45-.71-.71-1.23-.71h-13.44c-.26,0-.48.13-.62.35-.13.23-.13.48,0,.71l7.45,12.9c.13.23.2.47.2.71s-.07.48-.2.71l-7.45,12.9c-.13.23-.13.48,0,.71.13.23.35.35.62.35h13.44c.52,0,.97-.26,1.23-.71l7.65-13.26c.26-.45.26-.97,0-1.42l-7.65-13.26Z\" fill=\"__ACC__\"/><path d=\"M557.8,84.38c.13-.23.13-.48,0-.71-.13-.23-.35-.35-.61-.35h-13.44c-.52,0-.97.26-1.23.71l-7.65,13.26c-.26.45-.26.97,0,1.42l7.65,13.26c.26.45.71.71,1.23.71h13.44c.26,0,.48-.13.61-.35.13-.23.13-.48,0-.71l-7.45-12.9c-.13-.23-.2-.47-.2-.71s.07-.48.2-.71l7.45-12.9Z\" fill=\"__ACC__\"/><path d=\"M665.86,198.55c.33-.57.33-1.25,0-1.82-.33-.57-.92-.91-1.58-.91h-24.13c-1.14,0-2.11.56-2.68,1.55l-13.74,23.8c-.57.98-.57,2.11,0,3.1l13.74,23.8c.57.98,1.55,1.55,2.68,1.55h24.13c.66,0,1.25-.34,1.58-.91.33-.57.33-1.25,0-1.82l-13.37-23.16c-.18-.32-.28-.66-.28-1s.09-.68.28-1l13.37-23.16ZM651.54,224.27l13.37,23.16c.14.23.14.49,0,.72-.14.23-.36.36-.63.36h-24.13c-.73,0-1.37-.37-1.73-1l-13.74-23.8c-.37-.64-.37-1.36,0-2l13.74-23.8c.37-.65.99-1,1.73-1h24.13c.27,0,.49.13.63.36.14.23.14.49,0,.72l-13.37,23.16c-.28.48-.43,1.02-.43,1.55s.15,1.07.43,1.55Z\" fill=\"__INK__\"/>","bb":[[237.39,113.32,245.18,147.88],[422.29,202.99,71.56,43.02],[210.69,103.9,123.03,74.41],[224.11,166.14,38.67,23.24],[469.19,163.58,53.29,1.1],[533.46,163.58,12.32,1.1],[482.71,213.2,120.67,1.1],[614.37,213.2,8.51,1.1],[325.13,126.65,64.73,1.1],[395.19,126.65,5.04,1.1],[249.39,188.3,77.15,1.1],[333.14,188.3,19.71,1.1],[225.67,149.05,51.85,1.1],[281.55,149.05,5.87,1.1],[478.05,235.28,51.85,1.1],[533.93,235.28,5.87,1.1],[477.07,244.92,71.65,1.1],[555.3,244.92,14.22,1.1],[246.45,133.49,102.39,1.1],[358.78,133.49,19.93,1.1],[553.86,111.57,72.12,90.82],[164.04,153.39,44.2,55.84],[469.74,164.12,21.07,16.62],[469.17,163.58,22.18,17.71],[147.37,132.36,79.57,1.1],[112.32,132.36,17.97,1.1],[205.31,116.29,21.07,16.62],[204.77,115.74,22.18,17.72],[180.65,233.78,11.4,1.1],[202.06,233.78,49.04,1.1],[229.47,234.33,21.07,16.62],[228.93,233.78,22.16,17.71],[530.91,206.45,24.29,14.6],[495.36,192.52,13.38,8.04],[159.83,141.93,13.38,8.04],[345.94,260.1,33.53,20.17],[242.24,77.9,60.78,36.52],[590.82,135.56,31.28,18.81],[643.28,144.42,7.62,1.1],[605.92,144.42,34.89,1.1],[609.42,171.77,51.85,1.1],[665.3,171.77,5.87,1.1],[447.61,126.21,36.41,1.1],[486.48,126.21,13.87,1.1],[448.16,126.76,15.03,11.85],[447.6,126.19,16.14,12.95],[150.29,191.13,27.97,1.1],[0,191.13,122.44,1.1],[617.91,186.48,129.79,1.1],[762.16,186.48,37.84,1.1],[49.28,224.61,159.65,1.1],[224.68,224.61,31.71,1.1],[676.76,169.5,27.73,35.04],[71.32,173.72,19.12,24.15],[96.35,180.38,62.32,78.46],[74.57,207.22,28.61,35.87],[289.3,87.39,71.87,1.1],[367.22,87.39,26.69,1.1],[521.99,111.57,14.76,1.1],[543.86,111.57,38.87,1.1],[263.6,269.63,99.64,1.1],[218.01,269.63,36.73,1.1],[351.24,178.87,54.23,1.1],[419.23,178.87,148.04,1.1],[49.02,178.69,11.4,1.1],[0,178.69,39.01,1.1],[745.8,207.76,54.2,1.1],[717.37,207.76,14.78,1.1],[384.03,266.75,45.1,57],[122.36,243.59,23.23,29.34],[534.67,83.32,23.22,29.36],[623.3,195.82,42.8,53.8]]},"techframe":{"x":0,"y":0,"w":0,"h":0,"mk":"<path d=\"M480.17,241.48h-211.38c-.3,0-.55-.25-.55-.55v-68c0-14.43,11.74-26.17,26.17-26.17h232.57c.3,0,.55.25.55.55v46.81c0,26.12-21.25,47.36-47.36,47.36ZM269.34,240.38h210.83c25.51,0,46.26-20.75,46.26-46.26v-46.26h-232.02c-13.83,0-25.07,11.25-25.07,25.07v67.45Z\" fill=\"__INK__\"/><path d=\"M614.21,169.96h-131.5c-.3,0-.55-.25-.55-.55v-23.84c0-13.45,10.94-24.39,24.39-24.39h83.82c13.45,0,24.39,10.94,24.39,24.39v23.84c0,.3-.25.55-.55.55ZM483.26,168.86h130.41v-23.29c0-12.84-10.45-23.29-23.29-23.29h-83.82c-12.84,0-23.29,10.45-23.29,23.29v23.29Z\" fill=\"__INK__\"/><path d=\"M283.88,256.02h-51.11c-8.32,0-15.09-6.77-15.09-15.09v-14.54c0-.3.25-.55.55-.55h80.18c.3,0,.55.25.55.55v14.54c0,8.32-6.77,15.09-15.08,15.09ZM218.78,226.95v13.99c0,7.71,6.28,13.99,13.99,13.99h51.11c7.71,0,13.99-6.27,13.99-13.99v-13.99h-79.08Z\" fill=\"__INK__\"/><path d=\"M353.69,147.86h-59.28c-.3,0-.55-.25-.55-.55v-10.75c0-6.23,5.07-11.3,11.3-11.3h37.79c6.23,0,11.3,5.07,11.3,11.3v10.75c0,.3-.25.55-.55.55ZM294.96,146.76h58.18v-10.2c0-5.62-4.58-10.2-10.2-10.2h-37.79c-5.62,0-10.2,4.57-10.2,10.2v10.2Z\" fill=\"__INK__\"/><path d=\"M445.98,258.39h-29.72c-4.96,0-9-4.04-9-9v-8.45c0-.3.25-.55.55-.55h46.63c.3,0,.55.25.55.55v8.45c0,4.96-4.04,9-9,9ZM408.36,241.48v7.9c0,4.36,3.55,7.9,7.9,7.9h29.72c4.36,0,7.9-3.55,7.9-7.9v-7.9h-45.53Z\" fill=\"__INK__\"/><path d=\"M200.12,226.4h46.63v-8.45c0-4.65-3.8-8.45-8.45-8.45h-29.72c-4.65,0-8.45,3.8-8.45,8.45v8.45Z\" fill=\"__ACC__\"/><path d=\"M246.75,226.95h-46.63c-.3,0-.55-.25-.55-.55v-8.45c0-4.96,4.04-9,9-9h29.72c4.96,0,9,4.04,9,9v8.45c0,.3-.25.55-.55.55ZM200.67,225.85h45.53v-7.91c0-4.36-3.55-7.9-7.9-7.9h-29.72c-4.36,0-7.9,3.55-7.9,7.9v7.91Z\" fill=\"__INK__\"/><path d=\"M540.31,169.41h73.9v5.6c0,3.08-2.52,5.6-5.6,5.6h-62.71c-3.08,0-5.6-2.52-5.6-5.6v-5.6Z\" fill=\"__ACC__\"/><path d=\"M608.61,181.15h-62.71c-3.39,0-6.15-2.76-6.15-6.15v-5.6c0-.3.25-.55.55-.55h73.9c.3,0,.55.25.55.55v5.6c0,3.39-2.76,6.15-6.15,6.15ZM540.85,169.96v5.05c0,2.78,2.27,5.05,5.05,5.05h62.71c2.78,0,5.05-2.26,5.05-5.05v-5.05h-72.81Z\" fill=\"__INK__\"/><path d=\"M322.82,147.31h30.88v5.6c0,3.08-2.52,5.6-5.6,5.6h-19.68c-3.08,0-5.6-2.52-5.6-5.6v-5.6Z\" fill=\"__ACC__\"/><path d=\"M348.1,159.06h-19.68c-3.39,0-6.15-2.76-6.15-6.15v-5.6c0-.3.25-.55.55-.55h30.88c.3,0,.55.25.55.55v5.6c0,3.39-2.76,6.15-6.15,6.15ZM323.37,147.86v5.05c0,2.78,2.27,5.05,5.05,5.05h19.68c2.78,0,5.05-2.26,5.05-5.05v-5.05h-29.78Z\" fill=\"__INK__\"/><path d=\"M321.86,240.93h99.67v18.07c0,9.94-8.13,18.07-18.07,18.07h-63.53c-9.94,0-18.07-8.13-18.07-18.07v-18.07Z\" fill=\"__ACC__\"/><path d=\"M403.46,277.62h-63.53c-10.27,0-18.62-8.35-18.62-18.62v-18.07c0-.3.25-.55.55-.55h99.67c.3,0,.55.25.55.55v18.07c0,10.27-8.35,18.62-18.62,18.62ZM322.41,241.48v17.52c0,9.66,7.86,17.52,17.52,17.52h63.53c9.66,0,17.52-7.86,17.52-17.52v-17.52h-98.57Z\" fill=\"__INK__\"/><path d=\"M636.09,169.41c-12.03,0-21.88-9.85-21.88-21.88v21.88h21.88Z\" fill=\"__ACC__\"/><path d=\"M636.09,169.96h-21.88c-.3,0-.55-.25-.55-.55v-21.88c0-.3.25-.55.55-.55s.55.25.55.55c0,11.76,9.57,21.33,21.33,21.33.3,0,.55.25.55.55s-.25.55-.55.55ZM614.76,168.86h14.39c-6.79-2.22-12.17-7.59-14.39-14.39v14.39Z\" fill=\"__INK__\"/><path d=\"M745.88,169.96h-48.71c-.3,0-.55-.25-.55-.55s.25-.55.55-.55h48.71c.3,0,.55.25.55.55s-.25.55-.55.55ZM683.78,169.96h-47.69c-.3,0-.55-.25-.55-.55s.25-.55.55-.55h47.69c.3,0,.55.25.55.55s-.25.55-.55.55Z\" fill=\"__INK__\"/><path d=\"M246.91,188.23c12.03,0,21.88,9.85,21.88,21.88v-21.88h-21.88Z\" fill=\"__ACC__\"/><path d=\"M268.79,210.66c-.3,0-.55-.25-.55-.55,0-11.76-9.57-21.33-21.33-21.33-.3,0-.55-.25-.55-.55s.25-.55.55-.55h21.88c.3,0,.55.25.55.55v21.88c0,.3-.25.55-.55.55ZM253.85,188.78c6.79,2.22,12.17,7.6,14.39,14.39v-14.39h-14.39Z\" fill=\"__INK__\"/><path d=\"M246.91,188.78h-31.56c-.3,0-.55-.25-.55-.55s.25-.55.55-.55h31.56c.3,0,.55.25.55.55s-.25.55-.55.55ZM208.98,188.78h-12.23c-.3,0-.55-.25-.55-.55s.25-.55.55-.55h12.23c.3,0,.55.25.55.55s-.25.55-.55.55Z\" fill=\"__INK__\"/><path d=\"M246.67,277.35c0-12.03,9.85-21.88,21.88-21.88h-21.88v21.88Z\" fill=\"__ACC__\"/><path d=\"M246.67,277.9c-.3,0-.55-.25-.55-.55v-21.88c0-.3.25-.55.55-.55h21.88c.3,0,.55.25.55.55s-.25.55-.55.55c-11.76,0-21.33,9.57-21.33,21.33,0,.3-.25.55-.55.55ZM247.22,256.02v14.39c2.22-6.79,7.59-12.17,14.39-14.39h-14.39Z\" fill=\"__INK__\"/><path d=\"M246.67,336.56c-.3,0-.55-.25-.55-.55v-5.73c0-.3.25-.55.55-.55s.55.25.55.55v5.73c0,.3-.25.55-.55.55ZM246.67,321.94c-.3,0-.55-.25-.55-.55v-44.04c0-.3.25-.55.55-.55s.55.25.55.55v44.04c0,.3-.25.55-.55.55Z\" fill=\"__INK__\"/><path d=\"M480.17,262.81c0-12.03-9.85-21.88-21.88-21.88h21.88v21.88Z\" fill=\"__ACC__\"/><path d=\"M480.17,263.36c-.3,0-.55-.25-.55-.55,0-11.76-9.57-21.33-21.33-21.33-.3,0-.55-.25-.55-.55s.25-.55.55-.55h21.88c.3,0,.55.25.55.55v21.88c0,.3-.25.55-.55.55ZM465.23,241.48c6.79,2.22,12.17,7.6,14.39,14.39v-14.39h-14.39Z\" fill=\"__INK__\"/><path d=\"M480.17,289.5c-.3,0-.55-.25-.55-.55v-2.55c0-.3.25-.55.55-.55s.55.25.55.55v2.55c0,.3-.25.55-.55.55ZM480.17,282.99c-.3,0-.55-.25-.55-.55v-19.62c0-.3.25-.55.55-.55s.55.25.55.55v19.62c0,.3-.25.55-.55.55Z\" fill=\"__INK__\"/><path d=\"M392.92,115.58c0,17.45-14.28,31.73-31.73,31.73h31.73v-31.73Z\" fill=\"__ACC__\"/><path d=\"M392.92,147.86h-31.73c-.3,0-.55-.25-.55-.55s.25-.55.55-.55c17.2,0,31.18-13.99,31.18-31.19,0-.3.25-.55.55-.55s.55.25.55.55v31.73c0,.3-.25.55-.55.55ZM369.55,146.76h22.82v-22.82c-2.98,11.09-11.73,19.84-22.82,22.82Z\" fill=\"__INK__\"/><path d=\"M392.92,116.13c-.3,0-.55-.25-.55-.55v-28.46c0-.3.25-.55.55-.55s.55.25.55.55v28.46c0,.3-.25.55-.55.55ZM392.92,81.92c-.3,0-.55-.25-.55-.55v-3.7c0-.3.25-.55.55-.55s.55.25.55.55v3.7c0,.3-.25.55-.55.55Z\" fill=\"__INK__\"/><path d=\"M543.08,147.31c-8.86,0-16.1,7.25-16.1,16.1v-16.1h16.1Z\" fill=\"__ACC__\"/><path d=\"M526.98,163.96c-.3,0-.55-.25-.55-.55v-16.1c0-.3.25-.55.55-.55h16.1c.3,0,.55.25.55.55s-.25.55-.55.55c-8.57,0-15.55,6.98-15.55,15.55,0,.3-.25.55-.55.55ZM527.53,147.86v9.6c1.69-4.4,5.2-7.91,9.6-9.6h-9.6Z\" fill=\"__INK__\"/><path d=\"M588.03,147.86h-10.81c-.3,0-.55-.25-.55-.55s.25-.55.55-.55h10.81c.3,0,.55.25.55.55s-.25.55-.55.55ZM569.74,147.86h-26.65c-.3,0-.55-.25-.55-.55s.25-.55.55-.55h26.65c.3,0,.55.25.55.55s-.25.55-.55.55Z\" fill=\"__INK__\"/><path d=\"M312.95,226.4c-8,0-14.54,6.54-14.54,14.54v-14.54h14.54Z\" fill=\"__ACC__\"/><path d=\"M298.41,241.48c-.3,0-.55-.25-.55-.55v-14.54c0-.3.25-.55.55-.55h14.54c.3,0,.55.25.55.55s-.25.55-.55.55c-7.71,0-13.99,6.27-13.99,13.99,0,.3-.25.55-.55.55ZM298.96,226.95v8.33c1.53-3.78,4.56-6.8,8.33-8.33h-8.33Z\" fill=\"__INK__\"/><path d=\"M345.89,226.95h-5.42c-.3,0-.55-.25-.55-.55s.25-.55.55-.55h5.42c.3,0,.55.25.55.55s-.25.55-.55.55ZM337.01,226.95h-24.06c-.3,0-.55-.25-.55-.55s.25-.55.55-.55h24.06c.3,0,.55.25.55.55s-.25.55-.55.55Z\" fill=\"__INK__\"/><path d=\"M409.99,147.31c-9.39,0-17.07,7.68-17.07,17.07v-17.07h17.07Z\" fill=\"__ACC__\"/><path d=\"M392.92,164.93c-.3,0-.55-.25-.55-.55v-17.07c0-.3.25-.55.55-.55h17.07c.3,0,.55.25.55.55s-.25.55-.55.55c-9.11,0-16.52,7.41-16.52,16.52,0,.3-.25.55-.55.55ZM393.47,147.86v10.39c1.79-4.79,5.6-8.61,10.39-10.39h-10.39Z\" fill=\"__INK__\"/><path d=\"M596.28,194.67h-11.4c-.3,0-.55-.25-.55-.55s.25-.55.55-.55h11.4c.3,0,.55.25.55.55s-.25.55-.55.55ZM577.61,194.67h-50.62c-.3,0-.55-.25-.55-.55s.25-.55.55-.55h50.62c.3,0,.55.25.55.55s-.25.55-.55.55Z\" fill=\"__INK__\"/><path d=\"M232.17,255.47c7.98,0,14.5-6.53,14.5-14.5v14.5h-14.5Z\" fill=\"__ACC__\"/><path d=\"M246.67,256.02h-14.5c-.3,0-.55-.25-.55-.55s.25-.55.55-.55c7.69,0,13.95-6.26,13.95-13.95,0-.3.25-.55.55-.55s.55.25.55.55v14.5c0,.3-.25.55-.55.55ZM237.81,254.92h8.31v-8.31c-1.53,3.77-4.54,6.78-8.31,8.31Z\" fill=\"__INK__\"/><path d=\"M319.41,173.48h-8.32c-.3,0-.55-.25-.55-.55s.25-.55.55-.55h8.32c.3,0,.55.25.55.55s-.25.55-.55.55ZM305.77,173.48h-36.98c-.3,0-.55-.25-.55-.55s.25-.55.55-.55h36.98c.3,0,.55.25.55.55s-.25.55-.55.55Z\" fill=\"__INK__\"/><path d=\"M200.12,226.95h-36.98c-.3,0-.55-.25-.55-.55s.25-.55.55-.55h36.98c.3,0,.55.25.55.55s-.25.55-.55.55ZM157.82,226.95h-8.32c-.3,0-.55-.25-.55-.55s.25-.55.55-.55h8.32c.3,0,.55.25.55.55s-.25.55-.55.55Z\" fill=\"__INK__\"/><path d=\"M355.4,277.07c15.49,0,28.17,12.68,28.17,28.17v-28.17h-28.17Z\" fill=\"__ACC__\"/><path d=\"M383.57,305.79c-.3,0-.55-.25-.55-.55,0-15.23-12.39-27.62-27.62-27.62-.3,0-.55-.25-.55-.55s.25-.55.55-.55h28.17c.3,0,.55.25.55.55v28.17c0,.3-.25.55-.55.55ZM363.28,277.62c9.51,2.72,17.02,10.23,19.74,19.74v-19.74h-19.74Z\" fill=\"__INK__\"/><path d=\"M535.92,121.72c-10.89,0-19.81-8.91-19.81-19.81v19.81h19.81Z\" fill=\"__ACC__\"/><path d=\"M535.92,122.27h-19.81c-.3,0-.55-.25-.55-.55v-19.81c0-.3.25-.55.55-.55s.55.25.55.55c0,10.62,8.64,19.26,19.26,19.26.3,0,.55.25.55.55s-.25.55-.55.55ZM516.66,121.17h12.66c-5.92-2.04-10.62-6.73-12.66-12.66v12.66Z\" fill=\"__INK__\"/><path d=\"M285.96,172.93c10.89,0,19.81,8.91,19.81,19.81v-19.81h-19.81Z\" fill=\"__ACC__\"/><path d=\"M305.77,193.29c-.3,0-.55-.25-.55-.55,0-10.62-8.64-19.26-19.26-19.26-.3,0-.55-.25-.55-.55s.25-.55.55-.55h19.81c.3,0,.55.25.55.55v19.81c0,.3-.25.55-.55.55ZM292.57,173.48c5.92,2.04,10.62,6.73,12.66,12.66v-12.66h-12.66Z\" fill=\"__INK__\"/><path d=\"M198.96,131.17h73.9v-5.6c0-3.08-2.52-5.6-5.6-5.6h-62.71c-3.08,0-5.6,2.52-5.6,5.6v5.6Z\" fill=\"__ACC__\"/><path d=\"M272.86,131.72h-73.9c-.3,0-.55-.25-.55-.55v-5.6c0-3.39,2.76-6.15,6.15-6.15h62.71c3.39,0,6.15,2.76,6.15,6.15v5.6c0,.3-.25.55-.55.55ZM199.5,130.62h72.81v-5.05c0-2.78-2.27-5.05-5.05-5.05h-62.71c-2.78,0-5.05,2.26-5.05,5.05v5.05Z\" fill=\"__INK__\"/><path d=\"M230.04,119.98c12.49,0,22.71-10.22,22.71-22.71v22.71h-22.71Z\" fill=\"__ACC__\"/><path d=\"M252.75,120.53h-22.71c-.3,0-.55-.25-.55-.55s.25-.55.55-.55c12.22,0,22.16-9.94,22.16-22.16,0-.3.25-.55.55-.55s.55.25.55.55v22.71c0,.3-.25.55-.55.55ZM237.11,119.43h15.09v-15.09c-2.29,7.15-7.94,12.81-15.09,15.09Z\" fill=\"__INK__\"/><path d=\"M198.95,131.72h-97.33c-.3,0-.55-.25-.55-.55s.25-.55.55-.55h97.33c.3,0,.55.25.55.55s-.25.55-.55.55ZM93.87,131.72h-19.61c-.3,0-.55-.25-.55-.55s.25-.55.55-.55h19.61c.3,0,.55.25.55.55s-.25.55-.55.55Z\" fill=\"__INK__\"/><path d=\"M218.2,161.87h-52.99c-8.61,0-15.62-7.01-15.62-15.62v-15.07c0-.3.25-.55.55-.55h83.14c.3,0,.55.25.55.55v15.07c0,8.61-7.01,15.62-15.62,15.62ZM150.68,131.72v14.52c0,8.01,6.52,14.52,14.52,14.52h52.99c8.01,0,14.52-6.52,14.52-14.52v-14.52h-82.04Z\" fill=\"__INK__\"/><path d=\"M177.08,153.05c0-12.03,9.85-21.88,21.88-21.88h-21.88v21.88Z\" fill=\"__ACC__\"/><path d=\"M177.08,153.6c-.3,0-.55-.25-.55-.55v-21.88c0-.3.25-.55.55-.55h21.88c.3,0,.55.25.55.55s-.25.55-.55.55c-11.76,0-21.33,9.57-21.33,21.33,0,.3-.25.55-.55.55ZM177.63,131.72v14.39c2.22-6.79,7.59-12.17,14.39-14.39h-14.39Z\" fill=\"__INK__\"/><path d=\"M177.08,212.26c-.3,0-.55-.25-.55-.55v-5.73c0-.3.25-.55.55-.55s.55.25.55.55v5.73c0,.3-.25.55-.55.55ZM177.08,197.64c-.3,0-.55-.25-.55-.55v-44.04c0-.3.25-.55.55-.55s.55.25.55.55v44.04c0,.3-.25.55-.55.55Z\" fill=\"__INK__\"/><path d=\"M657.97,191.29c0-12.03-9.85-21.88-21.88-21.88h21.88v21.88Z\" fill=\"__ACC__\"/><path d=\"M657.97,191.83c-.3,0-.55-.25-.55-.55,0-11.76-9.57-21.33-21.33-21.33-.3,0-.55-.25-.55-.55s.25-.55.55-.55h21.88c.3,0,.55.25.55.55v21.88c0,.3-.25.55-.55.55ZM643.03,169.96c6.79,2.22,12.17,7.6,14.39,14.39v-14.39h-14.39Z\" fill=\"__INK__\"/><path d=\"M657.97,250.5c-.3,0-.55-.25-.55-.55v-5.73c0-.3.25-.55.55-.55s.55.25.55.55v5.73c0,.3-.25.55-.55.55ZM657.97,235.88c-.3,0-.55-.25-.55-.55v-44.04c0-.3.25-.55.55-.55s.55.25.55.55v44.04c0,.3-.25.55-.55.55Z\" fill=\"__INK__\"/><path d=\"M449.6,164.93h-9.32c-.3,0-.55-.25-.55-.55s.25-.55.55-.55h9.32c.3,0,.55.25.55.55s-.25.55-.55.55ZM434.33,164.93h-41.41c-.3,0-.55-.25-.55-.55s.25-.55.55-.55h41.41c.3,0,.55.25.55.55s-.25.55-.55.55Z\" fill=\"__INK__\"/><path d=\"M310.2,212.09h-6.81c-.3,0-.55-.25-.55-.55s.25-.55.55-.55h6.81c.3,0,.55.25.55.55s-.25.55-.55.55ZM299.04,212.09h-30.25c-.3,0-.55-.25-.55-.55s.25-.55.55-.55h30.25c.3,0,.55.25.55.55s-.25.55-.55.55Z\" fill=\"__INK__\"/><path d=\"M410.7,147.31h36.96v-2.8c0-1.54-1.26-2.8-2.8-2.8h-31.36c-1.54,0-2.8,1.26-2.8,2.8v2.8Z\" fill=\"__ACC__\"/><path d=\"M447.65,147.86h-36.96c-.3,0-.55-.25-.55-.55v-2.8c0-1.85,1.5-3.35,3.35-3.35h31.36c1.85,0,3.35,1.5,3.35,3.35v2.8c0,.3-.25.55-.55.55ZM411.25,146.76h35.86v-2.25c0-1.24-1.01-2.25-2.25-2.25h-31.36c-1.24,0-2.25,1.01-2.25,2.25v2.25Z\" fill=\"__INK__\"/><path d=\"M697.19,169.41c10.63,0,19.32-8.69,19.32-19.32v19.32h-19.32Z\" fill=\"__ACC__\"/><path d=\"M716.51,169.96h-19.32c-.3,0-.55-.25-.55-.55s.25-.55.55-.55c10.35,0,18.77-8.42,18.77-18.77,0-.3.25-.55.55-.55s.55.25.55.55v19.32c0,.3-.25.55-.55.55ZM703.71,168.86h12.25v-12.25c-1.99,5.72-6.53,10.26-12.25,12.25Z\" fill=\"__INK__\"/><path d=\"M157.76,171.8c10.63,0,19.32,8.69,19.32,19.32v-19.32h-19.32Z\" fill=\"__ACC__\"/><path d=\"M177.08,191.67c-.3,0-.55-.25-.55-.55,0-10.35-8.42-18.77-18.77-18.77-.3,0-.55-.25-.55-.55s.25-.55.55-.55h19.32c.3,0,.55.25.55.55v19.32c0,.3-.25.55-.55.55ZM164.28,172.35c5.72,1.99,10.26,6.53,12.25,12.25v-12.25h-12.25Z\" fill=\"__INK__\"/><path d=\"M536.85,253.18h-9.32c-.3,0-.55-.25-.55-.55s.25-.55.55-.55h9.32c.3,0,.55.25.55.55s-.25.55-.55.55ZM521.58,253.18h-41.41c-.3,0-.55-.25-.55-.55s.25-.55.55-.55h41.41c.3,0,.55.25.55.55s-.25.55-.55.55Z\" fill=\"__INK__\"/><path d=\"M536.85,258.42h-9.32c-.3,0-.55-.25-.55-.55s.25-.55.55-.55h9.32c.3,0,.55.25.55.55s-.25.55-.55.55ZM521.58,258.42h-41.41c-.3,0-.55-.25-.55-.55s.25-.55.55-.55h41.41c.3,0,.55.25.55.55s-.25.55-.55.55Z\" fill=\"__INK__\"/><path d=\"M516.15,263.65h-9.32c-.3,0-.55-.25-.55-.55s.25-.55.55-.55h9.32c.3,0,.55.25.55.55s-.25.55-.55.55ZM500.87,263.65h-41.41c-.3,0-.55-.25-.55-.55s.25-.55.55-.55h41.41c.3,0,.55.25.55.55s-.25.55-.55.55Z\" fill=\"__INK__\"/><path d=\"M392.52,105.47h-41.41c-.3,0-.55-.25-.55-.55s.25-.55.55-.55h41.41c.3,0,.55.25.55.55s-.25.55-.55.55ZM345.16,105.47h-9.32c-.3,0-.55-.25-.55-.55s.25-.55.55-.55h9.32c.3,0,.55.25.55.55s-.25.55-.55.55Z\" fill=\"__INK__\"/><path d=\"M392.52,110.71h-41.41c-.3,0-.55-.25-.55-.55s.25-.55.55-.55h41.41c.3,0,.55.25.55.55s-.25.55-.55.55ZM345.16,110.71h-9.32c-.3,0-.55-.25-.55-.55s.25-.55.55-.55h9.32c.3,0,.55.25.55.55s-.25.55-.55.55Z\" fill=\"__INK__\"/><path d=\"M416.65,115.94h-41.41c-.3,0-.55-.25-.55-.55s.25-.55.55-.55h41.41c.3,0,.55.25.55.55s-.25.55-.55.55ZM369.29,115.94h-9.32c-.3,0-.55-.25-.55-.55s.25-.55.55-.55h9.32c.3,0,.55.25.55.55s-.25.55-.55.55Z\" fill=\"__INK__\"/><path d=\"M163.13,265.84c-.3,0-.55-.25-.55-.55v-10.08c0-.3.25-.55.55-.55s.55.25.55.55v10.08c0,.3-.25.55-.55.55ZM163.13,249.33c-.3,0-.55-.25-.55-.55v-44.77c0-.3.25-.55.55-.55s.55.25.55.55v44.77c0,.3-.25.55-.55.55Z\" fill=\"__INK__\"/><path d=\"M168.37,288.22c-.3,0-.55-.25-.55-.55v-10.08c0-.3.25-.55.55-.55s.55.25.55.55v10.08c0,.3-.25.55-.55.55ZM168.37,271.71c-.3,0-.55-.25-.55-.55v-44.77c0-.3.25-.55.55-.55s.55.25.55.55v44.77c0,.3-.25.55-.55.55Z\" fill=\"__INK__\"/><path d=\"M173.61,288.22c-.3,0-.55-.25-.55-.55v-10.08c0-.3.25-.55.55-.55s.55.25.55.55v10.08c0,.3-.25.55-.55.55ZM173.61,271.71c-.3,0-.55-.25-.55-.55v-44.77c0-.3.25-.55.55-.55s.55.25.55.55v44.77c0,.3-.25.55-.55.55Z\" fill=\"__INK__\"/><path d=\"M697.19,193.04c-.3,0-.55-.25-.55-.55v-5.25c0-.3.25-.55.55-.55s.55.25.55.55v5.25c0,.3-.25.55-.55.55ZM697.19,184.45c-.3,0-.55-.25-.55-.55v-23.3c0-.3.25-.55.55-.55s.55.25.55.55v23.3c0,.3-.25.55-.55.55Z\" fill=\"__INK__\"/><path d=\"M702.43,201.85c-.3,0-.55-.25-.55-.55v-5.24c0-.3.25-.55.55-.55s.55.25.55.55v5.24c0,.3-.25.55-.55.55ZM702.43,193.26c-.3,0-.55-.25-.55-.55v-23.3c0-.3.25-.55.55-.55s.55.25.55.55v23.3c0,.3-.25.55-.55.55Z\" fill=\"__INK__\"/><path d=\"M707.66,201.85c-.3,0-.55-.25-.55-.55v-5.24c0-.3.25-.55.55-.55s.55.25.55.55v5.24c0,.3-.25.55-.55.55ZM707.66,193.26c-.3,0-.55-.25-.55-.55v-23.3c0-.3.25-.55.55-.55s.55.25.55.55v23.3c0,.3-.25.55-.55.55Z\" fill=\"__INK__\"/><path d=\"M140.47,131.17c5.31,0,9.66-4.35,9.66-9.66v9.66h-9.66Z\" fill=\"__ACC__\"/><path d=\"M150.13,131.72h-9.66c-.3,0-.55-.25-.55-.55s.25-.55.55-.55c5.02,0,9.11-4.09,9.11-9.11,0-.3.25-.55.55-.55s.55.25.55.55v9.66c0,.3-.25.55-.55.55ZM145.08,130.62h4.51v-4.51c-.98,1.94-2.57,3.52-4.51,4.51Z\" fill=\"__INK__\"/><path d=\"M263.25,141.54h-4.93c-.3,0-.55-.25-.55-.55s.25-.55.55-.55h4.93c.3,0,.55.25.55.55s-.25.55-.55.55ZM255.17,141.54h-21.9c-.3,0-.55-.25-.55-.55s.25-.55.55-.55h21.9c.3,0,.55.25.55.55s-.25.55-.55.55Z\" fill=\"__INK__\"/><path d=\"M513.75,242.62c-8.8,0-15.96-7.16-15.96-15.96s7.16-15.96,15.96-15.96,15.96,7.16,15.96,15.96-7.16,15.96-15.96,15.96ZM513.75,211.8c-8.19,0-14.86,6.67-14.86,14.86s6.67,14.86,14.86,14.86,14.86-6.67,14.86-14.86-6.67-14.86-14.86-14.86Z\" fill=\"__INK__\"/><path d=\"M203.65,171.28c-5.49,0-9.96-4.47-9.96-9.96s4.47-9.96,9.96-9.96,9.96,4.47,9.96,9.96-4.47,9.96-9.96,9.96ZM203.65,152.46c-4.88,0-8.86,3.97-8.86,8.86s3.98,8.86,8.86,8.86,8.86-3.97,8.86-8.86-3.98-8.86-8.86-8.86Z\" fill=\"__INK__\"/><path d=\"M639.79,157.25c-4.79,0-8.69-3.9-8.69-8.69s3.9-8.69,8.69-8.69,8.69,3.9,8.69,8.69-3.9,8.69-8.69,8.69ZM639.79,140.97c-4.19,0-7.59,3.41-7.59,7.59s3.41,7.59,7.59,7.59,7.59-3.41,7.59-7.59-3.41-7.59-7.59-7.59Z\" fill=\"__INK__\"/><path d=\"M266.17,280.71c2.32,0,4.22-1.89,4.22-4.22s-1.89-4.22-4.22-4.22-4.22,1.89-4.22,4.22,1.89,4.22,4.22,4.22Z\" fill=\"__ACC__\"/><path d=\"M405.59,109.31c2.32,0,4.22-1.89,4.22-4.22s-1.89-4.22-4.22-4.22-4.22,1.89-4.22,4.22,1.89,4.22,4.22,4.22Z\" fill=\"__ACC__\"/><path d=\"M134.53,159.75c1.16,0,2.11-.95,2.11-2.11s-.95-2.11-2.11-2.11-2.11.95-2.11,2.11.95,2.11,2.11,2.11Z\" fill=\"__ACC__\"/><path d=\"M308.47,88.88c1.16,0,2.11-.95,2.11-2.11s-.95-2.11-2.11-2.11-2.11.95-2.11,2.11.95,2.11,2.11,2.11Z\" fill=\"__ACC__\"/><path d=\"M501.54,293.57c1.16,0,2.11-.95,2.11-2.11s-.95-2.11-2.11-2.11-2.11.95-2.11,2.11.95,2.11,2.11,2.11Z\" fill=\"__ACC__\"/><path d=\"M559.69,218.56c1.16,0,2.11-.95,2.11-2.11s-.95-2.11-2.11-2.11-2.11.95-2.11,2.11.95,2.11,2.11,2.11Z\" fill=\"__ACC__\"/><path d=\"M141.79,236.06c5.32,0,9.67-4.34,9.67-9.67s-4.34-9.67-9.67-9.67-9.67,4.34-9.67,9.67,4.34,9.67,9.67,9.67Z\" fill=\"__ACC__\"/><path d=\"M554.89,111.49c5.32,0,9.67-4.34,9.67-9.67s-4.34-9.67-9.67-9.67-9.67,4.34-9.67,9.67,4.34,9.67,9.67,9.67Z\" fill=\"__ACC__\"/><path d=\"M415.99,322.95c4.1,0,7.45-3.35,7.45-7.45s-3.35-7.45-7.45-7.45-7.45,3.35-7.45,7.45,3.35,7.45,7.45,7.45Z\" fill=\"__ACC__\"/><path d=\"M150.13,108.04c3.26,0,5.92-2.66,5.92-5.92s-2.66-5.92-5.92-5.92-5.92,2.66-5.92,5.92,2.66,5.92,5.92,5.92Z\" fill=\"__ACC__\"/><circle cx=\"513.75\" cy=\"226.66\" r=\"5.12\" fill=\"__INK__\"/><path d=\"M745.88,172.55c1.73,0,3.14-1.41,3.14-3.14s-1.41-3.14-3.14-3.14-3.14,1.41-3.14,3.14,1.41,3.14,3.14,3.14Z\" fill=\"__ACC__\"/><path d=\"M671.27,186.58c1.16,0,2.11-.95,2.11-2.11s-.95-2.11-2.11-2.11-2.11.95-2.11,2.11.95,2.11,2.11,2.11Z\" fill=\"__ACC__\"/><path d=\"M74.26,134.31c1.73,0,3.14-1.41,3.14-3.14s-1.41-3.14-3.14-3.14-3.14,1.41-3.14,3.14,1.41,3.14,3.14,3.14Z\" fill=\"__ACC__\"/><path d=\"M289.44,300.63c1.16,0,2.11-.95,2.11-2.11s-.95-2.11-2.11-2.11-2.11.95-2.11,2.11.95,2.11,2.11,2.11Z\" fill=\"__ACC__\"/><path d=\"M168.37,294.36c1.84,0,3.34-1.5,3.34-3.34s-1.5-3.34-3.34-3.34-3.34,1.5-3.34,3.34,1.5,3.34,3.34,3.34Z\" fill=\"__ACC__\"/><path d=\"M591.38,150.65c1.84,0,3.34-1.5,3.34-3.34s-1.5-3.34-3.34-3.34-3.34,1.5-3.34,3.34,1.5,3.34,3.34,3.34Z\" fill=\"__ACC__\"/><path d=\"M332.49,108.27c1.84,0,3.34-1.5,3.34-3.34s-1.5-3.34-3.34-3.34-3.34,1.5-3.34,3.34,1.5,3.34,3.34,3.34Z\" fill=\"__ACC__\"/>","bb":[[268.24,146.76,259.29,94.72],[482.16,121.18,132.6,48.78],[217.68,225.84,81.28,30.18],[293.86,125.26,60.39,22.6],[407.26,240.39,47.73,18],[200.12,209.5,46.63,16.9],[199.57,208.95,47.72,18],[540.3,169.41,73.91,11.2],[539.75,168.85,75,12.3],[322.82,147.31,30.88,11.2],[322.27,146.76,31.98,12.3],[321.86,240.93,99.67,36.14],[321.31,240.38,100.77,37.24],[614.21,147.53,21.88,21.88],[613.66,146.98,22.98,22.98],[635.54,168.86,110.89,1.1],[246.91,188.23,21.88,21.88],[246.36,187.68,22.98,22.98],[196.2,187.68,51.26,1.1],[246.67,255.47,21.88,21.88],[246.12,254.92,22.98,22.98],[246.12,276.8,1.1,59.76],[458.29,240.93,21.88,21.88],[457.74,240.38,22.98,22.98],[479.62,262.27,1.1,27.23],[361.19,115.58,31.73,31.73],[360.64,115.02,32.83,32.84],[392.37,77.12,1.1,39.01],[526.98,147.31,16.1,16.1],[526.43,146.76,17.2,17.2],[542.54,146.76,46.04,1.1],[298.41,226.4,14.54,14.54],[297.86,225.84,15.64,15.64],[312.4,225.85,34.04,1.1],[392.92,147.31,17.07,17.07],[392.37,146.76,18.17,18.17],[526.44,193.57,70.39,1.1],[232.17,240.97,14.5,14.5],[231.62,240.42,15.6,15.6],[268.24,172.38,51.72,1.1],[148.95,225.85,51.72,1.1],[355.4,277.07,28.17,28.17],[354.85,276.52,29.27,29.27],[516.11,101.91,19.81,19.81],[515.56,101.36,20.91,20.91],[285.96,172.93,19.81,19.81],[285.41,172.38,20.91,20.91],[198.95,119.97,73.91,11.2],[198.41,119.42,75.01,12.3],[230.04,97.27,22.71,22.71],[229.49,96.72,23.81,23.81],[73.71,130.62,125.79,1.1],[149.59,130.63,84.24,31.24],[177.08,131.17,21.88,21.88],[176.53,130.62,22.98,22.98],[176.53,152.5,1.1,59.76],[636.09,169.41,21.88,21.88],[635.54,168.85,22.98,22.98],[657.42,190.74,1.1,59.76],[392.37,163.83,57.78,1.1],[268.24,210.99,42.51,1.1],[410.7,141.71,36.96,5.6],[410.14,141.16,38.06,6.7],[697.19,150.09,19.32,19.32],[696.64,149.54,20.42,20.42],[157.76,171.8,19.32,19.32],[157.21,171.25,20.42,20.42],[479.62,252.08,57.78,1.1],[479.62,257.32,57.78,1.1],[458.91,262.55,57.79,1.1],[335.29,104.37,57.78,1.1],[335.29,109.61,57.78,1.1],[359.42,114.84,57.78,1.1],[162.58,203.46,1.1,62.38],[167.82,225.84,1.1,62.38],[173.06,225.84,1.1,62.38],[696.64,160.05,1.1,32.99],[701.88,168.86,1.1,32.99],[707.11,168.86,1.1,32.99],[140.47,121.51,9.66,9.66],[139.92,120.96,10.76,10.76],[232.72,140.44,31.08,1.1],[497.79,210.7,31.92,31.92],[193.69,151.36,19.92,19.92],[631.1,139.87,17.38,17.38],[261.95,272.27,8.44,8.44],[401.37,100.87,8.44,8.44],[132.42,155.53,4.22,4.22],[306.36,84.66,4.22,4.22],[499.43,289.35,4.22,4.22],[557.58,214.34,4.22,4.22],[132.12,216.72,19.34,19.34],[545.22,92.15,19.34,19.34],[408.54,308.05,14.9,14.9],[144.21,96.2,11.84,11.84],[508.63,221.54,10.24,10.24],[742.74,166.27,6.28,6.28],[669.16,182.36,4.22,4.22],[71.12,128.03,6.28,6.28],[287.33,296.41,4.22,4.22],[165.03,287.68,6.68,6.68],[588.04,143.97,6.68,6.68],[329.15,101.59,6.68,6.68]]},"trispeed":{"x":0,"y":0,"w":0,"h":0,"mk":"<path d=\"M357.46,267.81h-41.04c-.14,0-.27-.08-.35-.2-.07-.12-.07-.28,0-.4l20.52-35.54c.14-.25.55-.25.69,0l20.52,35.54c.07.12.07.28,0,.4-.07.12-.2.2-.35.2ZM317.11,267.01h39.66l-19.83-34.34-19.83,34.34Z\" fill=\"__INK__\"/><path d=\"M400.43,288.79h-77.42c-.14,0-.27-.08-.35-.2-.07-.12-.07-.28,0-.4l38.71-67.05c.14-.25.55-.25.69,0l38.71,67.05c.07.12.07.28,0,.4-.07.12-.2.2-.35.2ZM323.69,287.99h76.04l-38.02-65.85-38.02,65.85Z\" fill=\"__INK__\"/><path d=\"M406.23,228.87h-21.31c-.14,0-.27-.08-.35-.2-.07-.12-.07-.28,0-.4l10.65-18.45c.14-.25.55-.25.69,0l10.65,18.45c.07.12.07.28,0,.4s-.2.2-.35.2ZM385.61,228.07h19.93l-9.96-17.26-9.96,17.26Z\" fill=\"__INK__\"/><path d=\"M408.61,345.95c-.14,0-.27-.08-.35-.2l-17.23-29.84c-.07-.12-.07-.28,0-.4.07-.12.2-.2.35-.2h34.45c.14,0,.27.08.35.2.07.12.07.28,0,.4l-17.23,29.84c-.07.12-.2.2-.35.2ZM392.08,316.11l16.53,28.64,16.53-28.64h-33.07Z\" fill=\"__INK__\"/><path d=\"M391.38,375.79c-.07,0-.14-.02-.2-.05-.19-.11-.26-.35-.15-.55l29.69-51.42c.11-.19.35-.26.55-.15.19.11.26.35.15.55l-29.69,51.42c-.07.13-.21.2-.35.2Z\" fill=\"__INK__\"/><path d=\"M342.32,423.85c-.14,0-.27-.08-.35-.2l-27.75-48.07c-.07-.12-.07-.28,0-.4.07-.12.2-.2.35-.2h55.5c.14,0,.27.08.35.2.07.12.07.28,0,.4l-27.75,48.07c-.07.12-.2.2-.35.2ZM315.26,375.79l27.06,46.87,27.06-46.87h-54.12Z\" fill=\"__INK__\"/><path d=\"M391.38,375.79h-21.31c-.14,0-.27-.08-.35-.2-.07-.12-.07-.28,0-.4l10.65-18.45c.14-.25.55-.25.69,0l10.65,18.45c.07.12.07.28,0,.4-.07.12-.2.2-.35.2ZM370.77,374.99h19.93l-9.96-17.26-9.96,17.26Z\" fill=\"__INK__\"/><path d=\"M408.61,345.95h-34.45c-.14,0-.27-.08-.35-.2-.07-.12-.07-.28,0-.4l17.23-29.84c.14-.25.55-.25.69,0l17.23,29.84c.07.12.07.28,0,.4-.07.12-.2.2-.35.2ZM374.85,345.15h33.07l-16.53-28.64-16.53,28.64Z\" fill=\"__INK__\"/><path d=\"M507.55,271.53h-42.62c-.14,0-.27-.08-.35-.2-.07-.12-.07-.28,0-.4l21.31-36.91c.14-.25.55-.25.69,0l21.31,36.91c.07.12.07.28,0,.4-.07.12-.2.2-.35.2ZM465.62,270.73h41.23l-20.62-35.71-20.62,35.71Z\" fill=\"__INK__\"/><path d=\"M454.28,289.98c-.14,0-.27-.08-.35-.2l-10.65-18.45c-.07-.12-.07-.28,0-.4.07-.12.2-.2.35-.2h21.31c.14,0,.27.08.35.2.07.12.07.28,0,.4l-10.65,18.45c-.07.12-.2.2-.35.2ZM444.31,271.53l9.96,17.26,9.96-17.26h-19.93Z\" fill=\"__INK__\"/><path d=\"M421.81,309.31c-.14,0-.27-.08-.35-.2l-21.82-37.79c-.07-.12-.07-.28,0-.4.07-.12.2-.2.35-.2h43.63c.14,0,.27.08.35.2.07.12.07.28,0,.4l-21.81,37.79c-.07.12-.2.2-.35.2ZM400.68,271.53l21.12,36.59,21.12-36.59h-42.25Z\" fill=\"__INK__\"/><path d=\"M272.98,325.33h-26.32c-.14,0-.27-.08-.35-.2-.07-.12-.07-.28,0-.4l13.16-22.79c.14-.25.55-.25.69,0l13.16,22.79c.07.12.07.28,0,.4-.07.12-.2.2-.35.2ZM247.36,324.53h24.93l-12.47-21.59-12.47,21.59Z\" fill=\"__INK__\"/><path d=\"M246.67,325.33h-21.27c-.14,0-.27-.08-.35-.2-.07-.12-.07-.28,0-.4l10.64-18.42c.14-.25.55-.25.69,0l10.64,18.42c.07.12.07.28,0,.4-.07.12-.2.2-.35.2ZM226.09,324.53h19.89l-9.95-17.23-9.95,17.23Z\" fill=\"__INK__\"/><path d=\"M225.39,325.33c-.14,0-.27-.08-.35-.2l-10.64-18.42c-.07-.12-.07-.28,0-.4.07-.12.2-.2.35-.2h21.27c.14,0,.27.08.35.2.07.12.07.28,0,.4l-10.64,18.42c-.07.12-.2.2-.35.2ZM215.45,306.9l9.94,17.23,9.95-17.23h-19.89Z\" fill=\"__INK__\"/><path d=\"M526.32,310.74h-21.97c-.14,0-.27-.08-.35-.2-.07-.12-.07-.28,0-.4l10.98-19.03c.14-.25.55-.25.69,0l10.98,19.03c.07.12.07.28,0,.4-.07.12-.2.2-.35.2ZM505.04,309.95h20.58l-10.29-17.83-10.29,17.83Z\" fill=\"__INK__\"/><path d=\"M548.54,310.74h-22.13c-.22,0-.4-.18-.4-.4s.18-.4.4-.4h21.44l-10.72-18.5c-.11-.19-.05-.44.15-.55.19-.11.43-.05.55.15l11.07,19.1c.07.12.07.28,0,.4-.07.12-.2.2-.35.2Z\" fill=\"__INK__\"/><path d=\"M526.4,310.74c-.14,0-.27-.07-.35-.2l-11.07-19.1c-.07-.12-.07-.28,0-.4.07-.12.2-.2.35-.2h22.13c.22,0,.4.18.4.4s-.18.4-.4.4h-21.44l10.72,18.5c.11.19.05.44-.15.55-.06.04-.13.05-.2.05Z\" fill=\"__INK__\"/><path d=\"M662.41,310.74h-158.06c-.22,0-.4-.18-.4-.4s.18-.4.4-.4h158.06c.22,0,.4.18.4.4s-.18.4-.4.4Z\" fill=\"__INK__\"/><path d=\"M269.75,279.44c-.14,0-.27-.08-.35-.2l-17.23-29.84c-.07-.12-.07-.28,0-.4.07-.12.2-.2.35-.2h34.45c.14,0,.27.08.35.2.07.12.07.28,0,.4l-17.23,29.84c-.07.12-.2.2-.35.2ZM253.22,249.6l16.53,28.64,16.53-28.64h-33.07Z\" fill=\"__INK__\"/><path d=\"M304.21,249.6h-17.23c-.14,0-.27-.08-.35-.2-.07-.12-.07-.28,0-.4l8.61-14.92c.14-.25.55-.25.69,0l8.61,14.92c.07.12.07.28,0,.4-.07.12-.2.2-.35.2ZM287.67,248.81h15.84l-7.92-13.72-7.92,13.72Z\" fill=\"__INK__\"/><path d=\"M304.21,249.6h-170.02c-.22,0-.4-.18-.4-.4s.18-.4.4-.4h170.02c.22,0,.4.18.4.4s-.18.4-.4.4Z\" fill=\"__INK__\"/><path d=\"M269.75,279.44H88.07c-.22,0-.4-.18-.4-.4s.18-.4.4-.4h181.68c.22,0,.4.18.4.4s-.18.4-.4.4Z\" fill=\"__INK__\"/><path d=\"M248.68,435.67h-28.08c-.14,0-.27-.08-.35-.2-.07-.12-.07-.28,0-.4l14.04-24.32c.14-.25.55-.25.69,0l14.04,24.32c.07.12.07.28,0,.4-.07.12-.2.2-.35.2ZM221.29,434.87h26.7l-13.35-23.12-13.35,23.12Z\" fill=\"__INK__\"/><path d=\"M248.68,435.67c-.14,0-.27-.08-.35-.2l-21.31-36.91c-.07-.12-.07-.28,0-.4.07-.12.2-.2.35-.2h42.62c.14,0,.27.08.35.2.07.12.07.28,0,.4l-21.31,36.91c-.07.12-.2.2-.35.2ZM228.06,398.76l20.62,35.71,20.62-35.71h-41.23Z\" fill=\"__INK__\"/><path d=\"M269.99,398.72h-17.23c-.14,0-.27-.08-.35-.2s-.07-.28,0-.4l8.61-14.92c.14-.25.55-.25.69,0l8.61,14.92c.07.12.07.28,0,.4-.07.12-.2.2-.35.2ZM253.45,397.92h15.84l-7.92-13.72-7.92,13.72Z\" fill=\"__INK__\"/><path d=\"M287.21,398.72c-.07,0-.14-.02-.2-.05-.19-.11-.26-.35-.15-.55l8.27-14.32h-16.53c-.22,0-.4-.18-.4-.4s.18-.4.4-.4h17.23c.14,0,.27.08.35.2.07.12.07.28,0,.4l-8.61,14.92c-.07.13-.21.2-.35.2Z\" fill=\"__INK__\"/><path d=\"M287.21,398.72h-17.23c-.14,0-.27-.08-.35-.2-.07-.12-.07-.28,0-.4l8.61-14.92c.11-.19.35-.26.55-.15.19.11.26.35.15.55l-8.27,14.32h16.53c.22,0,.4.18.4.4s-.18.4-.4.4Z\" fill=\"__INK__\"/><path d=\"M227.37,398.76H68.09c-.22,0-.4-.18-.4-.4s.18-.4.4-.4h159.28c.22,0,.4.18.4.4s-.18.4-.4.4Z\" fill=\"__INK__\"/><path d=\"M489.09,331.03h-34.45c-.14,0-.27-.08-.35-.2-.07-.12-.07-.28,0-.4l17.23-29.84c.14-.25.55-.25.69,0l17.23,29.84c.07.12.07.28,0,.4-.07.12-.2.2-.35.2ZM455.33,330.23h33.07l-16.53-28.64-16.53,28.64Z\" fill=\"__INK__\"/><path d=\"M489.09,331.03h-34.45c-.22,0-.4-.18-.4-.4s.18-.4.4-.4h34.45c.22,0,.4.18.4.4s-.18.4-.4.4Z\" fill=\"__INK__\"/><path d=\"M740.7,331.03h-251.62c-.22,0-.4-.18-.4-.4s.18-.4.4-.4h251.62c.22,0,.4.18.4.4s-.18.4-.4.4Z\" fill=\"__INK__\"/><path d=\"M425.84,212.92c-.14,0-.27-.08-.35-.2l-17.23-29.84c-.07-.12-.07-.28,0-.4.07-.12.2-.2.35-.2h34.45c.14,0,.27.08.35.2.07.12.07.28,0,.4l-17.23,29.84c-.07.12-.2.2-.35.2ZM409.3,183.08l16.53,28.64,16.53-28.64h-33.07Z\" fill=\"__INK__\"/><path d=\"M446.76,249.16c-.14,0-.27-.08-.35-.2l-10.98-19.03c-.07-.12-.07-.28,0-.4.07-.12.2-.2.35-.2h21.97c.14,0,.27.08.35.2.07.12.07.28,0,.4l-10.98,19.03c-.07.12-.2.2-.35.2ZM436.47,230.14l10.29,17.83,10.29-17.83h-20.58Z\" fill=\"__INK__\"/><path d=\"M476.83,203.69c-.14,0-.27-.07-.35-.2l-11.9-20.61c-.11-.19-.05-.44.15-.55s.44-.05.55.15l11.9,20.61c.11.19.05.44-.15.55-.06.04-.13.05-.2.05Z\" fill=\"__INK__\"/><path d=\"M435.78,230.14c-.14,0-.27-.07-.35-.2l-27.17-47.06c-.11-.19-.04-.44.15-.55.19-.11.43-.05.55.15l27.17,47.06c.11.19.05.44-.15.55-.06.04-.13.05-.2.05Z\" fill=\"__INK__\"/><path d=\"M447.15,212.92h-21.31c-.14,0-.27-.08-.35-.2-.07-.12-.07-.28,0-.4l10.65-18.45c.14-.25.55-.25.69,0l10.65,18.45c.07.12.07.28,0,.4-.07.12-.2.2-.35.2ZM426.53,212.12h19.93l-9.96-17.26-9.96,17.26Z\" fill=\"__INK__\"/><path d=\"M485.45,218.59h-17.23c-.14,0-.27-.08-.35-.2-.07-.12-.07-.28,0-.4l8.61-14.92c.14-.25.55-.25.69,0l8.61,14.92c.07.12.07.28,0,.4-.07.12-.2.2-.35.2ZM468.91,217.79h15.84l-7.92-13.72-7.92,13.72Z\" fill=\"__INK__\"/><path d=\"M400,198c-.14,0-.27-.07-.35-.2l-8.61-14.92c-.07-.12-.07-.28,0-.4.07-.12.2-.2.35-.2h17.23c.22,0,.4.18.4.4s-.18.4-.4.4h-16.53l8.27,14.32c.11.19.04.44-.15.55-.06.04-.13.05-.2.05Z\" fill=\"__INK__\"/><path d=\"M417.22,198h-17.23c-.22,0-.4-.18-.4-.4s.18-.4.4-.4h16.53l-8.27-14.32c-.11-.19-.04-.44.15-.55.19-.11.43-.05.55.15l8.61,14.92c.07.12.07.28,0,.4-.07.12-.2.2-.35.2Z\" fill=\"__INK__\"/><path d=\"M464.93,183.08h-73.55c-.22,0-.4-.18-.4-.4s.18-.4.4-.4h73.55c.22,0,.4.18.4.4s-.18.4-.4.4Z\" fill=\"__INK__\"/><path d=\"M718.52,230.14h-282.74c-.22,0-.4-.18-.4-.4s.18-.4.4-.4h282.74c.22,0,.4.18.4.4s-.18.4-.4.4Z\" fill=\"__INK__\"/><path d=\"M771.68,203.69h-294.85c-.22,0-.4-.18-.4-.4s.18-.4.4-.4h294.85c.22,0,.4.18.4.4s-.18.4-.4.4Z\" fill=\"__INK__\"/><path d=\"M802.66,218.59h-317.24c-.22,0-.4-.18-.4-.4s.18-.4.4-.4h317.24c.22,0,.4.18.4.4s-.18.4-.4.4Z\" fill=\"__INK__\"/><path d=\"M348.75,361.71h-42.62c-.14,0-.27-.08-.35-.2-.07-.12-.07-.28,0-.4l21.31-36.91c.14-.25.55-.25.69,0l21.31,36.91c.07.12.07.28,0,.4-.07.12-.2.2-.35.2ZM306.82,360.91h41.23l-20.62-35.71-20.62,35.71Z\" fill=\"__INK__\"/><path d=\"M306.13,361.71c-.14,0-.27-.08-.35-.2l-10.65-18.45c-.07-.12-.07-.28,0-.4.07-.12.2-.2.35-.2h21.31c.14,0,.27.08.35.2.07.12.07.28,0,.4l-10.65,18.45c-.07.12-.2.2-.35.2ZM296.17,343.26l9.96,17.26,9.96-17.26h-19.93Z\" fill=\"__INK__\"/><path d=\"M306.13,361.71h-155.95c-.22,0-.4-.18-.4-.4s.18-.4.4-.4h155.95c.22,0,.4.18.4.4s-.18.4-.4.4Z\" fill=\"__INK__\"/><path d=\"M576.82,281.66c-.14,0-.27-.08-.35-.2l-8.61-14.92c-.07-.12-.07-.28,0-.4.07-.12.2-.2.35-.2h17.23c.14,0,.27.08.35.2.07.12.07.28,0,.4l-8.61,14.92c-.07.12-.2.2-.35.2ZM568.9,266.74l7.92,13.72,7.92-13.72h-15.84Z\" fill=\"__INK__\"/><path d=\"M559.59,281.66h-17.23c-.14,0-.27-.08-.35-.2-.07-.12-.07-.28,0-.4l8.61-14.92c.11-.19.36-.26.55-.15.19.11.26.35.15.55l-8.27,14.32h16.53c.22,0,.4.18.4.4s-.18.4-.4.4Z\" fill=\"__INK__\"/><path d=\"M559.59,281.66c-.07,0-.14-.02-.2-.05-.19-.11-.26-.35-.15-.55l8.27-14.32h-16.53c-.22,0-.4-.18-.4-.4s.18-.4.4-.4h17.23c.14,0,.27.08.35.2.07.12.07.28,0,.4l-8.61,14.92c-.07.13-.21.2-.35.2Z\" fill=\"__INK__\"/><path d=\"M660.44,252.36h-17.23c-.14,0-.27-.08-.35-.2-.07-.12-.07-.28,0-.4l8.61-14.92c.11-.19.35-.26.55-.15.19.11.26.35.15.55l-8.27,14.32h16.53c.22,0,.4.18.4.4s-.18.4-.4.4Z\" fill=\"__INK__\"/><path d=\"M660.44,252.36c-.07,0-.14-.02-.2-.05-.19-.11-.26-.35-.15-.55l8.27-14.32h-16.53c-.22,0-.4-.18-.4-.4s.18-.4.4-.4h17.23c.14,0,.27.08.35.2.07.12.07.28,0,.4l-8.61,14.92c-.07.13-.21.2-.35.2Z\" fill=\"__INK__\"/><path d=\"M757.99,266.74h-172.55c-.22,0-.4-.18-.4-.4s.18-.4.4-.4h172.55c.22,0,.4.18.4.4s-.18.4-.4.4Z\" fill=\"__INK__\"/>","bb":[[316.02,231.48,41.84,36.33],[322.61,220.95,78.22,67.84],[384.52,209.63,22.09,19.24],[390.98,315.31,35.26,30.64],[390.98,323.57,30.49,52.22],[314.17,374.98,56.31,48.87],[369.67,356.55,22.1,19.24],[373.76,315.32,35.26,30.63],[464.53,233.83,43.42,37.7],[443.23,270.73,22.12,19.25],[399.59,270.72,44.44,38.59],[246.26,301.75,27.12,23.58],[225,306.12,22.08,19.21],[214.35,306.11,22.08,19.22],[503.95,290.92,22.75,19.82],[526.01,290.84,22.94,19.9],[514.93,290.84,22.93,19.9],[503.95,309.94,158.86,0.8],[252.12,248.8,35.26,30.64],[286.58,233.89,18.02,15.71],[133.79,248.8,170.82,0.8],[87.67,278.64,182.48,0.8],[220.2,410.56,28.88,25.11],[226.97,397.96,43.43,37.71],[252.35,383.01,18.02,15.71],[278.2,383,18.03,15.72],[269.58,383,18.02,15.72],[67.69,397.96,160.08,0.8],[454.24,300.4,35.26,30.63],[454.24,330.23,35.25,0.8],[488.68,330.23,252.42,0.8],[408.21,182.28,35.26,30.64],[435.38,229.33,22.78,19.83],[464.53,182.28,12.71,21.41],[408.21,182.28,27.98,47.86],[425.44,193.68,22.09,19.24],[467.82,202.88,18.01,15.71],[390.99,182.28,18.03,15.72],[399.59,182.28,18.02,15.72],[390.98,182.28,74.35,0.8],[435.38,229.34,283.54,0.8],[476.43,202.89,295.65,0.8],[485.02,217.79,318.04,0.8],[305.73,324.01,43.42,37.7],[295.08,342.46,22.11,19.25],[149.78,360.91,156.75,0.8],[567.81,265.94,18.03,15.72],[541.96,265.94,18.02,15.72],[550.58,265.94,18.03,15.72],[642.81,236.64,18.02,15.72],[651.43,236.64,18.03,15.72],[585.04,265.94,173.35,0.8]]}};
