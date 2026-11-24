import {NFA} from './types'
import {stepSubset,canon} from './nfaToDfa'
export interface NFARun{error?:string;trace:string[][];accepted:boolean}
export function simulateNFA(n:NFA,w:string):NFARun{
  const bad=[...w].find(c=>!n.alphabet.includes(c))
  if(bad!==undefined)return {error:`Symbol "${bad}" is not in Σ.`,trace:[],accepted:false}
  let cur=canon([n.start],n.states);const trace=[cur]
  for(const c of w){cur=stepSubset(n,cur,c);trace.push(cur)}
  return {trace,accepted:cur.some(q=>n.finals.includes(q))}
}
