// Main application class
class App {
    private clickCount: number = 0;
    private button: HTMLButtonElement;
    private output: HTMLElement;

    constructor() {
        this.button = document.getElementById('clickBtn') as HTMLButtonElement;
        this.output = document.getElementById('output') as HTMLElement;
        
        if (!this.button || !this.output) {
            throw new Error('Required DOM elements not found');
        }

        this.init();
    }

    private init(): void {
        this.button.addEventListener('click', this.handleClick.bind(this));
        this.updateOutput();
        console.log('TypeScript app initialized successfully!');
    }

    private handleClick(): void {
        this.clickCount++;
        this.updateOutput();
        this.showClickAnimation();
    }

    private updateOutput(): void {
        const message = this.clickCount === 0 
            ? 'Click the button to get started!' 
            : `Button clicked ${this.clickCount} time${this.clickCount === 1 ? '' : 's'}!`;
        
        this.output.textContent = message;
    }

    private showClickAnimation(): void {
        this.button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.button.style.transform = '';
        }, 100);
    }

    // Public method to get current click count
    public getClickCount(): number {
        return this.clickCount;
    }

    // Public method to reset counter
    public reset(): void {
        this.clickCount = 0;
        this.updateOutput();
    }
}

// Utility functions
namespace Utils {
    export function formatDate(date: Date): string {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    export function debounce<T extends (...args: any[]) => void>(
        func: T,
        delay: number
    ): (...args: Parameters<T>) => void {
        let timeoutId: NodeJS.Timeout;
        return (...args: Parameters<T>) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(null, args), delay);
        };
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        const app = new App();
        
        // Make app available globally for debugging
        (window as any).app = app;
        (window as any).utils = Utils;
        
        console.log('App started on:', Utils.formatDate(new Date()));
    } catch (error) {
        console.error('Failed to initialize app:', error);
    }
});