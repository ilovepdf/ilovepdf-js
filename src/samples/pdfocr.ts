import ILovePDFApi from "..";
import PdfOcrTask from '@ilovepdf/ilovepdf-js-core/tasks/PdfOcrTask';
import { createObjectUrl } from "./utils";

const instance = new ILovePDFApi('<PUBLIC_KEY>');

const task = instance.newTask('pdfocr') as PdfOcrTask;

task.start()
    .then(() => {
        return task.addFile('<FILE_URL>');
    })
    .then(() => {
        return task.process({ocr_languages: ['eng']});
    })
    .then(() => {
        return task.download();
    })
    .then((data) => {
        const url = createObjectUrl(data, 'application/pdf');
        console.log(url);
        // You can create a download request opening a new window.
        window.open(url);
    });