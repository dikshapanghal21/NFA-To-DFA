# NFA to DFA Conversion Simulator
React + Vite + TypeScript + Tailwind. Subset construction in `src/algorithms/` (UI-independent).
## Run
`npm install` · `npm run dev` · `npm test` · `npm run build`
## Algorithm
q0'={q0}; δ'(S,a)=⋃δ(q,a); queue unseen subsets; S accepting iff S∩F≠∅; ∅ is a self-looping dead state. Epsilon transitions are rejected by validation.

