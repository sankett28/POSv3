// Navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Show target section
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById(targetId).classList.add('active');
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// Notification Panel
document.getElementById('notificationBtn').addEventListener('click', () => {
    document.getElementById('notificationPanel').classList.toggle('open');
});

function closeNotifications() {
    document.getElementById('notificationPanel').classList.remove('open');
}

// Charts
function initCharts() {
    // Sales Trend Chart
    const salesCtx = document.getElementById('salesChart').getContext('2d');
    new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Sales (₹)',
                data: [32000, 35000, 38000, 36000, 40000, 45000, 42000],
                borderColor: '#000000',
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointBackgroundColor: '#000000',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#000000',
                    padding: 12,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            return 'Sales: ₹' + context.parsed.y.toLocaleString('en-IN');
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + (value/1000) + 'k';
                        }
                    },
                    grid: {
                        color: '#f5f5f5'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    // Category Chart
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    new Chart(categoryCtx, {
        type: 'pie',
        data: {
            labels: ['Groceries', 'Beverages', 'Snacks', 'Dairy', 'Others'],
            datasets: [{
                data: [35, 25, 20, 15, 5],
                backgroundColor: [
                    '#000000',
                    '#333333',
                    '#666666',
                    '#999999',
                    '#cccccc'
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 13,
                            weight: '500'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: '#000000',
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            }
        }
    });

    // Forecast Chart
    const forecastCtx = document.getElementById('forecastChart').getContext('2d');
    new Chart(forecastCtx, {
        type: 'line',
        data: {
            labels: ['Today', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
            datasets: [
                {
                    label: 'Actual Sales',
                    data: [45000, null, null, null, null, null, null],
                    borderColor: '#000000',
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 3,
                    pointRadius: 8,
                    pointBackgroundColor: '#000000',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                },
                {
                    label: 'AI Forecast',
                    data: [45000, 47000, 49000, 48000, 52000, 58000, 55000],
                    borderColor: '#666666',
                    backgroundColor: 'rgba(102, 102, 102, 0.1)',
                    borderDash: [8, 4],
                    borderWidth: 2,
                    pointRadius: 5,
                    pointBackgroundColor: '#666666',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2.5,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        padding: 15,
                        font: {
                            size: 13,
                            weight: '500'
                        },
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: '#000000',
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ₹' + context.parsed.y.toLocaleString('en-IN');
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + (value/1000) + 'k';
                        }
                    },
                    grid: {
                        color: '#f5f5f5'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    // Peak Hours Chart
    const peakCtx = document.getElementById('peakHoursChart').getContext('2d');
    new Chart(peakCtx, {
        type: 'bar',
        data: {
            labels: ['6-8 AM', '8-10 AM', '10-12 PM', '12-2 PM', '2-4 PM', '4-6 PM', '6-8 PM', '8-10 PM'],
            datasets: [{
                label: 'Sales (₹)',
                data: [3500, 8500, 6000, 7500, 5000, 9000, 15200, 8000],
                backgroundColor: '#000000',
                borderRadius: 6,
                barThickness: 30
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.8,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#000000',
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return 'Sales: ₹' + context.parsed.y.toLocaleString('en-IN');
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + (value/1000) + 'k';
                        }
                    },
                    grid: {
                        color: '#f5f5f5'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Billing Functions
let billItems = [];
let billTotal = 0;

function addToBill(name, price) {
    const existingItem = billItems.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity++;
        existingItem.total = existingItem.quantity * existingItem.price;
    } else {
        billItems.push({
            name: name,
            price: price,
            quantity: 1,
            total: price
        });
    }
    
    updateBillDisplay();
    
    // Add visual feedback
    const btn = event.target.closest('.product-card');
    if (btn) {
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btn.style.transform = '';
        }, 200);
    }
    
    // Show success toast
    showToast(`${name} added to bill!`);
}

function updateBillDisplay() {
    const billItemsContainer = document.getElementById('billItems');
    
    if (billItems.length === 0) {
        billItemsContainer.innerHTML = `
            <div class="empty-state">
                <i data-lucide="shopping-bag"></i>
                <p>Add products to start billing</p>
            </div>
        `;
        lucide.createIcons();
        document.getElementById('subtotal').textContent = '₹0';
        document.getElementById('gst').textContent = '₹0';
        document.getElementById('total').textContent = '₹0';
        return;
    }
    
    billItemsContainer.innerHTML = billItems.map((item, index) => `
        <div class="bill-item" style="animation: slideIn 0.3s ease ${index * 0.05}s both;">
            <div class="bill-item-info">
                <div class="bill-item-name">${item.name}</div>
                <div class="bill-item-qty">Qty: ${item.quantity} × ₹${item.price}</div>
            </div>
            <div class="bill-item-price">₹${item.total}</div>
        </div>
    `).join('');
    
    const subtotal = billItems.reduce((sum, item) => sum + item.total, 0);
    const gst = Math.round(subtotal * 0.05);
    const total = subtotal + gst;
    
    animateValue('subtotal', parseInt(document.getElementById('subtotal').textContent.replace('₹', '')) || 0, subtotal, 300);
    animateValue('gst', parseInt(document.getElementById('gst').textContent.replace('₹', '')) || 0, gst, 300);
    animateValue('total', parseInt(document.getElementById('total').textContent.replace('₹', '')) || 0, total, 300);
}

function animateValue(id, start, end, duration) {
    const element = document.getElementById(id);
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = '₹' + Math.round(current);
    }, 16);
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <i data-lucide="check-circle"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    lucide.createIcons();
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 2000);
}

function clearBill() {
    billItems = [];
    updateBillDisplay();
}

function completeBilling() {
    if (billItems.length === 0) {
        alert('Please add items to the bill first!');
        return;
    }
    
    document.getElementById('successModal').classList.add('open');
    
    // Clear bill after 2 seconds
    setTimeout(() => {
        clearBill();
    }, 2000);
}

function closeModal() {
    document.getElementById('successModal').classList.remove('open');
}

// Voice Assistant
let isListening = false;

function toggleVoice() {
    isListening = !isListening;
    const voiceCircle = document.getElementById('voiceCircle');
    const voiceBtn = document.getElementById('voiceBtn');
    const voiceStatus = document.getElementById('voiceStatus');
    
    if (isListening) {
        voiceCircle.classList.add('active');
        voiceBtn.innerHTML = '<i data-lucide="mic-off"></i> Stop Listening';
        voiceStatus.innerHTML = '<h3>Listening...</h3><p>Speak now in your preferred language</p>';
        
        // Simulate voice recognition after 2 seconds
        setTimeout(() => {
            simulateVoiceCommand('demo');
        }, 2000);
    } else {
        voiceCircle.classList.remove('active');
        voiceBtn.innerHTML = '<i data-lucide="mic"></i> Start Listening';
        voiceStatus.innerHTML = '<h3>Tap to speak</h3><p>Try: "Maggi ka stock kitna hai?" or "Today\'s sales batao"</p>';
    }
    
    lucide.createIcons();
}

function simulateVoiceCommand(type) {
    const voiceStatus = document.getElementById('voiceStatus');
    const responses = {
        stock: {
            command: '"Maggi ka stock kitna hai?"',
            response: 'Maggi Noodles: 45 units in stock. Good stock level.'
        },
        sales: {
            command: '"Today\'s total sales batao"',
            response: 'Today\'s total sales: ₹45,280. Up 12.5% from yesterday.'
        },
        customer: {
            command: '"Ravi ko ₹200 udhar de do"',
            response: 'Credit of ₹200 added to Ravi Kumar\'s account. Total due: ₹1,200.'
        },
        bill: {
            command: '"₹500 ka bill banao"',
            response: 'Bill created for ₹500. Ready to print.'
        },
        demo: {
            command: 'Voice command detected',
            response: 'Processing your request...'
        }
    };
    
    const response = responses[type] || responses.demo;
    
    voiceStatus.innerHTML = `
        <h3>You said: ${response.command}</h3>
        <p style="color: #10b981; font-weight: 600; margin-top: 16px;">✓ ${response.response}</p>
    `;
    
    // Reset after 3 seconds
    setTimeout(() => {
        if (isListening) {
            voiceStatus.innerHTML = '<h3>Listening...</h3><p>Speak now in your preferred language</p>';
        }
    }, 3000);
}

// Inventory Search
document.getElementById('inventorySearch')?.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#inventoryTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
});

// Initialize charts when page loads
window.addEventListener('load', () => {
    initCharts();
    lucide.createIcons();
});

// Language selector
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// Payment method selector
document.querySelectorAll('.payment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.payment-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Filter logic would go here
        const filter = btn.textContent.toLowerCase();
        console.log('Filtering by:', filter);
    });
});

// Close modal on outside click
document.getElementById('successModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'successModal') {
        closeModal();
    }
});

// Close notification panel on outside click
document.addEventListener('click', (e) => {
    const panel = document.getElementById('notificationPanel');
    const btn = document.getElementById('notificationBtn');
    
    if (!panel.contains(e.target) && !btn.contains(e.target)) {
        panel.classList.remove('open');
    }
});