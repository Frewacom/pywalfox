import { AUTO_MODE_INTERVAL_MS } from '../config/general';

import {
  ITimeIntervalEndpoint,
  IAutoModeTriggerCallback
} from '../definitions';

export class AutoMode {
  private startTime: ITimeIntervalEndpoint;
  private endTime: ITimeIntervalEndpoint;
  private callback: IAutoModeTriggerCallback;
  private checkTimeout: number;
  private isDay: boolean;

  constructor(callback: IAutoModeTriggerCallback) {
    this.callback = callback;

    this.startTime = null;
    this.endTime = null;
    this.checkTimeout = null;
    this.isDay = null;
  }

  private minuteNumberToMs(minute: number, currentSecond: number) {
    return Math.abs(minute * 60 * 1000 - (currentSecond * 1000));
  }

  private checkIfDayTime(startTime: ITimeIntervalEndpoint, endTime: ITimeIntervalEndpoint) {
    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();
    const currentSecond = currentDate.getSeconds();
    let timeoutDelay = AUTO_MODE_INTERVAL_MS;
    let result = false;

    if (currentHour > startTime.hour && currentHour < endTime.hour) {
      if (currentHour === (endTime.hour - 1) && endTime.minute <= AUTO_MODE_INTERVAL_MS) {
        const difference = (60 + endTime.minute) - currentMinute;
        if (difference < AUTO_MODE_INTERVAL_MS && difference !== 0) {
          timeoutDelay = this.minuteNumberToMs(difference, currentSecond);
        }
      }
      result = true;
    } else if (currentHour === startTime.hour) {
      if (currentMinute >= startTime.minute) {
        result = true;
      } else {
        const difference = startTime.minute - currentMinute;
        if (difference < AUTO_MODE_INTERVAL_MS) {
          timeoutDelay = this.minuteNumberToMs(difference, currentSecond);
        }
      }
    } else if (currentHour === endTime.hour && currentMinute < endTime.minute) {
      const difference = endTime.minute - currentMinute;
      if (difference < AUTO_MODE_INTERVAL_MS && difference !== 0) {
        timeoutDelay = this.minuteNumberToMs(difference, currentSecond);
      }
      result = true;
    }

    return {
      result,
      timeoutDelay,
    };
  }

  private deleteCurrentTimeout() {
    if (this.checkTimeout !== null) {
      clearTimeout(this.checkTimeout);
      this.checkTimeout = null;
    }
  }

  private update() {
    const { result, timeoutDelay } = this.checkIfDayTime(this.startTime, this.endTime);

    if (result === this.isDay) {
      return;
    }

    this.callback(result);
    this.checkTimeout = window.setTimeout(this.update.bind(this), timeoutDelay);
    this.isDay = result;
  }

  private applyUpdatedInterval() {
    this.deleteCurrentTimeout();
    this.update();
  }

  public start(startTime: ITimeIntervalEndpoint, endTime: ITimeIntervalEndpoint) {
    this.startTime = startTime;
    this.endTime = endTime;
    this.applyUpdatedInterval();
    console.log('Started auto theme mode');
  }

  public setStartTime(startTime: ITimeIntervalEndpoint, isApplied: boolean) {
    this.startTime = startTime;
    isApplied && this.applyUpdatedInterval();
  }

  public setEndTime(endTime: ITimeIntervalEndpoint, isApplied: boolean) {
    this.endTime = endTime;
    isApplied && this.applyUpdatedInterval();
  }

  public stop() {
    this.deleteCurrentTimeout();
    console.log('Stopped auto theme mode');
  }
}
