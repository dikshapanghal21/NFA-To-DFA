export interface NFA{states:string[];alphabet:string[];start:string;finals:string[];delta:Record<string,Record<string,string[]>>}
export interface DFAState{name:string;subset:string[];accepting:boolean}
export interface Step{kind:'init'|'pick'|'compute'|'union'|'check'|'enqueue'|'done'|'accept'|'final';text:string;current?:string;symbol?:string;target?:string}
export interface DFA{states:DFAState[];start:string;alphabet:string[];delta:Record<string,Record<string,string>>;steps:Step[];hasDead:boolean}
