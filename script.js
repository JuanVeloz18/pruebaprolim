document.addEventListener('DOMContentLoaded', () => {
  let carrito = []; // Array para almacenar los productos del carrito
  let categoriaSeleccionada = null; // Variable para almacenar la categoría seleccionada

  // Cargar el archivo CSV
  fetch('Bdatos.csv')
    .then(response => response.text())
    .then(data => cargarCategorias(data))
    .catch(error => console.error('Error al cargar el archivo CSV:', error));

  // Función para cargar las categorías
  function cargarCategorias(csvData) {
    const productos = parseCSV(csvData);
    const categoriasContainer = document.getElementById('categorias');
    
    // Limpiar el contenedor de categorías antes de agregar nuevas
    categoriasContainer.innerHTML = '';

    // Crear un botón para "Todos los Productos"
    const todosButton = document.createElement('button');
    todosButton.classList.add('categoria');
    todosButton.textContent = 'Todos los Productos';
    
    // Al hacer clic en "Todos los Productos", mostrar todos los productos
    todosButton.addEventListener('click', () => {
      // Eliminar la clase 'seleccionada' de todos los botones de categoría
      const allCategoriaButtons = document.querySelectorAll('.categoria');
      allCategoriaButtons.forEach(btn => btn.classList.remove('seleccionada'));

      // Agregar la clase 'seleccionada' al botón de "Todos los Productos"
      todosButton.classList.add('seleccionada');

      // Actualizar la categoría seleccionada a null (para mostrar todos los productos)
      categoriaSeleccionada = null;

      // Mostrar todos los productos
      mostrarProductosPorCategoria(null, productos);
    });

    categoriasContainer.appendChild(todosButton); // Agregar el botón "Todos los Productos"

    // Crear un conjunto de categorías únicas
    const categorias = new Set(productos.map(producto => producto.categoria));

    categorias.forEach(categoria => {
      const categoriaButton = document.createElement('button');
      categoriaButton.classList.add('categoria');
      categoriaButton.textContent = categoria;
      
      // Al hacer clic, mostrar los productos de la categoría seleccionada
      categoriaButton.addEventListener('click', () => {
        // Eliminar la clase 'seleccionada' de todos los botones de categoría
        const allCategoriaButtons = document.querySelectorAll('.categoria');
        allCategoriaButtons.forEach(btn => btn.classList.remove('seleccionada'));

        // Agregar la clase 'seleccionada' al botón clickeado
        categoriaButton.classList.add('seleccionada');

        // Actualizar la categoría seleccionada
        categoriaSeleccionada = categoria;

        // Mostrar los productos de la categoría seleccionada
        mostrarProductosPorCategoria(categoria, productos);
      });

      categoriasContainer.appendChild(categoriaButton);
    });

    // Al cargar la página, mostramos todos los productos y marcamos el primer botón como seleccionado
    if (categorias.size > 0) {
      todosButton.classList.add('seleccionada');
      mostrarProductosPorCategoria(null, productos);
    }

    // Llamar a la función de búsqueda para filtrar productos en tiempo real
    const buscador = document.getElementById('buscador');
    buscador.addEventListener('input', () => buscarProductos(buscador.value, productos));
  }

  // Función para mostrar los productos de una categoría (o todos los productos)
  function mostrarProductosPorCategoria(categoria, productos) {
    const catalogoContainer = document.getElementById('catalogo');
    catalogoContainer.innerHTML = ''; // Limpiar el catálogo

    let productosAMostrar;
    if (categoria === null) {
      // Si no se selecciona categoría, mostrar todos los productos
      productosAMostrar = productos;
    } else {
      // Si se selecciona una categoría, mostrar solo los productos de esa categoría
      productosAMostrar = productos.filter(producto => producto.categoria === categoria);
    }

    // Ordenar los productos alfabéticamente por nombre
    productosAMostrar.sort((a, b) => a.nombre.localeCompare(b.nombre));

    productosAMostrar.forEach(producto => {
      const productoDiv = document.createElement('div');
      productoDiv.classList.add('producto');
      
      // Crear la galería de imágenes
      const galeriaDiv = document.createElement('div');
      galeriaDiv.classList.add('galeria');

      // Imagen del producto
      const img = document.createElement('img');
      img.src = `images/${producto.imagen}`;
      img.alt = `Imagen de ${producto.nombre}`;
      img.classList.add('imagen-producto');
      galeriaDiv.appendChild(img);
      
      // Crear el nombre y precio del producto
      const nombreProducto = document.createElement('p');
      nombreProducto.textContent = `${producto.nombre} - $${producto.precio}`;

      // Crear los botones de cantidad (con + y -)
      const cantidadDiv = document.createElement('div');
      cantidadDiv.classList.add('cantidad-container');

      const minusButton = document.createElement('button');
      minusButton.textContent = '-';
      minusButton.classList.add('cantidad-btn');
      minusButton.addEventListener('click', () => ajustarCantidad(producto, -1));

      const cantidadInput = document.createElement('span');
      cantidadInput.classList.add('cantidad');
      cantidadInput.textContent = '1'; // Empieza en 1

      const plusButton = document.createElement('button');
      plusButton.textContent = '+';
      plusButton.classList.add('cantidad-btn');
      plusButton.addEventListener('click', () => ajustarCantidad(producto, 1));

      cantidadDiv.appendChild(minusButton);
      cantidadDiv.appendChild(cantidadInput);
      cantidadDiv.appendChild(plusButton);

      // Crear el botón "Agregar al carrito"
      const agregarCarritoButton = document.createElement('button');
      agregarCarritoButton.classList.add('agregar-carrito');
      agregarCarritoButton.textContent = 'Agregar al carrito';
      agregarCarritoButton.addEventListener('click', () => {
        agregarAlCarrito(producto, parseInt(cantidadInput.textContent));
      });

      // Añadir la galería, nombre, cantidad y botón al contenedor del producto
      productoDiv.appendChild(galeriaDiv);
      productoDiv.appendChild(nombreProducto);
      productoDiv.appendChild(cantidadDiv);
      productoDiv.appendChild(agregarCarritoButton);
      
      // Añadir el producto al catálogo
      catalogoContainer.appendChild(productoDiv);
    });
  }

  // Función para ajustar la cantidad
  function ajustarCantidad(producto, cambio) {
    const cantidadSpan = event.target.parentElement.querySelector('.cantidad');
    let cantidad = parseInt(cantidadSpan.textContent);
    cantidad += cambio;
    if (cantidad < 1) cantidad = 1; // Mínimo 1

    cantidadSpan.textContent = cantidad;
  }

  // Función para agregar el producto al carrito
  function agregarAlCarrito(producto, cantidad) {
    const productoConCantidad = { ...producto, cantidad }; // Añadir cantidad al producto
    carrito.push(productoConCantidad); // Añadir el producto al carrito
    mostrarMensajeConfirmacion(); // Mostrar el mensaje temporal
    actualizarCarrito(); // Actualizar el carrito
  }

  // Función para mostrar el mensaje temporal de confirmación
  function mostrarMensajeConfirmacion() {
    const mensaje = document.getElementById('mensajeConfirmacion');
    mensaje.style.display = 'block'; // Mostrar el mensaje
    setTimeout(() => {
      mensaje.style.display = 'none'; // Ocultar el mensaje después de 3 segundos
    }, 3000);
  }

  // Función para eliminar un producto del carrito
  function eliminarDelCarrito(index) {
    carrito.splice(index, 1); // Eliminar el producto del carrito
    actualizarCarrito(); // Actualizar el carrito
  }

  // Función para actualizar el carrito y mostrar el total
  function actualizarCarrito() {
    const carritoResumen = document.getElementById('carrito-resumen');
    carritoResumen.innerHTML = ''; // Limpiar contenido del carrito

    if (carrito.length === 0) {
      carritoResumen.innerHTML = '<li>Tu carrito está vacío.</li>';
      document.getElementById('precio-total').textContent = '0.00'; // Total a 0 cuando está vacío
    } else {
      let total = 0;
      carrito.forEach((producto, index) => {
        const productoItem = document.createElement('li');
        productoItem.textContent = `${producto.nombre} - $${producto.precio} x ${producto.cantidad}`;

        // Agregar el botón de eliminar producto
        const eliminarBtn = document.createElement('button');
        eliminarBtn.textContent = 'Eliminar';
        eliminarBtn.addEventListener('click', () => eliminarDelCarrito(index));
        productoItem.appendChild(eliminarBtn);

        carritoResumen.appendChild(productoItem);

        // Calcular el precio total
        total += parseFloat(producto.precio) * producto.cantidad;
      });
      document.getElementById('precio-total').textContent = total.toFixed(2); // Mostrar precio total actualizado
    }
  }

  // Función para mostrar el contenido del carrito
  function mostrarCarrito() {
    const carritoModal = document.getElementById('carritoModal');
    carritoModal.style.display = 'block'; // Mostrar el modal
    actualizarCarrito(); // Actualizar el carrito
  }

  // Función para cerrar el modal del carrito
  function cerrarModal() {
    document.getElementById('carritoModal').style.display = 'none';
  }

  // Lógica del modal
  document.getElementById('verCarritoBtn').addEventListener('click', mostrarCarrito);
  document.getElementById('cerrarModalBtn').addEventListener('click', cerrarModal);

  // Vaciar el carrito
  document.getElementById('vaciar-carrito').addEventListener('click', () => {
    carrito = []; // Vaciar el carrito
    actualizarCarrito(); // Actualizar el modal
  });

  // Función para parsear el CSV
  function parseCSV(data) {
    const rows = data.split('\n').map(row => row.split(','));
    const productos = [];

    rows.forEach((row, index) => {
      if (index === 0) return; // Ignorar la primera fila de encabezado

      const producto = {
        id: row[0], // ID del producto
        nombre: row[1], // Nombre del producto
        cantidad: row[2], // Cantidad disponible (no la usaremos en el botón)
        unidad: row[3], // Unidad de medida
        categoria: row[4], // Categoría del producto
        imagen: row[5], // Nombre de la imagen del producto
        edicionimagen: row[6],
        tienda: row[7],
        precio: row[11], // Precio del producto
      };
      
      productos.push(producto);
    });

    return productos;
  }

  // Función para buscar productos dentro de la categoría seleccionada
  function buscarProductos(busqueda, productos) {
    // Filtrar productos según la búsqueda y la categoría seleccionada
    let productosAMostrar;
    if (categoriaSeleccionada === null) {
      // Si no hay categoría seleccionada, buscar en todos los productos
      productosAMostrar = productos.filter(producto => 
        producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
      );
    } else {
      // Si hay una categoría seleccionada, buscar solo dentro de esa categoría
      productosAMostrar = productos.filter(producto => 
        producto.categoria === categoriaSeleccionada &&
        producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
      );
    }
    mostrarProductosPorCategoria(categoriaSeleccionada, productosAMostrar); // Actualizar la vista con los productos filtrados
  }
});
