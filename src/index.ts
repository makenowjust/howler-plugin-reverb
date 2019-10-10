import { Howler } from "howler";

// A data uri which represents empty (0 second) wav file.
// From https://stackoverflow.com/questions/12150729/silent-sound-data-uri.
const EMPTY_WAV_URI =
  "data:audio/wave;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA==";

// Initialize internal state.
Howler._impluseResponses = Object.create(null);

Howler.loadIR = async (name: string, url: string): Promise<void> => {
  // Initialize `Howler.ctx` via loading empty wav.
  // It looks very hacking, but there is no way to call `setupAudioContext` internal function in howler.js.
  if (Howler.autoUnlock && !Howler.ctx && Howler.usingWebAudio === true) {
    new Howl({ src: EMPTY_WAV_URI }).unload();
  }

  // Stop right here if not using Web Audio.
  if (!Howler.ctx || !Howler.ctx.listener) {
    return;
  }

  // Immediately return when the given name is already loaded.
  if (name in Howler._impluseResponses) {
    return;
  }

  // Load & decode impluse response audio.
  const req = await fetch(url);
  const buf = await req.arrayBuffer();
  const ir = await Howler.ctx.decodeAudioData(buf);

  Howler._impluseResponses[name] = ir;
};

Howl.prototype.reverb = function(
  this: Howl,
  reverb: string | null = null,
  dryVolume: number = 0.7,
  wetVolume: number = 0.3
): Howl {
  // Updates this._reverbOptions.
  if (reverb === null) {
    delete this._reverbOptions;
  } else {
    this._reverbOptions = {
      name: reverb,
      dryGain: dryVolume,
      wetGain: wetVolume
    };
  }

  // Update the connections.
  if (this.playing()) {
    this.pause().play();
  }
  return this;
};

const oldRefreshBuffer = Howl.prototype._refreshBuffer;
Howl.prototype._refreshBuffer = function(this: Howl, sound: Sound): Howl {
  oldRefreshBuffer.call(this, sound);

  const options = this._reverbOptions;
  if (!options) {
    return this;
  }

  const bufferSource = sound._node.bufferSource;
  bufferSource.disconnect(0);

  const convolver = Howler.ctx.createConvolver();
  convolver.buffer = Howler._impluseResponses[options.name];
  const dry = Howler.ctx.createGain();
  dry.gain.value = options.dryGain;
  const wet = Howler.ctx.createGain();
  wet.gain.value = options.wetGain;

  const destination: AudioNode = sound._panner || sound._node;

  bufferSource.connect(dry).connect(destination);
  bufferSource
    .connect(convolver)
    .connect(wet)
    .connect(destination);

  return this;
};
