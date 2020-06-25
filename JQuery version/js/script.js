"use strict";

// variables
let aImgs = [1,2,3,4,5,6]; // nombres de las imagenes
aImgs = aImgs.concat(aImgs); // duplicar
let firstPick; // primer elemento seleccionado
let intents; // numero de intentos
let aExcludedPairs; // sirven para excluir a los campos de las parejas correctas del seteo de eventos, su longitud sirve para saber si se ha ganado
let time; // new Date().getTime() al iniciar, tiempo total en ms al finalizar

// main
$(() => {
    // crear contenido del html (titulo, tabla, boton)
    createContent();

    //listeners
    $("#btn").on("click", function(){
        // resets
        intents = 0;
        firstPick = null;
        aExcludedPairs = [];
        // /resets
        shuffleImgs(); // baraja las imagenes
        prepareTable(); // prepara los elementos visuales y de funcionalidad
        time = new Date().getTime(); // tiempo en el que inicia la partida
    });
});


// funciones
/**
 * Ordena el array aImgs de forma aleatoria
 */
function shuffleImgs(){
    aImgs.sort(()=>{
        return 0.5-Math.random();
    });
}

/**
 * Prepara los tr y td de la tabla para empezar la partida,
 * añadiendoles estilos y eventos
 */
function prepareTable(){
    $("td").css("boxShadow", "inset 0px 0px 20px rgba(96, 96, 96, 0.6)");
    $("tr").css({
        boxShadow: "inset 0px 0px 70px rgba(96, 96, 96, 0.6)",
        backgroundColor: "black"
    });

    for(let i = 0; i<16; i++){
        $(`#${i}`).css("backgroundImage", "url(imgs/0.png)");
    }

    setEvents();
}

/**
 * setea eventos a todos los elementos td que no estén excluidos 
 * (hayan sido encontrados correctamente)
 */
function setEvents(){
    $("td").filter(`:not(${aExcludedPairs})`).on("click", checkPair);
}

/**
 * Elimina todos los eventos del tablero
 */
function removeEvents(){
    $("td").off("click");
}

/**
 * Elimina el evento del primer elemento clicado, 
 * para que el mismo no pueda ser clicado como segunda opcion
 */
function removeFirstPickEvent(){
    $(firstPick).off("click");
}

/**
 * Animacion para los elementos seleccionados
 * se usa de entrada y de salida.
 * Su procedimiento es:
 *  - se esconde con opacidad al 0
 *  - cambia la imagen del fondo
 *  - vuelve a mostrarse con opacidad al 1
 * @param element HTMLElement 
 * @param img string
 */
function animation(element, img){
        $(element).animate({
        opacity: 0
    }, 200, function(){
        $(element).css("backgroundImage",`url(imgs/${img}.png)`);
        $(element).animate({opacity: 1}, 800);
    });
}

/**
 * comprueba si la pareja seleccionada es correcta
 * en caso del primer elemento:
 *  - lo almacena en firstPick 
 *  - le quita el evento 
 *  - lo muestra con animacion
 * en caso del segundo elemento:
 *  - se añade el intento
 *  - elimina todos los eventos para evitar problemas de seleccion de elementos
 *  - muestra el elemento seleccionado con animacion
 *  - al acabar la animacion, comprueba si el actual elemento seleccionado y 
 *    el primer elemento seleccionado tienen la misma imagen o no
 *      - no: se devuelve la imagen 0 mediante animacion
 *      - si: se añaden al array aExcludedPairs para que no se le vuelvan a setear eventos
 *  - comprueba si se ha ganado
 *      - si: 
 *          - se establece el tiempo final en la variable time
 *          - se muestran los textos de ganador y del tiempo e intentos necesitados
 *          - se comprueba si se ha batido el record anterior
 *      - no:
 *          - firstPick = null
 *          - se vuelven a setear los eventos
 */
function checkPair(){
    if(!firstPick){
        firstPick = this;
        removeFirstPickEvent();
        animation(firstPick, aImgs[firstPick.id]);
    } else {
        intents++;
        removeEvents();
        $(this).animate({opacity:0},200,function(){
            $(this).css("backgroundImage",`url(imgs/${aImgs[this.id]}.png)`);
            $(this).animate({opacity: 1}, 800, function(){
                // de esta forma se realiza al acabar la animacion y me libro del setTimeout
                if($(firstPick).css("backgroundImage") != $(this).css("backgroundImage")){ // par no igual
                    animation(firstPick, 0);
                    animation(this, 0);
                } else { // par igual
                    aExcludedPairs.push(`#${firstPick.id}`,`#${this.id}`);
                }
            
                if(hasWon()){ // ha ganado
                    time = new Date().getTime() - time;
                    createElement("h2", {
                        text: "Enhorabuena, has ganado!",
                        parent: "#container"
                    });
    
                    createElement("h3", {
                        text: `Tiempo necesitado: ${timeToMins()}, intetos necesitados: ${intents}`,
                        parent: "#container"
                    });
    
                    checkRecord();
                } else { // se continua jugando
                    firstPick = null;
                    setEvents();
                }
            });
        });
    }
}

/**
 * Parsea el tiempo en ms de la variable time a formato mm:ss
 */
function timeToMins(){
    let secs = Math.trunc(time / 1000);
    let mins = Math.trunc(time / 1000 / 60);
    return `${(String(mins).length < 2) ? "0"+mins : mins}:${(String(secs).length < 2) ? "0"+secs : secs}`;
}

/**
 * Comprueba si se ha ganado
 * en caso de que los elementos excluidos sean 12, se ha ganado
 */
function hasWon(){
    if(aExcludedPairs.length < 12){
        return false;
    }
    return true;
}

/**
 * lee la cookie record y comprueba su existencia
 *  - existe: comprueba si se ha batido algun record de tiempo o intentos o ambos
 *    y se setea su mensaje correspondiente
 *  - no existe: se trata de la primera vez que se juega, se setea su mensaje
 * 
 *  si hay mensaje, se guarda una cookie
 *  se imprime el mensaje
 */
function checkRecord(){
    let cookies = readCookie(), msg;
    if(cookies){
        if(cookies.time > time && cookies.intents > intents){
            msg = "Has batido los anteriores records de tiempo: "+cookies.time+" e intentos:"+cookies.intents+"!";
        } else if(cookies.time > time){
            msg = "Has batido el anterior record de tiempo: "+cookies.time+"!";

        } else if(cookies.intents > intents){
            msg = "Has batido el anterior record de intentos:"+cookies.intents+"!";
        }

    } else {
        msg = "Eres la primera persona en jugar, así que actualmente posees el record de tiempo e intentos!";
    }

    if(msg){
        saveCookie();
        createElement("h3",{
            text: msg,
            parent: "#container"
        });
    }
}

/**
 * se guarda la cookie de nombre record con 
 * valor de un objeto con las propiedades time e intents 
 * y un tiempo de duracion de 30 dias
 */
function saveCookie(){
    let expire = new Date();
    expire.setTime(expire.getTime()+(1000*60*60*24*30)); // 30 dias
    let c = `record=${JSON.stringify({time, intents})};`;
    c+=`expires=${expire.toGMTString()};`;
    document.cookie = c;
}

/**
 * se lee la coockie record
 */
function readCookie(){
    let aux;
    if(document.cookie){
        aux = document.cookie.indexOf("record");
        if(aux > -1){
            aux = document.cookie.substr(7, document.cookie.indexOf("}",aux)+1); // cuerpo de la cookie
            return JSON.parse(aux);
        }
    }
    return null;
}

/**
 * se crean los elementos del cuerpo del documento
 * - div #container
 *    - h1: "Juego de Parejas"
 *    - tabla
 *    - boton: "Comenzar"
 *  
 */
function createContent(){
    let cc = 0;

    createElement("div", {
        attributes: [{key:"id", value: "container"}]
    });

    createElement("h1", {
        text: "Juego de Parejas",
        parent: "#container"
    });

    createElement("table", {
        parent: "#container"        
    });

    for(let i=0; i<3; i++){ // rows
        createElement("tr", {
            parent: "table:nth-of-type(1)"
        });

        for(let j=0; j<4; j++){ // cols
            createElement("td", {
                attributes: [{key: "id", value: `${cc++}`}],
                parent: `tr:nth-of-type(${i+1})`
            });
        }
    }

    // btn comenzar
    createElement("button", {
        attributes: [
            {key:"type",value:"button"},
            {key:"id",value:"btn"}
        ],
        text: "Comenzar",
        parent: "#container"
    });
}

/**
 * Metodo para crear elementos del DOM,
 * le he añadido jquery respecto a la version del anterior
 * ejercicio de parejas
 * tag name,
 * options {
 *  attributes: [{key:value},{key:value}],
 *  text: 'text...',
 *  parent: '#id' or 'div:nth-of-type(1)'..., 
 * }
 * 
 * @param tag string
 * @param options object
 */

function createElement(tag, options){
    let element = document.createElement(tag);

    if(options.attributes){
        options.attributes.map((att) => {
            element.setAttribute(att.key, att.value);
        });
    }

    if(options.text){
        element.innerText = options.text;
    }

    if(options.parent){
        $(options.parent).append(element);
    } else {
        $("body")[0].append(element);
    }
}