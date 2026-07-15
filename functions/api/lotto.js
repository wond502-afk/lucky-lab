
const JSON_URL=n=>`https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${n}`;
async function fetchOne(n){
 try{
  const r=await fetch(JSON_URL(n),{headers:{"accept":"application/json,text/plain,*/*","referer":"https://www.dhlottery.co.kr/lt645/result","user-agent":"Mozilla/5.0 LuckyLab/3.0"},cf:{cacheTtl:1800,cacheEverything:true}});
  if(!r.ok)return null;const d=await r.json();if(d.returnValue!=="success")return null;
  const numbers=[d.drwtNo1,d.drwtNo2,d.drwtNo3,d.drwtNo4,d.drwtNo5,d.drwtNo6].map(Number);
  if(numbers.some(x=>!Number.isInteger(x)))return null;
  return {round:Number(d.drwNo),date:String(d.drwNoDate),numbers,bonus:Number(d.bnusNo),winners:Number(d.firstPrzwnerCo||0),prize:Number(d.firstWinamnt||0)}
 }catch{return null}
}
function json(data,status=200,age=900){return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":`public,max-age=${age}`}})}
export async function onRequestGet({request}){
 const url=new URL(request.url),q=Number(url.searchParams.get("round"));
 if(Number.isInteger(q)&&q>0){const d=await fetchOne(q);return json({draws:d?[d]:[]},d?200:404,d?86400:60)}
 const first=new Date("2002-12-07T00:00:00+09:00"),guess=Math.floor((Date.now()-first.getTime())/604800000)+1;
 let latest=null,no=guess+2;
 for(let n=guess+2;n>=guess-4;n--){const d=await fetchOne(n);if(d){latest=d;no=n;break}}
 if(!latest)return json({error:"source unavailable"},502,60);
 const draws=[latest];
 for(let n=no-1;n>=Math.max(1,no-29);n--){const d=await fetchOne(n);if(d)draws.push(d)}
 return json({draws,updatedAt:new Date().toISOString()})
}
