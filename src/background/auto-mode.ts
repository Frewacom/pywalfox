import {
  ITimeIntervalEndpoint,
  IAutoModeTriggerCallback,
} from '@definitions';

import { sendDebuggingOutput } from '@communication/content-scripts/ui';

export const AUTO_MODE_ALARM_ID = 'pywalfox-auto-mode-alarm';

export default class AutoMode {
  private startTime: ITimeIntervalEndpoint;
  private endTime: ITimeIntervalEndpoint;
  private callback: IAutoModeTriggerCallback;
  private isDay: boolean;

  constructor(callback: IAutoModeTriggerCallback) {
    this.callback = callback;
    this.startTime = null;
    this.endTime = null;

    browser.alarms.onAlarm.addListener(this.update.bind(this));
  }

  private endpointToDate(endpoint: ITimeIntervalEndpoint) {
    const date = new Date();
    date.setHours(endpoint.hour);
    date.setMinutes(endpoint.minute);
    date.setSeconds(0);
    return date;
  }

  private isCurrentlyDay() {
    const currentDate = new Date();
    const startDate = this.endpointToDate(this.startTime);
    const endDate = this.endpointToDate(this.endTime);

    return currentDate >= startDate && currentDate < endDate;
  }

  private update() {
    this.isDay = this.isCurrentlyDay();
    this.callback(this.isDay);
    this.updateTimer();
  }

  private updateTimer() {
    browser.alarms.clear(AUTO_MODE_ALARM_ID);
    const currentDate = new Date();

    if (this.isCurrentlyDay()) {
      const endDate = this.endpointToDate(this.endTime);
      browser.alarms.create(AUTO_MODE_ALARM_ID, { when: endDate.valueOf() });
    } else {
      const startDate = this.endpointToDate(this.startTime);
      if (currentDate > startDate) {
        startDate.setDate(startDate.getDate() + 1);
      }

      browser.alarms.create(AUTO_MODE_ALARM_ID, { when: startDate.valueOf() });
    }
  }

  public start(startTime: ITimeIntervalEndpoint, endTime: ITimeIntervalEndpoint) {
    this.startTime = startTime;
    this.endTime = endTime;
    this.update();
    sendDebuggingOutput('Started auto theme mode');
  }

  public setStartTime(startTime: ITimeIntervalEndpoint, isApplied: boolean) {
    this.startTime = startTime;
    isApplied && this.update();
  }

  public setEndTime(endTime: ITimeIntervalEndpoint, isApplied: boolean) {
    this.endTime = endTime;
    isApplied && this.update();
  }

  public getStartTime() { return this.startTime; }
  public getEndTime() { return this.endTime; }

  public stop() {
    browser.alarms.clear(AUTO_MODE_ALARM_ID);
    sendDebuggingOutput('Stopped auto theme mode');
  }
}
