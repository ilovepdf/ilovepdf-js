import XHRInterface, { XHROptions } from '@ilovepdf/ilovepdf-js-core/utils/XHRInterface';
import ILovePDFFile from './ILovePDFFile';
import BaseFile from '@ilovepdf/ilovepdf-js-core/tasks/BaseFile';

export default class XHRPromise implements XHRInterface {

    public get<T>(url: string, options?: XHROptions) {
        return XHRPromise.makeRequest<T>('GET', url, undefined, options);
    }

    public post<T>(url: string, data?: any, options: XHROptions = {}) {
        // If there is a file, it needs to retrieve native data.
        // Note: I use `instanceof BaseFile` because it seems that the
        // prototype chain is broken and it's detected as false with `ILovePDFFile`.
        // To fix it, I need to waste many time.
        const parsedData = data instanceof BaseFile ? ( data as ILovePDFFile ).data : data;
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
                // Success case.
                if (this.status >= 200 && this.status < 300) {
                    // Transform response if it was configured.
                    const { transformResponse } = options;
                    const response = !!transformResponse ? transformResponse(this.response) : this.response;

                    resolve(response);
                    return;
                }

                // Failure cases.

                // Binary enabled but with error. I do this due to inside a browser
                // DOM after a binary download error, the state of xhr is invalid and
                // can cause other errors if the object is examinated.
                if (XHRPromise.isBinary(options)) {
                    console.error( this )
                    reject({
                        status: this.status,
                        statusText: 'File could not be downloaded.',
                    });
                    return;
                }
                else {
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

                    console.error( parsedResponse )

                    reject({
                        status,
                        statusText
                    });
                }
            };

            // Error handling.
            xhr.onerror = function () {
                console.error( this )
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
        if ( XHRPromise.isBinary(options) ) xhr.responseType = 'arraybuffer';
    };

    private static isBinary(options: XHROptions): boolean {
        return !!options.binary;
    }

}
