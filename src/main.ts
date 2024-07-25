import { DodoCaptchaObserver } from "./util/CaptchaObserver";
import { DodoCaptchaMessage, DodoMessageType, DodoClientOptions } from "./types/DodoCaptchaClient";

/**
 * main DodoCaptcha's client class used to initialize websocket communication with captcha's backend
 */
class DodoCaptchaClient {
  /**
   * observer of changes in client's token and captcha's outerHTML
   * @type {DodoCaptchaObserver}
   * @public
   * @readonly
   */
  public readonly observer: DodoCaptchaObserver = new DodoCaptchaObserver();

  /**
   * @private
   */
  private _config?: DodoClientOptions;
  
  /**
   * @private
   */
  private _html?: string;

  /**
   * @private
   */
  private _token?: string;

  /**
   * @private
   */
  private _ws?: WebSocket;

  /**
   * @param {string} websocketURL - url to websocket server with the port set during captcha initialization on backend
   * @param {import("./types/index.d.ts").DodoClientOptions} options - automatically fetches the captcha challenge after the websocket connection is established
   */
  constructor(websocketURL: string, options?: DodoClientOptions) {
    this._ws = new WebSocket(websocketURL);
    this._config = options;

    if (this._config?.fetchOnOpen) {
      this._ws.addEventListener("open", () => {
        this.send({type: DodoMessageType.CAPTCHA_GET_CHALLENGE});
      }, {once: true})
    }
  }

  /**
   * adds an event listener to the websocket for handling messages
   * @public
   */
  public addMessageListener() {
    this._ws?.addEventListener("message", (e: MessageEvent) => this.handleMessage(e));
  }

  /**
   * removes message event listener from the websocket
   * @public
   */
  public removeMessageListener() {
    this._ws?.removeEventListener("message", (e: MessageEvent) => this.handleMessage(e));
  }

  /**
   * @returns {string | undefined} captcha's outerHTML
   * @public
   */
  public get html(): string | undefined {
    return this._html;
  }

  /**
   * @returns {string | undefined} client's verification token
   * @public
   */
  public get token(): string | undefined {
    return this._token;
  }

  /**
   * @returns {WebSocket | undefined} captcha's websocket
   * @public
   */
  public get websocket(): WebSocket | undefined {
    return this._ws;
  }

  /**
   * default ready to use message handler
   * @param {MessageEvent} evt - message event from event listener
   * @public
   * @example
   * // custom websocket event listener with default message handler
   * captchaClient.websocket.addEventListener("message", (e) => captchaClient.handleMessage(e));
   */
  public handleMessage(evt: MessageEvent) {
    const parsed = JSON.parse(evt.data) as DodoCaptchaMessage;

    switch (parsed.type) {
      case DodoMessageType.CAPTCHA_CHALLENGE: {
        this._html = parsed.params;
        this.observer.notify({ html: this._html, token: this._token });
        break;
      }
      case DodoMessageType.CAPTCHA_EXPIRED: {
        this._html = parsed.params;
        this._token = undefined;
        this.observer.notify({ html: this._html, token: this._token });
        break;
      }
      case DodoMessageType.CAPTCHA_NOT_VERIFIED: {
        this._config?.verificationCallback?.(false);
        this.send({ type: DodoMessageType.CAPTCHA_GET_CHALLENGE });
        break;
      }
      case DodoMessageType.CAPTCHA_VERIFIED: {
        this._config?.verificationCallback?.(true);
        this._token = parsed.params;
        this.observer.notify({ html: this._html, token: this.token });
        break;
      }
    }

    this._config?.onMessageCallback?.(parsed);
  }

  /**
   * closes the websocket connection
   * @public
   */
  public close() {
    this._html = undefined;
    this._token = undefined;
    this.websocket?.close();
  }

  /**
   * sends formatted captcha message
   * @param {import("./types/index.d.ts").DodoCaptchaMessage} message - message according to the scheme: type, parameters?
   * @public
   * @example
   * // fetching captcha
   * captchaClient.send({type: DodoMessageType.CAPTCHA_GET_CHALLENGE});
   */
  public send(message: DodoCaptchaMessage) {
    this.websocket?.send(JSON.stringify(message));
  }
}

export { DodoCaptchaClient, DodoMessageType }