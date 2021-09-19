import {
  CanvasShape,
  ICanvasCommand,
  ICanvasCommandArgs,
  ICanvasState,
  IPoint,
  RenderFn,
} from './types';

export default (
  shape: CanvasShape,
  args: ICanvasCommandArgs,
): ICanvasCommand => {
  switch (shape) {
    case CanvasShape.Pencil:
      return new PencilCommand(args);
    case CanvasShape.Rectangle:
      return new RectangleCommand(args);
    case CanvasShape.Triangle:
      return new TriangleCommand(args);
    case CanvasShape.Circle:
      return new CircleCommand(args);
    case CanvasShape.Text:
      return new TextCommand(args);
    case CanvasShape.Background:
      return new BackgroundCommand(args);
    default:
      throw new Error(`Unknown CanvasShape: ${shape}`);
  }
};

const isTransparent = (color: string) => color === 'rgba(0, 0, 0, 0)';

abstract class CanvasCommand implements ICanvasCommand {
  protected state: ICanvasState;

  protected context: CanvasRenderingContext2D;

  protected renderCanvasFn: RenderFn;
  
  protected path: Path2D;

  protected erased: boolean;
  
  protected deltaPoint: IPoint | undefined;

  protected devicePixelRatio: number | undefined;

  constructor(
      context: CanvasRenderingContext2D, 
      renderCanvasFn: RenderFn,
      devicePixelRatio?: number,
  ) {
    this.context = context;

    this.renderCanvasFn = renderCanvasFn;

    this.devicePixelRatio = devicePixelRatio;
    
    this.state = {
      strokeStyle: context.strokeStyle,
      fillStyle: context.fillStyle,
      lineWidth: context.lineWidth,
      font: context.font,
      textBaseline: context.textBaseline,
    };

    this.path = new Path2D;

    this.erased = false;
  }

  public abstract draw(point: IPoint): void;

  public erase(skipRender?: boolean) {
    this.erased = true;

    if (!skipRender) {
      this.renderCanvasFn();
    }
  }

  public redraw() {
    this.erased = false;

    this.context.save();

    this.restoreState();

    this.render();

    this.context.restore();
  }

  public move(point: IPoint) {
    if (!this.deltaPoint) {
      this.deltaPoint = point;
      return;
    }

    const matrix = new DOMMatrix();

    const path = new Path2D();
    
    path.addPath(this.path, matrix.translate(
      point.x - this.deltaPoint.x,
      point.y - this.deltaPoint.y,
    ));

    this.path = path;

    this.redraw();

    this.renderCanvasFn(); 

    this.deltaPoint = point;
  }

  public scale(point: IPoint) {
    throw new Error('Scale not implemented');
  }

  public isTarget(point: IPoint) {
    return this.isPointInStroke(point);
  }

  public get isErased() {
    return this.erased;
  }

  public onMouseUp(point: IPoint) {
    this.deltaPoint = undefined;
  }

  protected render() {
    this.context.stroke(this.path);
  }

  protected restoreState() {
    this.context.strokeStyle = this.state.strokeStyle;
    this.context.fillStyle = this.state.fillStyle;
    this.context.lineWidth = this.state.lineWidth;
    this.context.font = this.state.font;
    this.context.textBaseline = this.state.textBaseline;
  }

 protected isPointInStroke(point: IPoint) {
    const { x, y } = this.getDevicePixelRatioAdjustedPoint(point);

    return !this.erased && this.context.isPointInStroke(this.path, x, y);
  }

  protected isPointInPath(point: IPoint) {
    const { x, y } = this.getDevicePixelRatioAdjustedPoint(point);

    return !this.erased && this.context.isPointInPath(this.path, x, y);
  }

  // isPointInStroke and isPointInPath coordinates is not offset by context.scale automatically.
  private getDevicePixelRatioAdjustedPoint(point: IPoint) {
    return this.devicePixelRatio ?
      { 
        x: point.x * this.devicePixelRatio,
        y: point.y * this.devicePixelRatio,
      } : 
      point;
  }
}

class PencilCommand extends CanvasCommand {
  constructor({ context, renderCanvasFn, point, devicePixelRatio }: ICanvasCommandArgs) {
    super(context, renderCanvasFn, devicePixelRatio);

    this.path.moveTo(point.x, point.y);
  }

  public draw(point: IPoint) {
    this.path.lineTo(point.x, point.y);   

    super.render();
  }
}

class RectangleCommand extends CanvasCommand {
  private from: IPoint;

  constructor({ context, renderCanvasFn, point, devicePixelRatio }: ICanvasCommandArgs) {
    super(context, renderCanvasFn, devicePixelRatio);

    this.from = point;
  }

  public draw({ x, y }: IPoint) {
    this.path = new Path2D();

    this.path.moveTo(this.from.x, this.from.y);

    this.path.lineTo(x, this.from.y);
    this.path.lineTo(x, y);
    this.path.lineTo(this.from.x, y);
    this.path.closePath();
    
    this.renderCanvasFn();
  
    this.render();
  }

  public isTarget(point: IPoint) {
    if (isTransparent(this.state.fillStyle as string)) {
      return super.isPointInStroke(point);
    } else {
      return super.isPointInPath(point);
    }
  }

  protected render() {
    super.render();
    
    this.context.fill(this.path);
  }
}

class TriangleCommand extends CanvasCommand {
  private from: IPoint;

  constructor({ context, renderCanvasFn, point, devicePixelRatio }: ICanvasCommandArgs) {
    super(context, renderCanvasFn, devicePixelRatio);

    this.from = point;
  }

  public draw({ x, y }: IPoint) {
    this.path = new Path2D();

    const width = this.calcWidth(x);

    this.path.moveTo(this.from.x, this.from.y);

    this.path.lineTo(x, this.from.y);
    this.path.lineTo(width, y);
    this.path.closePath();

    this.renderCanvasFn();
    
    this.render();
  }

  protected render() {
    super.render();
    
    this.context.fill(this.path);
  }

  public isTarget(point: IPoint) {
    if (isTransparent(this.state.fillStyle as string)) {
      return super.isPointInStroke(point);
    } else {
      return super.isPointInPath(point);
    }
  }

  private calcWidth(x: number) {
    let center = Math.floor((x - this.from.x) / 2);

    center = center < 0 ? 
      center * -1 : 
      center;

    return this.from.x < x ? 
      this.from.x + center :
      this.from.x - center;
  }
}

class CircleCommand extends CanvasCommand {
  private from: IPoint;

  constructor({ context, renderCanvasFn, point, devicePixelRatio }: ICanvasCommandArgs) {
    super(context, renderCanvasFn, devicePixelRatio);

    this.from = point;
  }

  public draw({ x, y }: IPoint) {
    this.path = new Path2D();

    const radius = this.calcRadius(x);

    const fromX = this.from.x > x ?
      this.from.x - radius :
      this.from.x + radius;

    this.path.ellipse(fromX, this.from.y, radius, radius, 0, 0, 2 * Math.PI);

    this.renderCanvasFn();
    
    this.render();
  }

  protected render() {
    super.render();
    
    this.context.fill(this.path);
  }

  public isTarget(point: IPoint) {
    if (isTransparent(this.state.fillStyle as string)) {
      return super.isPointInStroke(point);
    } else {
      return super.isPointInPath(point);
    }
  }

  private calcRadius(x: number) {
    const distance = this.from.x - x;

    return distance < 0 ?
      distance * -1 :
      distance;
  }
}

class TextCommand extends CanvasCommand {
  private from: IPoint;

  private text: string;

  private metrics: TextMetrics;

  constructor({ context, renderCanvasFn, point, text, devicePixelRatio }: ICanvasCommandArgs) {
    super(context, renderCanvasFn, devicePixelRatio);

    this.state.textBaseline = 'top';

    this.from = point;
    
    this.text = text || '';

    this.metrics = this.context.measureText(this.text);
  }

  public draw(point: IPoint) {
    this.redraw();
  }

  public isTarget({ x, y }: IPoint) {
    if (this.erased) return false;

    return x >= this.bounds.left && 
      x <= this.bounds.right &&
      y >= this.bounds.top &&
      y <= this.bounds.bottom;
  }

  protected render() {
    this.context.fillText(this.text, this.from.x, this.from.y);
  }
  
  public move(point: IPoint) {
    if (!this.deltaPoint) {
      this.deltaPoint = point;
      return;
    }
    
    this.from.x += point.x - this.deltaPoint.x;
    this.from.y += point.y - this.deltaPoint.y;

    this.redraw();

    this.renderCanvasFn(); 

    this.deltaPoint = point;
  }

  private get bounds() {
    return {
      left: this.from.x - this.metrics.actualBoundingBoxLeft,
      right: this.from.x + this.metrics.actualBoundingBoxRight,
      top: this.from.y,
      bottom: this.from.y + this.metrics.actualBoundingBoxAscent - this.metrics.actualBoundingBoxDescent,
    };
  }
}

export class BackgroundCommand extends CanvasCommand {
  private to: IPoint;

  constructor({ context, renderCanvasFn, devicePixelRatio }: ICanvasCommandArgs) {
    super(context, renderCanvasFn, devicePixelRatio);

    this.to = { x: 0, y: 0 };
  }

  public draw(point: IPoint): void {
    this.to = point;

    this.redraw()
  }

  public redraw(): void {
    super.redraw();

    this.renderCanvasFn({
      onlyFg: true,
    });
  }

  public scale(point: IPoint): void {
    this.to = point;

    this.render();   
  }
  
  protected render(): void {
    if (this.erased) return;

    this.context.clearRect(0, 0, this.to.x, this.to.y);
    this.context.fillRect(0, 0, this.to.x, this.to.y);
  }

  public isTarget(point: IPoint): boolean {
    return false;
  }

  public move(point: IPoint): void {
    throw new Error('Move not supported for background');
  }
}