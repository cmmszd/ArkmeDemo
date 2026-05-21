import React, { useState, useEffect } from "react";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import ListItem from "@/components/ui/list-item";
import Card from "@/components/ui/card";
import type { ArrangementItem } from "@/types/arrangement";
import { formatTimeLabel } from "@/lib/time";
import { cn } from "@/lib/utils";
import { parseArrangementFromText } from "@/services/aliyun";

const STORAGE_KEY = "arkme-demo.arrangements";

function loadArrangements(): ArrangementItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ArrangementItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveArrangements(items: ArrangementItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore quota errors
  }
}

export default function ArrangementPage(): JSX.Element {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [arrangements, setArrangements] = useState<ArrangementItem[]>(() => loadArrangements());
  
  // AI 识别相关状态
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 持久化：当 arrangements 变化时自动保存
  useEffect(() => {
    saveArrangements(arrangements);
  }, [arrangements]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate) return;
    
    setLoading(true);
    const newItem: ArrangementItem = {
      id: crypto.randomUUID(),
      title,
      dueDate,
      createdAt: Date.now(),
      completed: false,
    };
    
    setArrangements((prev) => [newItem, ...prev]);
    
    setTimeout(() => {
      setLoading(false);
      setTitle("");
      setDueDate("");
    }, 300);
  };

  const handleDelete = (id: string) => {
    setArrangements((prev) => prev.filter((item) => item.id !== id));
  };

  const handleToggleComplete = (id: string) => {
    setArrangements((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleAiRecognize = async () => {
    if (!aiInput.trim()) return;
    
    setAiLoading(true);
    setAiMessage(null);
    
    try {
      // 使用专用解析函数，强约束返回完整 JSON
      const parsed = await parseArrangementFromText(aiInput);
      
      // 验证必需字段：标题必须有
      if (!parsed.title) {
        throw new Error("无法提取标题，请尝试更明确的描述");
      }
      
      // 直接创建安排项（dueDate 可为 null）
      const newItem: ArrangementItem = {
        id: crypto.randomUUID(),
        title: parsed.title,
        dueDate: parsed.dueDate,
        createdAt: Date.now(),
        completed: false,
      };
      
      setArrangements((prev) => [newItem, ...prev]);
      
      const dateText = parsed.dueDate || "未指定日期";
      setAiMessage({ type: "success", text: `✅ 已创建：${parsed.title}（${dateText}）` });
      setAiInput(""); // 清空输入框
      
    } catch (error) {
      console.error("AI识别失败:", error);
      const msg = error instanceof Error ? error.message : "AI识别失败，请检查网络连接或API配置";
      setAiMessage({ type: "error", text: `❌ ${msg}` });
    } finally {
      setAiLoading(false);
      // 3秒后自动清除消息
      setTimeout(() => setAiMessage(null), 3000);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-text mb-6">新建安排</h1>
      
      {/* AI 识别区域 */}
      <Card className={cn("p-4 mb-4", aiMessage?.type === "success" ? "border-green-500/30 bg-green-500/5" : aiMessage?.type === "error" ? "border-destructive/30 bg-destructive/5" : "border-primary/20")}>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="输入自然语言，如：明天下午3点开项目会议"
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            className="flex-1"
            disabled={aiLoading}
            onKeyDown={(e) => e.key === "Enter" && !aiLoading && handleAiRecognize()}
          />
          <Button 
            variant="secondary" 
            onClick={handleAiRecognize} 
            loading={aiLoading}
            disabled={!aiInput.trim()}
          >
            AI识别
          </Button>
        </div>
        {aiMessage && (
          <p className={cn("text-xs mt-2", aiMessage.type === "success" ? "text-green-600" : "text-destructive")}>
            {aiMessage.text}
          </p>
        )}
      </Card>
      
      {/* 表单区域 */}
      <Card className="p-4 mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              标题
            </label>
            <Input
              type="text"
              placeholder="请输入标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              截止日期
            </label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
          <Button type="submit" variant="primary" loading={loading} className="w-full">
            创建
          </Button>
        </form>
      </Card>

      {/* 列表区域 */}
      <div>
        <h2 className="text-lg font-semibold text-text mb-3">
          安排列表 <span className="text-sm font-normal text-text-tertiary">({arrangements.length})</span>
        </h2>
        
        {arrangements.length === 0 ? (
          <p className="text-sm text-text-tertiary text-center py-8">暂无安排</p>
        ) : (
          <div className="space-y-2">
            {arrangements.map((item) => (
              <ListItem key={item.id} className="group">
                <div className="flex w-full items-start gap-3">
                  {/* 复选框 */}
                  <input
                    type="checkbox"
                    checked={item.completed || false}
                    onChange={() => handleToggleComplete(item.id)}
                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary"
                    aria-label={item.completed ? "标记为未完成" : "标记为已完成"}
                  />
                  
                  {/* 内容区域 */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-medium text-text truncate transition-colors",
                      item.completed && "text-text-tertiary line-through"
                    )}>
                      {item.title}
                    </p>
                    <p className="text-sm text-text-tertiary mt-0.5">
                      📅 {item.dueDate || "未指定日期"}
                    </p>
                  </div>
                  
                  {/* 删除按钮 */}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="shrink-0 text-text-tertiary hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 p-1"
                    aria-label="删除"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                      <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-text-tertiary mt-2">
                  创建于 {formatTimeLabel(item.createdAt)}
                </p>
              </ListItem>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
