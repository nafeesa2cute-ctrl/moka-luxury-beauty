// ===== MAIN JAVASCRIPT FUNCTIONALITY =====

class MokaApp {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentFilters = {
            category: 'all',
            priceRange: 'all',
            search: ''
        };
        
        this.init();
    }

    async init() {
        await this.loadProducts();
        this.setupEventListeners();
        this.setupScrollEffects();
        this.setupParallax();
        this.loadFeaturedProducts();
        this.updateCartUI();
    }

    // ===== PRODUCT MANAGEMENT =====
    async loadProducts() {
        try {
            const response = await fetch('tables/products');
            const data = await response.json();
            this.products = data.data || [];
            this.filteredProducts = [...this.products];
        } catch (error) {
            console.error('Error loading products:', error);
            // Fallback to localStorage if API fails
            this.loadProductsFromStorage();
        }
    }

    loadProductsFromStorage() {
        const storedProducts = localStorage.getItem('moka_products');
        if (storedProducts) {
            this.products = JSON.parse(storedProducts);
            this.filteredProducts = [...this.products];
        }
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Navigation scroll effect
        window.addEventListener('scroll', this.handleScroll.bind(this));
        
        // Mobile menu toggle
        const menuToggle = document.getElementById('menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', this.toggleMobileMenu.bind(this));
        }

        // Newsletter form
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', this.handleNewsletterSubmit.bind(this));
        }

        // Search functionality
        const searchIcon = document.querySelector('.search-icon');
        if (searchIcon) {
            searchIcon.addEventListener('click', this.toggleSearch.bind(this));
        }

        // Smooth scrolling for anchor links
        this.setupSmoothScrolling();

        // Window resize handler
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    // ===== SCROLL EFFECTS =====
    handleScroll() {
        const navbar = document.getElementById('navbar');
        const scrollY = window.scrollY;

        // Navbar background on scroll
        if (scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Reveal animations
        this.revealOnScroll();
    }

    revealOnScroll() {
        const reveals = document.querySelectorAll('.scroll-reveal');
        
        reveals.forEach(element => {
            const windowHeight = window.innerHeight;
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;

            if (elementTop < windowHeight - elementVisible) {
                element.classList.add('revealed');
            }
        });
    }

    setupScrollEffects() {
        // Add scroll-reveal class to elements that should animate
        const elementsToReveal = [
            '.section-header',
            '.product-card',
            '.collection-item',
            '.about-text'
        ];

        elementsToReveal.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => el.classList.add('scroll-reveal'));
        });
    }

    // ===== PARALLAX EFFECTS =====
    setupParallax() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallax = document.querySelector('.parallax-bg');
            
            if (parallax) {
                const speed = scrolled * 0.5;
                parallax.style.transform = `translateY(${speed}px)`;
            }
        });
    }

    // ===== MOBILE MENU =====
    toggleMobileMenu() {
        const navLinks = document.querySelector('.nav-links');
        const menuToggle = document.getElementById('menu-toggle');
        
        navLinks.classList.toggle('mobile-active');
        menuToggle.classList.toggle('active');
    }

    // ===== SEARCH FUNCTIONALITY =====
    toggleSearch() {
        // Create search overlay if it doesn't exist
        let searchOverlay = document.getElementById('search-overlay');
        
        if (!searchOverlay) {
            searchOverlay = this.createSearchOverlay();
            document.body.appendChild(searchOverlay);
        }
        
        searchOverlay.classList.toggle('active');
        
        if (searchOverlay.classList.contains('active')) {
            const searchInput = searchOverlay.querySelector('input');
            setTimeout(() => searchInput.focus(), 100);
        }
    }

    createSearchOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'search-overlay';
        overlay.className = 'search-overlay';
        
        overlay.innerHTML = `
            <div class="search-content">
                <div class="search-header">
                    <h2>Search Products</h2>
                    <button class="search-close" onclick="mokaApp.toggleSearch()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="search-form">
                    <input type="text" placeholder="Search for products..." id="search-input">
                    <button type="submit"><i class="fas fa-search"></i></button>
                </div>
                <div class="search-results" id="search-results"></div>
            </div>
        `;

        // Add search functionality
        const searchInput = overlay.querySelector('#search-input');
        searchInput.addEventListener('input', (e) => {
            this.performSearch(e.target.value);
        });

        return overlay;
    }

    async performSearch(query) {
        if (query.length < 2) {
            document.getElementById('search-results').innerHTML = '';
            return;
        }

        const filteredProducts = this.products.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase()) ||
            product.description.toLowerCase().includes(query.toLowerCase())
        );

        this.displaySearchResults(filteredProducts);
    }

    displaySearchResults(products) {
        const resultsContainer = document.getElementById('search-results');
        
        if (products.length === 0) {
            resultsContainer.innerHTML = '<p class="no-results">No products found</p>';
            return;
        }

        const resultsHTML = products.map(product => `
            <div class="search-result-item" onclick="mokaApp.goToProduct('${product.id}')">
                <img src="${product.image_url}" alt="${product.name}">
                <div class="result-info">
                    <h4>${product.name}</h4>
                    <p class="result-category">${product.category}</p>
                    <span class="result-price">$${product.price}</span>
                </div>
            </div>
        `).join('');

        resultsContainer.innerHTML = resultsHTML;
    }

    // ===== NEWSLETTER =====
    handleNewsletterSubmit(e) {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        
        // Simulate newsletter signup
        this.showNotification('Thank you for subscribing to our newsletter!', 'success');
        e.target.reset();
    }

    // ===== FEATURED PRODUCTS =====
    loadFeaturedProducts() {
        const featuredContainer = document.getElementById('featured-products');
        if (!featuredContainer) return;

        const featuredProducts = this.products.filter(product => product.featured);
        
        if (featuredProducts.length === 0) {
            featuredContainer.innerHTML = '<p class="no-products">No featured products available.</p>';
            return;
        }

        const productsHTML = featuredProducts.map(product => this.createProductCard(product)).join('');
        featuredContainer.innerHTML = productsHTML;
    }

    createProductCard(product) {
        const firstShade = Array.isArray(product.shades) ? product.shades[0] : 'Default';
        
        return `
            <div class="product-card interactive-glow" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image_url}" alt="${product.name}" loading="lazy">
                    <div class="product-overlay">
                        <button class="quick-view-btn" onclick="mokaApp.quickView('${product.id}')">Quick View</button>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-category">${product.category}</p>
                    <div class="product-rating">
                        ${this.createStarRating(product.rating)}
                    </div>
                    <div class="product-price">$${product.price}</div>
                    <div class="product-actions">
                        <button class="add-to-cart-btn" onclick="mokaApp.addToCart('${product.id}')">
                            Add to Cart
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

    // ===== PRODUCT ACTIONS =====
    quickView(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // Create and show modal
        this.showProductModal(product);
    }

    showProductModal(product) {
        // Remove existing modal
        const existingModal = document.getElementById('product-modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'product-modal';
        modal.className = 'product-modal';
        
        const shadesHTML = Array.isArray(product.shades) ? 
            product.shades.map(shade => `<span class="shade-option" onclick="mokaApp.selectShade('${shade}')">${shade}</span>`).join('') :
            '<span class="shade-option">Default</span>';

        modal.innerHTML = `
            <div class="modal-overlay" onclick="mokaApp.closeModal()"></div>
            <div class="modal-content">
                <button class="modal-close" onclick="mokaApp.closeModal()">
                    <i class="fas fa-times"></i>
                </button>
                <div class="modal-body">
                    <div class="modal-image">
                        <img src="${product.image_url}" alt="${product.name}">
                    </div>
                    <div class="modal-info">
                        <h2>${product.name}</h2>
                        <p class="modal-category">${product.category}</p>
                        <div class="modal-rating">
                            ${this.createStarRating(product.rating)}
                        </div>
                        <div class="modal-price">$${product.price}</div>
                        <div class="modal-description">
                            <p>${product.description}</p>
                        </div>
                        <div class="modal-shades">
                            <h4>Available Shades:</h4>
                            <div class="shades-container">
                                ${shadesHTML}
                            </div>
                        </div>
                        <div class="modal-actions">
                            <button class="btn-primary" onclick="mokaApp.addToCart('${product.id}')">
                                Add to Cart - $${product.price}
                            </button>
                            <button class="btn-secondary" onclick="mokaApp.goToProduct('${product.id}')">
                                View Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
    }

    closeModal() {
        const modal = document.getElementById('product-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }

        const searchOverlay = document.getElementById('search-overlay');
        if (searchOverlay) {
            searchOverlay.classList.remove('active');
        }
    }

    selectShade(shade) {
        // Update selected shade
        const shadeOptions = document.querySelectorAll('.shade-option');
        shadeOptions.forEach(option => option.classList.remove('selected'));
        
        const selectedOption = Array.from(shadeOptions).find(option => option.textContent === shade);
        if (selectedOption) selectedOption.classList.add('selected');
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // Get selected shade if any
        const selectedShade = document.querySelector('.shade-option.selected');
        const shade = selectedShade ? selectedShade.textContent : (Array.isArray(product.shades) ? product.shades[0] : 'Default');

        const cartItem = {
            id: productId,
            name: product.name,
            price: product.price,
            image: product.image_url,
            shade: shade,
            quantity: 1
        };

        // Add to cart (handled by cart.js)
        if (window.cart) {
            window.cart.addItem(cartItem);
            this.showNotification(`${product.name} added to cart!`, 'success');
            this.closeModal();
        }
    }

    goToProduct(productId) {
        window.location.href = `product-detail.html?id=${productId}`;
    }

    // ===== NOTIFICATIONS =====
    showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) existingNotification.remove();

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // ===== SMOOTH SCROLLING =====
    setupSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 100;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ===== UTILITY FUNCTIONS =====
    updateCartUI() {
        // Update cart count in navigation
        if (window.cart) {
            const cartCount = document.getElementById('cart-count');
            if (cartCount) {
                cartCount.textContent = window.cart.getItemCount();
            }
        }
    }

    handleResize() {
        // Handle responsive adjustments
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // Mobile-specific adjustments
            this.setupMobileOptimizations();
        }
    }

    setupMobileOptimizations() {
        // Add mobile-specific optimizations
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            card.addEventListener('touchstart', () => {
                card.classList.add('touch-active');
            });
            
            card.addEventListener('touchend', () => {
                setTimeout(() => {
                    card.classList.remove('touch-active');
                }, 150);
            });
        });
    }
}

// ===== GLOBAL FUNCTIONS =====
function toggleCart() {
    if (window.cart) {
        window.cart.toggle();
    }
}

function checkout() {
    if (window.cart) {
        window.cart.checkout();
    }
}

// ===== INITIALIZATION =====
let mokaApp;

document.addEventListener('DOMContentLoaded', () => {
    mokaApp = new MokaApp();
});