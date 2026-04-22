import { Component, OnInit, OnDestroy, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

declare var $: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styles: [`
    .typewrite > .wrap { border-right: 0.08em solid #fff; }
  `]
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  words = ["News", "Publications", "Researchers", "Projects", "Domains"];
  currentWordIndex = 0;
  currentText = '';
  isDeleting = false;
  timeoutId: any;
  isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.type();
    }
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      // Initialize Owl Carousel after Angular has rendered the DOM
      setTimeout(() => {
        if (typeof $ !== 'undefined' && $.fn.owlCarousel) {
          $('.slider-carousel').owlCarousel({
            animateOut: 'fadeOut',
            animateIn: 'fadeIn',
            autoplay: true,
            loop: true,
            items: 1,
            margin: 0,
            stagePadding: 0,
            nav: false,
            dots: false,
            responsive: {
              0: { items: 1 },
              600: { items: 1 },
              1000: { items: 1 }
            }
          });
        }
      }, 500);
    }
  }

  ngOnDestroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    // Destroy carousel on component unmount
    if (this.isBrowser && typeof $ !== 'undefined') {
      try { $('.slider-carousel').owlCarousel('destroy'); } catch (e) {}
    }
  }

  type() {
    const currentWord = this.words[this.currentWordIndex];

    if (this.isDeleting) {
      this.currentText = currentWord.substring(0, this.currentText.length - 1);
    } else {
      this.currentText = currentWord.substring(0, this.currentText.length + 1);
    }

    let delta = 200 - Math.random() * 100;

    if (this.isDeleting) { delta /= 2; }

    if (!this.isDeleting && this.currentText === currentWord) {
      delta = 4000;
      this.isDeleting = true;
    } else if (this.isDeleting && this.currentText === '') {
      this.isDeleting = false;
      this.currentWordIndex = (this.currentWordIndex + 1) % this.words.length;
      delta = 500;
    }

    this.timeoutId = setTimeout(() => this.type(), delta);
  }
}
