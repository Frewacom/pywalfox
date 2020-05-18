import { ITimeIntervalEndpoint } from '../definitions';

export function isDayTime(
  start: ITimeIntervalEndpoint,
  end: ITimeIntervalEndpoint,
  callback: (isDay: boolean) => void,
) {
  const currentDate = new Date();
  const currentHour = currentDate.getUTCHours();
  const currentMinute = currentDate.getUTCMinutes();
  let result: boolean = false;

  // No case for when start.hour === end.hour, but is should not be needed either
  if (currentHour > start.hour && currentHour < end.hour) {
    result = true;
  } else if (currentHour === start.hour && currentMinute >= start.minute) {
    result = true;
  } else if (currentHour === end.hour && currentMinute <= end.minute) {
    result = true;
  }

  callback(result);
}
