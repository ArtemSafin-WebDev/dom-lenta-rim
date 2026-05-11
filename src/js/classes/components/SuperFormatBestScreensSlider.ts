import Component from "../Component";

class SuperFormatBestScreensSlider extends Component {
  private static readonly DRAG_START_THRESHOLD = 8;
  private static readonly DRAG_CHANGE_THRESHOLD = 60;

  private readonly slides: HTMLElement[];
  private activeIndex = 1;
  private readonly prev: HTMLButtonElement | null;
  private readonly next: HTMLButtonElement | null;
  private readonly slideClickHandlers: Array<() => void> = [];
  private activePointerId: number | null = null;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragDeltaX = 0;
  private isDragging = false;
  private shouldSuppressClick = false;

  private readonly handlePrevClick = () => {
    this.goTo(this.activeIndex - 1);
  };

  private readonly handleNextClick = () => {
    this.goTo(this.activeIndex + 1);
  };

  private readonly handlePointerDown = (event: PointerEvent) => {
    const target = event.target;

    if (
      target instanceof Element &&
      target.closest(".dom-lenta-super-format-best-screens__nav")
    ) {
      return;
    }

    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (this.slides.length < 2) return;

    this.activePointerId = event.pointerId;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.dragDeltaX = 0;
    this.isDragging = false;
    this.shouldSuppressClick = false;
    this.element.setPointerCapture(event.pointerId);
  };

  private readonly handlePointerMove = (event: PointerEvent) => {
    if (event.pointerId !== this.activePointerId) return;

    const deltaX = event.clientX - this.dragStartX;
    const deltaY = event.clientY - this.dragStartY;

    if (!this.isDragging) {
      const isHorizontalDrag =
        Math.abs(deltaX) > SuperFormatBestScreensSlider.DRAG_START_THRESHOLD &&
        Math.abs(deltaX) > Math.abs(deltaY);

      if (!isHorizontalDrag) return;

      this.isDragging = true;
      this.shouldSuppressClick = true;
      this.element.classList.add(
        "dom-lenta-super-format-best-screens__slider--dragging"
      );
    }

    event.preventDefault();
    this.dragDeltaX = deltaX;
    this.element.style.setProperty(
      "--dom-lenta-best-screen-drag-offset",
      `${this.getLimitedDragOffset(deltaX)}px`
    );
  };

  private readonly handlePointerUp = (event: PointerEvent) => {
    if (event.pointerId !== this.activePointerId) return;

    this.finishDrag();
  };

  private readonly handlePointerCancel = (event: PointerEvent) => {
    if (event.pointerId !== this.activePointerId) return;

    this.resetDrag();
  };

  constructor(element: HTMLElement) {
    super(element);

    this.slides = Array.from(
      this.element.querySelectorAll<HTMLElement>(
        ".dom-lenta-super-format-best-screens__slide"
      )
    );
    this.prev = this.element.querySelector<HTMLButtonElement>(
      ".dom-lenta-super-format-best-screens__nav--prev"
    );
    this.next = this.element.querySelector<HTMLButtonElement>(
      ".dom-lenta-super-format-best-screens__nav--next"
    );

    this.prev?.addEventListener("click", this.handlePrevClick);
    this.next?.addEventListener("click", this.handleNextClick);
    this.element.addEventListener("pointerdown", this.handlePointerDown);
    this.element.addEventListener("pointermove", this.handlePointerMove);
    this.element.addEventListener("pointerup", this.handlePointerUp);
    this.element.addEventListener("pointercancel", this.handlePointerCancel);

    this.slides.forEach((slide, index) => {
      const handler = () => {
        if (this.shouldSuppressClick) {
          this.shouldSuppressClick = false;
          return;
        }

        if (index !== this.activeIndex) {
          this.goTo(index);
        }
      };

      this.slideClickHandlers.push(handler);
      slide.addEventListener("click", handler);
    });

    this.updateSlides();
  }

  public destroy() {
    this.prev?.removeEventListener("click", this.handlePrevClick);
    this.next?.removeEventListener("click", this.handleNextClick);
    this.element.removeEventListener("pointerdown", this.handlePointerDown);
    this.element.removeEventListener("pointermove", this.handlePointerMove);
    this.element.removeEventListener("pointerup", this.handlePointerUp);
    this.element.removeEventListener("pointercancel", this.handlePointerCancel);
    this.slides.forEach((slide, index) => {
      const handler = this.slideClickHandlers[index];

      if (handler) {
        slide.removeEventListener("click", handler);
      }
    });
    this.unregister();
  }

  private goTo(index: number) {
    const slidesCount = this.slides.length;

    if (!slidesCount) return;

    this.activeIndex = (index + slidesCount) % slidesCount;
    this.updateSlides();
  }

  private updateSlides() {
    const slidesCount = this.slides.length;

    this.slides.forEach((slide, index) => {
      const position = this.getSlidePosition(index, slidesCount);

      slide.classList.toggle(
        "dom-lenta-super-format-best-screens__slide--active",
        position === 0
      );
      slide.classList.toggle(
        "dom-lenta-super-format-best-screens__slide--prev",
        position === -1
      );
      slide.classList.toggle(
        "dom-lenta-super-format-best-screens__slide--next",
        position === 1
      );
      slide.classList.toggle(
        "dom-lenta-super-format-best-screens__slide--hidden",
        Math.abs(position) > 1
      );
      slide.classList.toggle(
        "dom-lenta-super-format-best-screens__slide--before-prev",
        position < -1
      );
      slide.classList.toggle(
        "dom-lenta-super-format-best-screens__slide--after-next",
        position > 1
      );
      slide.setAttribute("aria-hidden", position === 0 ? "false" : "true");
      slide.tabIndex = position === 0 ? 0 : -1;
    });
  }

  private getSlidePosition(index: number, slidesCount: number) {
    const position = index - this.activeIndex;
    const half = slidesCount / 2;

    if (position > half) return position - slidesCount;
    if (position < -half) return position + slidesCount;

    return position;
  }

  private finishDrag() {
    const wasDragging = this.isDragging;
    const shouldChangeSlide =
      Math.abs(this.dragDeltaX) >=
      SuperFormatBestScreensSlider.DRAG_CHANGE_THRESHOLD;
    const nextIndex =
      this.dragDeltaX < 0 ? this.activeIndex + 1 : this.activeIndex - 1;

    this.resetDrag();

    if (wasDragging && shouldChangeSlide) {
      this.goTo(nextIndex);
    }
  }

  private resetDrag() {
    if (
      this.activePointerId !== null &&
      this.element.hasPointerCapture(this.activePointerId)
    ) {
      this.element.releasePointerCapture(this.activePointerId);
    }

    this.activePointerId = null;
    this.dragDeltaX = 0;
    this.isDragging = false;
    this.element.classList.remove(
      "dom-lenta-super-format-best-screens__slider--dragging"
    );
    this.element.style.removeProperty("--dom-lenta-best-screen-drag-offset");
  }

  private getLimitedDragOffset(deltaX: number) {
    const maxOffset = Math.max(
      80,
      Math.min(360, this.element.clientWidth * 0.32)
    );

    return Math.max(-maxOffset, Math.min(maxOffset, deltaX));
  }
}

export default SuperFormatBestScreensSlider;
