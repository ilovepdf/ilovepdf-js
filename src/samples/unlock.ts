import ILovePDFApi from "..";
import UnlockTask from '@ilovepdf/ilovepdf-js-core/tasks/UnlockTask';
import { createFileToAdd, createObjectUrl } from "./utils";

const instance = new ILovePDFApi('<PUBLIC_KEY>');

const task = instance.newTask('unlock') as UnlockTask;

task.start()
.then(async () => {
    // Be careful with CORS problems.
    const file = await createFileToAdd('file.pdf', '<FILE_URL>');
    return task.addFile(file);
})
.then(file => {
    file.params.password = 'test';

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