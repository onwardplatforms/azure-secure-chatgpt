// app/page.tsx

import { Typewriter } from './components/Typewriter';

export default function Home() {
  // const words = [
  //   'Ace', 'Bass', 'Chill', 'Dope', 'Epic', 'Flow', 'Gnarly', 'Hype', 
  //   'Ill', 'Jam', 'Knockout', 'Lit', 'Melodic', 'Nasty', 'Original', 
  //   'Phat', 'Quirky', 'Rave', 'Swag', 'Turnt', 'Unreal', 'Vibe', 'Wow', 
  //   'Xtra', 'Yeet', 'Zen'
  // ];

  const words = [
    'Astonishing', 'Blissful', 'Celestial', 'Dreamlike', 'Euphoric', 'Fantastical', 
    'Glorious', 'Harmonious', 'Ineffable', 'Jubilant', 'Kaleidoscopic', 'Luminous', 
    'Majestic', 'Nirvanic', 'Otherworldly', 'Picturesque', 'Quintessential', 'Radiant', 
    'Serendipitous', 'Transcendent', 'Unearthly', 'Vivid', 'Whimsical', 'Xanadu', 
    'Yugen', 'Zenith'
  ];

  return (
    <main className="flex min-h-screen items-center justify-center text-xl bg-slate-900">
      <div className="text-center">
        <h1 className="text-xl">Get ready to start building AI apps that are:</h1>
        <h1 className="text-6xl">
          <Typewriter words={words} delay={150} pause={1000} />
        </h1>
      </div>
    </main>
  );
}
