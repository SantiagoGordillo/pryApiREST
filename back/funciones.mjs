import { join, parse } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';

let productosV1;

const leerArchivosJson = async()=>{
    try{
        const ruta = join('versiones','V1','productos.json');
        const datos = await readFile(ruta, 'utf-8');
        productosV1 = JSON.parse(datos)
    }catch(error){
        console.log(error)
    }
}

const obtenerID = async()=>{
    await leerArchivosJson();
    try {
        return (productosV1.productos[productosV1.productos.length -1].id + 1);
    } catch (error) {
        return 1;
    }
    
}

const gestionarProductos = async(respuesta)=>{
    await leerArchivosJson();
    if(productosV1){
        respuesta.setHeader('Access-Control-Allow-Origin', '*')
        respuesta.setHeader('Content-Type', 'application/json;charset=utf-8')
        respuesta.statusCode=200
        respuesta.end(JSON.stringify(productosV1))
    }else{
        respuesta.setHeader('Content-Type', 'text/plain;charset=utf-8')
        respuesta.statusCode=404
        respuesta.end("No fue encontrado el recurso");
    }
}

const gestionarProducto = async(peticion, respuesta)=>{
    await leerArchivosJson();
    const id = parse(peticion.url).base;
    const producto = productosV1.productos.find((producto) =>{
        return Number(producto.id) === Number(id);
    });
    if(producto){
        const respuestaJSON = `{
                "productos":[
                    ${JSON.stringify(producto)}
                ]
            }`;
        respuesta.setHeader('Content-Type', 'application/json;charset=utf-8');
        respuesta.setHeader('Access-Control-Allow-Origin', '*');
        respuesta.statusCode = 200;
        respuesta.end(respuestaJSON);
    }else if (id === "productos"){
        const respuestaJSON = `{
            "productos":[]
        }`;
        respuesta.setHeader('Content-Type', 'application/json;charset=utf-8');
        respuesta.setHeader('Access-Control-Allow-Origin', '*');
        respuesta.statusCode = 404;
        respuesta.end(respuestaJSON);
    }else{
        respuesta.setHeader('Content-Type', 'text/plain;charset=utf-8');
        respuesta.statusCode = 404;
        respuesta.end('No se encuentra el producto');
    }
}

const agregarProducto = async(peticion, respuesta)=>{
    await leerArchivosJson();
    let datosDelCuerpo = '';
    peticion.on('data', (pedacitos)=>{
        datosDelCuerpo += pedacitos;
    })
    peticion.on('error', (error)=>{
        console.error(error);
        respuesta.setHeader('Content-Type', 'text/plain');
        respuesta.statusCode = 500;
        respuesta.end("Error del servidor")
    })
    peticion.on('end', async()=>{
        try{
            const rutaJson = join('versiones', 'V1', 'productos.json')
            const datosProducto = JSON.parse(datosDelCuerpo)
            const id = await obtenerID();
            const nuevoProducto = {
                id: id,
                marca: datosProducto.marca,
                tipo: datosProducto.tipo,
                talle: datosProducto.talle,
                precio: datosProducto.precio
            };
            productosV1.productos.push(nuevoProducto)
            await writeFile(rutaJson, JSON.stringify(productosV1))
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
        peticion.on('end',async ()=>{
            try{
                const rutaJSON = join('versiones', 'V1', 'productos.json')
                const cambiarProducto = JSON.parse(datosDelCuerpo)
                const productos = productosV1.productos.map((producto)=>{
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
                productosV1.productos = productos;
                await writeFile(rutaJSON,JSON.stringify(productosV1))
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
    } else {
        respuesta.setHeader('Content-Type', 'text/plain;charset=utf-8');
        respuesta.statusCode = 404;
        respuesta.end('No se encuentra el producto');
    }
}

const borrarProducto = async (peticion, respuesta) => {
    await leerArchivosJson();
    const id = parse(peticion.url).base
    const nuevosProductos = productosV1.productos.filter((producto)=>{
       return Number(producto.id) !== Number(id)
    })
    
    try{
        const rutaJson = join('versiones', 'V1', 'productos.json')
        const respuestaJSON = {
            "productos": nuevosProductos
        };
        if (JSON.stringify(productosV1) != JSON.stringify(respuestaJSON)){
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

const gestionar404 = async (respuesta)=>{
    respuesta.setHeader('Content-Type', 'text/plain;charset=utf-8');
    respuesta.statusCode = 404;
    respuesta.end('No se encuentra la ruta');
}

const fallback = (respuesta)=>{
    respuesta. setHeader('Content-Type', 'text/plain')
    respuesta.statusCode=200
    respuesta.end(`{
        "productos":[]
    }`)
}

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

export { gestionarProductos, gestionarProducto, agregarProducto, gestionar404, modificarProducto, borrarProducto, fallback, gestionarOPTION}