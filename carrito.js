// carrito.js - Gestión del carrito de compras - VERSIÓN MEJORADA

// CARRITO_KEY para localStorage
const CARRITO_KEY = 'carrito_belleza_coreana';
let productosCache = {}; // Cache para productos

// Cargar productos desde JSON
async function cargarProductosDesdeJSON() {
    try {
        // Intentar varias rutas posibles
        const rutas = [
            './products.json',
            'products.json',
            '/products.json',
            'products.json?v=' + Date.now()
        ];
        
        for (const ruta of rutas) {
            try {
                const response = await fetch(ruta);
                if (response.ok) {
                    const data = await response.json();
                    // Convertir array a objeto con id como key
                    const productosObj = {};
                    data.productos.forEach(producto => {
                        productosObj[producto.id] = producto;
                    });
                    productosCache = productosObj;
                    console.log(`✅ ${Object.keys(productosCache).length} productos cargados desde JSON`);
                    return productosObj;
                }
            } catch (error) {
                console.log(`❌ Error cargando ${ruta}:`, error.message);
            }
        }
        
        // Si no se puede cargar, usar datos mínimos de emergencia
        console.warn('⚠️ Usando datos mínimos de emergencia');
        productosCache = {
            1: { id: 1, nombre: "Producto de emergencia", marca: "Emergencia", precio: 10.00, color: "#f5f5f5" }
        };
        return productosCache;
        
    } catch (error) {
        console.error('❌ Error crítico cargando productos:', error);
        return {};
    }
}

// Obtener producto (carga dinámica si no está en cache)
async function obtenerProducto(id) {
    // Si ya está en cache, devolverlo
    if (productosCache[id]) {
        return productosCache[id];
    }
    
    // Si no está en cache, intentar cargar productos
    await cargarProductosDesdeJSON();
    
    // Si después de cargar sigue sin estar, crear producto dummy
    if (!productosCache[id]) {
        console.warn(`⚠️ Producto ID ${id} no encontrado en JSON`);
        productosCache[id] = {
            id: id,
            nombre: `Producto #${id}`,
            marca: "Desconocida",
            precio: 10.00,
            color: "#f5f5f5",
            categoria: "Sin categoría",
            descripcion: "Producto no encontrado en la base de datos"
        };
    }
    
    return productosCache[id];
}

// Cargar carrito desde localStorage
function cargarCarrito() {
    const carritoJSON = localStorage.getItem(CARRITO_KEY);
    if (!carritoJSON) return [];
    
    try {
        const carrito = JSON.parse(carritoJSON);
        return Array.isArray(carrito) ? carrito : [];
    } catch (error) {
        console.error('Error parseando carrito:', error);
        return [];
    }
}

// Guardar carrito en localStorage
function guardarCarrito(carrito) {
    localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
}

// Actualizar contador del carrito en todas las páginas
function actualizarContadorCarrito() {
    const carrito = cargarCarrito();
    const totalItems = carrito.reduce((total, item) => total + (item.cantidad || 0), 0);
    
    // Actualizar badge en todas las páginas
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(badge => {
        if (badge) {
            badge.textContent = totalItems;
            badge.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    });
    
    return totalItems;
}

// Función auxiliar para obtener color por categoría
function getColorPorCategoria(categoria) {
    if (!categoria) return '#f5f5f5';
    
    const colores = {
        'Sérums Faciales': '#e6f0f7',
        'Cremas Hidratantes': '#f7e6e6',
        'Cremas Faciales': '#f7f0e6',
        'Limpieza Facial': '#e6f7e9',
        'Esencias': '#f7e6f7',
        'Ampollas': '#e6e7f7',
        'Mascarillas': '#f0e6f7',
        'Tónicos': '#e6f4f7',
        'default': '#f5f5f5'
    };
    
    for (const [key, color] of Object.entries(colores)) {
        if (categoria.includes(key)) return color;
    }
    return colores.default;
}

// Renderizar productos del carrito
async function renderizarCarrito() {
    console.log('🔄 Renderizando carrito...');
    
    const carrito = cargarCarrito();
    const listaProductos = document.getElementById('listaProductos');
    const carritoVacio = document.getElementById('carritoVacio');
    const carritoConProductos = document.getElementById('carritoConProductos');
    
    // Mostrar/ocultar secciones según si hay productos
    if (carrito.length === 0) {
        if (carritoVacio) carritoVacio.style.display = 'block';
        if (carritoConProductos) carritoConProductos.style.display = 'none';
        
        // Ocultar botón de vaciar carrito
        const btnVaciar = document.getElementById('btnVaciarCarrito');
        if (btnVaciar) btnVaciar.style.display = 'none';
        
        return;
    }
    
    if (carritoVacio) carritoVacio.style.display = 'none';
    if (carritoConProductos) carritoConProductos.style.display = 'grid';
    
    // Limpiar lista
    if (listaProductos) listaProductos.innerHTML = '';
    
    let subtotal = 0;
    
    // Agregar cada producto (usando async/await para cargar productos)
    for (const item of carrito) {
        const producto = await obtenerProducto(item.id);
        
        if (!producto) {
            console.warn(`Producto ID ${item.id} no disponible, saltando...`);
            continue;
        }
        
        const total = producto.precio * item.cantidad;
        subtotal += total;
        
        // Color basado en categoría
        const colorFondo = producto.color || getColorPorCategoria(producto.categoria);
        const imagenUrl = producto.imagen || null;
        
        const itemHTML = `
            <div class="carrito-item" data-id="${producto.id}">
                <div class="carrito-item-imagen" style="background-color: ${colorFondo}">
                    ${imagenUrl ? 
                        `<img src="${imagenUrl}" alt="${producto.nombre}" 
                              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` 
                        : 
                        `<div class="image-placeholder">${producto.marca.substring(0, 2)}</div>`
                    }
                </div>
                
                <div class="carrito-item-info">
                    <div class="carrito-item-nombre">${producto.nombre}</div>
                    <div class="carrito-item-marca">${producto.marca}${producto.categoria ? ' • ' + producto.categoria : ''}</div>
                    
                    <div class="carrito-item-cantidad">
                        <button class="cantidad-btn" onclick="cambiarCantidad(${producto.id}, -1)">-</button>
                        <input type="number" class="cantidad-input" value="${item.cantidad}" min="1" max="99"
                               onchange="actualizarCantidad(${producto.id}, this.value)">
                        <button class="cantidad-btn" onclick="cambiarCantidad(${producto.id}, 1)">+</button>
                    </div>
                    
                    <button class="eliminar-item" onclick="eliminarProducto(${producto.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
                
                <div class="carrito-item-precio">
                    <div class="precio-unitario">US$ ${producto.precio.toFixed(2)} c/u</div>
                    <div class="precio-total">US$ ${total.toFixed(2)}</div>
                </div>
            </div>
        `;
        
        if (listaProductos) listaProductos.innerHTML += itemHTML;
    }
    
    // Actualizar resumen
    actualizarResumen(subtotal);
    
    // Mostrar botón de vaciar carrito
    agregarBotonVaciarCarrito();
    
    console.log('✅ Carrito renderizado correctamente');
}

// Actualizar resumen de compra
function actualizarResumen(subtotal) {
    // Total es igual al subtotal (sin envío)
    const total = subtotal;
    const TASA_CAMBIO = 7.66; // USD a GTQ
    
    // Actualizar DOM si los elementos existen
    const subtotalElement = document.getElementById('subtotal');
    const envioElement = document.getElementById('envio');
    const totalElement = document.getElementById('total');
    const totalQuetzalesElement = document.getElementById('totalQuetzales');
    
    if (subtotalElement) subtotalElement.textContent = `US$ ${subtotal.toFixed(2)}`;
    
    if (envioElement) {
        envioElement.textContent = 'GRATIS';
        envioElement.style.color = '#4CAF50';
        envioElement.style.fontWeight = '600';
    }
    
    if (totalElement) totalElement.textContent = `US$ ${total.toFixed(2)}`;
    
    if (totalQuetzalesElement) {
        const totalGTQ = total * TASA_CAMBIO;
        totalQuetzalesElement.textContent = `Q ${totalGTQ.toFixed(2)}`;
    }
}

// Cambiar cantidad de un producto
function cambiarCantidad(productId, cambio) {
    let carrito = cargarCarrito();
    const index = carrito.findIndex(item => item.id === productId);
    
    if (index !== -1) {
        const nuevaCantidad = carrito[index].cantidad + cambio;
        
        if (nuevaCantidad < 1) {
            // Si la cantidad es menor a 1, eliminar producto
            eliminarProducto(productId);
            return;
        }
        
        if (nuevaCantidad > 99) {
            alert('La cantidad máxima por producto es 99');
            return;
        }
        
        carrito[index].cantidad = nuevaCantidad;
        guardarCarrito(carrito);
        actualizarContadorCarrito();
        renderizarCarrito();
    }
}

// Actualizar cantidad desde input
function actualizarCantidad(productId, nuevaCantidad) {
    let carrito = cargarCarrito();
    const index = carrito.findIndex(item => item.id === productId);
    
    if (index !== -1) {
        const cantidad = parseInt(nuevaCantidad);
        
        if (isNaN(cantidad) || cantidad < 1) {
            eliminarProducto(productId);
            return;
        }
        
        if (cantidad > 99) {
            alert('La cantidad máxima por producto es 99');
            renderizarCarrito(); // Refrescar para mostrar valor anterior
            return;
        }
        
        carrito[index].cantidad = cantidad;
        guardarCarrito(carrito);
        actualizarContadorCarrito();
        renderizarCarrito();
    }
}

// Eliminar producto del carrito
function eliminarProducto(productId) {
    let carrito = cargarCarrito();
    carrito = carrito.filter(item => item.id !== productId);
    
    guardarCarrito(carrito);
    actualizarContadorCarrito();
    renderizarCarrito();
}

// Vaciar carrito completo
function vaciarCarrito() {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        localStorage.removeItem(CARRITO_KEY);
        actualizarContadorCarrito();
        renderizarCarrito();
    }
}

// Agregar botón para vaciar carrito
function agregarBotonVaciarCarrito() {
    const carritoHeader = document.querySelector('.carrito-header-buttons');
    if (!carritoHeader) return;
    
    let btnVaciar = document.getElementById('btnVaciarCarrito');
    const carrito = cargarCarrito();
    
    if (carrito.length > 0) {
        if (!btnVaciar) {
            btnVaciar = document.createElement('button');
            btnVaciar.id = 'btnVaciarCarrito';
            btnVaciar.innerHTML = '<i class="fas fa-trash"></i> Vaciar carrito';
            btnVaciar.onclick = vaciarCarrito;
            carritoHeader.appendChild(btnVaciar);
        }
        btnVaciar.style.display = 'inline-flex';
    } else if (btnVaciar) {
        btnVaciar.style.display = 'none';
    }
}

// Agregar producto al carrito (desde index.html)
function agregarAlCarrito(productId) {
    console.log(`🛒 Agregando producto ${productId} al carrito`);
    
    let carrito = cargarCarrito();
    const index = carrito.findIndex(item => item.id === productId);
    
    if (index !== -1) {
        // Si ya existe, incrementar cantidad (máximo 99)
        if (carrito[index].cantidad < 99) {
            carrito[index].cantidad += 1;
        } else {
            alert('Has alcanzado el límite máximo de 99 unidades para este producto');
            return carrito;
        }
    } else {
        // Si no existe, agregar nuevo
        carrito.push({
            id: productId,
            cantidad: 1
        });
    }
    
    guardarCarrito(carrito);
    actualizarContadorCarrito();
    
    // Si estamos en la página del carrito, actualizar vista
    if (window.location.pathname.includes('carrito.html')) {
        renderizarCarrito();
    }
    
    return carrito;
}

// Inicializar carrito al cargar la página
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🛒 Inicializando carrito...');
    
    // Precargar productos para el cache
    await cargarProductosDesdeJSON();
    
    // Actualizar contador
    actualizarContadorCarrito();
    
    // Si estamos en la página del carrito, renderizar
    if (window.location.pathname.includes('carrito.html')) {
        await renderizarCarrito();
        
        // Configurar continuar comprando
        const btnContinuar = document.querySelector('.continuar-comprando');
        if (btnContinuar) {
            btnContinuar.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'index.html';
            });
        }
    }
    
    console.log('✅ Carrito inicializado correctamente');
});

// Hacer funciones disponibles globalmente
window.cambiarCantidad = cambiarCantidad;
window.actualizarCantidad = actualizarCantidad;
window.eliminarProducto = eliminarProducto;
window.vaciarCarrito = vaciarCarrito;
window.agregarAlCarrito = agregarAlCarrito;