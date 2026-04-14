import Swiper from "swiper";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import Component from "../Component";

class SuperFormatSlider extends Component {
  private swiper: Swiper | null = null;

  constructor(element: HTMLElement) {
    super(element);

    const pagination = this.element.querySelector<HTMLElement>(
      ".dom-lenta-super-format-campaign__pagination"
    );

    this.swiper = new Swiper(this.element, {
      modules: [Pagination],
      slidesPerView: 1,
      speed: 600,
      pagination: pagination
        ? {
            el: pagination,
            clickable: true,
            renderBullet(index, className) {
              return `<button class="${className}" type="button" aria-label="Показать объект ${index + 1}"></button>`;
            },
          }
        : undefined,
    });
  }

  public destroy() {
    this.swiper?.destroy(true, true);
    this.swiper = null;
    this.unregister();
  }
}

export default SuperFormatSlider;
