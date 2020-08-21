import {
  ITimeIntervalEndpoint,
} from '@definitions';

import AutoMode, { minuteNumberToMs, checkIfDayTime } from '@pywalfox/background/auto-mode.ts';

const autoMode = new AutoMode(() => {});
const startTime: ITimeIntervalEndpoint = { hour: 10, minute: 30, stringFormat: '10:30' };
const endTime: ITimeIntervalEndpoint = { hour: 20, minute: 0, stringFormat: '20:00' };
const currentTime = new Date();

// Updates the current hour and minute and returns the 'result' property from checkIfDayTime
function getCheckIfDayTimeResponse(hour: number, minute: number) {
  currentTime.setHours(hour);
  currentTime.setMinutes(minute);

  return checkIfDayTime(currentTime, startTime, endTime);
}

test('minuteNumberToMs calculates the time in ms until a certain minute', () => {
  const minutesOnly = minuteNumberToMs(2, 0);
  const minutesAndSeconds = minuteNumberToMs(2, 30);

  expect(minutesOnly).toBe(60*2*1000);
  expect(minutesAndSeconds).toBe(60*2*1000 - 30*1000);
});

test('checkIfDayTime returns true if current time is between selected time interval', () => {
  expect(getCheckIfDayTimeResponse(10, 30).result).toBe(true);
  expect(getCheckIfDayTimeResponse(12, 0).result).toBe(true);
  expect(getCheckIfDayTimeResponse(19, 59).result).toBe(true);
});

test('checkIfDayTime returns false if current time is not between selected time interval', () => {
  expect(getCheckIfDayTimeResponse(10, 29).result).toBe(false);
  expect(getCheckIfDayTimeResponse(0, 0).result).toBe(false);
  expect(getCheckIfDayTimeResponse(20, 0).result).toBe(false);
});

// add tests for validating the 'timeoutDelay' property from checkIfDayTime
