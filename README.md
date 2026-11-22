# ENS491 Demo — Campus Stories

An Expo / React Native storytelling demo for Sabancı University’s ENS491 project.
Select one of three campus locations and choose how much story detail to see.

## Locations

| Location | Current experience |
| --- | --- |
| Tosun Terzioğlu Garden | Four-chapter story, three detail levels, photographs and narration |
| Information Center · IC | Selectable; **Story coming soon** |
| Lake · Sports Center | Selectable; **Story coming soon** |

Location selection is manual. This version does not use GPS, sensor data or
automatic cognitive-load estimation. Selecting a different location stops narration
and removes the previous story. “Outside the stops” clears the active story.

## Story and visuals

The garden story follows four chapters:

1. **The person behind the name:** a mathematician, academic and science administrator.
2. **What kind of university did he imagine?** Founding a university, listening and academic freedom.
3. **Knowing a campus through its trees:** plants, landscaping and campus walks.
4. **Why a garden?** Its location, opening, design and meaning as a memorial.

The interface, story, captions and narration are in English. The chapter order stays
the same at every level. **Short** has no illustrations; **Medium** includes a garden
photograph; **Detailed** includes three photographs and a visual timeline.

Narration uses an English voice installed on the device. Changing the detail level
or location stops it. The app shows a helpful message if no English voice is available.
On iPhone, turn off silent mode to hear the audio.

## Run

Node 24 LTS is recommended; the repository includes `.nvmrc`.

```sh
git clone https://github.com/EfeHanKeles346/ENS491-demo.git
cd ENS491-demo
npm ci
npm start
```

Open the QR code in an SDK 58-compatible version of Expo Go. Keep the phone and
computer on the same Wi-Fi network. If Expo Go requests sign-in, use the same
account in the CLI and the phone app. Check the installed SDK if there is a mismatch.

For a browser preview:

```sh
npm run web
```

On macOS, `Baslat.command` also starts the development server. If your default
Node version is incompatible, run:

```sh
npm exec --yes --package=node@24 -- npm start
```

## Files

- `App.tsx`: location selection, English interface and narration.
- `src/content.json`: three locations, narrative levels, chapters and sources.
- `src/StoryFigure.tsx`: photographs with captions and attribution.
- `src/model.ts`: manual selection state and detail-level validation.
- `docs/Tosun_Hoca_Hikayesi.html`: the current English garden story; download and open in a browser.
- `docs/Hikaye_Metinleri.html`: English text drafts for all three locations; IC and lake drafts are not displayed in the app yet.
- `tests/`: state, content and browser interaction tests.

Regenerate the garden story document with `node scripts/render-story.cjs`.

## Context-module compatibility

Reference: [Yağız’s context module](https://github.com/ivorionn/ens525a-context-module),
reviewed at commit `89cc0231c63369288a3ea6fbccf9fb177de5d9b5`.

Both projects use Expo SDK 58 and the level identifiers `short | medium | detailed`.
A future integration can validate incoming levels with `parseContextLevel`. There
is no live sensor or inter-app connection in this demo. The reference repository
was not modified.

## Validation

```sh
npm run typecheck
npm run lint
npm test
npm run export
```

For browser tests, install Chrome, start `npm run web` on port 8081, then run
`npm run test:ui` in another terminal.

The tests cover story selection, the three detail levels, photographs, placeholders,
reset, source links and narration cancellation. Speech tests use a controlled browser
API mock, including English-voice selection and the missing-voice message. Physical
phone playback and Expo Go launch must still be checked on a real device. Successful
web/Android/iOS exports do not replace device testing.

## Sources and photographs

Historical details are based on university biographies and memorial publications.
Transitions and visitor questions are original narration, not invented quotations.
Chapter-level references are included in the story document and content data.

Photographs are credited to Sabancı University / gazeteSU. Rights remain with their
respective holders; attribution does not imply an open license.

- [Garden photograph — A Living Campus](https://sabanciuniv.edu/tr/kampus/kampus-ve-sehir/yasayan-bir-kampus)
- [Archive photographs — gazeteSU](https://gazetesu.sabanciuniv.edu/tr/bir-guzel-ve-iyi-insani-tosun-terzioglunu-aniyoruz)
- [Official biography](https://gazetesu.sabanciuniv.edu/sites/gazetesu.sabanciuniv.edu/files/2013/tosun_terzioglu_ozgecmis.pdf)

Some original reference pages are in Turkish. Their titles and the demo’s retelling
are provided in English; the source documents themselves have not been changed.
