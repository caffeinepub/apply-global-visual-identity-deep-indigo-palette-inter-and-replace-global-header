/**
 * Frontend types for pipeline stages (Kanban columns)
 */

export interface PipelineStage {
  id: string;
  name: string;
  position: number;
  orgId: string;
  boardId: string;
  createdBy: string;
  createdAt: Date;
}

export interface PipelineStageReorderUpdate {
  id: string;
  name: string;
  newPosition: number;
  boardId: string;
}
