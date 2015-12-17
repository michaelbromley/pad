
export class Scroller {

    public scrollIntoView(itemId: string) {
        let el = <any>document.querySelector('#_' + itemId);
        if (el) {
            let rect = el.getBoundingClientRect();

            if (!this.isElementInViewport(rect)) {
                el.scrollIntoView();
            }
        }
    }

    /**
     * Adapted from http://stackoverflow.com/a/7557433/772859
     */
    private isElementInViewport (rect: ClientRect) {
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

}