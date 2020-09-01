import ILovePDFApi from "..";
import SplitTask from '@ilovepdf/ilovepdf-core/tasks/SplitTask';
import { createObjectUrl } from "./utils";

const instance = new ILovePDFApi('<PUBLIC_KEY>');

const task = instance.newTask('split') as SplitTask;

task.start()
.then(() => {
    return task.addFile('<FILE_URL>');
})
.then(() => {
    return task.process({ split_mode: 'ranges', ranges: '1' });
})
.then(() => {
    return task.connect('pdfjpg');
})
.then(pdfjpgTask => {
    return pdfjpgTask.process();
})
.then(pdfjpgTask => {
    return pdfjpgTask.download();
})
.then(data => {
    // JPG file.
    const url = createObjectUrl(data, 'image/jpg');
    console.log(url);
    // You can create a download request opening a new window.
    window.open(url);
});