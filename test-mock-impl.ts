import start from './mock-service';
import { mock } from './mock';

mock({
    method: 'GET',
    url: '/test',
    responseStatus: 200,
    responseBody: {
        text: 'Hello world!'
    }
});

start();
