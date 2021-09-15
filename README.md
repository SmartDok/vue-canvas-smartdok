# vue-canvas-smartdok 

VueJS Component for drawing on canvas. Object based.

Vue3.

# Install

``` npm package info to be added ```

# Usage

To test - clone repo and run:

``` yarn serve ```

``` Code sample to be added  ```

The component have these modes (CanvasMode) of usage:

| Mode | String value |
| :-: | :-: | 
| Draw | draw |
| Erase | erase |
| Move | move |

The component can draw these shapes (CanvasShape):

| Shape | String value |
| :-: | :-: | 
| Pencil | pencil |
| Circle | circle |
| Rectangle | rectangle |
| Triangle | triangle |
| Text | text |
| Background | background |

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
| fillStyle | String | transparent | The color of the fill. Note also sets the text color |
| backgroundColor | String | transparent | The background color |
| backgroundImage | String | '' | The background image |
| stretchBackgroundImage | Boolean | false | Stretces the background image to fit the canvas |
| shape | CanvasShape | CanvasShape.Pencil | The shape to be drawn |
| mode | CanvasMode | CanvasShape.Draw | The canvas mode |
| devicePixelRatio | Boolean | true | Adjust the canavs resolution based on the devicePixelRatio |

# Emits

| Event | Data |  Description |
| :-: | :-: |  :-: |
| mousedown | Coordinate | Emits the coordinate where the mouse was clicked |  
| target | Coordinate | Emits the coordinate where canvas shape was found on mouse click or drag |  

# Methods

| Method name | Parameters | Return value | Description |
| :-: | :-: | :-: | :-: | 
| clear | - | void | Clear the canvas and the undo/redo history |
| undo | - | void | - |
| redo | - |void | - |
| save | scale | String | url to the saved canvas |
| drawText | (coordinate, text) | void | Adds text to the canvas. The coordinate is the top left coordinate where the text will be placed |
# License 
[MIT](license.md)
