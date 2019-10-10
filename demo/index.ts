import { Howl, Howler } from "howler";
import "../src/index.ts";

import audioURL from "./assets/audio.wav";
import irURL from "./assets/ir.wav";

const main = async () => {
  await Howler.loadIR("ir", irURL);

  const howl = new Howl({ src: audioURL });

  const dry = document.querySelector("#dry-gain")! as HTMLInputElement;
  const wet = document.querySelector("#wet-gain")! as HTMLInputElement;

  document.querySelector("#play-normal")!.addEventListener("click", () => {
    howl.stop();
    howl.reverb(null).play();
  });
  document
    .querySelector("#play-reverb")!
    .addEventListener("click", async () => {
      howl.stop();
      howl.reverb("ir", dry.valueAsNumber, wet.valueAsNumber).play();
    });
  document.querySelector("#stop")!.addEventListener("click", () => {
    howl.stop();
  });

  document
    .querySelector("#volume")!
    .addEventListener("change", function(this: HTMLInputElement) {
      howl.volume(this.valueAsNumber);
    });

  dry.addEventListener("change", () => {
    if (howl.reverb()) {
      howl.reverb("ir", dry.valueAsNumber, wet.valueAsNumber);
    }
  });
  wet.addEventListener("change", () => {
    if (howl.reverb()) {
      howl.reverb("ir", dry.valueAsNumber, wet.valueAsNumber);
    }
  });
};

main().catch(err => console.error(err));
