// script.js - VERSIÓN para archivos JSON en RAÍZ

// Variables globales
let productosData = null;
let carritoCount = 0;

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM cargado - Iniciando script...');
    
    // 1. PRIMERO: Cargar los datos del JSON
    cargarDatosProductos();
    
    // 2. Configurar navbar para dispositivos móviles
    configurarNavbar();
    
    // 3. Configurar funcionalidades del carrito y búsqueda
    configurarInteracciones();
});

// =================== FUNCIÓN PRINCIPAL PARA CARGAR DATOS ===================
async function cargarDatosProductos() {
    try {
        console.log('📦 Cargando datos de productos...');
        console.log('📍 Archivos en raíz: products.json');
        
        // RUTAS PARA ARCHIVOS EN RAÍZ
        const rutasPosibles = [
            './products.json',      // ✅ En la raíz (relativo)
            'products.json',        // ✅ En la raíz 
            '/products.json',       // ✅ Desde raíz absoluta
            'products.json?v=' + Date.now()  // ✅ Para evitar cache
        ];
        
        let data = null;
        let rutaExito = null;
        
        // Intentar cada ruta posible
        for (const ruta of rutasPosibles) {
            try {
                console.log(`🔄 Intentando ruta: ${ruta}`);
                const response = await fetch(ruta);
                
                if (response.ok) {
                    const text = await response.text();
                    console.log(`✅ Éxito cargando desde: ${ruta}`);
                    
                    // Verificar que no esté vacío
                    if (text.trim() === '') {
                        console.log('⚠️ Archivo vacío');
                        continue;
                    }
                    
                    // Parsear JSON
                    data = JSON.parse(text);
                    rutaExito = ruta;
                    console.log(`📊 Productos encontrados: ${data.productos ? data.productos.length : 0}`);
                    
                    // Mostrar info del primer producto
                    if (data.productos && data.productos.length > 0) {
                        console.log('⭐ Primer producto:', data.productos[0].nombre);
                    }
                    
                    break;
                } else {
                    console.log(`❌ Ruta ${ruta} - Status: ${response.status}`);
                }
            } catch (error) {
                console.log(`❌ Error en ruta ${ruta}:`, error.message);
            }
        }
        
        // Si no se cargó ningún archivo
        if (!data) {
            // Intentar carga de emergencia con datos embebidos
            console.log('🆘 Usando datos de emergencia...');
            data = obtenerDatosEmergencia();
        }
        
        // Guardar datos globalmente
        productosData = data;
        
        // Verificar si tenemos productos
        if (data.productos && data.productos.length > 0) {
            console.log(`🎯 ${data.productos.length} productos listos (desde: ${rutaExito || 'embebidos'})`);
            
            // A. Cargar producto destacado
            cargarProductoDestacado(data.productos);
            
            // B. Cargar productos recomendados
            cargarProductosRecomendados(data.productos);
            
        } else {
            console.warn('⚠️ No se encontraron productos');
            mostrarErrorCarga('No hay productos disponibles.');
        }
        
    } catch (error) {
        console.error('❌ Error cargando productos:', error);
        // Intentar con datos de emergencia
        const dataEmergencia = obtenerDatosEmergencia();
        productosData = dataEmergencia;
        cargarProductoDestacado(dataEmergencia.productos);
        cargarProductosRecomendados(dataEmergencia.productos);
    }
}

// =================== DATOS DE EMERGENCIA (si falla el JSON) ===================
function obtenerDatosEmergencia() {
    console.log('🚨 Usando datos de emergencia embebidos');
    return {
        "productos": [
            {
                "id": 1,
                "nombre": "Beauty of Joseon - Sérum Facial Glow Serum Jumbo",
                "marca": "Beauty of Joseon",
                "categoria": "Sérums Faciales",
                "precio": 16.17,
                "precioOriginal": null,
                "descuento": null,
                "descripcion": "Mejora la piel apagada con este potente sérum facial infusionado con un 60% de propolis y 2% de medianmida para atacar la inflamación, controlar la producción de sebos y tratar la hiperpigmentación mientras mantiene los niveles de humectación altos. La textura, rica como miel, se absorbe fácilmente en la piel sin dejar una sensación pegajosa.",
                "destacado": true
            },
            {
                "id": 2,
                "nombre": "celimax - Sérum Facial The Vita-A Retinal Shot Tightening Booster",
                "marca": "celimax",
                "categoria": "Sérums Faciales",
                "precio": 11.88,
                "precioOriginal": null,
                "descuento": null,
                "descripcion": "Sérum con retinal para tensado y firmeza de la piel. Formulado con ingredientes activos que ayudan a mejorar la elasticidad y reducir la apariencia de líneas finas.",
                "destacado": false
            },
            {
                "id": 3,
                "nombre": "Dr. Althea - Crema Hidratante 345 Relief Cream",
                "marca": "Dr. Althea",
                "categoria": "Cremas Hidratantes",
                "precio": 21.38,
                "precioOriginal": null,
                "descuento": null,
                "descripcion": "Crema hidratante con aloe vera para piel sensible. Proporciona hidratación intensiva mientras calma la piel irritada o enrojecida.",
                "destacado": false
            },
            {
                "id": 4,
                "nombre": "Punto SEOUL - Crema con Pantenol Mighty Bamboo Panthenol Cream",
                "marca": "Punto SEOUL",
                "categoria": "Cremas Hidratantes",
                "precio": 12.71,
                "precioOriginal": null,
                "descuento": null,
                "descripcion": "Crema con pantenol para hidratación intensiva. Ideal para pieles secas que necesitan una hidratación profunda y prolongada.",
                "destacado": false
            },
            {
                "id": 5,
                "nombre": "AP LB - Mascarilla Glutathione Niacinamide Sheet Mask",
                "marca": "AP LB",
                "categoria": "Mascarillas",
                "precio": 0.98,
                "precioOriginal": null,
                "descuento": null,
                "descripcion": "Mascarilla facial con glutathione y niacinamida. Ayuda a iluminar la piel y unificar el tono mientras proporciona hidratación intensiva.",
                "destacado": false
            }
        ]
    };
}

// =================== FUNCIONES PARA CARGAR PRODUCTOS ===================
function cargarProductoDestacado(productos) {
    console.log('🛒 Buscando producto destacado...');
    console.log('📊 Recibidos:', productos.length, 'productos');
    
    // Buscar producto destacado
    let productoDestacado = productos.find(p => p.destacado === true);
    
    // Si no hay ninguno destacado, usar el primero
    if (!productoDestacado) {
        productoDestacado = productos[0];
        console.log('ℹ️ No hay producto destacado, usando el primero:', productoDestacado.nombre);
    } else {
        console.log('⭐ Producto destacado encontrado:', productoDestacado.nombre);
    }
    
    if (productoDestacado) {
        // Actualizar título
        const tituloElement = document.querySelector('.product-title');
        if (tituloElement) {
            tituloElement.textContent = productoDestacado.nombre;
            console.log('📝 Título actualizado');
        } else {
            console.error('❌ No se encontró .product-title');
        }
        
        // Actualizar precio (SOLO PRECIO ACTUAL)
        const precioElement = document.querySelector('.product-price');
        if (precioElement) {
            let precioHTML = `<span class="current-price">US$ ${productoDestacado.precio.toFixed(2)}</span>`;
            
            precioElement.innerHTML = precioHTML;
            console.log('💰 Precio actualizado (sin descuentos)');
        } else {
            console.error('❌ No se encontró .product-price');
        }
        
        // Actualizar descripción
        const descripcionElement = document.querySelector('.editor-note p');
        if (descripcionElement && productoDestacado.descripcion) {
            descripcionElement.textContent = productoDestacado.descripcion;
            console.log('📄 Descripción actualizada');
        } else {
            console.error('❌ No se encontró .editor-note p');
        }
        
        // Actualizar imagen
        const imagenElement = document.querySelector('.product-image');
        if (imagenElement) {
            const colorFondo = getColorPorMarca(productoDestacado.marca);
            imagenElement.innerHTML = `
                <div style="background-color: ${colorFondo}; height: 300px; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
                    <span style="color: rgba(0,0,0,0.5); font-size: 18px; font-weight: bold;">${productoDestacado.marca}</span>
                </div>
            `;
            console.log('🖼️ Imagen actualizada');
        } else {
            console.error('❌ No se encontró .product-image');
        }
    }
}

function cargarProductosRecomendados(productos) {
    console.log('📱 Cargando productos recomendados...');
    
    const gridElement = document.querySelector('.products-grid');
    if (!gridElement) {
        console.error('❌ No se encontró .products-grid');
        // Intentar crear el elemento si no existe
        const container = document.querySelector('.featured-products .container');
        if (container) {
            const newGrid = document.createElement('div');
            newGrid.className = 'products-grid';
            container.appendChild(newGrid);
            console.log('✅ Creado .products-grid nuevo');
            return cargarProductosRecomendados(productos); // Reintentar
        }
        return;
    }
    
    console.log('✅ .products-grid encontrado');
    
    // Limpiar contenido existente (solo si tiene hijos)
    if (gridElement.children.length > 0) {
        console.log('🧹 Limpiando productos existentes...');
        gridElement.innerHTML = '';
    }
    
    // Filtrar productos no destacados
    let productosParaMostrar = productos.filter(p => !p.destacado || p.destacado === false);
    
    // Si no tenemos suficientes productos no destacados, mezclar con destacados
    if (productosParaMostrar.length < 5) {
        console.log(`ℹ️ Solo ${productosParaMostrar.length} productos no destacados, usando primeros 5`);
        productosParaMostrar = productos.slice(0, 5);
    } else {
        productosParaMostrar = productosParaMostrar.slice(0, 5);
    }
    
    console.log(`🛍️ Mostrando ${productosParaMostrar.length} productos recomendados`);
    
    // Crear tarjetas para cada producto con botones de detalles
    productosParaMostrar.forEach((producto, index) => {
        const colorFondo = getColorPorMarca(producto.marca);
        
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.dataset.id = producto.id;
        
        // Hacer la tarjeta clickable
        productCard.style.cursor = 'pointer';
        productCard.addEventListener('click', function(e) {
            if (!e.target.closest('button')) {
                abrirModalProducto(producto.id);
            }
        });
        
        productCard.innerHTML = `
            <div class="product-card-image" style="background-color: ${colorFondo}">
                ${producto.marca}
            </div>
            
            <div class="product-card-info">
                <h3 class="product-card-title">${producto.nombre}</h3>
                
                <div class="product-card-price">
                    <span class="product-current-price">US$ ${producto.precio.toFixed(2)}</span>
                </div>
                
                <div class="product-card-actions">
                    <button class="btn-view-details">VER DETALLES</button>
                    <button class="btn-add">AGREGAR A LA CESTA</button>
                </div>
            </div>
        `;
        
        gridElement.appendChild(productCard);
        console.log(`✅ Producto ${index + 1} añadido: ${producto.nombre.substring(0, 30)}...`);
    });
    
    // Re-configurar los eventos
    setTimeout(() => {
        configurarBotonesCarrito();
        configurarBotonesDetalles();
        console.log('✅ Botones configurados');
    }, 100);
}

// =================== FUNCIONES DE NAVBAR ===================
function configurarNavbar() {
    console.log('🔧 Configurando navbar...');
    
    const navItems = document.querySelectorAll('.nav-item');
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice) {
        console.log('📱 Dispositivo táctil detectado');
        
        navItems.forEach(item => {
            const link = item.querySelector('.nav-link');
            
            link.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    const dropdown = item.querySelector('.dropdown-menu');
                    
                    document.querySelectorAll('.dropdown-menu').forEach(d => {
                        if (d !== dropdown) d.style.display = 'none';
                    });
                    
                    if (dropdown.style.display === 'block') {
                        dropdown.style.display = 'none';
                    } else {
                        dropdown.style.display = 'block';
                    }
                }
            });
        });
        
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.nav-item')) {
                document.querySelectorAll('.dropdown-menu').forEach(d => {
                    d.style.display = 'none';
                });
            }
        });
    }
    
    if (!isTouchDevice) {
        console.log('💻 Modo desktop detectado');
        
        navItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                const dropdown = this.querySelector('.dropdown-menu');
                dropdown.style.display = 'block';
            });
            
            item.addEventListener('mouseleave', function() {
                const dropdown = this.querySelector('.dropdown-menu');
                dropdown.style.display = 'none';
            });
        });
    }
    
    console.log('✅ Navbar configurado');
}

// =================== FUNCIONES DE INTERACCIÓN ===================
function configurarInteracciones() {
    console.log('⚙️ Configurando interacciones...');
    configurarBotonesCarrito();
    configurarBotonesDetalles();
    configurarBusqueda();
    console.log('✅ Interacciones configuradas');
}

function configurarBotonesCarrito() {
    const addToCartButtons = document.querySelectorAll('.btn-add');
    console.log(`🛒 Encontrados ${addToCartButtons.length} botones de carrito`);
    
    addToCartButtons.forEach(button => {
        // Eliminar eventos anteriores
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
    });
    
    // Volver a seleccionar después de clonar
    document.querySelectorAll('.btn-add').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const productCard = this.closest('.product-card');
            const productInfo = this.closest('.product-info');
            let productId = null;
            
            if (productCard) {
                productId = productCard.dataset.id;
            } else if (productInfo) {
                // Para el producto destacado
                productId = 1; // Asumimos que el destacado es ID 1
            }
            
            if (productId) {
                agregarAlCarrito(productId, this);
            }
        });
    });
}

function configurarBotonesDetalles() {
    const viewButtons = document.querySelectorAll('.btn-view-details');
    console.log(`👁️ Encontrados ${viewButtons.length} botones de detalles`);
    
    viewButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const productCard = this.closest('.product-card');
            const productId = productCard.dataset.id;
            if (productId) {
                abrirModalProducto(parseInt(productId));
            }
        });
    });
}

function configurarBusqueda() {
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');
    
    if (searchInput && searchButton) {
        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') performSearch();
        });
        console.log('🔍 Búsqueda configurada');
    }
}

function performSearch() {
    const searchInput = document.querySelector('.search-bar input');
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm) {
        console.log(`🔍 Buscando: "${searchTerm}"`);
        // En una implementación real, aquí se filtrarían los productos
        alert(`Buscando: "${searchTerm}"\n\nEn una versión completa, aquí se mostrarían los resultados de búsqueda.`);
    }
}

// =================== FUNCIONES DE MODAL ===================
function abrirModalProducto(productId) {
    console.log(`📱 Abriendo modal para producto ${productId}`);
    
    // Buscar el producto en los datos
    const producto = productosData?.productos?.find(p => p.id === productId);
    
    if (!producto) {
        console.error('❌ Producto no encontrado:', productId);
        return;
    }
    
    const colorFondo = getColorPorMarca(producto.marca);
    
    // Crear contenido del modal
    const modalHTML = `
        <div class="product-modal">
            <button class="modal-close" onclick="cerrarModalProducto()">×</button>
            <div class="modal-content">
                <div class="modal-product-info">
                    <div class="modal-product-image">
                        <div style="background-color: ${colorFondo}; height: 300px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                            <span style="color: rgba(0,0,0,0.5); font-size: 18px; font-weight: bold;">${producto.marca}</span>
                        </div>
                    </div>
                    <div class="modal-product-details">
                        <h2 class="modal-product-title">${producto.nombre}</h2>
                        <div class="modal-product-price">US$ ${producto.precio.toFixed(2)}</div>
                        
                        <div class="action-buttons">
                            <button class="btn-add" onclick="agregarAlCarritoDesdeModal(${productId})">
                                AGREGAR A LA CESTA
                            </button>
                        </div>
                        
                        <div class="modal-description">
                            <h3>Descripción del Producto</h3>
                            <p>${producto.descripcion}</p>
                            <p style="margin-top: 10px; font-size: 14px;">Formulado usando solamente ingredientes certificados EWG, apto para pieles sensibles.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Crear o actualizar el contenedor del modal
    let modalContainer = document.getElementById('productModal');
    if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.id = 'productModal';
        modalContainer.className = 'product-modal-overlay';
        document.body.appendChild(modalContainer);
    }
    
    modalContainer.innerHTML = modalHTML;
    modalContainer.style.display = 'flex';
    
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';
    
    // Cerrar modal al hacer clic fuera
    modalContainer.addEventListener('click', function(e) {
        if (e.target === this) {
            cerrarModalProducto();
        }
    });
}

function cerrarModalProducto() {
    const modalContainer = document.getElementById('productModal');
    if (modalContainer) {
        modalContainer.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function agregarAlCarritoDesdeModal(productId) {
    console.log(`🛒 Producto ${productId} agregado desde modal`);
    agregarAlCarrito(productId);
    cerrarModalProducto();
}

// =================== FUNCIONES DE CARRITO ===================
function agregarAlCarrito(productId, buttonElement = null) {
    console.log(`🛒 Agregando producto ${productId} al carrito`);
    
    // Incrementar contador global
    carritoCount++;
    
    // Actualizar badge visual
    actualizarContadorCarrito();
    
    // Animación del botón si se proporcionó
    if (buttonElement) {
        const originalText = buttonElement.textContent;
        buttonElement.textContent = '¡AGREGADO!';
        buttonElement.style.backgroundColor = '#4CAF50';
        buttonElement.style.color = 'white';
        
        setTimeout(() => {
            buttonElement.textContent = originalText;
            buttonElement.style.backgroundColor = '#333';
            buttonElement.style.color = 'white';
        }, 1500);
    }
    
    // En una implementación real, aquí guardarías el producto en el carrito
    console.log(`🛒 Carrito: ${carritoCount} productos`);
}

function actualizarContadorCarrito() {
    const cartIcon = document.querySelector('.fa-shopping-cart');
    if (!cartIcon) return;
    
    const cartContainer = cartIcon.parentElement;
    
    // Crear o actualizar el badge
    let badge = cartContainer.querySelector('.cart-badge');
    if (!badge) {
        badge = document.createElement('span');
        badge.className = 'cart-badge';
        badge.style.cssText = `
            position: absolute;
            top: -8px;
            right: -8px;
            background-color: #d97777;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        `;
        cartContainer.style.position = 'relative';
        cartContainer.appendChild(badge);
    }
    
    // Actualizar contador
    badge.textContent = carritoCount;
    console.log(`🛒 Badge actualizado: ${carritoCount} productos`);
}

// =================== FUNCIONES AUXILIARES ===================
function getColorPorMarca(marca) {
    const coloresMarcas = {
        'Beauty of Joseon': '#f0e6d6',
        'celimax': '#e6f0f7',
        'Dr. Althea': '#f7e6e6',
        'Punto SEOUL': '#e6f7e9',
        'AP LB': '#f0e6f7',
        'COSRX': '#e6f4f7',
        'I\'m from': '#f7f0e6',
        'LANEIGE': '#e6e7f7',
        'default': '#f5f5f5'
    };
    
    return coloresMarcas[marca] || coloresMarcas.default;
}

function mostrarErrorCarga(mensaje) {
    console.error('❌ Mostrando error al usuario:', mensaje);
    
    const productosGrid = document.querySelector('.products-grid');
    if (productosGrid) {
        productosGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <p style="color: #666; margin-bottom: 20px;">
                    ⚠️ No se pudieron cargar los productos. 
                    <br><small>Error: ${mensaje || 'Desconocido'}</small>
                </p>
                <button onclick="cargarDatosProductos()" style="
                    background-color: #333;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin: 5px;
                ">
                    Reintentar
                </button>
                <button onclick="location.reload()" style="
                    background-color: #d97777;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin: 5px;
                ">
                    Recargar Página
                </button>
            </div>
        `;
    }
}

// =================== FUNCIONES GLOBALES PARA HTML ===================
// Estas funciones son llamadas desde los atributos onclick del HTML
window.agregarAlCarritoDestacado = function() {
    agregarAlCarrito(1, event.target);
};

// =================== DEBUG INICIAL ===================
console.log('🎯 script.js cargado correctamente');
console.log('📍 URL actual:', window.location.href);
console.log('📁 Archivos esperados en raíz: products.json');
console.log('🕐 Hora:', new Date().toLocaleTimeString());