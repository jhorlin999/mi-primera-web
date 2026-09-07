/* =====================================================
   CUANDO CARGA LA PÁGINA
===================================================== */

document.addEventListener("DOMContentLoaded", () => {


    /* =================================================
       ELEMENTOS
    ================================================== */

    const intro =
        document.getElementById("intro");

    const contenido =
        document.querySelector(".contenido-hero");

    const logo =
        document.querySelector(".contenedor-logo");

    const titulo =
        document.getElementById("titulo-principal");



    /* =================================================
       INTRODUCCIÓN
    ================================================== */

    setTimeout(() => {

        if (intro) {

            intro.classList.add("ocultar");

        }

    }, 3500);



    /* =================================================
       APARECER CONTENIDO
    ================================================== */

    setTimeout(() => {

        if (contenido) {

            contenido.classList.add("mostrar");

        }

    }, 4000);



    /* =================================================
       APARECER LOGO
    ================================================== */

    setTimeout(() => {

        if (logo) {

            logo.classList.add("mostrar");

        }

    }, 4300);



    /* =================================================
       PREPARAR TÍTULO
    ================================================== */

    prepararLetras(titulo);



    /* =================================================
       ACTIVAR MOVIMIENTO
    ================================================== */

    activarMovimientoLetras(titulo);

    activarMovimientoTexto();



    /* =================================================
       BOTÓN
    ================================================== */

    const boton =
        document.querySelector(".boton");


    if (boton) {

        boton.addEventListener(
            "click",
            () => {

                console.log(
                    "Explorando el portafolio..."
                );

            }
        );

    }



    /* =================================================
       ANIMACIÓN SEGUNDA SECCIÓN
    ================================================== */

    const siguienteSeccion =
        document.querySelector(
            ".seccion-siguiente"
        );


    if (siguienteSeccion) {


        const observador =
            new IntersectionObserver(

                (entradas) => {


                    entradas.forEach(
                        (entrada) => {


                            if (
                                entrada.isIntersecting
                            ) {

                                entrada.target.style.opacity =
                                    "1";


                                entrada.target.style.transform =
                                    "translateY(0)";

                            }

                        }
                    );

                },

                {
                    threshold: 0.2
                }

            );


        observador.observe(
            siguienteSeccion
        );

    }

});



/* =====================================================
   PREPARAR LAS LETRAS DEL TÍTULO
===================================================== */

function prepararLetras(titulo) {


    if (!titulo) {

        return;

    }


    if (
        titulo.dataset.preparado === "true"
    ) {

        return;

    }


    titulo.dataset.preparado =
        "true";


    procesarContenido(titulo);

}



/* =====================================================
   PROCESAR CONTENIDO
===================================================== */

function procesarContenido(elemento) {


    const nodos =
        Array.from(
            elemento.childNodes
        );


    nodos.forEach(
        (nodo) => {


            /* =========================================
               TEXTO NORMAL
            ========================================== */

            if (
                nodo.nodeType === Node.TEXT_NODE
            ) {


                const texto =
                    nodo.textContent;


                const fragmento =
                    document.createDocumentFragment();


                /*
                 * SEPARAR POR PALABRAS.
                 *
                 * Esto es lo importante:
                 *
                 * APRENDER
                 *
                 * permanece unido.
                 */

                const partes =
                    texto.split(
                        /(\s+)/
                    );


                partes.forEach(
                    (parte) => {


                        /* --------------------------------
                           ESPACIOS
                        --------------------------------- */

                        if (
                            /^\s+$/.test(
                                parte
                            )
                        ) {


                            fragmento.appendChild(

                                document.createTextNode(
                                    parte
                                )

                            );


                            return;

                        }



                        /* --------------------------------
                           CREAR PALABRA
                        --------------------------------- */

                        const palabra =
                            document.createElement(
                                "span"
                            );


                        palabra.classList.add(
                            "palabra"
                        );



                        /* --------------------------------
                           CREAR LETRAS
                        --------------------------------- */

                        for (
                            let i = 0;
                            i < parte.length;
                            i++
                        ) {


                            const letra =
                                document.createElement(
                                    "span"
                                );


                            letra.classList.add(
                                "letra"
                            );


                            letra.textContent =
                                parte[i];


                            palabra.appendChild(
                                letra
                            );

                        }


                        fragmento.appendChild(
                            palabra
                        );

                    }
                );


                nodo.replaceWith(
                    fragmento
                );

            }



            /* =========================================
               ELEMENTOS HTML
            ========================================== */

            else if (
                nodo.nodeType ===
                Node.ELEMENT_NODE
            ) {


                if (
                    !nodo.classList.contains(
                        "letra"
                    )
                ) {


                    procesarContenido(
                        nodo
                    );

                }

            }

        }
    );

}



/* =====================================================
   MOVIMIENTO DE LAS LETRAS
===================================================== */

function activarMovimientoLetras(titulo) {


    if (!titulo) {

        return;

    }


    /*
     * No activamos este efecto
     * en dispositivos táctiles.
     */

    if (
        window.matchMedia(
            "(pointer: coarse)"
        ).matches
    ) {

        return;

    }


    const letras =
        titulo.querySelectorAll(
            ".letra"
        );


    if (!letras.length) {

        return;

    }



    /* =================================================
       CUANDO EL MOUSE PASA POR EL TÍTULO
    ================================================== */

    titulo.addEventListener(
        "mousemove",
        (evento) => {


            letras.forEach(
                (letra) => {


                    const rect =
                        letra.getBoundingClientRect();


                    const centroX =
                        rect.left +
                        rect.width / 2;


                    const centroY =
                        rect.top +
                        rect.height / 2;


                    const distanciaX =
                        evento.clientX -
                        centroX;


                    const distanciaY =
                        evento.clientY -
                        centroY;


                    const distancia =
                        Math.sqrt(

                            distanciaX *
                            distanciaX +

                            distanciaY *
                            distanciaY

                        );



                    /* =================================
                       RADIO DE MOVIMIENTO
                    ================================== */

                    const radio = 120;



                    /* =================================
                       LETRA CERCA DEL CURSOR
                    ================================== */

                    if (
                        distancia < radio
                    ) {


                        const intensidad =
                            1 -
                            (
                                distancia /
                                radio
                            );


                        let moverX =
                            -distanciaX *
                            intensidad *
                            0.10;


                        let moverY =
                            -distanciaY *
                            intensidad *
                            0.10;



                        /* --------------------------------
                           LÍMITE
                        --------------------------------- */

                        moverX =
                            Math.max(
                                -6,
                                Math.min(
                                    6,
                                    moverX
                                )
                            );


                        moverY =
                            Math.max(
                                -6,
                                Math.min(
                                    6,
                                    moverY
                                )
                            );



                        letra.style.transform =
                            `translate3d(${moverX}px, ${moverY}px, 0)`;


                        if (
                            intensidad > 0.65
                        ) {

                            letra.style.color =
                                "#00a84f";

                        }

                    }

                    else {


                        letra.style.transform =
                            "translate3d(0, 0, 0)";


                        letra.style.color =
                            "";

                    }

                }
            );

        }
    );



    /* =================================================
       CUANDO SALE DEL TÍTULO
    ================================================== */

    titulo.addEventListener(
        "mouseleave",
        () => {


            letras.forEach(
                (letra) => {


                    letra.style.transform =
                        "translate3d(0, 0, 0)";


                    letra.style.color =
                        "";

                }
            );

        }
    );

}



/* =====================================================
   MOVIMIENTO DE FRASES
===================================================== */

function activarMovimientoTexto() {


    const elementos =
        document.querySelectorAll(
            ".texto-interactivo"
        );


    elementos.forEach(
        (elemento) => {


            elemento.addEventListener(
                "mousemove",
                (evento) => {


                    const rect =
                        elemento.getBoundingClientRect();


                    const x =
                        evento.clientX -
                        (
                            rect.left +
                            rect.width / 2
                        );


                    const y =
                        evento.clientY -
                        (
                            rect.top +
                            rect.height / 2
                        );


                    const movimientoX =
                        Math.max(
                            -5,
                            Math.min(
                                5,
                                x * 0.025
                            )
                        );


                    const movimientoY =
                        Math.max(
                            -3,
                            Math.min(
                                3,
                                y * 0.025
                            )
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

        }
    );

}