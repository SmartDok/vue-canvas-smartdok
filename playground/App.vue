<template>
  <div class="app">
    <Menu
      @shape="state.shape = $event"
      @mode="state.mode = $event"
      @stroke-style="state.strokeStyle = $event"
      @line-width="state.lineWidth = $event"
      @fill-style="state.fillStyle = $event"
      @background-color="state.backgroundColor = $event"
      @undo="() => canvas.undo()"
      @redo="() => canvas.redo()"
      @clear="() => canvas.clear()"
      @save="onSave"
    />
    <div>
      <VueDrawableCanvas
        ref="canvas"
        class="canvas"
        background-image="http://placekitten.com/800/600"
        :shape="state.shape"
        :stroke-style="state.strokeStyle"
        :fill-style="state.fillStyle"
        :line-width="state.lineWidth"
        :background-color="state.backgroundColor"
        :mode="state.mode"
        :height="height"
        :width="width"
        @mousedown="onMouseDown"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue';
import VueDrawableCanvas from '../src/entry';
import { IPoint } from '../src/types';
import Menu from './Menu.vue';

export default defineComponent({
  components: {
    VueDrawableCanvas,
    Menu,
  },

  setup() {
    const canvas = ref();

    const width = ref(800);
    
    const height = ref(600);

    const state = reactive({
      shape: undefined,
      mode: undefined,
      strokeStyle: undefined,
      fillStyle: undefined,
      lineWidth: undefined,
      backgroundColor: undefined,
    });

    const onSave = async () => {
      const url = await canvas.value.save();

      // eslint-disable-next-line no-console
      console.log('saved', url);
    };

    const onMouseDown = ({ event, point }: { event: MouseEvent, point: IPoint }) => {
      canvas.value.drawText(point, 'Some text')
    };

    return {
      state,
      width,
      height,
      canvas,
      onSave,
      onMouseDown,
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
