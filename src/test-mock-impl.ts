import { start } from './mock-service';
import { mock, ResponseFile } from './mock';

mock({
    method: 'GET',
    url: '/test',
    responseStatus: 200,
    responseBody: {
        text: 'Hello world!'
    }
});

mock({
    priority: 1,
    method: 'POST',
    url: '/test',
    requestBody: {
        testValue1: 'hello',
        testValue2: 'world'
    },
    responseStatus: 200,
    responseBody: {
        text: 'Hello world!'
    }
});

mock({
    priority: 2,
    method: 'POST',
    url: '/test',
    requestBody: {
        testValue1: /^(.*)$/,
        testValue2: /^(.*)$/
    },
    responseStatus: 401,
    responseBody: {
        text: 'Unauthorized'
    }
});

mock({
    priority: 1,
    method: 'POST',
    url: '/test',
    requestBody: {
        testValue1: 'big',
        testValue2: 'boss'
    },
    responseStatus: 200,
    responseHeaders: {
        'content-type': 'text/plain'
    },
    responseBody: 'hello world'
});

mock({
    priority: 1,
    method: 'POST',
    url: '/test',
    requestBody: {
        testValue1: 'solid',
        testValue2: 'snake'
    },
    responseStatus: 200,
    responseHeaders: {
        'content-type': 'application/pdf'
    },
    responseBody: new ResponseFile('./files/test.pdf')
});

start();
