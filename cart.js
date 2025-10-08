// ===== SHOPPING CART FUNCTIONALITY =====

class ShoppingCart {
    constructor() {
        this.items = [];
        this.isOpen = false;
        this.loadFromStorage();
        this.init();
    }

    init() {
        this.updateUI();
        this.setupEventListeners();
    }

    // ===== STORAGE MANAGEMENT =====
    saveToStorage() {
        localStorage.setItem('moka_cart', JSON.stringify(this.items));
    }

    loadFromStorage() {
        const storedCart = localStorage.getItem('moka_cart');
        if (storedCart) {
            this.items = JSON.parse(storedCart);
        }
    }

    // ===== CART OPERATIONS =====
    addItem(item) {
        const existingItem = this.items.find(cartItem => 
            cartItem.id === item.id && cartItem.shade === item.shade
        );

        if (existingItem) {
            existingItem.quantity += item.quantity || 1;
        } else {
            this.items.push({
                ...item,
                quantity: item.quantity || 1,
                addedAt: new Date().toISOString()
            });
        }

        this.saveToStorage();
        this.updateUI();
        this.animateCartIcon();
    }

    removeItem(itemId, shade) {
        this.items = this.items.filter(item => 
            !(item.id === itemId && item.shade === shade)
        );
        this.saveToStorage();
        this.updateUI();
    }

    updateQuantity(itemId, shade, newQuantity) {
        const item = this.items.find(cartItem => 
            cartItem.id === itemId && cartItem.shade === shade
        );

        if (item) {
            if (newQuantity <= 0) {
                this.removeItem(itemId, shade);
            } else {
                item.quantity = newQuantity;
                this.saveToStorage();
                this.updateUI();
            }
        }
    }

    clearCart() {
        this.items = [];
        this.saveToStorage();
        this.updateUI();
    }

    // ===== CART UI MANAGEMENT =====
    toggle() {
        this.isOpen = !this.isOpen;
        const sidebar = document.getElementById('cart-sidebar');
        const overlay = document.getElementById('cart-overlay');

        if (this.isOpen) {
            sidebar.classList.add('open');
            overlay.classList.add('open');
            document.body.style.overflow = 'hidden';
        } else {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    updateUI() {
        this.updateCartCount();
        this.updateCartContent();
        this.updateCartTotal();
    }

    updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            const totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
            cartCount.textContent = totalItems;
            
            if (totalItems > 0) {
                cartCount.style.display = 'flex';
            } else {
                cartCount.style.display = 'none';
            }
        }
    }

    updateCartContent() {
        const cartContent = document.getElementById('cart-content');
        const emptyCart = document.getElementById('empty-cart');
        const cartItems = document.getElementById('cart-items');
        const cartFooter = document.getElementById('cart-footer');

        if (!cartContent) return;

        if (this.items.length === 0) {
            emptyCart.style.display = 'block';
            cartItems.style.display = 'none';
            cartFooter.style.display = 'none';
        } else {
            emptyCart.style.display = 'none';
            cartItems.style.display = 'block';
            cartFooter.style.display = 'block';
            
            this.renderCartItems();
        }
    }

    renderCartItems() {
        const cartItems = document.getElementById('cart-items');
        if (!cartItems) return;

        const itemsHTML = this.items.map(item => this.createCartItemHTML(item)).join('');
        cartItems.innerHTML = itemsHTML;
    }

    createCartItemHTML(item) {
        return `
            <div class="cart-item" data-item-id="${item.id}" data-shade="${item.shade}">
                <div class="item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="item-details">
                    <h4 class="item-name">${item.name}</h4>
                    <p class="item-shade">Shade: ${item.shade}</p>
                    <div class="item-price">$${item.price}</div>
                </div>
                <div class="item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn minus" onclick="cart.updateQuantity('${item.id}', '${item.shade}', ${item.quantity - 1})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" onclick="cart.updateQuantity('${item.id}', '${item.shade}', ${item.quantity + 1})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="remove-btn" onclick="cart.removeItem('${item.id}', '${item.shade}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    updateCartTotal() {
        const cartSubtotal = document.getElementById('cart-subtotal');
        if (!cartSubtotal) return;

        const subtotal = this.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);

        cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    }

    // ===== ANIMATIONS =====
    animateCartIcon() {
        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon) {
            cartIcon.classList.add('bounce');
            setTimeout(() => {
                cartIcon.classList.remove('bounce');
            }, 600);
        }
    }

    // ===== CHECKOUT PROCESS =====
    checkout() {
        if (this.items.length === 0) {
            this.showNotification('Your cart is empty!', 'warning');
            return;
        }

        // Create checkout modal
        this.showCheckoutModal();
    }

    showCheckoutModal() {
        // Remove existing modal
        const existingModal = document.getElementById('checkout-modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'checkout-modal';
        modal.className = 'checkout-modal';
        
        const subtotal = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        const tax = subtotal * 0.08; // 8% tax
        const shipping = subtotal > 100 ? 0 : 15; // Free shipping over $100
        const total = subtotal + tax + shipping;

        modal.innerHTML = `
            <div class="modal-overlay" onclick="cart.closeCheckoutModal()"></div>
            <div class="modal-content checkout-content">
                <div class="checkout-header">
                    <h2>Checkout</h2>
                    <button class="modal-close" onclick="cart.closeCheckoutModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="checkout-body">
                    <div class="checkout-section">
                        <h3>Order Summary</h3>
                        <div class="order-items">
                            ${this.items.map(item => `
                                <div class="order-item">
                                    <span class="item-info">${item.name} (${item.shade}) × ${item.quantity}</span>
                                    <span class="item-total">$${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="order-totals">
                            <div class="total-row">
                                <span>Subtotal:</span>
                                <span>$${subtotal.toFixed(2)}</span>
                            </div>
                            <div class="total-row">
                                <span>Tax:</span>
                                <span>$${tax.toFixed(2)}</span>
                            </div>
                            <div class="total-row">
                                <span>Shipping:</span>
                                <span>${shipping === 0 ? 'Free' : '$' + shipping.toFixed(2)}</span>
                            </div>
                            <div class="total-row final-total">
                                <span>Total:</span>
                                <span>$${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="checkout-section">
                        <h3>Customer Information</h3>
                        <form id="checkout-form" class="checkout-form">
                            <div class="form-group">
                                <label for="email">Email Address</label>
                                <input type="email" id="email" name="email" required>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="firstName">First Name</label>
                                    <input type="text" id="firstName" name="firstName" required>
                                </div>
                                <div class="form-group">
                                    <label for="lastName">Last Name</label>
                                    <input type="text" id="lastName" name="lastName" required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="address">Address</label>
                                <input type="text" id="address" name="address" required>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="city">City</label>
                                    <input type="text" id="city" name="city" required>
                                </div>
                                <div class="form-group">
                                    <label for="zipCode">ZIP Code</label>
                                    <input type="text" id="zipCode" name="zipCode" required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="cardNumber">Card Number</label>
                                <input type="text" id="cardNumber" name="cardNumber" placeholder="1234 5678 9012 3456" required>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="expiryDate">Expiry Date</label>
                                    <input type="text" id="expiryDate" name="expiryDate" placeholder="MM/YY" required>
                                </div>
                                <div class="form-group">
                                    <label for="cvv">CVV</label>
                                    <input type="text" id="cvv" name="cvv" placeholder="123" required>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                
                <div class="checkout-footer">
                    <button class="btn-secondary" onclick="cart.closeCheckoutModal()">
                        Continue Shopping
                    </button>
                    <button class="btn-primary" onclick="cart.processOrder()">
                        Place Order - $${total.toFixed(2)}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
        
        // Setup form validation
        this.setupCheckoutForm();
    }

    setupCheckoutForm() {
        const form = document.getElementById('checkout-form');
        if (!form) return;

        // Card number formatting
        const cardInput = document.getElementById('cardNumber');
        cardInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            
            e.target.value = formattedValue;
        });

        // Expiry date formatting
        const expiryInput = document.getElementById('expiryDate');
        expiryInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });

        // CVV validation
        const cvvInput = document.getElementById('cvv');
        cvvInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
        });
    }

    closeCheckoutModal() {
        const modal = document.getElementById('checkout-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }

    processOrder() {
        const form = document.getElementById('checkout-form');
        if (!form || !form.checkValidity()) {
            this.showNotification('Please fill in all required fields correctly.', 'error');
            return;
        }

        // Simulate order processing
        this.showOrderProcessing();
        
        setTimeout(() => {
            this.completeOrder();
        }, 3000);
    }

    showOrderProcessing() {
        const modal = document.getElementById('checkout-modal');
        const content = modal.querySelector('.checkout-content');
        
        content.innerHTML = `
            <div class="processing-order">
                <div class="loading-spinner"></div>
                <h2>Processing Your Order</h2>
                <p>Please wait while we process your payment...</p>
            </div>
        `;
    }

    completeOrder() {
        const orderNumber = 'MKA' + Date.now().toString().slice(-6);
        
        // Clear cart
        this.clearCart();
        
        // Show success message
        const modal = document.getElementById('checkout-modal');
        const content = modal.querySelector('.checkout-content');
        
        content.innerHTML = `
            <div class="order-success">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2>Order Confirmed!</h2>
                <p>Thank you for your purchase. Your order number is:</p>
                <div class="order-number">${orderNumber}</div>
                <p>You will receive a confirmation email shortly.</p>
                <div class="success-actions">
                    <button class="btn-primary" onclick="cart.closeCheckoutModal(); location.reload();">
                        Continue Shopping
                    </button>
                </div>
            </div>
        `;
        
        // Close cart sidebar
        this.toggle();
        
        // Show success notification
        setTimeout(() => {
            this.showNotification('Order placed successfully!', 'success');
        }, 500);
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Close cart when clicking outside
        document.addEventListener('click', (e) => {
            const cartSidebar = document.getElementById('cart-sidebar');
            const cartIcon = document.querySelector('.cart-icon');
            
            if (this.isOpen && !cartSidebar.contains(e.target) && !cartIcon.contains(e.target)) {
                this.toggle();
            }
        });

        // Prevent cart from closing when clicking inside
        const cartSidebar = document.getElementById('cart-sidebar');
        if (cartSidebar) {
            cartSidebar.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }

    // ===== UTILITY FUNCTIONS =====
    getItemCount() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    getSubtotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    showNotification(message, type = 'info') {
        // Use the main app's notification system if available
        if (window.mokaApp) {
            window.mokaApp.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// ===== INITIALIZATION =====
let cart;

document.addEventListener('DOMContentLoaded', () => {
    cart = new ShoppingCart();
    
    // Make cart globally accessible
    window.cart = cart;
    
    // Update UI after cart is initialized
    if (window.mokaApp) {
        window.mokaApp.updateCartUI();
    }
});