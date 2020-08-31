import { createWorkerBlobUrl } from './../utils/create-worker-blob-url';
import Workers from './workers.json';

export class WorkerPort {
  private static memento: Partial<Record<keyof typeof Workers, WorkerPort>> = {};

  static make(name: keyof typeof Workers): WorkerPort {
    if (name in WorkerPort.memento) {
      return WorkerPort.memento[name] as WorkerPort;
    }

    const workerPort = new WorkerPort(name);
    WorkerPort.memento[name] = workerPort;

    return workerPort;
  }

  private readonly worker: Worker;
  private readonly subscriptions: Record<string, (data: any) => void> = {};

  private constructor(private readonly name: keyof typeof Workers) {
    if (!Worker) {
      throw new TypeError('Worker unavailable');
    }

    const body = Workers[this.name];
    const url = createWorkerBlobUrl(body);

    this.worker = new Worker(url);
    this.worker.addEventListener('message', this.handleMessage);
  }

  subscribe(id: string, handler: (data: any) => void): void {
    this.subscriptions[id] = handler;
  }

  post(message: { id: string; [key: string]: any }, transfer: Array<Transferable>): void {
    return this.worker.postMessage(message, transfer);
  }

  private handleMessage = ({ data }: MessageEvent): void => {
    this.subscriptions?.[data.id]?.(data);
  };
}
