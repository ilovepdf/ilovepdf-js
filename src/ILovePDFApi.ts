import Task, { TaskParams } from "@ilovepdf/ilovepdf-core/dist/tasks/Task";
import TaskFactory, { TaskFactoryI } from "@ilovepdf/ilovepdf-core/dist/tasks/TaskFactory";
import Auth from "@ilovepdf/ilovepdf-core/dist/auth/Auth";
import JWT from "@ilovepdf/ilovepdf-core/dist/auth/JWT";
import ILovePDFTool from "@ilovepdf/ilovepdf-core/dist/types/ILovePDFTool";
import XHRPromise from "./XHRPromise";
import XHRInterface from "@ilovepdf/ilovepdf-core/dist/utils/XHRInterface";

interface ILovePDFApiI {
    /**
     * Creates a new task for a specific tool.
     * @param taskType - Task to run.
     * @param params - Parameters for the tool.
     */
    newTask: (taskType: ILovePDFTool, params?: TaskParams) => Task;
}

export default class ILovePDFApi implements ILovePDFApiI {
    private auth: Auth;
    private xhr: XHRInterface;
    private taskFactory: TaskFactoryI;

    constructor(publicKey: string) {
        this.xhr = new XHRPromise;
        this.auth = new JWT(this.xhr, publicKey);
        this.taskFactory = new TaskFactory();
    }

    public newTask(taskType: ILovePDFTool, params: TaskParams = {}) {
        return this.taskFactory.newTask(taskType, this.auth, this.xhr, params);
    }

}
