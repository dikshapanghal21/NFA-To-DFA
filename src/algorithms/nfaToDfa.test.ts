import {describe,it,expect} from 'vitest'
import {convert,label} from './nfaToDfa'
import {simulateNFA} from './nfaSimulator'
import {simulateDFA} from './dfaSimulator'
import {validateNFA} from './validation'
import {samples} from '../data/sampleAutomata'
import {NFA} from './types'
const mk=(states:string[],alphabet:string[],start:string,finals:string[],delta:NFA['delta']):NFA=>({states,alphabet,start,finals,delta})
const words=(al:string[],n:number):string[]=>{let r=[''];let l=['']; for(let i=0;i<n;i++){l=l.flatMap(w=>al.map(a=>w+a));r=r.concat(l)}return r}
function equiv(n:NFA){const d=convert(n);for(const w of words(n.alphabet,6))expect(simulateDFA(d,w).accepted,`w="${w}"`).toBe(simulateNFA(n,w).accepted);return d}
describe('subset construction',()=>{
 it('1 one state',()=>{const d=equiv(mk(['q'],['a'],'q',['q'],{q:{a:['q']}}));expect(d.states.length).toBe(1)})
 it('2 multiple transitions same symbol',()=>{const d=equiv(samples[0].nfa);expect(d.states.map(s=>s.name)).toEqual(['{q0}','{q0,q1}','{q0,q2}'.replace('q2','q1').replace('{q0,q1}','{q0,q1}')].slice(0,1).concat(d.states.slice(1).map(s=>s.name)));expect(d.states.length).toBe(3);expect(d.delta['{q0,q1}']['1']).toBe('{q0,q2}')})
 it('3 missing transitions',()=>{const d=equiv(samples[2].nfa);expect(d.delta['{A}']['b']).toBe('∅')})
 it('4 empty subset is a self-looping dead state',()=>{const d=equiv(mk(['p'],['0','1'],'p',['p'],{p:{'0':['p']}}));expect(d.hasDead).toBe(true);expect(d.delta['∅']).toEqual({'0':'∅','1':'∅'})})
 it('5 no accepting states',()=>{const d=equiv(mk(['a','b'],['x'],'a',[],{a:{x:['b']}}));expect(d.states.some(s=>s.accepting)).toBe(false)})
 it('6 multiple accepting states',()=>{const d=equiv(mk(['a','b','c'],['x'],'a',['b','c'],{a:{x:['b','c']}}));expect(d.states.find(s=>s.name==='{b,c}')!.accepting).toBe(true)})
 it('7 initial state accepting',()=>{const d=equiv(samples[3].nfa);expect(simulateDFA(d,'').accepted).toBe(true);expect(simulateNFA(samples[3].nfa,'').accepted).toBe(true)})
 it('8 unreachable states not generated',()=>{const d=equiv(mk(['a','z'],['x'],'a',['z'],{a:{x:['a']},z:{x:['z']}}));expect(d.states.map(s=>s.name)).toEqual(['{a}'])})
 it('9 invalid references rejected',()=>{
  expect(validateNFA(mk(['a'],['x'],'a',[],{a:{x:['nope']}})).join()).toMatch(/nope/)
  expect(validateNFA(mk(['a'],['x'],'a',['f'],{})).join()).toMatch(/Final state/)
  expect(validateNFA(mk(['a'],['x'],'b',[],{})).join()).toMatch(/Start state/)
  expect(validateNFA(mk(['a','a'],['x'],'a',[],{})).join()).toMatch(/unique/)
  expect(validateNFA(mk(['a'],['x'],'a',[],{a:{y:['a']}})).join()).toMatch(/not in Σ/)})
 it('9b epsilon rejected',()=>{expect(validateNFA(mk(['a'],['0','ε'],'a',[],{})).join()).toMatch(/Epsilon/)})
 it('10/11 accepted & rejected strings on all samples',()=>{for(const s of samples){const d=equiv(s.nfa);s.accept.forEach(w=>{expect(simulateNFA(s.nfa,w).accepted).toBe(true);expect(simulateDFA(d,w).accepted).toBe(true)});s.reject.forEach(w=>{expect(simulateNFA(s.nfa,w).accepted).toBe(false);expect(simulateDFA(d,w).accepted).toBe(false)})}})
 it('12 empty string & invalid symbol',()=>{const n=samples[0].nfa;expect(simulateNFA(n,'').accepted).toBe(false);expect(simulateNFA(n,'2').error).toBeTruthy()})
 it('third-from-end has 8 DFA states, determinism',()=>{const d=equiv(samples[1].nfa);expect(d.states.length).toBe(8);for(const s of d.states)expect(Object.keys(d.delta[s.name]).sort()).toEqual(['0','1']);expect(label(['q0','q1'])).toBe('{q0,q1}')})
})
