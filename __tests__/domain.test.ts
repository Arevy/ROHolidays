import { dedupeEvents, mapAzisespalaToEvents, mapNagerToEvents, mapOrthocalToEvents } from '../src/domain/mappers';
import { feastLevelToCross } from '../src/domain/heuristics';

describe('heuristics', () => {
  it('maps feast levels to crosses', () => {
    expect(feastLevelToCross('great_feast')).toBe('RED');
    expect(feastLevelToCross('vigil')).toBe('RED');
    expect(feastLevelToCross('simple')).toBe('BLACK');
    expect(feastLevelToCross(null)).toBeNull();
  });
});

describe('mappers', () => {
  it('maps Nager public holidays', () => {
    const result = mapNagerToEvents([
      { date: '2026-01-01', localName: 'Anul Nou', name: 'New Year', types: ['Public'] },
    ]);
    expect(result[0]!).toMatchObject({
      kind: 'LEGAL',
      source: 'NAGER',
      title: 'Anul Nou',
    });
  });

  it('maps Orthocal feasts with derived levels', () => {
    const result = mapOrthocalToEvents([{ date: '2026-01-06', title: 'Boboteaza', feast_level: 'great_feast' }]);
    expect(result[0]!.level).toBe('RED');
  });

  it('dedupes and keeps higher level', () => {
    const deduped = dedupeEvents([
      { id: 'A', dateISO: '2026-01-01', title: 'Foo', kind: 'ORTHODOX', level: 'BLACK', source: 'ORTHOCAL' },
      { id: 'A', dateISO: '2026-01-01', title: 'Foo', kind: 'ORTHODOX', level: 'RED', source: 'AZISESPALA' },
    ]);
    expect(deduped).toHaveLength(1);
    expect(deduped[0]!.level).toBe('RED');
  });

  it('maps azisespala red cross flag', () => {
    const mapped = mapAzisespalaToEvents([{ date: '2025-04-20', name: 'Paști', isHoliday: true }]);
    expect(mapped[0]!.level).toBe('RED');
  });
});
