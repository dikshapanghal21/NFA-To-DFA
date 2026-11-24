import {DFA} from './types'
export interface DFARun{error?:string;trace:string[];accepted:boolean}
export function simulateDFA(d:DFA,w:string):DFARun{
  const bad=[...w].find(c=>!d.alphabet.includes(c))
  if(bad!==undefined)return {error:`Symbol "${bad}" is not in Σ.`,trace:[],accepted:false}
  let cur=d.start;const trace=[cur]
  for(const c of w){cur=d.delta[cur][c];trace.push(cur)}
  return {trace,accepted:!!d.states.find(s=>s.name===cur)?.accepting}
}
