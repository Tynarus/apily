export const mocks: Mock[] = [];
export const mockMap = {};

export class ResponseFile {

    private readonly _fileName: string;

    public constructor(fileName: string) {
        this._fileName = fileName;
    }

    public get fileName() {
        return this._fileName;
    }
}

export interface MockRequest {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: any;
    headers?: any;
    params?: any;
}

export interface MockResponse {
    status: number;
    body?: any;
    headers?: any;
}

export interface Mock {
    priority?: number;
    mockRequest: MockRequest;
    mockResponse: MockResponse;
}

export interface MockOptions {
    priority?: number;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
    requestHeaders?: any;
    requestParams?: any;
    responseStatus: number;
    responseHeaders?: any;
    requestBody?: any;
    responseBody?: any;
}

export function mock(options: MockOptions): Mock {
    const mockObj: Mock = {
        priority: options.priority,
        mockRequest: {
            url: options.url,
            method: options.method,
            body: options.requestBody,
            headers: options.requestHeaders,
            params: options.requestParams
        },
        mockResponse: {
            status: options.responseStatus,
            headers: options.responseHeaders,
            body: options.responseBody
        }
    };

    mocks.push(mockObj);

    return mockObj;
}
