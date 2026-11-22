import React, { useEffect, useReducer, useRef, useState } from 'react';
import { AppState, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Speech from 'expo-speech';
import data from './src/content.json';
import { StoryFigure } from './src/StoryFigure';
import { demoReducer, getActiveStory, INITIAL_STATE, LEVELS, levelLabels, type Level, type Selection, type Stop } from './src/model';

const stops = data as Stop[];
const green = '#244F3E';
const figures = {
  founder: { source: require('./assets/tosun-terzioglu.jpg'), ratio: 636 / 420, title: 'Bir bilim insanı, bir eğitimci', description: 'Tosun Terzioğlu, Sabancı Üniversitesi kürsüsünde konuşurken.', credit: 'Arşiv fotoğrafı: Sabancı Üniversitesi / gazeteSU' },
  nature: { source: require('./assets/tosun-doga.jpg'), ratio: 636 / 423, title: 'Kampüsle kurduğu yakınlık', description: 'Kampüste kürekle görülen Tosun Hoca. Bu fotoğraf, anlatıdaki doğa ve peyzaj ilgisine eşlik ediyor.', credit: 'Arşiv fotoğrafı: Sabancı Üniversitesi / gazeteSU · Çekim tarihi belirtilmemiştir.' },
  garden: { source: require('./assets/tosun-bahce.jpg'), ratio: 4 / 3, title: 'Hatıranın yaşadığı bahçe', description: 'Tosun Terzioğlu Bahçesi’nde su, doğal taşlar ve bitkilerin buluştuğu alan.', credit: 'Fotoğraf: Sabancı Üniversitesi · Yaşayan Bir Kampüs' },
};
const serif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' });

function Choice({ label, selected, onPress, id }: { label: string; selected: boolean; onPress: () => void; id: string }) {
  return <Pressable testID={id} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected }}
    onPress={onPress} style={({ pressed }) => [s.choice, selected && s.choiceSelected, pressed && s.pressed]}>
    <Text style={[s.choiceText, selected && s.choiceTextSelected]}>{label}</Text>
  </Pressable>;
}

export default function App() {
  return <SafeAreaProvider><Screen /></SafeAreaProvider>;
}

function Screen() {
  const [state, dispatch] = useReducer(demoReducer, INITIAL_STATE);
  const [speaking, setSpeaking] = useState(false);
  const [audioError, setAudioError] = useState('');
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [events, setEvents] = useState<string[]>(['Demo başladı · Konum seçimi bekleniyor']);
  const [logOpen, setLogOpen] = useState(false);
  const speechRun = useRef(0);
  const story = getActiveStory(stops, state);
  const selectedStop = stops.find((stop) => stop.id === state.location);
  const words = story?.text.trim().split(/\s+/).length ?? 0;
  const seconds = Math.ceil(words / 2.2);

  function log(message: string) {
    setEvents((current) => [message, ...current].slice(0, 12));
  }
  async function stopSpeech() {
    speechRun.current += 1;
    setSpeaking(false);
    try { await Speech.stop(); } catch { setAudioError('Ses durdurulamadı. Sayfayı yenileyebilirsiniz.'); }
  }
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status) => {
      if (status !== 'active') {
        speechRun.current += 1;
        setSpeaking(false);
        void Speech.stop().catch(() => {});
      }
    });
    return () => {
      subscription.remove();
      speechRun.current += 1;
      void Speech.stop().catch(() => {});
    };
  }, []);

  function selectLocation(value: Selection) {
    void stopSpeech();
    setAudioError('');
    setSourcesOpen(false);
    dispatch({ type: 'location', value });
    log(`Konum: ${value === 'outside' ? 'Durak dışında' : stops.find((item) => item.id === value)?.name}`);
  }
  function selectLevel(value: Level) {
    void stopSpeech();
    setAudioError('');
    dispatch({ type: 'level', value });
    log(`Anlatım: ${levelLabels[value]}`);
  }
  async function toggleSpeech() {
    if (speaking) { await stopSpeech(); log('Ses durduruldu'); return; }
    if (!story) return;
    const run = ++speechRun.current;
    setAudioError('');
    setSpeaking(true);
    try {
      await Speech.stop();
      const voices = await new Promise<Speech.Voice[]>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Voice lookup timed out')), 6000);
        Speech.getAvailableVoicesAsync().then(
          (available) => { clearTimeout(timeout); resolve(available); },
          (error) => { clearTimeout(timeout); reject(error); },
        );
      });
      if (run !== speechRun.current) return;
      const voice = voices.find((v) => v.language.toLowerCase().startsWith('tr'));
      if (!voice) {
        setSpeaking(false);
        setAudioError('Türkçe ses bulunamadı. Cihazınıza Türkçe bir konuşma sesi ekleyin veya metni okuyarak devam edin.');
        log('Türkçe ses bulunamadı');
        return;
      }
      const finish = () => { if (run === speechRun.current) setSpeaking(false); };
      Speech.speak(`${story.stop.title}. ${story.text}`, {
        language: 'tr-TR', voice: voice.identifier, rate: 0.92,
        onDone: finish, onStopped: finish,
        onError: () => {
          if (run !== speechRun.current) return;
          finish();
          setAudioError('Sesli okuma başlatılamadı. Cihazın ses ayarlarını kontrol edin.');
        },
      });
      log(`Sesli okuma: ${levelLabels[state.level]}`);
    } catch {
      if (run !== speechRun.current) return;
      setSpeaking(false);
      setAudioError('Sesli okuma bu cihazda kullanılamıyor. Metni okuyarak devam edebilirsiniz.');
    }
  }
  function reset() {
    void stopSpeech();
    dispatch({ type: 'reset' });
    setAudioError(''); setSourcesOpen(false); setLogOpen(false);
    setEvents(['Demo sıfırlandı · Konum seçimi bekleniyor']);
  }
  async function openSource(url: string) {
    try { await Linking.openURL(url); }
    catch { setAudioError('Kaynak açılamadı. İnternet bağlantısını kontrol edin.'); }
  }

  return <SafeAreaView style={s.safe}>
    <StatusBar style="dark" />
    <ScrollView contentContainerStyle={s.page}>
      <View style={s.header}>
        <View style={s.brand}><Text style={s.brandIcon}>K.</Text><View><Text style={s.brandTitle}>KAMPÜSÜN HİKÂYELERİ</Text><Text style={s.small}>Sabancı Üniversitesi · ENS491</Text></View></View>
        <View style={s.badge}><Text style={s.badgeText}>DEMO 01</Text></View>
      </View>

      <View style={s.intro}>
        <Text style={s.eyebrow}>TOSUN TERZİOĞLU BAHÇESİ</Text>
        <Text accessibilityRole="header" style={s.title}>Bir insan.{ '\n' }Yaşayan bir hatıra.</Text>
        <Text style={s.introText}>Bahçedeki ismin ardındaki insanı tanı. Bilimden üniversiteye, kampüsün ağaçlarından bu bahçeye uzanan dört bölümlük hikâye.</Text>
      </View>

      <View style={s.controls}>
        <View style={s.sectionHeading}><Text style={s.sectionTitle}>01  Bahçeye giriş</Text><Text style={s.manual}>ELLE SEÇİM</Text></View>
        <Text style={s.helper}>GPS yerine bu düğmeler kullanılıyor.</Text>
        <View style={s.locationGrid}>
          {stops.filter((stop) => stop.id === 'tosun').map((stop, index) => <Pressable key={stop.id} testID={`location-${stop.id}`} accessibilityRole="button"
            accessibilityLabel={stop.name} accessibilityState={{ selected: state.location === stop.id }}
            onPress={() => selectLocation(stop.id)} style={({ pressed }) => [s.location, state.location === stop.id && s.locationSelected, pressed && s.pressed]}>
            <View style={s.locationTop}><Text style={s.locationNumber}>0{index + 1}</Text><Text style={[s.status, stop.active && s.statusActive]}>{stop.active ? 'HAZIR' : 'YAKINDA'}</Text></View>
            <Text style={s.locationName}>{stop.name}</Text>
            <Text style={s.locationSub}>{stop.active ? 'Bilgi Merkezi yanı' : stop.id === 'ic' ? 'Bina önündeki açık alan' : 'Gölet kıyısındaki dış alan'}</Text>
            {state.location === stop.id && <Text style={s.selectedText}>✓ Seçili konum</Text>}
          </Pressable>)}
        </View>
        <Pressable testID="location-outside" accessibilityRole="button" accessibilityState={{ selected: state.location === 'outside' }} onPress={() => selectLocation('outside')} style={s.outsideButton}>
          <Text style={s.outsideText}>{state.location === 'outside' ? '●' : '○'}  Şu an durak dışındayım</Text>
        </Pressable>
        <View style={s.separator} />
        <View style={s.sectionHeading}><Text style={s.sectionTitle}>02  Anlatımı seç</Text><Text style={s.manual}>ELLE SEÇİM</Text></View>
        <View style={s.choices}>{LEVELS.map((level) => <Choice key={level} label={levelLabels[level]} selected={state.level === level} onPress={() => selectLevel(level)} id={`level-${level}`} />)}</View>
        <Text style={s.helper}>Bu seçim içerik ayrıntısını değiştirir; bilişsel yük ölçümü yapılmaz.</Text>
      </View>

      {story ? <View testID="story-card" style={s.story}>
        <View style={s.sectionHeading}><Text style={s.eyebrow}>TOSUN TERZİOĞLU BAHÇESİ</Text><Text testID="story-level" style={s.pill}>{levelLabels[state.level]}</Text></View>
        <Text accessibilityRole="header" style={s.storyTitle}>{story.stop.title}</Text>
        <Text style={s.storyMeta}>{words} kelime · Yaklaşık {seconds} sn sesli anlatım</Text>
        <Pressable testID="speech-toggle" accessibilityRole="button" accessibilityLabel={speaking ? 'Sesli okumayı durdur' : 'Hikâyeyi dinle'} onPress={() => void toggleSpeech()} style={({ pressed }) => [s.listen, pressed && s.pressed]}>
          <Text style={s.listenText}>{speaking ? '■  Okumayı durdur' : '▶  Hikâyeyi dinle'}</Text><Text style={s.listenLanguage}>TR</Text>
        </Pressable>
        <Text style={s.audioHint}>iPhone’da dinlemek için sessiz modu kapatın.</Text>
        {audioError !== '' && <Text accessibilityRole="alert" testID="audio-error" style={s.error}>{audioError}</Text>}
        <View testID="story-text">
          {story.stop.chapters?.map((chapter, chapterIndex) => <View key={chapter.id} testID={`chapter-${chapter.id}`} style={s.chapter}>
            <View style={s.chapterTop}><Text style={s.chapterNumber}>0{chapterIndex + 1}</Text><Text style={s.chapterKicker}>{chapter.kicker}</Text></View>
            <Text accessibilityRole="header" style={s.chapterTitle}>{chapter.title}</Text>
            {chapter.image && (state.level === 'detailed' || (state.level === 'medium' && chapter.image === 'garden')) &&
              <StoryFigure id={`figure-${chapter.image}`} {...figures[chapter.image]} />}
            {chapter.texts[state.level].split('\n\n').map((paragraph, index) =>
              <Text key={index} selectable style={[s.storyBody, s.paragraph]}>{paragraph}</Text>)}
          </View>)}
        </View>
        {state.level === 'detailed' && <View testID="visual-timeline" style={s.timeline}>
          <Text style={s.timelineHeading}>Hikâyenin üç izi</Text>
          {[
            ['1997', 'Bir üniversitenin başlangıcı', 'Kurucu rektörlük görevini üstlendi.'],
            ['1999', 'Yeşeren bir kampüs', 'Peyzaj çalışmalarına yakından ilgi gösterdi.'],
            ['2017', 'Yaşayan bir hatıra', 'Anısına Tosun Terzioğlu Bahçesi oluşturuldu.'],
          ].map(([year, title, description], index) => <View key={year} style={s.timelineRow}>
            <View style={s.timelineTrack}>
              <View style={s.timelineDot}><Text style={s.timelineNumber}>0{index + 1}</Text></View>
              {index < 2 && <View style={s.timelineConnector} />}
            </View>
            <View style={s.timelineContent}><Text style={s.timelineYear}>{year}</Text><Text style={s.timelineTitle}>{title}</Text><Text style={s.timelineDescription}>{description}</Text></View>
          </View>)}
        </View>}
        <Pressable testID="sources-toggle" accessibilityRole="button" accessibilityState={{ expanded: sourcesOpen }} onPress={() => setSourcesOpen(!sourcesOpen)} style={s.sourceToggle}><Text style={s.sourceToggleText}>{sourcesOpen ? '−' : '+'}  Hikâyenin kaynakları</Text></Pressable>
        {sourcesOpen && <View testID="sources" style={s.sourceList}>
          <Text style={s.helper}>Biyografi ve anma yazılarındaki bilgiler yeniden anlatıldı. Ziyaretçiye yöneltilen sorular ve bölüm geçişleri bu hikâye için yazıldı; kişiye ait söz veya yaşanmış anı olarak sunulmaz.</Text>
          {story.stop.sources.map((source, index) => <Pressable accessibilityRole="link" key={source.url} onPress={() => void openSource(source.url)} style={s.sourceLink}><Text style={s.sourceLinkText}>{index + 1}. {source.title} ↗</Text></Pressable>)}
        </View>}
      </View> : <View testID="empty-state" style={s.empty}>
        <Text style={s.emptyIcon}>{state.location === 'outside' ? '◎' : '◌'}</Text>
        <Text style={s.emptyTitle}>{state.location === 'outside' ? 'Hikâye bir durakla başlar.' : `${selectedStop?.name}`}</Text>
        <Text style={s.emptyBody}>{state.location === 'outside' ? 'Denemeye başlamak için yukarıdan Tosun Terzioğlu Bahçesi’ni seç.' : 'Bu durağın üç anlatım metni proje dosyalarında hazır. İlk demoda bahçe hikâyesini deneyebilirsin.'}</Text>
        <Pressable accessibilityRole="button" onPress={() => selectLocation('tosun')} style={s.start}><Text style={s.listenText}>Bahçe hikâyesini aç →</Text></Pressable>
      </View>}

      <View style={s.footer}>
        <View style={s.footerRow}>
          <Pressable accessibilityRole="button" testID="log-toggle" onPress={() => setLogOpen(!logOpen)} style={s.footerButton}><Text style={s.footerLink}>{logOpen ? 'İşlem kaydını kapat' : 'İşlem kaydını göster'}</Text></Pressable>
          <Pressable accessibilityRole="button" testID="reset" onPress={reset} style={s.footerButton}><Text style={s.footerLink}>Demoyu sıfırla ↺</Text></Pressable>
        </View>
        {logOpen && <View testID="event-log" style={s.log}>{events.map((event, index) => <Text style={s.logText} key={`${event}-${index}`}>{event}</Text>)}</View>}
        <Text style={s.footerNote}>Konum ve anlatım seçimi manuel · Sensör bağlantısı yok</Text>
      </View>
    </ScrollView>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F3EC' },
  page: { width: '100%', maxWidth: 850, alignSelf: 'center', paddingHorizontal: 22, paddingTop: 18, paddingBottom: 28 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderColor: '#DCDDD3', paddingBottom: 22 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  brandIcon: { fontSize: 30, fontFamily: serif, color: green },
  brandTitle: { fontSize: 10, letterSpacing: 1.1, fontWeight: '800', color: green },
  small: { color: '#697469', fontSize: 10, marginTop: 5 },
  badge: { backgroundColor: '#E5EADC', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 7 },
  badgeText: { color: green, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  intro: { paddingVertical: 28 },
  eyebrow: { color: green, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, flexShrink: 1 },
  title: { fontFamily: serif, fontSize: 42, lineHeight: 47, letterSpacing: -1.5, color: '#243B30', marginTop: 12 },
  introText: { color: '#647266', fontSize: 15, lineHeight: 23, marginTop: 15, maxWidth: 500 },
  controls: { padding: 20, borderRadius: 20, backgroundColor: '#EAEDE3', borderWidth: 1, borderColor: '#D9DFD1' },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#2D4536', flexShrink: 1 },
  manual: { fontSize: 8, letterSpacing: 1, color: '#5D6C5D', fontWeight: '600' },
  helper: { color: '#5D6C60', fontSize: 12, lineHeight: 18, marginTop: 7 },
  locationGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 17 },
  location: { padding: 13, flexGrow: 1, flexBasis: 175, borderRadius: 12, borderColor: '#CCD4C6', borderWidth: 1, backgroundColor: '#F7F8F2', minHeight: 112 },
  locationSelected: { borderColor: green, borderWidth: 2, padding: 12, backgroundColor: '#FFFDF7' },
  locationTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  locationNumber: { fontFamily: serif, color: '#6E7E6C', fontSize: 18 },
  status: { fontSize: 8, letterSpacing: 1, color: '#798373', fontWeight: '700' },
  statusActive: { color: green },
  locationName: { fontSize: 14, fontWeight: '700', color: '#304637', marginTop: 13, lineHeight: 19 },
  locationSub: { fontSize: 11, color: '#6D796C', marginTop: 4 },
  selectedText: { color: green, fontSize: 11, marginTop: 10, fontWeight: '700' },
  outsideButton: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  outsideText: { color: '#4F6453', fontSize: 12 },
  separator: { height: 1, backgroundColor: '#D1D9CA', marginTop: 4, marginBottom: 19 },
  choices: { flexDirection: 'row', padding: 4, backgroundColor: '#DCE2D5', borderRadius: 12, gap: 4, marginTop: 14, marginBottom: 3 },
  choice: { flex: 1, minHeight: 44, padding: 8, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  choiceSelected: { backgroundColor: green },
  choiceText: { fontSize: 13, color: '#48604A', fontWeight: '700' },
  choiceTextSelected: { color: '#FFFFFF' },
  pressed: { opacity: 0.7 },
  story: { backgroundColor: '#FFFDF7', marginTop: 22, borderRadius: 20, padding: 23, borderWidth: 1, borderColor: '#E4E2D7' },
  pill: { fontSize: 10, color: green, backgroundColor: '#E9ECDD', paddingVertical: 6, paddingHorizontal: 9, borderRadius: 6, overflow: 'hidden' },
  storyTitle: { fontFamily: serif, fontSize: 31, lineHeight: 37, color: '#273E31', marginTop: 17, letterSpacing: -0.6 },
  storyMeta: { fontSize: 11, color: '#788071', marginTop: 9, marginBottom: 20 },
  listen: { minHeight: 48, backgroundColor: green, borderRadius: 10, paddingHorizontal: 17, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  listenText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  listenLanguage: { color: '#B8D2BC', fontSize: 10, letterSpacing: 1 },
  audioHint: { color: '#7B8176', fontSize: 10, lineHeight: 16, marginTop: 7, marginBottom: 23 },
  error: { color: '#8E3F25', fontSize: 13, lineHeight: 20, marginBottom: 16, backgroundColor: '#FFF0E4', padding: 12, borderRadius: 8 },
  storyBody: { fontSize: 17, lineHeight: 29, color: '#3E4B3E' },
  paragraph: { marginBottom: 22 },
  chapter: { borderTopWidth: 1, borderColor: '#E0E4D7', paddingTop: 24, marginTop: 12 },
  chapterTop: { flexDirection: 'row', gap: 13, alignItems: 'center', marginBottom: 10 },
  chapterNumber: { color: '#8B9B7B', fontFamily: serif, fontSize: 33 },
  chapterKicker: { flex: 1, color: green, fontSize: 10, fontWeight: '800', letterSpacing: 1.1, lineHeight: 17 },
  chapterTitle: { color: '#273E31', fontFamily: serif, fontSize: 27, lineHeight: 34, marginBottom: 20 },
  timeline: { marginTop: 2, padding: 18, borderRadius: 14, backgroundColor: '#EAEFDF' },
  timelineHeading: { color: green, fontSize: 16, fontWeight: '700', marginBottom: 22 },
  timelineRow: { flexDirection: 'row', gap: 15 },
  timelineTrack: { width: 32, alignItems: 'center' },
  timelineDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: green, justifyContent: 'center', alignItems: 'center' },
  timelineNumber: { fontSize: 11, color: '#FFFDF7', fontWeight: '700' },
  timelineConnector: { width: 2, flex: 1, backgroundColor: '#AFC09B', marginVertical: 5 },
  timelineContent: { flex: 1, paddingBottom: 20 },
  timelineYear: { fontFamily: serif, color: green, fontSize: 23, lineHeight: 30 },
  timelineTitle: { fontSize: 13, fontWeight: '700', color: '#3F573B', marginTop: 3 },
  timelineDescription: { fontSize: 12, lineHeight: 19, color: '#5E6D59', marginTop: 4 },
  sourceToggle: { borderTopWidth: 1, borderColor: '#E4E5D9', marginTop: 25, paddingTop: 16, minHeight: 48 },
  sourceToggleText: { fontSize: 12, color: green, fontWeight: '600' },
  sourceList: { marginTop: 5 },
  sourceLink: { minHeight: 44, justifyContent: 'center', paddingVertical: 9 },
  sourceLinkText: { fontSize: 12, lineHeight: 20, color: green, textDecorationLine: 'underline' },
  empty: { marginTop: 22, borderWidth: 1, borderColor: '#DADFCF', borderRadius: 20, padding: 28, alignItems: 'center' },
  emptyIcon: { fontSize: 40, color: '#829775', marginBottom: 17 },
  emptyTitle: { fontFamily: serif, color: green, fontSize: 25, lineHeight: 31, textAlign: 'center' },
  emptyBody: { fontSize: 13, lineHeight: 21, textAlign: 'center', color: '#687562', marginTop: 12, maxWidth: 360 },
  start: { marginTop: 22, backgroundColor: green, paddingVertical: 14, paddingHorizontal: 19, borderRadius: 10 },
  footer: { paddingTop: 14 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  footerButton: { minHeight: 44, justifyContent: 'center' },
  footerLink: { color: '#58704D', fontSize: 11 },
  footerNote: { color: '#7B8475', fontSize: 10, textAlign: 'center', marginTop: 7, lineHeight: 17 },
  log: { borderRadius: 10, padding: 14, backgroundColor: '#E8ECDD', gap: 7, marginVertical: 8 },
  logText: { fontSize: 11, lineHeight: 17, color: '#53654A' },
});
