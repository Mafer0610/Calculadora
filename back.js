let memory = 0; // Valor guardado en memoria de la calculadora.
let displayMode = 'result'; // Para controlar lo que se muestra.
let isListening = false; // Verifica si el reconocimiento de voz está activo.
let recognition = null; // Reconocimiento de voz inicializado.

// Inicializar Reconocimiento de Voz.
function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
        recognition = new SpeechRecognition();
    } else {
        alert("Tu navegador no soporta reconocimiento de voz.");
        return false;
    }

    recognition.lang = 'es-ES'; 
    recognition.continuous = true; // Mantener el reconocimiento de voz activo.
    recognition.interimResults = false;

    recognition.onresult = function(event) {
        const transcript = event.results[event.resultIndex][0].transcript.toLowerCase();
        processVoiceCommand(transcript);
    };

    recognition.onerror = function(event) {
        console.error('Error en el reconocimiento:', event.error);
        stopListening(); // Manejar errores.
    };

    recognition.onend = function() {
        if (isListening) {
            recognition.start(); // Reiniciar el reconocimiento automáticamente.
        }
    };

    return true;
}

// Procesar comandos de voz.
function processVoiceCommand(transcript) {
    const commands = {
        'más': '+',
        'mas': '+',
        'suma': '+',
        'sumar': '+',
        'menos': '-',
        'resta': '-',
        'restar': '-',
        'por': '*',
        'multiplicado por': '*',
        'multiplicar': '*',
        'entre': '/',
        'dividido': '/',
        'dividido por': '/',
        'dividir': '/',
        'igual': '=',
        'resultado': '=',
        'calcular': '=',
        'seno': 'sin',
        'raíz': '√',
        'raíz cuadrada': '√',
        'raiz': '√',
        'raiz cuadrada': '√',
        'abrir paréntesis': '(',
        'abre paréntesis': '(',
        'parentesis abierto': '(',
        'cerrar paréntesis': ')',
        'cierra paréntesis': ')',
        'parentesis cerrado': ')',
        'punto': '.',
        'pi': '3.14159',
        'borrar': 'CE',
        'eliminar': 'C'
    };

    let processed = false;

    // Intentar reconocer comandos.
    for (const [key, value] of Object.entries(commands)) {
        if (transcript.includes(key)) {
            if (value === '=') {
                calculate(); // Calcular el resultado de la expresión.
            } else if (value === 'CE') {
                clearEntry(); // Borrar la última entrada.
            } else if (value === 'C') {
                clearAll(); // Borrar toda la operación y el resultado.
            } else {
                appendToExpression(value);
            }
            processed = true;
            break; // Finaliza si encuentra un comando válido.
        }
    }

    // Intentar reconocer números (nombres y dígitos).
    const numberWords = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    numberWords.forEach((word, index) => {
        if (transcript.includes(word)) {
            appendToExpression(index.toString());
            processed = true;
        }
    });

    const numberPattern = /\b[0-9]+\b/g; // Reconocer números directamente.
    const numbers = transcript.match(numberPattern);
    if (numbers) {
        numbers.forEach(number => {
            appendToExpression(number);
            processed = true;
        });
    }

    // Si no se reconoce el comando, no agrega directamente la entrada desconocida.
    if (!processed) {
        console.log("Comando no reconocido:", transcript);
    }
}

// Iniciar reconocimiento de voz.
function startListening() {
    if (!recognition && !initSpeechRecognition()) {
        return;
    }

    isListening = true;
    recognition.start();

    const vozButton = document.querySelector('.voz-button');
    if (vozButton) {
        vozButton.textContent = 'Escuchando...'; // Mostrar "Escuchando..."
        vozButton.style.backgroundColor = '#FF4444';
    }
}

// Detener reconocimiento de voz.
function stopListening() {
    isListening = false;
    recognition.stop();

    const vozButton = document.querySelector('.voz-button');
    if (vozButton) {
        vozButton.textContent = 'Voz'; // Cambiar de nuevo a "Voz".
        vozButton.style.backgroundColor = '#999';
    }
}

// Funciones de la calculadora.
function appendToExpression(value) {
    const expressionInput = document.getElementById('expression');
    expressionInput.value += value;
}
function clearEntry() {
    const expressionInput = document.getElementById('expression');
    expressionInput.value = expressionInput.value.slice(0, -1);
}
function clearAll() {
    const expressionInput = document.getElementById('expression');
    const resultInput = document.getElementById('result');
    expressionInput.value = ''; // Borra la operación.
    resultInput.value = ''; // Borra el resultado.
}
function calculate() {
    const expressionInput = document.getElementById('expression');
    const resultInput = document.getElementById('result');
    try {
        let expression = expressionInput.value;

        // Reemplazar funciones específicas.
        expression = expression.replace(/sin\(/g, 'Math.sin((Math.PI/180)*');
        expression = expression.replace(/√/g, 'Math.sqrt');

        const result = eval(expression); // Evalúa la expresión matemática.
        resultInput.value = result; // Muestra el resultado.
        displayMode = 'result'; // Cambiar el modo de visualización.
    } catch (error) {
        resultInput.value = 'Error'; // Mostrar mensaje de error si ocurre algún problema.
    }
}

// Inicialización automática al cargar la página.
window.addEventListener('DOMContentLoaded', () => {
    initSpeechRecognition();
});

// Alternar reconocimiento de voz al presionar el botón.
function toggleVoiceRecognition() {
    if (isListening) {
        stopListening();
    } else {
        startListening();
    }
}

// Evento para el botón de voz.
document.querySelector('.voz-button').addEventListener('click', toggleVoiceRecognition);
