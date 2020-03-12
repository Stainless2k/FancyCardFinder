import {Card} from 'scryfall-sdk';
import * as Collections from 'typescript-collections';

export class RetardCard {
    card: Card

    constructor(card: Card) {
        this.card = card;
    }

    toString() {
        return Collections.util.makeString(this.card);
    }
}
