import { cacheMake } from './../utils/cache-make';
import Workers from './workers.json';

export class WorkerPort {
  private static memento: Map<keyof typeof Workers, WorkerPort> = cacheMake<keyof typeof Workers, WorkerPort>();

  static make(name: keyof typeof Workers): WorkerPort {
    if (WorkerPort.memento.has(name)) {
      return WorkerPort.memento.get(name) as WorkerPort;
    }

    const workerPort = new WorkerPort(name);
    WorkerPort.memento.set(name, workerPort);

    return workerPort;
  }

  private readonly worker: Worker;
  private readonly subscriptions: Record<string, (data: any) => void> = {};

  private constructor(private readonly name: keyof typeof Workers) {
    if (!Worker) {
      throw new TypeError('Worker unavailable');
    }

    this.worker = new Worker(Workers[this.name]);
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
