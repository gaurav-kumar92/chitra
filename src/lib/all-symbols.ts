
import { arrowSymbols } from './arrow-symbols';
import { astrologySymbols } from './astrology-symbols';
import { cardSymbols } from './card-symbols';
import { chessSymbols } from './chess-symbols';
import { currencySymbols } from './currency-symbols';
import { dicesAndTilesSymbols } from './dices-and-tiles-symbols';
import { genderSymbols } from './gender-symbols';
import { musicSymbols } from './music-symbols';
import { recycleSymbols } from './recycle-symbols';
import { religionSymbols } from './religion-symbols';
import { weatherSymbols } from './weather-symbols';
import { allEmojiSymbols } from './emoji-symbols';

export type SymbolInfo = {
    char: string;
    name: string;
};

// This is a master list of all symbols available in the app.
// It is used to power the search functionality in the AddItemDialog.
export const allSymbols: SymbolInfo[] = [
    ...arrowSymbols.map(s => ({ char: s, name: `arrow ${s}`})),
    ...astrologySymbols.map(s => ({ char: s, name: `astrology ${s}`})),
    ...cardSymbols.map(s => ({ char: s, name: `card ${s}`})),
    ...chessSymbols.map(s => ({ char: s, name: `chess ${s}`})),
    ...currencySymbols.map(s => ({ char: s, name: `currency ${s}`})),
    ...dicesAndTilesSymbols.map(s => ({ char: s, name: `dice tile ${s}`})),
    ...genderSymbols.map(s => ({ char: s, name: `gender ${s}`})),
    ...musicSymbols.map(s => ({ char: s, name: `music ${s}`})),
    ...recycleSymbols.map(s => ({ char: s, name: `recycle ${s}`})),
    ...religionSymbols.map(s => ({ char: s, name: `religion ${s}`})),
    ...weatherSymbols.map(s => ({ char: s, name: `weather ${s}`})),
    ...allEmojiSymbols,
];

    