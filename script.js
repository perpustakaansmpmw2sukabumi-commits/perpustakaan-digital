class DigitalLibrary {
    constructor() {
        this.books = [];
        this.filteredBooks = [];
        this.init();
    }

    async init() {
        await this.loadBooks();
        this.renderBooks();
        this.setupEventListeners();
        this.updateStats();
    }

    async loadBooks() {
        try {
            const response = await fetch('books.json');
            this.books = await response.json();
            this.filteredBooks = [...this.books];
        } catch (error) {
            console.error('Error loading books:', error);
            // Fallback data jika books.json tidak ada
            this.books = this.getFallbackBooks();
            this.filteredBooks = [...this.books];
        }
    }

    getFallbackBooks() {
        return [
            {
                id: 1,
                title: "Laskar Pelangi",
                author: "Andrea Hirata",
                category: "Fiksi",
                description: "Kisah inspiratif anak-anak Belitung yang berjuang meraih mimpi.",
                cover: "https://images.unsplash.com/photo-1512820790803-83ca3b5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400&q=80",
                pdf: "https://example.com/laskar-pelangi.pdf",
                pages: 432
            },
            {
                id: 2,
                title: "Atomic Habits",
                author: "James Clear",
                category: "Pengembangan Diri",
                description: "Panduan praktis membangun kebiasaan baik yang mengubah hidup.",
                cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400&q=80",
                pdf: "https://example.com/atomic-habits.pdf",
                pages: 320
            }
        ];
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        const clearBtn = document.getElementById('clearFilter');

        searchInput.addEventListener('input', () => this.filterBooks());
        categoryFilter.addEventListener('change', () => this.filterBooks());
        clearBtn.addEventListener('click', () => this.clearFilters());

        // Modal
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('bookModal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    filterBooks() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const category = document.getElementById('categoryFilter').value;

        this.filteredBooks = this.books.filter(book => {
            const matchesSearch = 
                book.title.toLowerCase().includes(searchTerm) ||
                book.author.toLowerCase().includes(searchTerm) ||
                book.description.toLowerCase().includes(searchTerm);
            
            const matchesCategory = !category || book.category === category;
            
            return matchesSearch && matchesCategory;
        });

        this.renderBooks();
        this.updateStats();
        this.updateCategoryFilter();
    }

    clearFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('categoryFilter').value = '';
        this.filteredBooks = [...this.books];
        this.renderBooks();
        this.updateStats();
    }

    renderBooks() {
        const grid = document.getElementById('booksGrid');
        const noResults = document.getElementById('noResults');

        if (this.filteredBooks.length === 0) {
            grid.style.display = 'none';
            noResults.style.display = 'block';
            return;
        }

        grid.style.display = 'grid';
        noResults.style.display = 'none';

        grid.innerHTML = this.filteredBooks.map(book => `
            <div class="book-card" onclick="library.showBookModal(${book.id})">
                <img src="${book.cover}" alt="${book.title}" class="book-cover">
                <h3 class="book-title">${book.title}</h3>
                <div class="book-author">👤 ${book.author}</div>
                <div class="book-category">${book.category}</div>
                <p class="book-description">${book.description}</p>
            </div>
        `).join('');
    }

    showBookModal(id) {
        const book = this.books.find(b => b.id === id);
        if (!book) return;

        const modal = document.getElementById('bookModal');
        const modalBody = document.getElementById('modalBody');

        modalBody.innerHTML = `
            <div class="modal-header">
                <img src="${book.cover}" alt="${book.title}" style="width: 150px; height: 200px; object-fit: cover; border-radius: 15px; float: left; margin-right: 1rem;">
                <h2>${book.title}</h2>
                <div style="color: #667eea; font-weight: 600; margin: 0.5rem 0;">${book.author}</div>
                <div style="background: linear-gradient(45deg, #667eea, #764ba2); color: white; display: inline-block; padding: 0.3rem 1rem; border-radius: 20px; font-size: 0.9rem;">${book.category}</div>
            </div>
            <div class="modal-body">
                <h4>📖 Deskripsi</h4>
                <p>${book.description}</p>
                <div style="margin: 1.5rem 0;">
                    <strong>📄 Jumlah Halaman:</strong> ${book.pages} halaman<br>
                    <strong>📅 Tahun:</strong> ${book.year || 'N/A'}
                </div>
            </div>
            <div class="modal-footer">
                <a href="${book.pdf}" class="download-btn" target="_blank">
                    <i class="fas fa-download"></i> Baca PDF
                </a>
                ${book.epub ? `<a href="${book.epub}" class="download-btn" style="background: linear-gradient(45deg, #48bb78, #38a169);" target="_blank">
                    <i class="fas fa-book"></i> EPUB
                </a>` : ''}
            </div>
        `;

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        document.getElementById('bookModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    updateStats() {
        document.getElementById('totalBooks').textContent = this.filteredBooks.length;
    }

    updateCategoryFilter() {
        const categories = [...new Set(this.books.map(book => book.category))];
        const select = document.getElementById('categoryFilter');
        
        select.innerHTML = '<option value="">Semua Kategori</option>' +
            categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    }
}

// Initialize library
const library = new DigitalLibrary();

// Close modal on X button
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => library.closeModal());
    }
});
