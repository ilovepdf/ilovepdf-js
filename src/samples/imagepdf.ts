import ILovePDFApi from "..";
import ImagePdfTask from '@ilovepdf/ilovepdf-core/dist/tasks/ImagePdfTask';
import { createFileToAdd, createObjectUrl } from "./utils";

const instance = new ILovePDFApi('<PUBLIC_KEY>');

const task = instance.newTask('imagepdf') as ImagePdfTask;

task.start()
.then(async () => {
    return task.addFile('https://dummyimage.com/600x400/000/fff.jpg');
})
.then(() => {
    return task.process({ merge_after: true });
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