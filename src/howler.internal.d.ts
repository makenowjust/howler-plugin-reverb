// This file adds missing Howler.js internal properties & methods definitions,
// and adds plugin's internal state definition.

// Missing Howler.js internal properties & methods:

interface HowlStatic {
  prototype: Howl;
}

interface Howl {
  _refreshBuffer(sound: Sound): Howl;
}

interface Sound {
  _node: GainNode & { bufferSource: AudioBufferSourceNode };
  _panner: PannerNode | StereoPannerNode;
}

// This plugin's internal state:

interface HowlerGlobal {
  _impluseResponses: { [name: string]: AudioBuffer };
}

interface Howl {
  _reverbOptions?: {
    name: string;
    dryGain: number;
    wetGain: number;
  };
}
