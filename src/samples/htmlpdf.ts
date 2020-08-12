import ILovePDFApi from "..";
import HtmlPdfTask from '@ilovepdf/ilovepdf-core/dist/tasks/HtmlPdfTask';
import { createFileToAdd, createObjectUrl } from "./utils";

const instance = new ILovePDFApi('<PUBLIC_KEY>');

const task = instance.newTask('htmlpdf') as HtmlPdfTask;

task.start()
.then(async () => {
    return task.addFile('https://google.es');
})
.then(() => {
    return task.process({ single_page: true });
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