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
        const names = this.decklist.split('\n');
        this.iterrateNames(names);
    }

    iterrateNames(names: string[]) {
        if (names.length > 0) {
            const name = names.shift();
            const cards = new Collections.Set<RetardCard>();
            if (name.replace(/\s+/g, '').length > 1) {
                const query = '!"' + name + '" game:paper';
                scry.Cards.search(query, this.getOptions())
                    .on('data', card => {
                        cards.add(new RetardCard(card));
                    })
                    .on('end', async () => {
                        const nonPromos = await this.getNonPromos(name);
                        nonPromos.forEach(c => cards.add(new RetardCard(c)));
                        this.cards.push(cards);
                        console.log(name + ' done');
                    })
                    .on('error', err => {
                        console.error(err);
                    })
                    .on('done',  () => {
                        console.log('next');
                        if (cards.size() < 1) {
                            this.errors.push(CardFetcherComponent.CARDNOTFOUND + '"' + name + '"');
                        }
                        this.iterrateNames(names);
                    });
            } else {
                console.log('ayyy');
                this.iterrateNames(names);
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

    getNonPromos(name: string): Promise<Card[]> {
        const query = '!"' + name + '" game:paper -is:promo';
        const cards = scry.Cards.search(query, CardFetcherComponent.OPTIONS_ART)
            .on('end', () => {
                console.log(name + ' nonPromo');
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
