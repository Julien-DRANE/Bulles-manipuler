// Sélection des éléments du DOM
const addButton = document.getElementById('add-button');
const deleteButton = document.getElementById('delete-button');
const styleButton = document.getElementById('style-button');
const addMenu = document.getElementById('add-menu');
const createShapeBtn = document.getElementById('create-shape');
const shapeTypeSelect = document.getElementById('shape-type');
const shapeColorInput = document.getElementById('shape-color');
const canvas = document.getElementById('canvas-container');

const saveButton = document.getElementById('save-button');
const loadButton = document.getElementById('load-button');
const fileInput = document.getElementById('file-input');

// Menu de style du texte
const textStyleMenu = document.getElementById('text-style-menu');
const fontSizeSelect = document.getElementById('font-size-select');
const fontFamilySelect = document.getElementById('font-family-select');
const applyStyleBtn = document.getElementById('apply-style');

// Variables globales
let shapes = []; // stocke les données des formes et lignes
let isMenuOpen = false;
let currentDrag = null;
let offsetX = 0, offsetY = 0;
let selectedElement = null;

// Afficher / Cacher le menu d’ajout
addButton.addEventListener('click', () => {
  isMenuOpen = !isMenuOpen;
  addMenu.classList.toggle('hidden', !isMenuOpen);
});

// Créer une nouvelle forme ou ligne
createShapeBtn.addEventListener('click', () => {
  const type = shapeTypeSelect.value;
  const color = shapeColorInput.value;
  if (type === 'line' || type === 'arrow') {
    createLineOrArrow(type, color);
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
  // Le menu de style n'apparaît que si un élément texte est sélectionné
  if (selectedElement && selectedElement.classList.contains('shape')) {
    // Récupérer les infos depuis shapes
    const index = Array.from(canvas.children).indexOf(selectedElement);
    if (shapes[index]) {
      const fontSize = shapes[index].fontSize || '10px';
      const fontFamily = shapes[index].fontFamily || 'sans-serif';
      fontSizeSelect.value = fontSize;
      fontFamilySelect.value = fontFamily;
    }
    textStyleMenu.classList.remove('hidden');
  } else {
    textStyleMenu.classList.add('hidden');
  }
});

// Appliquer le style
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

// Fonction pour créer une forme (bulle, cercle, rectangle arrondi)
function createShape(type, color) {
  const div = document.createElement('div');
  div.classList.add('shape', type);
  div.contentEditable = true; // permet d'éditer le texte
  div.style.borderColor = color;

  // Position par défaut
  const rect = canvas.getBoundingClientRect();
  div.style.left = (rect.width/2 - 50) + 'px';
  div.style.top = (rect.height/2 - 25) + 'px';

  // Style par défaut du texte
  div.style.fontSize = '30px';
  div.style.fontFamily = 'sans-serif';

  // Evénements
  div.addEventListener('mousedown', startDrag);
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
  // Ajuster éventuellement la taille. Pour l'instant, on laisse en auto.
}

// Déplacement des formes
function startDrag(e) {
  if (e.target.classList.contains('shape')) {
    currentDrag = e.target;
    const rect = currentDrag.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
  }
}

function drag(e) {
  if (currentDrag) {
    const canvasRect = canvas.getBoundingClientRect();
    let x = e.clientX - canvasRect.left - offsetX;
    let y = e.clientY - canvasRect.top - offsetY;

    currentDrag.style.left = x + 'px';
    currentDrag.style.top = y + 'px';

    // Mettre à jour les données dans shapes
    updateShapeData(currentDrag, x, y);
  }
}

function endDrag(e) {
  document.removeEventListener('mousemove', drag);
  document.removeEventListener('mouseup', endDrag);
  currentDrag = null;
}

function updateShapeData(el, x, y) {
  const index = Array.from(canvas.children).indexOf(el);
  if (shapes[index]) {
    shapes[index].x = x;
    shapes[index].y = y;
    if (el.classList.contains('shape')) {
      shapes[index].text = el.innerText;
    }
  }
}

// Création de lignes / flèches
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
    marker.setAttribute('markerWidth', '50');
    marker.setAttribute('markerHeight', '34');
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

  handle1.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    currentHandle = handle1;
    startHandleDrag(e);
  });

  handle2.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    currentHandle = handle2;
    startHandleDrag(e);
  });

  function startHandleDrag(e) {
    const rect = canvas.getBoundingClientRect();
    offsetHX = e.clientX - (rect.left + parseInt(currentHandle.style.left));
    offsetHY = e.clientY - (rect.top + parseInt(currentHandle.style.top));
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDrop);
  }

  function handleDrag(e) {
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
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', handleDrop);
    currentHandle = null;
  }

  line.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    let startX = e.clientX;
    let startY = e.clientY;

    function moveLine(ev) {
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
      document.removeEventListener('mousemove', moveLine);
      document.removeEventListener('mouseup', stopMoveLine);
    }

    document.addEventListener('mousemove', moveLine);
    document.addEventListener('mouseup', stopMoveLine);
  });
}

// Sauvegarde (export JSON)
saveButton.addEventListener('click', () => {
  const elements = Array.from(canvas.children);
  elements.forEach((el, i) => {
    if (el.classList.contains('shape')) {
      shapes[i].text = el.innerText;
      shapes[i].x = parseInt(el.style.left);
      shapes[i].y = parseInt(el.style.top);
      // Mises à jour de la font
      shapes[i].fontSize = el.style.fontSize || '14px';
      shapes[i].fontFamily = el.style.fontFamily || 'sans-serif';
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

// Chargement (import JSON)
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
  // Vider le canvas
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

      div.addEventListener('mousedown', startDrag);
      div.addEventListener('input', autoResize);
      div.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedElement = div;
      });

      canvas.appendChild(div);
    } else if (shapeData.type === 'line' || shapeData.type === 'arrow') {
      createLineOrArrow(shapeData.type, shapeData.color, shapeData.x1, shapeData.y1, shapeData.x2, shapeData.y2);
    }
  });
}

// Cliquer en dehors pour désélectionner si souhaité
document.body.addEventListener('click', () => {
  // Vous pouvez décommenter pour désélectionner quand on clique ailleurs
  // selectedElement = null;
}, true);
