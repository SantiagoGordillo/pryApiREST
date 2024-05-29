import { createServer } from 'node:http'; 
import { gestionarProductos, gestionarProducto, agregarProducto, gestionar404, modificarProducto, borrarProducto, fallback, gestionarOPTION } from './funciones.mjs';

const PUERTO = 3000;

const servidor = createServer(async (peticion, respuesta)=>{
    if(peticion.method === 'GET'){
        if(peticion.url === "/productos"){
            gestionarProductos(respuesta) //Chequed = Positive
        }
        else if(peticion.url.match('/productos')){
            gestionarProducto(peticion, respuesta) //Chequed = Positive
        }
        else {
            gestionar404(respuesta) //Chequed = Positive
        }
    }else if(peticion.method === 'POST'){
        if(peticion.url === "/productos"){
            agregarProducto(peticion, respuesta) //Chequed = Positive
        }
        else{
            gestionar404(respuesta) //Chequed = Positive
        }    
    }else if(peticion.method === 'PUT') {
        if(peticion.url.match('/productos')){
            modificarProducto(peticion, respuesta) //Chequed = Positive
        }else{
            gestionar404(respuesta) //Chequed = Positive
        }
    }else if(peticion.method === 'OPTIONS') {
        if(peticion.url.match('/productos')){
            gestionarOPTION(respuesta) //Chequed = Positive
        }else{
            gestionar404(respuesta) //Chequed = Positive
        }
    }else if(peticion.method === 'DELETE'){
        if(peticion.url.match('/productos') ){
            borrarProducto(peticion, respuesta) //Chequed = Positive
        }
        else {
            gestionar404(respuesta) //Chequed = Positive
        }
    }else{
        fallback(respuesta) //Chequed = Positive
    }
})

servidor.listen(PUERTO, ()=>{
    console.log(`http://localhost:${PUERTO}/productos`);
});
