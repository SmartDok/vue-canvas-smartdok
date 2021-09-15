export enum CanvasShape {
  Pencil = 'pencil',
  Circle = 'circle',
  Rectangle = 'rectangle',
  Triangle = 'triangle',
  Text = 'text',
  Background = 'background',
}

export enum CanvasMode {
  Draw = 'draw',
  Erase = 'erase',
  Move = 'move',
}

export interface ICanvasDimension {
  width: number;
  height: number;
}

export interface IPoint { 
  x: number;
  y: number;
}

export type PointEventFn = (point: IPoint) => void;

export interface RenderFnArgs {
  onlyFg: boolean;
}

export type RenderFn = (args?: RenderFnArgs) => void;

export interface ICanvasCommand {
  draw: PointEventFn;
  redraw: () => void;
  erase: (skipRender?: boolean) => void;
  move: PointEventFn;
  scale: PointEventFn;
  isTarget: (point: IPoint) => boolean;
  isErased: boolean;
  onMouseUp: PointEventFn;
}
 
export interface ICanvasCommandArgs {
  context: CanvasRenderingContext2D;
  point: IPoint;
  text?: string;
  devicePixelRatio: number | undefined;
  renderCanvasFn: RenderFn;
}

export interface ICanvasState {
  strokeStyle: string | CanvasGradient | CanvasPattern;
  fillStyle: string | CanvasGradient | CanvasPattern;
  lineWidth: number;
  font: string;
}

export interface IHistoryItem {
  command: ICanvasCommand,
  undo?: () => void;
  redo?: () => void;
}


