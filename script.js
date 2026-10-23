/**
 * ============================================================================
 * কি পরবো (Ki Porbo) — Personal Digital Wardrobe & Outfit Planner
 * script.js — Complete Application Logic
 * ============================================================================
 * Tech: Vanilla JavaScript, LocalStorage, HTML5 Canvas, FileReader API
 * Structure:
 *   1. App State & Constants
 *   2. Storage Helpers & Data Model
 *   3. Toast & Dialog System
 *   4. Image Processing & Canvas Compression
 *   5. Navigation & View Routing
 *   6. Add Clothing Modal & Validation
 *   7. Quick View Modal
 *   8. Closet Dashboard (Gallery, Stats, Search, Filters, Delete)
 *   9. Outfit Builder (Flat-Lay Stage, Selectors, Save)
 *  10. Saved Outfits (Grid, Dereference, Load, Delete)
 *  11. Sample Data Generator for Testing
 *  12. Initialization
 * ============================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. App State & Constants
  // --------------------------------------------------------------------------
  const STORAGE_KEYS = {
    ITEMS: 'kiPorbo_items',
    OUTFITS: 'kiPorbo_outfits'
  };

  const CATEGORIES = {
    tops: { id: 'tops', label: 'Tops / Shirts / Kurtis', short: 'Tops', icon: '👚' },
    bottoms: { id: 'bottoms', label: 'Pants / Trousers / Skirts', short: 'Pants', icon: '👖' },
    orna: { id: 'orna', label: 'Orna / Hijab / Scarves', short: 'Orna/Hijab', icon: '🧣' },
    shoes: { id: 'shoes', label: 'Shoes / Footwear', short: 'Shoes', icon: '👠' },
    bags: { id: 'bags', label: 'Bags / Clutches', short: 'Bags', icon: '👜' },
    accessories: { id: 'accessories', label: 'Accessories / Jewelry', short: 'Accessories', icon: '💍' },
    other: { id: 'other', label: 'Other', short: 'Other', icon: '✨' }
  };

  // Central Application State
  const state = {
    currentView: 'closet',
    activeFilter: 'all',
    searchQuery: '',
    items: [],
    outfits: [],
    builder: {
      topId: null,
      bottomId: null,
      ornaId: null,
      name: ''
    },
    // Form upload temporary state
    currentUploadDataUrl: null,
    isFormDirty: false,
    itemPendingDelete: null,
    outfitPendingDelete: null,
    confirmActionCallback: null
  };

  // DOM Elements Cache
  const el = {};

  function cacheDomElements() {
    // Navigation & Views
    el.navCloset = document.getElementById('nav-btn-closet');
    el.navBuilder = document.getElementById('nav-btn-builder');
    el.navSaved = document.getElementById('nav-btn-saved');
    el.navBadgeCloset = document.getElementById('nav-badge-closet');
    el.navBadgeSaved = document.getElementById('nav-badge-saved');
    el.mobileNavBtns = document.querySelectorAll('.mobile-nav-btn');
    el.viewCloset = document.getElementById('view-closet');
    el.viewBuilder = document.getElementById('view-builder');
    el.viewSaved = document.getElementById('view-saved');
    el.pageHeadline = document.getElementById('page-headline');

    // Storage info
    el.storageUsageText = document.getElementById('storage-usage-text');
    el.storageProgressBar = document.getElementById('storage-progress-bar');

    // Top action triggers
    el.topAddBtn = document.getElementById('top-add-btn');
    el.heroAddBtn = document.getElementById('hero-add-btn');
    el.heroBuilderBtn = document.getElementById('hero-builder-btn');
    el.mobileAddBtn = document.getElementById('mobile-add-btn');
    el.mobileFloatingAddBtn = document.getElementById('mobile-floating-add-btn');
    el.emptyAddBtn = document.getElementById('empty-add-btn');
    el.btnQuickSample = document.getElementById('btn-quick-sample');
    el.emptySampleBtn = document.getElementById('empty-sample-btn');

    // Closet dashboard elements
    el.heroCollage = document.getElementById('hero-collage');
    el.statTotal = document.getElementById('stat-total');
    el.statTops = document.getElementById('stat-tops');
    el.statBottoms = document.getElementById('stat-bottoms');
    el.statOrna = document.getElementById('stat-orna');
    el.closetSearch = document.getElementById('closet-search');
    el.searchClearBtn = document.getElementById('search-clear-btn');
    el.categoryChips = document.querySelectorAll('#category-filter-chips .filter-chip');
    el.closetGallery = document.getElementById('closet-gallery');
    el.closetEmptyState = document.getElementById('closet-empty-state');
    el.searchEmptyState = document.getElementById('search-empty-state');
    el.clearFiltersBtn = document.getElementById('clear-filters-btn');

    // Builder elements
    el.outfitNameInput = document.getElementById('outfit-name-input');
    el.builderClearBtn = document.getElementById('builder-clear-btn');
    el.builderSaveBtn = document.getElementById('builder-save-btn');
    el.builderItemCount = document.getElementById('builder-item-count');
    el.builderSummaryList = document.getElementById('builder-summary-list');
    el.slotTop = document.getElementById('slot-top');
    el.slotBottom = document.getElementById('slot-bottom');
    el.slotOrna = document.getElementById('slot-orna');
    el.selectorTops = document.getElementById('selector-tops');
    el.selectorBottoms = document.getElementById('selector-bottoms');
    el.selectorOrna = document.getElementById('selector-orna');
    el.selectorCountTops = document.getElementById('selector-count-tops');
    el.selectorCountBottoms = document.getElementById('selector-count-bottoms');
    el.selectorCountOrna = document.getElementById('selector-count-orna');

    // Saved outfits elements
    el.savedOutfitsGrid = document.getElementById('saved-outfits-grid');
    el.savedEmptyState = document.getElementById('saved-empty-state');
    el.savedNewBtn = document.getElementById('saved-new-btn');
    el.emptyBuilderBtn = document.getElementById('empty-builder-btn');

    // Add Modal elements
    el.addModal = document.getElementById('add-modal');
    el.addModalBackdrop = document.getElementById('add-modal-backdrop');
    el.addModalCloseBtn = document.getElementById('add-modal-close-btn');
    el.addModalCancelBtn = document.getElementById('add-modal-cancel-btn');
    el.addItemForm = document.getElementById('add-item-form');
    el.dropZone = document.getElementById('drop-zone');
    el.itemImageInput = document.getElementById('item-image-input');
    el.uploadPlaceholder = document.getElementById('upload-placeholder');
    el.uploadPreviewContainer = document.getElementById('upload-preview-container');
    el.uploadPreviewImg = document.getElementById('upload-preview-img');
    el.itemNameInput = document.getElementById('item-name-input');
    el.itemCategorySelect = document.getElementById('item-category-select');
    el.itemColorInput = document.getElementById('item-color-input');
    el.colorSwatchIndicator = document.getElementById('color-swatch-indicator');
    el.itemNotesInput = document.getElementById('item-notes-input');
    el.imageError = document.getElementById('image-error');
    el.nameError = document.getElementById('name-error');
    el.categoryError = document.getElementById('category-error');
    el.colorError = document.getElementById('color-error');

    // Quick View Modal
    el.quickViewModal = document.getElementById('quickview-modal');
    el.quickViewBackdrop = document.getElementById('quickview-backdrop');
    el.quickViewCloseBtn = document.getElementById('quickview-close-btn');
    el.quickViewCategoryBadge = document.getElementById('quickview-category-badge');
    el.quickViewImage = document.getElementById('quickview-image');
    el.quickViewTitle = document.getElementById('quickview-title');
    el.quickViewSwatch = document.getElementById('quickview-swatch');
    el.quickViewColor = document.getElementById('quickview-color');
    el.quickViewNotesBox = document.getElementById('quickview-notes-box');
    el.quickViewDate = document.getElementById('quickview-date');
    el.quickViewDeleteBtn = document.getElementById('quickview-delete-btn');
    el.quickViewBuilderBtn = document.getElementById('quickview-builder-btn');

    // Custom Confirm Modal
    el.confirmModal = document.getElementById('confirm-modal');
    el.confirmModalBackdrop = document.getElementById('confirm-modal-backdrop');
    el.confirmModalTitle = document.getElementById('confirm-modal-title');
    el.confirmModalMsg = document.getElementById('confirm-modal-msg');
    el.confirmCancelBtn = document.getElementById('confirm-cancel-btn');
    el.confirmActionBtn = document.getElementById('confirm-action-btn');

    // Toast Container
    el.toastContainer = document.getElementById('toast-container');
  }

  // --------------------------------------------------------------------------
  // 2. Storage Helpers & Data Model (§6)
  // --------------------------------------------------------------------------
  function generateId(prefix = 'itm') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  function loadFromStorage(key) {
    try {
      const data = localStorage.getItem(key);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error(`Failed to load ${key} from localStorage:`, err);
      showToast('Error loading saved data. Starting fresh.', 'error');
      return [];
    }
  }

  function saveToStorage(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      updateStorageMeter();
      return true;
    } catch (err) {
      console.error(`Storage error for ${key}:`, err);
      if (err.name === 'QuotaExceededError' || err.code === 22 || err.code === 1014) {
        showToast('Storage is full. Delete some items or use smaller photos.', 'error', 6000);
      } else {
        showToast('Failed to save to local storage.', 'error');
      }
      return false;
    }
  }

  function updateStorageMeter() {
    try {
      let totalBytes = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('kiPorbo_')) {
          totalBytes += (localStorage.getItem(k) || '').length * 2; // Approximate UTF-16 bytes
        }
      }
      const kbUsed = (totalBytes / 1024).toFixed(0);
      const mbMax = 5;
      const percent = Math.min(100, Math.max(2, (totalBytes / (mbMax * 1024 * 1024)) * 100));

      if (el.storageUsageText) {
        if (kbUsed > 1024) {
          el.storageUsageText.textContent = `${(kbUsed / 1024).toFixed(1)} MB / ${mbMax} MB`;
        } else {
          el.storageUsageText.textContent = `${kbUsed} KB / ${mbMax} MB`;
        }
      }
      if (el.storageProgressBar) {
        el.storageProgressBar.style.width = `${percent}%`;
        if (percent > 85) {
          el.storageProgressBar.classList.replace('bg-[#A9BFB2]', 'bg-[#FF1E0A]');
        } else {
          el.storageProgressBar.classList.replace('bg-[#FF1E0A]', 'bg-[#A9BFB2]');
        }
      }
    } catch (e) {
      console.warn('Storage calculation error:', e);
    }
  }

  function getItemById(id) {
    if (!id) return null;
    return state.items.find(item => item.id === id) || null;
  }

  // --------------------------------------------------------------------------
  // 3. Toast Notifications & Custom Dialog System (§7.6 & §7.11)
  // --------------------------------------------------------------------------
  function showToast(message, type = 'info', duration = 3500) {
    if (!el.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-[0_15px_30px_-10px_rgba(20,32,31,0.2)] border text-sm transition-all duration-300 transform translate-y-2 opacity-0 bg-white border-[#E7E1D6] text-[#14201F]`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
      </span>`;
    } else if (type === 'error') {
      iconSvg = `<span class="w-6 h-6 rounded-full bg-red-100 text-[#FF1E0A] flex items-center justify-center shrink-0">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
      </span>`;
    } else if (type === 'warning') {
      iconSvg = `<span class="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
      </span>`;
    } else {
      iconSvg = `<span class="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      </span>`;
    }

    toast.innerHTML = `
      ${iconSvg}
      <div class="flex-1 font-medium text-xs sm:text-sm pt-0.5 leading-snug">${escapeHtml(message)}</div>
      <button class="text-[#5C6B69] hover:text-[#14201F] text-xs p-1" aria-label="Close notification">✕</button>
    `;

    const closeBtn = toast.querySelector('button');
    const dismiss = () => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => {
        if (toast.parentElement) toast.remove();
      }, 300);
    };

    closeBtn.addEventListener('click', dismiss);
    el.toastContainer.appendChild(toast);

    // Trigger enter animation
    requestAnimationFrame(() => {
      toast.classList.remove('opacity-0', 'translate-y-2');
    });

    if (duration > 0) {
      setTimeout(dismiss, duration);
    }
  }

  function openConfirmModal(title, message, onConfirm) {
    el.confirmModalTitle.textContent = title || 'Confirm Action';
    el.confirmModalMsg.innerHTML = message || 'Are you sure you want to proceed?';
    state.confirmActionCallback = onConfirm;

    el.confirmModal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    el.confirmActionBtn.focus();
  }

  function closeConfirmModal() {
    el.confirmModal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    state.confirmActionCallback = null;
  }

  // --------------------------------------------------------------------------
  // 4. Image Processing & Canvas Compression (§6)
  // --------------------------------------------------------------------------
  /**
   * Resizes and compresses image via HTML5 Canvas
   * Max 800px on longest side, JPEG 0.75 quality
   */
  function compressImage(file) {
    return new Promise((resolve, reject) => {
      // Validate type
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please select a valid image file (JPEG, PNG, WebP).'));
        return;
      }
      // Validate size (< 8MB)
      if (file.size > 8 * 1024 * 1024) {
        reject(new Error('Image is too large. Please select a photo under 8MB.'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            const maxDimension = 800;
            let width = img.naturalWidth || img.width;
            let height = img.naturalHeight || img.height;

            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = Math.round((height * maxDimension) / width);
                width = maxDimension;
              } else {
                width = Math.round((width * maxDimension) / height);
                height = maxDimension;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            // Clean white background for transparent images converted to JPEG
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);

            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
            resolve(compressedDataUrl);
          } catch (canvasErr) {
            reject(new Error('Failed to process image through canvas.'));
          }
        };
        img.onerror = () => reject(new Error('Unable to read the image data.'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file from disk.'));
      reader.readAsDataURL(file);
    });
  }

  // --------------------------------------------------------------------------
  // 5. Navigation & View Routing (§5.1)
  // --------------------------------------------------------------------------
  function switchView(viewName) {
    if (!['closet', 'builder', 'saved'].includes(viewName)) {
      viewName = 'closet';
    }
    state.currentView = viewName;

    // Toggle views visibility
    el.viewCloset.classList.toggle('hidden', viewName !== 'closet');
    el.viewBuilder.classList.toggle('hidden', viewName !== 'builder');
    el.viewSaved.classList.toggle('hidden', viewName !== 'saved');

    // Update Desktop Nav styles
    const navMap = {
      closet: el.navCloset,
      builder: el.navBuilder,
      saved: el.navSaved
    };

    [el.navCloset, el.navBuilder, el.navSaved].forEach(btn => {
      btn.classList.remove('bg-[#14201F]', 'text-white', 'shadow-sm');
      btn.classList.add('text-[#5C6B69]', 'hover:text-[#14201F]', 'hover:bg-black/5');
    });

    const activeBtn = navMap[viewName];
    if (activeBtn) {
      activeBtn.classList.remove('text-[#5C6B69]', 'hover:text-[#14201F]', 'hover:bg-black/5');
      activeBtn.classList.add('bg-[#14201F]', 'text-white', 'shadow-sm');
    }

    // Update Mobile Nav styles
    el.mobileNavBtns.forEach(btn => {
      const bView = btn.getAttribute('data-view');
      const isActive = bView === viewName;
      btn.classList.toggle('text-[#14201F]', isActive);
      btn.classList.toggle('font-semibold', isActive);
      btn.classList.toggle('text-[#5C6B69]', !isActive);
    });

    // Update Headline according to current view
    if (viewName === 'closet') {
      el.pageHeadline.textContent = 'My Closet';
      renderClosetView();
    } else if (viewName === 'builder') {
      el.pageHeadline.textContent = 'Outfit Builder';
      renderBuilderView();
    } else if (viewName === 'saved') {
      el.pageHeadline.textContent = 'Saved Outfits';
      renderSavedOutfitsView();
    }

    // Update URL Hash without jump
    if (window.location.hash !== `#${viewName}`) {
      window.history.replaceState(null, null, `#${viewName}`);
    }

    // Scroll to top of content smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --------------------------------------------------------------------------
  // 6. Add Clothing Modal (§5.5)
  // --------------------------------------------------------------------------
  function openAddModal(preselectedCategory = '') {
    resetAddForm();
    if (preselectedCategory && CATEGORIES[preselectedCategory]) {
      el.itemCategorySelect.value = preselectedCategory;
    }
    el.addModal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    setTimeout(() => {
      el.itemNameInput.focus();
    }, 100);
  }

  function closeAddModal(force = false) {
    if (!force && state.isFormDirty) {
      openConfirmModal(
        'Discard Changes?',
        'You have unsaved changes in this piece. Are you sure you want to close without saving?',
        () => {
          closeConfirmModal();
          doCloseAddModal();
        }
      );
      return;
    }
    doCloseAddModal();
  }

  function doCloseAddModal() {
    el.addModal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    resetAddForm();
  }

  function resetAddForm() {
    el.addItemForm.reset();
    state.currentUploadDataUrl = null;
    state.isFormDirty = false;

    // Reset preview
    el.uploadPlaceholder.classList.remove('hidden');
    el.uploadPreviewContainer.classList.add('hidden');
    el.uploadPreviewImg.src = '';

    // Reset color swatch
    el.colorSwatchIndicator.style.backgroundColor = 'transparent';

    // Hide error messages
    el.imageError.classList.add('hidden');
    el.nameError.classList.add('hidden');
    el.categoryError.classList.add('hidden');
    el.colorError.classList.add('hidden');
  }

  function isValidCssColor(str) {
    if (!str || !str.trim()) return false;
    const s = new Option().style;
    s.color = str.trim();
    return s.color !== '';
  }

  function handleColorInputChange() {
    const val = el.itemColorInput.value.trim();
    state.isFormDirty = true;
    if (isValidCssColor(val)) {
      el.colorSwatchIndicator.style.backgroundColor = val;
    } else {
      el.colorSwatchIndicator.style.backgroundColor = 'transparent';
    }
  }

  async function handleImageFileSelection(file) {
    if (!file) return;
    try {
      showToast('Compressing photo...', 'info', 1500);
      const compressedDataUrl = await compressImage(file);
      state.currentUploadDataUrl = compressedDataUrl;
      state.isFormDirty = true;

      // Update UI preview
      el.uploadPreviewImg.src = compressedDataUrl;
      el.uploadPlaceholder.classList.add('hidden');
      el.uploadPreviewContainer.classList.remove('hidden');
      el.imageError.classList.add('hidden');
    } catch (err) {
      showToast(err.message, 'error');
      state.currentUploadDataUrl = null;
      el.uploadPreviewImg.src = '';
      el.uploadPlaceholder.classList.remove('hidden');
      el.uploadPreviewContainer.classList.add('hidden');
    }
  }

  function handleAddItemSubmit(e) {
    e.preventDefault();

    let hasError = false;

    // Validate Image
    if (!state.currentUploadDataUrl) {
      el.imageError.classList.remove('hidden');
      hasError = true;
    } else {
      el.imageError.classList.add('hidden');
    }

    // Validate Name
    const name = el.itemNameInput.value.trim();
    if (!name) {
      el.nameError.classList.remove('hidden');
      hasError = true;
    } else {
      el.nameError.classList.add('hidden');
    }

    // Validate Category
    const category = el.itemCategorySelect.value;
    if (!category || !CATEGORIES[category]) {
      el.categoryError.classList.remove('hidden');
      hasError = true;
    } else {
      el.categoryError.classList.add('hidden');
    }

    // Validate Color
    const color = el.itemColorInput.value.trim();
    if (!color) {
      el.colorError.classList.remove('hidden');
      hasError = true;
    } else {
      el.colorError.classList.add('hidden');
    }

    if (hasError) {
      showToast('Please fill in all required fields.', 'warning');
      return;
    }

    const notes = el.itemNotesInput.value.trim();

    const newItem = {
      id: generateId('itm'),
      name: name,
      category: category,
      color: color,
      notes: notes,
      image: state.currentUploadDataUrl,
      createdAt: Date.now()
    };

    // Save to State and Storage
    const updatedItems = [newItem, ...state.items];
    const saved = saveToStorage(STORAGE_KEYS.ITEMS, updatedItems);

    if (saved) {
      state.items = updatedItems;
      showToast(`Added "${name}" to your closet!`, 'success');
      closeAddModal(true);
      updateClosetStats();
      renderClosetView();
      renderBuilderView();
    }
  }

  // --------------------------------------------------------------------------
  // 7. Quick View Modal (§5.2.4)
  // --------------------------------------------------------------------------
  function openQuickView(item) {
    if (!item) return;

    const cat = CATEGORIES[item.category] || { label: item.category, icon: '✨' };
    el.quickViewCategoryBadge.textContent = `${cat.icon} ${cat.label}`;
    el.quickViewImage.src = item.image;
    el.quickViewImage.alt = item.name;
    el.quickViewTitle.textContent = item.name;

    // Color swatch & name
    if (isValidCssColor(item.color)) {
      el.quickViewSwatch.style.backgroundColor = item.color;
      el.quickViewSwatch.classList.remove('hidden');
    } else {
      el.quickViewSwatch.classList.add('hidden');
    }
    el.quickViewColor.textContent = item.color;

    // Notes
    if (item.notes && item.notes.trim()) {
      el.quickViewNotesBox.textContent = item.notes;
      el.quickViewNotesBox.classList.remove('hidden');
    } else {
      el.quickViewNotesBox.classList.add('hidden');
    }

    // Created Date
    const dateStr = new Date(item.createdAt || Date.now()).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    el.quickViewDate.textContent = `Added ${dateStr}`;

    // Builder button action
    el.quickViewBuilderBtn.onclick = () => {
      closeQuickView();
      switchView('builder');
      if (item.category === 'tops') {
        state.builder.topId = item.id;
      } else if (item.category === 'bottoms') {
        state.builder.bottomId = item.id;
      } else if (item.category === 'orna') {
        state.builder.ornaId = item.id;
      } else {
        showToast(`Piece is in ${cat.label}. Use Tops, Pants, or Orna for flat-lay builder.`, 'info');
      }
      renderBuilderView();
    };

    // Delete button action
    el.quickViewDeleteBtn.onclick = () => {
      closeQuickView();
      promptDeleteItem(item);
    };

    el.quickViewModal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  }

  function closeQuickView() {
    el.quickViewModal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }

  // --------------------------------------------------------------------------
  // 8. Closet Dashboard (Gallery, Stats, Search, Filters, Delete) (§5.2)
  // --------------------------------------------------------------------------
  function promptDeleteItem(item) {
    if (!item) return;

    // Check if used in saved outfits (§7.6)
    const affectedOutfits = state.outfits.filter(
      o => o.topId === item.id || o.bottomId === item.id || o.ornaId === item.id
    );

    let message = `Are you sure you want to delete <span class="font-bold text-[#14201F]">"${escapeHtml(item.name)}"</span>? This action cannot be undone.`;
    if (affectedOutfits.length > 0) {
      message += `<br><br><span class="p-2.5 bg-amber-50 rounded-xl text-amber-800 text-[11px] block border border-amber-200">
        ⚠️ <strong>Note:</strong> This piece is used in <strong>${affectedOutfits.length}</strong> saved outfit(s). Deleting it will show as <em>"Item removed"</em> in those outfits.
      </span>`;
    }

    openConfirmModal('Delete Piece?', message, () => {
      executeDeleteItem(item.id);
      closeConfirmModal();
    });
  }

  function executeDeleteItem(itemId) {
    const item = getItemById(itemId);
    const itemName = item ? item.name : 'Piece';

    // Remove from items
    state.items = state.items.filter(i => i.id !== itemId);
    saveToStorage(STORAGE_KEYS.ITEMS, state.items);

    // Clear from builder if currently selected (§7.6)
    if (state.builder.topId === itemId) state.builder.topId = null;
    if (state.builder.bottomId === itemId) state.builder.bottomId = null;
    if (state.builder.ornaId === itemId) state.builder.ornaId = null;

    showToast(`Removed "${itemName}" from your closet.`, 'info');
    updateClosetStats();
    renderClosetView();
    renderBuilderView();
    renderSavedOutfitsView();
  }

  function updateClosetStats() {
    const total = state.items.length;
    const tops = state.items.filter(i => i.category === 'tops').length;
    const bottoms = state.items.filter(i => i.category === 'bottoms').length;
    const orna = state.items.filter(i => i.category === 'orna').length;
    const shoes = state.items.filter(i => i.category === 'shoes').length;
    const bags = state.items.filter(i => i.category === 'bags').length;
    const accessories = state.items.filter(i => i.category === 'accessories').length;
    const other = state.items.filter(i => i.category === 'other').length;

    // Stat numbers
    if (el.statTotal) el.statTotal.textContent = total;
    if (el.statTops) el.statTops.textContent = tops;
    if (el.statBottoms) el.statBottoms.textContent = bottoms;
    if (el.statOrna) el.statOrna.textContent = orna;

    // Nav badges
    if (el.navBadgeCloset) el.navBadgeCloset.textContent = total;
    if (el.navBadgeSaved) el.navBadgeSaved.textContent = state.outfits.length;

    // Filter chip counts (§5.2.3)
    const counts = { all: total, tops, bottoms, orna, shoes, bags, accessories, other };
    for (const [cat, count] of Object.entries(counts)) {
      const chipEl = document.getElementById(`chip-count-${cat}`);
      if (chipEl) chipEl.textContent = count;
    }
  }

  function renderHeroCollage() {
    if (!el.heroCollage) return;

    const recentItems = state.items.slice(0, 3);
    if (recentItems.length === 0) {
      // Illustrated placeholder when closet is empty (§5.2.1)
      el.heroCollage.innerHTML = `
        <div class="w-44 h-44 rounded-3xl bg-white/70 backdrop-blur-md border border-white flex flex-col items-center justify-center p-4 text-center shadow-lg">
          <div class="w-12 h-12 rounded-full bg-[#14201F]/5 flex items-center justify-center text-2xl mb-2">
            👗
          </div>
          <span class="text-xs font-bold text-[#14201F]">Empty Rack</span>
          <span class="text-[11px] text-[#5C6B69] mt-0.5">Add your favorite kurtis & trousers</span>
        </div>
      `;
      return;
    }

    // Render 1 to 3 overlapping cards with smooth angles and shadows (§5.2.1)
    let cardsHtml = '';
    const rotationClasses = [
      '-rotate-6 translate-x-2 -translate-y-2 z-10',
      'rotate-3 translate-x-6 translate-y-3 z-20',
      'rotate-12 translate-x-12 -translate-y-1 z-30'
    ];

    recentItems.forEach((item, idx) => {
      const posClass = rotationClasses[idx] || '';
      cardsHtml += `
        <div class="absolute w-28 h-36 sm:w-32 sm:h-40 rounded-2xl overflow-hidden border-2 border-white shadow-[0_15px_35px_-10px_rgba(20,32,31,0.25)] transition-transform hover:scale-105 hover:z-40 cursor-pointer ${posClass}" onclick="kiPorbo.viewItem('${item.id}')">
          <img src="${item.image}" alt="${escapeHtml(item.name)}" class="w-full h-full object-cover">
          <div class="absolute bottom-1.5 left-1.5 right-1.5 px-2 py-0.5 rounded-full glass-badge text-[10px] font-semibold text-[#14201F] truncate text-center">
            ${escapeHtml(item.name)}
          </div>
        </div>
      `;
    });

    el.heroCollage.innerHTML = cardsHtml;
  }

  function getFilteredItems() {
    let filtered = [...state.items];

    // Filter by Category
    if (state.activeFilter !== 'all') {
      filtered = filtered.filter(item => item.category === state.activeFilter);
    }

    // Filter by Search Query (name, color, notes, category label)
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        const catName = (CATEGORIES[item.category]?.label || '').toLowerCase();
        const itemName = (item.name || '').toLowerCase();
        const itemColor = (item.color || '').toLowerCase();
        const itemNotes = (item.notes || '').toLowerCase();
        return itemName.includes(q) || itemColor.includes(q) || itemNotes.includes(q) || catName.includes(q);
      });
    }

    return filtered;
  }

  function renderClosetView() {
    updateClosetStats();
    renderHeroCollage();

    // Check if entire closet is empty
    if (state.items.length === 0) {
      el.closetGallery.innerHTML = '';
      el.closetGallery.classList.add('hidden');
      el.searchEmptyState.classList.add('hidden');
      el.closetEmptyState.classList.remove('hidden');
      return;
    }

    el.closetEmptyState.classList.add('hidden');
    el.closetGallery.classList.remove('hidden');

    const filtered = getFilteredItems();

    // If search/filter resulted in no matches
    if (filtered.length === 0) {
      el.closetGallery.innerHTML = '';
      el.searchEmptyState.classList.remove('hidden');
      const emptyMsgEl = document.getElementById('search-empty-msg');
      if (emptyMsgEl) {
        emptyMsgEl.textContent = state.searchQuery
          ? `Nothing matches "${state.searchQuery}". Try a different keyword.`
          : 'No pieces found in this category.';
      }
      return;
    }

    el.searchEmptyState.classList.add('hidden');

    // Render Gallery Cards (§5.2.4)
    el.closetGallery.innerHTML = filtered.map(item => {
      const cat = CATEGORIES[item.category] || { label: item.category, short: item.category };
      const hasValidColor = isValidCssColor(item.color);

      return `
        <div class="card-elevated group relative rounded-3xl overflow-hidden bg-white flex flex-col cursor-pointer transition-all duration-200" onclick="kiPorbo.viewItem('${item.id}')">
          <!-- 4:5 Aspect Ratio Photo Container -->
          <div class="relative w-full aspect-[4/5] bg-[#F7F3EC] overflow-hidden">
            <img src="${item.image}" alt="${escapeHtml(item.name)}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" onerror="this.onerror=null; this.src='assets/logo.jpg';">
            
            <!-- Category Badge -->
            <span class="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold glass-badge text-[#14201F] shadow-sm">
              ${escapeHtml(cat.short)}
            </span>

            <!-- Delete Icon Button (Desktop hover, mobile visible §5.2.4) -->
            <button class="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-[#5C6B69] hover:text-[#FF1E0A] hover:bg-white shadow-sm flex items-center justify-center opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" title="Delete piece" onclick="event.stopPropagation(); kiPorbo.deleteItem('${item.id}')">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>

          <!-- Card Content -->
          <div class="p-4 flex-1 flex flex-col justify-between">
            <div>
              <h4 class="font-bold text-sm sm:text-base text-[#14201F] truncate group-hover:text-[#5C6B69] transition-colors">
                ${escapeHtml(item.name)}
              </h4>

              <!-- Color Dot + Name -->
              <div class="flex items-center gap-1.5 mt-1">
                ${hasValidColor ? `<span class="w-3 h-3 rounded-full border border-black/15 shadow-sm shrink-0" style="background-color: ${escapeHtml(item.color)};"></span>` : ''}
                <span class="text-xs text-[#5C6B69] truncate">${escapeHtml(item.color)}</span>
              </div>
            </div>

            ${item.notes ? `<p class="text-[11px] text-[#5C6B69]/80 truncate mt-2 border-t border-[#E7E1D6]/60 pt-2">${escapeHtml(item.notes)}</p>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  // --------------------------------------------------------------------------
  // 9. Outfit Builder (§5.3)
  // --------------------------------------------------------------------------
  function renderBuilderView() {
    renderBuilderStage();
    renderBuilderSelectors();
  }

  function renderBuilderStage() {
    const topItem = getItemById(state.builder.topId);
    const bottomItem = getItemById(state.builder.bottomId);
    const ornaItem = getItemById(state.builder.ornaId);

    // Render Top Slot
    if (topItem) {
      el.slotTop.className = 'sm:col-span-2 flat-lay-slot bg-white rounded-2xl overflow-hidden border border-[#E7E1D6] shadow-sm relative group h-48 sm:h-52';
      el.slotTop.innerHTML = `
        <img src="${topItem.image}" alt="${escapeHtml(topItem.name)}" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex flex-col justify-end p-3">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-[10px] uppercase font-bold text-white/80">Top</span>
              <p class="text-xs sm:text-sm font-bold text-white truncate max-w-[150px] sm:max-w-[200px]">${escapeHtml(topItem.name)}</p>
            </div>
            <div class="flex items-center gap-1.5">
              <button class="px-2 py-1 bg-white/80 hover:bg-white text-[#14201F] rounded-lg text-xs font-semibold" onclick="kiPorbo.scrollToCategory('tops')">Change</button>
              <button class="w-7 h-7 bg-white/80 hover:bg-red-50 hover:text-[#FF1E0A] text-[#14201F] rounded-lg text-xs flex items-center justify-center font-bold" onclick="kiPorbo.removeFromBuilder('tops')" title="Remove">✕</button>
            </div>
          </div>
        </div>
      `;
    } else {
      el.slotTop.className = 'sm:col-span-2 flat-lay-slot empty h-48 sm:h-52';
      el.slotTop.onclick = () => scrollToCategory('tops');
      el.slotTop.innerHTML = `
        <div class="text-center p-3">
          <span class="text-2xl block mb-1">👚</span>
          <span class="text-xs font-semibold text-[#14201F]">Pick a Top</span>
          <span class="text-[11px] text-[#5C6B69] block">Kurti, Shirt, Tee</span>
        </div>
      `;
    }

    // Render Orna/Hijab Slot
    if (ornaItem) {
      el.slotOrna.className = 'sm:col-span-1 flat-lay-slot bg-white rounded-2xl overflow-hidden border border-[#E7E1D6] shadow-sm relative group h-48 sm:h-52';
      el.slotOrna.innerHTML = `
        <img src="${ornaItem.image}" alt="${escapeHtml(ornaItem.name)}" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex flex-col justify-end p-3">
          <div class="flex items-center justify-between">
            <div class="min-w-0 pr-1">
              <span class="text-[10px] uppercase font-bold text-white/80">Orna/Hijab</span>
              <p class="text-xs font-bold text-white truncate">${escapeHtml(ornaItem.name)}</p>
            </div>
            <button class="w-6 h-6 bg-white/80 hover:bg-red-50 hover:text-[#FF1E0A] text-[#14201F] rounded-md text-xs flex items-center justify-center shrink-0 font-bold" onclick="kiPorbo.removeFromBuilder('orna')" title="Remove">✕</button>
          </div>
        </div>
      `;
    } else {
      el.slotOrna.className = 'sm:col-span-1 flat-lay-slot empty h-48 sm:h-52';
      el.slotOrna.onclick = () => scrollToCategory('orna');
      el.slotOrna.innerHTML = `
        <div class="text-center p-3">
          <span class="text-2xl block mb-1">🧣</span>
          <span class="text-xs font-semibold text-[#14201F]">Orna / Hijab</span>
          <span class="text-[11px] text-[#5C6B69] block">Side drape</span>
        </div>
      `;
    }

    // Render Bottom Slot
    if (bottomItem) {
      el.slotBottom.className = 'flat-lay-slot bg-white rounded-2xl overflow-hidden border border-[#E7E1D6] shadow-sm relative group h-48 sm:h-56';
      el.slotBottom.innerHTML = `
        <img src="${bottomItem.image}" alt="${escapeHtml(bottomItem.name)}" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex flex-col justify-end p-4">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-[10px] uppercase font-bold text-white/80">Bottom</span>
              <p class="text-xs sm:text-base font-bold text-white truncate max-w-[200px] sm:max-w-xs">${escapeHtml(bottomItem.name)}</p>
            </div>
            <div class="flex items-center gap-1.5">
              <button class="px-2.5 py-1 bg-white/80 hover:bg-white text-[#14201F] rounded-lg text-xs font-semibold" onclick="kiPorbo.scrollToCategory('bottoms')">Change</button>
              <button class="w-7 h-7 bg-white/80 hover:bg-red-50 hover:text-[#FF1E0A] text-[#14201F] rounded-lg text-xs flex items-center justify-center font-bold" onclick="kiPorbo.removeFromBuilder('bottoms')" title="Remove">✕</button>
            </div>
          </div>
        </div>
      `;
    } else {
      el.slotBottom.className = 'flat-lay-slot empty h-48 sm:h-56';
      el.slotBottom.onclick = () => scrollToCategory('bottoms');
      el.slotBottom.innerHTML = `
        <div class="text-center p-3">
          <span class="text-2xl block mb-1">👖</span>
          <span class="text-xs font-semibold text-[#14201F]">Pick a Bottom</span>
          <span class="text-[11px] text-[#5C6B69] block">Pants, Palazzos, Skirt</span>
        </div>
      `;
    }

    // Summary List beneath stage
    const selectedList = [topItem, bottomItem, ornaItem].filter(Boolean);
    el.builderItemCount.textContent = `${selectedList.length} of 3 items selected`;

    if (selectedList.length === 0) {
      el.builderSummaryList.innerHTML = `<span class="text-xs text-[#5C6B69] italic">No pieces selected yet. Click any piece below to assemble your flat-lay.</span>`;
    } else {
      el.builderSummaryList.innerHTML = selectedList.map(item => `
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F7F3EC] border border-[#E7E1D6] text-[#14201F]">
          <span class="w-1.5 h-1.5 rounded-full bg-[#14201F]"></span>
          ${escapeHtml(item.name)}
        </span>
      `).join('');
    }

    // Populate outfit name input if already set
    if (state.builder.name) {
      el.outfitNameInput.value = state.builder.name;
    }
  }

  function renderBuilderSelectors() {
    renderCategorySelectorRow('tops', el.selectorTops, el.selectorCountTops, state.builder.topId);
    renderCategorySelectorRow('bottoms', el.selectorBottoms, el.selectorCountBottoms, state.builder.bottomId);
    renderCategorySelectorRow('orna', el.selectorOrna, el.selectorCountOrna, state.builder.ornaId);
  }

  function renderCategorySelectorRow(categoryKey, containerEl, countEl, selectedId) {
    if (!containerEl) return;

    const items = state.items.filter(i => i.category === categoryKey);
    if (countEl) countEl.textContent = `${items.length} available`;

    if (items.length === 0) {
      // Empty category prompt with quick add action (§5.3)
      containerEl.innerHTML = `
        <div class="w-full py-6 px-4 bg-[#F7F3EC]/70 rounded-2xl border border-dashed border-[#E7E1D6] text-center">
          <p class="text-xs text-[#5C6B69]">No ${CATEGORIES[categoryKey].short.toLowerCase()} in your closet yet.</p>
          <button class="mt-2 text-xs font-semibold text-[#14201F] hover:text-[#FF1E0A] underline underline-offset-2" onclick="kiPorbo.openAddModal('${categoryKey}')">
            + Add a ${CATEGORIES[categoryKey].short} ↗
          </button>
        </div>
      `;
      return;
    }

    containerEl.innerHTML = items.map(item => {
      const isSelected = item.id === selectedId;
      return `
        <div class="relative w-28 shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-150 cursor-pointer ${
          isSelected ? 'border-[#14201F] shadow-md ring-2 ring-[#FFC20E]' : 'border-[#E7E1D6] hover:border-[#A9BFB2]'
        }" onclick="kiPorbo.selectForBuilder('${categoryKey}', '${item.id}')">
          <div class="w-full h-24 bg-[#F7F3EC] relative">
            <img src="${item.image}" alt="${escapeHtml(item.name)}" class="w-full h-full object-cover">
            ${isSelected ? `
              <div class="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#14201F] text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                ✓
              </div>
            ` : ''}
          </div>
          <div class="p-2 bg-white">
            <p class="text-[11px] font-bold text-[#14201F] truncate">${escapeHtml(item.name)}</p>
            <p class="text-[10px] text-[#5C6B69] truncate">${escapeHtml(item.color)}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  function selectForBuilder(categoryKey, itemId) {
    if (categoryKey === 'tops') {
      state.builder.topId = state.builder.topId === itemId ? null : itemId;
    } else if (categoryKey === 'bottoms') {
      state.builder.bottomId = state.builder.bottomId === itemId ? null : itemId;
    } else if (categoryKey === 'orna') {
      state.builder.ornaId = state.builder.ornaId === itemId ? null : itemId;
    }
    renderBuilderView();
  }

  function removeFromBuilder(categoryKey) {
    if (categoryKey === 'tops') state.builder.topId = null;
    if (categoryKey === 'bottoms') state.builder.bottomId = null;
    if (categoryKey === 'orna') state.builder.ornaId = null;
    renderBuilderView();
  }

  function clearBuilder() {
    state.builder.topId = null;
    state.builder.bottomId = null;
    state.builder.ornaId = null;
    state.builder.name = '';
    el.outfitNameInput.value = '';
    renderBuilderView();
    showToast('Builder cleared.', 'info');
  }

  function scrollToCategory(categoryKey) {
    const map = {
      tops: el.selectorTops,
      bottoms: el.selectorBottoms,
      orna: el.selectorOrna
    };
    const target = map[categoryKey];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      target.classList.add('ring-2', 'ring-[#FFC20E]');
      setTimeout(() => target.classList.remove('ring-2', 'ring-[#FFC20E]'), 1000);
    }
  }

  function handleSaveOutfit() {
    const name = el.outfitNameInput.value.trim();

    // Validation (§7.8): requires name AND at least one piece
    if (!name) {
      showToast('Please name your outfit (e.g. "University Day").', 'warning');
      el.outfitNameInput.focus();
      return;
    }

    const { topId, bottomId, ornaId } = state.builder;
    if (!topId && !bottomId && !ornaId) {
      showToast('Please choose at least one piece for this outfit.', 'warning');
      return;
    }

    const newOutfit = {
      id: generateId('out'),
      name: name,
      topId: topId || null,
      bottomId: bottomId || null,
      ornaId: ornaId || null,
      createdAt: Date.now()
    };

    const updatedOutfits = [newOutfit, ...state.outfits];
    const saved = saveToStorage(STORAGE_KEYS.OUTFITS, updatedOutfits);

    if (saved) {
      state.outfits = updatedOutfits;
      showToast(`Saved outfit "${name}"!`, 'success');
      updateClosetStats();
      // Reset builder slots
      state.builder.name = '';
      el.outfitNameInput.value = '';
      // Switch to saved view so user sees their new outfit
      switchView('saved');
    }
  }

  // --------------------------------------------------------------------------
  // 10. Saved Outfits View (§5.4)
  // --------------------------------------------------------------------------
  function renderSavedOutfitsView() {
    updateClosetStats();

    if (state.outfits.length === 0) {
      el.savedOutfitsGrid.innerHTML = '';
      el.savedEmptyState.classList.remove('hidden');
      return;
    }

    el.savedEmptyState.classList.add('hidden');

    el.savedOutfitsGrid.innerHTML = state.outfits.map(outfit => {
      // Resolve IDs to items at render time (§6 & §10.6)
      const topItem = getItemById(outfit.topId);
      const bottomItem = getItemById(outfit.bottomId);
      const ornaItem = getItemById(outfit.ornaId);

      // Collect pieces for tags
      const pieces = [
        { label: 'Top', item: topItem, hadId: !!outfit.topId },
        { label: 'Bottom', item: bottomItem, hadId: !!outfit.bottomId },
        { label: 'Orna', item: ornaItem, hadId: !!outfit.ornaId }
      ];

      const dateStr = new Date(outfit.createdAt || Date.now()).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      return `
        <div class="card-elevated rounded-3xl overflow-hidden bg-white flex flex-col p-5 border border-[#E7E1D6]">
          
          <!-- Outfit Header -->
          <div class="flex items-start justify-between gap-2 mb-3">
            <div>
              <h3 class="font-bold text-base sm:text-lg text-[#14201F] tracking-tight">${escapeHtml(outfit.name)}</h3>
              <p class="text-[11px] text-[#5C6B69]">${dateStr}</p>
            </div>
            <button class="w-8 h-8 rounded-full bg-[#F7F3EC] hover:bg-red-50 text-[#5C6B69] hover:text-[#FF1E0A] flex items-center justify-center transition-colors shrink-0" title="Delete outfit" onclick="kiPorbo.deleteOutfit('${outfit.id}')">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>

          <!-- Collage Preview (Top, Bottom, Orna) (§5.4) -->
          <div class="grid grid-cols-3 gap-2 my-2 h-36 bg-[#F7F3EC] rounded-2xl p-2 border border-[#E7E1D6]/70 overflow-hidden">
            ${renderOutfitTile(topItem, outfit.topId, '👚 Top')}
            ${renderOutfitTile(bottomItem, outfit.bottomId, '👖 Bottom')}
            ${renderOutfitTile(ornaItem, outfit.ornaId, '🧣 Orna')}
          </div>

          <!-- Piece Labels Summary -->
          <div class="mt-3 flex-1">
            <p class="text-[11px] uppercase font-bold text-[#5C6B69] mb-1.5 tracking-wider">Pieces:</p>
            <div class="flex flex-wrap gap-1.5">
              ${pieces.map(p => {
                if (p.item) {
                  return `<span class="px-2 py-0.5 rounded-full text-[11px] bg-[#F7F3EC] text-[#14201F] font-medium border border-[#E7E1D6] truncate max-w-[150px]">${escapeHtml(p.item.name)}</span>`;
                } else if (p.hadId) {
                  // Muted placeholder if referenced item was deleted (§5.4 & §7.9)
                  return `<span class="px-2 py-0.5 rounded-full text-[11px] bg-red-50 text-red-600 font-medium border border-red-200">Removed</span>`;
                }
                return '';
              }).join('')}
            </div>
          </div>

          <!-- Actions: Load in Builder -->
          <div class="mt-5 pt-3 border-t border-[#E7E1D6]">
            <button class="btn-secondary w-full text-xs py-2.5 justify-center hover:bg-[#14201F] hover:text-white hover:border-[#14201F] transition-all" onclick="kiPorbo.loadOutfitInBuilder('${outfit.id}')">
              <span>Load in Builder</span>
              <span class="text-xs">↗</span>
            </button>
          </div>

        </div>
      `;
    }).join('');
  }

  function renderOutfitTile(item, hadId, placeholderLabel) {
    if (item) {
      return `
        <div class="rounded-xl overflow-hidden relative bg-white border border-[#E7E1D6] shadow-sm">
          <img src="${item.image}" alt="${escapeHtml(item.name)}" class="w-full h-full object-cover">
        </div>
      `;
    }
    if (hadId) {
      // Graceful "Item removed" tile if item was deleted (§5.4 & §7.9)
      return `
        <div class="rounded-xl border border-dashed border-red-300 bg-red-50/70 flex flex-col items-center justify-center p-2 text-center">
          <span class="text-xs text-red-400">⚠️</span>
          <span class="text-[10px] font-semibold text-red-600 leading-tight mt-0.5">Item removed</span>
        </div>
      `;
    }
    return `
      <div class="rounded-xl border border-dashed border-[#E7E1D6] bg-white/40 flex flex-col items-center justify-center p-2 text-center">
        <span class="text-[10px] text-[#5C6B69]/60 leading-tight">${placeholderLabel}</span>
      </div>
    `;
  }

  function loadOutfitInBuilder(outfitId) {
    const outfit = state.outfits.find(o => o.id === outfitId);
    if (!outfit) return;

    state.builder.topId = outfit.topId && getItemById(outfit.topId) ? outfit.topId : null;
    state.builder.bottomId = outfit.bottomId && getItemById(outfit.bottomId) ? outfit.bottomId : null;
    state.builder.ornaId = outfit.ornaId && getItemById(outfit.ornaId) ? outfit.ornaId : null;
    state.builder.name = outfit.name || '';

    switchView('builder');
    showToast(`Loaded "${outfit.name}" in Builder!`, 'info');
  }

  function promptDeleteOutfit(outfitId) {
    const outfit = state.outfits.find(o => o.id === outfitId);
    if (!outfit) return;

    openConfirmModal(
      'Delete Outfit?',
      `Are you sure you want to delete <span class="font-bold text-[#14201F]">"${escapeHtml(outfit.name)}"</span>? The clothes themselves will remain safe in your closet.`,
      () => {
        executeDeleteOutfit(outfitId);
        closeConfirmModal();
      }
    );
  }

  function executeDeleteOutfit(outfitId) {
    const outfit = state.outfits.find(o => o.id === outfitId);
    const outfitName = outfit ? outfit.name : 'Outfit';

    state.outfits = state.outfits.filter(o => o.id !== outfitId);
    saveToStorage(STORAGE_KEYS.OUTFITS, state.outfits);

    showToast(`Deleted "${outfitName}".`, 'info');
    renderSavedOutfitsView();
  }

  // --------------------------------------------------------------------------
  // 11. Sample Wardrobe Data Generator (§10.9)
  // --------------------------------------------------------------------------
  /**
   * Generates crisp, colorful SVG-based clothing illustrations
   * ensuring users can immediately test all features without taking photos!
   */
  function createSampleSvg(category, primaryColor, accentColor, iconText) {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${primaryColor}" />
            <stop offset="100%" stop-color="${accentColor}" />
          </linearGradient>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="12" stdDeviation="15" flood-color="#14201F" flood-opacity="0.15" />
          </filter>
        </defs>
        <rect width="400" height="500" fill="#F7F3EC" />
        <circle cx="200" cy="250" r="170" fill="#FFFFFF" />
        <g filter="url(#shadow)">
          <rect x="70" y="80" width="260" height="340" rx="32" fill="url(#grad)" />
          <text x="200" y="270" font-family="system-ui, sans-serif" font-size="88" text-anchor="middle" dominant-baseline="central">${iconText}</text>
        </g>
        <rect x="100" y="380" width="200" height="32" rx="16" fill="#FFFFFF" fill-opacity="0.85" />
        <text x="200" y="401" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#14201F" text-anchor="middle" dominant-baseline="central">KI PORBO LOOKS</text>
      </svg>
    `;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.trim());
  }

  function loadSampleWardrobe() {
    const samples = [
      {
        id: generateId('itm'),
        name: 'Sage Linen Kurti',
        category: 'tops',
        color: '#A9BFB2',
        notes: 'Hand-loomed breathable linen with delicate neck embroidery. Ideal for campus and casual days.',
        image: createSampleSvg('tops', '#A9BFB2', '#869F91', '👚'),
        createdAt: Date.now() - 3600000 * 24 * 3
      },
      {
        id: generateId('itm'),
        name: 'Charcoal Cotton Kurta',
        category: 'tops',
        color: '#2D3748',
        notes: 'Relaxed fit, mandarin collar, fine summer cotton.',
        image: createSampleSvg('tops', '#2D3748', '#1A202C', '👔'),
        createdAt: Date.now() - 3600000 * 24 * 2
      },
      {
        id: generateId('itm'),
        name: 'Crimson Festive Silk Tunic',
        category: 'tops',
        color: '#FF1E0A',
        notes: 'Bright Eid specialty silk tunic with golden zari edging.',
        image: createSampleSvg('tops', '#FF1E0A', '#B91C1C', '✨'),
        createdAt: Date.now() - 3600000 * 24
      },
      {
        id: generateId('itm'),
        name: 'Cream Wide-Leg Palazzos',
        category: 'bottoms',
        color: '#F7F3EC',
        notes: 'Airy viscose rayon trousers with comfortable elastic waistband.',
        image: createSampleSvg('bottoms', '#E8DFD1', '#D4C6B1', '👖'),
        createdAt: Date.now() - 3600000 * 20
      },
      {
        id: generateId('itm'),
        name: 'Black Cigarette Trousers',
        category: 'bottoms',
        color: '#14201F',
        notes: 'Tailored ankle-length trousers, formal or casual pairing.',
        image: createSampleSvg('bottoms', '#14201F', '#2C3E3D', '👖'),
        createdAt: Date.now() - 3600000 * 18
      },
      {
        id: generateId('itm'),
        name: 'Golden Mustard Chiffon Orna',
        category: 'orna',
        color: '#FFC20E',
        notes: 'Lightweight flowy dupatta with tassel tassels.',
        image: createSampleSvg('orna', '#FFC20E', '#E0A500', '🧣'),
        createdAt: Date.now() - 3600000 * 12
      },
      {
        id: generateId('itm'),
        name: 'Blush Rose Voile Hijab',
        category: 'orna',
        color: '#F472B6',
        notes: 'Ultra-soft everyday wrap scarf.',
        image: createSampleSvg('orna', '#F472B6', '#DB2777', '🌸'),
        createdAt: Date.now() - 3600000 * 6
      },
      {
        id: generateId('itm'),
        name: 'Leather Kolhapuri Sandals',
        category: 'shoes',
        color: '#92400E',
        notes: 'Handcrafted tan leather flats.',
        image: createSampleSvg('shoes', '#B45309', '#78350F', '👡'),
        createdAt: Date.now() - 3600000 * 4
      }
    ];

    state.items = [...samples, ...state.items];
    saveToStorage(STORAGE_KEYS.ITEMS, state.items);

    // Also create 1 sample curated outfit so the user sees all views populated!
    if (state.outfits.length === 0) {
      const top = samples[0]; // Sage kurti
      const bottom = samples[3]; // Cream palazzos
      const orna = samples[5]; // Mustard orna

      const demoOutfit = {
        id: generateId('out'),
        name: 'University Day Look',
        topId: top.id,
        bottomId: bottom.id,
        ornaId: orna.id,
        createdAt: Date.now()
      };
      state.outfits = [demoOutfit];
      saveToStorage(STORAGE_KEYS.OUTFITS, state.outfits);
    }

    showToast('Loaded sample clothes and outfit!', 'success');
    updateClosetStats();
    renderClosetView();
    renderBuilderView();
    renderSavedOutfitsView();
  }

  // Helper utility to safely escape HTML in templates
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --------------------------------------------------------------------------
  // 12. Event Listeners & Initialization
  // --------------------------------------------------------------------------
  function setupEventListeners() {
    // Navigation events
    el.navCloset.addEventListener('click', () => switchView('closet'));
    el.navBuilder.addEventListener('click', () => switchView('builder'));
    el.navSaved.addEventListener('click', () => switchView('saved'));

    el.mobileNavBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetView = btn.getAttribute('data-view');
        if (targetView) switchView(targetView);
      });
    });

    // Hash change handler for direct URLs (#builder, #saved, #closet)
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (['closet', 'builder', 'saved'].includes(hash)) {
        switchView(hash);
      }
    });

    // Add buttons
    [el.topAddBtn, el.heroAddBtn, el.mobileAddBtn, el.mobileFloatingAddBtn, el.emptyAddBtn].forEach(btn => {
      if (btn) btn.addEventListener('click', () => openAddModal());
    });

    if (el.heroBuilderBtn) {
      el.heroBuilderBtn.addEventListener('click', () => switchView('builder'));
    }
    if (el.savedNewBtn) {
      el.savedNewBtn.addEventListener('click', () => switchView('builder'));
    }
    if (el.emptyBuilderBtn) {
      el.emptyBuilderBtn.addEventListener('click', () => switchView('builder'));
    }

    // Sample data loader
    [el.btnQuickSample, el.emptySampleBtn].forEach(btn => {
      if (btn) btn.addEventListener('click', loadSampleWardrobe);
    });

    // Search events
    el.closetSearch.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim();
      el.searchClearBtn.classList.toggle('hidden', !state.searchQuery);
      renderClosetView();
    });

    el.searchClearBtn.addEventListener('click', () => {
      el.closetSearch.value = '';
      state.searchQuery = '';
      el.searchClearBtn.classList.add('hidden');
      renderClosetView();
    });

    if (el.clearFiltersBtn) {
      el.clearFiltersBtn.addEventListener('click', () => {
        el.closetSearch.value = '';
        state.searchQuery = '';
        state.activeFilter = 'all';
        el.searchClearBtn.classList.add('hidden');
        el.categoryChips.forEach(chip => {
          const isAll = chip.getAttribute('data-category') === 'all';
          chip.classList.toggle('active', isAll);
          const dot = chip.querySelector('.chip-dot');
          if (dot) dot.classList.toggle('hidden', !isAll);
        });
        renderClosetView();
      });
    }

    // Category Filter Chips
    el.categoryChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const cat = chip.getAttribute('data-category');
        state.activeFilter = cat;

        el.categoryChips.forEach(c => {
          const isActive = c === chip;
          c.classList.toggle('active', isActive);
          const dot = c.querySelector('.chip-dot');
          if (dot) dot.classList.toggle('hidden', !isActive);
        });

        renderClosetView();
      });
    });

    // Add Modal: File Upload Drag & Drop
    el.dropZone.addEventListener('click', () => el.itemImageInput.click());

    ['dragenter', 'dragover'].forEach(name => {
      el.dropZone.addEventListener(name, (e) => {
        e.preventDefault();
        el.dropZone.classList.add('border-[#14201F]', 'bg-white');
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      el.dropZone.addEventListener(name, (e) => {
        e.preventDefault();
        el.dropZone.classList.remove('border-[#14201F]', 'bg-white');
      });
    });

    el.dropZone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files && files[0]) {
        handleImageFileSelection(files[0]);
      }
    });

    el.itemImageInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleImageFileSelection(e.target.files[0]);
      }
    });

    // Add Modal: Inputs and Form
    el.itemColorInput.addEventListener('input', handleColorInputChange);
    el.itemNameInput.addEventListener('input', () => { state.isFormDirty = true; });
    el.itemCategorySelect.addEventListener('change', () => { state.isFormDirty = true; });
    el.itemNotesInput.addEventListener('input', () => { state.isFormDirty = true; });

    el.addItemForm.addEventListener('submit', handleAddItemSubmit);
    el.addModalCloseBtn.addEventListener('click', () => closeAddModal());
    el.addModalCancelBtn.addEventListener('click', () => closeAddModal());
    el.addModalBackdrop.addEventListener('click', () => closeAddModal());

    // Quick View Modal
    el.quickViewCloseBtn.addEventListener('click', closeQuickView);
    el.quickViewBackdrop.addEventListener('click', closeQuickView);

    // Confirm Modal
    el.confirmCancelBtn.addEventListener('click', closeConfirmModal);
    el.confirmModalBackdrop.addEventListener('click', closeConfirmModal);
    el.confirmActionBtn.addEventListener('click', () => {
      if (typeof state.confirmActionCallback === 'function') {
        state.confirmActionCallback();
      }
    });

    // Builder Actions
    el.builderClearBtn.addEventListener('click', clearBuilder);
    el.builderSaveBtn.addEventListener('click', handleSaveOutfit);

    // Global keyboard listener (Esc key)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!el.confirmModal.classList.contains('hidden')) {
          closeConfirmModal();
        } else if (!el.quickViewModal.classList.contains('hidden')) {
          closeQuickView();
        } else if (!el.addModal.classList.contains('hidden')) {
          closeAddModal();
        }
      }
    });
  }

  // Public bridge for inline onclick helpers in generated HTML
  window.kiPorbo = {
    viewItem: (id) => openQuickView(getItemById(id)),
    deleteItem: (id) => promptDeleteItem(getItemById(id)),
    openAddModal: (cat) => openAddModal(cat),
    selectForBuilder: (cat, id) => selectForBuilder(cat, id),
    removeFromBuilder: (cat) => removeFromBuilder(cat),
    scrollToCategory: (cat) => scrollToCategory(cat),
    loadOutfitInBuilder: (id) => loadOutfitInBuilder(id),
    deleteOutfit: (id) => promptDeleteOutfit(id)
  };

  function init() {
    cacheDomElements();
    setupEventListeners();

    // Load persisted data (§6 & §7.10)
    state.items = loadFromStorage(STORAGE_KEYS.ITEMS);
    state.outfits = loadFromStorage(STORAGE_KEYS.OUTFITS);

    // Detect initial view from hash
    const initialHash = window.location.hash.replace('#', '');
    const startView = ['closet', 'builder', 'saved'].includes(initialHash) ? initialHash : 'closet';

    updateStorageMeter();
    switchView(startView);

    console.log(' কি পরবো (Ki Porbo) initialized successfully.');
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
