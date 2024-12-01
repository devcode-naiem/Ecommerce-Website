class NavFootManager {
    constructor() {
        // Store references to navigation elements
        this.cartCount = null;
        this.userMenu = null;
        this.userName = null;
        this.userDropdown = null;
        this.profileIcon = null;
        this.guestMenu = null;
        this.adminSection = null;
        this.adminBadge = null;
        
        // Initialize the navigation and footer
        this.init();
    }

    async init() {
        await this.insertNavigation();
        await this.insertFooter();
        this.initializeNavigation();
        this.setupEventListeners();
        this.updateCartCount();
        this.updateUserInterface();
    }

    async insertNavigation() {
        const navPlaceholder = document.getElementById('navbar');
        if (navPlaceholder) {
            try {
                const response = await fetch('/navbar.html');
                const html = await response.text();
                navPlaceholder.innerHTML = html;
                
                // Store references after navigation is inserted
                this.cartCount = document.querySelector('.cart-count');
                this.userMenu = document.getElementById('userMenu');
                this.guestMenu = document.getElementById('guestMenu');
                this.userName = document.querySelector('.user-name');
                this.userDropdown = document.querySelector('.user-dropdown');
                this.profileIcon = document.querySelector('.profile-icon');
                this.adminSection = document.getElementById('adminSection');
                this.adminBadge = document.getElementById('adminBadge');
            } catch (error) {
                console.error('Failed to load navigation:', error);
            }
        }
    }

    async insertFooter() {
        const footerPlaceholder = document.getElementById('footer');
        if (footerPlaceholder) {
            try {
                const response = await fetch('/footer.html');
                const html = await response.text();
                footerPlaceholder.innerHTML = html;
            } catch (error) {
                console.error('Failed to load footer:', error);
            }
        }
    }

    initializeNavigation() {
        if (this.userMenu) {
            this.userMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                this.userDropdown.classList.toggle('active');
            });

            document.addEventListener('click', () => {
                this.userDropdown.classList.remove('active');
            });
        }

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
    }

    setupEventListeners() {
        window.addEventListener('cartUpdated', () => {
            this.updateCartCount();
        });

        window.addEventListener('userUpdated', () => {
            this.updateUserInterface();
        });
    }

    updateCartCount() {
        if (this.cartCount) {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
            this.cartCount.textContent = totalItems;
            this.cartCount.style.display = totalItems > 0 ? 'block' : 'none';
        }
    }

    updateUserInterface() {
        const userData = JSON.parse(sessionStorage.getItem('userData'));
        
        if (userData) {
            // User is logged in
            this.guestMenu.style.display = 'none';
            this.userMenu.style.display = 'flex';
            this.userName.textContent = userData.name;
            this.profileIcon.textContent = userData.name.charAt(0).toUpperCase();

            // Check if user is admin
            if (userData.role === 'admin') {
                this.adminSection.style.display = 'block';
                this.adminBadge.style.display = 'inline-block';
            } else {
                this.adminSection.style.display = 'none';
                this.adminBadge.style.display = 'none';
            }
        } else {
            // User is not logged in
            this.guestMenu.style.display = 'flex';
            this.userMenu.style.display = 'none';
        }
    }

    async handleLogout() {
        try {
            localStorage.removeItem('userToken');
            sessionStorage.removeItem('userData');
            
            await fetch('http://localhost:3000/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            
            window.location.href = '/';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    new NavFootManager();
});