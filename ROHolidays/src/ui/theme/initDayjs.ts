// Central place to register dayjs plugins so every import shares the same instance.
import dayjs from 'dayjs';
import localeData from 'dayjs/plugin/localeData';
import weekday from 'dayjs/plugin/weekday';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import 'dayjs/locale/ro';

dayjs.extend(localeData);
dayjs.extend(weekday);
dayjs.extend(isSameOrAfter);
dayjs.locale('ro');

export { dayjs };
