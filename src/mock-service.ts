import * as express from 'express';
import * as bodyParser from 'body-parser';
import { mocks, mockMap, Mock } from './mock';

function getClass(obj) {
    return Object.prototype.toString.call(obj);
}

function objectTester(a, b) {
    // If a and b reference the same value, return true
    if(a === b) {
        return true;
    }

    // Already know types are the same, so if type is number
    // and both NaN, return true
    if(typeof a == 'number' && isNaN(a) && isNaN(b)) {
        return true;
    }

    // Get internal [[Class]]
    const aClass = getClass(a);
    const bClass = getClass(b);

    // Return false if not same class
    if(aClass != bClass) {
        // Unless we're looking for a regex
        if(aClass == '[object RegExp]') {
            const aReg = a as RegExp;
            return aReg.test(b.toString());
        } else if(bClass == '[object RegExp]') {
            const bReg = b as RegExp;
            return bReg.test(a.toString());
        }

        return false;
    }

    // If a and b aren't the same type, return false
    if(typeof a != typeof b) {
        return false;
    }

    // If they're Boolean, String or Number objects, check values
    if(aClass == '[object Boolean]' || aClass == '[object String]' || aClass == '[object Number]') {
        return a.valueOf() == b.valueOf();
    }

    // If they're RegExps, Dates or Error objects, check stringified values
    if(aClass == '[object RegExp]' || aClass == '[object Date]' || aClass == '[object Error]') {
        return a.toString() == b.toString();
    }

    // Otherwise they're Objects, Functions or Arrays or some kind of host object
    if(typeof a == 'object' || typeof a == 'function') {

        // For functions, check stringigied values are the same
        // Almost certainly false if a and b aren't trivial
        // and are different functions
        if(aClass == '[object Function]' && a.toString() != b.toString()) {
            return false;
        }

        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);

        // If they don't have the same number of keys, return false
        if(aKeys.length != bKeys.length) {
            return false;
        }

        // Check they have the same keys
        if(!aKeys.every((key) => b.hasOwnProperty(key))) {
            return false;
        }

        // Check key values - uses ES5 Object.keys
        return aKeys.every((key) => objectTester(a[key], b[key]));
    }

    return false;
}

function matchingRequestBody(mock: Mock, request: express.Request) {
    const requiredBody = mock.mockRequest.body;
    if(requiredBody !== undefined && requiredBody !== null) {
        return (objectTester(requiredBody, request.body));
    }

    // Body not required by mock, return true
    return true;
}

function matchingRequestHeaders(mock: Mock, request: express.Request) {
    const requiredHeaders = mock.mockRequest.headers;
    if(requiredHeaders !== undefined && requiredHeaders !== null) {
        let value: boolean = true;
        const keys = Object.keys(requiredHeaders);
        for(const key of keys) {
            const header = request.headers[key.toLowerCase()];
            if(!header || header !== requiredHeaders[key]) {
                value = false;
                break;
            }
        }

        return value;
    }

    // Headers not required by mock, return true
    return true;
}

export function start(port = 4300) {
    for(const mock of mocks) {
        const key = mock.mockRequest.url + ':' + mock.mockRequest.method;
        if(!mockMap[key]) {
            mockMap[key] = [];
        }

        mockMap[key].push(mock);
    }

    const app: express.Application = express();
    app.use(bodyParser.json());

    // @TODO query params
    app.all('*', function(request: express.Request, response: express.Response) {
        const requestUrl = request.path;
        const requestMethod = request.method;

        if(requestMethod === 'OPTIONS') {
            response.sendStatus(200);
            return;
        }

        const key = requestUrl + ':' + requestMethod;
        const initialMatchingMocks: Mock[] = mockMap[key];

        if(!initialMatchingMocks) {
            response.status(404).send(`Could not find mocks for ${requestMethod} ${requestUrl}`);
            return;
        }

        const fullyMatchingMocks: Mock[] = [];
        const hasRequestBody = request.body && Object.keys(request.body).length !== 0;

        for(const checkMock of initialMatchingMocks) {
            let foundMatch: boolean = true;

            foundMatch = matchingRequestBody(checkMock, request);

            if(foundMatch) {
                foundMatch = matchingRequestHeaders(checkMock, request);
            }

            if(foundMatch) {
                fullyMatchingMocks.push(checkMock);
                break;
            }
        }

        if(fullyMatchingMocks.length === 0) {
            let errorResponse = `Could not find matching request for ${requestMethod} ${requestUrl}`;
            if(hasRequestBody) {
                errorResponse += ` with body\n${JSON.stringify(request.body, null, 4)}`;
            }

            response.status(404).send(errorResponse);
        } else {
            // Find and use the mock with the highest priority (smallest priority number)
            let highestPriorityMock: Mock;

            if(fullyMatchingMocks.length === 1) {
                highestPriorityMock = fullyMatchingMocks[0];
            } else {
                for(const checkMock of fullyMatchingMocks) {
                    if(highestPriorityMock === undefined) {
                        highestPriorityMock = checkMock;
                    } else {
                        const priority = checkMock.priority === undefined ? 0 : checkMock.priority;
                        const currentHighestPriority = highestPriorityMock.priority === undefined ? 0 : highestPriorityMock.priority;

                        if(priority < currentHighestPriority) {
                            highestPriorityMock = checkMock;
                        }
                    }
                }
            }

            if(highestPriorityMock.mockResponse.body) {
                response.status(highestPriorityMock.mockResponse.status).send(highestPriorityMock.mockResponse.body);
            } else {
                response.sendStatus(highestPriorityMock.mockResponse.status);
            }
        }
    });

    app.listen(port, function() {
        console.log('Loaded ' + mocks.length + ' mock requests');
    });
}
