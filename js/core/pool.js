// Mage Animals — Object Pooling: reutiliza objetos de partículas, feixes, anéis, textos, luzes e inimigos
// para não alocar/descartar memória a cada quadro (menos pausas do Garbage Collector em celulares fracos).
'use strict';

class Pool{
 constructor(factory,prealloc=0){this.factory=factory;this.free=[];for(let i=0;i<prealloc;i++)this.free.push(factory())}
 get(){return this.free.length?this.free.pop():this.factory()}
 put(o){this.free.push(o)}
}

// Remove os itens "mortos" de uma lista ativa sem criar arrays novos (compactação in-place)
// e devolve-os ao pool. `alive` deve ser uma função fixa (criada uma vez), não uma closure por quadro.
function sweep(list,pool,alive){
 let w=0;
 for(let i=0;i<list.length;i++){const o=list[i];if(alive(o))list[w++]=o;else pool.put(o)}
 list.length=w;
}

// Remoção O(1) por troca com o último (a ordem de desenho dos inimigos não importa)
function removeSwap(list,o){const i=list.indexOf(o);if(i<0)return false;list[i]=list[list.length-1];list.pop();return true}

// Devolve todos os itens de uma lista ao pool (troca de partida)
function drain(list,pool){for(let i=0;i<list.length;i++)pool.put(list[i]);list.length=0}

// ---------- pools do jogo ----------
const P_POOL=new Pool(()=>({type:0,x:0,y:0,vx:0,vy:0,life:0,max:1,col:'#fff',s:1,drag:0,g:0,rot:0,vr:0,grow:0}),900);
const BEAM_POOL=new Pool(()=>({x1:0,y1:0,x2:0,y2:0,col:'#fff',life:0,max:1,zig:false,meteor:false,seed:0}),24);
const RING_POOL=new Pool(()=>({x:0,y:0,r:0,R:0,life:0,max:1,col:'#fff'}),32);
const TEXT_POOL=new Pool(()=>({x:0,y:0,txt:'',col:'#fff',size:16,life:0}),24);
const LIGHT_POOL=new Pool(()=>({x:0,y:0,col:'#fff',life:0,max:1,R:100}),24);
const ENEMY_POOL=new Pool(()=>({kind:'rock',art:'rock',v:0,x:0,y:0,px:0,py:0,age:0,r:20,hp:1,maxHp:1,t:0,flash:0,boost:0,vx:0,vy:0,latT:0,latF:1,latA:0,nw:'',word:'',typed:0,lw:0,dw:0,startT:null}),24);

// predicados fixos (sem closures por quadro)
const ALIVE=o=>o.life>0;
