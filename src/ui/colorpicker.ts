const colorpicker: Element = document.getElementById('colorpicker');
const colorpickerGrid: Element = document.getElementById('colorpicker-grid');
const customColorButton: Element = document.getElementById('colorpicker-custom');
const undoButton: Element = document.getElementById('colorpicker-undo');

let selectedColor: Element = null;

function select(element: Element) {
  element.setAttribute('selected', '');
}

function deselect(element: Element) {
  element.removeAttribute('selected');
}

function onSetColor(e: Event) {
  const element = <Element>e.target;
  if (selectedColor !== null) {
    deselect(selectedColor);
  }

  select(element);
  selectedColor = element;
}

function onSetCustomColor(e: Event) {
  console.log('Custom color');
}

function onUndo(e: Event) {
  console.log('Undo');
}

function addColor() {
  const button = <Element>document.createElement('button');
  button.setAttribute('type', 'colorpicker-color');
  button.addEventListener('click', onSetColor);
  colorpickerGrid.appendChild(button);
}

// debugging
for (let i = 0; i < 18; i++) {
  addColor();
}

customColorButton.addEventListener('click', onSetCustomColor);
undoButton.addEventListener('click', onUndo);

