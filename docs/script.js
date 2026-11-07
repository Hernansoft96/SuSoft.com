
// ======================================
// CATÁLOGO DE PRODUCTOS
// ======================================

const products = [
    {
        id: 1,
        name: "Audífonos inalámbricos",
        category: "Accesorios",
        price: 89900,
        image: "img/productos/audifonos gamer.png",
        tag: "Popular",
        description: "Audio para estudiar, trabajar y disfrutar."
    },
    {
        id: 2,
        name: "Teclado mecánico RGB",
        category: "Periféricos",
        price: 159900,
        image: "img/productos/teclado gamer.png",
        tag: "Destacado",
        description: "Comodidad y estilo para tu escritorio."
    },
    {
        id: 3,
        name: "Mouse gamer",
        category: "Periféricos",
        price: 69900,
        image: "img/productos/mouse gamer.png",
        tag: "Favorito",
        description: "Precisión para tus tareas y juegos."
    },
    {
        id: 4,
        name: "Memoria RAM 8 GB",
        category: "Componentes",
        price: 109900,
        image: "img/productos/ram rgb.png",
        tag: "Componente",
        description: "Una opción para ampliar la memoria del equipo."
    },
    {
        id: 5,
        name: "Unidad SSD 512 GB",
        category: "Almacenamiento",
        price: 179900,
        image: "img/productos/disco solido.png",
        tag: "Recomendado",
        description: "Almacenamiento para tus archivos y programas."
    },
    {
        id: 6,
        name: "Cámara web HD",
        category: "Accesorios",
        price: 79900,
        image: "img/productos/camara para computador.png",
        tag: "Para estudiar",
        description: "Ideal para videollamadas y reuniones virtuales."
    },
    {
        id: 7,
        name: "Ventilador para PC",
        category: "Componentes",
        price: 45900,
        image: "img/productos/ventilador rgb.png",
        tag: "Refrigeración",
        description: "Un componente para ayudar al flujo de aire."
    },
    {
        id: 8,
        name: "Memoria USB 64 GB",
        category: "Almacenamiento",
        price: 34900,
        image: "img/productos/usb.png",
        tag: "Práctico",
        description: "Transporta documentos y archivos."
    }
];


// ======================================
// ESTADO INICIAL
// ======================================

let selectedCategory = "Todos";

let cart = [];

try {
    cart = JSON.parse(localStorage.getItem("susoft-cart")) || [];

    if (!Array.isArray(cart)) {
        cart = [];
    }
} catch (error) {
    console.error("No se pudo recuperar el carrito:", error);
    cart = [];
}


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
    localStorage.setItem("susoft-cart", JSON.stringify(cart));
}


// ======================================
// MOSTRAR PRODUCTOS
// ======================================

function renderProducts() {

    const searchTerm = searchInput.value.trim().toLowerCase();

    const filteredProducts = products.filter((product) => {

        const matchesCategory =
            selectedCategory === "Todos" ||
            product.category === selectedCategory;

        const matchesSearch =
            product.name.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm);

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

    productGrid.innerHTML = filteredProducts.map((product) => `

        <article class="product-card">

            <div class="product-art">
            <span class="product-tag">${product.tag}</span>
            ${
            product.image
            ? `<img src="${product.image}" alt="${product.name}" class="product-image">`
            : `<span class="product-emoji" aria-hidden="true">${product.emoji}</span>`
            }
            </div>

            <div class="product-info">

                <span class="product-category">${product.category}</span>

                <h3>${product.name}</h3>

                <p class="product-description">${product.description}</p>

                <div class="product-bottom">

                    <span class="product-price">
                        ${formatPrice(product.price)}
                    </span>

                    <button
                        type="button"
                        class="add-button"
                        data-add="${product.id}"
                        aria-label="Agregar ${product.name} al carrito"
                        title="Agregar al carrito"
                    >+</button>

                </div>

            </div>

        </article>

    `).join("");
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

    const product = products.find((item) => item.id === productId);

    if (!product) return;

    const cartItem = cart.find((item) => item.id === productId);

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

    cart = cart.filter((item) => item.id !== productId);

    saveCart();
    updateCart();

    showToast("Producto eliminado del carrito.");
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

            <span class="cart-row-emoji" aria-hidden="true">
                ${item.emoji}
            </span>

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

    addToCart(Number(button.dataset.add));
});


// ======================================
// EVENTO PARA ELIMINAR PRODUCTOS
// ======================================

cartItems.addEventListener("click", (event) => {

    const button = event.target.closest("[data-remove]");

    if (!button) return;

    removeFromCart(Number(button.dataset.remove));
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
// FORMULARIOS DE DEMOSTRACIÓN
// ======================================

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

// Evitar que el formulario recargue la página
if (loginForm) {

    loginForm.addEventListener("submit", (event) => {

        event.preventDefault();

        showToast(
            "Inicio de sesión pendiente de conectar con el backend."
        );

    });

}

// Validar los campos básicos del registro
if (registerForm) {

    registerForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const password = document.getElementById("register-password").value;
        const confirmPassword = document.getElementById("register-confirm").value;

        if (password !== confirmPassword) {

            showToast("Las contraseñas no coinciden.");
            return;

        }

        showToast(
            "Registro pendiente de conectar con el backend."
        );

    });

}


// ======================================
// INICIAR APLICACIÓN
// ======================================

renderProducts();
updateCart();

console.log("SuSoft.com se ha iniciado correctamente.");
