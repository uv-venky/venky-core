import { addDays } from 'date-fns';
export function getDateOnlyString(days = 0) {
    let today = new Date();
    today = addDays(today, days);
    const year = today.getUTCFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // months are 0-based
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
//# sourceMappingURL=date-utils.js.map