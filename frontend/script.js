
const products = [
    {
        id: 1,
        name: "Audífonos inalámbricos",
        category: "Accesorios",
        price: 89900,
        emoji: "🎧",
        tag: "Popular",
        description: "Audio para estudiar, trabajar y disfrutar."
    },
    {
        id: 2,
        name: "Teclado mecánico RGB",
        category: "Periféricos",
        price: 159900,
        emoji: "⌨️",
        tag: "Destacado",
        description: "Comodidad y estilo para tu escritorio."
    },
    {
        id: 3,
        name: "Mouse gamer",
        category: "Periféricos",
        price: 69900,
        emoji: "🖱️",
        tag: "Favorito",
        description: "Precisión para tus tareas y juegos."
    },
    {
        id: 4,
        name: "Memoria RAM 8 GB",
        category: "Componentes",
        price: 109900,
        emoji: "🧩",
        tag: "Componente",
        description: "Una opción para ampliar la memoria del equipo."
    },
    {
        id: 5,
        name: "Unidad SSD 480 GB",
        category: "Almacenamiento",
        price: 179900,
        emoji: "💾",
        tag: "Recomendado",
        description: "Almacenamiento para tus archivos y programas."
    },
    {
        id: 6,
        name: "Cámara web HD",
        category: "Accesorios",
        price: 79900,
        emoji: "📷",
        tag: "Para estudiar",
        description: "Ideal para videollamadas y reuniones virtuales."
    },
    {
        id: 7,
        name: "Ventilador para PC",
        category: "Componentes",
        price: 45900,
        emoji: "🌀",
        tag: "Refrigeración",
        description: "Un componente para ayudar al flujo de aire."
    },
    {
        id: 8,
        name: "Memoria USB 64 GB",
        category: "Almacenamiento",
        price: 34900,
        emoji: "🔌",
        tag: "Práctico",
        description: "Transporta documentos y archivos."
    }
];

let selectedCategory = "Todos";
let cart = JSON.parse(localStorage.getItem("susoft-cart")) || [];
function saveCart() {
    localStorage.setItem("susoft-cart", JSON.stringify(cart));
}

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

const formatPrice = (price) =>
    new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    }).format(price);

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
                <span class="product-emoji" aria-hidden="true">${product.emoji}</span>
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3>${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-bottom">
                    <span class="product-price">${formatPrice(product.price)}</span>
                    <button
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

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timeout);
    showToast.timeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}


function addToCart(productId) {
    const product = products.find((item) => item.id === productId);

    if (!product) return;

    const cartItem = cart.find((item) => item.id === productId);

    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCart();
    showToast(`${product.name} se agregó al carrito 🛒`);
}


function removeFromCart(productId) {
    cart = cart.filter((item) => item.id !== productId);
    saveCart();
    updateCart();
}

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
            <span class="cart-row-emoji" aria-hidden="true">${item.emoji}</span>
            <div class="cart-row-info">
                <strong>${item.name}</strong>
                <small>${item.quantity} × ${formatPrice(item.price)}</small>
            </div>
            <button class="remove-button" data-remove="${item.id}">
                Quitar
            </button>
        </div>
    `).join("");
}

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

searchInput.addEventListener("input", renderProducts);

productGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add]");

    if (!button) return;

    addToCart(Number(button.dataset.add));
});

cartItems.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove]");

    if (!button) return;

    removeFromCart(Number(button.dataset.remove));
});

cartButton.addEventListener("click", () => {
    if (typeof cartDialog.showModal === "function") {
        cartDialog.showModal();
    } else {
        showToast("Tu navegador no admite la ventana del carrito.");
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

renderProducts();
updateCart();
