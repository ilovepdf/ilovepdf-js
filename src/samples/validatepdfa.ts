import ILovePDFApi from "..";
import ValidatePdfaTask from '@ilovepdf/ilovepdf-core/dist/tasks/ValidatePdfaTask';
import { createFileToAdd } from "./utils";

const instance = new ILovePDFApi('<PUBLIC_KEY>');

const task = instance.newTask('validatepdfa') as ValidatePdfaTask;

task.start()
.then(async () => {
    // Be careful with CORS problems.
    const file = await createFileToAdd('file.pdf', '<FILE_URL>');
    return task.addFile(file);
})
.then(() => {
    return task.process({ conformance: 'pdfa-2a' });
})
.then(() => {
    // PDF Validation does not have any download. You must see
    // the server response directly.
    console.log(task.responses.process?.validations);
});