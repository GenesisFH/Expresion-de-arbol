// Nodo para el árbol de expresión
class TreeNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
    }
}

// Función para construir el árbol de expresión a partir de una expresión infija
function buildExpressionTree(expression) {
    const operators = [];
    const operands = [];
    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };
    const isOperator = (char) => ['+', '-', '*', '/'].includes(char);

    function applyOperator() {
        const operator = operators.pop();
        const right = operands.pop();
        const left = operands.pop();
        const node = new TreeNode(operator);
        node.left = left;
        node.right = right;
        operands.push(node);
    }

    let i = 0;
    while (i < expression.length) {
        const char = expression[i];

        if (!isNaN(char)) {
            let num = '';
            while (i < expression.length && !isNaN(expression[i])) {
                num += expression[i++];
            }
            operands.push(new TreeNode(parseInt(num)));
            continue;
        }

        if (isOperator(char)) {
            while (
                operators.length &&
                precedence[operators[operators.length - 1]] >= precedence[char]
            ) {
                applyOperator();
            }
            operators.push(char);
        }
        i++;
    }

    while (operators.length) {
        applyOperator();
    }

    return operands.pop();
}

// Funciones de recorrido
function preOrder(node) {
    if (!node) return '';
    return `${node.value} ${preOrder(node.left)}${preOrder(node.right)}`;
}

function inOrder(node) {
    if (!node) return '';
    return `${inOrder(node.left)}${node.value} ${inOrder(node.right)}`;
}

function postOrder(node) {
    if (!node) return '';
    return `${postOrder(node.left)}${postOrder(node.right)}${node.value} `;
}

// Función para convertir el árbol de expresión en código ensamblador
function expressionToAssembly(node) {
    if (!node) return '';

    if (!isNaN(node.value)) {
        return `    mov ax, ${node.value}\n`;
    }

    const leftAssembly = expressionToAssembly(node.left);
    const rightAssembly = expressionToAssembly(node.right);
    const operator = node.value;

    return (
        leftAssembly +
        `    push ax\n` +
        rightAssembly +
        `    pop bx\n` +
        `    ${getAssemblyInstruction(operator)} ax, bx\n`
    );
}

// Función que devuelve la instrucción ensamblador correcta para el operador
function getAssemblyInstruction(operator) {
    switch (operator) {
        case '+': return 'add';
        case '-': return 'sub';
        case '*': return 'imul';
        case '/': return 'idiv';
        default: return '';
    }
}

// Función para dibujar el código de ensamblador en el lienzo
function drawAssemblyCode(canvasId, assemblyCode) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el lienzo

    ctx.font = "16px monospace"; // Establecer fuente
    ctx.fillStyle = "#000"; // Color del texto

    const lines = assemblyCode.split('\n'); // Dividir el código por líneas
    lines.forEach((line, index) => {
        ctx.fillText(line, 10, 20 + index * 20); // Dibujar cada línea
    });
}

function drawTree(node, ctx, x, y, offsetX) {
    if (!node) return;

    // Dibuja el nodo
    ctx.fillStyle = '#FF0000';
    ctx.fillText(node.value, x, y);
    
    // Dibuja las líneas hacia los hijos
    if (node.left) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - offsetX, y + 50);
        ctx.strokeStyle = '#000000';
        ctx.stroke();
        drawTree(node.left, ctx, x - offsetX, y + 50, offsetX / 2);
    }
    
    if (node.right) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + offsetX, y + 50);
        ctx.strokeStyle = '#000000';
        ctx.stroke();
        drawTree(node.right, ctx, x + offsetX, y + 50, offsetX / 2);
    }
}

// Función para generar el código ensamblador completo
function generateFullAssembly(expression) {
    const tree = buildExpressionTree(expression);
    const operationAssembly = expressionToAssembly(tree);

    // Llama a la función para dibujar el código en el lienzo
    

    const baseAssembly = `
.model small                             
.stack 100h                              
.data                                    
mensaje db 'El resultado es: $'          

.code                                    
inicio:                                  
    mov ax, @data                        
    mov ds, ax                           
    mov ah, 09h                          
    mov dx, offset mensaje               
    int 21h                              

    ; Aquí se inserta la operación
${operationAssembly}
    add ax, 30h                          
    mov dl, al                           
    mov ah, 02h                          
    int 21h                              

    mov ax, 4c00h                        
    int 21h                              
end inicio                               
    `;

    return baseAssembly;
    
}

// Función que se llama al hacer clic en el botón en el HTML
function processExpression() {
    const expression = document.getElementById("expression").value;
    if (expression.trim() === "") {
        alert("Por favor ingresa una expresión.");
        return;
    }

    // Construir el árbol y dibujarlo
    const tree = buildExpressionTree(expression);

    // Generar los recorridos
    const preOrderTraversal = preOrder(tree).trim();
    const inOrderTraversal = inOrder(tree).trim();
    const postOrderTraversal = postOrder(tree).trim();

    // Mostrar recorridos en el HTML
    document.getElementById("preOrderResult").textContent = preOrderTraversal;
    document.getElementById("inOrderResult").textContent = inOrderTraversal;
    document.getElementById("postOrderResult").textContent = postOrderTraversal;

    const canvas = document.getElementById("treeCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas
    ctx.font = '20px Arial'; // Configurar fuente

    drawTree(tree, ctx, canvas.width / 2, 30, 120); // Dibujar el árbol

    const assemblyCode = generateFullAssembly(expression);
    drawAssemblyCode("treeCanvas2", assemblyCode);
}

function downloadAssembly() {
    const expression = document.getElementById("expression").value;
    const assemblyCode = generateFullAssembly(expression);

    const blob = new Blob([assemblyCode], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'codigo_ensamblador.asm';
    link.click();
}

