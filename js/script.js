// GLOBAL STATE
let bookDatabase = [];
let currentSession = null;
let currentBook = null;
let paymentType = null; // 'download' or 'read'

// LOAD BOOK DATABASE
async function loadBookDatabase() {
    try {
        const response = await fetch('database/books.json');
        const data = await response.json();
        bookDatabase = data.books;
        renderBooks();
    } catch (error) {
        console.error('Failed to load book database:', error);
        bookDatabase = getDefaultBooks();
        renderBooks();
    }
}

// RENDER BOOKS TO GRID
function renderBooks(booksToShow = bookDatabase) {
    const grid = document.getElementById('booksGrid');
    grid.innerHTML = '';
    
    if (booksToShow.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: white; padding: 40px;">No books found</p>';
        return;
    }
    
    booksToShow.forEach(book => {
        const card = createBookCard(book);
        grid.appendChild(card);
    });
}

// CREATE BOOK CARD ELEMENT
function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
        <img src="${book.previewImage}" alt="${book.title}" class="book-preview">
        <div class="book-info">
            <h3 class="book-title">${book.title}</h3>
            <p class="book-price">K${book.price}.00</p>
            <div class="book-counters">
                <div class="counter">
                    <span class="counter-label">📥 Downloads</span>
                    <span class="counter-value">${book.downloads}</span>
                </div>
                <div class="counter">
                    <span class="counter-label">👁️ Views</span>
                    <span class="counter-value">${book.views}</span>
                </div>
                <div class="counter">
                    <span class="counter-label">🔗 Shares</span>
                    <span class="counter-value">${book.shares}</span>
                </div>
            </div>
            <div class="book-buttons">
                <button class="book-btn download-btn" data-id="${book.id}" onclick="openBookActionsModal('${book.id}')">📥 Download</button>
                <button class="book-btn view-btn" data-id="${book.id}" onclick="openBookActionsModal('${book.id}')">👁️ Read</button>
                <button class="book-btn share-btn" data-id="${book.id}" onclick="handleShare('${book.id}')">🔗 Share</button>
            </div>
        </div>
    `;
    return card;
}

// SEARCH FUNCTIONALITY
document.getElementById('searchBar').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const suggestions = document.getElementById('searchSuggestions');
    
    if (query.length < 1) {
        suggestions.classList.add('hidden');
        return;
    }
    
    const filtered = bookDatabase.filter(book => 
        book.title.toLowerCase().includes(query) ||
        book.category.toLowerCase().includes(query)
    ).slice(0, 8);
    
    if (filtered.length === 0) {
        suggestions.classList.add('hidden');
        return;
    }
    
    suggestions.innerHTML = filtered.map(book => `
        <div class="suggestion-item" onclick="selectSuggestion('${book.id}')">${book.title}</div>
    `).join('');
    suggestions.classList.remove('hidden');
});

// SELECT SUGGESTION
function selectSuggestion(bookId) {
    const book = bookDatabase.find(b => b.id === bookId);
    if (book) {
        document.getElementById('searchBar').value = book.title;
        document.getElementById('searchSuggestions').classList.add('hidden');
        renderBooks([book]);
        document.querySelector('.books-section').scrollIntoView({ behavior: 'smooth' });
    }
}

// MENU MODAL
document.getElementById('menuBtn').addEventListener('click', () => {
    document.getElementById('menuModal').classList.remove('hidden');
});

document.getElementById('menuModal').addEventListener('click', (e) => {
    if (e.target.id === 'menuModal' || e.target.classList.contains('close-btn')) {
        document.getElementById('menuModal').classList.add('hidden');
    }
});

// MENU LINKS
document.querySelectorAll('.menu-list a').forEach(link => {
    link.addEventListener('click', (e) => {
        const target = e.target.getAttribute('href');
        document.getElementById('menuModal').classList.add('hidden');
        
        if (target === '#about') {
            document.getElementById('aboutModal').classList.remove('hidden');
        } else if (target === '#contact') {
            document.getElementById('contactModal').classList.remove('hidden');
        }
    });
});

// CLOSE ABOUT MODAL
document.getElementById('aboutModal').addEventListener('click', (e) => {
    if (e.target.id === 'aboutModal' || e.target.classList.contains('close-btn')) {
        document.getElementById('aboutModal').classList.add('hidden');
    }
});

// CLOSE CONTACT MODAL
document.getElementById('contactModal').addEventListener('click', (e) => {
    if (e.target.id === 'contactModal' || e.target.classList.contains('close-btn')) {
        document.getElementById('contactModal').classList.add('hidden');
    }
});

// DONATIONS BUTTON
document.getElementById('donationsBtn').addEventListener('click', () => {
    document.getElementById('donationsModal').classList.remove('hidden');
});

document.getElementById('donationsModal').addEventListener('click', (e) => {
    if (e.target.id === 'donationsModal' || e.target.classList.contains('close-btn')) {
        document.getElementById('donationsModal').classList.add('hidden');
    }
});

// WHATSAPP BUTTON
document.getElementById('whatsappBtn').addEventListener('click', () => {
    const phone = '265993984344';
    const message = 'Add me to MEBV';
    const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(waLink, '_blank');
});

// COPY ACCOUNT BUTTONS
document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const account = this.getAttribute('data-account');
        navigator.clipboard.writeText(account).then(() => {
            const originalText = this.textContent;
            this.textContent = '✓ Copied!';
            this.classList.add('copied');
            setTimeout(() => {
                this.textContent = originalText;
                this.classList.remove('copied');
            }, 2000);
        });
    });
});

// OPEN BOOK ACTIONS MODAL
function openBookActionsModal(bookId) {
    const book = bookDatabase.find(b => b.id === bookId);
    if (book) {
        currentBook = book;
        document.getElementById('modalBookTitle').textContent = book.title;
        document.getElementById('bookActionsModal').classList.remove('hidden');
    }
}

document.getElementById('bookActionsModal').addEventListener('click', (e) => {
    if (e.target.id === 'bookActionsModal' || e.target.classList.contains('close-btn')) {
        document.getElementById('bookActionsModal').classList.add('hidden');
    }
});

// HANDLE DOWNLOAD
document.getElementById('downloadBtn').addEventListener('click', () => {
    paymentType = 'download';
    document.getElementById('bookActionsModal').classList.add('hidden');
    showPaymentModal(600, 'Download Book');
});

// HANDLE READ ONLINE
document.getElementById('readBtn').addEventListener('click', () => {
    paymentType = 'read';
    document.getElementById('bookActionsModal').classList.add('hidden');
    showPaymentModal(240, 'Read Online for 24 Hours');
});

// SHOW PAYMENT MODAL
function showPaymentModal(amount, type) {
    document.getElementById('paymentAmount').textContent = `Amount: K${amount}.00`;
    document.getElementById('paymentTitle').textContent = type;
    document.getElementById('paymentQuote').textContent = `Transfer K${amount}.00 to access your book`;
    document.getElementById('paymentModal').classList.remove('hidden');
}

document.getElementById('paymentModal').addEventListener('click', (e) => {
    if (e.target.id === 'paymentModal' || e.target.classList.contains('close-btn')) {
        document.getElementById('paymentModal').classList.add('hidden');
    }
});

// CONFIRM PAYMENT
document.getElementById('confirmPaymentBtn').addEventListener('click', () => {
    document.getElementById('paymentModal').classList.add('hidden');
    resetValidationModal();
    document.getElementById('validationModal').classList.remove('hidden');
});

// RESET VALIDATION MODAL
function resetValidationModal() {
    document.getElementById('transactionIdInput').value = '';
    document.getElementById('transactionIdInput').readOnly = false;
    document.getElementById('validateBtn').classList.remove('hidden');
    document.getElementById('pasteAgainBtn').classList.add('hidden');
    document.getElementById('validationMessage').classList.add('hidden');
    document.getElementById('validationMessage').textContent = '';
}

// HANDLE PASTE EVENT
document.getElementById('transactionIdInput').addEventListener('paste', (e) => {
    setTimeout(() => {
        const text = document.getElementById('transactionIdInput').value;
        if (text.trim()) {
            document.getElementById('transactionIdInput').readOnly = true;
            document.getElementById('validateBtn').classList.remove('hidden');
            document.getElementById('pasteAgainBtn').classList.remove('hidden');
        }
    }, 10);
});

// PASTE AGAIN BUTTON
document.getElementById('pasteAgainBtn') && document.getElementById('pasteAgainBtn').addEventListener('click', () => {
    resetValidationModal();
});

// HANDLE SHARE
function handleShare(bookId) {
    const book = bookDatabase.find(b => b.id === bookId);
    if (book) {
        const shareLink = `${window.location.origin}?book=${book.id}&shared=true`;
        document.getElementById('shareLink').value = shareLink;
        document.getElementById('bookActionsModal').classList.add('hidden');
        document.getElementById('shareModal').classList.remove('hidden');
    }
}

document.getElementById('shareModal').addEventListener('click', (e) => {
    if (e.target.id === 'shareModal' || e.target.classList.contains('close-btn')) {
        document.getElementById('shareModal').classList.add('hidden');
    }
});

// COPY SHARE LINK
document.getElementById('copyShareBtn').addEventListener('click', () => {
    const link = document.getElementById('shareLink').value;
    navigator.clipboard.writeText(link).then(() => {
        const btn = document.getElementById('copyShareBtn');
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    });
});

// VALIDATE TRANSACTION ID
document.getElementById('validateBtn').addEventListener('click', () => {
    const smsText = document.getElementById('transactionIdInput').value.trim();
    const message = document.getElementById('validationMessage');
    
    if (!smsText) {
        showValidationMessage('Please paste payment confirmation', 'error');
        return;
    }
    
    const isValid = validateSMSPayment(smsText);
    
    if (isValid) {
        showValidationMessage('Payment detected. Access granted.', 'success');
        setTimeout(() => {
            document.getElementById('validationModal').classList.add('hidden');
            currentSession = {
                bookId: currentBook.id,
                paymentType: paymentType,
                timestamp: Date.now()
            };
            if (paymentType === 'download') {
                simulateDownload(currentBook);
            } else {
                grantReadAccess(currentBook);
            }
        }, 1500);
    } else {
        showValidationMessage('Payment not detected. Paste full message again.', 'error');
    }
});

// CANCEL VALIDATION
document.getElementById('cancelValidationBtn').addEventListener('click', () => {
    document.getElementById('validationModal').classList.add('hidden');
    resetValidationModal();
});

// VALIDATE SMS PAYMENT LOGIC
function validateSMSPayment(smsText) {
    const upperText = smsText.toUpperCase();
    const amount = paymentType === 'download' ? '600.00' : '240.00';
    
    // Check required fields
    const hasReceiverName = upperText.includes('ABRAHAM MSOFI');
    const hasAmount = smsText.includes(amount);
    
    // Auto-detect network
    const isAirtel = smsText.includes('Successful transfer');
    const isTNM = smsText.includes('Ref:') || smsText.includes('Money Sent');
    const isValidNetwork = isAirtel || isTNM;
    
    return hasReceiverName && hasAmount && isValidNetwork;
}

// SHOW VALIDATION MESSAGE
function showValidationMessage(message, type) {
    const msgEl = document.getElementById('validationMessage');
    msgEl.textContent = message;
    msgEl.className = `validation-message ${type}`;
    msgEl.classList.remove('hidden');
}

// SIMULATE DOWNLOAD
function simulateDownload(book) {
    const downloadMsg = document.createElement('div');
    downloadMsg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 40px;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        text-align: center;
        z-index: 3000;
    `;
    downloadMsg.innerHTML = `
        <h2>📥 Download Starting</h2>
        <p>${book.title}</p>
        <p style="color: #666; font-size: 14px;">Your file will download shortly...</p>
    `;
    document.body.appendChild(downloadMsg);
    
    // Increment download counter
    book.downloads++;
    
    setTimeout(() => {
        downloadMsg.remove();
    }, 2000);
}

// GRANT READ ACCESS
function grantReadAccess(book) {
    const readMsg = document.createElement('div');
    readMsg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 40px;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        text-align: center;
        z-index: 3000;
    `;
    readMsg.innerHTML = `
        <h2>👁️ Access Granted</h2>
        <p>${book.title}</p>
        <p style="color: #666; font-size: 14px;">You have 24 hours to read this book</p>
        <p style="color: #999; font-size: 12px; margin-top: 10px;">Access expires at: ${new Date(Date.now() + 86400000).toLocaleString()}</p>
    `;
    document.body.appendChild(readMsg);
    
    // Increment view counter
    book.views++;
    
    setTimeout(() => {
        readMsg.remove();
    }, 2500);
}

// CLOSE MODALS ON ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
        document.getElementById('searchSuggestions').classList.add('hidden');
    }
});

// LOAD BOOKS ON PAGE LOAD
document.addEventListener('DOMContentLoaded', () => {
    loadBookDatabase();
    
    // Check if shared link
    const params = new URLSearchParams(window.location.search);
    if (params.has('shared')) {
        console.log('Accessed via shared link - payment required');
    }
});

// DEFAULT BOOKS (fallback if JSON fails)
function getDefaultBooks() {
    return [
        {
            id: 'B001',
            title: '2022 Form Four Notes',
            category: 'Form 4',
            price: 600,
            filePath: 'books1/2022 form four notes.docx',
            previewImage: 'assets/previews/default.png',
            downloads: 145,
            views: 523,
            shares: 28
        },
        {
            id: 'B002',
            title: 'Chemistry Excel Book 1',
            category: 'Chemistry',
            price: 600,
            filePath: 'books1/CHE_EXCEL_AND_SUCCEED BOOK_1.pdf',
            previewImage: 'assets/previews/default.png',
            downloads: 345,
            views: 1312,
            shares: 95
        },
        {
            id: 'B003',
            title: 'English Grammar Rules',
            category: 'English',
            price: 600,
            filePath: 'books2/English Grammar Rules.pdf',
            previewImage: 'assets/previews/default.png',
            downloads: 334,
            views: 1187,
            shares: 84
        }
    ];
}