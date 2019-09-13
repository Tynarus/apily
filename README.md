# APIly

A basic mock service written in JavaScript, for easy implementation into JavaScript UI projects requiring mocks for development or testing.

APIly is written in TypeScript, and as such includes typings. Documentation examples will be written in TypeScript.

## Setting up a Mock Service

Once the APIly package is installed, standing a mock service up is fairly straightforward. We'll start by making the main file that will launch the mock server.

For TypeScript projects, create a new directory called `mock/` at the root of your project, with an appropriate `tsconfig.json` file (your desired tsconfig may vary):
 
```json
{
    "compilerOptions": {
        "module": "commonjs",
        "moduleResolution": "node",
        "target": "es6",
        "outDir": "./dist"
    },
    "include": [
        "./**/*.ts"
    ],
    "exclude": [
        "../node_modules"
    ]
}
```
 
We'll also be adding a new file named `mock-server.ts` with the following content:

```typescript
import { start } from 'apily';

const port = 4300;

start(port);
```

From there, we can add a new script to our `package.json`:

```json
"scripts": {
    "mock-server": "tsc --project ./mock/tsconfig.json && node ./mock/dist/mock/mock-server.js"
}
```

Running this script with `npm run mock-server` should result in the mock service starting with the message `Loaded 0 mock requests`. The port specified above was `4300`, so we should now be able to hit our empty mock service at `http://localhost:4300`.

## Creating Mocks

Heading back into `mock-server.ts`, we can create our very first mock endpoint:

```typescript
import { start, mock } from 'apily';

mock({
    method: 'GET',
    url: '/test',
    responseStatus: 200,
    responseBody: {
        text: 'Hello world!'
    }
});

start();
```

Restart the mock service, and instead we should now get the message `Loaded 1 mock requests`. If we try to hit `http://localhost:4300/test` in our browser, we should be given a JSON response of `{ text: 'Hello world!' }` 

Ideally as more mock are created, they'll be extrapolated out into their own mock files. We can move this test mock into a new file named `test-mock.ts`:

```typescript
import { mock } from 'apily';

mock({
    method: 'GET',
    url: '/test',
    responseStatus: 200,
    responseBody: {
        text: 'Hello world!'
    }
});
```

...and instead now import that file into the main `mock-server.ts` file:

```typescript
import { start } from 'apily';

import './test-mock';

start();
```

This keeps our main mock service file clean and makes mocks easier to find.

## Mock Config

The `mock()` function takes a single parameter, a `MockOptions` object. `MockOptions` is declared as follows:

```typescript
interface MockOptions {
    priority?: number;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
    requestHeaders?: any;
    requestParams?: any;
    requestBody?: any;
    responseStatus: number;
    responseBody?: any;
}
```

- `priority` is the priority of the mock being created. In the case that multiple mocks are found for a given request, the one with the lowest `priority` value will be used. If multiple are found with the same `priority` value, the first one in wins.
- `method` is the required request method. `GET`, `POST`, `PUT`, `PATCH`, or `DELETE`. All calls with the `OPTIONS` method are ignored by APIly.
- `url` the exact url for the mock. `/test`, `/users/1/details`, `/news/items`, or whatever your particular request URL may be. Regex param variables are planned for a future release.
- `requestHeaders` the headers that the mock requires. For example, setting this to `{ 'Authorization': 'Bearer mytoken' }` will mean that the mock will require that any requests send the `Authorization` header with the value `Bearer mytoken`.
- `requestParams` the URL params that the mock requires. This is not yet functional and is planned for a future release.
- `requestBody` the JSON request body required by the mock. 
- `responseStatus` the response status code. Ie `200` for OK, `401` for Unauthorized, `500` for internal server error, etc.
- `responseBody` the JSON body that will be returned by the mock. Additional response types are planned for a future release.
