import {Injectable} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {debounceTime, distinctUntilChanged} from "rxjs/operators";


@Injectable({ providedIn: 'root' })
export class SharedService {

    getSearchTerm() {
        return new Subject<string>();
    }

    search(terms: Observable<string>) {
        return terms.pipe(debounceTime(350), distinctUntilChanged());
    }
}
