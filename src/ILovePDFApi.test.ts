import ILovePDFApi from "./ILovePDFApi";
import ILovePDFFile from "./ILovePDFFile";
import dotenv from 'dotenv';
import XHRPromise from "./XHRPromise";
import MERGE from './tests/output/merge';
import CONNECT from "./tests/output/connect";

// Load env vars.
dotenv.config();

const api = new ILovePDFApi(process.env.PUBLIC_KEY!);

describe('ILovePDFApi', () => {

    // Due to internal changes such as having different
    // XHR system or File system task methods are also
    // tested.
    describe('newTask', () => {

        it('starts a task', async () => {
            const task = api.newTask('merge');
            await task.start();
        });

        it('starts a signature task', async () => {
            const task = api.newTask('sign');
            await task.start();
        });

        it('adds a file from URL', async () => {
            const task = api.newTask('merge');

            await task.start()

            await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
        });

        it('adds a file from ILovePDFFile', async () => {
            const task = api.newTask('merge');

            await task.start()

            const file = await createFileToAdd();
            await task.addFile(file);
        });

        it('process a merge', async () => {
            const task = api.newTask('merge');
            const file = await createFileToAdd();
            const file2 = await createFileToAdd();

            return task.start()
            .then(() => {
                return task.addFile(file);
            })
            .then(() => {
                return task.addFile(file2);
            })
            .then(() => {
                return task.process();
            });
        });

        it('downloads a pdf', async () => {
            const task = api.newTask('merge');
            const file = await createFileToAdd();

            return task.start()
            .then(() => {
                return task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
            })
            .then(() => {
                return task.addFile(file);
            })
            .then(() => {
                return task.process();
            })
            .then(() => {
                return task.download();
            })
            .then(data => {
                // Cast to native ArrayBuffer because is not only a simple string.
                const buffer = data as unknown as ArrayBuffer;
                const utf8String = arrayBufferToString(buffer);
                const ut8WithoutMetas = removePDFUniqueMetadata(utf8String);
                const base64 = btoa(ut8WithoutMetas);

                expect(base64).toBe(MERGE);
            });
        });

        it('connects a task', async () => {
            const task = api.newTask('split');

            await task.start();

            await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            const file = await createFileToAdd();
            await task.addFile(file);

            await task.process();

            const connectedTask = await task.connect('merge');

            await connectedTask.addFile(file);

            await connectedTask.process()

            const data = await connectedTask.download();

            // Cast to native ArrayBuffer because is not only a simple string.
            const buffer = data as unknown as ArrayBuffer;
            const utf8String = arrayBufferToString(buffer);
            const ut8WithoutMetas = removePDFUniqueMetadata(utf8String);
            const base64 = btoa(ut8WithoutMetas);
            expect(base64).toBe(CONNECT);
        });

        it('deletes a task', async () => {
            const task = api.newTask('split');

            await task.start()

            await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            const file = await createFileToAdd();
            await task.addFile(file);

            await task.process();

            await task.delete();
        });

        it('deletes a file', async () => {
            expect(async () => {
                const task = api.newTask('merge');
                await task.start()

                await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

                const file = await createFileToAdd();
                await task.addFile(file);

                await task.deleteFile(file);

                await task.process();
            })
            .rejects.toThrow();
        })

    });

    describe('Api params', () => {

        it('process a task with file_key_encryption', async () => {
            const apiWithFileEncryption = new ILovePDFApi(process.env.PUBLIC_KEY!, { file_encryption_key: '01234567890123' });

            const task = apiWithFileEncryption.newTask('compress');
            const file = await createFileToAdd();

            return task.start()
            .then(() => {
                return task.addFile(file);
            })
            .then(() => {
                return task.process();
            });
        });

    });

});

/**
 * Removes metadata that can differ between same PDFs such as:
 * id or modification date.
 */
function removePDFUniqueMetadata(data: string) {
    // Get string with UTF8 encoding.
    let dataToReturn: string = data.toString();
    // Remove modification date.
    dataToReturn = dataToReturn.replace(/\/ModDate (.+)?/, '');
    // Remove id.
    dataToReturn = dataToReturn.replace(/\/ID (.+)?/, '');

    return dataToReturn;
}

function createFileToAdd(): Promise<ILovePDFFile> {
    const xhr = new XHRPromise();

    return xhr.get<string>('https://cors-anywhere.herokuapp.com/https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', { binary: true })
    .then(response => {
        const blob = new Blob([ response ]);
        const nativeFile = new File([ blob ], 'sample.pdf');

        const file = new ILovePDFFile(nativeFile);
        return file;
    })
}

function arrayBufferToString(buffer: ArrayBuffer): string {
    let str = '';

    var byteArray = new Uint8Array(buffer);
    for (var i = 0; i < byteArray.byteLength; i++) {
        str += String.fromCharCode(byteArray[i]);
    }

    return str;
}