// Procura comentários // que "engolem" código: depois do // aparece algo com cara de instrução JS.
const fs=require('fs'),path=require('path');
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):e.name.endsWith('.js')?[path.join(d,e.name)]:[])}
const CODE=/(\b[A-Za-z_$][\w$]*\.[A-Za-z_$][\w$]*\s*(=[^=>]|\+\+|\+=|-=)|\)\s*;\s*[A-Za-z_$][\w$.]*\s*[(=]|;\s*(if|for|const|let|return)\b[\s(])/;
for(const f of walk(process.argv[2])){
 fs.readFileSync(f,'utf8').split('\n').forEach((ln,i)=>{
  // acha // fora de string (heurística simples: ignora "://" de URLs e // dentro de aspas na mesma linha)
  let q=null,idx=-1;for(let k=0;k<ln.length-1;k++){const c=ln[k];if(q){if(c==='\\'){k++;continue}if(c===q)q=null;continue}if(c==='"'||c==="'"||c==='`'){q=c;continue}if(c==='/'&&ln[k+1]==='/'&&ln[k-1]!==':'){idx=k;break}if(c==='/'&&ln[k+1]==='*'){const j=ln.indexOf('*/',k+2);if(j<0)break;k=j+1}}
  if(idx<0)return;const com=ln.slice(idx+2);
  if(CODE.test(com))console.log(path.relative(process.argv[2],f)+':'+(i+1)+': '+com.trim().slice(0,150));
 });
}
