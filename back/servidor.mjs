// Importamos el módulo http de node.js para crear el servidor
import { createServer } from 'node:http'; 
// Importamos las funciones que vamos a utilizar en el servidor desde el archivo funciones.mjs
import { gestionarProductos, gestionarProducto, agregarProducto, gestionar404, modificarProducto, borrarProducto, fallback, gestionarOPTION } from './funciones.mjs';

// Definimos el puerto en el que va a escuchar el servidor
const PUERTO = 3000;

// Creamos el servidor y definimos las respuestas a las peticiones segun el método y la url de la petición
const servidor = createServer(async (peticion, respuesta)=>{
    if(peticion.method === 'GET'){ // Si la petición es de tipo GET entra en este if
        if(peticion.url === "/productos"){ // Si la url de la petición es /productos se llama a la función gestionarProductos
            gestionarProductos(respuesta)
        }
        else if(peticion.url.match('/productos')){ // Si la url de la petición contiene /productos se llama a la función gestionarProducto
            gestionarProducto(peticion, respuesta) 
        }
        else { // Si la url de la petición no es /productos ni contiene /productos se llama a la función gestionar404
            gestionar404(respuesta) 
        }
    }else if(peticion.method === 'POST'){ // Si la petición es de tipo POST entra en este if
        if(peticion.url === "/productos"){ // Si la url de la petición es /productos se llama a la función agregarProducto
            agregarProducto(peticion, respuesta) 
        }
        else{
            gestionar404(respuesta) 
        }    
    }else if(peticion.method === 'PUT') { // Si la petición es de tipo PUT entra en este if
        if(peticion.url.match('/productos')){ // Si la url de la petición contiene /productos se llama a la función modificarProducto
            modificarProducto(peticion, respuesta) 
        }else{
            gestionar404(respuesta) 
        }
    }else if(peticion.method === 'OPTIONS') { // Si la petición es de tipo OPTIONS entra en este if
        if(peticion.url.match('/productos')){ // Si la url de la petición contiene /productos se llama a la función gestionarOPTION
            gestionarOPTION(respuesta) 
        }else{
            gestionar404(respuesta) 
        }
    }else if(peticion.method === 'DELETE'){ // Si la petición es de tipo DELETE entra en este if
        if(peticion.url.match('/productos') ){ // Si la url de la petición contiene /productos se llama a la función borrarProducto
            borrarProducto(peticion, respuesta) 
        }
        else {
            gestionar404(respuesta) 
        }
    }else{ // Si la petición no es de tipo GET, POST, PUT, OPTIONS o DELETE se llama a la función fallback
        fallback(respuesta) 
    }
})

// El servidor escucha en el puerto definido y muestra un mensaje en consola con la url del servidor
servidor.listen(PUERTO, ()=>{
    console.log(`http://localhost:${PUERTO}/productos`);
});
