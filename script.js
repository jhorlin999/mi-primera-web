const SUPABASE_URL = "https://ugexoftyzhdkmrvwyxqn.supabase.co";
let supabaseClient;
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnZXhvZnR5emhka21ydnd5eHFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NDQyODksImV4cCI6MjEwNTUyMDI4OX0.Bm_nNuXAp1y7ybMyECZ1U_lIjRpUdlPrlmUtP0a67iM";


/* =====================================================
    ESTADO GLOBAL: ¿SE VE LA PRIMERA SECCIÓN (HERO)?
   Se usa para pausar animaciones/loops cuando el
   usuario ya está en la Sección 2, y así no gastar
   CPU/batería de más.
===================================================== */

let heroVisible = true;
let tiltLoopActivo = false;
let semanaSeleccionadaActual = 1;


/* =====================================================
   PAUSA GLOBAL DE ANIMACIONES CSS CUANDO LA PESTAÑA
   PASA A SEGUNDO PLANO (ahorra batería/CPU). No afecta
   nada mientras la página está siendo vista.
===================================================== */

document.addEventListener("visibilitychange", () => {
    document.documentElement.classList.toggle("animaciones-pausadas", document.hidden);
});


/* =====================================================
   CUANDO CARGA LA PÁGINA
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    supabaseClient = window.supabase?.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );

    const intro = document.getElementById("intro");
    const contenido = document.querySelector(".contenido-hero");
    const logo = document.querySelector(".contenedor-logo");
    const titulo = document.getElementById("titulo-principal");

    ocultarSeccion2Inicialmente();

    setTimeout(() => {
        if (intro) {
            intro.classList.add("ocultar");
        }
    }, 1000);

    setTimeout(() => {
        if (contenido) {
            contenido.classList.add("mostrar");
        }
    }, 1200);

    setTimeout(() => {
        if (logo) {
            logo.classList.add("mostrar");
        }
    }, 1300);

    prepararLetras(titulo);

    activarMovimientoTexto();
        activarMovimientoLetrasTitulo();
    activarTarjetaColgante();
    activarTransicionExplorar();



    activarPausaFueraDeVista();

    activarMenuSeccion2();
    activarBotonProyectos();
    inicializarGestorProyectos();
    inicializarVisorDocumentos();
    configurarScrollSeccion2();
    inicializarIconosLucide();
    inicializarChatbotJhorlin();
    activarParallaxCardHero();
    activarRayosFisi();
    inicializarSistemaSemanas();

});


function inicializarVisorDocumentos() {
    const visor = document.getElementById("visor-documento");
    const marco = document.getElementById("marco-documento");
    const titulo = document.getElementById("titulo-visor-documento");
    const enlaceExterno = document.getElementById("abrir-documento-externo");
    const botonCerrar = document.getElementById("cerrar-visor-documento");
    const seccion = document.getElementById("seccion-2");

    if (!visor || !marco || !titulo || !enlaceExterno || !botonCerrar || !seccion) return;

    seccion.addEventListener("click", (evento) => {
        const objetivo = evento.target instanceof Element
            ? evento.target.closest(".boton-ver-documento")
            : null;

        if (!objetivo || typeof visor.showModal !== "function") return;

        evento.preventDefault();

        const tarjeta = objetivo.closest(".proyecto-card");
        const nombreDocumento = tarjeta?.querySelector(".proyecto-info h3")?.textContent.trim();

        titulo.textContent = nombreDocumento || "Documento PDF";
        enlaceExterno.href = objetivo.href;
        marco.src = objetivo.href;
        visor.showModal();
        inicializarIconosLucide();
    });

    botonCerrar.addEventListener("click", () => visor.close());

    visor.addEventListener("click", (evento) => {
        if (evento.target === visor) visor.close();
    });

    visor.addEventListener("close", () => {
        marco.src = "about:blank";
    });
}


function inicializarGestorProyectos() {
    const boton = document.getElementById("boton-nuevo-proyecto");
    const modal = document.getElementById("modal-proyecto");
    const cerrar = document.getElementById("cerrar-modal-proyecto");
    const acceso = document.getElementById("formulario-acceso-proyecto");
    const formulario = document.getElementById("formulario-nuevo-proyecto");
    const estado = document.getElementById("estado-proyecto");
    const semana = document.getElementById("semana-proyecto");
    const cerrarSesion = document.getElementById("cerrar-sesion-proyecto");
    const MAXIMO_PESO_PDF = 10 * 1024 * 1024;

    if (!boton || !modal || !cerrar || !acceso || !formulario) return;

    if (!supabaseClient) {
        if (estado) {
            estado.textContent = "La conexión con Supabase no está disponible.";
        }
        return;
    }

    const mostrarEstado = (mensaje) => {
        if (estado) {
            estado.textContent = mensaje;
        }
    };

    function mostrarFormularioAcceso() {
        acceso.hidden = false;
        acceso.style.display = "grid";
        formulario.hidden = true;
        formulario.style.display = "none";
        mostrarEstado("Inicia sesión para subir un trabajo.");
        acceso.reset();
        formulario.reset();
    }

    function mostrarFormularioSubida() {
        acceso.hidden = true;
        acceso.style.display = "none";
        formulario.hidden = false;
        formulario.style.display = "grid";
        mostrarEstado("Sesión iniciada. Ya puedes subir un PDF.");
    }

    if (semana) {
        for (let numero = 1; numero <= 3; numero++) {
            semana.insertAdjacentHTML("beforeend", `<option value="${numero}">Unidad ${numero}</option>`);
        }
    }

    boton.addEventListener("click", async () => {
        const seleccionSemanas = document.getElementById("semana-proyecto");
        if (seleccionSemanas) {
            seleccionSemanas.value = String(semanaSeleccionadaActual || 3);
        }

        modal.classList.add("activo");
        mostrarFormularioAcceso();
    });

    cerrar.addEventListener("click", () => {
        modal.classList.remove("activo");
        mostrarFormularioAcceso();
    });

    if (cerrarSesion) {
        cerrarSesion.addEventListener("click", async () => {
            const { error } = await supabaseClient.auth.signOut();
            if (error) {
                console.error("Error al cerrar sesión:", error);
            }
            mostrarFormularioAcceso();
        });
    }

    acceso.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const correo = document.getElementById("correo-proyecto")?.value.trim();
        const contrasena = document.getElementById("contrasena-proyecto")?.value;

        if (!correo || !contrasena) {
            mostrarEstado("Debes ingresar tu correo y contraseña.");
            return;
        }

        const { data, error } = await supabaseClient.auth.signInWithPassword({ email: correo, password: contrasena });

        if (error) {
            console.error("Error al iniciar sesión:", error);
            mostrarEstado("Correo o contraseña incorrectos.");
            acceso.reset();
            return;
        }

        if (!data?.user) {
            mostrarEstado("No se pudo iniciar sesión. Inténtalo de nuevo.");
            return;
        }

        mostrarFormularioSubida();
        acceso.reset();
    });

    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const { data: usuarioData, error: errorUsuario } = await supabaseClient.auth.getUser();
        const usuario = usuarioData?.user;

        if (errorUsuario || !usuario) {
            console.error("Error al validar sesión:", errorUsuario);
            mostrarFormularioAcceso();
            return;
        }

        const archivo = document.getElementById("archivo-proyecto")?.files?.[0];
        const nombre = document.getElementById("nombre-proyecto")?.value.trim();
        const descripcion = document.getElementById("descripcion-proyecto")?.value.trim();
        const numeroSemana = Number(semana?.value ?? semanaSeleccionadaActual ?? 3);

        if (!nombre) {
            mostrarEstado("Escribe un nombre para el trabajo.");
            return;
        }

        if (!archivo) {
            mostrarEstado("Selecciona un archivo PDF.");
            return;
        }

        const extensionPdf = archivo.name.toLowerCase().endsWith(".pdf");
        if (!extensionPdf && archivo.type !== "application/pdf") {
            mostrarEstado("El archivo debe ser un PDF válido.");
            return;
        }

        if (archivo.size > MAXIMO_PESO_PDF) {
            mostrarEstado("El PDF supera el tamaño máximo permitido (10 MB).");
            return;
        }

        mostrarEstado("Subiendo...");

        const ruta = `${usuario.id}/${Date.now()}-${archivo.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
        const { error: errorSubida } = await supabaseClient.storage.from("proyectos").upload(ruta, archivo, {
            contentType: "application/pdf",
            upsert: false
        });

        if (errorSubida) {
            console.error("Error al subir archivo:", errorSubida);
            mostrarEstado("No se pudo subir el PDF. Revisa la configuración del bucket.");
            return;
        }

        const { data: urlData } = supabaseClient.storage.from("proyectos").getPublicUrl(ruta);
        const url = urlData?.publicUrl;

        if (!url) {
            mostrarEstado("No se pudo generar la URL pública del archivo.");
            return;
        }

        const { error: errorRegistro } = await supabaseClient.from("trabajos").insert({
            nombre,
            descripcion: descripcion || "",
            semana: numeroSemana,
            archivo_url: url,
            creado_por: usuario.id
        });

        if (errorRegistro) {
            console.error("Error al guardar el trabajo:", errorRegistro);
            mostrarEstado("El PDF subió, pero no se pudo guardar el trabajo.");
            return;
        }

        mostrarEstado("Trabajo subido correctamente.");
        formulario.reset();
        if (semana) {
            semana.value = String(semanaSeleccionadaActual || 3);
        }
    });
}


function ocultarSeccion2Inicialmente() {
    const seccion2 = document.getElementById("seccion-2");
    if (!seccion2) return;
    seccion2.style.display = "none";
    seccion2.classList.remove("visible");
    seccion2.classList.add("seccion-2-bloqueada");
}


function prepararLetras(titulo) {
    if (!titulo) return;
    if (titulo.dataset.preparado === "true") return;
    titulo.dataset.preparado = "true";
    procesarContenido(titulo);
}


function procesarContenido(elemento) {
    const nodos = Array.from(elemento.childNodes);

    nodos.forEach((nodo) => {
        if (nodo.nodeType === Node.TEXT_NODE) {
            const texto = nodo.textContent;
            const fragmento = document.createDocumentFragment();
            const partes = texto.split(/(\s+)/);

            partes.forEach((parte) => {
                if (/^\s+$/.test(parte)) {
                    fragmento.appendChild(document.createTextNode(parte));
                    return;
                }

                const palabra = document.createElement("span");
                palabra.classList.add("palabra");

                for (let i = 0; i < parte.length; i++) {
                    const letra = document.createElement("span");
                    letra.classList.add("letra");
                    letra.textContent = parte[i];
                    palabra.appendChild(letra);
                }

                fragmento.appendChild(palabra);
            });

            nodo.replaceWith(fragmento);
        } else if (nodo.nodeType === Node.ELEMENT_NODE) {
            if (!nodo.classList.contains("letra")) {
                procesarContenido(nodo);
            }
        }
    });
}


function activarMovimientoTexto() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const elementos = document.querySelectorAll(".texto-interactivo");

    elementos.forEach((elemento) => {
        let cuadroPendiente = false;
        let ultimoEvento = null;

        elemento.addEventListener("mousemove", (evento) => {
            if (!heroVisible) return;
            ultimoEvento = evento;
            if (cuadroPendiente) return;
            cuadroPendiente = true;

            requestAnimationFrame(() => {
                cuadroPendiente = false;
                if (!ultimoEvento) return;

                const rect = elemento.getBoundingClientRect();
                const x = ultimoEvento.clientX - (rect.left + rect.width / 2);
                const y = ultimoEvento.clientY - (rect.top + rect.height / 2);

                const movimientoX = Math.max(-5, Math.min(5, x * 0.025));
                const movimientoY = Math.max(-3, Math.min(3, y * 0.025));

                elemento.style.transform = `translate3d(${movimientoX}px, ${movimientoY}px, 0)`;
            });
        });

        elemento.addEventListener("mouseleave", () => {
            elemento.style.transform = "translate3d(0, 0, 0)";
        });
    });
}



function activarMovimientoLetrasTitulo() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const titulo = document.getElementById("titulo-principal");
    if (!titulo) return;

    const letras = titulo.querySelectorAll(".letra");
    if (!letras.length) return;

    const radioEfecto = 90;
    const desplazamientoMaximo = 14;

    let cuadroPendiente = false;
    let ultimoEvento = null;

    document.addEventListener("mousemove", (evento) => {
        if (!heroVisible) return;
        if (document.documentElement.classList.contains("seccion-2-activa")) return;
        ultimoEvento = evento;
        if (cuadroPendiente) return;
        cuadroPendiente = true;

        requestAnimationFrame(() => {
            cuadroPendiente = false;
            if (!ultimoEvento) return;

            letras.forEach((letra) => {
                const rect = letra.getBoundingClientRect();
                const centroX = rect.left + rect.width / 2;
                const centroY = rect.top + rect.height / 2;

                const distanciaX = ultimoEvento.clientX - centroX;
                const distanciaY = ultimoEvento.clientY - centroY;
                const distancia = Math.sqrt(distanciaX * distanciaX + distanciaY * distanciaY);

                if (distancia < radioEfecto) {
                    const intensidad = (1 - distancia / radioEfecto) * desplazamientoMaximo;
                    letra.style.transform = `translateY(${-intensidad}px) scale(${1 + intensidad / desplazamientoMaximo * 0.15})`;
                } else {
                    letra.style.transform = "translateY(0) scale(1)";
                }
            });
        });
    });
}




function activarTarjetaColgante() {
    const pivote = document.querySelector(".pivote-logo");
    const contenedorLogo = document.querySelector(".contenedor-logo");

    if (!pivote || !contenedorLogo) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (contenedorLogo.parentElement) {
        contenedorLogo.parentElement.style.perspective = "1000px";
    }

    const anguloMaximo = 22;
    const distanciaMaxima = 420;
    const rigidez = 0.045;
    const amortiguacion = 0.90;

    let rotXObjetivo = 0;
    let rotYObjetivo = 0;
    let elevacionObjetivo = 0;

    let rotXActual = 0;
    let rotYActual = 0;
    let elevacionActual = 0;

    let velRotX = 0;
    let velRotY = 0;
    let velElevacion = 0;

    const tiempoInicio = performance.now();

    window.addEventListener("mousemove", (evento) => {
        if (!heroVisible) return;

        const rect = contenedorLogo.getBoundingClientRect();
        const puntoAnclajeX = rect.left + rect.width / 2;
        const puntoAnclajeY = rect.top + rect.height / 2;

        const distanciaX = evento.clientX - puntoAnclajeX;
        const distanciaY = evento.clientY - puntoAnclajeY;

        const distancia = Math.sqrt(distanciaX * distanciaX + distanciaY * distanciaY);
        const intensidad = Math.max(0, 1 - distancia / distanciaMaxima);

        let rotY = (distanciaX / distanciaMaxima) * anguloMaximo * intensidad;
        let rotX = -(distanciaY / distanciaMaxima) * (anguloMaximo * 0.7) * intensidad;
        let elevacion = -Math.abs(distanciaX) * 0.03 * intensidad;

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
        if (!heroVisible) {
            tiltLoopActivo = false;
            return;
        }

        const tiempo = (performance.now() - tiempoInicio) / 1000;

        const idleRotY = Math.sin(tiempo * 0.8) * 1.2;
        const idleRotX = Math.cos(tiempo * 1.2) * 0.8;
        const idleY = Math.sin(tiempo * 1.5) * 2;

        const fuerzaY = (rotYObjetivo + idleRotY - rotYActual) * rigidez;
        velRotY = (velRotY + fuerzaY) * amortiguacion;
        rotYActual += velRotY;

        const fuerzaX = (rotXObjetivo + idleRotX - rotXActual) * rigidez;
        velRotX = (velRotX + fuerzaX) * amortiguacion;
        rotXActual += velRotX;

        const fuerzaElevacion = (elevacionObjetivo + idleY - elevacionActual) * rigidez;
        velElevacion = (velElevacion + fuerzaElevacion) * amortiguacion;
        elevacionActual += velElevacion;

        pivote.style.transform = `
            translateY(${elevacionActual.toFixed(2)}px)
            rotateX(${rotXActual.toFixed(2)}deg)
            rotateY(${rotYActual.toFixed(2)}deg)
        `;

        requestAnimationFrame(actualizar);
    }

    window.__reanudarTiltLogo = function () {
        if (tiltLoopActivo) return;
        tiltLoopActivo = true;
        requestAnimationFrame(actualizar);
    };

    tiltLoopActivo = true;
    requestAnimationFrame(actualizar);
}


function activarPausaFueraDeVista() {
    const hero = document.getElementById("inicio");
    if (!hero) return;
    if (!("IntersectionObserver" in window)) return;

    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
            heroVisible = entrada.isIntersecting;
            hero.classList.toggle("seccion-inactiva", !heroVisible);

            if (heroVisible && typeof window.__reanudarTiltLogo === "function") {
                window.__reanudarTiltLogo();
            }
        });
    }, { threshold: 0 });

    observador.observe(hero);
}


function activarTransicionExplorar() {
    const botonExplorar = document.getElementById("boton-explorar");
    const overlay = document.getElementById("transicion-overlay");
    const seccion2 = document.getElementById("seccion-2");

    if (!botonExplorar || !seccion2) return;

    let activando = false;

    botonExplorar.addEventListener("click", (evento) => {
        evento.preventDefault();
        if (activando) return;
        activando = true;

        seccion2.classList.remove("seccion-2-bloqueada");
        seccion2.style.display = "flex";
        document.body.style.overflow = "hidden";

        requestAnimationFrame(() => {
            seccion2.classList.add("visible");
        });

        if (overlay) {
            overlay.classList.add("activo");
        }

        setTimeout(() => {
            seccion2.scrollIntoView({
                behavior: "auto",
                block: "start",
                inline: "start"
            });
            scrollContenidoAlTope("auto");
        }, 150);

        setTimeout(() => {
            if (overlay) {
                overlay.classList.remove("activo");
            }
            activando = false;

            // Como ya no se regresa a la Sección 1, la apagamos por completo:
            // sus animaciones (líneas de fondo, tilt del logo, etc.) dejan de
            // consumir CPU/GPU mientras el usuario está en la Sección 2.
            const hero = document.getElementById("inicio");
            if (hero) {
                hero.style.display = "none";
            }

            // NUEVO: fija la Sección 2 a la pantalla (el CSS lo usa)
            document.documentElement.classList.add("seccion-2-activa");
            // NUEVO: devuelve el scroll de la ventana al tope
            window.scrollTo(0, 0);
        }, 500);
    });

    if (window.location.hash === "#seccion-2") {
        botonExplorar.click();
    }
}


function activarMenuSeccion2() {
    const navItems = document.querySelectorAll(".nav-item");
    if (!navItems.length) return;

    navItems.forEach((item) => {
        item.addEventListener("click", (evento) => {
            evento.preventDefault();

            navItems.forEach((nav) => {
                nav.classList.remove("active");
            });

            item.classList.add("active");

            const nombreSeccion = item.querySelector("span")?.textContent.trim();

            if (nombreSeccion === "Inicio") {
                mostrarInicio();
            }
        });
    });
}


function inicializarIconosLucide() {
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }
}


function inicializarChatbotJhorlin() {
    if (window.chatbotJhorlinInicializado) return;
    window.chatbotJhorlinInicializado = true;

    const chatInput = document.getElementById("chatInput");
    const sendBtn = document.getElementById("sendBtn");
    const chatMessages = document.getElementById("chatMessages");

    const conocimientoJhorlin = {
        nombre: "Jhorlin Heiner Alfaro Peralta",
        carrera: "Ingeniería de Sistemas",
        universidad: "Universidad Nacional de San Martín (UNSM)",
        perfil:
            "Jhorlin Heiner Alfaro Peralta es estudiante de Ingeniería de Sistemas. " +
            "Este portafolio reúne parte de su progreso, actividades, proyectos y " +
            "conocimientos adquiridos durante su formación académica.",
        conocimientos: [
            "Java", "HTML", "CSS", "JavaScript", "programación",
            "desarrollo web", "matemáticas", "estructuras de datos",
            "grafos", "algoritmos"
        ],
        proyectos: [
            "Proyectos académicos de programación",
            "Proyectos de desarrollo web",
            "Ejercicios de Java",
            "Proyectos relacionados con algoritmos y estructuras de datos"
        ],
        cursos: [
            "Programación", "Matemática", "Matemática Discreta",
            "Cálculo", "Economía", "Filosofía"
        ],
        logros: [
            "Desarrollo de proyectos académicos",
            "Creación y mejora de su portafolio web",
            "Aprendizaje de programación en Java",
            "Desarrollo de conocimientos en tecnologías web",
            "Avance en su formación como estudiante de Ingeniería de Sistemas"
        ],
        intereses: [
            "programación", "tecnología", "desarrollo web",
            "aprendizaje", "ingeniería de sistemas"
        ]
    };

    function agregarMensaje(texto, tipo) {
        if (!chatMessages) return;

        const mensaje = document.createElement("div");
        mensaje.classList.add("message", tipo === "usuario" ? "msg-sent" : "msg-received");
        mensaje.textContent = texto;

        chatMessages.appendChild(mensaje);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function normalizarTexto(texto) {
        return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    }

    function responderSobreJhorlin(texto) {
        const pregunta = normalizarTexto(texto);

        if (
            pregunta.includes("como te llamas") ||
            pregunta.includes("cual es tu nombre") ||
            pregunta.includes("quien es jhorlin") ||
            pregunta.includes("quien es jhorlin alfaro") ||
            pregunta.includes("nombre de jhorlin")
        ) {
            return `Jhorlin se llama ${conocimientoJhorlin.nombre}. 👋`;
        }

        if (
            pregunta.includes("quien eres") ||
            pregunta.includes("quien es el") ||
            pregunta.includes("hablame de jhorlin") ||
            pregunta.includes("sobre jhorlin") ||
            pregunta.includes("cuentame sobre jhorlin")
        ) {
            return conocimientoJhorlin.perfil;
        }

        if (
            pregunta.includes("que estudia") ||
            pregunta.includes("que carrera") ||
            pregunta.includes("carrera de jhorlin") ||
            pregunta.includes("que estudias")
        ) {
            return `Jhorlin estudia ${conocimientoJhorlin.carrera}. 🎓`;
        }

        if (
            pregunta.includes("donde estudia") ||
            pregunta.includes("universidad") ||
            pregunta.includes("donde estudias")
        ) {
            return `Jhorlin estudia en la ${conocimientoJhorlin.universidad}. 🏫`;
        }

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
                conocimientoJhorlin.conocimientos.join(", ") + ". 💻"
            );
        }

        if (pregunta.includes("java") || pregunta.includes("programacion")) {
            return (
                "Java es uno de los lenguajes que Jhorlin ha trabajado durante " +
                "su formación. Ha desarrollado ejercicios relacionados con clases, " +
                "métodos, arreglos, recursividad, ordenamiento, algoritmos y estructuras " +
                "de datos. ☕"
            );
        }

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

        if (
            pregunta.includes("cursos") ||
            pregunta.includes("que cursos") ||
            pregunta.includes("materias") ||
            pregunta.includes("que materias")
        ) {
            return (
                "Durante su formación, Jhorlin ha trabajado temas relacionados con: " +
                conocimientoJhorlin.cursos.join(", ") + ". 📚"
            );
        }

        if (
            pregunta.includes("logros") ||
            pregunta.includes("que logros") ||
            pregunta.includes("logro") ||
            pregunta.includes("que ha logrado")
        ) {
            return (
                "Algunos de los logros registrados en este portafolio son: " +
                conocimientoJhorlin.logros.join("; ") + ". 🏆"
            );
        }

        if (
            pregunta.includes("intereses") ||
            pregunta.includes("que le gusta") ||
            pregunta.includes("que le interesa")
        ) {
            return (
                "Entre los principales intereses relacionados con el portafolio " +
                "de Jhorlin se encuentran la " +
                conocimientoJhorlin.intereses.join(", ") + ". ⚡"
            );
        }

        return null;
    }

    function razonamientoBasico(texto) {
        const pregunta = normalizarTexto(texto);

        let coincidencia = pregunta.match(/(\d+(?:\.\d+)?)\s*\+\s*(\d+(?:\.\d+)?)/);
        if (coincidencia) {
            const a = Number(coincidencia[1]);
            const b = Number(coincidencia[2]);
            return `El resultado es ${a + b}. 🧠`;
        }

        coincidencia = pregunta.match(/(\d+)\s*(?:cajas|grupos|paquetes)\s*(?:con|de)\s*(\d+)/);
        if (coincidencia) {
            const cantidad = Number(coincidencia[1]);
            const elementos = Number(coincidencia[2]);
            return (
                `Si tienes ${cantidad} grupos con ${elementos} elementos ` +
                `cada uno, entonces tienes ${cantidad * elementos} en total. 🧠`
            );
        }

        coincidencia = pregunta.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
        if (coincidencia) {
            const numeros = [
                Number(coincidencia[1]), Number(coincidencia[2]),
                Number(coincidencia[3]), Number(coincidencia[4])
            ];

            const diferencia = numeros[1] - numeros[0];

            if (numeros[2] - numeros[1] === diferencia && numeros[3] - numeros[2] === diferencia) {
                const siguiente = numeros[3] + diferencia;
                return (
                    `La secuencia aumenta de ${diferencia} en ${diferencia}. ` +
                    `Por lo tanto, el siguiente número sería ${siguiente}. 🔢`
                );
            }
        }

        if (pregunta.includes("si llueve") && pregunta.includes("paraguas")) {
            return (
                "Si la condición es que cuando llueve se utiliza un paraguas, " +
                "entonces si está lloviendo, la conclusión lógica es llevar paraguas. ☔"
            );
        }

        if (pregunta.includes("todos los programadores") && pregunta.includes("juan es programador")) {
            return (
                "Si asumimos que todos los programadores cumplen la característica " +
                "mencionada y Juan es programador, entonces Juan también cumple " +
                "esa característica. Esa es una conclusión lógica basada en la premisa. 🧠"
            );
        }

        return null;
    }

    function resolverOperacion(texto) {
        let expresion = normalizarTexto(texto);

        expresion = expresion
            .replace(/cuanto es/g, "")
            .replace(/cuanto da/g, "")
            .replace(/calcula/g, "")
            .replace(/resuelve/g, "")
            .replace(/resultado de/g, "")
            .trim();

        if (!/^[0-9+\-*/().\s]+$/.test(expresion) || !/[+\-*/]/.test(expresion)) {
            return null;
        }

        try {
            const tokens = expresion.match(/\d+(?:\.\d+)?|[()+\-*/]/g);
            if (!tokens) return null;

            let posicion = 0;

            function factor() {
                if (tokens[posicion] === "(") {
                    posicion++;
                    const resultado = expresionMatematica();
                    if (tokens[posicion] !== ")") { throw new Error(); }
                    posicion++;
                    return resultado;
                }

                if (tokens[posicion] === "-") {
                    posicion++;
                    return -factor();
                }

                const numero = Number(tokens[posicion]);
                if (!Number.isFinite(numero)) { throw new Error(); }
                posicion++;
                return numero;
            }

            function termino() {
                let resultado = factor();

                while (tokens[posicion] === "*" || tokens[posicion] === "/") {
                    const operador = tokens[posicion++];
                    const siguiente = factor();

                    if (operador === "/" && siguiente === 0) { throw new Error(); }

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

                while (tokens[posicion] === "+" || tokens[posicion] === "-") {
                    const operador = tokens[posicion++];
                    const siguiente = termino();

                    if (operador === "+") {
                        resultado += siguiente;
                    } else {
                        resultado -= siguiente;
                    }
                }

                return resultado;
            }

            const resultado = expresionMatematica();

            if (posicion !== tokens.length) { return null; }
            if (!Number.isFinite(resultado)) { return null; }

            return `El resultado es ${resultado}. 🧮`;
        } catch (error) {
            return null;
        }
    }

    function obtenerRespuesta(texto) {
        const pregunta = normalizarTexto(texto);

        if (pregunta === "hola" || pregunta.includes("hola ")) {
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

        const respuestaJhorlin = responderSobreJhorlin(texto);
        if (respuestaJhorlin) { return respuestaJhorlin; }

        const operacion = resolverOperacion(texto);
        if (operacion) { return operacion; }

        const razonamiento = razonamientoBasico(texto);
        if (razonamiento) { return razonamiento; }

        if (pregunta.includes("gracias") || pregunta.includes("muchas gracias")) {
            return (
                "¡De nada! 😄 Estoy aquí para ayudarte a conocer mejor " +
                "el trabajo y la trayectoria de Jhorlin."
            );
        }

        if (pregunta.includes("adios") || pregunta.includes("hasta luego")) {
            return "¡Hasta luego! 👋 Gracias por visitar el portafolio de Jhorlin.";
        }

        return (
            "Esa información todavía no está registrada en mi base de conocimiento. 🤔 " +
            "Mi función es aprender progresivamente a partir de la información " +
            "que Jhorlin incorpora en su portafolio. Puedes preguntarme sobre su " +
            "perfil, proyectos, cursos, conocimientos o logros."
        );
    }

    function sendMessage() {
        if (!chatInput || !chatMessages) return;

        const texto = chatInput.value.trim();
        if (!texto) return;

        agregarMensaje(texto, "usuario");
        chatInput.value = "";

        const pensando = document.createElement("div");
        pensando.classList.add("message", "msg-received");
        pensando.textContent = "Estoy pensando... 🤖";

        chatMessages.appendChild(pensando);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        setTimeout(() => {
            pensando.remove();
            const respuesta = obtenerRespuesta(texto);
            agregarMensaje(respuesta, "bot");
        }, 700);
    }

    if (sendBtn) {
        sendBtn.addEventListener("click", sendMessage);
    }

    if (chatInput) {
        chatInput.addEventListener("keypress", (evento) => {
            if (evento.key === "Enter") {
                evento.preventDefault();
                sendMessage();
            }
        });
    }
}


function activarParallaxCardHero() {
    const heroCard = document.querySelector(".card-hero");
    const pulsingCircle = document.querySelector(".pulsing-circle");

    if (!heroCard || !pulsingCircle) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cuadroPendiente = false;
    let ultimoEvento = null;

    heroCard.addEventListener("mousemove", (e) => {
        ultimoEvento = e;
        if (cuadroPendiente) return;
        cuadroPendiente = true;

        requestAnimationFrame(() => {
            cuadroPendiente = false;
            if (!ultimoEvento) return;

            const rect = heroCard.getBoundingClientRect();
            const x = ultimoEvento.clientX - rect.left - rect.width / 2;
            const y = ultimoEvento.clientY - rect.top - rect.height / 2;

            pulsingCircle.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) scale(1.15)`;
        });
    });

    heroCard.addEventListener("mouseleave", () => {
        pulsingCircle.style.transform = "translate(0px, 0px) scale(1)";
    });
}


function configurarScrollSeccion2() {
    const seccion2 = document.getElementById("seccion-2");
    const contenidoPrincipal = document.querySelector("#seccion-2 .main-content");

    if (!seccion2 || !contenidoPrincipal) return;

    let recalculoPendiente = false;

    function ajustarAlturaReal() {
        if (recalculoPendiente) return;
        recalculoPendiente = true;

        requestAnimationFrame(() => {
            const alturaReal = window.innerHeight * 0.01;
            document.documentElement.style.setProperty("--vh", `${alturaReal}px`);
            recalculoPendiente = false;
        });
    }

    ajustarAlturaReal();

    window.addEventListener("resize", ajustarAlturaReal);
    window.addEventListener("orientationchange", ajustarAlturaReal);

    contenidoPrincipal.addEventListener("wheel", (evento) => {
        const enElTope = contenidoPrincipal.scrollTop <= 0;
        const enElFondo =
            contenidoPrincipal.scrollTop + contenidoPrincipal.clientHeight >=
            contenidoPrincipal.scrollHeight - 1;

        if ((enElTope && evento.deltaY < 0) || (enElFondo && evento.deltaY > 0)) {
            evento.preventDefault();
        }
    }, { passive: false });
}


/* =====================================================
   SCROLL SEGURO DENTRO DEL PANEL (SECCIÓN 2)
===================================================== */

function scrollContenidoAlTope(comportamiento = "smooth") {
    const contenidoPrincipal = document.querySelector("#seccion-2 .main-content");
    if (!contenidoPrincipal) return;

    contenidoPrincipal.scrollTo({
        top: 0,
        left: 0,
        behavior: comportamiento
    });
}


function mostrarProyectos() {
    const proyectos = document.getElementById("proyectos");
    const dashboard = document.querySelector(".dashboard-grid");
    const dashboardHeader = document.querySelector(".dashboard-header");

    if (!proyectos) { return; }

    proyectos.style.display = "block";

    if (dashboard) { dashboard.style.display = "none"; }
    if (dashboardHeader) { dashboardHeader.style.display = "none"; }
}


function mostrarInicio() {
    const proyectos = document.getElementById("proyectos");
    const dashboard = document.querySelector(".dashboard-grid");
    const dashboardHeader = document.querySelector(".dashboard-header");

    if (proyectos) { proyectos.style.display = "none"; }
    if (dashboard) { dashboard.style.display = "grid"; }
    if (dashboardHeader) { dashboardHeader.style.display = "flex"; }
}


function activarBotonProyectos() {
    const enlaceProyectos = document.getElementById("enlace-proyectos");
    if (!enlaceProyectos) { return; }

    enlaceProyectos.addEventListener("click", function (evento) {
        evento.preventDefault();
        mostrarProyectos();
    });
}


function activarRayosFisi() {
    const heroCard = document.querySelector("#seccion-2 .card-hero");
    const canvas = heroCard?.querySelector(".lightning-canvas");
    const context = canvas?.getContext("2d");

    if (!heroCard || !canvas || !context) return;

    const movimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)");
    const objetivo = { x: 0, y: 0 };
    const duracionExplosion = 520;
    let anchoCanvas = 0;
    let altoCanvas = 0;
    let frameId = 0;
    let ultimoDibujo = 0;
    let mouseDentro = false;
    let explosionInicio = 0;
    let explosionFin = 0;

    function ajustarCanvas() {
        const rectangulo = heroCard.getBoundingClientRect();
        const escala = Math.min(window.devicePixelRatio || 1, 2);

        anchoCanvas = rectangulo.width;
        altoCanvas = rectangulo.height;
        canvas.width = Math.round(anchoCanvas * escala);
        canvas.height = Math.round(altoCanvas * escala);
        context.setTransform(escala, 0, 0, escala, 0, 0);
    }

    function actualizarObjetivo(evento) {
        const rectangulo = canvas.getBoundingClientRect();
        objetivo.x = evento.clientX - rectangulo.left;
        objetivo.y = evento.clientY - rectangulo.top;
    }

    function dibujarRayo(inicioX, inicioY, finX, finY, desplazamiento, profundidad = 0, permitirRama = true) {
        if (desplazamiento < 2 || profundidad >= 7) {
            context.beginPath();
            context.moveTo(inicioX, inicioY);
            context.lineTo(finX, finY);
            context.stroke();
            return;
        }

        const medioX = (inicioX + finX) / 2 + (Math.random() - 0.5) * desplazamiento;
        const medioY = (inicioY + finY) / 2 + (Math.random() - 0.5) * desplazamiento;

        dibujarRayo(inicioX, inicioY, medioX, medioY, desplazamiento / 2, profundidad + 1, permitirRama);
        dibujarRayo(medioX, medioY, finX, finY, desplazamiento / 2, profundidad + 1, permitirRama);

        if (permitirRama && profundidad === 2 && Math.random() < 0.38) {
            const ramaX = medioX + (Math.random() - 0.5) * desplazamiento * 2;
            const ramaY = medioY + (Math.random() - 0.5) * desplazamiento * 2;
            dibujarRayo(medioX, medioY, ramaX, ramaY, desplazamiento * 0.45, profundidad + 1, false);
        }
    }

    function dibujarExplosion(tiempo) {
        const progreso = Math.min(1, (tiempo - explosionInicio) / duracionExplosion);
        const expansion = 1 - Math.pow(1 - progreso, 2);
        const intensidad = 1 - progreso;
        const centroX = anchoCanvas / 2;
        const centroY = altoCanvas / 2;
        const radio = 14 + Math.hypot(anchoCanvas, altoCanvas) * 0.62 * expansion;

        context.save();
        context.globalAlpha = intensidad;
        context.shadowBlur = 18;
        context.shadowColor = "#48cae4";

        for (let rayo = 0; rayo < 12; rayo++) {
            const angulo = (Math.PI * 2 * rayo) / 12;
            const finX = centroX + Math.cos(angulo) * radio;
            const finY = centroY + Math.sin(angulo) * radio;

            context.strokeStyle = rayo % 3 === 0
                ? "rgba(185, 142, 255, 0.92)"
                : "rgba(125, 228, 255, 0.95)";
            context.lineWidth = rayo % 3 === 0 ? 1.1 : 1.5;
            dibujarRayo(centroX, centroY, finX, finY, 24 * (1 - progreso * 0.45));
        }

        context.beginPath();
        context.arc(centroX, centroY, 18 + 30 * expansion, 0, Math.PI * 2);
        context.strokeStyle = "rgba(220, 249, 255, 0.8)";
        context.lineWidth = 1.2;
        context.stroke();
        context.restore();
    }

    function animar(tiempo) {
        frameId = 0;
        if (!mouseDentro && tiempo >= explosionFin) {
            limpiarCanvas();
            return;
        }

        frameId = requestAnimationFrame(animar);
        if (tiempo - ultimoDibujo < 1000 / 30) return;
        ultimoDibujo = tiempo;

        context.clearRect(0, 0, anchoCanvas, altoCanvas);
        context.save();
        context.globalCompositeOperation = "lighter";
        context.shadowColor = "#48cae4";

        if (mouseDentro) {
            for (let rama = 0; rama < 3; rama++) {
                const separacion = (rama - 1) * 4;
                context.strokeStyle = rama === 1
                    ? "rgba(150, 238, 255, 0.95)"
                    : "rgba(76, 201, 240, 0.62)";
                context.lineWidth = rama === 1 ? 1.5 : 0.85;
                context.shadowBlur = rama === 1 ? 14 : 9;
                dibujarRayo(
                    anchoCanvas / 2,
                    altoCanvas / 2,
                    objetivo.x + separacion,
                    objetivo.y - separacion,
                    28
                );
            }
        }

        if (tiempo < explosionFin) dibujarExplosion(tiempo);
        context.restore();
    }

    function iniciar(evento) {
        if (movimientoReducido.matches) return;

        ajustarCanvas();
        actualizarObjetivo(evento);
        mouseDentro = true;
        heroCard.classList.add("rayos-activos");
        solicitarAnimacion();
    }

    function solicitarAnimacion() {
        if (frameId) return;
        ultimoDibujo = 0;
        frameId = requestAnimationFrame(animar);
    }

    function limpiarCanvas() {
        if (mouseDentro || performance.now() < explosionFin) return;

        heroCard.classList.remove("rayos-activos");
        context.clearRect(0, 0, anchoCanvas, altoCanvas);
    }

    function salir() {
        mouseDentro = false;
        if (performance.now() >= explosionFin) limpiarCanvas();
    }

    function explotar(evento) {
        if (movimientoReducido.matches) return;

        ajustarCanvas();
        actualizarObjetivo(evento);
        explosionInicio = performance.now();
        explosionFin = explosionInicio + duracionExplosion;
        heroCard.classList.add("rayos-activos");
        solicitarAnimacion();
    }

    heroCard.addEventListener("mouseenter", iniciar);
    heroCard.addEventListener("mousemove", actualizarObjetivo);
    heroCard.addEventListener("mouseleave", salir);
    heroCard.addEventListener("click", explotar);

    if ("ResizeObserver" in window) {
        new ResizeObserver(ajustarCanvas).observe(heroCard);
    } else {
        window.addEventListener("resize", ajustarCanvas);
        ajustarCanvas();
    }
}


function inicializarSistemaSemanas() {
    const contenedorSemanas = document.getElementById("contenedor-semanas");
    const botonMostrarMas = document.getElementById("mostrar-mas-semanas");
    const botonMostrarMenos = document.getElementById("mostrar-menos-semanas");
    const listaSemanas = document.getElementById("lista-semanas");
    const vistaSemana = document.getElementById("vista-semana");
    const trabajosSemana = document.getElementById("trabajos-semana");
    const tituloSemana = document.getElementById("titulo-semana");
    const descripcionSemana = document.getElementById("descripcion-semana");
    const botonRegresar = document.getElementById("regresar-semanas");

    if (
        !contenedorSemanas || !botonMostrarMas || !listaSemanas ||
        !vistaSemana || !trabajosSemana || !tituloSemana ||
        !descripcionSemana || !botonRegresar
    ) return;

    const semanaInicial = 1;
    const semanaFinal = 3;
    const semanasPorPagina = 3;
    const vistaEscritorio = window.matchMedia("(min-width: 901px)");
    let semanasMostradas = vistaEscritorio.matches ? semanaFinal : semanaInicial;

    const trabajos = {
        1: [
            {
                nombre: "TRABAJO SOBRE LA PERCEPCION: Trabajo Individual 01 — TGS 2026-II",
                descripcion: "Trabajo realizado durante la semana 3.",
                tipo: "PDF",
                archivo: "archivos/proyectos/Trabajo Individual 01 — TGS 2026-II.pdf"
            },
            {
                nombre: "SUBSISTEMAS: Trabajo Individual 02 — TGS 2026-II",
                descripcion: "Trabajo realizado durante la semana 3.",
                tipo: "PDF",
                archivo: "archivos/proyectos/Trabajo Individual 02 — TGS 2026-II.pdf"
            }
        ],
        2: [],
        3: []
    };

    const cacheSupabasePorSemana = {};

    function crearSemana(numeroSemana) {
        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta-semana tarjeta-semana-entrada";
        tarjeta.dataset.semana = numeroSemana;

        tarjeta.innerHTML = `
    <div class="semana-numero">
        <img src="archivos/galeria/1234unsm.png" alt="Unidad ${numeroSemana}">
    </div>
    <div class="semana-info">
        <h3>Unidad ${numeroSemana}</h3>
        <p>Ver todos los trabajos de esta unidad.</p>
    </div>
    <div class="semana-flecha">
        <i data-lucide="chevron-right"></i>
    </div>
`;

        tarjeta.addEventListener("click", () => {
            abrirSemana(numeroSemana);
        });

        contenedorSemanas.appendChild(tarjeta);
        inicializarIconosLucide();
    }

    function actualizarBotones() {
        botonMostrarMas.style.display =
            semanasMostradas >= semanaFinal ? "none" : "inline-flex";

        if (botonMostrarMenos) {
            botonMostrarMenos.style.display =
                semanasMostradas > semanaInicial ? "inline-flex" : "none";
        }
    }

    function cargarSemanasIniciales() {
        contenedorSemanas.innerHTML = "";

        for (let i = semanaInicial; i <= semanasMostradas; i++) {
            crearSemana(i);
        }

        actualizarBotones();
    }

    botonMostrarMas.addEventListener("click", () => {
        const siguienteLimite = Math.min(semanasMostradas + semanasPorPagina, semanaFinal);

        for (let i = semanasMostradas + 1; i <= siguienteLimite; i++) {
            crearSemana(i);
        }

        semanasMostradas = siguienteLimite;
        actualizarBotones();
    });

    if (botonMostrarMenos) {
        botonMostrarMenos.addEventListener("click", () => {
            const nuevoLimite = Math.max(semanasMostradas - semanasPorPagina, semanaInicial);

            const tarjetas = Array.from(
                contenedorSemanas.querySelectorAll(".tarjeta-semana")
            );

            const tarjetasAQuitar = tarjetas.filter((tarjeta) => {
                return Number(tarjeta.dataset.semana) > nuevoLimite;
            });

            tarjetasAQuitar.forEach((tarjeta) => {
                tarjeta.classList.add("tarjeta-semana-salida");
            });

            setTimeout(() => {
                tarjetasAQuitar.forEach((tarjeta) => {
                    tarjeta.remove();
                });
            }, 260);

            semanasMostradas = nuevoLimite;
            actualizarBotones();

            scrollContenidoAlTope();
        });
    }


    async function abrirSemana(numeroSemana) {

        semanaSeleccionadaActual = numeroSemana;

        const trabajosLocales = trabajos[numeroSemana] || [];

        tituloSemana.textContent = `Unidad ${numeroSemana}`;

        descripcionSemana.textContent =
            `Trabajos realizados durante la unidad ${numeroSemana}.`;

        listaSemanas.style.display = "none";

        vistaSemana.classList.remove("vista-semana-oculta");
        vistaSemana.classList.add("vista-semana-activa");

        scrollContenidoAlTope();

        const yaEnCache = cacheSupabasePorSemana[numeroSemana];

        if (yaEnCache) {
            renderizarListaTrabajos([...trabajosLocales, ...yaEnCache]);
            return;
        }

        trabajosSemana.innerHTML = `
            <div class="proyecto-card trabajo-semana-entrada">
                <div class="proyecto-icono">
                    <i data-lucide="loader-circle"></i>
                </div>
                <div class="proyecto-info">
                    <h3>Cargando trabajos...</h3>
                    <p>Estamos consultando los trabajos de esta unidad.</p>
                </div>
            </div>
        `;

        inicializarIconosLucide();

        let trabajosSubidos = [];

        try {
            const { data, error } = await supabaseClient
                .from("trabajos")
                .select("nombre, descripcion, archivo_url")
                .eq("semana", numeroSemana)
                .order("id", { ascending: true });

            if (error) {
                console.error("Error al leer trabajos:", error);
            } else if (data) {
                trabajosSubidos = data.map((t) => ({
                    nombre: t.nombre,
                    descripcion: t.descripcion || `Trabajo realizado durante la semana ${numeroSemana}.`,
                    tipo: "PDF",
                    archivo: t.archivo_url
                }));

                cacheSupabasePorSemana[numeroSemana] = trabajosSubidos;
            }
        } catch (error) {
            console.error("No se pudo consultar Supabase:", error);
        }

        if (semanaSeleccionadaActual !== numeroSemana) return;

        renderizarListaTrabajos([...trabajosLocales, ...trabajosSubidos]);
    }


    function renderizarListaTrabajos(listaTrabajos) {

        trabajosSemana.innerHTML = "";

        if (listaTrabajos.length === 0) {

            const sinTrabajos = document.createElement("div");

            sinTrabajos.className =
                "proyecto-card trabajo-semana-entrada";

            sinTrabajos.innerHTML = `
                <div class="proyecto-icono">
                    <i data-lucide="folder-open"></i>
                </div>

                <div class="proyecto-info">
                    <h3>Sin trabajos agregados</h3>

                    <p>
                        Todavía no has agregado trabajos para esta unidad.
                    </p>
                </div>
            `;

            trabajosSemana.appendChild(sinTrabajos);
        }


        listaTrabajos.forEach((trabajo) => {

            const tarjetaTrabajo =
                document.createElement("div");

            tarjetaTrabajo.className =
                "proyecto-card trabajo-semana-entrada";


            const rutaArchivo = typeof trabajo.archivo === "string"
                ? trabajo.archivo.trim()
                : "";
            const nombreArchivo = rutaArchivo
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "") || "sin-archivo";
            const identificadorTrabajo =
                `semana-${semanaSeleccionadaActual}-${nombreArchivo}`;
            const tipoTrabajo = String(trabajo.tipo ?? "PDF");

            let urlArchivo = null;
            try {
                const url = new URL(rutaArchivo, document.baseURI);
                if (["http:", "https:", "file:"].includes(url.protocol)) {
                    urlArchivo = url.href;
                }
            } catch (error) {
                console.warn("URL de trabajo no válida:", error);
            }

            const iconoTrabajo = document.createElement("div");
            iconoTrabajo.className = "proyecto-icono";

            const imagenEscudo = document.createElement("img");
            imagenEscudo.src = "archivos/galeria/1234unsm.png";
            imagenEscudo.alt = "";
            imagenEscudo.setAttribute("aria-hidden", "true");
            iconoTrabajo.appendChild(imagenEscudo);

            const informacionTrabajo = document.createElement("div");
            informacionTrabajo.className = "proyecto-info";

            const tituloTrabajo = document.createElement("h3");
            tituloTrabajo.textContent = String(trabajo.nombre ?? "Trabajo sin título");

            const descripcionTrabajo = document.createElement("p");
            descripcionTrabajo.textContent = String(trabajo.descripcion ?? "");

            const etiquetaTipo = document.createElement("span");
            etiquetaTipo.className = "proyecto-tipo";
            etiquetaTipo.textContent = tipoTrabajo;
            informacionTrabajo.append(tituloTrabajo, descripcionTrabajo, etiquetaTipo);

            const accionesTrabajo = document.createElement("div");
            accionesTrabajo.className = "proyecto-acciones";

            const enlaceDocumento = document.createElement(urlArchivo ? "a" : "span");
            enlaceDocumento.className = "proyecto-boton boton-ver-documento";
            if (urlArchivo) {
                enlaceDocumento.href = urlArchivo;
                enlaceDocumento.target = "_blank";
                enlaceDocumento.rel = "noopener";
            } else {
                enlaceDocumento.setAttribute("aria-disabled", "true");
            }

            const iconoDocumento = document.createElement("i");
            iconoDocumento.setAttribute("data-lucide", "eye");
            enlaceDocumento.append(iconoDocumento, document.createTextNode(` Ver ${tipoTrabajo}`));

            const botonComentarNuevo = document.createElement("button");
            botonComentarNuevo.type = "button";
            botonComentarNuevo.className = "proyecto-boton boton-comentar";
            const iconoComentario = document.createElement("i");
            iconoComentario.setAttribute("data-lucide", "message-circle");
            botonComentarNuevo.append(iconoComentario, document.createTextNode(" Comentar"));
            accionesTrabajo.append(enlaceDocumento, botonComentarNuevo);

            const comentariosTrabajoNuevo = document.createElement("div");
            comentariosTrabajoNuevo.className = "comentarios-trabajo";
            comentariosTrabajoNuevo.style.display = "none";

            const tituloComentarios = document.createElement("h4");
            const iconoComentarios = document.createElement("i");
            iconoComentarios.setAttribute("data-lucide", "messages-square");
            iconoComentarios.setAttribute("aria-hidden", "true");
            tituloComentarios.append(iconoComentarios, document.createTextNode(" Comentarios de este trabajo"));

            const formularioNuevoComentario = document.createElement("form");
            formularioNuevoComentario.className = "formulario-comentario";

            const etiquetaNombre = document.createElement("label");
            etiquetaNombre.className = "campo-comentario";
            etiquetaNombre.appendChild(document.createTextNode("Nombre"));
            const inputNombre = document.createElement("input");
            inputNombre.type = "text";
            inputNombre.className = "comentario-nombre";
            inputNombre.placeholder = "Tu nombre";
            inputNombre.maxLength = 60;
            inputNombre.autocomplete = "name";
            inputNombre.required = true;
            etiquetaNombre.appendChild(inputNombre);

            const etiquetaComentario = document.createElement("label");
            etiquetaComentario.className = "campo-comentario";
            etiquetaComentario.appendChild(document.createTextNode("Comentario"));
            const textareaComentario = document.createElement("textarea");
            textareaComentario.className = "comentario-texto";
            textareaComentario.placeholder = "Escribe tu comentario";
            textareaComentario.maxLength = 500;
            textareaComentario.rows = 3;
            textareaComentario.required = true;
            etiquetaComentario.appendChild(textareaComentario);

            const botonPublicarNuevo = document.createElement("button");
            botonPublicarNuevo.type = "submit";
            botonPublicarNuevo.className = "proyecto-boton comentario-publicar";
            const iconoPublicar = document.createElement("i");
            iconoPublicar.setAttribute("data-lucide", "send");
            botonPublicarNuevo.append(iconoPublicar, document.createTextNode(" Publicar comentario"));
            formularioNuevoComentario.append(etiquetaNombre, etiquetaComentario, botonPublicarNuevo);

            const listaComentariosDOM = document.createElement("div");
            listaComentariosDOM.className = "lista-comentarios";
            comentariosTrabajoNuevo.append(tituloComentarios, formularioNuevoComentario, listaComentariosDOM);

            tarjetaTrabajo.append(iconoTrabajo, informacionTrabajo, accionesTrabajo, comentariosTrabajoNuevo);


            trabajosSemana.appendChild(tarjetaTrabajo);


            const botonComentar =
                tarjetaTrabajo.querySelector(".boton-comentar");


            const comentariosTrabajo =
                tarjetaTrabajo.querySelector(".comentarios-trabajo");


            const formularioComentario =
                tarjetaTrabajo.querySelector(".formulario-comentario");
            const nombreComentario =
                tarjetaTrabajo.querySelector(".comentario-nombre");
            const textoComentario =
                tarjetaTrabajo.querySelector(".comentario-texto");
            const listaComentarios =
                tarjetaTrabajo.querySelector(".lista-comentarios");
            async function obtenerComentarios() {
                const respuesta = await fetch(
                    `${SUPABASE_URL}/rest/v1/comentarios?trabajo_id=eq.${encodeURIComponent(identificadorTrabajo)}&select=nombre,comentario,creado_en&order=creado_en.asc`,
                    {
                        headers: {
                            apikey: SUPABASE_ANON_KEY,
                            Authorization: `Bearer ${SUPABASE_ANON_KEY}`
                        }
                    }
                );

                if (!respuesta.ok) {
                    throw new Error("No se pudieron cargar los comentarios.");
                }

                return respuesta.json();
            }

            async function mostrarComentarios() {
                listaComentarios.innerHTML = "";

                let comentarios;

                try {
                    comentarios = await obtenerComentarios();
                } catch (error) {
                    listaComentarios.textContent = "No se pudieron cargar los comentarios.";
                    return;
                }

                comentarios.forEach((comentario) => {
                    const elemento = document.createElement("article");
                    elemento.className = "comentario-publicado";

                    const cabecera = document.createElement("div");
                    cabecera.className = "comentario-cabecera";

                    const nombre = document.createElement("strong");
                    nombre.textContent = comentario.nombre;

                    const fecha = document.createElement("time");
                    fecha.textContent = new Intl.DateTimeFormat("es", {
                        dateStyle: "medium",
                        timeStyle: "short"
                    }).format(new Date(comentario.creado_en));

                    const texto = document.createElement("p");
                    texto.textContent = comentario.comentario;

                    cabecera.append(nombre, fecha);
                    elemento.append(cabecera, texto);
                    listaComentarios.appendChild(elemento);
                });
            }

            formularioComentario.addEventListener("submit", async (evento) => {
                evento.preventDefault();

                const nombre = nombreComentario.value.trim();
                const texto = textoComentario.value.trim();

                if (!nombre || !texto) return;

                const botonPublicar = formularioComentario.querySelector("button");
                botonPublicar.disabled = true;

                try {
                    const respuesta = await fetch(`${SUPABASE_URL}/rest/v1/comentarios`, {
                        method: "POST",
                        headers: {
                            apikey: SUPABASE_ANON_KEY,
                            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                            "Content-Type": "application/json",
                            Prefer: "return=minimal"
                        },
                        body: JSON.stringify({
                            trabajo_id: identificadorTrabajo,
                            nombre,
                            comentario: texto
                        })
                    });

                    if (!respuesta.ok) {
                        listaComentarios.textContent = "No se pudo publicar el comentario.";
                        return;
                    }

                    formularioComentario.reset();
                    await mostrarComentarios();
                } catch (error) {
                    listaComentarios.textContent = "No se pudo conectar con el servidor.";
                } finally {
                    botonPublicar.disabled = false;
                }
            });


            botonComentar.addEventListener("click", async () => {

                const comentariosOcultos =
                    comentariosTrabajo.style.display === "none";


                if (comentariosOcultos) {

                    comentariosTrabajo.style.display = "block";

                    await mostrarComentarios();


                    botonComentar.innerHTML = `
                        <i data-lucide="message-circle-off"></i>
                        Ocultar
                    `;
                    botonComentar.setAttribute("aria-label", "Ocultar comentarios");

                    inicializarIconosLucide();

                } else {

                    comentariosTrabajo.style.display = "none";


                    botonComentar.innerHTML = `
                        <i data-lucide="message-circle"></i>
                        Comentar
                    `;
                    botonComentar.setAttribute("aria-label", "Comentar");


                    inicializarIconosLucide();

                }

            });

        });


        inicializarIconosLucide();
    }


    botonRegresar.addEventListener("click", () => {
        vistaSemana.classList.remove("vista-semana-activa");
        vistaSemana.classList.add("vista-semana-oculta");

        listaSemanas.style.display = "block";

        scrollContenidoAlTope();
    });

    cargarSemanasIniciales();

    vistaEscritorio.addEventListener("change", (evento) => {
        const nuevoLimite = evento.matches ? semanaFinal : semanaInicial;

        if (nuevoLimite > semanasMostradas) {
            for (let i = semanasMostradas + 1; i <= nuevoLimite; i++) {
                crearSemana(i);
            }
        } else if (nuevoLimite < semanasMostradas) {
            contenedorSemanas.querySelectorAll(".tarjeta-semana").forEach((tarjeta) => {
                if (Number(tarjeta.dataset.semana) > nuevoLimite) tarjeta.remove();
            });
        }

        semanasMostradas = nuevoLimite;
        actualizarBotones();
    });
}