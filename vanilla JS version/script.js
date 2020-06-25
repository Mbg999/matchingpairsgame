"use strict";

// variables
let aCasillas;
let imgs = [1, 2, 3, 4, 5, 6];
imgs = imgs.concat(imgs); // para duplicar las imagenes sin tener que volver a escribirlas a mano
let a;
let cc; // numero de parejas encontradas
let excluidos; // posiciones excluidas porque ya han sido encontradas
let intentos;
let tiempoInicio, tiempoFinal;
let animacion;

window.addEventListener("load", function(){
    // CREAR ELEMENTOS
    crearElementos();
    pedirAnimacion();
    // llenar array aCasillas
    aCasillas = document.getElementsByTagName("td");

    // boton comenzar
    document.getElementById("comenzar").addEventListener("click", function(){
        leerAnimacion();
        document.getElementById("resultado").innerHTML = "";
        a = null;
        excluidos = [];
        cc = 0;
        intentos = 0;
        randomSort();
        prepararTablero();
        tiempoInicio = new Date();
        this.innerText = "Reiniciar";
    });
});

// funciones
function leerAnimacion(){
    let inputs = document.getElementsByName("animacion");
    for (let input of inputs) {
        if(input.checked){
            animacion = input.value;
        }
    }
    if(!animacion){
        animacion = "flip";
    }
}

function parseTiempo(){
    let minutos = Math.floor(tiempoFinal / 60000);
    let segundos = ((tiempoFinal % 60000) / 1000).toFixed(0);
    return minutos + ":" + (segundos < 10 ? '0' : '') + segundos;
}

function comprobarMarcas(){
    let cookies = getCookies();
    let msg;
    if(cookies && cookies["tiempo"] && cookies["intentos"]){
        if(tiempoFinal < parseInt(cookies["tiempo"])){
            msg = "Enhorabuena! Has conseguido un mejor resultado a causa de un menor tiempo";
        } else if(intentos < parseInt(cookies["intentos"])){
            msg = "Enhorabuena! Has conseguido un mejor resultado a causa de una menor cantidad de intentos";
        }
    } else {
        msg = "Eres el primer jugador, así que actualmente tu puntuación es la mejor!";
    }

    if(msg){
        setCookies();
        addElement("h3", {
            texto: msg,
            id:"resultado"
        });
    }
}

function setCookies(){
    let fecha = new Date();
    fecha.setTime(fecha.getTime()+(1000*60*60*24*7)); // 1 semana
    // guardar tiempo e intentos en el objeto mejorResultado
    let c = `mejorResultado=${JSON.stringify({tiempo:tiempoFinal, intentos:intentos})};`;
    c += `expires=${fecha.toGMTString()}`;
    document.cookie = c;
}

function getCookies(){
    let aux;
    if(document.cookie){
        aux = document.cookie.indexOf("mejorResultado")+15;
        if(aux > -1){
            return JSON.parse(document.cookie.substr(aux));
        }
        
    }
    return null;
}

function prepararTablero(){
    for (let i = 0; i < aCasillas.length; i++) {
        aCasillas[i].style.backgroundImage = "url(imgs/0.png)";
        aCasillas[i].classList.add(animacion);
    }
    setListeners();
}

function setListeners(){
    for (let i = 0; i < aCasillas.length; i++) {
        if(excluidos.indexOf(String(i)) < 0){
            aCasillas[i].addEventListener("click", comprobar);
        }
        
    }
}

function delListeners(){
    for (let i = 0; i < aCasillas.length; i++) {
        aCasillas[i].removeEventListener("click", comprobar);
    }
}

function delListener(i){
    aCasillas[i].removeEventListener("click", comprobar);
}

function esGanador(){
    if(cc < (aCasillas.length/2)){
        return false;
    }
    return true;
}

function comprobar(){
    this.classList.add("animated"); // añadir animacion
    if(!a){
        this.style.backgroundImage = `url(imgs/${imgs[this.id]}.png)`;
        a = [this.id, imgs[this.id]];
        delListener(this.id);
    } else {
        delListeners();
        let b = this; // en el setTimeout this = window
        b.style.backgroundImage = `url(imgs/${imgs[this.id]}.png)`;
        intentos++;
        setTimeout(function(){
            // console.log(this); // -> window
            if(imgs[b.id] == a[1]){
                cc++;
                excluidos.push(a[0], b.id);
            } else {
                document.getElementById(a[0]).style.backgroundImage = "url(imgs/0.png)";
                b.style.backgroundImage = "url(imgs/0.png)";
                
            }
            // eliminar clases animacion
            document.getElementById(a[0]).classList.remove("animated");
            b.classList.remove("animated");

            if(esGanador()){
                tiempoFinal =  new Date().getTime() - tiempoInicio.getTime();
                addElement("h1", {
                    texto: "Enhorabuena, has ganado!",
                    id:"resultado"
                });

                addElement("p", {
                    texto: `Has necesitado ${intentos} intentos y un tiempo de ${parseTiempo()}`,
                    id:"resultado"
                });

                comprobarMarcas();
                pedirAnimacion();
            } else {
                a = null;
                setListeners();
            }
            
        }, 1000);
        
    }
}

function randomSort(){
    imgs.sort((a,b)=>{
        return 0.5 - Math.random();
    });
}

function crearElementos(){
    // capa container
    addElement("div", {
        atributos:[{
            clave:"id",
            valor:"container"
        }]
    }, false);

    // titulo
    addElement("h1", {
        texto:"Juego de Parejas",
        id:"container"
    }, false);

    // tabla
    addElement("table", {
        atributos:[{
            clave:"id",
            valor:"tabla"
        }],
        id:"container"
    }, false);


    let id = 0;
    for(let i = 1; i<4; i++){
        // tr
        addElement("tr", {
            atributos:[{
                clave:"id",
                valor:`tr${i}`
            }],
            id:"tabla"
        }, false);

        for(let j = 1; j<5; j++){
            // td
            addElement("td", {
                atributos:[{
                    clave:"id",
                    valor:`${id++}`
                }],
                id:"tr"+i
            }, false);
        }
    }
    
    // boton comenzar
    addElement("button", {
        atributos:[{
            clave:"type",
            valor:"button"
        },{
            clave:"id",
            valor:"comenzar"
        }],
        texto: "Comenzar",
        id: "container"
    }, false);

    addElement("div", {
        atributos:[{
            clave:"id",
            valor:"resultado"
        }],
        id:"container"
    });
}

function pedirAnimacion(){
    let html = `<div id="selectAnimation">
    <h3>Selecciona la animación que más te guste</h3>
    <div>
        <input type="radio" name="animacion" id="flip" value="flip" checked>
        <label for="flip">flip</label>
        <div class="box animated infinite flip"></div>
    </div>
    <div>
        <input type="radio" name="animacion" id="jello" value="jello">
        <label for="jello">jello</label>
        <div class="box animated infinite jello"></div>
    </div>
    <div>
        <input type="radio" name="animacion" id="heartBeat" value="heartBeat">
        <label for="heartBeat">heartBeat</label>
        <div class="box animated infinite heartBeat"></div>
    </div>
</div>`;
    document.getElementById("resultado").innerHTML += html;
}

/**
 * plantilla para crear objetos
 * se le pasa el tipo de objeto html y
 * un objeto con las opciones deseadas, ej:
 * {
 *  atributos: [{
 *      clave:'id',
 *      valor:'idvalue'
 *   },{
 *      clave:'name',
 *      valor:'namevalue'
 *   }],
 *  texto: 'esto es un texto',
 *  id: 'id' del objeto al que se quiere hacer el append,
 * }
 * @param tipo string
 * @param opciones objeto literal
 */
function addElement(tipo, opciones){
    let element = document.createElement(tipo);

    // si hay array de atributos, se añaden
    if(opciones.atributos){
        opciones.atributos.map((a)=>{
            element.setAttribute(a.clave, a.valor);
        });
    }

    if(opciones.texto){
        element.innerText = opciones.texto;
    }

    if(opciones.id){
        document.getElementById(opciones.id).appendChild(element);
    } else {
        document.body.appendChild(element)
    }
}