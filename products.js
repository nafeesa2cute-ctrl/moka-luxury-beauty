// ===== PRODUCTS MANAGEMENT =====

class ProductManager {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.filters = {
            category: 'all',
            priceRange: 'all',
            search: '',
            sortBy: 'name'
        };
        this.init();
    }

    async init() {
        await this.loadProducts();
        this.setupFilters();
        this.setupSearch();
        this.setupSort();
    }

    // ===== PRODUCT LOADING =====
    async loadProducts() {
        try {
            const response = await fetch('tables/products');
            const data = await response.json();
            this.products = data.data || [];
            this.filteredProducts = [...this.products];
            this.applyFilters();
        } catch (error) {
            console.error('Error loading products:', error);
            this.loadProductsFromFallback();
        }
    }

    loadProductsFromFallback() {
        // Fallback product data
        this.products = [
            {
                id: 'lip-001',
                name: 'Velvet Matte Lipstick',
                category: 'lipstick',
                price: 85,
                description: 'Our signature velvet matte lipstick delivers rich, long-lasting color with a luxurious finish.',
                image_url: 'https://www.visonpack.com/wp-content/uploads/2023/11/Charlotte-Tilbury-rose-gold-jpg.webp',
                shades: ['Rouge Noir', 'Midnight Rose', 'Golden Dawn', 'Deep Plum', 'Classic Red'],
                featured: true,
                in_stock: true,
                rating: 4.8
            },
            {
                id: 'eye-001',
                name: 'Luxury Eyeshadow Palette',
                category: 'eyeshadow',
                price: 125,
                description: 'Professional 12-shade eyeshadow palette featuring highly pigmented colors.',
                image_url: 'https://m.media-amazon.com/images/I/81f1CV2D7kL._UF1000,1000_QL80_.jpg',
                shades: ['Nude Collection', 'Smoky Collection', 'Rose Gold Collection', 'Bold Collection'],
                featured: true,
                in_stock: true,
                rating: 4.9
            }
        ];
        this.filteredProducts = [...this.products];
        this.applyFilters();
    }

    // ===== FILTERING =====
    setupFilters() {
        // Category filter
        const categorySelect = document.getElementById('category-filter');
        if (categorySelect) {
            categorySelect.addEventListener('change', (e) => {
                this.filters.category = e.target.value;
                this.applyFilters();
            });
        }

        // Price range filter
        const priceSelect = document.getElementById('price-filter');
        if (priceSelect) {
            priceSelect.addEventListener('change', (e) => {
                this.filters.priceRange = e.target.value;
                this.applyFilters();
            });
        }

        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filterType = e.target.dataset.filter;
                const filterValue = e.target.dataset.value;
                
                // Update active state
                document.querySelectorAll(`.filter-btn[data-filter="${filterType}"]`).forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Apply filter
                this.filters[filterType] = filterValue;
                this.applyFilters();
            });
        });
    }

    setupSearch() {
        const searchInput = document.getElementById('product-search');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.filters.search = e.target.value.toLowerCase();
                    this.applyFilters();
                }, 300);
            });
        }
    }

    setupSort() {
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.filters.sortBy = e.target.value;
                this.applyFilters();
            });
        }
    }

    applyFilters() {
        let filtered = [...this.products];

        // Category filter
        if (this.filters.category !== 'all') {
            filtered = filtered.filter(product => product.category === this.filters.category);
        }

        // Price range filter
        if (this.filters.priceRange !== 'all') {
            const [min, max] = this.getPriceRange(this.filters.priceRange);
            filtered = filtered.filter(product => product.price >= min && product.price <= max);
        }

        // Search filter
        if (this.filters.search) {
            filtered = filtered.filter(product => 
                product.name.toLowerCase().includes(this.filters.search) ||
                product.category.toLowerCase().includes(this.filters.search) ||
                product.description.toLowerCase().includes(this.filters.search)
            );
        }

        // Sort products
        filtered = this.sortProducts(filtered, this.filters.sortBy);

        this.filteredProducts = filtered;
        this.currentPage = 1;
        this.renderProducts();
        this.updateResultsCount();
    }

    getPriceRange(range) {
        const ranges = {
            'under-50': [0, 49],
            '50-100': [50, 99],
            '100-150': [100, 149],
            'over-150': [150, 999]
        };
        return ranges[range] || [0, 999];
    }

    sortProducts(products, sortBy) {
        const sortFunctions = {
            'name': (a, b) => a.name.localeCompare(b.name),
            'price-low': (a, b) => a.price - b.price,
            'price-high': (a, b) => b.price - a.price,
            'rating': (a, b) => b.rating - a.rating,
            'newest': (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
        };

        return products.sort(sortFunctions[sortBy] || sortFunctions.name);
    }

    // ===== RENDERING =====
    renderProducts() {
        const container = document.getElementById('products-container');
        if (!container) return;

        if (this.filteredProducts.length === 0) {
            container.innerHTML = this.getNoProductsHTML();
            return;
        }

        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const productsToShow = this.filteredProducts.slice(startIndex, endIndex);

        // Render products
        const productsHTML = productsToShow.map(product => this.createProductCard(product)).join('');
        container.innerHTML = productsHTML;

        // Render pagination
        this.renderPagination();

        // Add scroll reveal animations
        this.addScrollReveal();
    }

    createProductCard(product) {
        const firstShade = Array.isArray(product.shades) ? product.shades[0] : 'Default';
        const stockStatus = product.in_stock ? 'In Stock' : 'Out of Stock';
        const stockClass = product.in_stock ? 'in-stock' : 'out-of-stock';

        return `
            <div class="product-card interactive-glow scroll-reveal" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image_url}" alt="${product.name}" loading="lazy">
                    <div class="product-overlay">
                        <button class="quick-view-btn" onclick="productManager.quickView('${product.id}')" ${!product.in_stock ? 'disabled' : ''}>
                            ${product.in_stock ? 'Quick View' : 'Out of Stock'}
                        </button>
                    </div>
                    ${product.featured ? '<div class="featured-badge">Featured</div>' : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-category">${this.formatCategory(product.category)}</p>
                    <div class="product-rating">
                        ${this.createStarRating(product.rating)}
                        <span class="rating-text">(${product.rating})</span>
                    </div>
                    <div class="product-shades">
                        <span class="shades-text">${Array.isArray(product.shades) ? product.shades.length : 1} shade${Array.isArray(product.shades) && product.shades.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="product-price">$${product.price}</div>
                    <div class="product-stock ${stockClass}">
                        <i class="fas ${product.in_stock ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                        ${stockStatus}
                    </div>
                    <div class="product-actions">
                        <button class="add-to-cart-btn" 
                                onclick="productManager.addToCart('${product.id}')" 
                                ${!product.in_stock ? 'disabled' : ''}>
                            ${product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                        <button class="wishlist-btn" onclick="productManager.toggleWishlist('${product.id}')">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    createStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let starsHTML = '';

        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="fas fa-star"></i>';
        }

        if (hasHalfStar) {
            starsHTML += '<i class="fas fa-star-half-alt"></i>';
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="far fa-star"></i>';
        }

        return `<div class="stars">${starsHTML}</div>`;
    }

    formatCategory(category) {
        const categoryNames = {
            'lipstick': 'Lipstick',
            'eyeshadow': 'Eyeshadow',
            'foundation': 'Foundation',
            'mascara': 'Mascara',
            'blush': 'Blush',
            'brushes': 'Brushes'
        };
        return categoryNames[category] || category;
    }

    getNoProductsHTML() {
        return `
            <div class="no-products">
                <div class="no-products-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3>No Products Found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button class="btn-primary" onclick="productManager.clearFilters()">Clear Filters</button>
            </div>
        `;
    }

    // ===== PAGINATION =====
    renderPagination() {
        const paginationContainer = document.getElementById('pagination');
        if (!paginationContainer) return;

        const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // Previous button
        if (this.currentPage > 1) {
            paginationHTML += `<button class="pagination-btn" onclick="productManager.goToPage(${this.currentPage - 1})">Previous</button>`;
        }

        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);

        if (startPage > 1) {
            paginationHTML += `<button class="pagination-btn" onclick="productManager.goToPage(1)">1</button>`;
            if (startPage > 2) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `<button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" onclick="productManager.goToPage(${i})">${i}</button>`;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            }
            paginationHTML += `<button class="pagination-btn" onclick="productManager.goToPage(${totalPages})">${totalPages}</button>`;
        }

        // Next button
        if (this.currentPage < totalPages) {
            paginationHTML += `<button class="pagination-btn" onclick="productManager.goToPage(${this.currentPage + 1})">Next</button>`;
        }

        paginationContainer.innerHTML = paginationHTML;
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderProducts();
        
        // Scroll to top of products
        const container = document.getElementById('products-container');
        if (container) {
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // ===== UTILITY FUNCTIONS =====
    updateResultsCount() {
        const countElement = document.getElementById('results-count');
        if (countElement) {
            const showing = Math.min(this.currentPage * this.itemsPerPage, this.filteredProducts.length);
            countElement.textContent = `Showing ${(this.currentPage - 1) * this.itemsPerPage + 1}-${showing} of ${this.filteredProducts.length} products`;
        }
    }

    clearFilters() {
        // Reset all filters
        this.filters = {
            category: 'all',
            priceRange: 'all',
            search: '',
            sortBy: 'name'
        };

        // Reset UI elements
        const categorySelect = document.getElementById('category-filter');
        if (categorySelect) categorySelect.value = 'all';

        const priceSelect = document.getElementById('price-filter');
        if (priceSelect) priceSelect.value = 'all';

        const searchInput = document.getElementById('product-search');
        if (searchInput) searchInput.value = '';

        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) sortSelect.value = 'name';

        // Reset filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.value === 'all') {
                btn.classList.add('active');
            }
        });

        this.applyFilters();
    }

    addScrollReveal() {
        const reveals = document.querySelectorAll('.scroll-reveal');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        reveals.forEach(reveal => observer.observe(reveal));
    }

    // ===== PRODUCT ACTIONS =====
    quickView(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        if (window.mokaApp) {
            window.mokaApp.quickView(productId);
        }
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product || !product.in_stock) return;

        if (window.mokaApp) {
            window.mokaApp.addToCart(productId);
        }
    }

    toggleWishlist(productId) {
        // Wishlist functionality (to be implemented)
        const wishlistBtn = document.querySelector(`[onclick="productManager.toggleWishlist('${productId}')"] i`);
        if (wishlistBtn) {
            if (wishlistBtn.classList.contains('far')) {
                wishlistBtn.classList.remove('far');
                wishlistBtn.classList.add('fas');
                this.showNotification('Added to wishlist', 'success');
            } else {
                wishlistBtn.classList.remove('fas');
                wishlistBtn.classList.add('far');
                this.showNotification('Removed from wishlist', 'info');
            }
        }
    }

    showNotification(message, type = 'info') {
        if (window.mokaApp) {
            window.mokaApp.showNotification(message, type);
        }
    }
}

// ===== PRODUCT DETAIL PAGE =====
class ProductDetail {
    constructor() {
        this.product = null;
        this.selectedShade = null;
        this.init();
    }

    async init() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        
        if (productId) {
            await this.loadProduct(productId);
        }
    }

    async loadProduct(productId) {
        try {
            const response = await fetch(`tables/products/${productId}`);
            const product = await response.json();
            this.product = product;
            this.renderProductDetail();
        } catch (error) {
            console.error('Error loading product:', error);
            this.showProductNotFound();
        }
    }

    renderProductDetail() {
        if (!this.product) return;

        // Update page title
        document.title = `${this.product.name} - Moka Luxury Beauty`;

        // Render product details
        const container = document.getElementById('product-detail-container');
        if (container) {
            container.innerHTML = this.createProductDetailHTML();
            this.setupProductDetailEvents();
        }
    }

    createProductDetailHTML() {
        const shadesHTML = Array.isArray(this.product.shades) ? 
            this.product.shades.map((shade, index) => `
                <button class="shade-option ${index === 0 ? 'selected' : ''}" 
                        onclick="productDetail.selectShade('${shade}')">
                    ${shade}
                </button>
            `).join('') : '<span class="shade-option selected">Default</span>';

        return `
            <div class="product-detail-grid">
                <div class="product-images">
                    <div class="main-image">
                        <img src="${this.product.image_url}" alt="${this.product.name}" id="main-product-image">
                    </div>
                </div>
                
                <div class="product-info-detail">
                    <nav class="breadcrumb">
                        <a href="index.html">Home</a>
                        <span>/</span>
                        <a href="shop.html">Shop</a>
                        <span>/</span>
                        <span>${this.product.name}</span>
                    </nav>
                    
                    <h1 class="product-title">${this.product.name}</h1>
                    <p class="product-category-detail">${this.formatCategory(this.product.category)}</p>
                    
                    <div class="product-rating-detail">
                        ${this.createStarRating(this.product.rating)}
                        <span class="rating-text">(${this.product.rating} stars)</span>
                    </div>
                    
                    <div class="product-price-detail">$${this.product.price}</div>
                    
                    <div class="product-description-detail">
                        <p>${this.product.description}</p>
                    </div>
                    
                    <div class="product-shades-detail">
                        <h4>Available Shades:</h4>
                        <div class="shades-grid">
                            ${shadesHTML}
                        </div>
                    </div>
                    
                    <div class="product-actions-detail">
                        <button class="btn-primary add-to-cart-detail" onclick="productDetail.addToCart()">
                            Add to Cart - $${this.product.price}
                        </button>
                        <button class="btn-secondary wishlist-detail" onclick="productDetail.toggleWishlist()">
                            <i class="far fa-heart"></i> Add to Wishlist
                        </button>
                    </div>
                    
                    <div class="product-features">
                        <div class="feature">
                            <i class="fas fa-shipping-fast"></i>
                            <span>Free shipping on orders over $100</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-undo"></i>
                            <span>30-day return policy</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-certificate"></i>
                            <span>Authenticity guaranteed</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupProductDetailEvents() {
        // Initialize with first shade selected
        if (Array.isArray(this.product.shades) && this.product.shades.length > 0) {
            this.selectedShade = this.product.shades[0];
        }
    }

    selectShade(shade) {
        this.selectedShade = shade;
        
        // Update UI
        document.querySelectorAll('.shade-option').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        event.target.classList.add('selected');
    }

    addToCart() {
        if (!this.product) return;

        const cartItem = {
            id: this.product.id,
            name: this.product.name,
            price: this.product.price,
            image: this.product.image_url,
            shade: this.selectedShade || 'Default',
            quantity: 1
        };

        if (window.cart) {
            window.cart.addItem(cartItem);
            this.showNotification(`${this.product.name} added to cart!`, 'success');
        }
    }

    toggleWishlist() {
        const wishlistBtn = document.querySelector('.wishlist-detail i');
        if (wishlistBtn.classList.contains('far')) {
            wishlistBtn.classList.remove('far');
            wishlistBtn.classList.add('fas');
            this.showNotification('Added to wishlist', 'success');
        } else {
            wishlistBtn.classList.remove('fas');
            wishlistBtn.classList.add('far');
            this.showNotification('Removed from wishlist', 'info');
        }
    }

    showProductNotFound() {
        const container = document.getElementById('product-detail-container');
        if (container) {
            container.innerHTML = `
                <div class="product-not-found">
                    <h2>Product Not Found</h2>
                    <p>The product you're looking for doesn't exist or has been removed.</p>
                    <a href="shop.html" class="btn-primary">Continue Shopping</a>
                </div>
            `;
        }
    }

    createStarRating(rating) {
        // Same as ProductManager
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let starsHTML = '';

        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="fas fa-star"></i>';
        }

        if (hasHalfStar) {
            starsHTML += '<i class="fas fa-star-half-alt"></i>';
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="far fa-star"></i>';
        }

        return `<div class="stars">${starsHTML}</div>`;
    }

    formatCategory(category) {
        const categoryNames = {
            'lipstick': 'Lipstick',
            'eyeshadow': 'Eyeshadow',
            'foundation': 'Foundation',
            'mascara': 'Mascara',
            'blush': 'Blush',
            'brushes': 'Brushes'
        };
        return categoryNames[category] || category;
    }

    showNotification(message, type = 'info') {
        if (window.mokaApp) {
            window.mokaApp.showNotification(message, type);
        }
    }
}

// ===== INITIALIZATION =====
let productManager;
let productDetail;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize appropriate manager based on page
    if (document.getElementById('products-container')) {
        productManager = new ProductManager();
        window.productManager = productManager;
    }
    
    if (document.getElementById('product-detail-container')) {
        productDetail = new ProductDetail();
        window.productDetail = productDetail;
    }
});