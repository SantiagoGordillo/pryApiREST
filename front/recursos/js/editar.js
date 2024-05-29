// Obtener ID
const url = new URL(location.href);
const id_producto = url.searchParams.get('id');
// Referencia contenedor mensajes
const contenedorMensaje = document.getElementById('mensaje-accion');

// Funciones ---------------------------------------------
const obtenerProducto = async (id_producto) => {
    // Solicitamos api
    try {
        const datos = await fetch(
            `http://localhost:3000/productos/${id_producto}`,
        );
        const jsonProductos = await datos.json();
        // Si existe solo un producto,
        // se encuentra en la posición 0 del array productos
        const producto = jsonProductos.productos[0];
        // Renderizar formulario
        renderizarFormulario(producto);
    } catch (error) {
        console.error(error);
    }
};
const eliminarProducto = (id_producto) => {
    const botonEliminar = document.getElementById('borrar-producto');
    botonEliminar.addEventListener('click', async () => {
        const confirmar = confirm('Está por eliminar un producto, ¿Continuar?');
        if (confirmar) {
            const respuesta = await fetch(
                `http://localhost:3000/productos/${id_producto}`,
                {
                    method: 'DELETE',
                },
            );
            if (respuesta.ok) {
                // Redireccionamos a inicio
                location.href = './';
            }
        }
    });
};
const renderizarFormulario = (producto) => {
    const contenedor = document.getElementById('editar-producto');
    // Construimos el HTML
    let html = `<form id="formulario-editar" class="formulario-editar">
                    <label for="id-marca">Marca</label>
                    <input type="text" id="id-marca" name="marca" value="${producto.marca}" required />
                    <label for="id-tipo">Tipo</label>
                    <input type="text" id="id-tipo" name="tipo" value="${producto.tipo}" required />
                    <label for="id-talle">Talle</label>
                    <input type="number" id="id-talle" name="talle" step="0.1" value="${producto.talle}" required />
                    <label for="id-precio">Precio</label>
                    <input type="number" id="id-precio" name="precio" step="0.1" value="${producto.precio}" required />
                    <button type="submit">Guardar</button>
                </form>`;
    // Asignamos el contenido
    contenedor.innerHTML = html;
    // Agregamos el escuchador de evento
    const formulario = document.getElementById('formulario-editar');
    formulario.addEventListener('submit', (evento) => {
        evento.preventDefault();
        const datosCrudos = new FormData(formulario);
        const datosFormulario = Object.fromEntries(datosCrudos);
        const cuerpo = JSON.stringify(datosFormulario);
        // Envío asíncrono de datos
        envioDatos(id_producto, cuerpo);
    });
};
const envioDatos = async (id_producto, cuerpo) => {
    const respuesta = await fetch(
        `http://localhost:3000/productos/${id_producto}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            },
            body: cuerpo,
        },
    );
    // Si todo fue OK:
    if (respuesta.ok) {
        mostrarMensajeOk('Producto modificado');
    }
    // Si no:
    else {
        // El código 400 hace referencia a
        // que el usuario no envio todos los datos
        // Esto lo deben verificar uds. del lado del servidor
        if (respuesta.status === 400) {
            mostrarMensajeAlerta('Datos incompletos');
        } else {
            mostrarMensajeAlerta('Error desconocido');
        }
    }
};
const mostrarMensajeOk = (mensaje) => {
    contenedorMensaje.textContent = mensaje;
    contenedorMensaje.style.display = 'block';
    contenedorMensaje.classList.add('mensaje-accion-ok');
};
const mostrarMensajeAlerta = (mensaje) => {
    contenedorMensaje.textContent = mensaje;
    contenedorMensaje.style.display = 'block';
    contenedorMensaje.classList.add('mensaje-accion-alerta');
};
// ---------------------------------------------------------
// Invocar funciones ---------------------------------------
// ---------------------------------------------------------
obtenerProducto(id_producto);
// Dentro de eliminar producto se inicializa el escuchador
eliminarProducto(id_producto);
// Animaciones
contenedorMensaje.addEventListener('animationend', () => {
    // contenedorMensaje.classList.add('mensaje-accion-alerta');
    contenedorMensaje.style.display = 'none';
});
