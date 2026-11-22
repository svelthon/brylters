// The filters on Python values, alone and plugged into a framework: the text
// they start from is the host's (`host.str`), Python's `str()` alone; a relative
// time is woken by the subscription the framework hands Bryntime, and by none
// alone; each filter is called by position or by name, refused as CPython
// refuses a wrong call.
import { test, expect, vi } from 'vitest';
import { python } from './python.js';
import { host as runtime } from 'bryntime';
import { host, helpers, date, from_now, slugify, strip_tags, urlencode, to_json, from_json } from '../src/brylters.js';

const $B = globalThis.__BRYTHON__;
const NONE = $B.builtins.None;

const v = python(`
title = 'Été à Paris'
query = {'q': 'a b', 'page': 2, 'tag': None}
pairs = [('tag', 'x'), ('tag', 'y')]
ordered = {'b': 1, 'a': 2, 10: 3}
members = {1, 2}
big = 2 ** 70
`);

// Before any other reading of a relative time: the clock is made at the first.
test('a relative time asks to be woken by the subscription the framework handed Bryntime', () => {
    vi.useFakeTimers();
    const subscriber = runtime.subscriber;
    let woken = 0;

    runtime.subscriber = (start) => {
        let started = false;

        return () => {
            if (!started) {
                started = true;
                start(() => woken++);
            }
        };
    };
    try {
        expect(from_now(new Date(Date.now() - 3 * 60_000), 'en')).toBe('3 minutes ago');
        vi.advanceTimersByTime(60 * 60_000);
        expect(woken).toBe(1);
    } finally {
        runtime.subscriber = subscriber;
        vi.useRealTimers();
    }
});

test("a filter starts from the framework's text of a value, Python's str() alone", () => {
    expect(slugify(NONE)).toBe('none');
    expect(urlencode(NONE)).toBe('None');

    const own = host.str;

    host.str = (value) => (value === NONE ? '' : own(value));
    try {
        expect(slugify(NONE)).toBe('');
        expect(urlencode(NONE)).toBe('');
    } finally {
        host.str = own;
    }
});

test('slugify keeps the letters a title is written in', () => {
    expect(slugify(v('title'))).toBe('été-à-paris');
});

test('strip_tags keeps the visible text, a script dropped, the spaces collapsed', () => {
    expect(strip_tags('<p>a <script>x()</script> b</p>\n<p>c</p>')).toBe('a b c');
});

test('urlencode writes a dict, and pairs that repeat a key', () => {
    expect(urlencode(v('query'))).toBe('q=a+b&page=2&tag=None');
    expect(urlencode(v('pairs'))).toBe('tag=x&tag=y');
    expect(urlencode('a/b c')).toBe('a%2Fb%20c');
});

test("to_json writes a dict as JavaScript lists it, keeps an int's digits, and refuses a set", () => {
    expect(to_json(v('ordered'))).toBe('{"10":3,"b":1,"a":2}');
    expect(to_json(v('ordered'), 1)).toBe('{\n "10": 3,\n "b": 1,\n "a": 2\n}');
    expect(to_json(v('big'))).toBe('1180591620717411303424');
    expect(() => to_json(v('members'))).toThrow(/to_json\(\): \{1, 2\} is a set/);
});

test('from_json reads an int past 2^53 back with its digits', () => {
    const text = '{"n":1180591620717411303424}';

    expect(to_json(from_json(text))).toBe(text);
});

test('date writes a day in the language asked, and refuses what is no date', () => {
    expect(date('2026-08-24', 'long', NONE, 'fr')).toBe('24 août 2026');
    expect(() => date('soon')).toThrow(/date\(\): "soon" is not a date/);
    expect(() => date('2026-08-24', 'Y-m-d')).toThrow(/is not a style/);
});

test('a filter is called by name, and refused as CPython refuses a wrong call', () => {
    const named = (keywords) => ({ [$B.KW]: [keywords] });

    expect(helpers.date('2026-08-24', named({ style: 'long', locale: 'fr' }))).toBe('24 août 2026');
    expect(() => helpers.slugify('a', 'b')).toThrow(/slugify\(\) takes 1 positional argument but 2 were given/);
    expect(() => helpers.date()).toThrow(/date\(\) missing 1 required positional argument: 'value'/);
    expect(() => helpers.date('2026-08-24', named({ when: 1 }))).toThrow(/date\(\): no argument named when/);
});
