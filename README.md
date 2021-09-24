# vue-drawable-canvas 

VueJS Component - drawable 'object-based' canvas

Vue3.

# Install

``` yarn add vue-drawable-canvas ```

# Usage

To test - clone repo and run:

``` yarn serve ```

To use (See the playground folder for a working demo):

``` 
<!-- MyComponent.vue -->

<template>
  <VueDrawableCanvas
    ref="canvas"
  />
</template>

<script>
import VueDrawableCanvas from 'vue-drawable-canvas';

export default {
  name: 'MyComponent',
  components: {
    VueDrawableCanvas,
  },
};
</script>

```

The component have these modes of usage:

| String |
| :-: | 
| draw |
| erase |
| move |

The component can draw these shapes:

| String |
| :-: | 
| pencil |
| circle |
| rectangle |
| triangle |
| text |
| background |

The given mode and shape are set by props.

Canvas shapes are erased or moved by selecting the appropriate mode then clicking and/or dragging the shape.
# Props

| Name | Type | Default value | Description |
| :-: | :-: | :-: | :-: |
| width | Number | 800 | The canvas width |
| height | Number | 600 | The canvas height |
| font | String | 3rem Arial | The font size and type |
| lineWidth | Number | 5 | The width of the stroke |
| strokeStyle | String | #000000 | The color of the stroke |
| fillStyle | String | transparent | The color of the fill. Note: also sets the text color |
| backgroundColor | String | transparent | The background color |
| backgroundImage | String | '' | The background image |
| stretchBackgroundImage | Boolean | false | Stretces the background image to fit the canvas |
| shape | string | string | The shape to be drawn |
| mode | string | string | The canvas mode |
| devicePixelRatio | Boolean | true | Adjust the canavs resolution based on the devicePixelRatio |

# Emits

| Event | Data |  Description |
| :-: | :-: |  :-: |
| mousedown | MouseEvent, Coordinate | Emits the mouse event and the coordinate relative to the canvas where the mouse was clicked |  
| target | Coordinate | If mouse click or drag is above an object on the canvas the coordinates relative to the canvas is emitted |  

# Methods

| Method name | Parameters | Return value | Description |
| :-: | :-: | :-: | :-: | 
| clear | - | void | Clear the canvas and the undo/redo history |
| undo | - | void | - |
| redo | - |void | - |
| save | scale | Number | returns blob |
| drawText | (coordinate, text) | void | Adds text to the canvas. The coordinate is the top left coordinate where the text will be placed. (Text is rendered with textBaseline 'top')|
# License 
[MIT](license.md)
