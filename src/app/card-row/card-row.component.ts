import {Component, Input, OnInit} from '@angular/core';
import * as scry from 'scryfall-sdk';
import {Card, SearchOptions} from 'scryfall-sdk';
import {RetardCard} from '../../model/cardEx';

@Component({
    selector: 'app-card-row',
    templateUrl: './card-row.component.html',
    styleUrls: ['./card-row.component.scss']
})
export class CardRowComponent implements OnInit {

    @Input() cards: Card[];
    constructor() {
    }

    ngOnInit(): void {
        this.cards = this.cards.sort((a, b) =>
            Date.parse(b.released_at) - Date.parse(a.released_at));
    }

}
