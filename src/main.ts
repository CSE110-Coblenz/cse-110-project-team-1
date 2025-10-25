import Konva from 'konva';

// first we need to create a stage
const stage = new Konva.Stage({
    container: 'container',
    width: window.innerWidth,
    height: window.innerHeight
});

// then create layer
const layer = new Konva.Layer();
stage.add(layer);

// create our shape
const circle = new Konva.Circle({
    x: stage.width() / 2,
    y: stage.height() / 2,
    radius: 70,
    fill: 'red',
    stroke: 'black',
    strokeWidth: 4
});

// add the shape to the layer
layer.add(circle);

// add the layer to the stage
stage.add(layer);
