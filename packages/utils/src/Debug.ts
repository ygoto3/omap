export default class Debug {

    static log(...messages: any[]): void {
        if (!Debug._enabled) return;
        console.log(...messages);
        if (Debug._overlayElement) {
            Debug._overlayElement.innerText = messages.join('\n') + '\n' + Debug._overlayElement.innerText;
        }
    }

    static error(...messages: any[]): void {
        if (!Debug._errorEnabled) return;
        console.error(...messages);
        if (Debug._overlayElement) {
            Debug._overlayElement.innerText = messages.join('\n') + '\n' + Debug._overlayElement.innerText;
        }
    }

    static enable(enable: boolean): void {
        Debug._enabled = enable;
    }

    static enableError(enable: boolean): void {
        Debug._errorEnabled = enable;
    }

    static displayOverlay(enable: boolean): void {
        if (enable) {
            if (!Debug._overlayElement) {
                Debug._overlayElement = document.createElement('p');
                Debug._overlayElement.style.position = 'fixed';
                Debug._overlayElement.style.bottom = '0';
                Debug._overlayElement.style.left = '0';
                Debug._overlayElement.style.width = '100%';
                Debug._overlayElement.style.height = '40%';
                Debug._overlayElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                Debug._overlayElement.style.color = 'white';
                Debug._overlayElement.style.zIndex = '9999';
                Debug._overlayElement.style.overflow = 'hidden';
                Debug._overlayElement.style.margin = '0';
                Debug._overlayElement.style.padding = '1em';
                Debug._overlayElement.style.boxSizing = 'border-box';
                document.body.appendChild(Debug._overlayElement);
            }
        } else {
            if (Debug._overlayElement) {
                document.body.removeChild(Debug._overlayElement);
                Debug._overlayElement = undefined;
            }
        }
    }
    
    private static _enabled: boolean = false;
    private static _errorEnabled: boolean = true;
    private static _overlayElement?: HTMLParagraphElement;

}