import { CaptchaObserver } from "../types";

/**
 * observer of changes in client's token and captcha's outerHTML
 */
export class DodoCaptchaObserver {
  /**
   * @private
   */
  private _observers: CaptchaObserver[] = [];

  constructor() {}

  /**
   * inserts observer to observers list
   * @param {import("./types/index.d.ts").CaptchaObserver} observer - function that uses observed variables
   * @public
   */
  public attach(observer: CaptchaObserver) {
    this._observers.push(observer);
  }

  /**
   * removes observer from observers list
   * @param {import("./types/index.d.ts").CaptchaObserver} observer - function that uses observed variables
   * @public
   */
  public detach(observer: CaptchaObserver) {
    this._observers = this._observers.filter((obs) => obs !== observer);
  }

  /**
   * updates each observer with current values of the variables
   * @param {{ html?: string; token?: string }} captchaProps - captcha's outerHTML & client's token
   * @public
   */
  public notify(captchaProps: { html?: string; token?: string }) {
    this._observers.forEach((observer) => observer(captchaProps.html, captchaProps.token));
  }
}
