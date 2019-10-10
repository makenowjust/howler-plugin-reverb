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

function reverb(this: Howl, id?: number): HowlReverbOptions | null;
function reverb(this: Howl, options: HowlReverbOptions, id?: number): Howl;
function reverb(
  this: Howl,
  reverb: string | null,
  dryVolume?: number,
  wetVolume?: number,
  id?: number
): Howl;
function reverb(
  this: Howl,
  arg1?: number | string | HowlReverbOptions | null,
  arg2?: number,
  wetVolume?: number,
  id?: number
): Howl | HowlReverbOptions | null {
  // Return current options.
  if (typeof arg1 === "undefined") {
    return this._reverbOptions || null;
  }
  if (typeof arg1 === "number") {
    const sound = this._soundById(arg1);
    return sound ? sound._reverbOptions || null : null;
  }

  // Extract options from arguments.
  let name: string | null, dryGain: number, wetGain: number;
  if (typeof arg1 === "object") {
    ({ name, dryGain = 0.7, wetGain = 0.3 } = arg1 || { name: null });
    id = arg2 as number | undefined;
  } else {
    name = arg1 as string | null;
    dryGain = typeof arg2 === "undefined" ? 0.7 : arg2;
    wetGain = typeof wetVolume === "undefined" ? 0.3 : wetVolume;
  }

  if (typeof id === "undefined") {
    if (name === null) {
      delete this._reverbOptions;
    } else {
      this._reverbOptions = { name, dryGain, wetGain };
    }
  }

  // Update _reverbOptions.
  const ids = this._getSoundIds(id);
  for (const id of ids) {
    const sound = this._soundById(id);
    if (!sound) {
      continue;
    }
    if (name === null) {
      delete sound._reverbOptions;
    } else {
      sound._reverbOptions = { name, dryGain, wetGain };
    }

    // Update the connections.
    if (!sound._paused) {
      this.pause(sound._id, true).play(sound._id, true);
    }
  }

  return this;
}

Howl.prototype.reverb = reverb;

const oldRefreshBuffer = Howl.prototype._refreshBuffer;
Howl.prototype._refreshBuffer = function(this: Howl, sound: HowlSound): Howl {
  oldRefreshBuffer.call(this, sound);

  const options = sound._reverbOptions;
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
