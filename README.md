# Brylters

**The Brython filters for JavaScript frameworks.**

Django and Jinja give a template its filters: `|date`, `|timesince`,
`|slugify`, `|striptags`, `|urlencode`, `|tojson`. Brylters gives them to a
JavaScript framework whose templates hold Python values, the values of
[Brython](https://brython.info), read through
[Bryntime](https://github.com/svelthon/bryntime).

Install it from [npm](https://www.npmjs.com/package/brylters):

```sh
npm install brylters
```

```js
import { host, helpers } from 'brylters';

host.str = templateText; // the text your templates show of a value
const { date, slugify } = helpers; // each called by position or by name
```

## The filters

| Filter | What it writes |
|---|---|
| `date(value, style=None, clock=None, locale=None)` | a date in the reader's language, as Django's `\|date`: `style` and `clock` are `"full"`, `"long"`, `"medium"` or `"short"`, and a day written alone, `"2026-08-24"`, is that day wherever it is read |
| `from_now(value, locale=None)` | "3 days ago" or "in 2 hours", as Django's `\|timesince` and `\|timeuntil`, kept right as time passes |
| `slugify(text)` | a title made into a URL segment, lowercased, every letter kept, accents included, and the rest a dash: `héllo-wörld`, where Django's `\|slugify` drops accents and punctuation |
| `strip_tags(html)` | HTML shown as text, as Django's `strip_tags`, but parsed by the browser rather than pattern-matched, a script's source dropped |
| `urlencode(value)` | a value, a mapping or a list of pairs, encoded into a URL, `/` included |
| `to_json(value, indent=None)` | Jinja's `\|tojson`, laid out as `json.dumps` lays it out, a dict's order and an int's digits kept |
| `from_json(text)` | the way back, an int past 2^53 with its digits |

Each is a plain function, exported under its name, and `helpers` holds them
again, called by position or by name as a Python call is, refused as CPython
refuses a wrong one.

## What the framework decides

- **The text of a value**, which `slugify`, `strip_tags` and `urlencode` start
  from and a refusal shows: `host.str`, Python's `str()` alone. A framework
  whose templates show None as nothing hands its own, so that `slugify(None)`
  is empty, as `{x}` is.
- **When a relative time is read again**: `from_now` asks the subscription
  the framework hands Bryntime (`host.subscriber`) to wake it when its text
  changes. Alone, nothing wakes it, as in Django, where a page is finished once
  rendered.

## License

Brylters is licensed under the BSD 3-Clause License, the same license as
Brython.
