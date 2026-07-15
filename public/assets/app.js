
const FALLBACK=[
{round:1232,date:"2026-07-11",numbers:[12,15,19,22,24,36],bonus:3,winners:11,prize:2533260819},
{round:1231,date:"2026-07-04",numbers:[4,13,14,18,31,38],bonus:15},
{round:1230,date:"2026-06-27",numbers:[3,8,9,22,28,42],bonus:45},
{round:1229,date:"2026-06-20",numbers:[12,13,29,34,37,42],bonus:16},
{round:1228,date:"2026-06-13",numbers:[24,29,30,31,35,44],bonus:1}
];
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const state={draws:FALLBACK,balance:true,spread:true,ending:true,noConsecutive:false,sets:[]};
const cls=n=>n<=10?"c1":n<=20?"c2":n<=30?"c3":n<=40?"c4":"c5";
const ball=(n,sm=false)=>`<span class="ball ${sm?"sm ":""}${cls(n)}">${n}</span>`;
const dateKo=s=>{const d=new Date(`${s}T00:00:00`);return `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일 추첨`};
const won=n=>n?`${Number(n).toLocaleString("ko-KR")}원`:"공식 결과 확인";
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1700)}
function renderDraws(draws,live=false){
 state.draws=draws;const d=draws[0];
 $("#latestRound").textContent=`제${d.round}회`;$("#latestDate").textContent=dateKo(d.date);
 $("#latestBalls").innerHTML=d.numbers.map(n=>ball(n)).join("");$("#latestBonus").innerHTML=ball(d.bonus);
 $("#winnerCount").textContent=d.winners?`${d.winners}명`:"공식 결과 확인";$("#firstPrize").textContent=won(d.prize);
 const now=new Date();const next=new Date(now);const days=(6-now.getDay()+7)%7;next.setDate(now.getDate()+(days===0?7:days));next.setHours(20,35,0,0);
 const diff=Math.max(0,next-now);const dday=Math.ceil(diff/86400000);$("#nextDraw").textContent=`D-${dday}`;
 const status=$("#status");status.textContent=live?"● 최신 반영":"● 저장 데이터";status.classList.toggle("fallback",!live);
 $("#historyList").innerHTML=draws.slice(0,10).map(x=>`<div class="history-row"><div class="row-meta"><strong>제${x.round}회</strong><span>${x.date.replaceAll("-",".")}</span></div><div class="balls">${x.numbers.map(n=>ball(n,true)).join("")}<span class="plus">+</span>${ball(x.bonus,true)}</div></div>`).join("");
 renderFrequency(draws);
}
async function loadDraws(){
 try{const r=await fetch("api/lotto",{cache:"no-store"});if(!r.ok)throw 0;const j=await r.json();if(!j.draws?.length)throw 0;renderDraws(j.draws,true)}
 catch(e){renderDraws(FALLBACK,false)}
}
function renderFrequency(draws){
 const counts=Array(46).fill(0);draws.forEach(d=>d.numbers.forEach(n=>counts[n]++));
 const top=Array.from({length:45},(_,i)=>({n:i+1,c:counts[i+1]})).sort((a,b)=>b.c-a.c||a.n-b.n).slice(0,8);
 const max=Math.max(...top.map(x=>x.c),1);
 $("#frequencyList").innerHTML=top.map(x=>`<div class="frequency-row"><strong>${x.n}</strong><div class="bar"><i style="width:${x.c/max*100}%"></i></div><span>${x.c}회</span></div>`).join("");
}
$$(".chip").forEach(b=>b.onclick=()=>{b.classList.toggle("active");state[b.dataset.key]=b.classList.contains("active")});
const shuffle=a=>{const b=[...a];for(let i=b.length-1;i;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};
const excluded=()=>[...new Set($("#exclude").value.split(",").map(v=>+v.trim()).filter(n=>n>=1&&n<=45))];
function valid(a){
 const odd=a.filter(n=>n%2).length;if(state.balance&&(odd<2||odd>4))return false;
 if(state.spread&&new Set(a.map(n=>Math.floor((n-1)/10))).size<3)return false;
 if(state.ending){const c={};a.forEach(n=>c[n%10]=(c[n%10]||0)+1);if(Math.max(...Object.values(c))>2)return false}
 if(state.noConsecutive&&a.some((n,i)=>i&&n-a[i-1]===1))return false;return true
}
function one(){
 const pool=Array.from({length:45},(_,i)=>i+1).filter(n=>!excluded().includes(n));if(pool.length<6)throw Error("제외 번호가 너무 많습니다.");
 for(let i=0;i<4000;i++){const a=shuffle(pool).slice(0,6).sort((a,b)=>a-b);if(valid(a))return a}return shuffle(pool).slice(0,6).sort((a,b)=>a-b)
}
function generate(){
 try{const count=+$("#count").value,sets=[],seen=new Set();while(sets.length<count){const a=one(),k=a.join("-");if(!seen.has(k)){seen.add(k);sets.push(a)}}state.sets=sets;
 $("#results").innerHTML=sets.map((a,i)=>`<div class="result reveal"><span class="set-no">SET ${String.fromCharCode(65+i)}</span><div class="balls">${a.map(n=>ball(n)).join("")}</div><span class="result-stat">홀 ${a.filter(n=>n%2).length} · 짝 ${a.filter(n=>n%2===0).length}<br>합계 ${a.reduce((x,y)=>x+y,0)}</span><div class="result-actions"><button class="copy-one" data-nums="${a.join(",")}">⧉</button><button class="save-one" data-nums="${a.join(",")}">♡</button></div></div>`).join("");
 $$(".save-one").forEach(b=>b.onclick=()=>saveNumbers(b.dataset.nums.split(",").map(Number)));
 $$(".copy-one").forEach(b=>b.onclick=async()=>{await navigator.clipboard.writeText(b.dataset.nums.replaceAll(",",", "));toast("해당 번호를 복사했습니다.")});
 }catch(e){toast(e.message)}
}
const saved=()=>JSON.parse(localStorage.getItem("luckySaved")||"[]");
function saveNumbers(nums){const list=saved();const key=nums.join("-");if(list.some(x=>x.join("-")===key))return toast("이미 저장된 번호입니다.");list.unshift(nums);localStorage.setItem("luckySaved",JSON.stringify(list.slice(0,20)));renderSaved();toast("번호를 저장했습니다.")}
function renderSaved(){const list=saved();$("#savedList").innerHTML=list.length?list.map((x,i)=>`<div class="saved-row"><span class="nums">${x.join(" · ")}</span><button class="delete" data-i="${i}">삭제</button></div>`).join(""):`<p class="muted">저장된 번호가 없습니다.</p>`;$$(".delete").forEach(b=>b.onclick=()=>{const l=saved();l.splice(+b.dataset.i,1);localStorage.setItem("luckySaved",JSON.stringify(l));renderSaved()})}
$("#generate").onclick=generate;$("#reroll").onclick=generate;$("#copy").onclick=async()=>{if(!state.sets.length)return toast("먼저 생성하세요.");await navigator.clipboard.writeText(state.sets.map((x,i)=>`${i+1}세트: ${x.join(", ")}`).join("\n"));toast("전체 번호를 복사했습니다.")};
$("#share").onclick=async()=>{const text=state.sets.length?state.sets.map(x=>x.join(", ")).join("\n"):"LUCKY LAB 로또 번호 생성기";try{if(navigator.share)await navigator.share({title:"LUCKY LAB",text,url:location.href});else{await navigator.clipboard.writeText(location.href);toast("주소를 복사했습니다.")}}catch(e){}};
async function fetchRound(round){
 const local=state.draws.find(x=>x.round===round);if(local)return local;
 for(let attempt=0;attempt<3;attempt++){
  try{
   const r=await fetch(`api/lotto?round=${round}&retry=${attempt}`,{cache:"no-store"});
   if(!r.ok)throw new Error("request failed");
   const j=await r.json();if(j.draws?.[0])return j.draws[0];
  }catch(e){}
  await new Promise(resolve=>setTimeout(resolve,250*(attempt+1)));
 }
 return null
}
$("#roundButton").onclick=async()=>{
 const round=Number($("#roundInput").value);
 if(!Number.isInteger(round)||round<1)return toast("올바른 회차를 입력하세요.");
 $("#roundButton").disabled=true;$("#roundButton").textContent="조회 중";
 $("#roundResult").innerHTML='<p class="muted">당첨정보를 조회하고 있습니다.</p>';
 const d=await fetchRound(round);
 $("#roundButton").disabled=false;$("#roundButton").textContent="검색";
 $("#roundResult").innerHTML=d?`<div class="history-row"><div class="row-meta"><strong>제${d.round}회</strong><span>${d.date}</span></div><div class="balls">${d.numbers.map(n=>ball(n)).join("")}<span class="plus">+</span>${ball(d.bonus)}</div></div>`:`<div class="history-row"><strong>제${round}회 정보를 불러오지 못했습니다.</strong><p class="muted">잠시 후 다시 검색하거나 동행복권 공식 결과에서 확인해 주세요.</p></div>`;
};
const theme=localStorage.getItem("theme")||"dark";document.documentElement.dataset.theme=theme;$("#themeButton").textContent=theme==="dark"?"☀":"☾";
$("#themeButton").onclick=()=>{const t=document.documentElement.dataset.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=t;localStorage.setItem("theme",t);$("#themeButton").textContent=t==="dark"?"☀":"☾"};
if(!localStorage.getItem("cookieNotice"))$("#cookie").classList.add("show");$("#cookieOk").onclick=()=>{localStorage.setItem("cookieNotice","1");$("#cookie").classList.remove("show")};
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
loadDraws();generate();renderSaved();

function renderTodayPick(){
 const key=new Date().toISOString().slice(0,10);
 let savedPick=JSON.parse(localStorage.getItem("todayPick")||"null");
 if(!savedPick||savedPick.date!==key){savedPick={date:key,nums:shuffle(Array.from({length:45},(_,i)=>i+1)).slice(0,6).sort((a,b)=>a-b)};localStorage.setItem("todayPick",JSON.stringify(savedPick))}
 $("#todayBalls").innerHTML=savedPick.nums.map(n=>ball(n)).join("");
}
$("#todayReroll").onclick=()=>{const nums=shuffle(Array.from({length:45},(_,i)=>i+1)).slice(0,6).sort((a,b)=>a-b);localStorage.setItem("todayPick",JSON.stringify({date:new Date().toISOString().slice(0,10),nums}));renderTodayPick()};
renderTodayPick();
