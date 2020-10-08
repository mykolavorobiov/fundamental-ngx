interface StringKey<T> {
    [key: string]: T;
}

interface SanitizeWrapper {
    iframe: HTMLIFrameElement | null;
    iframeDoc: Document | null;
}

export class HtmlSanitizer {
    tagWhitelist: StringKey<boolean> = {};
    attributeWhitelist: StringKey<string | boolean | Function> = {};

    private schemaWhiteList: string[] = ['http', 'https', 'ftp', 'mailto'];

    private uriAttributes: StringKey<boolean> = {
        href: true
    };

    private safeWrapper?: SanitizeWrapper = {
        iframe: null,
        iframeDoc: null
    };

    constructor() {
        this.extendTags();
    }

    get defTagWhitelist(): StringKey<boolean> {
        return {
            A: true,
            ABBR: true,
            BLOCKQUOTE: true,
            BR: true,
            CITE: true,
            CODE: true,
            DL: true,
            DT: true,
            DD: true,
            EM: true,
            H1: true,
            H2: true,
            H3: true,
            H4: true,
            H5: true,
            H6: true,
            P: true,
            PRE: true,
            STRONG: true,
            SPAN: true,
            U: true,
            UL: true,
            OL: true,
            LI: true
        };
    }

    get defAttributeWhitelist(): StringKey<string | boolean | Function> {
        return {
            class: true,
            style: true,
            href: true,
            target: '_blank',
            download: true,
            hreflang: true,
            rel: true,
            type: true,
            title: true
        };
    }

    extendTags(customTags?: StringKey<boolean | string>): void {
        this.tagWhitelist = { ...this.defTagWhitelist, ...customTags, BODY: true };
    }

    extendAttrs(customAttrs?: StringKey<boolean | string>): void {
        this.attributeWhitelist = { ...this.defAttributeWhitelist, ...customAttrs };
    }

    sanitizeHtml(input: string): string {
        input = input.trim();
        if (input.length === 0) {
            return '';
        }

        if (input === '<br>') {
            return '';
        }

        this.safeWrapper = this.getSafeWrapper();
        if (!this.safeWrapper) {
            return '';
        }

        this.safeWrapper.iframeDoc.body.innerHTML = input;

        const resultElement = this.makeSanitizedCopy(this.safeWrapper.iframeDoc.body);
        this.removeSafeWrapper();

        return resultElement.innerHTML;
    }

    private makeSanitizedCopy(node: Node): HTMLElement {
        let newNode = node;
        if (node.nodeType === Node.TEXT_NODE) {
            newNode = node.cloneNode(true) as HTMLElement;
        } else if (node.nodeType === Node.ELEMENT_NODE && this.tagWhitelist[(node as HTMLElement).tagName]) {
            newNode = this.extendLinkTarget(this.implementTag(node as HTMLElement));
        } else {
            newNode = document.createDocumentFragment();
        }

        return newNode as HTMLElement;
    }

    private implementTag(node: HTMLElement): HTMLElement {
        const newNode = this.safeWrapper.iframeDoc.createElement(node.tagName);

        for (const key in this.attributeWhitelist) {
            if (this.attributeWhitelist[key]) {
                const allowed = this.attributeWhitelist[key];
                const origin = node.getAttribute(key);

                if (key in node || key === 'class') {
                    if (this.uriAttributes[key] && this.validateBySchema(origin)) {
                        continue;
                    }
                    switch (typeof allowed) {
                        case 'string':
                            newNode.setAttribute(key, allowed);
                            break;
                        case 'function':
                            const setup = allowed.call(this, node, origin);
                            if (setup) {
                                newNode.setAttribute(key, setup);
                            }
                            break;
                        default:
                            if (allowed && origin) {
                                newNode.setAttribute(key, origin);
                            }
                    }
                }
            }
        }

        for (const child of Array.from(node.childNodes)) {
            const subCopy = this.makeSanitizedCopy(child);
            if (subCopy) {
                newNode.appendChild(subCopy);
            }
        }

        return newNode;
    }

    private extendLinkTarget(node: HTMLElement): HTMLElement {
        if (node.tagName === 'A') {
            if (!node.getAttribute('href') || /^\#/.test(node.getAttribute('href'))) {
                node.removeAttribute('target');
            } else {
                const defTarget = this.attributeWhitelist['target'] || '_blank';
                node.setAttribute('target', defTarget.toString());
            }
        }

        return node;
    }

    private getSafeWrapper(): SanitizeWrapper {
        const iframe = document.createElement('iframe');
        if (iframe.sandbox === undefined) {
            console.warn('Your browser does not support sandboxed iframes. Please upgrade to a modern browser.');
            return null;
        }
        iframe.setAttribute('sandbox', 'allow-same-origin');
        iframe.style.setProperty('display', 'none');
        document.body.appendChild(iframe);
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (iframeDoc.body === null) {
            iframeDoc.write('<body></body>');
        }

        return { iframe: iframe, iframeDoc: iframeDoc };
    }

    private removeSafeWrapper(): void {
        if (this.safeWrapper.iframe) {
            document.body.removeChild(this.safeWrapper.iframe);
        }
    }

    private validateBySchema(value: string): boolean {
        return !!value && value.indexOf(':') > -1 && !this.startsWithAny(value, this.schemaWhiteList);
    }

    private startsWithAny(str: string, substrings: string[]): boolean {
        return !!str && substrings.some((value) => str.indexOf(value) === 0);
    }
}
