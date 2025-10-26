// النوع الخاص بحالة متتبع الوقت المخزنة محلياً
export interface TimeTrackerState {
    isClockedIn: boolean;
    startTime: number | null; // Timestamp (عدد بالملي ثانية) لوقت بدء المناوبة
    breakMinutes: number;
    notes: string;
}

// نوع الإجراءات التي يمكن تنفيذها على سجل الدوام
export type LogType = 'WORK' | 'SICK' | 'ANNUAL_LEAVE';

// النوع الخاص بالسجل الكامل (سيتم استخدامه في Log History)
export interface TimeLog {
    id: string; // UUID
    userId: string; // أو 'GUEST'
    type: LogType;
    startTime: number;
    endTime: number;
    breakMinutes: number;
    notes: string;
    // قد يتم إضافة 'calculatedDuration' و 'overtime' لاحقاً
}
