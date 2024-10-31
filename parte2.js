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

// Función para integrar la operación en el ensamblador base
function generateFullAssembly(expression) {
    const tree = buildExpressionTree(expression);
    const operationAssembly = expressionToAssembly(tree);

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

    const assemblyCode = generateFullAssembly(expression);
    console.log("Código ensamblador generado:\n", assemblyCode);
}
