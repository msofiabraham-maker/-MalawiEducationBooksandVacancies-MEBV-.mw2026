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

// DOWNLOAD BOOK
function simulateDownload(book) {
    const fileName = book.filePath.split('/').pop();
    const filePath = book.filePath;
    
    // Show downloading status
    showDownloadStatus(`📥 Downloading ${fileName}...`);
    
    console.log('Attempting to download:', filePath);
    
    // Fetch the file
    fetch(filePath)
        .then(response => {
            console.log('Fetch response status:', response.status, response.ok);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: File not found at path: ${filePath}`);
            }
            return response.blob();
        })
        .then(blob => {
            console.log('File blob created, size:', blob.size);
            
            if (blob.size === 0) {
                throw new Error('Downloaded file is empty');
            }
            
            // Create blob URL and download
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Delay revoke to ensure download completes
            setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
            
            // Increment download counter
            book.downloads++;
            
            // Show success message
            setTimeout(() => {
                showDownloadStatus(`✓ ${fileName} downloaded successfully!`, 'success');
                setTimeout(() => {
                    removeDownloadStatus();
                }, 2000);
            }, 500);
        })
        .catch(error => {
            console.error('Download error details:', error);
            showDownloadStatus(`✗ Download failed: Ensure book file exists at: ${filePath}\n\nCheck console for details.`, 'error');
            setTimeout(() => {
                removeDownloadStatus();
            }, 5000);
        });
}

// SHOW DOWNLOAD STATUS MESSAGE
function showDownloadStatus(message, type = 'info') {
    let existing = document.getElementById('downloadStatusMsg');
    if (existing) existing.remove();
    
    const statusMsg = document.createElement('div');
    statusMsg.id = 'downloadStatusMsg';
    statusMsg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px 40px;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        text-align: center;
        z-index: 3000;
        min-width: 350px;
        max-width: 90%;
        font-size: 14px;
        line-height: 1.6;
        ${type === 'error' ? 'border-left: 5px solid #ef4444;' : type === 'success' ? 'border-left: 5px solid #10b981;' : 'border-left: 5px solid #667eea;'}
    `;
    
    const heading = document.createElement('h2');
    heading.style.cssText = 'margin-bottom: 10px; font-size: 18px; color: #333;';
    heading.innerHTML = message;
    statusMsg.appendChild(heading);
    
    // Add console hint for errors
    if (type === 'error') {
        const hint = document.createElement('p');
        hint.style.cssText = 'font-size: 12px; color: #999; margin-top: 10px;';
        hint.innerHTML = 'Check your browser console (F12) for detailed error information.';
        statusMsg.appendChild(hint);
    }
    
    document.body.appendChild(statusMsg);
}

// REMOVE DOWNLOAD STATUS
function removeDownloadStatus() {
    const existing = document.getElementById('downloadStatusMsg');
    if (existing) {
        existing.remove();
    }
}

// GRANT READ/VIEW ACCESS
function grantReadAccess(book) {
    const fileName = book.filePath.split('/').pop();
    const fileExtension = fileName.split('.').pop().toLowerCase();
    const filePath = book.filePath;
    
    // Show opening status
    showDownloadStatus(`👁️ Opening ${fileName}...`);
    
    console.log('Attempting to open:', filePath, 'Extension:', fileExtension);
    
    // Determine if file can be viewed directly
    const viewableExtensions = ['pdf', 'txt', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg'];
    
    if (viewableExtensions.includes(fileExtension)) {
        // For viewable files, open in new tab
        fetch(filePath)
            .then(response => {
                console.log('Fetch response status:', response.status, response.ok);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: File not found at path: ${filePath}`);
                }
                return response.blob();
            })
            .then(blob => {
                console.log('File blob created, size:', blob.size);
                
                if (blob.size === 0) {
                    throw new Error('Downloaded file is empty');
                }
                
                const blobUrl = URL.createObjectURL(blob);
                const viewWindow = window.open(blobUrl, '_blank');
                
                if (!viewWindow) {
                    throw new Error('Could not open window. Check pop-up blocker settings.');
                }
                
                // Increment view counter
                book.views++;
                
                // Show access granted message
                setTimeout(() => {
                    showDownloadStatus(`✓ Access granted for 24 hours`, 'success');
                    setTimeout(() => {
                        removeDownloadStatus();
                    }, 2000);
                }, 500);
            })
            .catch(error => {
                console.error('View error details:', error);
                showDownloadStatus(`✗ Cannot open file: Ensure file exists at ${filePath}\n\nCheck console for details.`, 'error');
                setTimeout(() => {
                    removeDownloadStatus();
                }, 5000);
            });
    } else {
        // For other file types (DOCX, XLSX, etc.), trigger download
        fetch(filePath)
            .then(response => {
                console.log('Fetch response status:', response.status, response.ok);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: File not found at path: ${filePath}`);
                }
                return response.blob();
            })
            .then(blob => {
                console.log('File blob created, size:', blob.size);
                
                if (blob.size === 0) {
                    throw new Error('Downloaded file is empty');
                }
                
                const blobUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Delay revoke to ensure download completes
                setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
                
                // Increment view counter
                book.views++;
                
                // Show access granted message
                setTimeout(() => {
                    showDownloadStatus(`✓ Access granted for 24 hours\n${fileName} will open with your default app`, 'success');
                    setTimeout(() => {
                        removeDownloadStatus();
                    }, 3000);
                }, 500);
            })
            .catch(error => {
                console.error('Open error details:', error);
                showDownloadStatus(`✗ Cannot open file: Ensure file exists at ${filePath}\n\nCheck console for details.`, 'error');
                setTimeout(() => {
                    removeDownloadStatus();
                }, 5000);
            });
    }
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