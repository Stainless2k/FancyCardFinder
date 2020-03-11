import {Component, OnDestroy, OnInit} from '@angular/core';
import * as scry from 'scryfall-sdk';
import {Card, SearchOptions} from 'scryfall-sdk';

@Component({
    selector: 'app-card-fetcher',
    templateUrl: './card-fetcher.component.html',
    styleUrls: ['./card-fetcher.component.scss']
})

export class CardFetcherComponent implements OnInit, OnDestroy {

    static CARDNOTFOUND = 'YOU ABSOLUTE BUFFON THERE IS NO CARD NAMED ';
    static OPTIONS: SearchOptions = {unique: 'art', order: 'released'};

    decklist = '';
    cards: Card[][] = [];
    errors: string[];

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
            const uris: Card[] = [];
            if (name.replace(/\s+/g, '').length > 1) {
                const query = '!"' + name + '" game:paper';
                scry.Cards.search(query, CardFetcherComponent.OPTIONS)
                    .on('data', card => {
                        uris.push(card);
                    })
                    .on('end', () => {
                        this.cards.push(uris);
                        console.log(name + ' done');
                    })
                    .on('error', err => {
                        console.error(err);
                    })
                    .on('done', () => {
                        console.log('next');
                        if (uris.length < 1) {
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

    ngOnDestroy(): void {

    }
}
