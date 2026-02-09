/**
 * Theme Management System
 * Handles light/dark mode switching with localStorage persistence
 * WCAG AA compliant with smooth transitions
 */

(function() {
    'use strict';

    const ThemeManager = {
        STORAGE_KEY: 'padaone-theme',
        DARK: 'dark',
        LIGHT: 'light',

        /**
         * Initialize theme system
         * Loads saved preference or defaults to dark
         */
        init() {
            const savedTheme = this.getSavedTheme();
            this.applyTheme(savedTheme, false);
            this.setupToggleListeners();
        },

        /**
         * Get theme from localStorage or system preference
         */
        getSavedTheme() {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) return saved;

            // Check system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                return this.LIGHT;
            }
            return this.DARK;
        },

        /**
         * Apply theme to document
         */
        applyTheme(theme, animate = true) {
            if (!animate) {
                document.documentElement.style.transition = 'none';
            }

            if (theme === this.LIGHT) {
                document.documentElement.setAttribute('data-theme', 'light');
            } else {
                document.documentElement.removeAttribute('data-theme');
            }

            if (!animate) {
                // Force reflow
                void document.documentElement.offsetHeight;
                document.documentElement.style.transition = '';
            }

            this.updateToggleButtons(theme);
        },

        /**
         * Toggle between themes
         */
        toggle() {
            const current = document.documentElement.getAttribute('data-theme') === 'light' 
                ? this.LIGHT 
                : this.DARK;
            const next = current === this.DARK ? this.LIGHT : this.DARK;
            
            this.applyTheme(next, true);
            localStorage.setItem(this.STORAGE_KEY, next);
        },

        /**
         * Update all toggle buttons in the page
         */
        updateToggleButtons(theme) {
            const buttons = document.querySelectorAll('.theme-toggle');
            buttons.forEach(btn => {
                const icon = btn.querySelector('i');
                if (icon) {
                    if (theme === this.LIGHT) {
                        icon.className = 'ph ph-moon';
                        btn.setAttribute('aria-label', 'Ativar modo escuro');
                        btn.setAttribute('title', 'Modo escuro');
                    } else {
                        icon.className = 'ph ph-sun';
                        btn.setAttribute('aria-label', 'Ativar modo claro');
                        btn.setAttribute('title', 'Modo claro');
                    }
                }
            });
        },

        /**
         * Setup event listeners for toggle buttons
         */
        setupToggleListeners() {
            document.addEventListener('click', (e) => {
                const toggleBtn = e.target.closest('.theme-toggle');
                if (toggleBtn) {
                    e.preventDefault();
                    this.toggle();
                }
            });
        }
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
    } else {
        ThemeManager.init();
    }

    // Expose to global scope
    window.ThemeManager = ThemeManager;
})();
