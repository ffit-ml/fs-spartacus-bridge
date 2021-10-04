import { TppStatusService } from '../tpp-status-service';
import { PipelineStep } from './pipeline-step';
import { map } from 'rxjs/operators';
import { Pipeline } from './pipeline';
import { Injectable, InjectionToken, Injector } from '@angular/core';
import { Observable } from 'rxjs';

export const PREVIEW_PIPELINE_STEP = new InjectionToken<PipelineStep>('PreviewPipelineStep');
export const LIVE_PIPELINE_STEP = new InjectionToken<PipelineStep>('LivePipelineStep');

@Injectable({
  providedIn: 'root',
})
export class PipelineFactory {
  private readonly pipeline: Observable<Pipeline>;

  constructor(private injector: Injector, private tppStatusService: TppStatusService) {
    this.pipeline = this.selectPipelineStepsInjectionToken().pipe(
      map((injectionToken) => this.injector.get<PipelineStep[]>(injectionToken)),
      map((pipelineSteps) => new Pipeline(pipelineSteps))
    );
  }

  private selectPipelineStepsInjectionToken() {
    return this.tppStatusService.isFirstSpiritPreview().pipe(map((preview) => (preview ? PREVIEW_PIPELINE_STEP : LIVE_PIPELINE_STEP)));
  }

  createPipeline(): Observable<Pipeline> {
    return this.pipeline;
  }
}
