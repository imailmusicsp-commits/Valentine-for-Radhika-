import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FloatingBackground } from './components/FloatingBackground';
import { playClickSound, playPageTurnSound } from './utils/audio';
import { LETTERS, SPOTIFY_TRACKS, HINTS, PHOTOS } from './constants';

// SVG Icons
const HeartIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

export default function App() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [diaryIdx, setDiaryIdx] = useState(0); // Persistent diary index
  const [musicStarted, setMusicStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Background Music Logic
  const startMusic = useCallback(() => {
    if (musicStarted || !audioRef.current) return;
    const audio = audioRef.current;
    audio.volume = 0;
    audio.play().then(() => {
      setMusicStarted(true);
      let vol = 0;
      const fadeInterval = setInterval(() => {
        if (vol < 0.4) {
          vol += 0.02;
          audio.volume = Math.min(vol, 0.4);
        } else {
          clearInterval(fadeInterval);
        }
      }, 150);
    }).catch(() => {});
  }, [musicStarted]);

  const handleInteraction = useCallback(() => {
    playClickSound();
    startMusic();
  }, [startMusic]);

  return (
    <div 
      className="min-h-screen w-full relative overflow-hidden flex flex-col items-center text-valentine-700 select-none"
      onClick={handleInteraction}
    >
      <FloatingBackground />
      <audio ref={audioRef} loop preload="auto" src="bg-music.mp3" />

      <div className="z-10 w-full max-w-md min-h-screen flex flex-col items-center justify-center p-4 relative">
        {currentPage === 1 && <Page1Pin onUnlock={() => setCurrentPage(2)} />}
        {currentPage === 2 && <Page2Welcome onNext={() => setCurrentPage(3)} />}
        {currentPage === 3 && <Page3Feelings onNext={() => setCurrentPage(4)} />}
        {currentPage === 4 && <Page4Message onNext={() => setCurrentPage(5)} />}
        {currentPage === 5 && (
          <Page5Diary 
            idx={diaryIdx} 
            setIdx={setDiaryIdx} 
            onNext={() => setCurrentPage(6)} 
          />
        )}
        {currentPage === 6 && (
          <Page6Photos 
            onNext={() => setCurrentPage(7)} 
            onBack={() => setCurrentPage(5)} 
          />
        )}
        {currentPage === 7 && (
          <Page7Songs 
            onNext={() => setCurrentPage(8)} 
            onBack={() => setCurrentPage(6)} 
          />
        )}
        {currentPage === 8 && <Page8Final />}
      </div>
    </div>
  );
}

// --- PAGE 1: PIN ---
function Page1Pin({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (pin.length === 4) {
      if (pin === '3101') {
        setUnlocked(true);
        setTimeout(onUnlock, 1200);
      } else {
        setError(true);
        setHintIndex((prev) => (prev + 1) % HINTS.length);
        setTimeout(() => { setPin(''); setError(false); }, 600);
      }
    }
  }, [pin, onUnlock]);

  return (
    <div className={`flex flex-col items-center w-full animate-fade-in ${error ? 'animate-shake' : ''}`}>
      {unlocked ? <div className="animate-burst text-valentine-500 scale-[3]"><HeartIcon className="w-24 h-24 drop-shadow-lg" /></div> : (
        <>
          <div className="text-center mb-8 px-4">
             <HeartIcon className="w-12 h-12 mx-auto mb-4 text-valentine-500" />
            <p className="font-sans text-lg font-medium italic">“Some stories are locked… not because they are secret, but because they are precious.”</p>
          </div>
          <div className="flex gap-4 mb-8">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-2xl font-bold transition-colors ${pin.length > i ? 'border-valentine-500 bg-valentine-100 text-valentine-600' : 'border-valentine-300 bg-white/50 text-transparent'} ${error ? 'border-red-500 bg-red-100' : ''}`}>
                {pin[i] ? '*' : ''}
              </div>
            ))}
          </div>
          <p className="text-sm text-valentine-600 mb-8 font-medium h-6 text-center">{HINTS[hintIndex]}</p>
          <div className="grid grid-cols-3 gap-6 w-full max-w-[280px]">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button key={num} onClick={(e) => { e.stopPropagation(); playClickSound(); if (pin.length < 4) setPin(p => p + num); }} className="w-16 h-16 rounded-full bg-white/80 shadow-sm border border-valentine-100 text-xl font-semibold hover:bg-valentine-50 active:scale-95 transition-all">{num}</button>
            ))}
            <div /><button onClick={(e) => { e.stopPropagation(); playClickSound(); if (pin.length < 4) setPin(p => p + '0'); }} className="w-16 h-16 rounded-full bg-white/80 shadow-sm border border-valentine-100 text-xl font-semibold hover:bg-valentine-50 active:scale-95 transition-all">0</button>
            <button onClick={(e) => { e.stopPropagation(); playClickSound(); setPin(p => p.slice(0, -1)); }} className="w-16 h-16 rounded-full bg-white/50 text-xl font-semibold flex items-center justify-center">⌫</button>
          </div>
        </>
      )}
    </div>
  );
}

// --- PAGE 2: WELCOME ---
function Page2Welcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center text-center animate-fade-in w-full px-6">
      <div className="w-44 h-44 rounded-full overflow-hidden shadow-2xl mb-8 border-4 border-white"><img src="radhika_1.jpg" alt="Radhika" className="w-full h-full object-cover" /></div>
      <h1 className="text-3xl font-handwriting mb-6 leading-relaxed">“Between silence and smiles, you became a habit.”</h1>
      <button onClick={onNext} className="px-10 py-3 bg-valentine-500 text-white rounded-full shadow-lg font-medium text-lg hover:bg-valentine-600 active:scale-95 transition-all">Enter ✨</button>
    </div>
  );
}

// --- PAGE 3: FEELINGS ---
function Page3Feelings({ onNext }: { onNext: () => void }) {
  const [idx, setIdx] = useState(0);
  const [anim, setAnim] = useState(false);
  const cards = [{ text: "I don’t text first, but I wait.", emoji: "📱" }, { text: "I notice small things.", emoji: "👀" }, { text: "I feel more than I show.", emoji: "❤️" }];
  const next = () => { setAnim(true); setTimeout(() => { setIdx(i => i + 1); setAnim(false); }, 400); };
  return (
    <div className="flex flex-col items-center justify-center w-full animate-fade-in">
      {idx < cards.length ? (
        <div onClick={next} className={`bg-white rounded-3xl shadow-xl p-10 text-center cursor-pointer transition-all duration-400 border-2 border-valentine-50 w-full max-w-[280px] ${anim ? '-translate-x-full rotate-[-20deg] opacity-0' : ''}`}>
          <div className="text-6xl mb-6 bg-valentine-50 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto">{cards[idx].emoji}</div>
          <h2 className="text-2xl font-handwriting font-semibold">“{cards[idx].text}”</h2>
          <div className="mt-8 text-sm text-valentine-300 animate-pulse">Tap to see more</div>
        </div>
      ) : (
        <div className="text-center animate-slide-up">
           <h2 className="text-3xl font-handwriting mb-8">“This isn’t a confession… just a truth.”</h2>
           <button onClick={onNext} className="px-8 py-3 bg-white text-valentine-600 rounded-full shadow-lg border border-valentine-200">Continue 🕊️</button>
        </div>
      )}
    </div>
  );
}

// --- PAGE 4: MESSAGE ---
function Page4Message({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center text-center animate-fade-in w-full px-6">
       <div className="text-6xl mb-8">💌</div>
      <h1 className="text-3xl font-handwriting mb-12 px-4 leading-relaxed">“This Valentine’s Day, I didn’t bring roses or promises… just honesty.”</h1>
      <button onClick={onNext} className="px-10 py-4 bg-valentine-700 text-white rounded-xl shadow-xl font-bold flex items-center gap-3">📓 Open Diary</button>
    </div>
  );
}

// --- PAGE 5: DIARY (PERSISTENT STATE) ---
function Page5Diary({ idx, setIdx, onNext }: { idx: number, setIdx: React.Dispatch<React.SetStateAction<number>>, onNext: () => void }) {
  const [isTurning, setIsTurning] = useState(false);
  const [dir, setDir] = useState<'forward' | 'backward'>('forward');
  const [start, setStart] = useState<number | null>(null);

  const next = () => { 
    if (isTurning) return; 
    playPageTurnSound(); 
    if (idx < LETTERS.length - 1) { 
      setDir('forward'); 
      setIsTurning(true); 
      setTimeout(() => { setIdx(i => i + 1); setIsTurning(false); }, 750); 
    } else { 
      onNext(); 
    } 
  };
  
  const prev = () => { 
    if (isTurning || idx === 0) return; 
    playPageTurnSound(); 
    setDir('backward'); 
    setIsTurning(true); 
    setTimeout(() => { setIdx(i => i - 1); setIsTurning(false); }, 750); 
  };

  const handlePointerUp = (x: number) => { 
    if (!start) return; 
    const dx = start - x; 
    if (Math.abs(dx) > 50) { 
      if (dx > 0) next(); else prev(); 
    } 
    setStart(null); 
  };

  return (
    <div 
      className="w-full h-[85vh] bg-white rounded-xl shadow-2xl relative overflow-hidden animate-fade-in paper-texture flex flex-col"
      onTouchStart={e => setStart(e.touches[0].clientX)} onTouchEnd={e => handlePointerUp(e.changedTouches[0].clientX)}
      onMouseDown={e => setStart(e.clientX)} onMouseUp={e => handlePointerUp(e.clientX)}
      style={{ perspective: '1500px' }}
    >
      <div className="h-12 border-b-2 border-valentine-100 flex items-center justify-between px-4 bg-white/50 z-30">
        <span className="font-handwriting text-xl font-bold">Dear Red Flag</span>
        <span className="text-[10px] uppercase tracking-widest font-bold text-valentine-400">{idx + 1} / 15</span>
      </div>
      
      {/* Spine Shadow for realism */}
      <div className="absolute inset-0 diary-spine z-20" />

      <div className="flex-1 overflow-y-auto hide-scrollbar p-6 z-10" style={{ transformStyle: 'preserve-3d' }}>
        <div className={`min-h-full transition-all duration-800 ${isTurning ? (dir === 'forward' ? 'animate-page-turn-forward' : 'animate-page-turn-backward') : 'animate-fade-in'}`}>
          <h2 className="font-sans font-bold text-lg mb-4 text-valentine-600 border-b pb-2 flex items-center gap-2">
            <HeartIcon className="w-4 h-4" /> {LETTERS[idx].title}
          </h2>
          <p className="font-handwriting text-2xl leading-relaxed whitespace-pre-wrap text-gray-800 antialiased">
            {LETTERS[idx].content}
          </p>
        </div>
      </div>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center text-[10px] text-valentine-300 pointer-events-none uppercase tracking-widest animate-pulse z-30">
        {idx === LETTERS.length - 1 ? "Swipe for Section 2 ➡" : "Swipe to flip page"}
      </div>
    </div>
  );
}

// --- PAGE 6: PHOTOS ---
function Page6Photos({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const [start, setStart] = useState<number | null>(null);
  const handlePointerUp = (x: number) => { 
    if (!start) return; 
    const dx = start - x; 
    if (dx > 60) onNext(); 
    else if (dx < -60) onBack(); 
    setStart(null); 
  };

  return (
    <div 
      className="w-full h-[85vh] bg-valentine-50 rounded-xl shadow-2xl overflow-y-auto hide-scrollbar animate-fade-in flex flex-col"
      onTouchStart={e => setStart(e.touches[0].clientX)} onTouchEnd={e => handlePointerUp(e.changedTouches[0].clientX)}
      onMouseDown={e => setStart(e.clientX)} onMouseUp={e => handlePointerUp(e.clientX)}
    >
      <div className="p-8 pb-32 flex flex-col items-center gap-10">
        <div className="text-center mb-4">
          <h2 className="font-handwriting text-4xl text-valentine-700">Memory Lane</h2>
          <p className="font-sans text-xs uppercase tracking-widest text-valentine-300 mt-2">Section 2: The Moments</p>
        </div>
        {PHOTOS.map((photo, i) => (
          <div key={i} className={`bg-white p-4 pb-12 shadow-2xl w-[90%] transition-transform hover:scale-105 active:scale-95 duration-500 ${i % 2 === 0 ? 'rotate-[-2deg]' : 'rotate-[2deg]'}`}>
            <img src={photo.url} alt="Memory" className="w-full h-auto aspect-[3/4] object-cover rounded-sm border" />
            <p className="font-handwriting text-center mt-6 text-2xl text-valentine-600">{photo.caption}</p>
          </div>
        ))}
        <div className="flex gap-4">
          <button onClick={onBack} className="px-6 py-3 bg-white text-valentine-500 rounded-full font-bold shadow-md border border-valentine-100">⬅ Diary</button>
          <button onClick={onNext} className="px-6 py-3 bg-valentine-500 text-white rounded-full font-bold shadow-lg">Songs 🎵</button>
        </div>
      </div>
    </div>
  );
}

// --- PAGE 7: SONGS ---
function Page7Songs({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const [start, setStart] = useState<number | null>(null);
  const handlePointerUp = (x: number) => { 
    if (!start) return; 
    const dx = start - x; 
    if (dx > 60) onNext(); 
    else if (dx < -60) onBack(); 
    setStart(null); 
  };

  return (
    <div 
      className="w-full h-[85vh] bg-valentine-100/50 rounded-xl shadow-2xl overflow-y-auto hide-scrollbar animate-fade-in p-6"
      onTouchStart={e => setStart(e.touches[0].clientX)} onTouchEnd={e => handlePointerUp(e.changedTouches[0].clientX)}
      onMouseDown={e => setStart(e.clientX)} onMouseUp={e => handlePointerUp(e.clientX)}
    >
      <h2 className="font-handwriting text-4xl text-valentine-700 text-center mt-4 mb-8">Her Vibe 🎧</h2>
      <div className="flex flex-col gap-6">
        {SPOTIFY_TRACKS.map((id, i) => (
          <div key={i} className="w-full h-24 rounded-2xl overflow-hidden shadow-lg border-2 border-white">
            <iframe src={`https://open.spotify.com/embed/track/${id}?utm_source=generator&theme=0`} width="100%" height="100%" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen" loading="lazy"></iframe>
          </div>
        ))}
      </div>
      <div className="mt-12 text-center pb-12 flex flex-col gap-4">
        <button onClick={onNext} className="px-10 py-4 bg-pink-500 text-white rounded-full font-bold shadow-xl animate-pulse">The Final Truth 💖</button>
        <button onClick={onBack} className="text-valentine-400 font-medium text-sm">⬅ Back to Photos</button>
      </div>
    </div>
  );
}

// --- PAGE 8: FINAL ---
function Page8Final() {
  const [unlocked, setUnlocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);
  const [msgIndex, setMsgIndex] = useState(0);
  const [isMsgFading, setIsMsgFading] = useState(false);

  const emotionalMessages = [
    "Love is worth waiting...",
    "Patience is a beautiful confession.",
    "The best things happen at the right time.",
    "Distance makes the heart grow fonder.",
    "Waiting for you is my favorite habit.",
    "True stories don't have deadlines.",
    "Every second brings me closer to you.",
    "Some magic takes time to build.",
    "You are the moon I'd wait all night for."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const currentYear = now.getFullYear();
      let targetDate = new Date(currentYear, 1, 14, 0, 0, 0); // Feb 14th

      if (now.getTime() > targetDate.getTime() + 86400000) {
        targetDate = new Date(currentYear + 1, 1, 14, 0, 0, 0);
      }

      const diff = targetDate.getTime() - now.getTime();
      const isValentineDay = now.getMonth() === 1 && now.getDate() === 14;

      if (isValentineDay || diff <= 0) {
        setUnlocked(true);
        setTimeLeft(null);
        clearInterval(timer);
      } else {
        setUnlocked(false);
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setTimeLeft({ d, h, m, s });
      }
    }, 1000);

    // Message loop effect
    const msgTimer = setInterval(() => {
      setIsMsgFading(true);
      setTimeout(() => {
        setMsgIndex((prev) => (prev + 1) % emotionalMessages.length);
        setIsMsgFading(false);
      }, 500);
    }, 4000);

    return () => {
      clearInterval(timer);
      clearInterval(msgTimer);
    };
  }, []);

  if (!unlocked && timeLeft) {
    return (
      <div className="flex flex-col items-center justify-center text-center animate-fade-in w-full h-full min-h-[60vh] px-4">
        <div className="w-20 h-20 bg-valentine-100 rounded-full flex items-center justify-center mb-8 shadow-inner animate-pulse">
          <span className="text-4xl">🔒</span>
        </div>
        
        <h2 className={`text-4xl font-handwriting text-valentine-800 mb-2 transition-all duration-500 ${isMsgFading ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}>
          {emotionalMessages[msgIndex]}
        </h2>
        
        <p className="text-valentine-400 text-sm mb-12 uppercase tracking-widest font-bold">Unlocking in</p>
        
        <div className="grid grid-cols-4 gap-3 w-full max-w-[320px]">
          {[
            { val: timeLeft.d, label: 'Days' },
            { val: timeLeft.h, label: 'Hrs' },
            { val: timeLeft.m, label: 'Mins' },
            { val: timeLeft.s, label: 'Secs' }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="bg-white w-full py-4 rounded-2xl shadow-lg border border-valentine-100 mb-2">
                <span className="text-2xl font-bold text-valentine-600 font-mono">
                  {item.val.toString().padStart(2, '0')}
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold text-valentine-300 tracking-tighter">{item.label}</span>
            </div>
          ))}
        </div>
        
        <p className="mt-12 font-handwriting text-xl text-valentine-500 italic animate-pulse">
          “The best things happen unexpectedly, at the right time.”
        </p>
      </div>
    );
  }

  // Final Unlocked Surprise
  return (
    <div className="flex flex-col items-center justify-center text-center animate-fade-in relative z-50">
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="absolute animate-float-up" style={{ left: `${Math.random() * 100}%`, animationDuration: `${3 + Math.random() * 4}s`, animationDelay: `${-Math.random() * 5}s`, color: '#f472b6' }}>❤️</div>
        ))}
      </div>
      <div className="animate-burst text-valentine-500 mb-8 scale-150">
        <HeartIcon className="w-32 h-32 text-pink-500 fill-pink-500" />
      </div>
      <h1 className="text-4xl font-handwriting text-valentine-900 leading-tight mb-12 px-6 bg-white/40 backdrop-blur-md py-10 rounded-3xl shadow-2xl border border-white">
        “Some feelings don’t need names. They just need to be felt.” ❤️
      </h1>
      <div className="flex flex-col gap-4 w-full max-w-[220px]">
        <button onClick={playClickSound} className="py-4 bg-pink-500 text-white rounded-full font-bold shadow-xl text-lg active:scale-95 transition-all">💖 Stay</button>
        <button onClick={playClickSound} className="py-4 bg-white text-pink-600 border-2 border-pink-200 rounded-full font-bold shadow-lg text-lg active:scale-95 transition-all">💬 Talk</button>
      </div>
    </div>
  );
}
