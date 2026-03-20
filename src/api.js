import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_KEY_STORAGE = 'gemini_api_key';

function parseRobust(raw) {
  raw = raw.replace(/```json|```/g,'').trim();
  const start = raw.indexOf('[');
  if (start===-1) throw new Error('JSON 없음');
  try {
    const end = raw.lastIndexOf(']');
    if (end>start) return JSON.parse(raw.slice(start,end+1));
  } catch(_) {}
  const objects=[];
  let i=start+1;
  while(i<raw.length && objects.length<10){
    while(i<raw.length && raw[i]!=='{') i++;
    if(i>=raw.length) break;
    let depth=0,j=i;
    while(j<raw.length){
      if(raw[j]==='{') depth++;
      else if(raw[j]==='}'){depth--;if(depth===0) break;}
      j++;
    }
    if(depth===0){
      try{objects.push(JSON.parse(raw.slice(i,j+1).replace(/[\u0000-\u001F]/g,' ')));}catch(_){}
      i=j+1;
    } else break;
  }
  if(objects.length===0) throw new Error('파싱 실패');
  return objects;
}

export async function fetchInvestmentThemes() {
  // 앱 내 설정에서 저장된 키를 불러옴
  const apiKey = await AsyncStorage.getItem(API_KEY_STORAGE);
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('API_KEY_NOT_SET');
  }

  const today = new Date().toISOString().slice(0,10);
  const prompt = `Financial analyst. Today: ${today}.
Top 10 investment themes watched by BOTH US institutions (Goldman Sachs, BlackRock, JPMorgan, Morgan Stanley) AND Korean institutions (삼성증권, 미래에셋, KB증권, NH투자증권).
Output ONLY raw JSON array. No markdown. No explanation.
Schema: [{"topic":"테마명","summary":"짧은요약","score":100,"sourceType":"mixed","stocks":[{"name":"회사명","ticker":"NVDA","market":"US","reason":"이유"},{"name":"삼성전자","ticker":"005930","market":"KR","reason":"이유"}],"details":{"us":["관점1","관점2"],"kr":["관점1","관점2"],"sources":["출처1","출처2"]}}]
Scores:100,95,91,87,83,79,75,71,67,63. Stocks 3-4 per theme. Keep ALL strings under 60 chars.`;

  const models = ['gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-1.0-pro'];
  let lastError = null;
  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 8000, temperature: 0.7 },
          }),
        }
      );
      const data = await res.json();
      if (data.error) { lastError = new Error(data.error.message); continue; }
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) { lastError = new Error('응답 없음'); continue; }
      return parseRobust(text);
    } catch(e) { lastError = e; }
  }
  throw lastError || new Error('모든 모델 실패');
}

