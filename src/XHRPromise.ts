import XHRInterface, { XHROptions } from '@ilovepdf/ilovepdf-core/utils/XHRInterface';
import ILovePDFFile from './ILovePDFFile';

export default class XHRPromise implements XHRInterface {

    public get<T>(url: string, options?: XHROptions) {
        return XHRPromise.makeRequest<T>('GET', url, undefined, options);
    }

    public post<T>(url: string, data?: any, options: XHROptions = {}) {
        // If there is a file, it needs to retrieve native data.
        const parsedData = data instanceof ILovePDFFile ? data.data : data;
        return XHRPromise.makeRequest<T>('POST', url, parsedData, options);
    }

    public put<T>(url: string, data?: any, options: XHROptions = {}) {
        return XHRPromise.makeRequest<T>('PUT', url, data, options);
    }

    public delete<T>(url: string, options: XHROptions = {}) {
        return XHRPromise.makeRequest<T>('DELETE', url, undefined, options);
    }

    private static makeRequest<T>(method: string, url: string, data?: any, options: XHROptions = {}): Promise<T> {
        return new Promise<T>(function (resolve, reject) {
            const xhr = new XMLHttpRequest();
            xhr.open(method, url, true);
            XHRPromise.setHeaders(xhr, options);
            XHRPromise.setEncoding(xhr, options);

            // Success handling.
            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    // Transform response if it was configured.
                    const { transformResponse } = options;
                    const response = !!transformResponse ? transformResponse(this.response) : this.response;

                    resolve(response);
                }
                else {
                    // Error but with response.
                    const parsedResponse = JSON.parse(this.responseText);
                    // Servers haven't got a unique error response.
                    const { error, name, message } = parsedResponse;

                    let status;
                    let statusText;

                    if (!!error) {
                        const { code, message } = error;
                        status = code;
                        statusText = message;
                    }
                    else {
                        status = this.status;
                        statusText = `${ name } - ${ message }`;
                    }

                    reject({
                        status,
                        statusText
                    });
                }
            };

            // Error handling.
            xhr.onerror = function () {
                reject({
                    status: this.status,
                    statusText: this.statusText
                });
            };

            // Send.
            xhr.send(data);
        })
        .catch(error => {
            throw error;
        });
    }

    private static setHeaders(xhr: XMLHttpRequest, options: XHROptions = {}) {
        if (!!options.headers) {

            options.headers.forEach(([ key, value ]) => {
                xhr.setRequestHeader(key, value);
            });

        }

    }

    private static setEncoding(xhr: XMLHttpRequest, options: XHROptions = {}) {
        // Enable arraybuffer as a return type when binary is enabled.
        if (!!options.binary) xhr.responseType = 'arraybuffer';
    };

}
