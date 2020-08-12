import ILovePDFFile from "../ILovePDFFile";
import XHRPromise from "../XHRPromise";

/**
 * Helper to create a PDF file to use in examples.
 */
export function createFileToAdd(filename: string, fileUrl: string): Promise<ILovePDFFile> {
    const xhr = new XHRPromise();

    return xhr.get<string>(fileUrl, { binary: true })
    .then(response => {
        const blob = new Blob([ response ]);
        const nativeFile = new File([ blob ], filename);

        const file = new ILovePDFFile(nativeFile);
        return file;
    })
}

/**
 * Helper to create an URL to some data.
 * @param data - Data to download with the returned url.
 * @param type - HTTP data type. Example: application/pdf.
 */
export function createObjectUrl(data: string, type: string): string {
    const blob = new Blob([ data ], { type });
    const objectUrl = URL.createObjectURL(blob);

    return objectUrl;
}