// carrito.js - Gestión del carrito de compras

// Datos de ejemplo de productos
const productos = {
    1: {
        id: 1,
        nombre: "Beauty of Joseon - Sérum Facial Glow Serum Jumbo",
        marca: "Beauty of Joseon",
        precio: 16.17,
        color: "#f0e6d6"
    },
    2: {
        id: 2,
        nombre: "celimax - Sérum Facial The Vita-A Retinal Shot Tightening Booster",
        marca: "celimax",
        precio: 11.88,
        color: "#e6f0f7"
    },
    3: {
        id: 3,
        nombre: "Dr. Althea - Crema Hidratante 345 Relief Cream",
        marca: "Dr. Althea",
        precio: 21.38,
        color: "#f7e6e6"
    },
    4: {
        id: 4,
        nombre: "Punto SEOUL - Crema con Pantenol Mighty Bamboo Panthenol Cream",
        marca: "Punto SEOUL",
        precio: 12.71,
        color: "#e6f7e9"
    },
    5: {
        id: 5,
        nombre: "AP LB - Mascarilla Glutathione Niacinamide Sheet Mask",
        marca: "AP LB",
        precio: 0.98,
        color: "#f0e6f7"
    },
    6: {
        id: 6,
        nombre: "COSRX - Advanced Snail 96 Mucin Power Essence",
        marca: "COSRX",
        precio: 18.50,
        color: "#e6f4f7"
    },
    7: {
        id: 7,
        nombre: "I'm from - Rice Toner & Mugwort Mask Set",
        marca: "I'm from",
        precio: 32.99,
        color: "#f7f0e6"
    },
    8: {
        id: 8,
        nombre: "LANEIGE - Water Sleeping Mask",
        marca: "LANEIGE",
        precio: 25.00,
        color: "#e6e7f7"
    }
};

// Carrito en localStorage
const CARRITO_KEY = 'carrito_belleza_coreana';

// Cargar carrito desde localStorage
function cargarCarrito() {
    const carritoJSON = localStorage.getItem(CARRITO_KEY);
    return carritoJSON ? JSON.parse(carritoJSON) : [];
}

// Guardar carrito en localStorage
function guardarCarrito(carrito) {
    localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
}

// Actualizar contador del carrito en todas las páginas
function actualizarContadorCarrito() {
    const carrito = cargarCarrito();
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    
    // Actualizar badge en todas las páginas
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(badge => {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    });
    
    return totalItems;
}

// Renderizar productos del carrito
function renderizarCarrito() {
    const carrito = cargarCarrito();
    const listaProductos = document.getElementById('listaProductos');
    const carritoVacio = document.getElementById('carritoVacio');
    const carritoConProductos = document.getElementById('carritoConProductos');
    
    // Mostrar/ocultar secciones según si hay productos
    if (carrito.length === 0) {
        carritoVacio.style.display = 'block';
        carritoConProductos.style.display = 'none';
        return;
    }
    
    carritoVacio.style.display = 'none';
    carritoConProductos.style.display = 'grid';
    
    // Limpiar lista
    listaProductos.innerHTML = '';
    
    // Agregar cada producto
    carrito.forEach(item => {
        const producto = productos[item.id];
        if (!producto) return;
        
        const total = producto.precio * item.cantidad;
        
        const itemHTML = `
            <div class="carrito-item" data-id="${producto.id}">
                <div class="carrito-item-imagen" style="background-color: ${producto.color}">
                    ${producto.marca.substring(0, 2)}
                </div>
                
                <div class="carrito-item-info">
                    <div class="carrito-item-nombre">${producto.nombre}</div>
                    <div class="carrito-item-marca">${producto.marca}</div>
                    
                    <div class="carrito-item-cantidad">
                        <button class="cantidad-btn" onclick="cambiarCantidad(${producto.id}, -1)">-</button>
                        <input type="number" class="cantidad-input" value="${item.cantidad}" min="1" 
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
        
        listaProductos.innerHTML += itemHTML;
    });
    
    // Actualizar resumen
    actualizarResumen();
}

// Actualizar resumen de compra (SIN ENVÍO)
function actualizarResumen() {
    const carrito = cargarCarrito();
    
    // Calcular subtotal
    const subtotal = carrito.reduce((total, item) => {
        const producto = productos[item.id];
        return total + (producto.precio * item.cantidad);
    }, 0);
    
    // Total es igual al subtotal (sin envío)
    const total = subtotal;
    
    // Actualizar DOM
    document.getElementById('subtotal').textContent = `US$ ${subtotal.toFixed(2)}`;
    document.getElementById('envio').textContent = 'GRATIS';
    document.getElementById('total').textContent = `US$ ${total.toFixed(2)}`;
    
    // Aplicar estilo al envío gratis
    const envioElement = document.getElementById('envio');
    envioElement.style.color = '#4CAF50';
    envioElement.style.fontWeight = '600';
}

// Cambiar cantidad de un producto
function cambiarCantidad(productId, cambio) {
    let carrito = cargarCarrito();
    const index = carrito.findIndex(item => item.id === productId);
    
    if (index !== -1) {
        carrito[index].cantidad += cambio;
        
        // Si la cantidad es menor a 1, eliminar producto
        if (carrito[index].cantidad < 1) {
            carrito.splice(index, 1);
        }
        
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
        
        if (cantidad > 0) {
            carrito[index].cantidad = cantidad;
            guardarCarrito(carrito);
            actualizarContadorCarrito();
            renderizarCarrito();
        } else {
            // Si es 0 o negativo, eliminar producto
            carrito.splice(index, 1);
            guardarCarrito(carrito);
            actualizarContadorCarrito();
            renderizarCarrito();
        }
    }
}

// Eliminar producto del carrito (SIN mensaje de confirmación)
function eliminarProducto(productId) {
    let carrito = cargarCarrito();
    carrito = carrito.filter(item => item.id !== productId);
    
    guardarCarrito(carrito);
    actualizarContadorCarrito();
    renderizarCarrito();
}

// Vaciar carrito completo
function vaciarCarrito() {
    localStorage.removeItem(CARRITO_KEY);
    actualizarContadorCarrito();
    renderizarCarrito();
}

// Agregar producto al carrito (desde index.html)
function agregarAlCarrito(productId) {
    let carrito = cargarCarrito();
    const index = carrito.findIndex(item => item.id === productId);
    
    if (index !== -1) {
        // Si ya existe, incrementar cantidad
        carrito[index].cantidad += 1;
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
document.addEventListener('DOMContentLoaded', function() {
    console.log('🛒 Inicializando carrito...');
    
    // Actualizar contador
    actualizarContadorCarrito();
    
    // Si estamos en la página del carrito, renderizar
    if (window.location.pathname.includes('carrito.html')) {
        renderizarCarrito();
        
        // Configurar continuar comprando
        const btnContinuar = document.querySelector('.continuar-comprando');
        if (btnContinuar) {
            btnContinuar.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'index.html';
            });
        }
    }
    
    console.log('✅ Carrito inicializado');
});