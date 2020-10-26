import {
  ITimeIntervalEndpoint,
} from '@definitions';

import { AUTO_MODE_INTERVAL_MS } from '@config/general';
import AutoMode, { minuteNumberToMs, checkIfDayTime } from '@pywalfox/background/auto-mode';

const autoMode = new AutoMode(() => {});
const startTime: ITimeIntervalEndpoint = { hour: 10, minute: 30, stringFormat: '10:30' };
const endTime: ITimeIntervalEndpoint = { hour: 19, minute: 0, stringFormat: '19:00' };
const currentTime = new Date();

// Set the initial time interval
function setInitialTimeInterval() {
  autoMode.setStartTime(startTime, false);
  autoMode.setEndTime(endTime, false);
}

// Updates the current hour and minute and returns the 'result' property from checkIfDayTime
function getCheckIfDayTimeResponse(hour: number, minute: number) {
  currentTime.setHours(hour);
  currentTime.setMinutes(minute);
  currentTime.setSeconds(0);

  return checkIfDayTime(currentTime, autoMode.getStartTime(), autoMode.getEndTime());
}

beforeAll(() => {
  setInitialTimeInterval();
});

describe('minuteNumberToMs', () => {
  test('calculates the time in ms until a certain minute', () => {
    const minutesOnly = minuteNumberToMs(2, 0);
    const minutesAndSeconds = minuteNumberToMs(2, 30);

    expect(minutesOnly).toBe(60*2*1000);
    expect(minutesAndSeconds).toBe(60*2*1000 - 30*1000);
  });
});

describe('checkIfDayTime', () => {
  test('returns true if current time is in the selected time interval', () => {
    expect(getCheckIfDayTimeResponse(10, 30).result).toBe(true);
    expect(getCheckIfDayTimeResponse(12, 0).result).toBe(true);
    expect(getCheckIfDayTimeResponse(18, 59).result).toBe(true);
  });

  test('returns false if current time is not in the selected time interval', () => {
    expect(getCheckIfDayTimeResponse(10, 29).result).toBe(false);
    expect(getCheckIfDayTimeResponse(0, 0).result).toBe(false);
    expect(getCheckIfDayTimeResponse(19, 0).result).toBe(false);
  });

  test('timeoutDelay corresponds to the time until the next update', () => {
    expect(getCheckIfDayTimeResponse(10, 29).timeoutDelay).toBe(60000);
    expect(getCheckIfDayTimeResponse(0, 0).timeoutDelay).toBe(AUTO_MODE_INTERVAL_MS);
    expect(getCheckIfDayTimeResponse(19, 0).timeoutDelay).toBe(AUTO_MODE_INTERVAL_MS);
    expect(getCheckIfDayTimeResponse(18, 59).timeoutDelay).toBe(60000);
  });

  test('returns a correct value if the time interval is updated', () => {
    expect(getCheckIfDayTimeResponse(9, 30).result).toBe(false);
    autoMode.setStartTime({ hour: 9, minute: 0, stringFormat: '09:00' }, false);
    expect(getCheckIfDayTimeResponse(9, 30).result).toBe(true);

    expect(getCheckIfDayTimeResponse(20, 30).result).toBe(false);
    autoMode.setEndTime({ hour: 21, minute: 0, stringFormat: '21:00' }, false);
    expect(getCheckIfDayTimeResponse(20, 30).result).toBe(true);
  });
});
