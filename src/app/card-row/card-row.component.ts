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

    @Input() retardCards: RetardCard[];
    cards: Card[];
    constructor() {
    }

    ngOnInit(): void {
        this.cards = this.retardCards.map(c => c.card).sort((a, b) =>
            Date.parse(b.released_at) - Date.parse(a.released_at));
    }

}
