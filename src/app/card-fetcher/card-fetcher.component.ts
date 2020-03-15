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

    async fetchcards() {
        this.cardsArray = [];
        this.errors = [];
        this.fuckMKM();
        const names = this.decklist.split('\n');
        const names2 = [];
        const cardMap = new Map<string, Card[]>();
        for (const name of names) {
            cardMap.set(name.toLocaleLowerCase(), []);
        }
        const size = 20;
        while (names.length > 0) {
            names2.push(names.splice(0, size));
        }

        for (const nameList of names2) {
            (await this.megaQuery2(nameList)).forEach((c) => cardMap.set(c[0].name.toLocaleLowerCase(), c));
        }
        this.cardsArray = Array.from(cardMap.values());
    }

    async megaQuery2(names: string[]): Promise<Card[][]> {
        let namesQuery = '';
        const rCards = new Collections.Set<RetardCard>();
        const cardsByName = new Map<string, Card[]>();
        const cardsByIlluID = new Map<string, Card[]>();
        const cardMap = new Map<string, Map<string, Map<string | number, Card[]>>>();

        for (const name of names) {
            namesQuery += '!"' + name + '" or ';
        }
        namesQuery = '(' + namesQuery + ')';
        const foundCards = await this.queryCards(namesQuery + ' game:paper', CardFetcherComponent.OPTIONS_PRINTS);
        foundCards.forEach(c => {
            if (!cardMap.has(c.name)) {
                cardMap.set(c.name, new Map<string, Map<string, Card[]>>());
            }
            if (!cardMap.get(c.name).has(c.illustration_id)) {
                cardMap.get(c.name).set(c.illustration_id, new Map<string, Card[]>());
            }
            if (!cardMap.get(c.name).get(c.illustration_id).has(c.frame)) {
                cardMap.get(c.name).get(c.illustration_id).set(c.frame, []);
            }
            cardMap.get(c.name).get(c.illustration_id).get(c.frame).push(c);
        });

        cardMap.forEach(cName => {
            cName.forEach(cIlluID => {
                cIlluID.forEach(cFrame => {
                    let cNewest: Card;
                    if (cFrame.length === 1) {
                        cNewest = cFrame[0];
                    } else {
                        const sorted = cFrame.sort((a, b) => Date.parse(b.released_at) - Date.parse(a.released_at));
                        cNewest = sorted.find((c) => !c.promo);
                        if (!cNewest) {
                            cNewest = sorted[0];
                        }
                    }
                    if (cardsByName.has(cNewest.name)) {
                        cardsByName.get(cNewest.name).push(cNewest);
                    } else {
                        cardsByName.set(cNewest.name, [cNewest]);
                    }
                });
            });
        });

        return Array.from(cardsByName.values());
    }

    private getOptions() {
        if (this.getall) {
            return CardFetcherComponent.OPTIONS_PRINTS;
        } else {
            return CardFetcherComponent.OPTIONS_ART;
        }
    }

    async getCards(query: string): Promise<Card[]> {
        let result: Card[] = [];
        if (this.getall) {
            result = await this.queryCards(query + ' game:paper', CardFetcherComponent.OPTIONS_PRINTS);
        } else {
            result = await this.queryCards(query + ' game:paper', CardFetcherComponent.OPTIONS_ART);
            result.push(...(await this.queryCards(query + ' game:paper -is:promo', CardFetcherComponent.OPTIONS_ART)));
            result.push(...(await this.queryCards(query + ' game:paper frame:extendedart', CardFetcherComponent.OPTIONS_ART)));
        }

        return result;
    }

    queryCards(query: string, options: SearchOptions): Promise<Card[]> {
        return scry.Cards.search(query, options)
            .on('end', () => {
                console.log(query + ' unique:' + options.unique + ' done');
            })
            .on('error', err => {
                console.error(err);
            })
            .waitForAll();
    }

    ngOnDestroy(): void {

    }

}

