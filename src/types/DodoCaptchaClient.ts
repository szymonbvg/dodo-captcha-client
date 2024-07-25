export enum DodoMessageType {
  /**
   * message sent by client to generate the captcha
   */
  CAPTCHA_GET_CHALLENGE = "captcha.get.challenge",
  
  /**
   * message sent by server containing captcha's outerHTML as parameter
   */
  CAPTCHA_CHALLENGE = "captcha.challenge",

  /**
   * message sent by server when captcha expires,
   * contains captcha's outerHTML with expiration information
   */
  CAPTCHA_EXPIRED = "captcha.expired",

  /**
   * message sent by client to verify if they have correctly solved captcha challenge,
   * message should contain code of captcha challenge solution
   */
  CAPTCHA_CHECK_RESULT = "captcha.check.result",

  /**
   * message sent by server when code sent by client is correct,
   * contains client's token as parameter
   */
  CAPTCHA_VERIFIED = "captcha.verified",

  /**
   * message sent by server when code sent by client is incorrent
   */
  CAPTCHA_NOT_VERIFIED = "captcha.not.verified",
}

export type DodoCaptchaMessage = {
  /**
   * message type
   * @type {DodoMessageType}
   */
  type: DodoMessageType;

  /**
   * message parameters
   * @type {string | undefined}
   */
  params?: string;
};

export type DodoClientOptions = {
  /**
   * custom function that will be invoked during the verification
   * @param {boolean} status - boolean variable whose value will be set based on the verification
   * @returns {void}
   * @example
   * verificationCallback: (status) => {
   *  document.getElementById("status").innerText = status ? "verified" : "not verified";
   * }
   */
  verificationCallback?: (status: boolean) => void;

  /**
   * custom function that will be invoked during the message handling
   * @param {DodoCaptchaMessage} message - message passed from the event handler
   * @returns {void}
   * @example
   * onMessageCallback: (message) => {
   *  if (message.type === DodoMessageType.CAPTCHA_EXPIRED) {
   *    // regenerate the captcha
   *  }
   * }
   */
  onMessageCallback?: (message: DodoCaptchaMessage) => void;

  /**
   * automatically fetches the captcha challenge after the websocket connection is established
   * @type {boolean | undefined}
   */
  fetchOnOpen?: boolean;
}

export type CaptchaObserver = (html?: string, token?: string) => void;