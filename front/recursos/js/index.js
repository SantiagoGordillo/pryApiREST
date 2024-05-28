const traerProductos = async () => {
    try {
        const contenedor = document.getElementById('productos')
        const datosProductos = await fetch('http://localhost:3000/productos')
        const datosJSON = await datosProductos.json()
        console.log(datosJSON);
        let HTML = '';
        datosJSON.productos.forEach((producto) => {
            HTML += `
            <article>
                <h3>Marca: ${producto.marca}</h3>
                <div>Tipo: ${producto.tipo}</div>
                <div>Talle: ${producto.talle}</div>
                <a href="modificar.html?id=${producto.id}">Editar</a>
            </article>
            `;
        })
        contenedor.innerHTML = HTML;
    } catch (error) {
        console.log(error)
    }
}
traerProductos();
