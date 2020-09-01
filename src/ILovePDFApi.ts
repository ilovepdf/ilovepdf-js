import Auth from "@ilovepdf/ilovepdf-core/auth/Auth";
import JWT from "@ilovepdf/ilovepdf-core/auth/JWT";
import TaskFactory, { TaskFactoryI } from "@ilovepdf/ilovepdf-core/tasks/TaskFactory";
import ILovePDFCoreApi from '@ilovepdf/ilovepdf-core/ILovePDFCoreApi';
import TaskI from "@ilovepdf/ilovepdf-core/tasks/TaskI";
import ILovePDFTool from "@ilovepdf/ilovepdf-core/types/ILovePDFTool";
import XHRInterface from "@ilovepdf/ilovepdf-core/utils/XHRInterface";
import XHRPromise from "./XHRPromise";
import SignTask, { TemplateElement } from "@ilovepdf/ilovepdf-core/tasks/sign/SignTask";

export interface ILovePDFApiI {
    /**
     * Creates a new task for a specific tool.
     * @param taskType - Task to run.
     */
    newTask: (taskType: ILovePDFTool) => TaskI;
    /**
     * Retrieves a signature template.
     * @param templateTaskId - Task id of the task that created the template.
     */
    getSignatureTemplate: (templateTaskId: string) => Promise<TemplateElement>;
    /**
     * Retrieves a signature task.
     * @param signatureTaskId - Signature task id.
     */
    getSignature: (signatureTaskId: string) => Promise<SignTask>;
}

export type ILovePDFApiParams = {
    file_encryption_key?: string
};

export default class ILovePDFApi implements ILovePDFApiI {
    private auth: Auth;
    private xhr: XHRInterface;
    private taskFactory: TaskFactoryI;

    constructor(publicKey: string, params: ILovePDFApiParams = {}) {
        this.xhr = new XHRPromise;
        this.auth = new JWT(this.xhr, publicKey, undefined, params);
        this.taskFactory = new TaskFactory();
    }

    /**
     * @inheritdoc
     */
    public newTask(taskType: ILovePDFTool): TaskI {
        return this.taskFactory.newTask(taskType, this.auth, this.xhr);
    }

    /**
     * @inheritdoc
     */
    public async getSignatureTemplate(taskId: string) {
        return ILovePDFCoreApi.getSignatureTemplate(this.auth, this.xhr, taskId);
    }

    /**
     * @inheritdoc
     */
    public async getSignature(signatureTaskId: string): Promise<SignTask> {
        return ILovePDFCoreApi.getSignature(this.auth, this.xhr, signatureTaskId);
    }

}
