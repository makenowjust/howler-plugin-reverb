// This file adds missing Howler.js internal properties & methods definitions,
// and adds plugin's internal state definition.

// Missing Howler.js internal properties & methods:

interface HowlStatic {
  prototype: Howl;
}

interface Howl {
  _refreshBuffer(sound: HowlSound): Howl;
  _getSoundIds(id: number | undefined): number[];
  _soundById(id: number): HowlSound | undefined;
  pause(id: number, internal: true): Howl;
  play(id: number, internal: true): number;
}

interface HowlSound {
  _node: GainNode & { bufferSource: AudioBufferSourceNode };
  _panner: PannerNode | StereoPannerNode;
  _paused: boolean;
  _id: number;
}

// This plugin's internal state:

interface HowlerGlobal {
  _impluseResponses: { [name: string]: AudioBuffer };
}

interface Howl {
  _reverbOptions?: HowlReverbOptions;
}

interface HowlSound {
  _reverbOptions?: HowlReverbOptions;
}
