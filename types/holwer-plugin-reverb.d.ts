interface HowlerGlobal {
  loadIR(name: string, url: string): Promise<void>;
}

interface Howl {
  reverb(id?: number): HowlReverbOptions | null;
  reverb(options: HowlReverbOptions, id?: number): Howl;
  reverb(
    reverb: string | null,
    dryVolume?: number,
    wetVolume?: number,
    id?: number
  ): Howl;
}

interface HowlReverbOptions {
  name: string;
  dryGain: number;
  wetGain: number;
}
