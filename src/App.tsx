import TimeTracker from './components/TimeTracker';

const App: React.FC = () => {
    // يمكنك هنا إضافة منطق التحقق من نظام المصادقة
    
    // مثال على كيفية إضافة خلفية متدرجة متحركة (كما طُلِب في الوصف)
    return (
        <div className="min-h-screen p-8 flex items-center justify-center" 
             style={{ 
                 background: 'linear-gradient(135deg, #a7f3d0, #818cf8, #fbcfe8)', 
                 backgroundSize: '400% 400%',
                 animation: 'gradient-animation 15s ease infinite'
             }}>
             
            {/* **ملاحظة:** تحتاج إلى تعريف الـ keyframes لـ 'gradient-animation' في ملف CSS العام (مثل index.css) */}
            
            <TimeTracker />
        </div>
    );
};

export default App;
