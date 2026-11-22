import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { demoReducer, getActiveStory, INITIAL_STATE, LEVELS, parseContextLevel, type Stop } from '../src/model.ts';

const stops = JSON.parse(readFileSync(new URL('../src/content.json', import.meta.url), 'utf8')) as Stop[];

test('visitor flow: outside → garden → all levels → outside → reset', () => {
  let state = { ...INITIAL_STATE };
  assert.equal(getActiveStory(stops, state), null);
  state = demoReducer(state, { type: 'location', value: 'tosun' });
  for (const level of LEVELS) {
    state = demoReducer(state, { type: 'level', value: level });
    assert.equal(getActiveStory(stops, state)?.text, stops[0].texts[level]);
    assert.equal(state.location, 'tosun');
  }
  state = demoReducer(state, { type: 'location', value: 'outside' });
  assert.equal(getActiveStory(stops, state), null);
  assert.deepEqual(demoReducer(state, { type: 'reset' }), INITIAL_STATE);
});

test('draft locations never show a stale garden story', () => {
  for (const location of ['ic', 'lake'] as const) {
    assert.equal(getActiveStory(stops, { location, level: 'detailed' }), null);
  }
});

test('three stops contain three increasingly detailed sourced narratives', () => {
  assert.equal(stops.length, 3);
  assert.equal(stops.filter((stop) => stop.active).length, 1);
  for (const stop of stops) {
    const lengths = LEVELS.map((level) => stop.texts[level].trim().split(/\s+/).length);
    assert.ok(lengths[0] < lengths[1] && lengths[1] < lengths[2]);
    assert.ok(stop.sources.length > 0);
    assert.ok(stop.sources.every((source) => new URL(source.url).protocol === 'https:'));
  }
});

test('context boundary accepts only the level names in Yağız’s module', () => {
  for (const level of LEVELS) assert.equal(parseContextLevel(level), level);
  for (const invalid of [null, 90, 'low', 'high', undefined, {}, '']) assert.equal(parseContextLevel(invalid), null);
});


test('Tosun story preserves four chapters and their order at every detail level', () => {
  const chapters = stops[0].chapters!;
  assert.deepEqual(chapters.map((chapter) => chapter.id), ['person', 'university', 'nature', 'garden']);
  for (const level of LEVELS) {
    assert.equal(stops[0].texts[level], chapters.map((chapter) => `${chapter.title}.\n${chapter.texts[level]}`).join('\n\n'));
    assert.ok(chapters.every((chapter) => chapter.sources.length > 0 && chapter.texts[level].length > 30));
  }
});
