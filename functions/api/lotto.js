
const JSON_ENDPOINTS = [
  round => `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`,
  round => `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}&_=${Date.now()}`
];

const HTML_ENDPOINTS = [
  round => `https://www.dhlottery.co.kr/lt645/result?result=byWin&lottoId=LO40&drawNo=${round}`,
  round => `https://www.dhlottery.co.kr/gameResult.do?method=byWin&drwNo=${round}`
];

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function normalizeJson(d) {
  if (!d || d.returnValue !== "success") return null;
  const numbers = [d.drwtNo1,d.drwtNo2,d.drwtNo3,d.drwtNo4,d.drwtNo5,d.drwtNo6].map(Number);
  if (numbers.some(n => !Number.isInteger(n) || n < 1 || n > 45)) return null;
  return {
    round:Number(d.drwNo),
    date:String(d.drwNoDate),
    numbers,
    bonus:Number(d.bnusNo),
    winners:Number(d.firstPrzwnerCo || 0),
    prize:Number(d.firstWinamnt || 0)
  };
}

function textOnly(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi," ")
    .replace(/<style[\s\S]*?<\/style>/gi," ")
    .replace(/<[^>]+>/g," ")
    .replace(/&nbsp;/g," ")
    .replace(/\s+/g," ")
    .trim();
}

function parseHtml(html, round) {
  const text = textOnly(html);
  const dateMatch = text.match(/(\d{4})[.\-년]\s*(\d{1,2})[.\-월]\s*(\d{1,2})일?/);
  const candidates = [...html.matchAll(/(?:lotto645ball|ball_645|ball)[^>]*>\s*(\d{1,2})\s*</gi)].map(m=>Number(m[1]));
  let nums = candidates.filter(n=>n>=1&&n<=45);
  if (nums.length < 7) {
    const area = text.match(/당첨번호([\s\S]{0,250})/);
    if (area) nums = [...area[1].matchAll(/\b([1-9]|[1-3]\d|4[0-5])\b/g)].map(m=>Number(m[1]));
  }
  const unique = [];
  for (const n of nums) if (!unique.includes(n)) unique.push(n);
  if (unique.length < 7 || !dateMatch) return null;
  return {
    round,
    date:`${dateMatch[1]}-${String(dateMatch[2]).padStart(2,"0")}-${String(dateMatch[3]).padStart(2,"0")}`,
    numbers:unique.slice(0,6).sort((a,b)=>a-b),
    bonus:unique[6],
    winners:0,
    prize:0
  };
}

async function request(url, accept) {
  const response = await fetch(url, {
    headers:{
      "accept":accept,
      "accept-language":"ko-KR,ko;q=0.9",
      "referer":"https://www.dhlottery.co.kr/lt645/result",
      "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 LuckyLab/3.0"
    },
    redirect:"follow",
    cf:{cacheTtl:1800,cacheEverything:true}
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response;
}

async function getDraw(round) {
  for (let cycle=0; cycle<2; cycle++) {
    for (const buildUrl of JSON_ENDPOINTS) {
      try {
        const response = await request(buildUrl(round),"application/json,text/plain,*/*");
        const draw = normalizeJson(await response.json());
        if (draw && draw.round === round) return draw;
      } catch {}
    }
    await sleep(180);
  }

  for (const buildUrl of HTML_ENDPOINTS) {
    try {
      const response = await request(buildUrl(round),"text/html,application/xhtml+xml");
      const draw = parseHtml(await response.text(),round);
      if (draw) return draw;
    } catch {}
  }
  return null;
}

function json(data,status=200,maxAge=900) {
  return new Response(JSON.stringify(data),{
    status,
    headers:{
      "content-type":"application/json;charset=UTF-8",
      "cache-control":`public,max-age=${maxAge}`,
      "access-control-allow-origin":"*"
    }
  });
}

export async function onRequestGet({request,env}) {
  const url = new URL(request.url);
  const requested = Number(url.searchParams.get("round"));

  if (Number.isInteger(requested) && requested > 0) {
    const cacheKey = new Request(`${url.origin}/api/lotto-cache/${requested}`);
    const cache = caches.default;
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    const draw = await getDraw(requested);
    const response = json({draws:draw?[draw]:[]},draw?200:404,draw?86400:60);
    if (draw) await cache.put(cacheKey,response.clone());
    return response;
  }

  const firstDraw = new Date("2002-12-07T00:00:00+09:00");
  const guess = Math.floor((Date.now()-firstDraw.getTime())/604800000)+1;
  let latest = null, latestNo = guess + 2;

  for (let n=guess+2; n>=guess-4; n--) {
    const d = await getDraw(n);
    if (d) { latest=d; latestNo=n; break; }
  }
  if (!latest) return json({error:"official source unavailable"},502,60);

  const draws=[latest];
  for (let n=latestNo-1; n>=Math.max(1,latestNo-29); n--) {
    const d=await getDraw(n);
    if(d) draws.push(d);
  }
  return json({draws,updatedAt:new Date().toISOString()},200,900);
}
