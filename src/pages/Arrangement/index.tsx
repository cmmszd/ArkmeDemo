import { useState, useEffect } from 'react';

interface Arrangement {
  id: number;
  title: string;
  dueDate: string;
  completed: boolean;
  createdAt: string;
}

export default function ArrangementPage() {
  const [arrangements, setArrangements] = useState<Arrangement[]>([]);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [aiInput, setAiInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [completedCollapsed, setCompletedCollapsed] = useState(true); // 默认折叠

  // 加载数据
  useEffect(() => {
    const stored = localStorage.getItem('arrangements');
    if (stored) setArrangements(JSON.parse(stored));
  }, []);

  // 保存数据
  useEffect(() => {
    localStorage.setItem('arrangements', JSON.stringify(arrangements));
  }, [arrangements]);

  const addArrangement = (newArr: Omit<Arrangement, 'id' | 'createdAt'>) => {
    setArrangements(prev => [...prev, {
      ...newArr,
      id: Date.now(),
      createdAt: new Date().toISOString()
    }]);
  };

  const toggleComplete = (id: number) => {
    setArrangements(prev => prev.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const deleteArrangement = (id: number) => {
    setArrangements(prev => prev.filter(item => item.id !== id));
  };

  const handleManualCreate = () => {
    if (!title.trim()) return;
    addArrangement({ title: title.trim(), dueDate: dueDate || new Date().toISOString().slice(0, 10), completed: false });
    setTitle('');
    setDueDate('');
  };

  const handleAICreate = async () => {
    if (!aiInput.trim()) return;
    setLoading(true);
    try {
      const { parseArrangementFromText } = await import('@/services/aliyun');
      const result = await parseArrangementFromText(aiInput);
      addArrangement({ title: result.title, dueDate: result.dueDate, completed: false });
      setAiInput('');
    } catch (error) {
      console.error('AI创建失败:', error);
      alert('识别失败，请手动创建');
    } finally {
      setLoading(false);
    }
  };

  // 排序和分组
  const sorted = [...arrangements].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });
  const active = sorted.filter(a => !a.completed);
  const completed = sorted.filter(a => a.completed);

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      <div className="max-w-md mx-auto space-y-4">
        {/* AI 快速添加 */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">🤖 AI 快速添加</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="例如：下周五下午开会"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              onKeyDown={(e) => e.key === 'Enter' && handleAICreate()}
            />
            <button
              onClick={handleAICreate}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? '识别中...' : '识别'}
            </button>
          </div>
        </div>

        {/* 手动创建 */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">✍️ 手动创建</h2>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="安排标题"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleManualCreate}
            className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            创建安排
          </button>
        </div>

        {/* 未完成列表 */}
        <div className="space-y-2">
          {active.map(item => (
            <ArrangementCard
              key={item.id}
              item={item}
              onToggle={toggleComplete}
              onDelete={deleteArrangement}
            />
          ))}
        </div>

        {/* 已完成区域（可折叠） */}
        {completed.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => setCompletedCollapsed(!completedCollapsed)}
              className="flex items-center justify-between w-full text-gray-500 text-sm py-2 border-t border-gray-200"
            >
              <span>✅ 已完成 ({completed.length})</span>
              <span className="text-lg">{completedCollapsed ? '▼' : '▲'}</span>
            </button>
            
            {!completedCollapsed && (
              <div className="space-y-2 mt-2 opacity-70">
                {completed.map(item => (
                  <ArrangementCard
                    key={item.id}
                    item={item}
                    onToggle={toggleComplete}
                    onDelete={deleteArrangement}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// 安排卡片组件
function ArrangementCard({ item, onToggle, onDelete }: { item: Arrangement; onToggle: (id: number) => void; onDelete: (id: number) => void }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-4 flex items-center justify-between transition-all ${item.completed ? 'opacity-70' : ''}`}>
      <div className="flex items-center gap-3 flex-1">
        <input
          type="checkbox"
          checked={item.completed}
          onChange={() => onToggle(item.id)}
          className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-400"
        />
        <div className="flex-1">
          <p className={`text-gray-800 ${item.completed ? 'line-through text-gray-400' : ''}`}>
            {item.title}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            📅 {item.dueDate}
          </p>
        </div>
      </div>
      <button
        onClick={() => onDelete(item.id)}
        className="text-gray-400 hover:text-red-500 transition-colors px-2"
      >
        🗑️
      </button>
    </div>
  );
}