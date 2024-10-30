// Clase para los nodos del árbol
class Node {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
    }
}

// Función para construir el árbol de expresión a partir de una expresión infija
function buildExpressionTree(expression) {
    const outputQueue = [];
    const operatorStack = [];
    const operators = ['+', '-', '*', '/'];

    // Helper para definir la precedencia de los operadores
    const precedence = (op) => {
        if (op === '+' || op === '-') return 1;
        if (op === '*' || op === '/') return 2;
        return 0;
    };

    // Convertir la expresión infija a notación postfija
    const tokens = expression.match(/\d+|[-+*/]/g);
    
    for (let token of tokens) {
        if (!isNaN(token)) {
            outputQueue.push(new Node(token)); // Si es un número
        } else if (operators.includes(token)) {
            while (
                operatorStack.length &&
                precedence(operatorStack[operatorStack.length - 1]) >= precedence(token)
            ) {
                const opNode = new Node(operatorStack.pop());
                opNode.right = outputQueue.pop();
                opNode.left = outputQueue.pop();
                outputQueue.push(opNode);
            }
            operatorStack.push(token);
        }
    }

    // Sacar los operadores restantes
    while (operatorStack.length) {
        const opNode = new Node(operatorStack.pop());
        opNode.right = outputQueue.pop();
        opNode.left = outputQueue.pop();
        outputQueue.push(opNode);
    }

    return outputQueue.pop();
}

// Función para procesar la expresión
function processExpression() {
    const expression = document.getElementById('expression').value;
    const tree = buildExpressionTree(expression);
    drawTree(tree);
    showTraversals(tree);
    const result = evaluateExpression(tree);
    showResult(result);

}

// Función para evaluar el árbol de expresión
function evaluateExpression(node) {
    if (!node) return 0;
    if (!isNaN(node.value)) return parseFloat(node.value); // Si es un número

    const leftEval = evaluateExpression(node.left);
    const rightEval = evaluateExpression(node.right);

    switch (node.value) {
        case '+': return leftEval + rightEval;
        case '-': return leftEval - rightEval;
        case '*': return leftEval * rightEval;
        case '/': return leftEval / rightEval;
        default: return 0;
    }
}

// Función para mostrar el resultado
function showResult(result) {
    const resultDiv = document.createElement('div');
    resultDiv.innerHTML = `<h2>Resultado: ${result}</h2>`;
    document.body.appendChild(resultDiv);
}

// Función para dibujar el árbol en el canvas
function drawTree(root) {
    const canvas = document.getElementById('treeCanvas');
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    const startX = canvas.width / 2;
    const startY = 40;
    const levelGap = 50;

    function drawNode(node, x, y, level) {
        if (!node) return;

        const childOffset = 120 / (level + 1);

        // Dibuja las líneas de conexión
        if (node.left) {
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x - childOffset, y + levelGap);
            context.stroke();
        }
        if (node.right) {
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x + childOffset, y + levelGap);
            context.stroke();
        }

        // Dibuja el nodo
        context.beginPath();
        context.arc(x, y, 20, 0, 2 * Math.PI);
        context.fillStyle = "#34ac42";
        context.fill();
        context.stroke();

        // Escribe el valor del nodo
        context.fillStyle = "#ffffff";
        context.font = "16px Arial";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(node.value, x, y);

        // Dibuja los nodos hijos
        drawNode(node.left, x - childOffset, y + levelGap, level + 1);
        drawNode(node.right, x + childOffset, y + levelGap, level + 1);
    }

    drawNode(root, startX, startY, 0);
}

// Funciones para mostrar los recorridos del árbol
function showTraversals(tree) {
    const traversalsDiv = document.getElementById('traversals');
    traversalsDiv.innerHTML = '';

    traversalsDiv.innerHTML += `<p><strong>Preorden:</strong> ${preOrder(tree).join(' ')}</p>`;
    traversalsDiv.innerHTML += `<p><strong>Inorden:</strong> ${inOrder(tree).join(' ')}</p>`;
    traversalsDiv.innerHTML += `<p><strong>Postorden:</strong> ${postOrder(tree).join(' ')}</p>`;
}

function preOrder(node) {
    if (node === null) return [];
    return [node.value].concat(preOrder(node.left), preOrder(node.right));
}

function inOrder(node) {
    if (node === null) return [];
    return inOrder(node.left).concat(node.value, inOrder(node.right));
}

function postOrder(node) {
    if (node === null) return [];
    return postOrder(node.left).concat(postOrder(node.right), node.value);
}
