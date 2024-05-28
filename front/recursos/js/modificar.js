const formulario = document.getElementById('formulario')

function extraerParametros(url, param) {
    const objetoiUrl = new URL(url)
    const params = objetoiUrl.searchParams
    return params.get(param)
}

async function obtenerProducto() {
    try {
        const id = extraerParametros(location.href, 'id')
        const datosCrudos = await fetch(`http://localhost:3000/productos/${id}`)
        const datosJSON = await datosCrudos.json()

        if (datosJSON.productos.length > 0){
            const datosProducto = datosJSON.productos[0]
            formulario.innerHTML = `
            <input type="text" name="marca" value='${datosProducto.marca}'>
            <br>
            <input type="text" name="tipo" value='${datosProducto.tipo}'>
            <br>
            <input type="number" name="talle" value='${datosProducto.talle}'>
            <br>
            <button type="submit">Modificar</button>
            `
        } else {

        }  
    }catch (error) {
        console.log(error);
    }
}
obtenerProducto()

formulario.addEventListener('submit', async(evento)=>{
    evento.preventDefault()
    const id = extraerParametros(location.href, 'id')
    const datosCrudos = new FormData(formulario)
    const datosFormulario = Object.fromEntries(datosCrudos)
    const respuesta = await fetch(formulario.action + '/' + id, {
        headers:{
            'Content-Type':'application/json'
        },
        method: 'PUT',
        body:JSON.stringify(datosFormulario)
    })
})