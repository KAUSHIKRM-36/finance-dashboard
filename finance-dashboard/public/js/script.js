// ========================================
// Modal Functions
// ========================================

let currentRecordId = null;

function showCreateForm() {
    currentRecordId = null;
    document.getElementById('modalTitle').textContent = 'Create Record';
    document.getElementById('recordForm').reset();
    document.getElementById('recordModal').style.display = 'block';
}

function editRecord(recordId) {
    currentRecordId = recordId;
    document.getElementById('modalTitle').textContent = 'Edit Record';

    // Fetch record details
    fetch(`/records/${recordId}`)
        .then(response => response.json())
        .then(record => {
            document.getElementById('amount').value = record.amount;
            document.getElementById('recordType').value = record.type;
            document.getElementById('recordType').dispatchEvent(new Event('change'));
            document.getElementById('recordCategory').value = record.category;
            document.getElementById('recordDate').value = record.date;
            document.getElementById('recordDescription').value = record.description || '';
            document.getElementById('recordModal').style.display = 'block';
        })
        .catch(error => alert('Error loading record: ' + error.message));
}

function closeModal() {
    document.getElementById('recordModal').style.display = 'none';
    document.getElementById('recordForm').reset();
    currentRecordId = null;
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('recordModal');
    const roleModal = document.getElementById('roleModal');

    if (event.target === modal) {
        modal.style.display = 'none';
    }
    if (event.target === roleModal) {
        roleModal.style.display = 'none';
    }
}

// ========================================
// Record Form Submission
// ========================================

async function submitRecord(event) {
    event.preventDefault();

    const formData = {
        amount: document.getElementById('amount').value,
        type: document.getElementById('recordType').value,
        category: document.getElementById('recordCategory').value,
        date: document.getElementById('recordDate').value,
        description: document.getElementById('recordDescription').value
    };

    // Validation
    if (!formData.amount || isNaN(formData.amount) || formData.amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    if (!formData.type) {
        alert('Please select a type');
        return;
    }

    if (!formData.category) {
        alert('Please enter a category');
        return;
    }

    if (!formData.date) {
        alert('Please select a date');
        return;
    }

    try {
        const method = currentRecordId ? 'PUT' : 'POST';
        const url = currentRecordId ? `/records/${currentRecordId}` : '/records';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert(currentRecordId ? 'Record updated successfully!' : 'Record created successfully!');
            location.reload();
        } else {
            const data = await response.json();
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// ========================================
// Record Delete
// ========================================

function deleteRecord(recordId) {
    const confirmed = confirm('Are you sure you want to delete this record? This action cannot be undone.');

    if (!confirmed) return;

    fetch(`/records/${recordId}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (response.ok) {
                alert('Record deleted successfully!');
                location.reload();
            } else {
                return response.json().then(data => {
                    throw new Error(data.error);
                });
            }
        })
        .catch(error => alert('Error: ' + error.message));
}

// ========================================
// User Management (Admin)
// ========================================

function showChangeRoleModal(userId, currentRole) {
    document.getElementById('userId').value = userId;
    document.getElementById('newRole').value = currentRole;

    const modal = document.getElementById('roleModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeRoleModal() {
    const modal = document.getElementById('roleModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function submitRoleChange(event) {
    event.preventDefault();
    const userId = document.getElementById('userId').value;
    const newRole = document.getElementById('newRole').value;

    try {
        const response = await fetch(`/users/${userId}/role`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole })
        });

        if (response.ok) {
            alert('Role updated successfully!');
            location.reload();
        } else {
            const data = await response.json();
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function toggleUserStatus(userId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const confirmed = confirm(`Are you sure you want to ${newStatus} this user?`);

    if (!confirmed) return;

    try {
        const response = await fetch(`/users/${userId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            alert('User status updated!');
            location.reload();
        } else {
            const data = await response.json();
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

function deleteUserConfirm(userId, username) {
    const confirmed = confirm(
        `Are you sure you want to delete user "${username}"? This will also delete all their financial records. This action cannot be undone.`
    );

    if (confirmed) {
        deleteUser(userId);
    }
}

async function deleteUser(userId) {
    try {
        const response = await fetch(`/users/${userId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('User deleted successfully!');
            location.reload();
        } else {
            const data = await response.json();
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// ========================================
// Utility Functions
// ========================================

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

// Format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN');
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.maxWidth = '400px';

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// ========================================
// Event Listeners
// ========================================

document.addEventListener('DOMContentLoaded', function () {
    // Close modals on escape key
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            const modal = document.getElementById('recordModal');
            const roleModal = document.getElementById('roleModal');

            if (modal && modal.style.display === 'block') {
                modal.style.display = 'none';
            }
            if (roleModal && roleModal.style.display === 'block') {
                roleModal.style.display = 'none';
            }
        }
    });
});