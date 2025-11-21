// Helper de fechas reutilizable
// Nota: nombres snake_case y descriptivos

const MONTHS_SHORT_ES = [
    'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'
];

export function get_spanish_short_month(index: number): string {
    return MONTHS_SHORT_ES[index] ?? '';
}

export function format_day_month_year_spanish(dateInput: string | Date | null | undefined): string {
    if (!dateInput) return '';
    let date: Date;
    if (dateInput instanceof Date) {
        date = dateInput;
    } else if (typeof dateInput === 'string') {
        // Acepta formatos: YYYY/MM/DD, YYYY-MM-DD, YYYY-MM-DD HH:MM:SS
        let normalized = dateInput.trim();
        if (/^\d{4}\/\d{2}\/\d{2}$/.test(normalized)) {
            const [y, m, d] = normalized.split('/').map(Number);
            date = new Date(y, m - 1, d);
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
            const [y, m, d] = normalized.split('-').map(Number);
            date = new Date(y, m - 1, d);
        } else {
            // Intento genérico (reemplaza espacio por T para Safari/iOS)
            normalized = normalized.replace(' ', 'T');
            const parsed = new Date(normalized);
            if (isNaN(parsed.getTime())) return '';
            date = parsed;
        }
    } else {
        return '';
    }
    const day = date.getDate();
    const monthStr = get_spanish_short_month(date.getMonth());
    const year = date.getFullYear();
    return `${day} ${monthStr}, ${year}`;
}

export function parse_yyyy_mm_dd_from_slash(dateStr: string): Date | null {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length < 3) return null;
    const [y, m, d] = parts.map(Number);
    if (!y || !m || !d) return null;
    const dt = new Date(y, m - 1, d);
    return isNaN(dt.getTime()) ? null : dt;
}
