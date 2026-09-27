import { readableTextOn, withAlpha } from '../color';
import { formatDexNumber, formatHeight, formatName, formatWeight } from '../format';
import { palette, typeColors } from '../theme';

describe('formatName', () => {
  it.each([
    ['pikachu', 'Pikachu'],
    ['iron-valiant', 'Iron Valiant'],
    ['mr-mime', 'Mr. Mime'],
    ['nidoran-f', 'Nidoran ♀'],
    ['farfetchd', "Farfetch'd"],
    ['ho-oh', 'Ho-Oh'],
  ])('%s → %s', (slug, expected) => expect(formatName(slug)).toBe(expected));
});

describe('number formatting', () => {
  it('pads dex numbers to four digits', () => {
    expect(formatDexNumber(25)).toBe('#0025');
    expect(formatDexNumber(1025)).toBe('#1025');
  });
  it('formats height and weight with one decimal', () => {
    expect(formatHeight(0.7)).toBe('0.7 m');
    expect(formatWeight(6.9)).toBe('6.9 kg');
  });
});

describe('color helpers', () => {
  it('uses ink on light type colours and white on dark ones', () => {
    expect(readableTextOn(typeColors.electric)).toBe(palette.ink);
    expect(readableTextOn(typeColors.ghost)).toBe(palette.white);
  });
  it('appends an alpha channel', () => {
    expect(withAlpha('#000000', 0.2)).toBe('#00000033');
    expect(withAlpha('#FFFFFF', 2)).toBe('#FFFFFFff');
  });
});
