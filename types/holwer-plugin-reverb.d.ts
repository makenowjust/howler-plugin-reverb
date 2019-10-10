interface HowlerGlobal {
  loadIR(name: string, url: string): Promise<void>;
}

interface Howl {
  reverb(reverb: string | null, dryVolume?: number, wetVolume?: number): Howl;
}
