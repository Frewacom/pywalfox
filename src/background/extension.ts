import { NativeApp } from './native-app'

export class Extension {
  private nativeApp : NativeApp;

  constructor() {
    this.nativeApp = new NativeApp()
  }

  start() {
    console.log('Hello world')
  }
}
