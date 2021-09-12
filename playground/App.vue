<template>
  <div class="app">
    <Menu
      @shape="shape = $event"
      @mode="mode = $event"
      @stroke-style="strokeStyle = $event"
      @line-width="lineWidth = $event"
      @fill-style="fillStyle = $event"
      @bg-color="backgroundColor = $event"
      @undo="() => canvas.undo()"
      @redo="() => canvas.redo()"
      @clear="() => canvas.clear()"
      @save="onSave"
    />
    <div>
      <VueCanvasSmartdok
        ref="canvas"
        class="canvas"
        background-image="http://placekitten.com/800/600"
        :shape="shape"
        :stroke-style="strokeStyle"
        :fill-style="fillStyle"
        :line-width="lineWidth"
        :background-color="backgroundColor"
        :mode="mode"
        :height="height"
        :width="width"
        @mousedown="onMouseDown"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import VueCanvasSmartdok, {
  IPoint,
  CanvasShape,
  CanvasMode,
} from '../src/entry';
import Menu from './Menu.vue';

export default defineComponent({
  components: {
    VueCanvasSmartdok,
    Menu,
  },

  setup() {
    const canvas = ref();

    const shape = ref(CanvasShape.Pencil);

    const mode = ref(CanvasMode.Draw)

    const strokeStyle = ref('black')

    const fillStyle = ref('black')

    const lineWidth = ref()

    const backgroundColor = ref('white');

    const savedImage = ref();

    const width = ref();

    const height = ref();

    const onSave = async () => {
      const url = await canvas.value.save();

      // eslint-disable-next-line no-console
      console.log('saved', url);
    };

    const onMouseDown = (point: IPoint) => canvas.value.drawText(point, 'Some text');

    return {
      canvas,
      shape,
      mode,
      width,
      height,
      onSave,
      fillStyle,
      strokeStyle,
      lineWidth,
      savedImage,
      onMouseDown,
      backgroundColor,
    };
  }
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.app {
  display: flex;

  flex-direction: column;

  align-items: center;

  margin: 1rem;
}

.canvas {
  border: 1px solid black;
}
</style>
