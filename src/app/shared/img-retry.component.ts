import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-img-retry',
  template: `
    <div [hidden]="showing" style="width: 100%; height: auto;">
      <img src="assets/images/loading.gif" 
           alt="Cargando..." 
           style="position: absolute; top: 50%; left: 50%; 
                  transform: translate(-50%, -50%); max-width: 120px; ">
    </div>
    <div [hidden]="!showing" style="width: 100%; height: auto;">
      <img 
      #imgRef
        [attr.alt]="alt" 
        [class]="class" 
        [style]="style"
        (load)="onLoad()" 
        (error)="onError()"
        [src]="currentSrc"
        [hidden]="loading"
        [id]="id"
      >
      <img [hidden]="!loading"
           src="assets/images/loading.gif" 
           alt="Cargando..." 
           style="position: absolute; top: 50%; left: 50%; 
                  transform: translate(-50%, -50%); max-width: 120px; ">
    </div>
  `,
  standalone: true
})
export class ImgRetryComponent implements OnInit, OnChanges {

  @Input() src!: string;
  @Input() fallback: string = 'assets/images/image-not-available.png';
  @Input() retryCount: number = 3;
  @Input() retryDelay: number = 1000;
  @Input() alt: string = '';
  @Input() class: string = '';
  @Input() style: string = '';
  @Input() showing: boolean = true;
  @Input() id!: string;

  @Output() success: any = new EventEmitter();
  @ViewChild('imgRef', { static: false }) imgRef!: ElementRef<HTMLImageElement>;
  private resizeObserver!: ResizeObserver;

  loading: boolean = true;
  private attempts = 0;
  private showingFallback = false;
  currentSrc: string = '';

  ngOnInit() {
    this.attempts = 0;
    this.showingFallback = false;
    this.loading = true;
    this.loadImage(this.src);
  }

  onLoad() {
    this.loading = false;
    this.success.emit();
    this.observeResize();
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  ngOnChanges() {
    if (this.src && this.src.length > 0) {
      this.currentSrc = this.src;
      this.attempts = 0;
      this.showingFallback = false;
      this.loading = true;
      this.loadImage(this.src);
    }
  }


  onError() {

    if (!this.showingFallback && this.attempts < this.retryCount) {
      this.attempts++;
      this.loading = true;
      setTimeout(() => {
        this.loadImage(this.src);
      }, this.retryDelay);
    } else if (!this.showingFallback) {
      this.showingFallback = true;
      this.loading = true;
      this.currentSrc = this.fallback;
    } else {
      this.loading = false;
    }
  }

  private loadImage(url: string) {

    if (!url) {
      return;
    }

    const testImg = new Image();
    testImg.onload = () => {
      this.currentSrc = url;
      this.loading = false;
      this.showingFallback = false;
      this.attempts = 0;
      this.success.emit();
    };
    testImg.onerror = () => {
      this.onError();
    };
    testImg.src = url;
  }

  private observeResize() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    if (!this.imgRef?.nativeElement) return;

    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        this.success.emit();
      }
    });

    this.resizeObserver.observe(this.imgRef.nativeElement);
  }

}
