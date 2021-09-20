<template>
  <div class="menu">
    <div class="menu__color-pickers">
      <div
        v-for="input in inputs"
        :key="input.name"
      >
        <label :for="input.name">{{ input.name }}</label>
        <input
          :type="input.type"
          :min="input.min"
          :max="input.max"
          :value="input.value"
          @input="onInputEvent(input, $event)"
        >
      </div>
    </div>

    <div
      v-for="item in menuItems"
      :key="item.name"
      :class="{
        menu__item: true,
        'menu__item--active': item.name === activeMenuItem,
      }"
      @click="item.onClick"
    >
      {{ item.name }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';

interface MenuItem {
  name: string,
  onClick: () => void,
}

export default defineComponent({
  setup(props, { emit }) {
    const shapes = [
      'pencil',
      'circle',
      'rectangle',
      'triangle',
      'text',
    ];

    const modes = [
      'erase',
      'move',
    ];

    const actions = [
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

    const activeMenuKey = ref<string>();

    const setActiveMenuKey = (key: string) => {
      activeMenuKey.value = key;
    };

    const menuItems: MenuItem[] = [];

    [...shapes, ...modes].forEach(name => {
      menuItems.push({
        name,
        onClick: () => setActiveMenuKey(name),
      })
    });
  
    actions.forEach(action => menuItems.push(action));
      
    const inputs = [
      {
        name: 'strokeStyle',
        event: 'stroke-style',
        type: 'color',
        value: 'black',
      },
      {
        name: 'fillStyle',
        event: 'fill-style',
        type: 'color',
        value: 'black',
      },
      {
        name: 'backgroundColor',
        event: 'background-color',
        type: 'color',
        value: 'white',
      },
      {
        name: 'lineWidth',
        event: 'line-width',
        type: 'range',
        min: 2,
        max: 20,
        value: 5,
        convert: (val: string) => Number(val),
      }
    ];

    const onInputEvent = (item: any, event: any) => {
      const input = inputs.find(it => it.name === item.name);

      if (!input) {
        throw new Error('Input not found');
      }

      const { value } = event.target;
      
      input.value = value;

      if (item.convert) {
        emit(item.event, item.convert(value));
      } else {
        emit(item.event, value);
      }
    }

    watch(activeMenuKey, val => {
      if (shapes.includes(val as string)) {
        emit('mode', 'draw')
        emit('shape', val)
      } else {
        emit('mode', val)
      }
    });

    return  {
      inputs,
      onInputEvent,
      menuItems,
      activeMenuKey,
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