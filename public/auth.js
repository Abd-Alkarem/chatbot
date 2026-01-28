const tabBtns = document.querySelectorAll('.tab-btn');
const signinForm = document.getElementById('signinForm');
const signupForm = document.getElementById('signupForm');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        if (tab === 'signin') {
            signinForm.classList.add('active');
            signupForm.classList.remove('active');
        } else {
            signupForm.classList.add('active');
            signinForm.classList.remove('active');
        }
    });
});

signinForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('signinEmail').value;
    const password = document.getElementById('signinPassword').value;
    const errorEl = document.getElementById('signinError');
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('chatToken', data.token);
            localStorage.setItem('chatUser', JSON.stringify(data.user));
            window.location.href = '/';
        } else {
            errorEl.textContent = data.error;
        }
    } catch (error) {
        errorEl.textContent = 'Connection error. Please try again.';
    }
});

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const errorEl = document.getElementById('signupError');
    
    if (password.length < 6) {
        errorEl.textContent = 'Password must be at least 6 characters';
        return;
    }
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('chatToken', data.token);
            
            const userResponse = await fetch(`/api/user/${data.userId}`);
            const userData = await userResponse.json();
            
            if (userData.success) {
                localStorage.setItem('chatUser', JSON.stringify(userData.user));
                window.location.href = '/';
            }
        } else {
            errorEl.textContent = data.error;
        }
    } catch (error) {
        errorEl.textContent = 'Connection error. Please try again.';
    }
});

if (localStorage.getItem('chatToken')) {
    window.location.href = '/';
}
