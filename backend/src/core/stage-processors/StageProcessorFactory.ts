import { IStageProcessor } from './StageProcessor';
import { QuizStageProcessor } from './QuizStageProcessor';
import { DefaultStageProcessor } from './DefaultStageProcessor';

class StageProcessorFactory {
  private processors: Map<string, IStageProcessor> = new Map();
  private defaultProcessor: IStageProcessor = new DefaultStageProcessor();

  constructor() {
    this.processors.set('Quiz', new QuizStageProcessor());
  }

  public getProcessor(type: string): IStageProcessor {
    // Extensible logic - checks registered processors, otherwise defaults to manual evaluation
    return this.processors.get(type) || this.defaultProcessor;
  }

  public registerProcessor(type: string, processor: IStageProcessor): void {
    this.processors.set(type, processor);
  }
}

export const stageProcessorFactory = new StageProcessorFactory();
export default stageProcessorFactory;
