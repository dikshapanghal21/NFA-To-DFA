import {useMemo,useState,useEffect} from 'react'
import {Play,Pause,SkipBack,SkipForward,RotateCcw,CheckCircle2,AlertTriangle,Trash2,Plus} from 'lucide-react'
import {NFA,DFA} from './algorithms/types'
import {validateNFA,parseCell,normalize} from './algorithms/validation'
import {convert,label} from './algorithms/nfaToDfa'
import {simulateNFA} from './algorithms/nfaSimulator'
import {simulateDFA} from './algorithms/dfaSimulator'
import {samples} from './data/sampleAutomata'
const tabs=['Dashboard','NFA Input','Simulator','Diagrams','DFA Table','String Testing','Theory']
const empty:NFA={states:['q0'],alphabet:['0','1'],start:'q0',finals:[],delta:{}}
const cx='rounded-xl bg-white shadow-sm border border-sky-100 p-5'
const btn='inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-40 '
const pri=btn+'bg-[#0f2a5c] text-white hover:bg-[#1b3d80]',sec=btn+'bg-sky-50 text-[#0f2a5c] hover:bg-sky-100 border border-sky-200'
export default function App(){
  const [tab,setTab]=useState(0)
  const [nfa,setNfa]=useState<NFA>(()=>{try{return JSON.parse(localStorage.getItem('nfa')||'')}catch{return samples[0].nfa}})
  const [errs,setErrs]=useState<string[]|null>(null)
  const [dfa,setDfa]=useState<DFA|null>(null)
  const [step,setStep]=useState(0);const [play,setPlay]=useState(false)
  useEffect(()=>{try{localStorage.setItem('nfa',JSON.stringify(nfa))}catch{}},[nfa])
  useEffect(()=>{if(!play||!dfa)return;const t=setInterval(()=>setStep(s=>{if(s>=dfa.steps.length-1){setPlay(false);return s}return s+1}),1100);return()=>clearInterval(t)},[play,dfa])
  const edit=(n:NFA)=>{setNfa(n);setDfa(null);setErrs(null);setStep(0);setPlay(false)}
  const validate=()=>{const e=validateNFA(nfa);setErrs(e);return e.length===0}
  const run=()=>{if(!validate()){setTab(1);return}const n=normalize(nfa);setNfa(n);setDfa(convert(n));setStep(0);setPlay(false);setTab(2)}
  return <div className="min-h-screen bg-[#f3f8fd] text-slate-800">
    <header className="bg-[#0f2a5c] text-white"><div className="mx-auto max-w-6xl px-4 py-3">
      <h1 className="text-lg font-semibold">NFA to DFA Conversion Simulator</h1>
      <nav className="mt-2 flex gap-1 overflow-x-auto">{tabs.map((t,i)=><button key={t} onClick={()=>setTab(i)} className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm ${tab===i?'bg-white text-[#0f2a5c] font-medium':'text-sky-100 hover:bg-white/10'}`}>{t}</button>)}</nav></div></header>
    <main className="mx-auto max-w-6xl space-y-4 px-4 py-6">
      {tab===0&&<Dash go={setTab} load={s=>{edit(s);setTab(1)}}/>}
      {tab===1&&<Input nfa={nfa} edit={edit} errs={errs} validate={validate} run={run}/>}
      {tab>=2&&tab<=5&&!dfa&&<div className={cx}>No conversion yet. <button className={pri} onClick={run}>Convert current NFA</button></div>}
      {tab===2&&dfa&&<Sim dfa={dfa} step={step} setStep={setStep} play={play} setPlay={setPlay}/>}
      {tab===3&&dfa&&<div className="grid gap-4 md:grid-cols-2"><Diagram title="NFA" nodes={nfa.states.map(s=>({id:s,acc:nfa.finals.includes(s)}))} start={nfa.start} edges={nfa.states.flatMap(q=>Object.entries(nfa.delta[q]??{}).flatMap(([a,ds])=>ds.map(d=>[q,d,a] as [string,string,string])))}/><Diagram title="DFA" nodes={dfa.states.map(s=>({id:s.name,acc:s.accepting}))} start={dfa.start} edges={dfa.states.flatMap(s=>dfa.alphabet.map(a=>[s.name,dfa.delta[s.name][a],a] as [string,string,string]))}/></div>}
      {tab===4&&dfa&&<Table nfa={nfa} dfa={dfa}/>}
      {tab===5&&dfa&&<Testing nfa={nfa} dfa={dfa}/>}
      {tab===6&&<Theory/>}
    </main></div>
}
function Dash({go,load}:{go:(n:number)=>void;load:(n:NFA)=>void}){return <>
  <div className={cx}><h2 className="text-2xl font-semibold text-[#0f2a5c]">Convert any NFA into an equivalent DFA, one step at a time</h2>
  <p className="mt-2 max-w-2xl text-slate-600">An NFA may have several next states for one input symbol; a DFA has exactly one. Subset construction builds a DFA whose states are sets of NFA states. Epsilon transitions are out of scope and are rejected.</p>
  <button className={pri+' mt-4'} onClick={()=>go(1)}>Start conversion</button></div>
  <div className={cx}><h3 className="font-semibold text-[#0f2a5c]">Sample automata</h3><div className="mt-3 grid gap-3 md:grid-cols-2">{samples.map(s=><div key={s.name} className="rounded-lg border border-sky-100 p-3"><div className="font-medium">{s.name}</div><p className="text-sm text-slate-600">{s.description}</p><button className={sec+' mt-2'} onClick={()=>load(s.nfa)}>Load and edit</button></div>)}</div></div></>}
function Input({nfa,edit,errs,validate,run}:{nfa:NFA;edit:(n:NFA)=>void;errs:string[]|null;validate:()=>boolean;run:()=>void}){
  const setList=(k:'states'|'alphabet',v:string)=>edit({...nfa,[k]:v.split(',').map(s=>s.trim())})
  const states=nfa.states.filter(Boolean),al=nfa.alphabet.filter(Boolean)
  return <div className={cx+' space-y-4'}>
    <div className="flex flex-wrap gap-2"><select className={sec} defaultValue="" onChange={e=>{if(e.target.value!=='')edit(structuredClone(samples[+e.target.value].nfa));e.target.value=''}}><option value="">Load example…</option>{samples.map((s,i)=><option key={s.name} value={i}>{s.name}</option>)}</select>
    <button className={sec} onClick={()=>edit(empty)}><RotateCcw size={14}/>Reset</button><button className={sec} onClick={()=>edit({states:[],alphabet:[],start:'',finals:[],delta:{}})}><Trash2 size={14}/>Clear all</button></div>
    <div className="grid gap-3 md:grid-cols-2">
      <label className="text-sm">States Q (comma-separated)<input className="mt-1 w-full rounded-lg border border-sky-200 p-2" value={nfa.states.join(',')} onChange={e=>setList('states',e.target.value)}/></label>
      <label className="text-sm">Alphabet Σ (comma-separated)<input className="mt-1 w-full rounded-lg border border-sky-200 p-2" value={nfa.alphabet.join(',')} onChange={e=>setList('alphabet',e.target.value)}/></label>
      <label className="text-sm">Start state q0<select className="mt-1 w-full rounded-lg border border-sky-200 p-2" value={nfa.start} onChange={e=>edit({...nfa,start:e.target.value})}><option value="">— select —</option>{states.map(s=><option key={s}>{s}</option>)}</select></label>
      <fieldset className="text-sm">Final states F<div className="mt-1 flex flex-wrap gap-3">{states.map(s=><label key={s} className="flex items-center gap-1"><input type="checkbox" checked={nfa.finals.includes(s)} onChange={e=>edit({...nfa,finals:e.target.checked?[...nfa.finals,s]:nfa.finals.filter(f=>f!==s)})}/>{s}</label>)}</div></fieldset></div>
    <div><h3 className="mb-1 text-sm font-medium">Transition table δ — enter destinations separated by commas, or ∅ / empty for none</h3>
    <div className="overflow-x-auto"><table className="text-sm"><thead><tr><th className="p-1 text-left">State</th>{al.map(a=><th key={a} className="p-1">{a}</th>)}</tr></thead><tbody>{states.map(q=><tr key={q}><td className="p-1 font-medium">{q}</td>{al.map(a=><td key={a} className="p-1"><input className="w-28 rounded border border-sky-200 p-1" defaultValue={(nfa.delta[q]?.[a]??[]).join(',')} key={q+a+JSON.stringify(nfa.delta[q]?.[a])} onBlur={e=>edit({...nfa,delta:{...nfa.delta,[q]:{...nfa.delta[q],[a]:parseCell(e.target.value)}}})}/></td>)}</tr>)}</tbody></table></div></div>
    <div className="flex gap-2"><button className={sec} onClick={validate}><CheckCircle2 size={14}/>Validate NFA</button><button className={pri} onClick={run}><Plus size={14}/>Convert to DFA</button></div>
    {errs&&(errs.length?<ul className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{errs.map(e=><li key={e} className="flex gap-2"><AlertTriangle size={14} className="mt-0.5 shrink-0"/>{e}</li>)}</ul>:<p className="rounded-lg bg-green-50 p-3 text-sm text-green-800">NFA is valid.</p>)}</div>}
function Sim({dfa,step,setStep,play,setPlay}:{dfa:DFA;step:number;setStep:(n:number)=>void;play:boolean;setPlay:(b:boolean)=>void}){
  const s=dfa.steps[step]
  return <div className={cx+' space-y-3'}><div className="flex flex-wrap items-center gap-2">
    <button className={sec} disabled={step===0} onClick={()=>setStep(step-1)}><SkipBack size={14}/>Previous</button>
    <button className={pri} onClick={()=>setPlay(!play)}>{play?<Pause size={14}/>:<Play size={14}/>}{play?'Pause':'Play'}</button>
    <button className={sec} disabled={step>=dfa.steps.length-1} onClick={()=>setStep(step+1)}>Next<SkipForward size={14}/></button>
    <button className={sec} onClick={()=>{setStep(0);setPlay(false)}}><RotateCcw size={14}/>Reset</button><span className="ml-auto text-sm">Step {step+1} of {dfa.steps.length}</span></div>
    <div className="rounded-lg bg-sky-50 p-4"><div className="text-xs text-slate-500">{s.kind}{s.current&&` · current ${s.current}`}{s.symbol&&` · symbol ${s.symbol}`}</div><p className="mt-1 font-mono text-sm">{s.text}</p></div>
    <h3 className="font-medium text-[#0f2a5c]">Calculation log</h3><ol className="max-h-72 overflow-auto text-sm font-mono">{dfa.steps.slice(0,step+1).map((x,i)=><li key={i} className={i===step?'font-bold text-[#0f2a5c]':'text-slate-500'}>{i+1}. {x.text}</li>)}</ol></div>}
function Diagram({title,nodes,edges,start}:{title:string;nodes:{id:string;acc:boolean}[];edges:[string,string,string][];start:string}){
  const R=nodes.length>6?210:150,W=2*R+180,pos=Object.fromEntries(nodes.map((n,i)=>{const a=2*Math.PI*i/nodes.length-Math.PI/2;return [n.id,{x:W/2+R*Math.cos(a),y:W/2+R*Math.sin(a)}]}))
  const grp:Record<string,string[]>={};edges.forEach(([f,t,a])=>{(grp[f+'→'+t]??=[]).push(a)})
  const [pan,setPan]=useState({x:0,y:0,k:1}),[ov,setOv]=useState<Record<string,{x:number;y:number}>>({})
  const P=(id:string)=>ov[id]??pos[id]
  return <div className={cx}><div className="mb-2 flex items-center gap-2"><h3 className="font-medium text-[#0f2a5c]">{title}</h3><button className={sec} onClick={()=>setPan({...pan,k:pan.k*1.2})}>＋</button><button className={sec} onClick={()=>setPan({...pan,k:pan.k/1.2})}>－</button><button className={sec} onClick={()=>{setPan({x:0,y:0,k:1});setOv({})}}>Fit</button></div>
  <svg viewBox={`0 0 ${W} ${W}`} className="w-full touch-none" onPointerMove={e=>{const d=(e.currentTarget as any).__drag;if(!d)return;const r=e.currentTarget.getBoundingClientRect();setOv(o=>({...o,[d]:{x:(e.clientX-r.left)/r.width*W/pan.k-pan.x,y:(e.clientY-r.top)/r.width*W/pan.k-pan.y}}))}} onPointerUp={e=>{(e.currentTarget as any).__drag=null}}>
  <defs><marker id={'ar'+title} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#0f2a5c"/></marker></defs>
  <g transform={`scale(${pan.k})`}>{Object.entries(grp).map(([k,as])=>{const [f,t]=k.split('→');const a=P(f),b=P(t);const lab=as.join(',')
    if(f===t)return <g key={k}><path d={`M${a.x-12} ${a.y-24} C${a.x-40} ${a.y-80} ${a.x+40} ${a.y-80} ${a.x+12} ${a.y-24}`} fill="none" stroke="#0f2a5c" markerEnd={`url(#ar${title})`}/><text x={a.x} y={a.y-70} textAnchor="middle" fontSize="14" fill="#b45309">{lab}</text></g>
    const dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,off=18,nx=-uy*off,ny=ux*off
    const x1=a.x+ux*26+nx*.4,y1=a.y+uy*26+ny*.4,x2=b.x-ux*28+nx*.4,y2=b.y-uy*28+ny*.4,mx=(a.x+b.x)/2+nx*1.8,my=(a.y+b.y)/2+ny*1.8
    return <g key={k}><path d={`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`} fill="none" stroke="#0f2a5c" markerEnd={`url(#ar${title})`}/><text x={mx} y={my} textAnchor="middle" fontSize="14" fill="#b45309" stroke="white" strokeWidth="4" paintOrder="stroke">{lab}</text></g>})}
  {nodes.map(n=>{const p=P(n.id);return <g key={n.id} style={{cursor:'grab'}} onPointerDown={e=>{(e.currentTarget.ownerSVGElement as any).__drag=n.id}}>
    {n.id===start&&<path d={`M${p.x-60} ${p.y} L${p.x-28} ${p.y}`} stroke="#0f2a5c" strokeWidth="2" markerEnd={`url(#ar${title})`}/>}
    <circle cx={p.x} cy={p.y} r="26" fill={n.id===start?'#dbeafe':'white'} stroke="#0f2a5c" strokeWidth="2"/>{n.acc&&<circle cx={p.x} cy={p.y} r="21" fill="none" stroke="#0f2a5c" strokeWidth="2"/>}
    <text x={p.x} y={p.y+4} textAnchor="middle" fontSize={n.id.length>6?9:12} fill="#0f2a5c" style={{userSelect:'none'}}>{n.id}</text></g>})}</g></svg>
  <p className="text-xs text-slate-500">Arrow = start state · double circle = accepting · drag states to rearrange.</p></div>}
function Table({nfa,dfa}:{nfa:NFA;dfa:DFA}){const acc=dfa.states.filter(s=>s.accepting).length
  return <div className={cx+' space-y-3'}><div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-5">{([['NFA states',nfa.states.length],['DFA states',dfa.states.length],['DFA transitions',dfa.states.length*dfa.alphabet.length],['Accepting',acc],['Dead state',dfa.hasDead?'Yes':'No']] as [string,string|number][]).map(([k,v])=><div key={k} className="rounded-lg bg-sky-50 p-3"><div className="text-slate-500">{k}</div><div className="text-xl font-semibold text-[#0f2a5c]">{v}</div></div>)}</div>
  <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-2">DFA state</th>{dfa.alphabet.map(a=><th key={a} className="p-2">{a}</th>)}<th className="p-2">Final?</th></tr></thead><tbody>{dfa.states.map(s=><tr key={s.name} className="border-b"><td className="p-2 font-mono">{s.name===dfa.start?'→ ':''}{s.name}</td>{dfa.alphabet.map(a=><td key={a} className="p-2 font-mono">{dfa.delta[s.name][a]}</td>)}<td className="p-2">{s.accepting?'Yes':'No'}</td></tr>)}</tbody></table></div></div>}
function Testing({nfa,dfa}:{nfa:NFA;dfa:DFA}){
  const [txt,setTxt]=useState('\n01\n101\n111')
  const rows=useMemo(()=>txt.split('\n').map(w=>w.trim()).map(w=>({w,n:simulateNFA(nfa,w),d:simulateDFA(dfa,w)})),[txt,nfa,dfa])
  return <div className={cx+' space-y-3'}><label className="text-sm">One test string per line (a blank line tests the empty string ε)<textarea className="mt-1 h-28 w-full rounded-lg border border-sky-200 p-2 font-mono" value={txt} onChange={e=>setTxt(e.target.value)}/></label>
  {rows.some(r=>!r.n.error&&r.n.accepted!==r.d.accepted)&&<p className="rounded bg-red-50 p-2 text-red-800">Implementation defect: NFA and DFA disagree.</p>}
  <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-2">String</th><th>NFA</th><th>DFA</th><th>Equivalent?</th><th>Active NFA states</th><th>DFA path</th></tr></thead><tbody>{rows.map((r,i)=><tr key={i} className="border-b align-top"><td className="p-2 font-mono">{r.w||'ε'}</td>
  {r.n.error?<td colSpan={5} className="text-red-700">{r.n.error}</td>:<><td>{r.n.accepted?'Accepted':'Rejected'}</td><td>{r.d.accepted?'Accepted':'Rejected'}</td><td>{r.n.accepted===r.d.accepted?'Yes':'NO'}</td><td className="font-mono">{r.n.trace.map(label).join(' → ')}</td><td className="font-mono">{r.d.trace.join(' → ')}</td></>}</tr>)}</tbody></table></div></div>}
function Theory(){const items:[string,string][]=[
['NFA','M = (Q, Σ, δ, q0, F) with δ: Q × Σ → 𝒫(Q). A string is accepted if some path ends in F.'],
['DFA','M′ = (Q′, Σ, δ′, q0′, F′) with δ′: Q′ × Σ → Q′: exactly one next state per symbol.'],
['Subset construction','q0′ = {q0}. δ′(S,a) = ⋃ q∈S δ(q,a). Process each new subset until none remain. S ∈ F′ iff S ∩ F ≠ ∅.'],
['Why it works','After reading w, the DFA is in the set of all NFA states reachable on w, so both machines accept exactly the same strings.'],
['Dead state ∅','Reached when no NFA state has a move; ∅ loops to itself on every symbol and never accepts.'],
['Complexity','Worst case 2ⁿ DFA states and O(2ⁿ·|Σ|·n) time. Only reachable subsets are built, which is often far fewer.']]
  return <div className="grid gap-3 md:grid-cols-2">{items.map(([t,b])=><div key={t} className={cx}><h3 className="font-semibold text-[#0f2a5c]">{t}</h3><p className="mt-1 text-sm">{b}</p></div>)}</div>}
