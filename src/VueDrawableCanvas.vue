<template>
  <canvas
    ref="canvas"
    v-bind="$attrs"
    :style="canvasStyle"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
    @mouseleave="onMouseUp"
  >
  </canvas>
  <canvas
    ref="saveCanvas"
    style="display: none"
    :style="canvasStyle"
  >
  </canvas>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  watch,
  PropType,
  onMounted,
  computed,
} from 'vue';
import cloneDeep from 'lodash/cloneDeep';
import {
  CanvasShape,
  CanvasMode,
  ICanvasCommand,
  IPoint,
  IHistoryItem,
  RenderFnArgs,
  ICanvasDimension,
} from './types';
import CanvasCommandFactory, {
  BackgroundCommand,
} from './commands';

const shapeValidator = (value: CanvasShape) => [
    CanvasShape.Pencil,
    CanvasShape.Circle,
    CanvasShape.Rectangle,
    CanvasShape.Triangle,
    CanvasShape.Text,
  ].includes(value);

const modeValidator = (value: CanvasMode) => [
    CanvasMode.Draw,
    CanvasMode.Erase,
    CanvasMode.Move,
  ].includes(value);

export default defineComponent({
  name: 'VueDrawableCanvas',
  
  props: {
    width: {
      type: Number,
      default: 800,
    },

    height: {
      type: Number,
      default: 600,
    },

    font: {
      type: String,
      default: '3rem Arial',
    },

    lineWidth: {
      type: Number,
      default: 5,
    },

    strokeStyle: {
      type: String,
      default: '#000000',
    },

    fillStyle: {
      type: String,
      default: 'transparent',
    }, 

    backgroundColor: {
      type: String,
      required: true,
      default: 'transparent',
    },

    backgroundImage: {
      type: String,
      default: '',
    },

    stretchBackgroundImage: {
      type: Boolean,
      default: false,
    },
  
    shape: {
      type: String as PropType<CanvasShape>,
      default: CanvasShape.Pencil,
      validator: shapeValidator,
    },

    mode: {
      type: String as PropType<CanvasMode>,
      default: CanvasMode.Draw,
      validator: modeValidator,
    },

    devicePixelRatio: {
      type: Boolean,
      default: true,
    },
  },

  emits: [
    'mousedown',
    'target',
  ],

  setup(props, { emit }) {
    const canvas = ref();

    const saveCanvas = ref();

    let context: CanvasRenderingContext2D;

    let history: IHistoryItem[] = [];

    let trash: IHistoryItem[] = [];

    let activeCommand: ICanvasCommand | undefined;

    let mouseDown = false;

    onMounted(() => {
      context = canvas.value.getContext('2d');

      setCanvasDimension({
        canvas: canvas.value,
        context,
        dimension: props,
      });

      setContextState();

      setBackgroundColor();
    });

    watch([
      () => props.devicePixelRatio,
      () => props.width,
      () => props.height,
    ], () => {
      setCanvasDimension({
        canvas: canvas.value,
        context,
        dimension: props,
      });

      scaleBackgroundCommands();
      renderCanvas();
    });

    watch([
      () => props.font,
      () => props.lineWidth,
      () => props.strokeStyle,
      () => props.fillStyle,
    ], () => setContextState());
    
    watch(() => props.backgroundColor, (val, prevVal) => {
      if (val !== prevVal) {
        setBackgroundColor();
      }
    });

    const onMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) return;
        
      mouseDown = true;

      const point = getCoordinates(event);

      emit('mousedown', {
        event,
        point
      });
      
      if (props.mode === CanvasMode.Erase) {
        handleErase(point);
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!mouseDown) return;

      const point = getCoordinates(event);

      if (props.mode === CanvasMode.Draw) {
        handleDraw(point);
      } else if (props.mode === CanvasMode.Erase) {
        handleErase(point);
      } else if (props.mode === CanvasMode.Move) {
        handleMove(point);
      }
    };

    const onMouseUp = (event: MouseEvent) => {
      mouseDown = false;

      if (!activeCommand) return;

      activeCommand.onMouseUp(getCoordinates(event));

      activeCommand = undefined;
    };

    const handleDraw = (point: IPoint) => {
      if (!activeCommand) {
        activeCommand = createDrawCommand(point)
      }

      activeCommand.draw(point);
    };

    const handleMove = (point: IPoint): void => {
      if (!activeCommand) {
        activeCommand = tryCreateMoveCommand(point);
        
        return;
      }

      activeCommand.move(point);
    };

    const handleErase = (point: IPoint) => {
      const command = getTargetCommand(point);

      if (!command) return;

      command.erase();

      history.push({ command });
    };

    const createDrawCommand = (point: IPoint, text?: string): ICanvasCommand => {
      const command = createCommand(props.shape, point, text);
      
      history.push({ command });

      return command;
    };

    const tryCreateMoveCommand = (point: IPoint): ICanvasCommand | undefined => {
      const command = getTargetCommand(point);

      if (!command) return;

      const clone = cloneDeep(command);

      history.push({
        command: clone,
        undo: () => {
          command.redraw();
          clone.erase();
        },
        redo: () => {
          clone.redraw();
          command.erase();
        },
      });

      command.erase(true);

      return clone;
    };

    const createCommand = (shape: CanvasShape, point: IPoint, text?: string) => {
      const devicePixelRatio = props.devicePixelRatio ?
        window.devicePixelRatio :
        undefined;

      const commandArgs = {
        context,
        point,
        text,
        devicePixelRatio,
        renderCanvasFn: renderCanvas,
      };
      
      return CanvasCommandFactory(shape, commandArgs);
    };

    const getTargetCommand = (point: IPoint): ICanvasCommand | undefined => {
      const command = getVisibleFgCommands().find(command => command.isTarget(point));

      if (!command) return;
      
      emit('target', point);

      return command;
    };
    
    const drawText = (point: IPoint, text: string): void => {
      if (props.mode === CanvasMode.Draw && props.shape === CanvasShape.Text) {
        const command = createDrawCommand(point, text);
  
        command.draw(point);
      }
    };

    const renderCanvas = ({ onlyFg }: RenderFnArgs = { onlyFg: false }): void => {
      if (onlyFg) {
        renderFg();
      } else {
        const command = getVisibleBgCommand();

        if (command) {
          command.redraw();
        }
        
        renderFg();
      }
    };

    const renderFg = () => getVisibleFgCommands().forEach(command => command.redraw());
    
    const getVisibleBgCommand = () => history
      .map(({ command }) => command)
      .find(command => !command.isErased && command instanceof BackgroundCommand);

    const getVisibleFgCommands = () => history
      .map(({ command }) => command)
      .filter(command => !command.isErased && !(command instanceof BackgroundCommand));

    const setBackgroundColor = () => {
      context.save();

      context.fillStyle = props.backgroundColor;

      const newBg = createCommand(CanvasShape.Background, {
        x: 0, 
        y: 0,
      });

      context.restore();

      let historyItem: IHistoryItem = {
        command: newBg,
      };

      const currentBg = getVisibleBgCommand();

      if (currentBg) {
        historyItem = {
          ...historyItem,
           undo: () => {
            currentBg.redraw();
            newBg.erase();
          },
          redo: () => {
            newBg.redraw();
            currentBg.erase();
          },
        };
  
        currentBg.erase(true);
      } 

      history.push(historyItem);

      newBg.draw({
        x: props.width, 
        y: props.height,
      });
    };

    const setContextState = () => {
      context.font = props.font;

      context.strokeStyle = props.strokeStyle;

      context.fillStyle = props.fillStyle;
      
      context.lineWidth = props.lineWidth;
    };

    const getCoordinates = (event: MouseEvent): IPoint => {
      const rect = canvas.value.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      return { x, y };
    };

    const scaleBackgroundCommands = () => history
      .filter(({ command }) => command instanceof BackgroundCommand)
      .forEach(({ command }) => command.scale({
        x: props.width,
        y: props.height,
      }));
    
    const setCanvasDimension = ({
        canvas,
        context,
        dimension,
        scaleContext = true,
      }: {
        canvas: HTMLCanvasElement,

        context: CanvasRenderingContext2D,
        scaleContext?: boolean,
        dimension: ICanvasDimension,
      }) => {
      const { width, height } = dimension;

      if (props.devicePixelRatio) {
        const ratio = window.devicePixelRatio;
                
        canvas.width = width * ratio;
        canvas.height = height * ratio;

        if (scaleContext) {
          context.scale(ratio, ratio);
        }

      } else {
        canvas.width = width;
        canvas.height = height;
      }
    };

    const canvasStyle = computed(() => {
      const stretchRule = props.stretchBackgroundImage ? {
        'background-size': '100% 100%',
      } : {};

      return {
        width: `${props.width}px`,
        height: `${props.height}px`,
        'background-image': `url(${props.backgroundImage})`,   
        'background-repeat': 'no-repeat',
        ...stretchRule,
      };
    });

    const undo = (): void => {
      if (history.length <= 1) return;

      const item = history.pop() as IHistoryItem;

      trash.push(item);

      const { command, undo: itemUndo } = item;

      if (itemUndo) {
        itemUndo();
      } else if (command.isErased) {
        command.redraw();
      } else {
        command.erase();
      }
    };

    const redo = (): void => {
      if (!trash.length) return;

      const item = trash.pop() as IHistoryItem;
      
      history.push(item);
      
      const { command, redo: itemRedo } = item;

      if (itemRedo) {
        itemRedo();
      } else if (command.isErased) {
        command.redraw();
      } else {
        command.erase();
      }
    };

    const clear = (): void => {
      history = history.slice(0, 1);

      trash = [];
      
      const [{ command: bg }] = history;

      bg.redraw();
    };

    const save = async (scale = 1): Promise<string> => {
      const scaledHeight = props.height * scale;

      const scaledWidth = props.width * scale;

      const saveContext = saveCanvas.value.getContext('2d');

      setCanvasDimension({
        canvas: saveCanvas.value,
        context: saveContext, 
        scaleContext: false,
        dimension: {
          height: scaledHeight,
          width: scaledWidth,
        },
      });

      const saveBgImage = (): Promise<void> => new Promise(resolve => {
          const image = new Image();

          image.crossOrigin = 'anonymous';
  
          image.onload = async () => {
            const boundry = props.stretchBackgroundImage ? [
              scaledWidth,
              scaledHeight,
            ] : [
              image.width * scale,
              image.height * scale,
            ];

            saveContext.drawImage(image, 0, 0, ...boundry);
            resolve();
          };
  
          image.src = props.backgroundImage;
      });
  
      if (props.backgroundImage) {
        await saveBgImage();
      }

      saveContext.drawImage(canvas.value, 0, 0, scaledWidth, scaledHeight);

      const blob = await new Promise(
        resolve => saveCanvas.value.toBlob(resolve, 'image/png', 1.0),
      );

      saveContext.clearRect(0, 0, scaledWidth, scaledHeight);

      return URL.createObjectURL(blob);
    };

    return {
      canvas,
      saveCanvas,
      canvasStyle,
      onMouseUp,
      onMouseDown,
      onMouseMove,
      drawText,
      clear,
      undo,
      redo,
      save,
    };
  },
});
</script>