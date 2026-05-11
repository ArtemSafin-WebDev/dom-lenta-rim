import SuperFormatBestScreensSlider from "../classes/components/SuperFormatBestScreensSlider";

export default function superFormatBestScreens() {
  const elements = Array.from(
    document.querySelectorAll<HTMLElement>(".js-super-format-best-screens-slider")
  );

  elements.forEach((element) => {
    if (SuperFormatBestScreensSlider.getInstanceFor(element)) return;

    new SuperFormatBestScreensSlider(element);
  });
}
