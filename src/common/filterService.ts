import {Injectable, EventEmitter} from 'angular2/angular2';
import {Pad, Page, Note} from './model';
import {clone} from './utils';

@Injectable()
export class FilterService {

    public filterChangeEvent: EventEmitter<string> = new EventEmitter();
    public clearFilterEvent: EventEmitter<boolean> = new EventEmitter();
    private filterTerm: string = '';

    public setFilterTerm(val: string) {
        if (val !== this.filterTerm) {
            this.filterTerm = val.toLowerCase();
            this.filterChangeEvent.next(this.filterTerm);
        }
    }

    public clearFilter() {
        this.filterTerm = '';
        this.clearFilterEvent.next(true);
    }

    /**
     * Returns a copy of the padList which contains those pads whose title
     * matches the current filterTerm.
     */
    public filterPadList(padList: Pad[]): Pad[] {
        if (this.filterTerm === '') {
            return padList;
        }
        return padList.filter((pad: Pad) => this.matches(pad.title));
    }

    /**
     * Returns a copy of the pad, including only those pages whose title matches the
     * current filterTerm, OR those pages which contain notes whose contents match.
     */
    public filterPad(pad: Pad): Pad {
        let padClone: Pad = clone(pad);
        if (!pad || !pad.pages || this.filterTerm === '') {
            return padClone;
        }
        padClone.pages = padClone.pages
            .map((page: Page) => {
                page.notes = page.notes.filter((note: Note) => this.matches(note.content));
                return page;
            })
            .filter((page: Page) => {
                return (this.matches(page.title) || 0 < page.notes.length);
            });

        return padClone;
    }

    private matches(value: string): boolean {
        return -1 < value.toLowerCase().indexOf(this.filterTerm);
    }
}