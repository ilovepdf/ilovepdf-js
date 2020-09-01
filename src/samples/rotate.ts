import ILovePDFApi from "..";
import RotateTask from '@ilovepdf/ilovepdf-core/tasks/RotateTask';
import { createObjectUrl } from "./utils";

const instance = new ILovePDFApi('<PUBLIC_KEY>');

const task = instance.newTask('rotate') as RotateTask;

task.start()
.then(() => {
    return task.addFile('<FILE_URL>');
})
.then(() => {
    const file = task.getFiles()[0];
    file.params.rotate = 90;

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