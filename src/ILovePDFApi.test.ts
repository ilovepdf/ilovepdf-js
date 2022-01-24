import ILovePDFApi from "./ILovePDFApi";
import ILovePDFFile from "./ILovePDFFile";
import dotenv from 'dotenv';
import XHRPromise from "./XHRPromise";
import MERGE from './tests/output/merge';
import CONNECT from "./tests/output/connect";
import SignTask from '@ilovepdf/ilovepdf-js-core/tasks/sign/SignTask';
import SignatureFile from '@ilovepdf/ilovepdf-js-core/tasks/sign/elements/SignatureFile';
import Signer from '@ilovepdf/ilovepdf-js-core/tasks/sign/receivers/Signer';

// IMPORTANT: FOR TESTING PURPOSES WE USE CORS-ANYWHERE.
// IS A SERVICE WHICH NEEDS TO BE ENABLED AT
// https://cors-anywhere.herokuapp.com .

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
            const task = api.newTask('merge');
            await task.start()

            await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            const file = await createFileToAdd();
            await task.addFile(file);

            await task.deleteFile(file);

            await task.process();
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

    describe('Signature management', () => {

        it('gets a signature status', async () => {
            const task = api.newTask('sign') as SignTask;

            await task.start()

            const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            // Signer.
            const signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 28,
                color: '#000000',
                font: null as unknown as string,
                content: null as unknown as string
            }]);

            const signer = new Signer('Diego Signer', 'invent@ado.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addReceiver(signer);

            const { token_requester } = await task.process({
                mode: 'multiple',
                custom_int: 0,
                custom_string: '0'
            });

            const { signers } = await api.getSignatureStatus(token_requester);

            expect( signers[0].email ).toBe('invent@ado.com');
        });

        it('gets a signature list', async () => {
            // First task.

            let task = api.newTask('sign') as SignTask;

            await task.start()

            let file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            // Signer.
            let signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 28,
                color: '#000000',
                font: null as unknown as string,
                content: null as unknown as string
            }]);

            let signer = new Signer('Manolo', 'invent@ado.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addReceiver(signer);

            await task.process({
                mode: 'multiple',
                custom_int: 0,
                custom_string: '0'
            });

            // Second task.

            task = api.newTask('sign') as SignTask;

            await task.start()

            file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            // Signer.
            signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 28,
                color: '#000000',
                font: null as unknown as string,
                content: null as unknown as string
            }]);

            signer = new Signer('Paquito', 'invent@ado.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addReceiver(signer);

            await task.process({
                mode: 'multiple',
                custom_int: 0,
                custom_string: '0'
            });

            const signatureList = await api.getSignatureList(0, 2);

            const paquitoName = signatureList[0].signers[0].name;

            const manoloName = signatureList[1].signers[0].name;

            expect( paquitoName ).toBe('Paquito');
            expect( manoloName ).toBe('Manolo');
        });

        it('voids a signature', async () => {
            const task = api.newTask('sign') as SignTask;

            await task.start()

            const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            // Signer.
            const signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 28,
                color: '#000000',
                font: null as unknown as string,
                content: null as unknown as string
            }]);

            const signer = new Signer('Diego Signer', 'invent@ado.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addReceiver(signer);

            const { token_requester } = await task.process({
                mode: 'multiple',
                custom_int: 0,
                custom_string: '0'
            });

            // Wait to send emails due to this is made
            // in background.
            await new Promise<void>(resolve => {
                setTimeout(() => {
                    resolve();
                }, 4000);
            });

            // Void signature and look that it is correctly invalidated.
            await api.voidSignature(token_requester);

            const { status } = await api.getSignatureStatus(token_requester);

            expect(status).toBe('void');
        });

        it('increases a signature expiration days', async () => {
            const task = api.newTask('sign') as SignTask;

            await task.start()

            const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            // Signer.
            const signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 28,
                color: '#000000',
                font: null as unknown as string,
                content: null as unknown as string
            }]);

            const signer = new Signer('Diego Signer', 'invent@ado.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addReceiver(signer);

            const { token_requester } = await task.process({
                mode: 'multiple',
                custom_int: 0,
                custom_string: '0'
            });

            // Increase expiration days.
            const INCREASED_DAYS = 3;
            await api.increaseSignatureExpirationDays(token_requester, INCREASED_DAYS);

            const { created, expires } = await api.getSignatureStatus(token_requester);

            const creationDate = new Date( created );
            const expirationDate = new Date( expires );

            const diffDays = dateDiffInDays(creationDate, expirationDate);

            // Days by default.
            const BASE_DAYS = 120;

            expect(diffDays).toBe(BASE_DAYS + INCREASED_DAYS);
        });

        it('sends reminders', async () => {
            const task = api.newTask('sign') as SignTask;

            await task.start()

            const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            // Signer.
            const signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 28,
                color: '#000000',
                font: null as unknown as string,
                content: null as unknown as string
            }]);

            const signer = new Signer('Diego Signer', 'invent@ado.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addReceiver(signer);

            const { token_requester } = await task.process({
                mode: 'multiple',
                custom_int: 0,
                custom_string: '0'
            });

            // Wait to send emails due to this is made
            // in background.
            await new Promise<void>(resolve => {
                setTimeout(() => {
                    resolve();
                }, 4000);
            });

            // Due to we can test that email was sent, a limit exception is forced.
            await api.sendReminders(token_requester);
            await api.sendReminders(token_requester);

            expect( () => api.sendReminders(token_requester) ).rejects;
        });

        it('downloads original files', async () => {
            const task = api.newTask('sign') as SignTask;

            await task.start()

            const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            // Signer.
            const signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 28,
                color: '#000000',
                font: null as unknown as string,
                content: null as unknown as string
            }]);

            const signer = new Signer('Diego Signer', 'invent@ado.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addReceiver(signer);

            const { token_requester } = await task.process({
                mode: 'multiple',
                custom_int: 0,
                custom_string: '0'
            });

            const rawData = await api.downloadOriginalFiles(token_requester);

            expect((rawData as unknown as ArrayBuffer).byteLength).toBeGreaterThan(0);
        });

        it('downloads signed files', async () => {
            const task = api.newTask('sign') as SignTask;

            await task.start()

            const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            // Signer.
            const signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 28,
                color: '#000000',
                font: null as unknown as string,
                content: null as unknown as string
            }]);

            const signer = new Signer('Diego Signer', 'invent@ado.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addReceiver(signer);

            const { token_requester } = await task.process({
                mode: 'multiple',
                custom_int: 0,
                custom_string: '0'
            });

            // We can't test downloaded data due to the signature is not finished.
            // But we want to test that the connection was successful, so the
            // exception is the trigger to know that the connection was successful.
            expect( () => api.downloadSignedFiles(token_requester) ).rejects;
        });

        it('downloads audit files', async () => {
            const task = api.newTask('sign') as SignTask;

            await task.start()

            const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            // Signer.
            const signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 28,
                color: '#000000',
                font: null as unknown as string,
                content: null as unknown as string
            }]);

            const signer = new Signer('Diego Signer', 'invent@ado.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addReceiver(signer);

            const { token_requester } = await task.process({
                mode: 'multiple',
                custom_int: 0,
                custom_string: '0',
                certified: true,
            });

            // We can't test downloaded data due to the signature is not finished.
            // But we want to test that the connection was successful, so the
            // exception is the trigger to know that the connection was successful.
            expect( () => api.downloadAuditFiles(token_requester) ).rejects;

        });

        it('gets receiver information', async () => {
            const task = api.newTask('sign') as SignTask;

            await task.start()

            const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            // Signer.
            const signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 28,
                color: '#000000',
                font: null as unknown as string,
                content: null as unknown as string
            }]);

            const signer = new Signer('Diego Signer', 'invent@ado.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addReceiver(signer);

            const result = await task.process({
                mode: 'multiple',
                custom_int: 0,
                custom_string: '0'
            });

            const processedSigner = result.signers[0];
            const { token_requester } = processedSigner;

            // Due to we can test that email was sent, a limit exception is forced.
            const { name } = await api.getReceiverInfo(token_requester);

            expect(name).toBe('Diego Signer');
        });

        it('fix receiver email', async () => {
            const task = api.newTask('sign') as SignTask;

            await task.start()

            const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            // Signer.
            const signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 28,
                color: '#000000',
                font: null as unknown as string,
                content: null as unknown as string
            }]);

            const signer = new Signer('Diego Signer', 'invent@ado.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addReceiver(signer);

            const result = await task.process({
                mode: 'multiple',
                custom_int: 0,
                custom_string: '0'
            });

            const processedSigner = result.signers[0];
            const { token_requester } = processedSigner;

            // Test that connection was established.
            try {
                await api.fixReceiverEmail(token_requester, 'newemail@email.com');
                fail( 'it has to fail.' );
            }
            catch(err) {
                // Due to it was treated as binary data.
                expect( err.statusText ).toBe('The signer can\'t be returned.');
            }

        });

        it('fix receiver phone', async () => {
            const task = api.newTask('sign') as SignTask;

            await task.start()

            const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            // Signer.
            const signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 28,
                color: '#000000',
                font: null as unknown as string,
                content: null as unknown as string
            }]);

            const signer = new Signer('Diego Signer', 'invent@ado.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addReceiver(signer);

            const result = await task.process({
                mode: 'multiple',
                custom_int: 0,
                custom_string: '0'
            });

            const processedSigner = result.signers[0];
            const { token_requester } = processedSigner;

            // Test that connection was established.
            try {
                await api.fixReceiverPhone(token_requester, '34654654654');
                fail( 'it has to fail.' );
            }
            catch(err) {
                // Due to it was treated as binary data.
                expect( err.statusText ).toBe('The signer can\'t be returned.');
            }

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

async function createFileToAdd(): Promise<ILovePDFFile> {
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

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function dateDiffInDays(a: Date, b: Date): number {
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / MS_PER_DAY);
}