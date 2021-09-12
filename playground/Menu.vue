<template>
  <div class="menu">
    <div class="menu__color-pickers">
      <div>
        <label for="strokeStyle">strokeStyle</label>
        <input
          type="color"
          @input="$emit('stroke-style', $event.target.value)"
        >
      </div>
      <div>
        <label for="fillStyle">fillStyle</label>
        <input
          name="fillStyle"
          type="color"
          @input="$emit('fill-style', $event.target.value)"
        />
      </div>
      <div>
        <label for="backgroundColor">backgroundColor</label>
        <input
          name="backgroundColor"
          type="color"
          @input="$emit('background-color', $event.target.value)"
        >
      </div>
      <div>
        <label for="lineWidth">lineWidth</label>
        <input
          type="range"
          name="lineWidth"
          min="2"
          max="15"
          value="2"
          @input="$emit('line-width', Number($event.target.value))"
        >
      </div>
    </div>

    <div
      v-for="item in menuItems"
      :key="item.name"
      :class="{
        menu__item: true,
        'menu__item--active': item.name === activeItem,
      }"
      @click="item.onClick"
    >
      {{ item.name }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  setup(props, { emit }) {
    const activeItem = ref('Pencil');

    const menuItems = [
      {
        name: 'Pencil',
        onClick: () => {
          activeItem.value = 'Pencil';
          emit('mode', 'draw');
          emit('shape', 'pencil');
        },
      },
      {
        name: 'Rectangle',
        onClick: () => {
          activeItem.value = 'Rectangle';
          emit('mode', 'draw');
          emit('shape', 'rectangle');
        },
      },
      {
        name: 'Triangle',
        onClick: () => {
          activeItem.value = 'Triangle';
          emit('mode', 'draw');
          emit('shape', 'triangle');
        },
      },
      {
        name: 'Circle',
        onClick: () => {
          activeItem.value = 'Circle';
          emit('mode', 'draw');
          emit('shape', 'circle');
        },
      },
      {
        name: 'Text',
        onClick: () => {
          activeItem.value = 'Text';
          emit('mode', 'draw');
          emit('shape', 'text');
        },
      },
      {
        name: 'Erase',
        onClick: () => {
          activeItem.value = 'Erase';
          emit('mode', 'erase');
        },
      },
      {
        name: 'Move',
        onClick: () => {
          activeItem.value = 'Move';
          emit('mode', 'move');
        },
      },
      {
        name: 'Undo',
        onClick: () => emit('undo'),
      },
      {
        name: 'Redo',
        onClick: () => emit('redo'),
      },
      {
        name: 'Clear',
        onClick: () => emit('clear'),
      },
      {
        name: 'Save',
        onClick: () => emit('save'),
      },
    ];

    return  {
      menuItems,
      activeItem,
    };
  }
});
</script>

<style lang="scss" scoped>
.menu {
  display: flex;

  align-items: center;

  margin-bottom: 1rem;
}

.menu__color-pickers {
  display: flex;

  flex-direction: column;

  align-items: flex-start;

  width: 13rem;

  margin-right: 1rem;

  div {
    display: flex;

    justify-content: space-between;

    align-items: center;

    width: 100%;
  }
}

.menu__item {
  cursor: default;

  display: flex;

  justify-content: center;

  align-items: center;

  height: 2rem;

  border: 1px solid black;

  border-radius: 4px;

  padding: 5px;

  user-select: none;

  &--active, &:active {
    background-color: yellow;
  }
}

</style>