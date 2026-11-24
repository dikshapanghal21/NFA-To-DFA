import {NFA} from '../algorithms/types'
export interface Sample{name:string;description:string;nfa:NFA;accept:string[];reject:string[]}
const d=(o:Record<string,Record<string,string[]>>)=>o
export const samples:Sample[]=[
{name:'Ends with 01',description:'Accepts binary strings ending in 01.',
 nfa:{states:['q0','q1','q2'],alphabet:['0','1'],start:'q0',finals:['q2'],delta:d({q0:{'0':['q0','q1'],'1':['q0']},q1:{'1':['q2']},q2:{}})},accept:['01','1101','001'],reject:['','10','11']},
{name:'Third symbol from end is 1',description:'Classic NFA whose DFA needs 2³ = 8 states.',
 nfa:{states:['q0','q1','q2','q3'],alphabet:['0','1'],start:'q0',finals:['q3'],delta:d({q0:{'0':['q0'],'1':['q0','q1']},q1:{'0':['q2'],'1':['q2']},q2:{'0':['q3'],'1':['q3']},q3:{}})},accept:['100','0110','111'],reject:['','011','00']},
{name:'Contains 11 or ends in 0 (dead state demo)',description:'Missing transitions produce the dead state ∅.',
 nfa:{states:['A','B','C'],alphabet:['a','b'],start:'A',finals:['C'],delta:d({A:{a:['B']},B:{a:['C'],b:['B']},C:{}})},accept:['aa','aba','abbba'],reject:['','a','b','aab']},
{name:'Initial state accepting',description:'q0 is final, so ε is accepted.',
 nfa:{states:['q0','q1'],alphabet:['0','1'],start:'q0',finals:['q0'],delta:d({q0:{'0':['q1']},q1:{'0':['q0','q1'],'1':['q1']}})},accept:['','00','010'],reject:['0','1']}
]
