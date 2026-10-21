
document.addEventListener("DOMContentLoaded", () => {
    const products = [
        {
            id: 1,
            name: "Fresh Eau De Parfum",
            price: 95,
            image: "https://dehnee.com/cdn/shop/files/1_1_e17aad9a-0ac8-40b1-9904-0ff9a52e1984.webp?v=1791270082&width=720"
        },
        {
            id: 2,
            name: "Citrus Eau De Parfum",
            price: 95,
            image: "https://dehnee.com/cdn/shop/files/3_1_44b719ae-01d2-4ebe-a0c2-ed3a103a5bfc.webp?v=1791269506&width=360"
        },
        {
            id: 3,
            name: "Floral Eau De Parfum",
            price: 95,
            image: "https://dehnee.com/cdn/shop/files/2_2.webp?v=1791269715&width=360"
        },
        {
            id: 4,
            name: "Coconut Eau De Parfum",
            price: 95,
            image: "https://dehnee.com/cdn/shop/files/6_1_7af1b313-7561-43e0-bffc-ee1ad4c67fc0.webp?v=1791269323&width=360"
        }
    ];

    const selectedProducts = new Set();
    let resetButtonLabels = false;

    const productsContainer =
        document.getElementById("products");

    const selectedCount =
        document.getElementById("selected-count");

    const selectedProductsContainer =
        document.getElementById("selected-products");

    const totalElement =
        document.getElementById("total");

    const messageElement =
        document.getElementById("message");

    const addToBundleButton =
        document.getElementById("add-to-bundle");

    const bundleSummary =
        document.getElementById("bundle-summary");

    const cartSection =
        document.getElementById("cart-section");

    const cartItems =
        document.getElementById("cart-items");

    const cartTotal =
        document.getElementById("cart-total");

    if (
        !productsContainer ||
        !selectedProductsContainer ||
        !totalElement ||
        !addToBundleButton ||
        !bundleSummary ||
        !cartSection ||
        !cartItems ||
        !cartTotal
    ) {
        console.error(
            "Some HTML elements are missing. Check index.html."
        );
        return;
    }

    function formatPrice(amount) {
        return `AED ${amount.toFixed(2)}`;
    }

    // Render all perfume products
    function renderProducts() {
        productsContainer.innerHTML = products.map(product => `
            <article
                class="product-card"
                data-product-card="${product.id}"
            >
                <img
                    class="product-image"
                    src="${product.image}"
                    alt="${product.name}"
                    loading="lazy"
                >

                <h3>${product.name}</h3>

                <p class="product-price">
                    ${formatPrice(product.price)}
                </p>

                <button
                    class="select-button"
                    data-product-id="${product.id}"
                    type="button"
                    aria-pressed="false"
                >
                    Add to Bundle
                </button>
            </article>
        `).join("");
    }

    // Select or deselect a perfume
    function toggleProduct(productId) {
        if (selectedProducts.has(productId)) {
            selectedProducts.delete(productId);
        } else {
            if (selectedProducts.size >= 3) {
                if (messageElement) {
                    messageElement.textContent =
                        "You can select only 3 perfumes.";
                }
                return;
            }

            selectedProducts.add(productId);
        }

        resetButtonLabels = false;
        cartSection.hidden = true;

        updateBundle();
    }

    // Remove a perfume using the X button
    function removeProduct(productId) {
        if (!selectedProducts.has(productId)) return;

        selectedProducts.delete(productId);
        resetButtonLabels = true;
        cartSection.hidden = true;

        updateBundle();
    }

    // Update bundle images, plus symbols, prices and buttons
    function updateBundle() {
        const selected = products.filter(product =>
            selectedProducts.has(product.id)
        );

        const count = selected.length;

        // Render perfume cards with + between each image
        selectedProductsContainer.innerHTML =
            selected.map((product, index) => `
                ${index > 0
                    ? '<span class="bundle-plus" aria-hidden="true">+</span>'
                    : ''
                }

                <article class="selected-product">
                    <img
                        src="${product.image}"
                        alt="${product.name}"
                        loading="lazy"
                    >

                    <div class="selected-product-details">
                        <h4>1x ${product.name}</h4>
                        <p>${formatPrice(product.price)}</p>
                    </div>

                    <button
                        class="remove-product"
                        data-remove-id="${product.id}"
                        type="button"
                        aria-label="Remove ${product.name}"
                        title="Remove perfume"
                    >&times;</button>
                </article>
            `).join("");

        // Calculate subtotal
        const subtotal = selected.reduce(
            (sum, product) => sum + product.price,
            0
        );

        // Cheapest perfume is free when 3 are selected
        const discount = count === 3
            ? Math.min(...selected.map(product => product.price))
            : 0;

        totalElement.textContent =
            formatPrice(subtotal - discount);

        if (selectedCount) {
            selectedCount.textContent = count;
        }

        // Show or hide Your Bundle
        bundleSummary.hidden = count === 0;

        // Update product buttons
        productsContainer
            .querySelectorAll(".select-button")
            .forEach(button => {
                const productId =
                    Number(button.dataset.productId);

                const isSelected =
                    selectedProducts.has(productId);

                if (count === 3) {
                    button.style.display = "none";
                    return;
                }

                button.style.display = "inline-block";

                if (isSelected && !resetButtonLabels) {
                    button.innerHTML = "✓ Added";
                    button.classList.add("selected");
                    button.setAttribute("aria-pressed", "true");
                } else {
                    button.textContent = "Add to Bundle";
                    button.classList.remove("selected");
                    button.setAttribute("aria-pressed", "false");
                }
            });

        if (messageElement) {
            messageElement.textContent = count === 3
                ? "Great! Your third perfume is free."
                : "";
        }

        // Enable cart button only when 3 perfumes are selected
        addToBundleButton.disabled = count !== 3;
    }

    // Handle Add to Bundle clicks
    productsContainer.addEventListener("click", event => {
        const button = event.target.closest(".select-button");

        if (!button) return;

        toggleProduct(Number(button.dataset.productId));
    });

    // Handle removing a perfume
    selectedProductsContainer.addEventListener(
        "click",
        event => {
            const button =
                event.target.closest(".remove-product");

            if (!button) return;

            removeProduct(Number(button.dataset.removeId));
        }
    );

    // Add selected bundle to the demo cart
    function addBundleToCart() {
        if (selectedProducts.size !== 3) return;

        const selected = products.filter(product =>
            selectedProducts.has(product.id)
        );

        const subtotal = selected.reduce(
            (sum, product) => sum + product.price,
            0
        );

        const discount = Math.min(
            ...selected.map(product => product.price)
        );

        const total = subtotal - discount;

        cartItems.innerHTML = selected.map(product => `
            <article class="cart-item">
                <img
                    src="${product.image}"
                    alt="${product.name}"
                    loading="lazy"
                >

                <p>${product.name}</p>
                <p>${formatPrice(product.price)}</p>
            </article>
        `).join("");

        cartTotal.textContent = formatPrice(total);
        cartSection.hidden = false;

        cartSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    addToBundleButton.addEventListener(
        "click",
        addBundleToCart
    );

    // Initial setup
    renderProducts();
    updateBundle();
});
// ===== MOBILE NAVBAR MENU =====

const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {
        const isOpen = navLinks.classList.toggle("is-open");

        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.textContent = isOpen ? "✕ Close" : "☰ Menu";
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
            navLinks.classList.remove("is-open");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.textContent = "☰ Menu";
        });
    });
}