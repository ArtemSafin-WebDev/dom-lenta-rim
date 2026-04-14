import SuperFormatSlider from "../classes/components/SuperFormatSlider";

export default function superFormatCampaign() {
  const elements = Array.from(
    document.querySelectorAll<HTMLElement>(".js-super-format-campaign-slider")
  );

  elements.forEach((element) => {
    if (SuperFormatSlider.getInstanceFor(element)) return;

    new SuperFormatSlider(element);
  });
}
