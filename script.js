// Sélection des éléments du DOM
const addButton = document.getElementById('add-button');
const deleteButton = document.getElementById('delete-button');
const styleButton = document.getElementById('style-button');
const addMenu = document.getElementById('add-menu');
const createShapeBtn = document.getElementById('create-shape');
const shapeTypeSelect = document.getElementById('shape-type');
const shapeColorInput = document.getElementById('shape-color');
const imageInputContainer = document.getElementById('image-input-container');
const imageFileInput = document.getElementById('image-file');

const canvas = document.getElementById('canvas-container');

const saveButton = document.getElementById('save-button');
const loadButton = document.getElementById('load-button');
const fileInput = document.getElementById('file-input');

const textStyleMenu = document.getElementById('text-style-menu');
const fontSizeSelect = document.getElementById('font-size-select');
const fontFamilySelect = document.getElementById('font-family-select');
const applyStyleBtn = document.getElementById('apply-style');

// Variables globales
let shapes = [];
let isMenuOpen = false;
let currentDrag = null;
let offsetX = 0, offsetY = 0;
let selectedElement = null;

// Pour distinguer un clic d'un drag
let startX = 0, startY = 0;
let isDragging = false;
const DRAG_THRESHOLD = 5; // px

// Afficher / Cacher le menu d’ajout
addButton.addEventListener('click', () => {
  isMenuOpen = !isMenuOpen;
  addMenu.classList.toggle('hidden', !isMenuOpen);
});

// Affichage conditionnel de l'input image selon le type sélectionné
shapeTypeSelect.addEventListener('change', () => {
  if (shapeTypeSelect.value === 'image') {
    imageInputContainer.classList.remove('hidden');
  } else {
    imageInputContainer.classList.add('hidden');
  }
});

// Création d’un élément
createShapeBtn.addEventListener('click', () => {
  const type = shapeTypeSelect.value;
  const color = shapeColorInput.value;

  if (type === 'line' || type === 'arrow') {
    createLineOrArrow(type, color);
  } else if (type === 'image') {
    const file = imageFileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        createImageElement(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  } else {
    createShape(type, color);
  }

  addMenu.classList.add('hidden');
  isMenuOpen = false;
});

// Bouton de suppression
deleteButton.addEventListener('click', () => {
  if (selectedElement) {
    const index = Array.from(canvas.children).indexOf(selectedElement);
    if (index > -1) {
      shapes.splice(index, 1);
      canvas.removeChild(selectedElement);
      selectedElement = null;
    }
  }
});

// Bouton de style du texte
styleButton.addEventListener('click', () => {
  if (selectedElement && selectedElement.classList.contains('shape')) {
    const index = Array.from(canvas.children).indexOf(selectedElement);
    if (shapes[index]) {
      const fontSize = shapes[index].fontSize || '14px';
      const fontFamily = shapes[index].fontFamily || 'sans-serif';
      fontSizeSelect.value = fontSize;
      fontFamilySelect.value = fontFamily;
    }
    textStyleMenu.classList.remove('hidden');
  } else {
    textStyleMenu.classList.add('hidden');
  }
});

// Appliquer le style texte
applyStyleBtn.addEventListener('click', () => {
  if (selectedElement && selectedElement.classList.contains('shape')) {
    const index = Array.from(canvas.children).indexOf(selectedElement);
    if (shapes[index]) {
      const newFontSize = fontSizeSelect.value;
      const newFontFamily = fontFamilySelect.value;
      shapes[index].fontSize = newFontSize;
      shapes[index].fontFamily = newFontFamily;

      selectedElement.style.fontSize = newFontSize;
      selectedElement.style.fontFamily = newFontFamily;
    }
  }
  textStyleMenu.classList.add('hidden');
});

// Fonction pour créer une forme
function createShape(type, color) {
  const div = document.createElement('div');
  div.classList.add('shape', type);
  div.contentEditable = true;
  div.style.borderColor = color;

  // Position par défaut
  const rect = canvas.getBoundingClientRect();
  div.style.left = (rect.width/2 - 50) + 'px';
  div.style.top = (rect.height/2 - 25) + 'px';

  // Style par défaut du texte
  div.style.fontSize = '30px';
  div.style.fontFamily = 'sans-serif';

  div.addEventListener('pointerdown', startDrag);
  div.addEventListener('input', autoResize);
  div.addEventListener('click', (e) => {
    e.stopPropagation();
    selectedElement = div;
  });

  canvas.appendChild(div);

  const shapeData = {
    type: type,
    x: parseInt(div.style.left),
    y: parseInt(div.style.top),
    text: '',
    color: color,
    fontSize: '14px',
    fontFamily: 'sans-serif'
  };
  shapes.push(shapeData);
}

function autoResize(e) {
  // Ajustement auto du texte si nécessaire
}

// Création d'une image
function createImageElement(src) {
  const container = document.createElement('div');
  container.classList.add('image-container');

  const img = document.createElement('img');
  img.src = src;
  container.appendChild(img);

  const rect = canvas.getBoundingClientRect();
  const defaultWidth = 100;
  const defaultHeight = 100;
  container.style.width = defaultWidth + 'px';
  container.style.height = defaultHeight + 'px';
  container.style.left = (rect.width / 2 - defaultWidth/2) + 'px';
  container.style.top = (rect.height / 2 - defaultHeight/2) + 'px';

  const resizeHandle = document.createElement('div');
  resizeHandle.classList.add('image-resize-handle');
  container.appendChild(resizeHandle);

  container.addEventListener('pointerdown', startDrag);
  container.addEventListener('click', (e) => {
    e.stopPropagation();
    selectedElement = container;
  });

  resizeHandle.addEventListener('pointerdown', startResize);

  canvas.appendChild(container);

  const shapeData = {
    type: 'image',
    x: parseInt(container.style.left),
    y: parseInt(container.style.top),
    width: defaultWidth,
    height: defaultHeight,
    src: src
  };
  shapes.push(shapeData);

  function startResize(e) {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = container.offsetWidth;
    const startHeight = container.offsetHeight;

    function resizing(ev) {
      ev.preventDefault();
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      container.style.width = (startWidth + dx) + 'px';
      container.style.height = (startHeight + dy) + 'px';
      updateImageData(container);
    }

    function stopResize() {
      document.removeEventListener('pointermove', resizing);
      document.removeEventListener('pointerup', stopResize);
    }

    document.addEventListener('pointermove', resizing, { passive: false });
    document.addEventListener('pointerup', stopResize, { passive: false });
  }
}

// Déplacement des formes et images avec un seuil
function startDrag(e) {
  e.stopPropagation();
  // NE PAS appeler preventDefault ici pour laisser le focus possible sur contentEditable

  if (e.target.classList.contains('shape') || e.target.classList.contains('image-container')) {
    currentDrag = e.target;
    const rect = currentDrag.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    startX = e.clientX;
    startY = e.clientY;
    isDragging = false;

    document.addEventListener('pointermove', drag, { passive: false });
    document.addEventListener('pointerup', endDrag, { passive: false });
  }
}

function drag(e) {
  const distX = Math.abs(e.clientX - startX);
  const distY = Math.abs(e.clientY - startY);

  // Si le curseur bouge plus que le seuil, on considère qu'on fait un drag
  if (!isDragging && (distX > DRAG_THRESHOLD || distY > DRAG_THRESHOLD)) {
    isDragging = true;
  }

  if (isDragging && currentDrag) {
    e.preventDefault(); // Empêche le scroll sur mobile pendant le drag
    const canvasRect = canvas.getBoundingClientRect();
    let x = e.clientX - canvasRect.left - offsetX;
    let y = e.clientY - canvasRect.top - offsetY;

    currentDrag.style.left = x + 'px';
    currentDrag.style.top = y + 'px';

    updateShapeData(currentDrag, x, y);
  }
}

function endDrag(e) {
  document.removeEventListener('pointermove', drag);
  document.removeEventListener('pointerup', endDrag);
  currentDrag = null;
  // Si isDragging est false, c'était juste un clic, donc pas de déplacement
}

function updateShapeData(el, x, y) {
  const index = Array.from(canvas.children).indexOf(el);
  if (shapes[index]) {
    shapes[index].x = x;
    shapes[index].y = y;
    if (el.classList.contains('shape')) {
      shapes[index].text = el.innerText;
    } else if (el.classList.contains('image-container')) {
      shapes[index].width = el.offsetWidth;
      shapes[index].height = el.offsetHeight;
    }
  }
}

function updateImageData(el) {
  const index = Array.from(canvas.children).indexOf(el);
  if (shapes[index]) {
    shapes[index].width = el.offsetWidth;
    shapes[index].height = el.offsetHeight;
  }
}

// Fonction pour créer une ligne ou une flèche
function createLineOrArrow(type, color, x1 = 100, y1 = 100, x2 = 200, y2 = 100) {
  const container = document.createElement('div');
  container.classList.add('line-container');

  container.addEventListener('click', (e) => {
    e.stopPropagation();
    selectedElement = container;
  });

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.pointerEvents = 'none';

  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.classList.add(type);
  line.setAttribute('x1', x1);
  line.setAttribute('y1', y1);
  line.setAttribute('x2', x2);
  line.setAttribute('y2', y2);
  line.setAttribute('stroke', color);
  line.style.pointerEvents = 'stroke';

  if (type === 'arrow') {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '20');
    marker.setAttribute('markerHeight', '14');
    marker.setAttribute('refX', '0');
    marker.setAttribute('refY', '7');
    marker.setAttribute('orient', 'auto');

    const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arrowPath.setAttribute('d', 'M0,0 L0,14 L18,7 z');
    arrowPath.setAttribute('fill', color);

    marker.appendChild(arrowPath);
    defs.appendChild(marker);
    svg.appendChild(defs);
    line.setAttribute('marker-end', 'url(#arrowhead)');
  }

  svg.appendChild(line);
  container.appendChild(svg);
  canvas.appendChild(container);

  const handle1 = document.createElement('div');
  handle1.classList.add('line-handle');
  handle1.style.left = (x1 - 5) + 'px';
  handle1.style.top = (y1 - 5) + 'px';

  const handle2 = document.createElement('div');
  handle2.classList.add('line-handle');
  handle2.style.left = (x2 - 5) + 'px';
  handle2.style.top = (y2 - 5) + 'px';

  container.appendChild(handle1);
  container.appendChild(handle2);

  const shapeData = {
    type: type,
    x1: x1,
    y1: y1,
    x2: x2,
    y2: y2,
    color: color
  };
  shapes.push(shapeData);

  let currentHandle = null;
  let offsetHX = 0, offsetHY = 0;

  handle1.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    const rect = canvas.getBoundingClientRect();
    offsetHX = e.clientX - (rect.left + parseInt(handle1.style.left));
    offsetHY = e.clientY - (rect.top + parseInt(handle1.style.top));
    currentHandle = handle1;
    document.addEventListener('pointermove', handleDrag, { passive: false });
    document.addEventListener('pointerup', handleDrop, { passive: false });
  });

  handle2.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    const rect = canvas.getBoundingClientRect();
    offsetHX = e.clientX - (rect.left + parseInt(handle2.style.left));
    offsetHY = e.clientY - (rect.top + parseInt(handle2.style.top));
    currentHandle = handle2;
    document.addEventListener('pointermove', handleDrag, { passive: false });
    document.addEventListener('pointerup', handleDrop, { passive: false });
  });

  function handleDrag(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    let hx = e.clientX - rect.left - offsetHX;
    let hy = e.clientY - rect.top - offsetHY;
    currentHandle.style.left = hx + 'px';
    currentHandle.style.top = hy + 'px';

    if (currentHandle === handle1) {
      x1 = hx + 5;
      y1 = hy + 5;
    } else {
      x2 = hx + 5;
      y2 = hy + 5;
    }

    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);

    const index = shapes.indexOf(shapeData);
    if (index > -1) {
      shapes[index].x1 = x1;
      shapes[index].y1 = y1;
      shapes[index].x2 = x2;
      shapes[index].y2 = y2;
    }
  }

  function handleDrop(e) {
    document.removeEventListener('pointermove', handleDrag);
    document.removeEventListener('pointerup', handleDrop);
    currentHandle = null;
  }

  line.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    let startX = e.clientX;
    let startY = e.clientY;

    function moveLine(ev) {
      ev.preventDefault();
      let dx = ev.clientX - startX;
      let dy = ev.clientY - startY;
      x1 += dx; y1 += dy;
      x2 += dx; y2 += dy;

      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);

      handle1.style.left = (x1 - 5) + 'px';
      handle1.style.top = (y1 - 5) + 'px';
      handle2.style.left = (x2 - 5) + 'px';
      handle2.style.top = (y2 - 5) + 'px';

      startX = ev.clientX;
      startY = ev.clientY;

      const index = shapes.indexOf(shapeData);
      shapes[index].x1 = x1;
      shapes[index].y1 = y1;
      shapes[index].x2 = x2;
      shapes[index].y2 = y2;
    }

    function stopMoveLine() {
      document.removeEventListener('pointermove', moveLine);
      document.removeEventListener('pointerup', stopMoveLine);
    }

    document.addEventListener('pointermove', moveLine, { passive: false });
    document.addEventListener('pointerup', stopMoveLine, { passive: false });
  });
}

// Sauvegarder
saveButton.addEventListener('click', () => {
  const elements = Array.from(canvas.children);
  elements.forEach((el, i) => {
    if (el.classList.contains('shape')) {
      shapes[i].text = el.innerText;
      shapes[i].x = parseInt(el.style.left);
      shapes[i].y = parseInt(el.style.top);
      shapes[i].fontSize = el.style.fontSize || '14px';
      shapes[i].fontFamily = el.style.fontFamily || 'sans-serif';
    } else if (el.classList.contains('image-container')) {
      shapes[i].x = parseInt(el.style.left);
      shapes[i].y = parseInt(el.style.top);
      shapes[i].width = el.offsetWidth;
      shapes[i].height = el.offsetHeight;
    }
  });

  const dataStr = JSON.stringify(shapes, null, 2);
  const blob = new Blob([dataStr], {type: 'application/json'});
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'layout.json';
  a.click();
  URL.revokeObjectURL(url);
});

// Charger
loadButton.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = JSON.parse(ev.target.result);
      loadLayout(data);
    };
    reader.readAsText(file);
  }
});

function loadLayout(data) {
  canvas.innerHTML = '';
  shapes = data;

  shapes.forEach(shapeData => {
    if (shapeData.type === 'rounded-rect' || shapeData.type === 'circle' || shapeData.type === 'bubble') {
      const div = document.createElement('div');
      div.classList.add('shape', shapeData.type);
      div.style.left = shapeData.x + 'px';
      div.style.top = shapeData.y + 'px';
      div.contentEditable = true;
      div.innerText = shapeData.text || '';
      div.style.borderColor = shapeData.color;
      div.style.fontSize = shapeData.fontSize || '14px';
      div.style.fontFamily = shapeData.fontFamily || 'sans-serif';

      div.addEventListener('pointerdown', startDrag);
      div.addEventListener('input', autoResize);
      div.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedElement = div;
      });

      canvas.appendChild(div);
    } else if (shapeData.type === 'line' || shapeData.type === 'arrow') {
      createLineOrArrow(shapeData.type, shapeData.color, shapeData.x1, shapeData.y1, shapeData.x2, shapeData.y2);
    } else if (shapeData.type === 'image') {
      const container = document.createElement('div');
      container.classList.add('image-container');
      container.style.left = shapeData.x + 'px';
      container.style.top = shapeData.y + 'px';
      container.style.width = shapeData.width + 'px';
      container.style.height = shapeData.height + 'px';

      const img = document.createElement('img');
      img.src = shapeData.src;
      container.appendChild(img);

      const resizeHandle = document.createElement('div');
      resizeHandle.classList.add('image-resize-handle');
      container.appendChild(resizeHandle);

      container.addEventListener('pointerdown', startDrag);
      container.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedElement = container;
      });

      resizeHandle.addEventListener('pointerdown', function(e) {
        e.stopPropagation();
        e.preventDefault();
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = container.offsetWidth;
        const startHeight = container.offsetHeight;

        function resizing(ev) {
          ev.preventDefault();
          const dx = ev.clientX - startX;
          const dy = ev.clientY - startY;
          container.style.width = (startWidth + dx) + 'px';
          container.style.height = (startHeight + dy) + 'px';
          updateImageData(container);
        }

        function stopResize() {
          document.removeEventListener('pointermove', resizing);
          document.removeEventListener('pointerup', stopResize);
        }

        document.addEventListener('pointermove', resizing, { passive: false });
        document.addEventListener('pointerup', stopResize, { passive: false });
      });

      canvas.appendChild(container);
    }
  });
}

// (Optionnel) Pour désélectionner en cliquant ailleurs
document.body.addEventListener('click', () => {
  // selectedElement = null;
}, true);
