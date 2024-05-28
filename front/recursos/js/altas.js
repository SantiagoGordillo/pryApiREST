const formulario = document.getElementById('formulario')
formulario.addEventListener('submit', async(evento)=>{
    evento.preventDefault()
    const datosCrudos = new FormData(formulario)
    const datosFormulario = Object.fromEntries(datosCrudos)
    const respuesta = await fetch(formulario.action, {
        headers:{
            'Content-Type':'application/json'
        },
        method: formulario.method,
        body:JSON.stringify(datosFormulario)
    })
})