/**
 * BigBrainZain.com | ZainHub V2
 * Frontend Logic
 */

// --- 1. Supabase Initialization (Static Frontend) ---
// Using the details from the user's uploaded dashboard images.
// NOTE: Due to the anon key being truncated in the screenshot UI, you MUST paste the FULL anon key below!
const SUPABASE_URL = 'https://qtgbicdcysmrikoqksoa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0Z2JpY2RjeXNtcmlrb3Frc29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMzY5NTEsImV4cCI6MjEwMzcxMjk1MX0.fvsRFougiu-CukXPmJwlPK5gTSlF4sYI-b7WFYu1lCE'; // <--- PASTE FULL ANON KEY HERE

let supabase;
try {
    // window.supabase is provided by the CDN script in index.html
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (e) {
    console.warn("Supabase client initialization failed. Operating in demo mode.");
}

// --- State ---
let currentUser = null;
let allGamesCache = [];

// --- Mock Data (Fallback & Discovery) ---
const mockGames = [
    { id: 'slope', title: 'Slope', category: 'Action', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80', plays: 124000, embedUrl: 'https://slopegame.io/' },
    { id: 'eaglercraft', title: 'Eaglercraft 1.12.2', category: 'Sandbox', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80', plays: 89000, embedUrl: 'https://eaglercraft.com/mc/1.12.2/' },
    { id: 'retrobowl', title: 'Retro Bowl', category: 'Sports', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80', plays: 156000, embedUrl: 'https://game316009.konggames.com/gamez/0031/6009/live/index.html' },
    { id: 'sprunki', title: 'Sprunki', category: 'Music', image: 'https://images.unsplash.com/photo-1580234811497-9df7f5c45666?w=600&q=80', plays: 54000, embedUrl: 'https://sprunki.com/' },
    { id: 5, title: 'Void Shooter', category: 'Action', image: 'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=600&q=80', plays: 21000, embedUrl: 'about:blank' },
    { id: 6, title: 'Mind Maze', category: 'Puzzle', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&q=80', plays: 3200, embedUrl: 'about:blank' },
    { id: 7, title: 'Asteroid Miner', category: 'Simulation', image: 'https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?w=600&q=80', plays: 18500, embedUrl: 'about:blank' },
    { id: 8, title: 'Quantum Chess', category: 'Strategy', image: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=600&q=80', plays: 7100, embedUrl: 'about:blank' },
    { id: 9, title: 'Stellar Run', category: 'Action', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80', plays: 45000, embedUrl: 'about:blank' },
    { id: 10, title: 'Neon Tetris', category: 'Puzzle', image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600&q=80', plays: 11200, embedUrl: 'about:blank' },
];

// --- DOM Elements ---
const DOM = {
    loginBtn: document.getElementById('login-btn'),
    userProfile: document.getElementById('user-profile'),
    userEmailSpan: document.getElementById('user-email'),
    avatarImg: document.getElementById('avatar-img'),
    logoutBtn: document.getElementById('logout-btn'),
    authModal: document.getElementById('auth-modal'),
    closeModal: document.getElementById('close-modal'),
    loginView: document.getElementById('login-view'),
    profileView: document.getElementById('profile-view'),
    authForm: document.getElementById('auth-form'),
    profileForm: document.getElementById('profile-form'),
    authMsg: document.getElementById('auth-msg'),
    panicScreen: document.getElementById('panic-screen'),
    appContainer: document.getElementById('app-container'),
    searchInput: document.getElementById('search-input'),
    sectionSearchResults: document.getElementById('section-search-results'),
    searchResults: document.getElementById('search-results'),
    heroSection: document.getElementById('hero-section'),
    avatarUpload: document.getElementById('avatar-upload'),
    profilePreview: document.getElementById('profile-preview'),
    profileUsername: document.getElementById('profile-username'),
    sectionRecentlyPlayed: document.getElementById('section-recently-played')
};

// Global mouse tracking for interactivity
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// --- Initialization & Smooth Page Load ---
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Fade in app body (Buttery smooth transition)
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        document.body.style.opacity = '1';
    }, 100);

    // 2. Start Advanced Particle Engine
    initParticles();
    
    // Cache games for search
    allGamesCache = [...mockGames];

    // 3. Check Session Status (ZainHub Account)
    if (supabase) {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                updateUIForUser(session.user);
            } else {
                DOM.sectionRecentlyPlayed.style.display = 'none';
            }
        } catch(e) {
            console.warn("Supabase auth check failed.");
            DOM.sectionRecentlyPlayed.style.display = 'none';
        }
    } else {
        DOM.sectionRecentlyPlayed.style.display = 'none';
    }

    // 4. Render Game Grids (Recently Played, Trending, Discover)
    await renderAllGameRows();
    
    // 5. Initialize Hero Logo 3D Tilt
    initHeroLogoTilt();
});

// --- Search Functionality ---
DOM.searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (query.length > 0) {
        DOM.heroSection.classList.add('hidden');
        DOM.sectionSearchResults.classList.remove('hidden');
        const results = allGamesCache.filter(g => 
            g.title.toLowerCase().includes(query) || 
            g.category.toLowerCase().includes(query)
        );
        renderGameCards(results, 'search-results');
    } else {
        DOM.heroSection.classList.remove('hidden');
        DOM.sectionSearchResults.classList.add('hidden');
    }
});

// --- Auth & Profile Event Listeners ---
DOM.loginBtn.addEventListener('click', () => {
    DOM.loginView.classList.remove('hidden');
    DOM.profileView.classList.add('hidden');
    DOM.authModal.classList.remove('hidden');
});

DOM.userProfile.addEventListener('click', () => {
    // Open modal in Profile Edit mode
    DOM.loginView.classList.add('hidden');
    DOM.profileView.classList.remove('hidden');
    DOM.authModal.classList.remove('hidden');
    
    // Pre-fill data
    if (currentUser && currentUser.user_metadata) {
        if (currentUser.user_metadata.username) {
            DOM.profileUsername.value = currentUser.user_metadata.username;
        } else {
            DOM.profileUsername.value = currentUser.email.split('@')[0];
        }
        if (currentUser.user_metadata.avatar_url) {
            DOM.profilePreview.src = currentUser.user_metadata.avatar_url;
        }
    }
});

DOM.closeModal.addEventListener('click', () => {
    DOM.authModal.classList.add('hidden');
    DOM.authMsg.innerText = '';
});

// Image Upload & Compression (to save as Base64 in user_metadata)
let currentAvatarBase64 = null;
DOM.avatarUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
            // Compress image to a small avatar size
            const canvas = document.createElement('canvas');
            const MAX_SIZE = 150;
            let width = img.width;
            let height = img.height;
            if (width > height) {
                if (width > MAX_SIZE) {
                    height *= MAX_SIZE / width;
                    width = MAX_SIZE;
                }
            } else {
                if (height > MAX_SIZE) {
                    width *= MAX_SIZE / height;
                    height = MAX_SIZE;
                }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            currentAvatarBase64 = canvas.toDataURL('image/jpeg', 0.8);
            DOM.profilePreview.src = currentAvatarBase64;
        };
    };
});

DOM.profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    
    const newUsername = DOM.profileUsername.value.trim();
    
    try {
        if (!supabase) throw new Error("Supabase not connected. Operating in local mode.");
        
        const updates = { username: newUsername };
        if (currentAvatarBase64) {
            updates.avatar_url = currentAvatarBase64;
        }
        
        const { data, error } = await supabase.auth.updateUser({
            data: updates
        });
        
        if (error) throw error;
        
        updateUIForUser(data.user);
        DOM.authMsg.style.color = 'var(--accent)';
        DOM.authMsg.innerText = "Profile updated successfully!";
        setTimeout(() => DOM.authModal.classList.add('hidden'), 1000);
        
    } catch (err) {
        console.warn(err);
        // Local fallback Demo Mode
        currentUser.user_metadata = currentUser.user_metadata || {};
        currentUser.user_metadata.username = newUsername;
        if (currentAvatarBase64) currentUser.user_metadata.avatar_url = currentAvatarBase64;
        updateUIForUser(currentUser);
        DOM.authModal.classList.add('hidden');
    } finally {
        btn.innerHTML = originalText;
    }
});


DOM.authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const submitBtn = DOM.authForm.querySelector('button');
    
    // Micro-interaction loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';
    submitBtn.style.pointerEvents = 'none';
    
    try {
        if (!supabase || SUPABASE_KEY.includes('PASTE FULL ANON KEY HERE')) {
            throw new Error("Supabase client not fully initialized.");
        }
        
        // 1. Attempt Sign In
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
            // 2. If invalid credentials, attempt seamless Sign Up
            if (error.message.includes('Invalid login credentials')) {
                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
                if (signUpError) throw signUpError;
                
                if (signUpData.user && signUpData.session) {
                    updateUIForUser(signUpData.user);
                    DOM.authModal.classList.add('hidden');
                } else {
                    DOM.authMsg.style.color = 'var(--text-main)';
                    DOM.authMsg.innerText = "Check your email to confirm ZainHub registration.";
                }
            } else {
                throw error;
            }
        } else {
            // Success Sign In
            updateUIForUser(data.user);
            DOM.authModal.classList.add('hidden');
        }
    } catch (error) {
        // Fallback Demo Mode if keys are not set up
        console.warn("Auth process intercepted:", error.message);
        DOM.authMsg.style.color = 'var(--accent)';
        DOM.authMsg.innerHTML = "<i class='fa-solid fa-bolt'></i> Demo Mode: Logging in as Zain...";
        setTimeout(() => {
            updateUIForUser({ email: email, user_metadata: { username: "BigBrainZain" } });
            DOM.authModal.classList.add('hidden');
        }, 1200);
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.style.pointerEvents = 'auto';
    }
});

DOM.logoutBtn.addEventListener('click', async () => {
    if (supabase) {
        try { await supabase.auth.signOut(); } catch(e) {}
    }
    currentUser = null;
    DOM.loginBtn.classList.remove('hidden');
    DOM.userProfile.classList.add('hidden');
    DOM.logoutBtn.classList.add('hidden');
    DOM.sectionRecentlyPlayed.style.display = 'none';
    DOM.authMsg.innerText = '';
});

function updateUIForUser(user) {
    currentUser = user;
    DOM.loginBtn.classList.add('hidden');
    DOM.userProfile.classList.remove('hidden');
    DOM.logoutBtn.classList.remove('hidden');
    
    const meta = user.user_metadata || {};
    DOM.userEmailSpan.innerText = meta.username || user.email.split('@')[0];
    
    if (meta.avatar_url) {
        DOM.avatarImg.src = meta.avatar_url;
    }
    
    DOM.sectionRecentlyPlayed.style.display = 'block';
    
    // Refresh to load "Recently Played"
    renderGameRow('recently-played', 'Recently Played');
}

// --- Data Fetching & Rendering Engine ---
async function fetchGames(category) {
    try {
        if (!supabase || SUPABASE_KEY.includes('PASTE')) throw new Error("No DB");
        
        let query = supabase.from('games').select('*');
        if (category === 'Trending') {
            query = query.order('plays', { ascending: false }).limit(10);
        } else if (category === 'Recently Played' && currentUser) {
            // In a real app, query a 'play_history' table.
            query = query.limit(6); 
        } else if (category === 'Discover') {
            // Random sample
            query = query.limit(10);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        if (data && data.length > 0) return data;
        throw new Error("No data returned");
    } catch(e) {
        // --- Smart Mock Data Fallback ---
        if (category === 'Trending') {
            return [...mockGames].sort((a,b) => b.plays - a.plays).slice(0, 10);
        } else if (category === 'Recently Played') {
            return currentUser ? [mockGames[0], mockGames[2], mockGames[5], mockGames[7], mockGames[1], mockGames[3]] : [];
        } else if (category === 'Discover') {
            // Shuffle
            return [...mockGames].sort(() => 0.5 - Math.random());
        } else {
            return mockGames.filter(g => g.category === category);
        }
    }
}

async function renderGameRow(containerId, categoryName) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '<div style="padding: 20px; color: var(--accent);"><i class="fa-solid fa-spinner fa-spin"></i> Loading metadata...</div>';
    
    const games = await fetchGames(categoryName);
    renderGameCards(games, containerId);
}

function renderGameCards(games, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    if (games.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); padding-left: 10px;">No games found.</p>';
        return;
    }

    games.forEach((game, index) => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.style.backgroundImage = `url('${game.image}')`;
        // Staggered entrance animation
        card.style.animation = `fadeSlideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${index * 0.1}s forwards`;
        card.style.opacity = '0'; 
        
        card.innerHTML = `
            <div class="game-info">
                <h3>${game.title}</h3>
                <p><i class="fa-solid fa-gamepad"></i> ${game.category} &nbsp;•&nbsp; <i class="fa-solid fa-fire"></i> ${game.plays.toLocaleString()}</p>
            </div>
        `;
        
        // --- Advanced Magnetic 3D Tilt Interaction (Lag-Free) ---
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            
            // Calculate cursor position relative to the center of the card
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Set CSS variables for the pseudo-element glare effect
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
            
            // Calculate rotation
            const rotateX = ((y - centerY) / centerY) * -12; 
            const rotateY = ((x - centerX) / centerX) * 12;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
            card.style.zIndex = '20';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            card.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.6s ease';
            card.style.zIndex = '1';
        });
        
        card.addEventListener('mouseenter', () => {
            // Remove transition for instant cursor tracking once hovered
            card.style.transition = 'transform 0.1s ease-out';
        });
        
        card.addEventListener('click', () => {
            window.location.href = `play.html?game=${game.id}`;
        });
        
        container.appendChild(card);
    });
}

async function renderAllGameRows() {
    await Promise.all([
        renderGameRow('trending-games', 'Trending'),
        renderGameRow('action-games', 'Action'),
        renderGameRow('discover-games', 'Discover')
    ]);
}

// --- Hero Logo 3D Tilt Logic ---
function initHeroLogoTilt() {
    const heroLogo = document.getElementById('main-hero-logo');
    if (!heroLogo) return;
    
    heroLogo.addEventListener('mousemove', (e) => {
        const rect = heroLogo.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -20; 
        const rotateY = ((x - centerX) / centerX) * 20;
        
        heroLogo.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.08, 1.08, 1.08)`;
    });
    
    heroLogo.addEventListener('mouseleave', () => {
        heroLogo.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        heroLogo.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1), filter 0.4s ease';
    });
    
    heroLogo.addEventListener('mouseenter', () => {
        heroLogo.style.transition = 'transform 0.1s ease-out, filter 0.4s ease';
    });
}

// Inject CSS animation for staggered card load
const style = document.createElement('style');
style.innerHTML = `
@keyframes fadeSlideIn {
    0% { opacity: 0; transform: translateY(30px); }
    100% { opacity: 1; transform: translateY(0); }
}
`;
document.head.appendChild(style);


// --- Stealth Panic Button ---
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        DOM.panicScreen.classList.toggle('hidden');
        if (!DOM.panicScreen.classList.contains('hidden')) {
            DOM.appContainer.style.display = 'none';
            document.title = "Classes"; // Sneaky title change
        } else {
            DOM.appContainer.style.display = 'flex';
            document.title = "BigBrainZain.com | ZainHub V2";
        }
    }
});


// --- Super Interactive Cosmic Particle Engine ---
function initParticles() {
    const canvas = document.getElementById('stars-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    
    const particles = [];
    let particleCount = 75; // Moved definition up here
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2;
            this.baseSpeedX = (Math.random() - 0.5) * 0.5;
            this.baseSpeedY = (Math.random() - 0.5) * 0.5;
            this.speedX = this.baseSpeedX;
            this.speedY = this.baseSpeedY;
            this.baseOpacity = Math.random() * 0.5 + 0.1;
            this.pulseRate = Math.random() * 0.02 + 0.01;
            this.angle = Math.random() * Math.PI * 2;
        }
        update() {
            // Interactive attract/repel to mouse
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If mouse is close, attract particles gently
            if (distance < 200) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (200 - distance) / 200; // 0 to 1
                
                this.speedX += forceDirectionX * force * 0.05;
                this.speedY += forceDirectionY * force * 0.05;
                
                // Glow brighter when near cursor
                this.opacity = Math.min(1, this.baseOpacity + force);
            } else {
                // Return to base speed
                this.speedX += (this.baseSpeedX - this.speedX) * 0.05;
                this.speedY += (this.baseSpeedY - this.speedY) * 0.05;
                this.opacity = this.baseOpacity + Math.sin(this.angle) * 0.2;
            }
            
            // Add slight damping
            this.speedX *= 0.98;
            this.speedY *= 0.98;
            
            this.x += this.speedX;
            this.y += this.speedY;
            
            this.angle += this.pulseRate;
            
            // Screen wrap
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;
        }
        draw() {
            ctx.fillStyle = `rgba(124, 234, 255, ${Math.max(0, this.opacity)})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }
    
    animate();
}
