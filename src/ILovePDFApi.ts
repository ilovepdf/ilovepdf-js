import Auth from "@ilovepdf/ilovepdf-js-core/auth/Auth";
import JWT from "@ilovepdf/ilovepdf-js-core/auth/JWT";
import TaskFactory, { TaskFactoryI } from "@ilovepdf/ilovepdf-js-core/tasks/TaskFactory";
import TaskI from "@ilovepdf/ilovepdf-js-core/tasks/TaskI";
import ILovePDFTool from "@ilovepdf/ilovepdf-js-core/types/ILovePDFTool";
import XHRInterface from "@ilovepdf/ilovepdf-js-core/utils/XHRInterface";
import XHRPromise from "./XHRPromise";

export interface ILovePDFApiI {
    /**
     * Creates a new task for a specific tool.
     * @param taskType - Task to run.
     */
    newTask: (taskType: ILovePDFTool) => TaskI;
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

}
