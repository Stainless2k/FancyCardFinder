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
    cards: Collections.Set<RetardCard>[] = [];
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
        this.cards = [];
        this.errors = [];
        this.fuckMKM();
        const names = this.decklist.split('\n');
        this.iterrateNames(names);
    }

    async iterrateNames(names: string[]) {
        for (const name of names) {
            const cards = new Collections.Set<RetardCard>();
            if (name.replace(/\s+/g, '').length > 1) {
                const foundCards = await this.getAllCards(name);
                foundCards.push(...(await this.getNonPromos(name)));
                foundCards.forEach(c => cards.add(new RetardCard(c)));
                this.cards.push(cards);
            } else {
                console.log('empty line lol');
            }
        }
    }

    private getOptions() {
        if (this.getall) {
            return CardFetcherComponent.OPTIONS_PRINTS;
        } else {
            return CardFetcherComponent.OPTIONS_ART;
        }
    }

    getAllCards(name: string): Promise<Card[]> {
        const query = '!"' + name + '" game:paper';
        return this.getCards(query, this.getOptions());
    }

    getNonPromos(name: string): Promise<Card[]> {
        const query = '!"' + name + '" game:paper -is:promo';
        return this.getCards(query, this.getOptions());
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
