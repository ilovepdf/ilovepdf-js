import BaseFile from "@ilovepdf/ilovepdf-core/dist/tasks/BaseFile";

export default class ILovePDFFile extends BaseFile {
    private file: File;

    constructor(file: File) {
        const filename = file.name;
        super('', '', filename);

        // Keep data.
        this.file = file;
    }

    get data(): FormData {
        // Create each time due to 'task'
        // property could change previously.
        const formData = new FormData();
        formData.append('task', this.taskId);
        formData.append('file', this.file);
        return formData;
    }

}