# ENS491 Demo — Tosun Terzioğlu Bahçesi

Sabancı Üniversitesi ENS491 projesi için Expo / React Native hikâye anlatımı demosu.
Tosun Terzioğlu’nun hayatını, üniversitenin kuruluşundaki rolünü, doğaya ilgisini
ve anısına oluşturulan bahçeyi dört bölümde anlatır.

## Özellikler

- **Manuel konum:** Bahçedeyim / durak dışındayım.
- **Üç anlatım seviyesi:** Sade, orta, detaylı. Dört bölümün sırası korunur.
- **Görseller:** Sade anlatım görselsizdir; orta seviyede bahçe fotoğrafı,
  detaylı seviyede üç fotoğraf ve zaman çizelgesi bulunur.
- **Türkçe sesli okuma:** Cihazın metinden konuşma özelliğiyle tüm hikâye okunur.
  Seviye veya konum değiştiğinde ses durur.
- **Kaynaklar:** Biyografi, üniversite yayınları ve anma konuşmalarına bağlantılar.

Bu sürümde GPS, sensör verisi veya otomatik bilişsel yük ölçümü kullanılmaz.
IC ve gölet taslakları veri dosyasında korunur; uygulama yalnız bahçeyi gösterir.

## Kurulum

Node 24 LTS önerilir; `.nvmrc` dosyası bulunur.

```sh
git clone https://github.com/EfeHanKeles346/ENS491-demo.git
cd ENS491-demo
npm ci
npm start
```

SDK 58 destekleyen Expo Go ile terminaldeki QR kodunu açın. Telefon ve bilgisayar
aynı Wi-Fi ağında olmalıdır. Expo Go hesap girişi isterse CLI ve telefonda aynı
hesabı kullanın. Bir SDK uyumsuzluğu mesajı alırsanız Expo Go sürümünü kontrol edin.

Web önizleme:

```sh
npm run web
```

Mac’te `Baslat.command` da kullanılabilir. Varsayılan Node sürümünüz uyumsuzsa:

```sh
npm exec --yes --package=node@24 -- npm start
```

Sesli okuma için cihazda Türkçe konuşma sesi bulunmalıdır. iPhone’da sessiz modu
kapatın. Türkçe ses yoksa uygulama açıklama gösterir; metin okunmaya devam edilebilir.

## Hikâye

1. **Bahçedeki ismin ardındaki insan:** Matematikçi, akademisyen, bilim yöneticisi.
2. **Nasıl bir üniversite hayal etti?** Kuruluş, dinleme ve düşünce özgürlüğü.
3. **Kampüsü ağaçlarıyla tanımak:** Bitkiler, peyzaj ve kampüs turları.
4. **Neden bir bahçe?** Konum, açılış, tasarım ve hatırlamanın anlamı.

Detaylı anlatım yaklaşık 510 kelime, tahmini dört dakikadır. Tarihsel bilgiler
kaynaklara dayanır; ziyaretçiye yöneltilen sorular ve bölüm geçişleri özgün anlatımdır.

Güncel metinler: [Tosun Hoca’nın hikâyesi](docs/Tosun_Hoca_Hikayesi.html).
HTML dosyasını indirip tarayıcıda açabilirsiniz. Yeniden üretmek için:

```sh
node scripts/render-story.cjs
```

## Dosyalar

- `App.tsx`: Demo ekranı ve sesli okuma.
- `src/content.json`: Bölümler, üç seviyedeki metinler ve kaynaklar.
- `src/StoryFigure.tsx`: Kaynak açıklamalı görsel kartları.
- `src/model.ts`: Manuel seçim durumu ve seviye doğrulama.
- `tests/`: Durum, içerik ve tarayıcı etkileşim kontrolleri.
- `docs/`: Hikâye belgeleri, ekran görüntüleri ve test notları.

## Context modülüyle uyum

Referans: [Yağız’ın context modülü](https://github.com/ivorionn/ens525a-context-module).
İncelenen commit: `89cc0231c63369288a3ea6fbccf9fb177de5d9b5`.

İki proje de Expo SDK 58 ailesini ve `short | medium | detailed` seviye adlarını
kullanır. Bizde bunlar Sade / Orta / Detaylı olarak görünür. İleride modülün
verdiği seviye `parseContextLevel` üzerinden doğrulanabilir. Canlı sensör veya
uygulamalar arası veri bağlantısı henüz kurulmamıştır. Referans repoda değişiklik
veya commit yapılmamıştır.

## Doğrulama

```sh
npm run typecheck
npm run lint
npm test
npm run export
```

Tarayıcı testleri için Chrome kurulu olmalı; önce `npm run web`, ardından ayrı
terminalde `npm run test:ui` çalıştırılmalıdır (varsayılan adres localhost:8081).

Son kontrolde 5 durum/içerik testi, 4 tarayıcı testi, TypeScript ve ESLint geçti;
web, Android ve iOS paketleri üretildi. Ses testi kontrollü tarayıcı API taklidi
kullanır. Fiziksel telefonda Expo Go açılışı ve işitilebilir Türkçe ses ayrıca
test edilmelidir. Paket üretimi, gerçek cihaz testi değildir.

## Fotoğraflar ve kaynaklar

Fotoğraflar Sabancı Üniversitesi / gazeteSU kaynaklıdır. Hakları ilgili hak
sahiplerine aittir; kaynak gösterimi açık lisans iddiası değildir.

- [Bahçe fotoğrafı — Yaşayan Bir Kampüs](https://sabanciuniv.edu/tr/kampus/kampus-ve-sehir/yasayan-bir-kampus)
- [Kürsü ve kürekli arşiv fotoğrafları — gazeteSU](https://gazetesu.sabanciuniv.edu/tr/bir-guzel-ve-iyi-insani-tosun-terzioglunu-aniyoruz)
- [Resmi özgeçmiş](https://gazetesu.sabanciuniv.edu/sites/gazetesu.sabanciuniv.edu/files/2013/tosun_terzioglu_ozgecmis.pdf)

Bölümlere ait ayrıntılı kaynaklar `src/content.json` ve hikâye belgesindedir.
