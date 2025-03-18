let memory = 0; //Es pa almacena el valor guardado en memoria de la calculadora
let displayMode = 'result'; //Pa controlar que se muestra
let stream = null; //Esto es pa la funcionalidad de streaming (no utilizada activamente)
let recognition = null; //Almacenamiento del reconocimiento de voz
let isListening = false; //Checa que el reconocimiento de voz está activo

//Reconocimiento de Voz
function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
        recognition = new SpeechRecognition();
    } else {
        alert("Tu navegador no soporta reconocimiento de voz");
        return false;
    }
    
    recognition.lang = 'es-ES'; 
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript.toLowerCase();
        processVoiceCommand(transcript);
    };
    
    recognition.onerror = function(event) {
        console.error('Error en reconocimiento de voz:', event.error);
        stopListening();
    };
    
    recognition.onend = function() {
        if (isListening) {
            recognition.start(); // Reiniciar la escucha 
        } else {
            const vozButton = document.querySelector('.voz-button');
            if (vozButton) {
                vozButton.textContent = 'Voz';
                vozButton.style.backgroundColor = '#999';
            }
        }
    };
    
    return true;
}

// Procesamiento de comandos de voz
function processVoiceCommand(transcript) {
    console.log('Comando de voz recibido:', transcript);
        const voiceCommands = {
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
        'borrar todo': 'C',
        'limpiar': 'C'
    };

    // Procesamiento para números, operadores y comandos
    let processed = false;
    
    for (const [command, action] of Object.entries(voiceCommands)) {
        if (transcript.includes(command)) {
            processed = true;
            
            if (action === '=') {
                calculate();
            } else if (action === 'CE') {
                clearEntry();
            } else if (action === 'C') {
                clearAll();
            } else {
                appendToExpression(action);
            }
        }
    }
    
    // Procesar números 
    const numberWords = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    numberWords.forEach((word, index) => {
        if (transcript.includes(word)) {
            appendToExpression(index.toString());
            processed = true;
        }
    });
    
    // Procesar números directamente
    const numberPattern = /\b[0-9]+\b/g;
    const numbers = transcript.match(numberPattern);
    if (numbers) {
        numbers.forEach(number => {
            appendToExpression(number);
            processed = true;
        });
    }
    
    if (!processed) {
        // Feedback visual si no se reconoció ningún comando
        const resultInput = document.getElementById('result');
        const originalValue = resultInput.value;
        resultInput.value = "Comando no reconocido";
        setTimeout(() => { resultInput.value = originalValue; }, 1000);
    }
}

//Control del Reconocimiento de Voz

// Iniciar/detener la escucha de voz
function toggleVoiceRecognition() {
    if (!recognition && !initSpeechRecognition()) {
        return; 
    }
    if (!isListening) {
        startListening();
    } else {
        stopListening();
    }
}
function startListening() {
    isListening = true;
    recognition.start();
    
    const vozButton = document.querySelector('.voz-button');
    if (vozButton) {
        vozButton.textContent = 'Escuchando...';
        vozButton.style.backgroundColor = '#FF4444';
    }
}
function stopListening() {
    isListening = false;
    if (recognition) {
        recognition.stop();
    }
    
    // Restaurar apariencia del botón
    const vozButton = document.querySelector('.voz-button');
    if (vozButton) {
        vozButton.textContent = 'Voz';
        vozButton.style.backgroundColor = '#999';
    }
}

//Funciones de la Calculadora
function appendToExpression(value) {
    const expressionInput = document.getElementById('expression');
    const resultInput = document.getElementById('result');

    //0 hasta que se presione igual
    resultInput.value = '0';

    if (displayMode === 'result' && '0123456789.'.includes(value)) {
        expressionInput.value = value;
        displayMode = 'expression';
    } else if (displayMode === 'result') {
        if (value === 'sin' || value === '√') {
            expressionInput.value = (value === 'sin' ? 'sin(' : 'raiz(') + resultInput.value;
        } else {
            expressionInput.value = resultInput.value + value;
        }
        displayMode = 'expression';
    } else {
        expressionInput.value += value === 'sin' ? 'sin(' : value === '√' ? 'raiz(' : value;
    }
}
//Elimina el último carácter de la expresión
function clearEntry() {
    const expressionInput = document.getElementById('expression');
    const resultInput = document.getElementById('result');
    expressionInput.value = expressionInput.value.slice(0, -1);
    // Mantener el 0 en el resultado
    resultInput.value = '0';
}
//Limpia completamente la expresión y el resultado
function clearAll() {
    document.getElementById('expression').value = '';
    document.getElementById('result').value = '0';
    displayMode = 'result';
}

//Guardan y recuperan valores en la memoria de la calculadora
function memoryStore() {
    const resultInput = document.getElementById('result');
    if (resultInput.value !== '' && resultInput.value !== 'Error') {
        memory = parseFloat(resultInput.value);
        const originalValue = resultInput.value;
        resultInput.value = 'M';
        setTimeout(() => { resultInput.value = originalValue; }, 500);
    }
}
function memoryRecall() {
    const expressionInput = document.getElementById('expression');
    const resultInput = document.getElementById('result');

    if (displayMode === 'result') {
        expressionInput.value = memory.toString();
        // Mantener el 0 en el resultado
        resultInput.value = '0';
        displayMode = 'expression';
    } else {
        expressionInput.value += memory.toString();
        // Mantener el 0 en el resultado
        resultInput.value = '0';
    }
}

//Evalúa la expresión matemática actual
function calculate() {
    const expressionInput = document.getElementById('expression');
    const resultInput = document.getElementById('result');
    let expression = expressionInput.value;

    try {
        expression = expression.replace(/sin\(/g, 'Math.sin((Math.PI/180) * ');
        expression = expression.replace(/raiz\(/g, 'Math.sqrt(');
        const result = eval(expression);
        resultInput.value = result;
        displayMode = 'result';
    } catch (error) {
        resultInput.value = 'Error';
        displayMode = 'result';
    }
}

//Funciones de Interfaz

// Cambiar función para usar reconocimiento de voz en lugar de cámara
function openAudio() {
    toggleVoiceRecognition();
}

// Detener reconocimiento de voz
function close() {
    document.getElementById('voz-container').style.display = 'none';
    stopListening();
}

window.addEventListener('DOMContentLoaded', initSpeechRecognition);