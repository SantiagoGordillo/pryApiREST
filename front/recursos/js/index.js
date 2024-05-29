// Implementación Front-End de API REST
const obtenemosProductos = async () => {
    try {
         // Solicitamos api
        const datos = await fetch('http://localhost:3000/productos');
        const jsonProductos = await datos.json();
        const productos = jsonProductos.productos;
        // Renderizamos
        renderizar('productos', productos);
    } catch (error) {
        console.log(error);
    }
};

const renderizar = (id, productos) => {
    // Donde se renderiza
    const contenedor = document.getElementById(id);
    // Construimos el HTML
    let html = '';
    productos.forEach((producto) => {
        html += `<article>
                    <ul>
                        <li class="productos-marca">${producto.marca} <a class="productos-marca__boton" href="./editar.html?id=${producto.id}">editar</a> </li>
                        <li>Tipo: ${producto.tipo}
                        <li>Talle: ${producto.talle}
                        <li>Precio: $${producto.precio}
                    </ul>
            </article>`;
    });
    // Asignamos el contenido
    contenedor.innerHTML = html;
};
// ---------------------------------------------------------
// Invocar funciones ---------------------------------------
// ---------------------------------------------------------
obtenemosProductos();