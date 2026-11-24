import {NFA,DFA,DFAState,Step} from './types'
import {normalize} from './validation'
export const canon=(s:Iterable<string>,order:string[])=>{const x=new Set(s);return order.filter(q=>x.has(q))}
export const label=(s:string[])=>s.length?`{${s.join(',')}}`:'∅'
export const move=(n:NFA,q:string,a:string)=>n.delta[q]?.[a]??[]
export function stepSubset(n:NFA,S:string[],a:string){
  const u=new Set<string>();S.forEach(q=>move(n,q,a).forEach(d=>u.add(d)));return canon(u,n.states)
}
export function convert(raw:NFA):DFA{
  const n=normalize(raw);const key=(s:string[])=>s.join('\u0000')
  const start=canon([n.start],n.states);const states:DFAState[]=[];const delta:DFA['delta']={};const steps:Step[]=[]
  const seen=new Map<string,string>();const queue:string[][]=[]
  const add=(s:string[])=>{const nm=label(s);seen.set(key(s),nm);states.push({name:nm,subset:s,accepting:s.some(q=>n.finals.includes(q))});queue.push(s);return nm}
  const sn=add(start)
  steps.push({kind:'init',current:sn,text:`q0' = {q0} = ${sn}. Queue = [${sn}].`})
  while(queue.length){
    const S=queue.shift()!;const sl=label(S);delta[sl]={}
    steps.push({kind:'pick',current:sl,text:`Dequeue ${sl}. Process it on each symbol of Σ = {${n.alphabet.join(', ')}}.`})
    for(const a of n.alphabet){
      const parts=S.map(q=>({q,d:move(n,q,a)}))
      steps.push({kind:'compute',current:sl,symbol:a,text:S.length?parts.map(p=>`δ(${p.q},${a}) = ${label(p.d)}`).join('; '):`δ(∅,${a}) = ∅ (the empty set has no states)`})
      const T=stepSubset(n,S,a);const tl=label(T)
      steps.push({kind:'union',current:sl,symbol:a,target:tl,text:`δ'(${sl},${a}) = ${S.length?parts.map(p=>label(p.d)).join(' ∪ '):'∅'} = ${tl}`})
      const isNew=!seen.has(key(T))
      steps.push({kind:'check',current:sl,symbol:a,target:tl,text:`${tl} is ${isNew?'NEW (not yet discovered)':'already discovered'}.`})
      if(isNew){add(T);steps.push({kind:'enqueue',current:sl,symbol:a,target:tl,text:`Add ${tl} to the DFA states and queue.${T.length?'':' It is the dead state ∅.'}`})}
      delta[sl][a]=tl
    }
  }
  steps.push({kind:'done',text:`Queue empty: all ${states.length} reachable DFA states processed.`})
  const acc=states.filter(s=>s.accepting)
  steps.push({kind:'accept',text:acc.length?`Accepting states (contain a final NFA state from F={${n.finals.join(',')}}): ${acc.map(s=>s.name).join(', ')}`:'No DFA state contains a final NFA state, so F\' = ∅.'})
  steps.push({kind:'final',text:`Final DFA: ${states.length} states, ${states.length*n.alphabet.length} transitions.`})
  return {states,start:sn,alphabet:n.alphabet,delta,steps,hasDead:states.some(s=>!s.subset.length)}
}
