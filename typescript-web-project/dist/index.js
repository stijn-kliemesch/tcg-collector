// Main application class
class App {
    constructor() {
        this.clickCount = 0;
        this.button = document.getElementById('clickBtn');
        this.output = document.getElementById('output');
        if (!this.button || !this.output) {
            throw new Error('Required DOM elements not found');
        }
        this.init();
    }
    init() {
        this.button.addEventListener('click', this.handleClick.bind(this));
        this.updateOutput();
        console.log('TypeScript app initialized successfully!');
    }
    handleClick() {
        this.clickCount++;
        this.updateOutput();
        this.showClickAnimation();
    }
    updateOutput() {
        const message = this.clickCount === 0
            ? 'Click the button to get started!'
            : `Button clicked ${this.clickCount} time${this.clickCount === 1 ? '' : 's'}!`;
        this.output.textContent = message;
    }
    showClickAnimation() {
        this.button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.button.style.transform = '';
        }, 100);
    }
    // Public method to get current click count
    getClickCount() {
        return this.clickCount;
    }
    // Public method to reset counter
    reset() {
        this.clickCount = 0;
        this.updateOutput();
    }
}
// Utility functions
var Utils;
(function (Utils) {
    function formatDate(date) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    Utils.formatDate = formatDate;
    function debounce(func, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(null, args), delay);
        };
    }
    Utils.debounce = debounce;
})(Utils || (Utils = {}));
// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        const app = new App();
        // Make app available globally for debugging
        window.app = app;
        window.utils = Utils;
        console.log('App started on:', Utils.formatDate(new Date()));
    }
    catch (error) {
        console.error('Failed to initialize app:', error);
    }
});
//# sourceMappingURL=index.js.map