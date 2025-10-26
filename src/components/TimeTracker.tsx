import React, { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { TimeTrackerState } from '../types'; // استخدام النوع الذي عرفناه
import { Clock, Play, StopCircle, CornerDownRight } from 'lucide-react';

// القيمة الافتراضية لحالة متتبع الوقت
const DEFAULT_STATE: TimeTrackerState = {
    isClockedIn: false,
    startTime: null,
    breakMinutes: 0,
    notes: "",
};

// **ملاحظة:** تم استخدام فئات Tailwind CSS بشكل مباشر كما هو مطلوب في الوصف.

const TimeTracker: React.FC = () => {
    // استخدام Hook المخصص لحفظ حالة التتبع
    const [trackerState, setTrackerState] = useLocalStorage<TimeTrackerState>('timeTrackerState', DEFAULT_STATE);
    const { isClockedIn, startTime, breakMinutes, notes } = trackerState;

    // حالة المدة المنقضية (للعرض المباشر)
    const [elapsedTime, setElapsedTime] = useState(0);

    // دالة مساعدة لتنسيق الثواني إلى (ساعات:دقائق:ثواني)
    const formatTime = (totalSeconds: number): string => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);

        return [hours, minutes, seconds]
            .map(v => v.toString().padStart(2, '0'))
            .join(':');
    };

    // تأثير لتحديث العداد الزمني كل ثانية
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isClockedIn && startTime !== null) {
            interval = setInterval(() => {
                const now = Date.now();
                // حساب المدة بالملي ثانية ثم بالثواني
                setElapsedTime(Math.floor((now - startTime) / 1000));
            }, 1000);
        } else {
            // إعادة ضبط العداد عندما لا تكون المناوبة قائمة
            setElapsedTime(0);
        }

        // تنظيف المؤقت عند إزالة المكون أو تغيير isClockedIn
        return () => clearInterval(interval);
    }, [isClockedIn, startTime]);

    // **منطق بدء المناوبة (Clock In)**
    const handleClockIn = useCallback(() => {
        if (!isClockedIn) {
            // حفظ وقت البدء الحالي (Timestamp)
            const newStartTime = Date.now();
            setTrackerState({
                ...trackerState,
                isClockedIn: true,
                startTime: newStartTime,
            });
            // رسالة تنبيه (Toast) - سيتم تطبيقها لاحقاً
            // showToast("تم بدء المناوبة بنجاح!");
        }
    }, [isClockedIn, setTrackerState, trackerState]);

    // **منطق إنهاء المناوبة (Clock Out)**
    const handleClockOut = useCallback(() => {
        if (isClockedIn && startTime !== null) {
            const endTime = Date.now();
            
            // **هنا يتم تطبيق منطق حفظ السجل الكامل إلى قاعدة البيانات (Firebase/Firestore).**
            // **(سيتم تنفيذه لاحقاً في خدمة Firebase)**
            
            const logData = {
                startTime: startTime,
                endTime: endTime,
                breakMinutes: breakMinutes,
                notes: notes,
                // يتم حفظ هذا السجل الآن...
            };

            console.log("تم حفظ سجل الدوام:", logData);

            // إعادة ضبط الحالة (مهم جدًا)
            setTrackerState(DEFAULT_STATE);
            // showToast("تم إنهاء المناوبة وحفظ السجل!");
        }
    }, [isClockedIn, startTime, breakMinutes, notes, setTrackerState]);


    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-lg mx-auto">
            
            {/* 1. ساعة رقمية حية وعرض التاريخ */}
            <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
                <div className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    {new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 text-right">
                    {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* 2. عداد مدة المناوبة */}
            <div className={`text-center mb-8 p-4 rounded-lg transition-colors duration-500 ${isClockedIn ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'bg-gray-50 dark:bg-gray-700'}`}>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    {isClockedIn ? "المدة المنقضية:" : "جاهز لبدء المناوبة:"}
                </p>
                <div className="text-6xl font-mono font-bold text-gray-900 dark:text-white transition-opacity duration-300">
                    {formatTime(elapsedTime)}
                </div>
            </div>
            
            {/* 3. زر بدء/إيقاف المناوبة */}
            <button
                onClick={isClockedIn ? handleClockOut : handleClockIn}
                className={`w-full flex items-center justify-center py-4 px-6 rounded-xl text-white font-bold text-xl transition-all duration-300 transform hover:scale-[1.01] shadow-lg
                    ${isClockedIn 
                        ? 'bg-red-500 hover:bg-red-600 shadow-red-500/50' 
                        : 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/50'
                    }`}
            >
                {isClockedIn ? (
                    <>
                        <StopCircle className="w-6 h-6 ml-2" />
                        إنهاء المناوبة (Clock Out)
                    </>
                ) : (
                    <>
                        <Play className="w-6 h-6 ml-2" />
                        بدء المناوبة (Clock In)
                    </>
                )}
            </button>

            {/* 4. مدخلات المناوبة الحالية */}
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 space-y-4">
                {/* حقل الاستراحة */}
                <div>
                    <label htmlFor="break" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mb-1">
                        <Clock className="w-4 h-4 ml-1 text-indigo-500" />
                        مدة الاستراحة (بالدقائق):
                    </label>
                    <input
                        id="break"
                        type="number"
                        min="0"
                        value={breakMinutes}
                        onChange={(e) => 
                            setTrackerState(prev => ({ 
                                ...prev, 
                                breakMinutes: Math.max(0, parseInt(e.target.value) || 0) 
                            }))
                        }
                        disabled={isClockedIn} // لا يمكن تغيير الاستراحة أثناء التشغيل (حسب الرغبة)
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* حقل الملاحظات */}
                <div>
                    <label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mb-1">
                        <CornerDownRight className="w-4 h-4 ml-1 text-indigo-500" />
                        ملاحظات المناوبة:
                    </label>
                    <textarea
                        id="notes"
                        rows={3}
                        value={notes}
                        onChange={(e) => 
                            setTrackerState(prev => ({ 
                                ...prev, 
                                notes: e.target.value 
                            }))
                        }
                        disabled={isClockedIn} // لا يمكن تغيير الملاحظات أثناء التشغيل (حسب الرغبة)
                        placeholder="العمل على مشروع X..."
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    />
                </div>
            </div>
        </div>
    );
};

export default TimeTracker;
