import {NFA} from './types'
const EPS=['ε','epsilon','eps','λ','lambda','e']
export const isEps=(s:string)=>EPS.includes(s.trim().toLowerCase())||EPS.includes(s.trim())
export function normalize(n:NFA):NFA{
  const t=(a:string[])=>a.map(s=>s.trim())
  return {...n,states:t(n.states).filter(Boolean),alphabet:t(n.alphabet).filter(Boolean),start:n.start.trim(),finals:t(n.finals)}
}
export function validateNFA(raw:NFA):string[]{
  const n=normalize(raw);const e:string[]=[]
  if(!n.states.length)e.push('Add at least one state.')
  if(new Set(n.states).size!==n.states.length)e.push('State names must be unique.')
  if(!n.alphabet.length)e.push('Add at least one input symbol.')
  if(new Set(n.alphabet).size!==n.alphabet.length)e.push('Alphabet symbols must be unique.')
  n.alphabet.forEach(a=>{if(isEps(a))e.push(`Epsilon transitions are not supported (symbol "${a}"). This simulator converts standard NFAs only.`)})
  if(!n.start)e.push('Select exactly one start state.')
  else if(!n.states.includes(n.start))e.push(`Start state "${n.start}" is not in Q.`)
  n.finals.forEach(f=>{if(!n.states.includes(f))e.push(`Final state "${f}" is not in Q.`)})
  for(const [q,row] of Object.entries(n.delta)){
    if(!n.states.includes(q)){if(Object.values(row).some(d=>d.length))e.push(`Transition source "${q}" is not in Q.`);continue}
    for(const [a,ds] of Object.entries(row)){
      if(!ds.length)continue
      if(isEps(a))e.push(`Epsilon transition from "${q}" is not supported.`)
      else if(!n.alphabet.includes(a))e.push(`Symbol "${a}" (from ${q}) is not in Σ.`)
      ds.forEach(d=>{if(!n.states.includes(d))e.push(`Destination "${d}" (δ(${q},${a})) is not in Q.`)})
    }
  }
  return [...new Set(e)]
}
export function parseCell(s:string):string[]{
  const t=s.trim();if(!t||t==='∅'||t==='{}')return []
  return [...new Set(t.replace(/[{}]/g,'').split(',').map(x=>x.trim()).filter(Boolean))]
}
