const ADMIN_PASSWORD = 'Mdumuka@2026';
let adminBooks = [];

// VERIFY ADMIN PASSWORD
function verifyPassword() {
    const password = document.getElementById('adminPassword').value;
    
    if (password === ADMIN_PASSWORD) {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        loadAdminBooks();
    } else {
        alert('❌ Invalid password');
        document.getElementById('adminPassword').value = '';
    }
}

// LOAD BOOKS FOR ADMIN
async function loadAdminBooks() {
    try {
        const response = await fetch('database/books.json');
        const data = await response.json();
        adminBooks = data.books;
        displayAdminBooks();
        updateStatistics();
    } catch (error) {
        console.error('Failed to load books:', error);
    }
}

// DISPLAY BOOKS IN TABLE
function displayAdminBooks() {
    const tbody = document.getElementById('booksTableBody');
    tbody.innerHTML = adminBooks.map(book => `
        <tr>
            <td>${book.id}</td>
            <td>${book.title}</td>
            <td>${book.category}</td>
            <td>K${book.price}</td>
            <td>${book.downloads}</td>
            <td>${book.views}</td>
            <td>${book.shares}</td>
            <td><button class="delete-btn" onclick="deleteBook('${book.id}')">Delete</button></td>
        </tr>
    `).join('');
}

// UPLOAD NEW BOOK
function uploadBook() {
    const title = document.getElementById('bookTitle').value.trim();
    const category = document.getElementById('bookCategory').value.trim();
    const price = parseInt(document.getElementById('bookPrice').value);
    const filePath = document.getElementById('bookFilePath').value.trim();
    const preview = document.getElementById('bookPreview').value.trim();
    
    if (!title || !category || !filePath) {
        alert('⚠️ Please fill in all required fields');
        return;
    }
    
    const newBook = {
        id: `B${(adminBooks.length + 1).toString().padStart(3, '0')}`,
        title: title,
        category: category,
        price: price,
        filePath: filePath,
        previewImage: preview || 'assets/previews/default.png',
        downloads: 0,
        views: 0,
        shares: 0
    };
    
    adminBooks.push(newBook);
    
    // Save to localStorage (in production, send to backend)
    localStorage.setItem('adminBooks', JSON.stringify(adminBooks));
    
    alert(`✓ Book "${title}" added successfully!`);
    
    // Clear form
    document.getElementById('bookTitle').value = '';
    document.getElementById('bookCategory').value = '';
    document.getElementById('bookPrice').value = '600';
    document.getElementById('bookFilePath').value = '';
    document.getElementById('bookPreview').value = 'assets/previews/default.png';
    
    displayAdminBooks();
    updateStatistics();
}

// DELETE BOOK
function deleteBook(bookId) {
    if (confirm('Are you sure you want to delete this book?')) {
        adminBooks = adminBooks.filter(b => b.id !== bookId);
        localStorage.setItem('adminBooks', JSON.stringify(adminBooks));
        alert('✓ Book deleted successfully');
        displayAdminBooks();
        updateStatistics();
    }
}

// UPLOAD AD
function uploadAd() {
    const title = document.getElementById('adTitle').value.trim();
    const media = document.getElementById('adMedia').value.trim();
    const link = document.getElementById('adLink').value.trim();
    
    if (!title || !media) {
        alert('⚠️ Please fill in title and media URL');
        return;
    }
    
    const ad = {
        id: `AD${Date.now()}`,
        title: title,
        media: media,
        link: link
    };
    
    let ads = JSON.parse(localStorage.getItem('adminAds')) || [];
    ads.push(ad);
    localStorage.setItem('adminAds', JSON.stringify(ads));
    
    alert(`✓ Ad "${title}" uploaded successfully!`);
    
    // Clear form
    document.getElementById('adTitle').value = '';
    document.getElementById('adMedia').value = '';
    document.getElementById('adLink').value = '';
}

// UPDATE STATISTICS
function updateStatistics() {
    document.getElementById('totalBooks').textContent = adminBooks.length;
    document.getElementById('totalDownloads').textContent = adminBooks.reduce((sum, b) => sum + b.downloads, 0);
    document.getElementById('totalViews').textContent = adminBooks.reduce((sum, b) => sum + b.views, 0);
    document.getElementById('totalShares').textContent = adminBooks.reduce((sum, b) => sum + b.shares, 0);
}

// LOGOUT
function logout() {
    document.getElementById('loginContainer').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('adminPassword').value = '';
}

// ACTIVATE ADMIN MODE (Ctrl + Shift + Tab)
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'Tab') {
        e.preventDefault();
        window.location.href = 'admin.html';
    }
});