import {Component, OnDestroy, OnInit} from '@angular/core';
import * as scry from 'scryfall-sdk';
import {Card, SearchOptions} from 'scryfall-sdk';
import * as Collections from 'typescript-collections';
import {RetardCard} from '../../model/cardEx';

@Component({
    selector: 'app-card-fetcher',
    templateUrl: './card-fetcher.component.html',
    styleUrls: ['./card-fetcher.component.scss']
})

export class CardFetcherComponent implements OnInit, OnDestroy {

    static CARDNOTFOUND = 'YOU ABSOLUTE BUFFON THERE IS NO CARD NAMED ';
    static OPTIONS_ART: SearchOptions = {unique: 'art', order: 'released', include_extras: true};
    static OPTIONS_PRINTS: SearchOptions = {unique: 'prints', order: 'released', include_extras: true};

    decklist = 'trophy mage';
    cardsArray: Card[][] = [];
    errors: string[];
    getall = false;

    constructor() {
    }

    ngOnInit(): void {

    }

    fuckMKM() {
        this.decklist = this.decklist.replace(/Any\t\t≥.*$|≥.*$|^\d.*$|\/.*$/gm, '')
            .replace(/^\s*|^\n/gm, '');
    }

    fetchcards() {
        this.cardsArray = [];
        this.errors = [];
        this.fuckMKM();
        const names = this.decklist.split('\n');
        this.megaQuery(names);
    }

    async megaQuery(names: string[]) {
        let namesQuery = '';
        const rCards = new Collections.Set<RetardCard>();
        const cardMap = new Map<string, Card[]>();

        for (const name of names) {
            namesQuery += '!"' + name + '" or ';
        }
        namesQuery = '(' + namesQuery + ')';
        const foundCards = await this.getCards(namesQuery + '" game:paper', this.getOptions());
        foundCards.push(...(await this.getCards(namesQuery + '" game:paper -is:promo', this.getOptions())));
        foundCards.forEach(c => rCards.add(new RetardCard(c)));
        rCards.forEach(rc => {
            const cName = rc.card.name;
            if (cardMap.has(cName)) {
                cardMap.get(cName).push(rc.card);
            } else {
                cardMap.set(cName, [rc.card]);
            }
        });

        this.cardsArray = Array.from(cardMap.values());
    }

    private getOptions() {
        if (this.getall) {
            return CardFetcherComponent.OPTIONS_PRINTS;
        } else {
            return CardFetcherComponent.OPTIONS_ART;
        }
    }

    getCards(query: string, options: SearchOptions): Promise<Card[]> {
        const cards = scry.Cards.search(query, options)
            .on('end', () => {
                console.log(query + ' done');
            })
            .on('error', err => {
                console.error(err);
            })
            .waitForAll();
        return cards;
    }

    ngOnDestroy(): void {

    }

}

