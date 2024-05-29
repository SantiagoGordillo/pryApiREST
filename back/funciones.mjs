// Importamos las funciones necesarias para gestionar las rutas que se van a utilizar
import { join, parse } from 'node:path';
// Importamos las funciones readFile y writeFile del módulo fs/promises de node.js para la lectura y escritura de archivos
import { readFile, writeFile } from 'node:fs/promises';

// Definimos una variable productosV1 que va a almacenar los productos que se encuentran en el archivo productos.json
let productosV1;

// Definimos la función leerArchivosJson que va a leer el archivo productos.json y almacenar los datos en la variable productosV1
const leerArchivosJson = async()=>{
    try{
        const ruta = join('versiones','V1','productos.json'); // Definimos la ruta del archivo productos.json
        const datos = await readFile(ruta, 'utf-8'); // Leemos el archivo productos.json y almacenamos los datos en la variable datos
        productosV1 = JSON.parse(datos) // Convertimos los datos a un objeto JSON y los almacenamos en la variable productosV1
    }catch(error){
        console.log(error)
    }
}

// Definimos la función obtenerID que va a obtener el id del último producto y sumarle 1 para asignarle un nuevo id al producto que se va a agregar
const obtenerID = async()=>{
    await leerArchivosJson();
    try {
        return (productosV1.productos[productosV1.productos.length -1].id + 1);
    } catch (error) {
        return 1; // Si no hay productos en el archivo productos.json se asigna el id 1 al nuevo producto
    }
    
}

// Definimos la función gestionarProductos que va a devolver la lista de productos almacenados en el archivo productos.json
const gestionarProductos = async(respuesta)=>{
    await leerArchivosJson(); // Llamamos a la función leerArchivosJson para leer el archivo productos.json
    if(productosV1){
        respuesta.setHeader('Access-Control-Allow-Origin', '*') // Permitimos el acceso a la API desde cualquier origen
        respuesta.setHeader('Content-Type', 'application/json;charset=utf-8')
        respuesta.statusCode=200
        respuesta.end(JSON.stringify(productosV1))
    }else{
        respuesta.setHeader('Content-Type', 'text/plain;charset=utf-8')
        respuesta.statusCode=404
        respuesta.end("No fue encontrado el recurso");
    }
}

// Definimos la función gestionarProducto que va a devolver un producto en particular según el id que se pase en la url
const gestionarProducto = async(peticion, respuesta)=>{
    await leerArchivosJson();
    const id = parse(peticion.url).base; // Obtenemos el id del producto de la url de la petición 
    const producto = productosV1.productos.find((producto) =>{
        return Number(producto.id) === Number(id);
    }); // Buscamos el producto en el archivo productos.json que tenga el id que se pasó en la url y lo almacenamos en la variable producto
    if(producto){ // Si se encuentra el producto, se almacenan los datos del producto en una variable respuestaJSON y se envía la respuesta al cliente
        const respuestaJSON = `{
                "productos":[
                    ${JSON.stringify(producto)}
                ]
            }`;
        respuesta.setHeader('Content-Type', 'application/json;charset=utf-8');
        respuesta.setHeader('Access-Control-Allow-Origin', '*');
        respuesta.statusCode = 200;
        respuesta.end(respuestaJSON);
    }else{ // Si no se encuentra el producto, se envía un mensaje de error al cliente
        respuesta.setHeader('Content-Type', 'text/plain;charset=utf-8');
        respuesta.statusCode = 404;
        respuesta.end('No se encuentra el producto');
    }
}


// Definimos la función agregarProducto que va a agregar un nuevo producto al archivo productos.json
const agregarProducto = async(peticion, respuesta)=>{
    await leerArchivosJson();
    // Declaramos la variable en la que se van a almacenar los datos del cuerpo de la petición
    let datosDelCuerpo = '';
    // Escuchamos el evento 'data' de la petición para obtener los datos del cuerpo de la petición y almacenarlos en la variable datosDelCuerpo
    peticion.on('data', (pedacitos)=>{
        datosDelCuerpo += pedacitos;
    })
    // Escuchamos el evento 'error' de la petición para manejar los errores que se puedan presentar
    peticion.on('error', (error)=>{
        console.error(error);
        respuesta.setHeader('Content-Type', 'text/plain');
        respuesta.statusCode = 500;
        respuesta.end("Error del servidor")
    })
    // Escuchamos el evento 'end' de la petición para agregar el nuevo producto al archivo productos.json
    peticion.on('end', async()=>{
        try{
            const rutaJson = join('versiones', 'V1', 'productos.json')
            const datosProducto = JSON.parse(datosDelCuerpo)
            const id = await obtenerID(); // Obtenemos el id del nuevo producto
            const nuevoProducto = { // Creamos un objeto con los datos del nuevo producto
                id: id,
                marca: datosProducto.marca,
                tipo: datosProducto.tipo,
                talle: datosProducto.talle,
                precio: datosProducto.precio
            };
            productosV1.productos.push(nuevoProducto) // Agregamos el nuevo producto al arreglo de productos con el método push
            await writeFile(rutaJson, JSON.stringify(productosV1)) // Escribimos los datos actualizados en el archivo productos.json
            respuesta.setHeader('Access-Control-Allow-Origin', '*');
            respuesta.statusCode=201
            respuesta.end();
        }catch(error){
            console.error(error)
            respuesta.setHeader('Content-Type', 'text/plain')
            respuesta.statusCode=500;
            respuesta.end("No se pudo agregar el producto")
        }
    })
}

// Definimos la función modificarProducto que va a modificar un producto en particular según el id que se pase en la url
const modificarProducto = async(peticion, respuesta)=>{
    await leerArchivosJson();
    const id = parse(peticion.url).base
    const producto = productosV1.productos.find((producto)=>{
        return Number(id) === Number(producto.id)
    })
    if(producto){
        let datosDelCuerpo = ''
        peticion.on('data',(pedacitos)=>{
            datosDelCuerpo += pedacitos
        })
        peticion.on('error',(error)=>{
            console.error(error)
            respuesta.statusCode = 500
            respuesta.setHeader('Content-Type','text/plain')
            respuesta.end('Error del servidor')
        })
        // Escuchamos el evento 'end' de la petición para modificar los datos del producto en el archivo productos.json
        peticion.on('end',async ()=>{
            try{
                const rutaJSON = join('versiones', 'V1', 'productos.json')
                const cambiarProducto = JSON.parse(datosDelCuerpo)
                const productos = productosV1.productos.map((producto)=>{ // Recorremos el arreglo de productos y modificamos los datos del producto el cual su id coincida con el id que se pasó en la url
                    if(parseInt(producto.id) === parseInt(id)){
                        return {
                            id: parseInt(id),
                            marca: cambiarProducto.marca,
                            tipo: cambiarProducto.tipo,
                            talle: cambiarProducto.talle,
                            precio: cambiarProducto.precio
                        };
                    }else{
                        return producto;
                    }
                })
                productosV1.productos = productos; // Actualizamos el arreglo de productos con los datos modificados
                await writeFile(rutaJSON,JSON.stringify(productosV1)) // Escribimos los datos actualizados en el archivo productos.json
                respuesta.setHeader('Access-Control-Allow-Origin', '*');
                respuesta.statusCode = 201
                respuesta.end()
            }catch(error){
                console.log(error)
                respuesta.setHeader('Content-Type','text/plain')
                respuesta.statusCode = 500
                respuesta.end('Error en el servidor')
            }
        })
    } else { // Si no se encuentra el producto, se envía un mensaje de error al cliente
        respuesta.setHeader('Content-Type', 'text/plain;charset=utf-8');
        respuesta.statusCode = 404;
        respuesta.end('No se encuentra el producto');
    }
}

// Definimos la función borrarProducto que va a borrar un producto en particular según el id que se pase en la url
const borrarProducto = async (peticion, respuesta) => {
    await leerArchivosJson();
    const id = parse(peticion.url).base
    const nuevosProductos = productosV1.productos.filter((producto)=>{ // Filtramos los productos que no coincida el id con el que se pasó en la url
       return Number(producto.id) !== Number(id)
    })
    try{
        const rutaJson = join('versiones', 'V1', 'productos.json')
        const respuestaJSON = { // Creamos un objeto con los productos actualizados para poder escribirlos en el archivo productos.json
            "productos": nuevosProductos
        };
        if (JSON.stringify(productosV1) != JSON.stringify(respuestaJSON)){ // Si los productos son diferentes a los productos actualizados, se escriben los datos en el archivo productos.json
            await writeFile(rutaJson, JSON.stringify(respuestaJSON))
            respuesta.setHeader('Access-Control-Allow-Origin', '*');
            respuesta.statusCode=201
            respuesta.end();
        }else{
            respuesta.setHeader('Content-Type', 'text/plain;charset=utf-8');
            respuesta.statusCode = 404;
            respuesta.end('No se encuentra el producto');
        }
    }catch(error){
        console.error(error)
        respuesta.statusCode=500
        respuesta.setHeader('Content-Type', 'text/plain')
        respuesta.end("Error en el servidor");
    }
}

// Definimos la función gestionar404 que va a devolver un mensaje de error cuando no se encuentre la ruta solicitada
const gestionar404 = async (respuesta)=>{
    respuesta.setHeader('Content-Type', 'text/plain;charset=utf-8');
    respuesta.statusCode = 404;
    respuesta.end('No se encuentra la ruta');
}

// Definimos la función fallback que va a devolver un mensaje de error cuando no se encuentre el recurso solicitado
const fallback = (respuesta)=>{
    respuesta. setHeader('Content-Type', 'text/plain')
    respuesta.statusCode=200
    respuesta.end(`{
        "productos":[]
    }`)
}

// Definimos la función gestionarOPTION que va a gestionar las peticiones de tipo OPTION que se realicen a la API
const gestionarOPTION = async (respuesta) => {
    try {
        respuesta.setHeader('Access-Control-Allow-Origin', '*');
        respuesta.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        respuesta.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        respuesta.statusCode = 201
        respuesta.end()
    } catch (error) {
        console.error(error)
        respuesta.statusCode=500
        respuesta.setHeader('Content-Type', 'text/plain')
        respuesta.end("Error en el servidor");
    }
} 

// Exportamos las funciones para poder utilizarlas en el archivo servidor.mjs
export { gestionarProductos, gestionarProducto, agregarProducto, gestionar404, modificarProducto, borrarProducto, fallback, gestionarOPTION}