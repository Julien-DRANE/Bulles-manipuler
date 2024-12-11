// app.js

// Initialisation du canevas Fabric.js
const canvas = new fabric.Canvas('c', {
    backgroundColor: '#f0f0f0',
    selection: true,
    preserveObjectStacking: true,
    subTargetCheck: true // Permet de détecter les sous-objets dans les groupes
});

// Récupération des éléments DOM
const addShapeBtn = document.getElementById('addShapeBtn');
const shapeMenu = document.getElementById('shapeMenu');
const strokeColorInput = document.getElementById('strokeColor');
const saveBtn = document.getElementById('saveBtn');
const loadBtn = document.getElementById('loadBtn');
const loadFileInput = document.getElementById('loadFileInput');

// Afficher ou masquer le menu des formes
addShapeBtn.addEventListener('click', () => {
    shapeMenu.classList.toggle('hidden');
});

// Ajouter des formes en fonction de la sélection
shapeMenu.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        const shape = e.target.getAttribute('data-shape');
        addShape(shape);
        shapeMenu.classList.add('hidden');
    }
});

// Fonction pour ajouter une forme avec un texte groupé
function addShape(type) {
    let shape;
    const strokeColor = strokeColorInput.value;
    const options = {
        stroke: strokeColor,
        strokeWidth: 2,
        fill: 'rgba(0,0,0,0)', // Forme vide
        selectable: true,
        hasControls: true,
        hasBorders: true,
    };

    switch(type) {
        case 'circle':
            shape = new fabric.Circle({
                ...options,
                radius: 50,
            });
            break;
        case 'rectangle':
            shape = new fabric.Rect({
                ...options,
                width: 150,
                height: 100,
                rx: 15, // Bords arrondis
                ry: 15,
            });
            break;
        case 'arrow':
            shape = createArrow(strokeColor);
            break;
        case 'line':
            shape = new fabric.Line([0, 0, 200, 0], {
                stroke: strokeColor,
                strokeWidth: 2,
                selectable: true,
                hasBorders: false,
                hasControls: true,
                originX: 'left',
                originY: 'center',
            });
            break;
        default:
            return;
    }

    // Position initiale de la forme
    shape.set({
        left: 100,
        top: 100,
    });

    // Créer l'objet texte
    const text = new fabric.IText('Votre texte', {
        fontSize: 20,
        originX: 'center',
        originY: 'center',
        editable: true,
        fill: '#000000',
        textAlign: 'center',
        selectable: false, // Le texte ne peut pas être sélectionné indépendamment
    });

    // Grouper la forme et le texte
    const group = new fabric.Group([shape, text], {
        left: shape.left,
        top: shape.top,
        subTargetCheck: true, // Permet de détecter les sous-objets dans le groupe
        hasControls: true,
        hasBorders: true,
    });

    // Ajouter le groupe au canevas
    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.renderAll();
}

// Fonction pour créer une flèche
function createArrow(color) {
    const line = new fabric.Line([0, 0, 100, 0], {
        stroke: color,
        strokeWidth: 2,
        selectable: true,
        hasBorders: false,
        hasControls: true,
        originX: 'left',
        originY: 'center',
    });

    const triangle = new fabric.Triangle({
        left: 100,
        top: 0,
        originX: 'center',
        originY: 'center',
        selectable: false,
        pointType: 'arrow_end',
        angle: 90,
        width: 10,
        height: 15,
        fill: color,
    });

    const group = new fabric.Group([line, triangle], {
        left: 0,
        top: 0,
        selectable: true,
        hasControls: true,
        hasBorders: true,
    });

    return group;
}

// Événement pour éditer le texte via double-clic
canvas.on('mouse:dblclick', function(options) {
    if (options.target && options.target.type === 'group') {
        const group = options.target;
        const text = group.getObjects('i-text')[0];
        if (text) {
            // Passer en mode édition
            text.selectable = true;
            text.evented = true;
            canvas.setActiveObject(text);
            text.enterEditing();
            text.selectAll();
        }
    }
});

// Événement pour ajuster la forme après modification du texte
canvas.on('text:changed', function(e) {
    const text = e.target;
    if (text) {
        const group = text.group;
        if (group) {
            const shape = group.getObjects().find(obj => obj.type === 'rect' || obj.type === 'circle' || obj.type === 'group' || obj.type === 'line');
            if (shape) {
                const textWidth = text.width * text.scaleX;
                const textHeight = text.height * text.scaleY;
                const margin = 20;

                if (shape.type === 'rect') {
                    shape.set({
                        width: textWidth + margin,
                        height: textHeight + margin,
                    });
                } else if (shape.type === 'circle') {
                    const radius = Math.max(textWidth, textHeight) / 2 + margin / 2;
                    shape.set({
                        radius: radius,
                    });
                } else if (shape.type === 'group') { // Flèche
                    const line = shape.getObjects('line')[0];
                    const triangle = shape.getObjects('triangle')[0];
                    const newLength = textWidth + margin;
                    line.set({ x2: newLength });
                    triangle.set({ left: newLength });
                } else if (shape.type === 'line') {
                    // Pour les lignes simples, ajuster la longueur si nécessaire
                    shape.set({ x2: textWidth + margin });
                }

                // Centrer le texte dans la forme
                text.set({
                    left: shape.left + shape.width / 2,
                    top: shape.top + shape.height / 2,
                });

                group.setCoords();
                canvas.renderAll();
            }
        }
    }
});

// Événement pour terminer l'édition du texte
canvas.on('text:editing:exited', function(e) {
    const text = e.target;
    if (text) {
        text.selectable = false;
        text.evented = false;
        canvas.discardActiveObject();
        canvas.renderAll();
    }
});

// Sauvegarder le canevas dans le localStorage
saveBtn.addEventListener('click', () => {
    const json = JSON.stringify(canvas.toJSON());
    localStorage.setItem('canvas', json);
    alert('Page sauvegardée avec succès!');
});

// Charger le canevas depuis le localStorage
loadBtn.addEventListener('click', () => {
    loadFileInput.click();
});

// Charger depuis un fichier JSON
loadFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const json = event.target.result;
        canvas.loadFromJSON(json, () => {
            canvas.renderAll();
            alert('Page chargée avec succès!');
        });
    };
    reader.readAsText(file);
});

// Optionnel : Téléchargement du JSON de sauvegarde
saveBtn.addEventListener('dblclick', () => {
    const json = JSON.stringify(canvas.toJSON());
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'canvas-sauvegarde.json';
    link.click();
    URL.revokeObjectURL(url);
});
