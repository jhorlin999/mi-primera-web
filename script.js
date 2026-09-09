/* =====================================================
   CUANDO CARGA LA PÁGINA
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const intro = document.getElementById("intro");
    const contenido = document.querySelector(".contenido-hero");
    const logo = document.querySelector(".contenedor-logo");
    const titulo = document.getElementById("titulo-principal");

    /* =================================================
       OCULTAR SECCIÓN 2 AL INICIAR
       La sección 2 permanecerá oculta hasta pulsar
       el botón "Explorar".
    ================================================== */

    ocultarSeccion2Inicialmente();


    /* =================================================
       INTRODUCCIÓN
    ================================================== */

    setTimeout(() => {

        if (intro) {
            intro.classList.add("ocultar");
        }

    }, 3500);


    /* =================================================
       APARICIÓN DEL CONTENIDO
    ================================================== */

    setTimeout(() => {

        if (contenido) {
            contenido.classList.add("mostrar");
        }

    }, 4000);


    /* =================================================
       APARICIÓN DEL LOGO
    ================================================== */

    setTimeout(() => {

        if (logo) {
            logo.classList.add("mostrar");
        }

    }, 4300);


    /* =================================================
       PRIMERA SECCIÓN
    ================================================== */

    prepararLetras(titulo);
    activarMovimientoLetras(titulo);
    activarMovimientoTexto();
    activarTarjetaColgante();
    activarTransicionExplorar();


    /* =================================================
       SEGUNDA SECCIÓN
    ================================================== */

    activarMenuSeccion2();
    
    activarBotonProyectos();

});



/* =====================================================
   OCULTAR SECCIÓN 2 INICIALMENTE
===================================================== */

/*
   Esta función busca la segunda sección y la mantiene
   completamente oculta cuando se carga la página.
*/

function ocultarSeccion2Inicialmente() {

    const seccion2 = document.getElementById("seccion-2");

    if (!seccion2) return;

    seccion2.style.display = "none";

    seccion2.classList.remove("visible");

    seccion2.classList.add("seccion-2-bloqueada");

}



/* =====================================================
   PREPARAR LETRAS
===================================================== */

function prepararLetras(titulo) {

    if (!titulo) return;

    if (titulo.dataset.preparado === "true") return;

    titulo.dataset.preparado = "true";

    procesarContenido(titulo);

}



/* =====================================================
   PROCESAR CONTENIDO
===================================================== */

function procesarContenido(elemento) {

    const nodos = Array.from(elemento.childNodes);

    nodos.forEach((nodo) => {

        if (nodo.nodeType === Node.TEXT_NODE) {

            const texto = nodo.textContent;

            const fragmento =
                document.createDocumentFragment();

            const partes = texto.split(/(\s+)/);


            partes.forEach((parte) => {

                if (/^\s+$/.test(parte)) {

                    fragmento.appendChild(
                        document.createTextNode(parte)
                    );

                    return;
                }


                const palabra =
                    document.createElement("span");

                palabra.classList.add("palabra");


                for (let i = 0; i < parte.length; i++) {

                    const letra =
                        document.createElement("span");

                    letra.classList.add("letra");

                    letra.textContent = parte[i];

                    palabra.appendChild(letra);

                }


                fragmento.appendChild(palabra);

            });


            nodo.replaceWith(fragmento);

        }

        else if (nodo.nodeType === Node.ELEMENT_NODE) {

            if (!nodo.classList.contains("letra")) {

                procesarContenido(nodo);

            }

        }

    });

}



/* =====================================================
   MOVIMIENTO DE LETRAS
===================================================== */

function activarMovimientoLetras(titulo) {

    if (!titulo) return;

    if (window.matchMedia("(pointer: coarse)").matches) return;

    const letras = titulo.querySelectorAll(".letra");

    if (!letras.length) return;


    titulo.addEventListener("mousemove", (evento) => {

        letras.forEach((letra) => {

            const rect =
                letra.getBoundingClientRect();

            const centroX =
                rect.left + rect.width / 2;

            const centroY =
                rect.top + rect.height / 2;

            const distanciaX =
                evento.clientX - centroX;

            const distanciaY =
                evento.clientY - centroY;

            const distancia =
                Math.sqrt(
                    distanciaX * distanciaX +
                    distanciaY * distanciaY
                );

            const radio = 120;


            if (distancia < radio) {

                const intensidad =
                    1 - (distancia / radio);


                let moverX =
                    -distanciaX *
                    intensidad *
                    0.10;

                let moverY =
                    -distanciaY *
                    intensidad *
                    0.10;


                moverX =
                    Math.max(
                        -6,
                        Math.min(6, moverX)
                    );

                moverY =
                    Math.max(
                        -6,
                        Math.min(6, moverY)
                    );


                letra.style.transform =
                    `translate3d(${moverX}px, ${moverY}px, 0)`;


                if (intensidad > 0.65) {

                    letra.style.color =
                        "#00a84f";

                }

            }

            else {

                letra.style.transform =
                    "translate3d(0, 0, 0)";

                letra.style.color = "";

            }

        });

    });


    titulo.addEventListener("mouseleave", () => {

        letras.forEach((letra) => {

            letra.style.transform =
                "translate3d(0, 0, 0)";

            letra.style.color = "";

        });

    });

}



/* =====================================================
   MOVIMIENTO DE TEXTO
===================================================== */

function activarMovimientoTexto() {

    const elementos =
        document.querySelectorAll(
            ".texto-interactivo"
        );


    elementos.forEach((elemento) => {

        elemento.addEventListener(
            "mousemove",
            (evento) => {

                const rect =
                    elemento.getBoundingClientRect();


                const x =
                    evento.clientX -
                    (rect.left + rect.width / 2);


                const y =
                    evento.clientY -
                    (rect.top + rect.height / 2);


                const movimientoX =
                    Math.max(
                        -5,
                        Math.min(5, x * 0.025)
                    );


                const movimientoY =
                    Math.max(
                        -3,
                        Math.min(3, y * 0.025)
                    );


                elemento.style.transform =
                    `translate3d(${movimientoX}px, ${movimientoY}px, 0)`;

            }
        );


        elemento.addEventListener(
            "mouseleave",
            () => {

                elemento.style.transform =
                    "translate3d(0, 0, 0)";

            }
        );

    });

}



/* =====================================================
    TARJETA COLGANTE - MOVIMIENTO 3D CON BALANCEO
===================================================== */

function activarTarjetaColgante() {

    const pivote = document.querySelector(".pivote-logo");
    const contenedorLogo = document.querySelector(".contenedor-logo");

    if (!pivote || !contenedorLogo) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    // Aseguramos la perspectiva 3D en el contenedor
    if (contenedorLogo.parentElement) {
        contenedorLogo.parentElement.style.perspective = "1000px";
    }

    // Configuración física
    const anguloMaximo = 22;
    const distanciaMaxima = 420;
    const rigidez = 0.05;
    const amortiguacion = 0.88;

    // Variables de control (Objetivos)
    let rotXObjetivo = 0;
    let rotYObjetivo = 0;
    let elevacionObjetivo = 0;

    // Variables de estado actual
    let rotXActual = 0;
    let rotYActual = 0;
    let elevacionActual = 0;

    // Velocidades
    let velRotX = 0;
    let velRotY = 0;
    let velElevacion = 0;

    const tiempoInicio = performance.now();

    window.addEventListener("mousemove", (evento) => {
        const rect = contenedorLogo.getBoundingClientRect();
        const puntoAnclajeX = rect.left + rect.width / 2;
        const puntoAnclajeY = rect.top + rect.height / 2;

        const distanciaX = evento.clientX - puntoAnclajeX;
        const distanciaY = evento.clientY - puntoAnclajeY;

        const distancia = Math.sqrt(distanciaX * distanciaX + distanciaY * distanciaY);
        const intensidad = Math.max(0, 1 - distancia / distanciaMaxima);

        // NUEVO MOVIMIENTO: Giros 3D (Pitch y Yaw) según la posición del cursor
        let rotY = (distanciaX / distanciaMaxima) * anguloMaximo * intensidad;
        let rotX = -(distanciaY / distanciaMaxima) * (anguloMaximo * 0.7) * intensidad;
        let elevacion = -Math.abs(distanciaX) * 0.03 * intensidad; // Se eleva ligeramente al inclinarse

        // Clampear valores límite
        rotYObjetivo = Math.max(-anguloMaximo, Math.min(anguloMaximo, rotY));
        rotXObjetivo = Math.max(-12, Math.min(12, rotX));
        elevacionObjetivo = Math.max(-10, Math.min(10, elevacion));
    });

    document.addEventListener("mouseleave", () => {
        rotXObjetivo = 0;
        rotYObjetivo = 0;
        elevacionObjetivo = 0;
    });

    function actualizar() {
        const tiempo = (performance.now() - tiempoInicio) / 1000;

        // Movimiento Idle: flotación sutil en 3D
        const idleRotY = Math.sin(tiempo * 0.8) * 1.2;
        const idleRotX = Math.cos(tiempo * 1.2) * 0.8;
        const idleY = Math.sin(tiempo * 1.5) * 2;

        // Aplicar física de resorte a Rotación Y
        const fuerzaY = (rotYObjetivo + idleRotY - rotYActual) * rigidez;
        velRotY = (velRotY + fuerzaY) * amortiguacion;
        rotYActual += velRotY;

        // Aplicar física de resorte a Rotación X
        const fuerzaX = (rotXObjetivo + idleRotX - rotXActual) * rigidez;
        velRotX = (velRotX + fuerzaX) * amortiguacion;
        rotXActual += velRotX;

        // Aplicar física a la Elevación Vertical (Y)
        const fuerzaElevacion = (elevacionObjetivo + idleY - elevacionActual) * rigidez;
        velElevacion = (velElevacion + fuerzaElevacion) * amortiguacion;
        elevacionActual += velElevacion;

        // NUEVO TRANSFORM: Combinación de rotación 3D y desplazamiento
        pivote.style.transform = `
            translateY(${elevacionActual.toFixed(2)}px) 
            rotateX(${rotXActual.toFixed(2)}deg) 
            rotateY(${rotYActual.toFixed(2)}deg)
        `;

        requestAnimationFrame(actualizar);
    }

    requestAnimationFrame(actualizar);
}

/* =====================================================
   TRANSICIÓN DEL BOTÓN EXPLORAR
   LA SECCIÓN 2 SOLO SE ABRE AL HACER CLIC
===================================================== */

function activarTransicionExplorar() {

    const botonExplorar =
        document.getElementById(
            "boton-explorar"
        );


    const overlay =
        document.getElementById(
            "transicion-overlay"
        );


    const seccion2 =
        document.getElementById(
            "seccion-2"
        );


    if (!botonExplorar || !seccion2) return;


    let activando = false;


    botonExplorar.addEventListener(
        "click",
        (evento) => {

            evento.preventDefault();


            if (activando) return;

            activando = true;


            /* =========================================
               MOSTRAR SECCIÓN 2
            ========================================= */

            seccion2.classList.remove(
                "seccion-2-bloqueada"
            );


          seccion2.style.display = "flex";

          /* Oculta el scroll general de la página */
document.body.style.overflow = "hidden";

            requestAnimationFrame(() => {

                seccion2.classList.add(
                    "visible"
                );

            });


            /* =========================================
               TRANSICIÓN
            ========================================= */

            if (overlay) {

                const rect =
                    botonExplorar.getBoundingClientRect();


                const origenX =
                    (
                        (rect.left + rect.width / 2) /
                        window.innerWidth
                    ) * 100;


                const origenY =
                    (
                        (rect.top + rect.height / 2) /
                        window.innerHeight
                    ) * 100;


                overlay.style.setProperty(
                    "--origen-x",
                    `${origenX}%`
                );


                overlay.style.setProperty(
                    "--origen-y",
                    `${origenY}%`
                );


                overlay.classList.add(
                    "activo"
                );

            }


            /* =========================================
               IR A SECCIÓN 2
            ========================================= */

            setTimeout(() => {

                seccion2.scrollIntoView({
                    behavior: "auto",
                    block: "start"
                });

            }, 320);


            /* =========================================
               FINAL DE TRANSICIÓN
            ========================================= */

            setTimeout(() => {

                if (overlay) {

                    overlay.classList.remove(
                        "activo"
                    );

                }

                activando = false;

            }, 700);

        }
    );

}



/* =====================================================
   MENÚ DEL PORTAFOLIO
   Permite seleccionar las secciones del portafolio
   desde el menú lateral.
===================================================== */

function activarMenuSeccion2() {

    const navItems =
        document.querySelectorAll(".nav-item");

    if (!navItems.length) return;


    navItems.forEach((item) => {

        item.addEventListener("click", (evento) => {

            evento.preventDefault();


            /* =============================================
               QUITAR LA OPCIÓN ACTIVA
            ============================================= */

            navItems.forEach((nav) => {

                nav.classList.remove("active");

            });


            /* =============================================
               ACTIVAR LA OPCIÓN SELECCIONADA
            ============================================= */

            item.classList.add("active");


            /* =============================================
               OBTENER EL NOMBRE DE LA SECCIÓN
            ============================================= */

            const nombreSeccion =
                item.querySelector("span")?.textContent.trim();


            /* =============================================
               MOSTRAR EN CONSOLA LA SECCIÓN SELECCIONADA
            ============================================= */

            console.log(
                "Sección seleccionada:",
                nombreSeccion
            );


            /* =============================================
               FUNCIÓN INICIO
            ============================================= */

            if (nombreSeccion === "Inicio") {

                mostrarInicio();

            }

        });

    });

}


/* =====================================================
   FUNCIONES DE LA SEGUNDA SECCIÓN
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =============================================
           ICONOS DE LUCIDE
        ============================================== */

        if (typeof lucide !== "undefined") {

            lucide.createIcons();

        }


        /* =============================================
           MENÚ DE NAVEGACIÓN
        ============================================== */

        const navItems =
            document.querySelectorAll(
                ".nav-item"
            );


        navItems.forEach((item) => {

            item.addEventListener(
                "click",
                (e) => {

                    e.preventDefault();


                    navItems.forEach(
                        (nav) => {

                            nav.classList.remove(
                                "active"
                            );

                        }
                    );


                    item.classList.add(
                        "active"
                    );

                }
            );

        });



       /* =====================================================
   ASISTENTE VIRTUAL DE JHORLIN
   Chatbot personal del portafolio
====================================================== */

if (!window.chatbotJhorlinInicializado) {

    window.chatbotJhorlinInicializado = true;

    const chatInput = document.getElementById("chatInput");
    const sendBtn = document.getElementById("sendBtn");
    const chatMessages = document.getElementById("chatMessages");

    /* =================================================
       BASE DE CONOCIMIENTO DE JHORLIN
    ================================================= */

    const conocimientoJhorlin = {

        nombre: "Jhorlin Heiner Alfaro Peralta",

        carrera: "Ingeniería de Sistemas",

        universidad: "Universidad Nacional de San Martín (UNSM)",

        perfil:
            "Jhorlin Heiner Alfaro Peralta es estudiante de Ingeniería de Sistemas. " +
            "Este portafolio reúne parte de su progreso, actividades, proyectos y " +
            "conocimientos adquiridos durante su formación académica.",

        conocimientos: [
            "Java",
            "HTML",
            "CSS",
            "JavaScript",
            "programación",
            "desarrollo web",
            "matemáticas",
            "estructuras de datos",
            "grafos",
            "algoritmos"
        ],

        proyectos: [
            "Proyectos académicos de programación",
            "Proyectos de desarrollo web",
            "Ejercicios de Java",
            "Proyectos relacionados con algoritmos y estructuras de datos"
        ],

        cursos: [
            "Programación",
            "Matemática",
            "Matemática Discreta",
            "Cálculo",
            "Economía",
            "Filosofía"
        ],

        logros: [
            "Desarrollo de proyectos académicos",
            "Creación y mejora de su portafolio web",
            "Aprendizaje de programación en Java",
            "Desarrollo de conocimientos en tecnologías web",
            "Avance en su formación como estudiante de Ingeniería de Sistemas"
        ],

        intereses: [
            "programación",
            "tecnología",
            "desarrollo web",
            "aprendizaje",
            "ingeniería de sistemas"
        ]
    };


    /* =================================================
       AGREGAR MENSAJES
    ================================================= */

    function agregarMensaje(texto, tipo) {

        if (!chatMessages) return;

        const mensaje = document.createElement("div");

        mensaje.classList.add(
            "message",
            tipo === "usuario"
                ? "msg-sent"
                : "msg-received"
        );

        mensaje.textContent = texto;

        chatMessages.appendChild(mensaje);

        chatMessages.scrollTop =
            chatMessages.scrollHeight;
    }


    /* =================================================
       NORMALIZAR TEXTO
    ================================================= */

    function normalizarTexto(texto) {

        return texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    }


    /* =================================================
       BUSCAR INFORMACIÓN SOBRE JHORLIN
    ================================================= */

    function responderSobreJhorlin(texto) {

        const pregunta = normalizarTexto(texto);


        /* -------- NOMBRE -------- */

        if (
            pregunta.includes("como te llamas") ||
            pregunta.includes("cual es tu nombre") ||
            pregunta.includes("quien es jhorlin") ||
            pregunta.includes("quien es jhorlin alfaro") ||
            pregunta.includes("nombre de jhorlin")
        ) {

            return `Jhorlin se llama ${conocimientoJhorlin.nombre}. 👋`;
        }


        /* -------- IDENTIDAD -------- */

        if (
            pregunta.includes("quien eres") ||
            pregunta.includes("quien es el") ||
            pregunta.includes("hablame de jhorlin") ||
            pregunta.includes("sobre jhorlin") ||
            pregunta.includes("cuentame sobre jhorlin")
        ) {

            return conocimientoJhorlin.perfil;
        }


        /* -------- CARRERA -------- */

        if (
            pregunta.includes("que estudia") ||
            pregunta.includes("que carrera") ||
            pregunta.includes("carrera de jhorlin") ||
            pregunta.includes("que estudias")
        ) {

            return `Jhorlin estudia ${conocimientoJhorlin.carrera}. 🎓`;
        }


        /* -------- UNIVERSIDAD -------- */

        if (
            pregunta.includes("donde estudia") ||
            pregunta.includes("universidad") ||
            pregunta.includes("donde estudias")
        ) {

            return `Jhorlin estudia en la ${conocimientoJhorlin.universidad}. 🏫`;
        }


        /* -------- CONOCIMIENTOS -------- */

        if (
            pregunta.includes("que sabe") ||
            pregunta.includes("que conocimientos") ||
            pregunta.includes("que tecnologias") ||
            pregunta.includes("que lenguajes") ||
            pregunta.includes("que programas") ||
            pregunta.includes("habilidades")
        ) {

            return (
                "Jhorlin ha trabajado y aprendido diferentes tecnologías y temas " +
                "relacionados con su formación. Entre ellos se encuentran: " +
                conocimientoJhorlin.conocimientos.join(", ") +
                ". 💻"
            );
        }


        /* -------- JAVA -------- */

        if (
            pregunta.includes("java") ||
            pregunta.includes("programacion")
        ) {

            return (
                "Java es uno de los lenguajes que Jhorlin ha trabajado durante " +
                "su formación. Ha desarrollado ejercicios relacionados con clases, " +
                "métodos, arreglos, recursividad, ordenamiento, algoritmos y estructuras " +
                "de datos. ☕"
            );
        }


        /* -------- PROYECTOS -------- */

        if (
            pregunta.includes("proyectos") ||
            pregunta.includes("que proyectos") ||
            pregunta.includes("proyecto tiene") ||
            pregunta.includes("proyecto ha hecho")
        ) {

            return (
                "En el portafolio de Jhorlin se presentan diferentes proyectos " +
                "académicos relacionados con programación, desarrollo web y algoritmos. " +
                "Puedes revisar la sección 'Proyectos' para conocerlos con más detalle. 🚀"
            );
        }


        /* -------- CURSOS -------- */

        if (
            pregunta.includes("cursos") ||
            pregunta.includes("que cursos") ||
            pregunta.includes("materias") ||
            pregunta.includes("que materias")
        ) {

            return (
                "Durante su formación, Jhorlin ha trabajado temas relacionados con: " +
                conocimientoJhorlin.cursos.join(", ") +
                ". 📚"
            );
        }


        /* -------- LOGROS -------- */

        if (
            pregunta.includes("logros") ||
            pregunta.includes("que logros") ||
            pregunta.includes("logro") ||
            pregunta.includes("que ha logrado")
        ) {

            return (
                "Algunos de los logros registrados en este portafolio son: " +
                conocimientoJhorlin.logros.join("; ") +
                ". 🏆"
            );
        }


        /* -------- INTERESES -------- */

        if (
            pregunta.includes("intereses") ||
            pregunta.includes("que le gusta") ||
            pregunta.includes("que le interesa")
        ) {

            return (
                "Entre los principales intereses relacionados con el portafolio " +
                "de Jhorlin se encuentran la " +
                conocimientoJhorlin.intereses.join(", ") +
                ". ⚡"
            );
        }


        return null;
    }


    /* =================================================
       RAZONAMIENTO BÁSICO
    ================================================= */

    function razonamientoBasico(texto) {

        const pregunta = normalizarTexto(texto);


        /* -------- SUMA -------- */

        let coincidencia = pregunta.match(
            /(\d+(?:\.\d+)?)\s*\+\s*(\d+(?:\.\d+)?)/
        );

        if (coincidencia) {

            const a = Number(coincidencia[1]);
            const b = Number(coincidencia[2]);

            return `El resultado es ${a + b}. 🧠`;
        }


        /* -------- MULTIPLICACIÓN -------- */

        coincidencia = pregunta.match(
            /(\d+)\s*(?:cajas|grupos|paquetes)\s*(?:con|de)\s*(\d+)/
        );

        if (coincidencia) {

            const cantidad = Number(coincidencia[1]);
            const elementos = Number(coincidencia[2]);

            return (
                `Si tienes ${cantidad} grupos con ${elementos} elementos ` +
                `cada uno, entonces tienes ${cantidad * elementos} en total. 🧠`
            );
        }


        /* -------- SECUENCIAS -------- */

        coincidencia = pregunta.match(
            /(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/
        );

        if (coincidencia) {

            const numeros = [
                Number(coincidencia[1]),
                Number(coincidencia[2]),
                Number(coincidencia[3]),
                Number(coincidencia[4])
            ];

            const diferencia =
                numeros[1] - numeros[0];

            if (
                numeros[2] - numeros[1] === diferencia &&
                numeros[3] - numeros[2] === diferencia
            ) {

                const siguiente =
                    numeros[3] + diferencia;

                return (
                    `La secuencia aumenta de ${diferencia} en ${diferencia}. ` +
                    `Por lo tanto, el siguiente número sería ${siguiente}. 🔢`
                );
            }
        }


        /* -------- LÓGICA CONDICIONAL -------- */

        if (
            pregunta.includes("si llueve") &&
            pregunta.includes("paraguas")
        ) {

            return (
                "Si la condición es que cuando llueve se utiliza un paraguas, " +
                "entonces si está lloviendo, la conclusión lógica es llevar paraguas. ☔"
            );
        }


        /* -------- TODOS LOS PROGRAMADORES -------- */

        if (
            pregunta.includes("todos los programadores") &&
            pregunta.includes("juan es programador")
        ) {

            return (
                "Si asumimos que todos los programadores cumplen la característica " +
                "mencionada y Juan es programador, entonces Juan también cumple " +
                "esa característica. Esa es una conclusión lógica basada en la premisa. 🧠"
            );
        }


        return null;
    }


    /* =================================================
       OPERACIONES MATEMÁTICAS SENCILLAS
    ================================================= */

    function resolverOperacion(texto) {

        let expresion = normalizarTexto(texto);

        expresion = expresion
            .replace(/cuanto es/g, "")
            .replace(/cuanto da/g, "")
            .replace(/calcula/g, "")
            .replace(/resuelve/g, "")
            .replace(/resultado de/g, "")
            .trim();

        /*
         * Solo aceptamos números y operadores básicos.
         * No utilizamos Function() ni eval() por seguridad.
         */

        if (
            !/^[0-9+\-*/().\s]+$/.test(expresion) ||
            !/[+\-*/]/.test(expresion)
        ) {

            return null;
        }

        try {

            const tokens =
                expresion.match(
                    /\d+(?:\.\d+)?|[()+\-*/]/g
                );

            if (!tokens) return null;

            let posicion = 0;


            function factor() {

                if (tokens[posicion] === "(") {

                    posicion++;

                    const resultado =
                        expresionMatematica();

                    if (tokens[posicion] !== ")") {
                        throw new Error();
                    }

                    posicion++;

                    return resultado;
                }


                if (tokens[posicion] === "-") {

                    posicion++;

                    return -factor();
                }


                const numero =
                    Number(tokens[posicion]);

                if (!Number.isFinite(numero)) {
                    throw new Error();
                }

                posicion++;

                return numero;
            }


            function termino() {

                let resultado = factor();

                while (
                    tokens[posicion] === "*" ||
                    tokens[posicion] === "/"
                ) {

                    const operador =
                        tokens[posicion++];

                    const siguiente =
                        factor();

                    if (
                        operador === "/" &&
                        siguiente === 0
                    ) {
                        throw new Error();
                    }

                    if (operador === "*") {
                        resultado *= siguiente;
                    } else {
                        resultado /= siguiente;
                    }
                }

                return resultado;
            }


            function expresionMatematica() {

                let resultado = termino();

                while (
                    tokens[posicion] === "+" ||
                    tokens[posicion] === "-"
                ) {

                    const operador =
                        tokens[posicion++];

                    const siguiente =
                        termino();

                    if (operador === "+") {
                        resultado += siguiente;
                    } else {
                        resultado -= siguiente;
                    }
                }

                return resultado;
            }


            const resultado =
                expresionMatematica();

            if (posicion !== tokens.length) {
                return null;
            }

            if (!Number.isFinite(resultado)) {
                return null;
            }

            return `El resultado es ${resultado}. 🧮`;

        } catch (error) {

            return null;
        }
    }


    /* =================================================
       RESPUESTA PRINCIPAL
    ================================================= */

    function obtenerRespuesta(texto) {

        const pregunta =
            normalizarTexto(texto);


        /* SALUDOS */

        if (
            pregunta === "hola" ||
            pregunta.includes("hola ")
        ) {

            return (
                `¡Hola! 👋 Soy el asistente virtual del portafolio de ` +
                `${conocimientoJhorlin.nombre}. ` +
                "Puedo contarte sobre su perfil, proyectos, cursos, conocimientos y logros. " +
                "También puedo ayudarte con algunas preguntas de razonamiento."
            );
        }


        if (
            pregunta.includes("buenos dias") ||
            pregunta.includes("buenas tardes") ||
            pregunta.includes("buenas noches")
        ) {

            return (
                "¡Hola! 👋 Bienvenido al portafolio de Jhorlin. " +
                "¿Qué te gustaría conocer?"
            );
        }


        /* PREGUNTAS SOBRE JHORLIN */

        const respuestaJhorlin =
            responderSobreJhorlin(texto);

        if (respuestaJhorlin) {
            return respuestaJhorlin;
        }


        /* MATEMÁTICAS */

        const operacion =
            resolverOperacion(texto);

        if (operacion) {
            return operacion;
        }


        /* RAZONAMIENTO */

        const razonamiento =
            razonamientoBasico(texto);

        if (razonamiento) {
            return razonamiento;
        }


        /* AGRADECIMIENTO */

        if (
            pregunta.includes("gracias") ||
            pregunta.includes("muchas gracias")
        ) {

            return (
                "¡De nada! 😄 Estoy aquí para ayudarte a conocer mejor " +
                "el trabajo y la trayectoria de Jhorlin."
            );
        }


        /* DESPEDIDA */

        if (
            pregunta.includes("adios") ||
            pregunta.includes("hasta luego")
        ) {

            return (
                "¡Hasta luego! 👋 Gracias por visitar el portafolio de Jhorlin."
            );
        }


        /* RESPUESTA CUANDO NO CONOCE ALGO */

        return (
            "Esa información todavía no está registrada en mi base de conocimiento. 🤔 " +
            "Mi función es aprender progresivamente a partir de la información " +
            "que Jhorlin incorpora en su portafolio. Puedes preguntarme sobre su " +
            "perfil, proyectos, cursos, conocimientos o logros."
        );
    }


    /* =================================================
       ENVIAR MENSAJE
    ================================================= */

    function sendMessage() {

        if (!chatInput || !chatMessages) return;

        const texto =
            chatInput.value.trim();

        if (!texto) return;


        /* MENSAJE DEL USUARIO */

        agregarMensaje(
            texto,
            "usuario"
        );

        chatInput.value = "";


        /* INDICADOR DE PENSAMIENTO */

        const pensando =
            document.createElement("div");

        pensando.classList.add(
            "message",
            "msg-received"
        );

        pensando.textContent =
            "Estoy pensando... 🤖";

        chatMessages.appendChild(pensando);

        chatMessages.scrollTop =
            chatMessages.scrollHeight;


        /* RESPUESTA */

        setTimeout(() => {

            pensando.remove();

            const respuesta =
                obtenerRespuesta(texto);

            agregarMensaje(
                respuesta,
                "bot"
            );

        }, 700);
    }


    /* =================================================
       BOTÓN ENVIAR
    ================================================= */

    if (sendBtn) {

        sendBtn.addEventListener(
            "click",
            sendMessage
        );
    }


    /* =================================================
       ENTER PARA ENVIAR
    ================================================= */

    if (chatInput) {

        chatInput.addEventListener(
            "keypress",
            (evento) => {

                if (evento.key === "Enter") {

                    evento.preventDefault();

                    sendMessage();
                }
            }
        );
    }

}

        /* =============================================
           EFECTO PARALLAX DE LA TARJETA HERO
        ============================================== */

        const heroCard =
            document.querySelector(
                ".card-hero"
            );


        const pulsingCircle =
            document.querySelector(
                ".pulsing-circle"
            );


        if (heroCard && pulsingCircle) {

            heroCard.addEventListener(
                "mousemove",
                (e) => {

                    const rect =
                        heroCard.getBoundingClientRect();


                    const x =
                        e.clientX -
                        rect.left -
                        rect.width / 2;


                    const y =
                        e.clientY -
                        rect.top -
                        rect.height / 2;


                    pulsingCircle.style.transform =
                        `translate(${x * 0.15}px, ${y * 0.15}px) scale(1.15)`;

                }
            );


            heroCard.addEventListener(
                "mouseleave",
                () => {

                    pulsingCircle.style.transform =
                        "translate(0px, 0px) scale(1)";

                }
            );

        }

    }
);
/* =====================================================
   PASO 2
   SCROLL INDEPENDIENTE DE LA SECCIÓN 2

   La sección 2 tendrá su propio scroll.
   El usuario podrá subir y bajar dentro de ella,
   pero no podrá regresar a la sección 1.
===================================================== */

function configurarScrollSeccion2() {

    const seccion2 =
        document.getElementById("seccion-2");

    if (!seccion2) return;


    /* ================================================
       CONFIGURAR LA SECCIÓN 2
       ================================================ */

    seccion2.style.height = "100vh";

    /* IMPORTANTE:
       Esta propiedad permite que el contenido
       de la sección 2 pueda desplazarse verticalmente. */

    seccion2.style.overflowY = "auto";
    seccion2.style.overflowX = "hidden";


    /* ================================================
       EVITAR QUE EL SCROLL DE LA SECCIÓN 2
       REGRESE A LA SECCIÓN 1
       ================================================ */

    seccion2.addEventListener(
        "wheel",
        (evento) => {

            /* ==========================================
               SI ESTAMOS ARRIBA DE LA SECCIÓN 2
               Y EL USUARIO INTENTA SUBIR,
               BLOQUEAMOS EL MOVIMIENTO.
               ========================================== */

            if (
                seccion2.scrollTop <= 0 &&
                evento.deltaY < 0
            ) {
                evento.preventDefault();
            }

        },
        { passive: false }
    );

}
/* =====================================================
   ACTIVAR EL SCROLL DE LA SECCIÓN 2
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        configurarScrollSeccion2();

    }
);

/* =====================================================
   MOSTRAR SECCIÓN DE PROYECTOS
===================================================== */

/* Esta función muestra Proyectos y oculta el contenido
   principal del dashboard cuando el usuario selecciona
   la opción Proyectos del menú. */
function mostrarProyectos() {

    const proyectos = document.getElementById("proyectos");
    const dashboard = document.querySelector(".dashboard-grid");
    const dashboardHeader = document.querySelector(".dashboard-header");

    if (!proyectos) {
        return;
    }

    proyectos.style.display = "block";

    if (dashboard) {
        dashboard.style.display = "none";
    }

    if (dashboardHeader) {
        dashboardHeader.style.display = "none";
    }

}
/* =====================================================
   MOSTRAR INICIO
===================================================== */

function mostrarInicio() {

    const proyectos =
        document.getElementById("proyectos");

    const dashboard =
        document.querySelector(".dashboard-grid");

    const dashboardHeader =
        document.querySelector(".dashboard-header");

    if (proyectos) {
        proyectos.style.display = "none";
    }

    if (dashboard) {
        dashboard.style.display = "grid";
    }

    if (dashboardHeader) {
        dashboardHeader.style.display = "flex";
    }
}

/* =====================================================
   ACTIVAR BOTÓN DE PROYECTOS
===================================================== */

/* Esta función conecta el botón Proyectos del menú
   con la sección correspondiente del portafolio. */
function activarBotonProyectos() {

    const enlaceProyectos =
        document.getElementById("enlace-proyectos");

    if (!enlaceProyectos) {
        return;
    }

    enlaceProyectos.addEventListener("click", function (evento) {

        evento.preventDefault();

        mostrarProyectos();

    });

}

/* =====================================================
   EFECTO DE RAYOS FISI
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const rayos = document.querySelectorAll(".lightning");

    rayos.forEach((rayo) => {

        setInterval(() => {

            const rotacion =
                Math.random() * 12 - 6;

            const desplazamiento =
                Math.random() * 10 - 5;

            const escala =
                0.85 + Math.random() * 0.35;

            rayo.style.setProperty(
                "--rayo-rotacion",
                `${rotacion}deg`
            );

            rayo.style.setProperty(
                "--rayo-desplazamiento",
                `${desplazamiento}px`
            );

            rayo.style.setProperty(
                "--rayo-escala",
                escala
            );

        }, 700 + Math.random() * 900);

    });

});