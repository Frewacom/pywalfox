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

  private checkIfDayTime(startTime: ITimeIntervalEndpoint, endTime: ITimeIntervalEndpoint) {
    const currentDate = new Date();
    const currentHour = currentDate.getUTCHours();
    const currentMinute = currentDate.getUTCMinutes();
    let modifiedTimeoutDelay: number = null;
    let result = false;

    // No case for when startTime.hour === endTime.hour, but is should not be needed either
    if (currentHour > startTime.hour && currentHour < endTime.hour) {
      // TODO: Add modifiedTimeoutDelay
      result = true;
    } else if (currentHour === startTime.hour && currentMinute >= startTime.minute) {
      result = true;
    } else if (currentHour === endTime.hour && currentMinute <= endTime.minute) {
      result = true;
      // TODO: Add modifiedTimeoutDelay
    }

    return {
      result,
      modifiedTimeoutDelay,
    };
  }

  private deleteCurrentTimeout() {
    if (this.checkTimeout !== null) {
      clearTimeout(this.checkTimeout);
    }
  }

  private update() {
    console.log('Running auto-mode update');
    const { result, modifiedTimeoutDelay } = this.checkIfDayTime(this.startTime, this.endTime);

    if (result === this.isDay) {
      console.log('No need for update')
      return;
    }

    this.deleteCurrentTimeout();
    this.callback(result);
    this.checkTimeout = window.setTimeout(this.update.bind(this), AUTO_MODE_INTERVAL_MS);
  }

  public start(startTime: ITimeIntervalEndpoint, endTime: ITimeIntervalEndpoint) {
    this.startTime = startTime;
    this.endTime = endTime;
    this.update();
  }

  public setStartTime(startTime: ITimeIntervalEndpoint) {
    this.startTime = startTime;
    this.update();
  }

  public setEndTime(endTime: ITimeIntervalEndpoint) {
    this.endTime = endTime;
    this.update();
  }

  public stop() {
    this.deleteCurrentTimeout();
  }
}
