// navfoot.js

class NavFootManager {
    constructor() {
        // Store references to navigation elements
        this.cartCount = null;
        this.userMenu = null;
        this.userName = null;
        this.userDropdown = null;
        this.profileIcon = null;
        
        // Initialize the navigation and footer
        this.init();
    }

    async init() {
        // Insert navigation and footer
        await this.insertNavigation();
        await this.insertFooter();
        
        // Initialize navigation functionality
        this.initializeNavigation();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Update cart count and user info
        this.updateCartCount();
        this.updateUserInfo();
    }

    async insertNavigation() {
        const navPlaceholder = document.getElementById('navbar');
        if (navPlaceholder) {
            try {
                const response = await fetch('/Navbar.html');
                const html = await response.text();
                navPlaceholder.innerHTML = html;
                
                // Store references after navigation is inserted
                this.cartCount = document.querySelector('.cart-count');
                this.userMenu = document.querySelector('.user-menu');
                this.userName = document.querySelector('.user-name');
                this.userDropdown = document.querySelector('.user-dropdown');
                this.profileIcon = document.querySelector('.profile-icon');
            } catch (error) {
                console.error('Failed to load navigation:', error);
            }
        }
    }

    async insertFooter() {
        const footerPlaceholder = document.getElementById('footer');
        if (footerPlaceholder) {
            try {
                const response = await fetch('/Footer.html');
                const html = await response.text();
                footerPlaceholder.innerHTML = html;
            } catch (error) {
                console.error('Failed to load footer:', error);
            }
        }
    }

    initializeNavigation() {
        // Initialize user dropdown functionality
        if (this.userMenu) {
            this.userMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                this.userDropdown.classList.toggle('active');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                this.userDropdown.classList.remove('active');
            });
        }

        // Initialize logout functionality
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
    }

    setupEventListeners() {
        // Listen for cart updates
        window.addEventListener('cartUpdated', () => {
            this.updateCartCount();
        });

        // Listen for user updates
        window.addEventListener('userUpdated', () => {
            this.updateUserInfo();
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

    updateUserInfo() {
        if (this.userName && this.profileIcon) {
            const userData = JSON.parse(sessionStorage.getItem('userData'));
            
            if (userData) {
                // User is logged in
                this.userName.textContent = userData.name;
                this.profileIcon.textContent = userData.name.charAt(0).toUpperCase();
                this.userMenu.style.display = 'block';
                
                // Show profile-related links
                const authLinks = document.querySelectorAll('.auth-link');
                authLinks.forEach(link => link.style.display = 'none');
            } else {
                // User is not logged in
                this.userName.textContent = 'Guest';
                this.profileIcon.textContent = 'G';
                this.userMenu.style.display = 'none';
                
                // Show auth links
                const authLinks = document.querySelectorAll('.auth-link');
                authLinks.forEach(link => link.style.display = 'block');
            }
        }
    }

    async handleLogout() {
        try {
            // Clear local storage
            localStorage.removeItem('userToken');
            sessionStorage.removeItem('userData');
            
            // Call logout API
            await fetch('http://localhost:3000/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            
            // Redirect to home page
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

// Export for use in other scripts if needed
export default NavFootManager;