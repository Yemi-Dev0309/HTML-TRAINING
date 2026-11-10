import { useEffect, useRef, useState } from 'react';
import { Flower2, Play, Square, Volume2 } from 'lucide-react';
import './comfort.css';

export default function ComfortCorner() {
  const audio = useRef<AudioContext | null>(null);
  const gain = useRef<GainNode | null>(null);
  const [sound, setSound] = useState('Rain');
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(25);
  const [breathing, setBreathing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [message, setMessage] = useState('');
  const [mood, setMood] = useState('');

  function stopSound() {
    const ctx = audio.current;
    audio.current = null;
    gain.current = null;
    if (ctx) void ctx.close().catch(() => {});
    setPlaying(false);
  }

  useEffect(() => () => { if (audio.current) void audio.current.close().catch(() => {}); }, []);
  useEffect(() => {
    if (!breathing) return;
    const timer = window.setInterval(() => setElapsed(value => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [breathing]);
  useEffect(() => {
    const hide = () => {
      if (document.hidden) {
        const ctx = audio.current;
        audio.current = null;
        gain.current = null;
        if (ctx) void ctx.close().catch(() => {});
        setPlaying(false);
        setBreathing(false);
      }
    };
    document.addEventListener('visibilitychange', hide);
    return () => document.removeEventListener('visibilitychange', hide);
  }, []);

  async function startSound() {
    setMessage('');
    stopSound();
    try {
      const ctx = new AudioContext();
      audio.current = ctx;
      await ctx.resume();
      if (audio.current !== ctx) return;
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
      const values = buffer.getChannelData(0);
      let previous = 0;
      for (let i = 0; i < values.length; i++) {
        const white = Math.random() * 2 - 1;
        previous = (previous + 0.02 * white) / 1.02;
        values[i] = sound === 'Rain' ? white * 0.35 : previous * 3.5;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = sound === 'Rain' ? 2600 : 650;
      const output = ctx.createGain();
      output.gain.value = volume / 100 * 0.35;
      gain.current = output;
      source.connect(filter).connect(output).connect(ctx.destination);
      if (sound === 'Ocean') {
        const swell = ctx.createOscillator();
        const depth = ctx.createGain();
        swell.frequency.value = 0.12;
        depth.gain.value = 200;
        swell.connect(depth).connect(filter.frequency);
        swell.start();
      }
      source.start();
      setPlaying(true);
    } catch {
      stopSound();
      setMessage('Sound could not start. Try again in an updated browser and check your device volume.');
    }
  }

  const phase = elapsed % 10 < 4 ? 'Breathe in gently' : 'Breathe out slowly';
  return <section className='card comfort' aria-labelledby='comfort-title'>
    <div className='section-heading'><div><span className='eyebrow'>A MOMENT FOR YOURSELF</span><h2 id='comfort-title'>Your Comfort Corner</h2></div><Flower2 color='#ad708c' size={25}/></div>
    <p className='muted'>What would feel helpful right now? Choose a sound, a gentle breath, or simply a quiet moment.</p>
    <div className='comfort-columns'>
      <div className='comfort-panel'>
        <h3><Volume2 size={17}/> A softer background</h3>
        <p>Optional rain-inspired or ocean-inspired sound, made on your device.</p>
        <label>Choose a sound<select value={sound} onChange={e => { stopSound(); setSound(e.target.value); }}><option>Rain</option><option>Ocean</option></select></label>
        <label>Volume: {volume}%<input aria-label='Sound volume' type='range' min='0' max='100' value={volume} onChange={e => { const value = Number(e.target.value); setVolume(value); if (gain.current && audio.current) gain.current.gain.setTargetAtTime(value / 100 * 0.35, audio.current.currentTime, 0.05); }}/></label>
        <button className={playing ? 'secondary' : 'primary'} onClick={() => { if (playing) stopSound(); else void startSound(); }}>{playing ? <Square size={15}/> : <Play size={15}/>} {playing ? 'Stop sound' : 'Play sound'}</button>
        <small>{playing ? sound + ' sound is playing. You control when it stops.' : 'No autoplay. Start at a comfortable volume.'}</small>
        {message && <p className='error' role='alert'>{message}</p>}
      </div>
      <div className='comfort-panel breathe-panel'>
        <h3>A gentle breathing break</h3>
        <p>Follow the flower at your own pace. No breath-holding needed.</p>
        <div className={'breathing-flower ' + (breathing ? 'moving' : '')}><Flower2 size={62} strokeWidth={1}/></div>
        <strong className='breath-cue'>{breathing ? phase : 'Take a moment, just for you'}</strong>
        <small>{breathing ? Math.floor(elapsed / 60) + ':' + String(elapsed % 60).padStart(2, '0') + ' · In for 4 seconds, out for 6' : 'Start whenever you feel ready'}</small>
        <button className='secondary' onClick={() => { setBreathing(!breathing); setElapsed(0); }}>{breathing ? 'Stop breathing guide' : 'Start breathing guide'}</button>
        <small>You can stop anytime. Breathe normally if this feels uncomfortable.</small>
      </div>
    </div>
    <div className='mood-check'><h3>How are you feeling right now?</h3><div className='mood-options'>{['Calm', 'Worried', 'Tired', 'Overwhelmed'].map(value => <button key={value} aria-pressed={mood === value} className={mood === value ? 'selected' : ''} onClick={() => setMood(mood === value ? '' : value)}>{value}</button>)}</div><p role='status'>{mood === 'Calm' ? 'There’s no task to finish here. Enjoy a little space for yourself.' : mood === 'Worried' ? 'You can take this one moment at a time. Choose quiet, a sound, or a gentle breath.' : mood === 'Tired' ? 'It’s okay to pause. Choose whatever feels comfortable for you.' : mood === 'Overwhelmed' ? 'There’s nothing you need to complete here. You can stop, rest, or reach out to someone you trust.' : 'An optional check-in. Your answer is not saved.'}</p></div>
    <p className='comfort-footnote'>A space for comfort, not treatment for anxiety or period pain. Sound and the breathing guide stop when you leave this tab. Reduced-motion preferences are respected.</p>
  </section>;
}
