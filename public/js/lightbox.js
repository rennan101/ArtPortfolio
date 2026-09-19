/* ==========================================================================
   LIGHTBOX MODULE
   ========================================================================== */

class Lightbox {
  constructor() {
    this.items = [];
    this.currentIndex = 0;
    this.isOpen = false;
    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.modal = document.createElement('div');
    this.modal.className = 'lightbox-modal';
    this.modal.id = 'lightboxModal';
    this.modal.innerHTML = `
      <div class="lightbox-counter" id="lightboxCounter">1 / 1</div>
      <button class="lightbox-close-btn" id="lightboxClose" aria-label="Fechar">&times;</button>
      <button class="lightbox-nav-btn lightbox-prev-btn" id="lightboxPrev" aria-label="Anterior">&#10094;</button>
      <button class="lightbox-nav-btn lightbox-next-btn" id="lightboxNext" aria-label="Próximo">&#10095;</button>
      <div class="lightbox-content">
        <img class="lightbox-img" id="lightboxImg" src="" alt="Ampliação de obra de arte" />
        <div class="lightbox-caption" id="lightboxCaption"></div>
      </div>
    `;
    document.body.appendChild(this.modal);

    this.img = this.modal.querySelector('#lightboxImg');
    this.caption = this.modal.querySelector('#lightboxCaption');
    this.counter = this.modal.querySelector('#lightboxCounter');
    this.closeBtn = this.modal.querySelector('#lightboxClose');
    this.prevBtn = this.modal.querySelector('#lightboxPrev');
    this.nextBtn = this.modal.querySelector('#lightboxNext');
  }

  bindEvents() {
    this.closeBtn.addEventListener('click', () => this.close());
    this.prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.prev();
    });
    this.nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.next();
    });

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal || e.target.classList.contains('lightbox-content')) {
        this.close();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;
      if (e.key === 'Escape') this.close();
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });
  }

  open(items, startIndex = 0) {
    if (!items || items.length === 0) return;
    this.items = items;
    this.currentIndex = startIndex;
    this.isOpen = true;
    this.updateContent();
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen = false;
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  prev() {
    if (this.items.length <= 1) return;
    this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
    this.updateContent();
  }

  next() {
    if (this.items.length <= 1) return;
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
    this.updateContent();
  }

  updateContent() {
    const current = this.items[this.currentIndex];
    if (!current) return;

    this.img.src = current.src || current.Src || '';
    this.img.alt = current.title || current.alt || 'Obra de arte';
    
    let captionText = '';
    if (current.title) captionText += `<strong>${current.title}</strong>`;
    if (current.subtitle) captionText += ` &bull; ${current.subtitle}`;
    if (current.description) captionText += `<p>${current.description}</p>`;
    
    this.caption.innerHTML = captionText;
    this.counter.textContent = `${this.currentIndex + 1} / ${this.items.length}`;

    // Mostra/oculta setas se houver apenas 1 imagem
    if (this.items.length <= 1) {
      this.prevBtn.style.display = 'none';
      this.nextBtn.style.display = 'none';
    } else {
      this.prevBtn.style.display = 'flex';
      this.nextBtn.style.display = 'flex';
    }
  }
}

window.lightboxInstance = new Lightbox();
