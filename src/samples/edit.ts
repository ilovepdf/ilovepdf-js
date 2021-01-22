import ILovePDFApi from "..";
import EditTask from '@ilovepdf/ilovepdf-js-core/tasks/edit/EditTask';
import Text from "@ilovepdf/ilovepdf-js-core/tasks/edit/Text";
import { createFileToAdd, createObjectUrl } from "./utils";

const instance = new ILovePDFApi('<PUBLIC_KEY>');

const task = instance.newTask('editpdf') as EditTask;

task.start()
.then(async () => {
    // Be careful with CORS problems.
    const file = await createFileToAdd('file.pdf', '<FILE_URL>');
    return task.addFile(file);
})
.then(() => {
    const textElement = new Text({
        coordinates: { x: 100, y: 100 },
        dimensions: { w: 100, h: 100 },
        text: 'test',
    });
    return task.addElement(textElement);
})
.then(() => {
    return task.process();
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