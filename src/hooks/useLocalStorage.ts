import { useState, useEffect } from 'react';

// دالة لجلب القيمة الابتدائية من التخزين المحلي
function getStorageValue<T>(key: string, defaultValue: T): T {
    // التحقق من أن الكود يعمل في بيئة المتصفح (لتجنب أخطاء SSR)
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                return JSON.parse(saved) as T;
            } catch (error) {
                // في حالة فشل التحليل (Parse error)، نرجع القيمة المحفوظة كنص إذا كانت تطابق نوع T
                console.error("Failed to parse JSON from localStorage for key:", key, error);
                return saved as unknown as T;
            }
        }
    }
    return defaultValue;
}

/**
 * Custom Hook لإدارة حالة في React وتخزينها تلقائيًا في localStorage.
 *
 * @param key المفتاح المستخدم في localStorage.
 * @param defaultValue القيمة الافتراضية إذا لم يتم العثور على شيء في localStorage.
 * @returns [state, setState] كما في useState.
 */
export function useLocalStorage<T>(key: string, defaultValue: T) {
    // تهيئة الحالة بالقيمة المحفوظة أو القيمة الافتراضية
    const [value, setValue] = useState<T>(() => {
        return getStorageValue(key, defaultValue);
    });

    // استخدام useEffect لحفظ الحالة في localStorage كلما تغيرت
    useEffect(() => {
        // يتم تحويل القيمة إلى نص JSON قبل الحفظ
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue] as const;
}

/* * **كيفية الاستخدام:**
* const [theme, setTheme] = useLocalStorage('appTheme', 'light'); 
* أو
* const [startTime, setStartTime] = useLocalStorage<number | null>('startTime', null); 
*/
