# dodo-captcha-client

Package that includes a fully wrapped client for handling communication with your backend running [DodoCaptcha](https://github.com/szymonbvg/dodo-captcha)

## Installing

```
npm install dodo-captcha-client
```

## Examples

**NOTE**: If you want to use this package on the frontend without any framework (JS with Bundled Dependencies), you should use a tool like [Browserify](https://browserify.org/). This will bundle your code and the required Node.js packages into a single file that can be included in your HTML with a ``<script>`` tag

### (auto) Fetching & displaying CAPTCHA

```js
const { DodoCaptchaClient } = require("dodo-captcha-client");

const captchaClient = new DodoCaptchaClient("ws://localhost:1337", { fetchOnOpen: true });

const observer = (html, token) => {
	const captchaDiv = document.getElementById("captcha");
	captchaDiv.innerHTML = html;
};

captchaClient.observer.attach(observer);
captchaClient.addMessageListener();

window.addEventListener("beforeunload", () => {
	captchaClient.detach(observer);
	captchaClient.removeMessageListener();
	captchaClient.close();
})
```

**NOTE**: The ``fetchOnOpen`` option is set to true, so the client automatically sends the ``CAPTCHA_GET_CHALLENGE`` message after the websocket connection is initialized. If you want to manually fetch the captcha challenge, you should implement a function that will be invoked when an event occurs

**Example**

JS File

```js
// importing DodoMessageType
const { DodoCaptchaClient, DodoMessageType } = require("dodo-captcha-client");

const captchaClient = new DodoCaptchaClient("ws://localhost:1337"); // default options will be used

// code from previous example

const fetchCaptcha = () => {
	captchaClient.send({type: DodoMessageType.CAPTCHA_GET_CHALLENGE});
}

window.manuallyFetchCaptcha = fetchCaptcha;
```

HTML File

```html
<html>
	<body>
		<button onclick="manuallyFetchCaptcha()">fetch CAPTCHA</button>
		<div id="captcha" />
		<script src="bundledFile.js" />
	</body>
</html>
```

### Solving CAPTCHA

```js
const { DodoCaptchaClient, DodoMessageType } = require("dodo-captcha-client");

const captchaClient = new DodoCaptchaClient("ws://localhost:1337", { fetchOnOpen: true });

let captchaToken;
const observer = (html, token) => {
	const captchaDiv = document.getElementById("captcha");
	captchaDiv.innerHTML = html;
	captchaToken = token;
};

captchaClient.observer.attach(observer);
captchaClient.addMessageListener();

const check = () => {
	const result = document.getElementById("result"); // HTML <input/> element
	captchaClient.send({ type: DodoMessageType.CAPTCHA_CHECK_RESULT, params: result.value });
};
window.checkCaptchaResult = check;

// sending the captcha's token to your backend to check if the client is verified
const sendTokenToBackend = () => {
	fetch("yourBackendURL", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ captchaToken: captchaToken }),
	});
};
window.sendTokenToBackend = sendTokenToBackend;

window.addEventListener("beforeunload", () => {
	captchaClient.detach(observer);
	captchaClient.removeMessageListener();
	captchaClient.close();
});
```

**NOTE**: If you want to inform the user whether they have correctly solved the captcha, you should define a custom verification callback in the ``options`` parameter when creating an instance of the ``DodoCaptchaClient`` class

**Example**

```js
const captchaClient = new DodoCaptchaClient("ws://localhost:1337", {
	verificationCallback: (status) => {
		document.getElementById("status").innerText = status ? "verified" : "not verified";
	}
});
```

### Custom message handling

If you want your custom function to be invoked when the message event occurs, you need to define it as the ``onMessageCallback`` in the ``options`` parameter when creating an instance of the ``DodoCaptchaClient`` class

```js
const captchaClient = new DodoCaptchaClient("ws://localhost:1337", {
	onMessageCallback: (message) => {
		// displaying regeneration button when captcha expires
		if (message.type === DodoMessageType.CAPTCHA_EXPIRED) {
			const regenerateBtn = document.createElement("button");
			regenerateBtn.id = "regenerate";
			regenerateBtn.textContent = "regenerate captcha";
			regenerateBtn.addEventListener("click", () => {
				captchaClient.send({type: DodoMessageType.CAPTCHA_GET_CHALLENGE});
				document.getElementById("regenerate").remove();
			})
			document.body.appendChild(regenerateBtn);
		}
	},
});
```

### Implementing as Custom Hook in React.js

```js
import { DodoCaptchaClient, DodoMessageType } from "dodo-captcha-client";
import { useEffect, useRef, useState } from "react";

function useDodoCaptcha(websocket, options) {
	const [client, setClient] = useState();

	const captchaDiv = useRef(null);
	const [captchaToken, setCaptchaToken] = useState();

	const check = (code) => {
		client?.send({ type: DodoMessageType.CAPTCHA_CHECK_RESULT, params: code });
	};

	useEffect(() => {
		if (!client) {
			setClient(new DodoCaptchaClient(websocket, options));
		}
	}, []);

	useEffect(() => {
		const observer = (html, token) => {
			captchaDiv.current.innerHTML = html;
			setCaptchaToken(token);
		};

		client?.observer.attach(observer);
		client?.addMessageListener();

		return () => {
			client?.observer.detach(observer);
			client?.removeMessageListener();
		};
	}, [client?.handleMessage]);

	return {
		html: <div ref={captchaDiv} />,
		token: captchaToken,
		checkResult: check,
	};
}

export default function App() {
	const statusRef = useRef(null);
	const verificationCb = (status) => {
		statusRef.current.innerText = status ? "verified" : "not verified";
	};

	const inputRef = useRef(null);
	const captcha = useDodoCaptcha("ws://localhost:1337", {
		fetchOnOpen: true,
		verificationCallback: verificationCb,
	});

	return (
		<>
			{captcha.html}
			<input ref={inputRef} />
			<button onClick={() => captcha.checkResult(inputRef.current.value)}>check</button>
			<p ref={statusRef}></p>
		</>
	);
}
```

## License

[MIT](LICENSE)