#!/usr/bin/env node
// CEFR level check against the Profilo della lingua italiana lexical inventory (SPEC §7).
//   node dict/profilo-check.js          # report mismatches
//   node dict/profilo-check.js --apply  # align matched entries to their Profilo level
// Reference lists in dict/ref/profilo_{a1,a2,b1,b2}.txt (lemma per line), extracted from the
// official per-level pages at unistrapg.it/profilo_lingua_italiana (Perugia CVCL; Spinelli &
// Parizzi). Cumulative: a word's level = the lowest list it appears in. A1 is mapped to A2
// because the deck's floor is A2. Profilo is the pedagogical authority, so unlike KELLY it is
// trusted in BOTH directions (raise under-leveled AND lower over-leveled). See dict/LEVELS.md.
const fs=require("fs"), path=require("path");
const APPLY=process.argv.includes("--apply");
const ref=f=>fs.readFileSync(path.join(__dirname,"ref",f),"utf8").split("\n").map(s=>s.trim().toLowerCase()).filter(Boolean);
const prof=new Map();
for(const [file,lvl] of [["profilo_a1.txt","A2"],["profilo_a2.txt","A2"],["profilo_b1.txt","B1"],["profilo_b2.txt","B2"]])
  for(const w of ref(file)) if(!prof.has(w)) prof.set(w,lvl);
const stripArt=s=>s.toLowerCase().trim().replace(/^(l'|un'|il |lo |la |i |gli |le |un |uno |una |del |dello |della |dei |degli |delle )/,"").trim();
function cands(word){
  let s=stripArt(word); const t=s.split(/\s+/); const c=new Set([s,t[0]]);
  for(const x of [t[0],s]){
    if(/arsi$/.test(x))c.add(x.slice(0,-3)+"are"); if(/ersi$/.test(x))c.add(x.slice(0,-3)+"ere"); if(/irsi$/.test(x))c.add(x.slice(0,-3)+"ire");
    if(/i$/.test(x)){c.add(x.slice(0,-1)+"o");c.add(x.slice(0,-1)+"e");}
  }
  return [...c];
}
const plevel=w=>{ for(const c of cands(w)) if(prof.has(c)) return prof.get(c); return null; };
let matched=0, changed=0;
for(const f of ["words.json","dict/master.json"]){
  const p=path.join(__dirname,"..",f), arr=JSON.parse(fs.readFileSync(p,"utf8"));
  for(const e of arr){ const lv=plevel(e.it.word); if(lv==null) continue;
    if(f==="words.json"){ matched++; if(lv!==e.level) changed++; }
    if(APPLY) e.level=lv;
  }
  if(APPLY) fs.writeFileSync(p,JSON.stringify(arr,null,2)+"\n");
}
console.log(`Matched to Profilo: ${matched} | mismatches ${changed} ${APPLY?"APPLIED":"(run with --apply to align)"}`);
