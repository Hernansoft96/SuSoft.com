// ======================================
// CATÁLOGO DE PRODUCTOS
// ======================================

// ======================================
// CATÁLOGO DE PRODUCTOS DESDE MONGODB
// ======================================

let products = [];

async function loadProducts() {

    try {

        const response = await fetch(
            "http://localhost:3000/api/productos"
        );

        if (!response.ok) {
            throw new Error("No se pudieron cargar los productos.");
        }

        const data = await response.json();

        
products = data
    .filter(product => product.activo)
    .map(product => ({

        id: product._id,
        name: product.nombre,
        description: product.descripcion,
        price: product.precio,
        category: product.categoria,
        image: product.imagen,
        stock: product.stock,
        tag: "Disponible"

    }));

        renderProducts();

        console.log("Productos cargados desde MongoDB:", products);

    } catch (error) {

        console.error("Error al cargar productos:", error);

        productGrid.innerHTML = `
            <div class="empty-results">
                <h3>No pudimos cargar los productos.</h3>
                <p>Verifica que el servidor backend esté funcionando.</p>
            </div>
        `;

    }

}



// ======================================
// ESTADO INICIAL
// ======================================

let selectedCategory = "Todos";

let cart = [];

function getCartStorageKey() {

    const usuario = JSON.parse(
        localStorage.getItem("susoft-user")
    );

    if (usuario && usuario.id) {
        return `susoft-cart-${usuario.id}`;
    }

    return "susoft-cart-invitado";
}

function loadCart() {

    try {

        const savedCart = localStorage.getItem(getCartStorageKey());

        cart = savedCart ? JSON.parse(savedCart) : [];

        if (!Array.isArray(cart)) {
            cart = [];
        }

    } catch (error) {

        console.error("No se pudo recuperar el carrito:", error);
        cart = [];

    }
}

loadCart();

// ======================================
// ELEMENTOS DEL HTML
// ======================================

const productGrid = document.getElementById("product-grid");
const searchInput = document.getElementById("search-input");
const categories = document.getElementById("categories");

const cartCount = document.getElementById("cart-count");
const cartButton = document.getElementById("cart-button");
const cartDialog = document.getElementById("cart-dialog");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const closeCart = document.getElementById("close-cart");
const confirmOrderButton = document.getElementById("confirm-order");

const toast = document.getElementById("toast");


// ======================================
// FORMATO DE PRECIOS
// ======================================

const formatPrice = (price) =>
    new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    }).format(price);


// ======================================
// GUARDAR CARRITO
// ======================================

function saveCart() {
    localStorage.setItem(
        getCartStorageKey(),
        JSON.stringify(cart)
    );
}

// ======================================
// MOSTRAR PRODUCTOS
// ======================================
function normalizeText(text) {
    return String(text)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}


function renderProducts() {

    const searchTerm = normalizeText(searchInput.value.trim());

    const filteredProducts = products.filter((product) => {

        const matchesCategory =
            selectedCategory === "Todos" ||
            product.category === selectedCategory;

        const matchesSearch =
            normalizeText(product.name).includes(searchTerm) ||
            normalizeText(product.category).includes(searchTerm) ||
            normalizeText(product.description).includes(searchTerm);

        return matchesCategory && matchesSearch;
    });

    if (filteredProducts.length === 0) {

        productGrid.innerHTML = `
            <div class="empty-results">
                <h3>No encontramos productos 🔎</h3>
                <p>Prueba con otro nombre o selecciona otra categoría.</p>
            </div>
        `;

        return;
    }

    productGrid.innerHTML = filteredProducts.map((product) => {

        const agotado = product.stock <= 0;
        const pocasUnidades = product.stock > 0 && product.stock <= 5;

        const estadoStock = agotado
            ? "Agotado"
            : pocasUnidades
                ? `¡Últimas ${product.stock} unidades!`
                : `${product.stock} unidades disponibles`;

        return `

        <article class="product-card">

            <div class="product-art">

                <span class="product-tag">${product.tag}</span>

                ${
                    product.image
                        ? `<img src="${product.image}" alt="${product.name}" class="product-image">`
                        : `<span class="product-emoji" aria-hidden="true">${product.emoji || ""}</span>`
                }

            </div>

            <div class="product-info">

                <span class="product-category">${product.category}</span>

                <h3>${product.name}</h3>

                <p class="product-description">${product.description}</p>

                <p class="product-stock">
                    ${estadoStock}
                </p>

                <div class="product-bottom">

                    <span class="product-price">
                        ${formatPrice(product.price)}
                    </span>

                    <button
                        type="button"
                        class="add-button"
                        data-add="${product.id}"
                        aria-label="Agregar ${product.name} al carrito"
                        title="${agotado ? "Producto agotado" : "Agregar al carrito"}"
                        ${agotado ? "disabled" : ""}
                    >+</button>

                </div>

            </div>

        </article>

        `;

    }).join("");
}

// ======================================
// MENSAJES TEMPORALES
// ======================================

function showToast(message) {

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timeout);

    showToast.timeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}


// ======================================
// AGREGAR PRODUCTOS AL CARRITO
// ======================================


function addToCart(productId) {

    const product = products.find(
        (item) => String(item.id) === String(productId)
    );

    if (!product) return;

    if (product.stock <= 0) {
        showToast("Este producto está agotado.");
        return;
    }

    const cartItem = cart.find(
        (item) => String(item.id) === String(productId)
    );

    const cantidadEnCarrito = cartItem
        ? cartItem.quantity
        : 0;

    if (cantidadEnCarrito >= product.stock) {
        showToast("No hay más unidades disponibles.");
        return;
    }

    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    saveCart();
    updateCart();

    showToast(`${product.name} se agregó al carrito 🛒`);
}

// ======================================
// ELIMINAR PRODUCTOS DEL CARRITO
// ======================================

function removeFromCart(productId) {

    const cartItem = cart.find(
        (item) => String(item.id) === String(productId)
    );

    if (!cartItem) return;

    if (cartItem.quantity > 1) {

        cartItem.quantity -= 1;

    } else {

        cart = cart.filter(
            (item) => String(item.id) !== String(productId)
        );

    }

    saveCart();
    updateCart();

    showToast("Cantidad actualizada correctamente.");
}

// ======================================
// ACTUALIZAR CARRITO
// ======================================

function updateCart() {

    const totalItems = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const totalPrice = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    cartCount.textContent = totalItems;
    cartTotal.textContent = formatPrice(totalPrice);

    if (cart.length === 0) {

        cartItems.innerHTML = `
            <div class="empty-results">
                <p>Tu carrito está vacío 🛒</p>
                <small>Explora el catálogo y agrega tus productos favoritos.</small>
            </div>
        `;

        return;
    }

    cartItems.innerHTML = cart.map((item) => `

        <div class="cart-row">

            <div class="cart-row-image">
    <img
        src="${item.image}"
        alt="${item.name}"
        onerror="this.style.display='none'"
    >
    </div>

            <div class="cart-row-info">
                <strong>${item.name}</strong>
                <small>
                    ${item.quantity} × ${formatPrice(item.price)}
                </small>
            </div>

            <button
                type="button"
                class="remove-button"
                data-remove="${item.id}"
            >
                Quitar
            </button>

        </div>

    `).join("");
}


// ======================================
// FILTROS POR CATEGORÍA
// ======================================

categories.addEventListener("click", (event) => {

    const button = event.target.closest("[data-category]");

    if (!button) return;

    selectedCategory = button.dataset.category;

    categories.querySelectorAll(".category").forEach((categoryButton) => {

        categoryButton.classList.toggle(
            "active",
            categoryButton === button
        );

    });

    renderProducts();
});


// ======================================
// BUSCADOR
// ======================================

searchInput.addEventListener("input", renderProducts);


// ======================================
// EVENTO PARA AGREGAR PRODUCTOS
// ======================================

productGrid.addEventListener("click", (event) => {

    const button = event.target.closest("[data-add]");

    if (!button) return;

    addToCart(button.dataset.add);
});


// ======================================
// EVENTO PARA ELIMINAR PRODUCTOS
// ======================================

cartItems.addEventListener("click", (event) => {

    const button = event.target.closest("[data-remove]");

    if (!button) return;

removeFromCart(button.dataset.remove);    
});


// ======================================
// ABRIR Y CERRAR CARRITO
// ======================================

cartButton.addEventListener("click", () => {

    if (typeof cartDialog.showModal === "function") {
        cartDialog.showModal();
    } else {
        showToast("Tu navegador no admite esta ventana.");
    }

});

closeCart.addEventListener("click", () => {
    cartDialog.close();
});

cartDialog.addEventListener("click", (event) => {

    if (event.target === cartDialog) {
        cartDialog.close();
    }

});

// ======================================
// CONFIRMAR PEDIDO
// ======================================

confirmOrderButton.addEventListener("click", async () => {

    // Verificar que el carrito tenga productos
    if (cart.length === 0) {
        showToast("Tu carrito está vacío.");
        return;
    }

    // Obtener el token de la sesión
    const token = localStorage.getItem("susoft-token");

    if (!token) {
        showToast("Debes iniciar sesión para confirmar tu pedido.");
        cartDialog.close();
        loginDialog.showModal();
        return;
    }

    // Evitar varios clics mientras se procesa
    confirmOrderButton.disabled = true;
    confirmOrderButton.textContent = "Procesando...";

    try {

        const response = await fetch("http://localhost:3000/api/pedidos", {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },

            body: JSON.stringify({
                productos: cart.map(item => ({
                    producto: item.id,
                    cantidad: item.quantity
                }))
            })

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.mensaje || "No se pudo confirmar el pedido.");
        }

        // Vaciar carrito después de guardar el pedido
        cart = [];

        saveCart();
        updateCart();

        cartDialog.close();

        showToast("¡Tu pedido se registró correctamente!");

        console.log("Pedido registrado:", data);

    } catch (error) {

        console.error("Error al confirmar pedido:", error);
        showToast(error.message);

    } finally {

        confirmOrderButton.disabled = false;
        confirmOrderButton.textContent = "Confirmar pedido";

    }

});

// ======================================
// REGISTRO E INICIO DE SESIÓN
// ======================================

// Botones del encabezado
const loginButton = document.getElementById("login-button");
const registerButton = document.getElementById("register-button");

// Ventanas
const loginDialog = document.getElementById("login-dialog");
const registerDialog = document.getElementById("register-dialog");

// Botones para cerrar
const closeLogin = document.getElementById("close-login");
const closeRegister = document.getElementById("close-register");

// Botones para cambiar de ventana
const goRegister = document.getElementById("go-register");
const goLogin = document.getElementById("go-login");


// Comprobar que los elementos existen
if (
    loginButton &&
    registerButton &&
    loginDialog &&
    registerDialog &&
    closeLogin &&
    closeRegister &&
    goRegister &&
    goLogin
) {

    // Abrir inicio de sesión
    loginButton.addEventListener("click", () => {
        loginDialog.showModal();
    });

    // Abrir registro
    registerButton.addEventListener("click", () => {
        registerDialog.showModal();
    });

    // Cerrar inicio de sesión
    closeLogin.addEventListener("click", () => {
        loginDialog.close();
    });

    // Cerrar registro
    closeRegister.addEventListener("click", () => {
        registerDialog.close();
    });

    // Cambiar de inicio de sesión a registro
    goRegister.addEventListener("click", () => {
        loginDialog.close();
        registerDialog.showModal();
    });

    // Cambiar de registro a inicio de sesión
    goLogin.addEventListener("click", () => {
        registerDialog.close();
        loginDialog.showModal();
    });

    // Cerrar inicio de sesión al hacer clic fuera
    loginDialog.addEventListener("click", (event) => {

        if (event.target === loginDialog) {
            loginDialog.close();
        }

    });

    // Cerrar registro al hacer clic fuera
    registerDialog.addEventListener("click", (event) => {

        if (event.target === registerDialog) {
            registerDialog.close();
        }

    });

    console.log("Ventanas de autenticación conectadas correctamente.");

} else {

    console.error(
        "No se encontraron todos los elementos HTML de autenticación."
    );

}

// ======================================
// REGISTRO E INICIO DE SESIÓN CON MONGODB
// ======================================

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

const API_AUTH = "http://localhost:3000/api/auth";


// ======================================
// REGISTRAR USUARIO
// ======================================

if (registerForm) {

    registerForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const nombre = document.getElementById("register-name").value.trim();
        const correo = document.getElementById("register-email").value.trim();
        const password = document.getElementById("register-password").value;
        const confirmPassword = document.getElementById("register-confirm").value;

        if (password !== confirmPassword) {
            showToast("Las contraseñas no coinciden.");
            return;
        }

        try {

            const response = await fetch(`${API_AUTH}/register`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    nombre,
                    correo,
                    password
                })

            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.mensaje || "No se pudo registrar el usuario.");
            }

            showToast("¡Cuenta creada correctamente!");

            registerForm.reset();
            registerDialog.close();
            loginDialog.showModal();

        } catch (error) {

            console.error("Error en el registro:", error);
            showToast(error.message);

        }

    });

}


// ======================================
// MENÚ Y SESIÓN DEL USUARIO
// ======================================

// Elementos del menú de usuario
const userMenu = document.getElementById("user-menu");
const userMenuButton = document.getElementById("user-menu-button");
const userDropdown = document.getElementById("user-dropdown");
const userName = document.getElementById("user-name");
const logoutButton = document.getElementById("logout-button");

// Elementos de la ventana Mi perfil
const profileButton = document.getElementById("profile-button");
const profileDialog = document.getElementById("profile-dialog");
const closeProfile = document.getElementById("close-profile");

const profileName = document.getElementById("profile-name");
const profileEmail = document.getElementById("profile-email");
const profileDate = document.getElementById("profile-date");

// IMPORTANTE:
// loginButton y registerButton ya están declarados
// anteriormente en la sección de autenticación.

// ======================================
// ACTUALIZAR INTERFAZ DEL USUARIO
// ======================================

function updateUserInterface() {

    const usuarioGuardado = localStorage.getItem("susoft-user");
    const token = localStorage.getItem("susoft-token");

    let usuario = null;

    try {
        usuario = usuarioGuardado
            ? JSON.parse(usuarioGuardado)
            : null;
    } catch (error) {
        console.error("No se pudieron leer los datos del usuario.");
    }

    const sesionActiva = Boolean(
        token && usuario && usuario.nombre
    );

    if (sesionActiva) {

        userMenu.hidden = false;
        loginButton.hidden = true;
        registerButton.hidden = true;

        userName.textContent = usuario.nombre;

    } else {

        userMenu.hidden = true;
        loginButton.hidden = false;
        registerButton.hidden = false;

        userDropdown.hidden = true;

        userMenuButton.setAttribute(
            "aria-expanded",
            "false"
        );

    }
}

// ======================================
// ABRIR Y CERRAR MENÚ
// ======================================

userMenuButton.addEventListener("click", () => {

    const abierto = !userDropdown.hidden;

    userDropdown.hidden = abierto;

    userMenuButton.setAttribute(
        "aria-expanded",
        String(!abierto)
    );

});

// ======================================
// CERRAR MENÚ AL HACER CLIC FUERA
// ======================================

document.addEventListener("click", (event) => {

    if (!userMenu.contains(event.target)) {

        userDropdown.hidden = true;

        userMenuButton.setAttribute(
            "aria-expanded",
            "false"
        );

    }

});

// ======================================
// MI PERFIL Y MIS PEDIDOS
// ======================================
// ======================================
// ELEMENTOS DE LA VENTANA MIS PEDIDOS
// ======================================

const ordersButton = document.getElementById("orders-button");
const ordersDialog = document.getElementById("orders-dialog");
const closeOrders = document.getElementById("close-orders");
const ordersList = document.getElementById("orders-list");

// Abrir y mostrar información del perfil
profileButton.addEventListener("click", () => {

    let usuario = null;

    try {
        usuario = JSON.parse(
            localStorage.getItem("susoft-user")
        );
    } catch (error) {
        console.error("Error al leer los datos del perfil:", error);
    }

    if (!usuario) {
        showToast("No se encontraron los datos del usuario.");
        return;
    }

    // Mostrar información del usuario
    profileName.textContent = usuario.nombre || "No disponible";
    profileEmail.textContent = usuario.correo || "No disponible";

    // Mostrar fecha de registro
    if (usuario.createdAt) {

        const fecha = new Date(usuario.createdAt);

        profileDate.textContent = isNaN(fecha.getTime())
            ? "No disponible"
            : fecha.toLocaleDateString("es-CO");

    } else {

        profileDate.textContent = "No disponible";

    }

    // Cerrar el menú desplegable
    userDropdown.hidden = true;

    userMenuButton.setAttribute(
        "aria-expanded",
        "false"
    );

    // Abrir ventana del perfil
    profileDialog.showModal();

});

// Cerrar ventana del perfil
closeProfile.addEventListener("click", () => {
    profileDialog.close();
});

// Cerrar perfil al hacer clic fuera
profileDialog.addEventListener("click", (event) => {

    if (event.target === profileDialog) {
        profileDialog.close();
    }

});

// ======================================
// ABRIR VENTANA MIS PEDIDOS
// ======================================

// ======================================
// ABRIR VENTANA Y CARGAR MIS PEDIDOS
// ======================================

ordersButton.addEventListener("click", () => {

    // Cerrar el menú desplegable
    userDropdown.hidden = true;

    userMenuButton.setAttribute(
        "aria-expanded",
        "false"
    );

    // Abrir ventana de pedidos
    ordersDialog.showModal();

    // Consultar pedidos en MongoDB
    loadMyOrders();

});

// ======================================
// CARGAR MIS PEDIDOS DESDE MONGODB
// ======================================


async function loadMyOrders() {

    const token = localStorage.getItem("susoft-token");

    if (!token) {
        showToast("Debes iniciar sesión para consultar tus pedidos.");
        ordersDialog.close();
        return;
    }

    ordersList.innerHTML = `
        <div class="empty-results">
            <p>Cargando tus pedidos...</p>
        </div>
    `;

    try {

        const response = await fetch(
            "http://localhost:3000/api/pedidos/mis-pedidos",
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.mensaje || "No se pudieron cargar tus pedidos."
            );
        }

        const pedidos = Array.isArray(data)
            ? data
            : data.pedidos;

        if (!Array.isArray(pedidos) || pedidos.length === 0) {

            ordersList.innerHTML = `
                <div class="empty-results">
                    <p>Todavía no tienes pedidos 📦</p>
                    <small>
                        Cuando confirmes una compra, aparecerá aquí.
                    </small>
                </div>
            `;

            return;
        }

        ordersList.innerHTML = pedidos.map((pedido) => {

            const fecha = new Date(pedido.createdAt);

            const fechaTexto = isNaN(fecha.getTime())
                ? "Fecha no disponible"
                : fecha.toLocaleDateString("es-CO");

            const productosHTML = pedido.productos.map((item) => `
                <div class="order-product">
                    <span>${item.nombre}</span>
                    <small>
                        ${item.cantidad} × ${formatPrice(item.precio)}
                    </small>
                </div>
            `).join("");

            return `
                <article class="order-card">

                    <div class="order-header">
                        <strong>
                            Pedido #${pedido._id.slice(-6)}
                        </strong>
                        <span class="order-status">
                            ${pedido.estado}
                        </span>
                    </div>

                    <div class="order-date">
                        Fecha: ${fechaTexto}
                    </div>

                    <div class="order-products">
                        ${productosHTML}
                    </div>

                    <div class="order-total">
                        <span>Total del pedido</span>
                        <strong>
                            ${formatPrice(pedido.total)}
                        </strong>
                    </div>

                </article>
            `;

        }).join("");

    } catch (error) {

        console.error("Error al consultar pedidos:", error);

        ordersList.innerHTML = `
            <div class="empty-results">
                <p>No pudimos cargar tus pedidos.</p>
                <small>${error.message}</small>
            </div>
        `;

    }

}

closeOrders.addEventListener("click", () => {
    ordersDialog.close();
});

ordersDialog.addEventListener("click", (event) => {

    if (event.target === ordersDialog) {
        ordersDialog.close();
    }

});


// ======================================
// CERRAR SESIÓN
// ======================================

logoutButton.addEventListener("click", () => {

    // Guardar el carrito del usuario actual
    saveCart();

    // Cerrar sesión
    localStorage.removeItem("susoft-token");
    localStorage.removeItem("susoft-user");

    // Cargar el carrito de invitado
    loadCart();

    // Actualizar interfaz
    updateUserInterface();
    updateCart();

    showToast("Has cerrado sesión correctamente.");

});


// ======================================
// INICIAR SESIÓN
// ======================================

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const correo = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value;

        try {

            const response = await fetch(`${API_AUTH}/login`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    correo,
                    password
                })

            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.mensaje || "No se pudo iniciar sesión."
                );
            }

            localStorage.setItem("susoft-token", data.token);

            localStorage.setItem(
           "susoft-user",
            JSON.stringify(data.usuario)
            );

            // Cargar el carrito correspondiente a esta cuenta
            loadCart();

            // Actualizar la interfaz y el carrito
            updateUserInterface();
            updateCart();

            showToast(`¡Bienvenido, ${data.usuario.nombre}!`);

            loginForm.reset();
            loginDialog.close();

            console.log("Sesión iniciada correctamente.");

        } catch (error) {

            console.error("Error en el inicio de sesión:", error);
            showToast(error.message);

        }

    });

}

// ======================================
// RESTAURAR SESIÓN AL CARGAR LA PÁGINA
// ======================================

updateUserInterface();



// ======================================
// INICIAR APLICACIÓN
// ======================================

updateCart();

loadProducts();

console.log("SuSoft.com se ha iniciado correctamente.");
