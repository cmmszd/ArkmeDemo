// src/services/aliyun.ts

const API_KEY = import.meta.env.VITE_ALIYUN_API_KEY;
const BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const MODEL = 'qwen-max';

export async function parseArrangementFromText(userInput: string) {
  const today = new Date().toISOString().slice(0, 10);
  
  const prompt = `从文本中提取任务和日期。只返回JSON，不要其他内容。

文本：${userInput}

返回格式：{"title": "任务名", "dueDate": "YYYY-MM-DD"}

规则：
- 识别日期（今天/明天/后天/下周五等）并转换为具体日期
- 没有日期则 dueDate 为 "${today}"
- 提取核心任务作为 title

示例：
"下周五下午开会" → {"title": "开会", "dueDate": "2026-05-29"}
"买牛奶" → {"title": "买牛奶", "dueDate": "${today}"}`;

  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: '你是任务解析助手，只返回JSON。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      title: parsed.title || userInput,
      dueDate: parsed.dueDate || today
    };
  } catch (error) {
    console.error('API调用失败:', error);
    // 降级到本地解析
    return localParse(userInput, today);
  }
}

// 本地解析作为备用
function localParse(text: string, today: string) {
  let title = text.replace(/今天|明天|后天|下周五|下个月|下午|上午/g, '').trim();
  let dueDate = today;
  
  if (text.includes('明天')) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    dueDate = d.toISOString().slice(0, 10);
  } else if (text.includes('后天')) {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    dueDate = d.toISOString().slice(0, 10);
  }
  
  return { title: title || text, dueDate };
}