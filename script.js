// --- Sticky Navbar ---
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// --- Scroll Reveal Animation ---
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
        }
    });
}, observerOptions);

// Target elements to animate
const sections = document.querySelectorAll(
    '.section-title, .about-text, .stat-item, .skill-category, .timeline-item, .project-card, .edu-card'
);

sections.forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "all 0.6s ease-out";
    observer.observe(el);
});
// --- 3D Background using Three.js ---
const canvas = document.getElementById('bgCanvas');
// Create renderer using existing canvas so HTML/CSS layering stays intact
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 40;

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);
scene.add(new THREE.AmbientLight(0x404040, 0.5));

// === Cybersecurity Scene ===
// Floating padlocks connected by glowing lines + central shield
const LOCK_COUNT = Math.max(24, Math.min(80, Math.floor(window.innerWidth * window.innerHeight / 90000)));
const locks = [];
const lockBodyMat = new THREE.MeshStandardMaterial({ color: 0x2b9cff, emissive: 0x08293b, metalness: 0.5, roughness: 0.25 });
const shackleMat = new THREE.MeshStandardMaterial({ color: 0xcfd8ff, metalness: 1.0, roughness: 0.15 });

function createLock(){
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.2, 1.2), lockBodyMat);
    body.position.set(0, -0.6, 0);
    g.add(body);
    const shackle = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.18, 12, 40), shackleMat);
    shackle.rotation.x = Math.PI / 2;
    shackle.position.set(0, 0.55, 0);
    g.add(shackle);
    return g;
}

for(let i=0;i<LOCK_COUNT;i++){
    const l = createLock();
    l.position.set((Math.random()-0.5)*120, (Math.random()-0.5)*70, (Math.random()-0.5)*100);
    l.scale.setScalar(0.9 + Math.random()*1.1);
    scene.add(l);
    locks.push({ obj: l, vel: new THREE.Vector3((Math.random()-0.5)*0.03, (Math.random()-0.5)*0.03, (Math.random()-0.5)*0.03) });
}

// glowing connections material
let connectionLines = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x3aa6ff, transparent: true, opacity: 0.12 }));
scene.add(connectionLines);

// central shield behind locks
const shieldGeo = new THREE.RingGeometry(6, 10, 64);
const shieldMat = new THREE.MeshStandardMaterial({ color: 0x072b45, emissive: 0x0a3b57, metalness: 0.1, roughness: 0.6, side: THREE.DoubleSide });
const shield = new THREE.Mesh(shieldGeo, shieldMat);
shield.rotation.x = Math.PI/4;
shield.position.set(0, 0, -30);
scene.add(shield);

const shieldAccent = new THREE.PointLight(0x3aa6ff, 0.6, 100);
shieldAccent.position.set(0, 2, -20);
scene.add(shieldAccent);

function resizeThree() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', resizeThree);

// subtle parallax with mouse
let mouseX = 0, mouseY = 0;
window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
});

function threeAnimate() {
    // update locks positions
    for(let i=0;i<locks.length;i++){
        const item = locks[i];
        item.obj.position.add(item.vel);
        // bounds
        if(item.obj.position.x > 90 || item.obj.position.x < -90) item.vel.x *= -1;
        if(item.obj.position.y > 60 || item.obj.position.y < -60) item.vel.y *= -1;
        if(item.obj.position.z > 120 || item.obj.position.z < -120) item.vel.z *= -1;
        // tiny rotation
        item.obj.rotation.y += 0.002 + (i%5)*0.0004;
    }

    // rebuild connections between nearby locks to create secure mesh
    const maxDist = 28 * (window.innerWidth < 600 ? 0.6 : 1);
    const segments = [];
    for(let i=0;i<locks.length;i++){
        for(let j=i+1;j<locks.length;j++){
            const a = locks[i].obj.position;
            const b = locks[j].obj.position;
            const d = a.distanceTo(b);
            if(d < maxDist){
                segments.push(a.x, a.y, a.z, b.x, b.y, b.z);
            }
        }
    }
    const positions = new Float32Array(segments);
    connectionLines.geometry.dispose();
    connectionLines.geometry = new THREE.BufferGeometry();
    connectionLines.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // pulse shield light subtly
    shieldAccent.intensity = 0.45 + Math.abs(Math.sin(Date.now()*0.0018))*0.35;
    shield.rotation.z += 0.0008;

    // camera subtle move (parallax)
    camera.position.x += (mouseX * 5 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 3 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    requestAnimationFrame(threeAnimate);
}
threeAnimate();

// ===== MOBILE MENU LOGIC =====
const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");

if(hamburger){
    hamburger.addEventListener("click", () => {
        navLinks.classList.toggle("mobile-open");
    });
}

// Close menu when a link is clicked
document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("mobile-open");
    });
});

// --- 3D Card Interaction (tilt + pop) ---
function init3DCards(){
    const cards = document.querySelectorAll('.project-card, .edu-card, .timeline-item, .stat-item');
    cards.forEach(card => {
        card.classList.add('card-3d');
        const content = card.querySelector('.card-content') || card.querySelector('.edu-content') || card.querySelector('.timeline-content') || card;
        if(content) content.classList.add('card-content');

        let rect = null;
        card.addEventListener('mousemove', (e) => {
            rect = rect || card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            const dx = (x - cx) / cx;
            const dy = (y - cy) / cy;
            const rotX = (dy * 8).toFixed(2);
            const rotY = (-dx * 8).toFixed(2);
            card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
            if(content) content.style.transform = 'translateZ(30px)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            if(content) content.style.transform = '';
        });
    });
}
init3DCards();

// --- Video modal logic for project cards ---
const videoModal = document.getElementById('videoModal');
const modalMedia = videoModal ? videoModal.querySelector('.video-modal__media') : null;
const modalClose = videoModal ? videoModal.querySelector('.video-modal__close') : null;

function convertYouTubeToEmbed(url){
    try{
        let id = null;
        if(url.includes('youtu.be')){
            id = url.split('/').pop();
        } else {
            const params = new URL(url).searchParams;
            id = params.get('v');
        }
        if(!id) return url;
        return `https://www.youtube.com/embed/${id}?autoplay=1`;
    } catch(e){ return url; }
}

document.querySelectorAll('.project-card').forEach(card => {
    const src = card.getAttribute('data-video');
    if(!src) return;
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => openVideoModal(src));
});

function openVideoModal(src){
    if(!videoModal || !modalMedia) return;
    modalMedia.innerHTML = '';
    if(src.includes('youtube') || src.includes('youtu.be')){
        const iframe = document.createElement('iframe');
        iframe.src = src.includes('embed') ? src : convertYouTubeToEmbed(src);
        iframe.setAttribute('frameborder','0');
        iframe.setAttribute('allow','accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        iframe.setAttribute('allowfullscreen','');
        modalMedia.appendChild(iframe);
    } else {
        const video = document.createElement('video');
        video.src = src;
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        modalMedia.appendChild(video);
        // ensure play attempt (some browsers block autoplay without interaction)
        const p = video.play();
        if(p && p.then) p.catch(() => {});
    }
    videoModal.classList.add('open');
    videoModal.setAttribute('aria-hidden','false');
}

function closeVideoModal(){
    if(!videoModal || !modalMedia) return;
    const v = modalMedia.querySelector('video');
    if(v){ try{ v.pause(); } catch(e){} }
    modalMedia.innerHTML = '';
    videoModal.classList.remove('open');
    videoModal.setAttribute('aria-hidden','true');
}

if(modalClose) modalClose.addEventListener('click', closeVideoModal);
if(videoModal) videoModal.addEventListener('click', (e) => { if(e.target === videoModal) closeVideoModal(); });

// --- Assistant widget logic ---
const assistantWidget = document.getElementById('assistantWidget');
const assistantButton = assistantWidget?.querySelector('.assistant-widget__button');
const assistantWindow = assistantWidget?.querySelector('.assistant-widget__window');
const assistantOverlay = assistantWidget?.querySelector('.assistant-widget__overlay');
const assistantClose = assistantWidget?.querySelector('.assistant-widget__close');
const assistantBody = assistantWidget?.querySelector('.assistant-widget__body');
const assistantChat = document.getElementById('assistantChat');
const assistantInput = document.getElementById('assistantInput');
const assistantSend = document.getElementById('assistantSend');

function setAssistantOpen(open) {
    if(!assistantWidget || !assistantWindow || !assistantOverlay) return;
    assistantWidget.classList.toggle('open', open);
    assistantWindow.setAttribute('aria-hidden', String(!open));
    assistantOverlay.setAttribute('aria-hidden', String(!open));
    if(open) {
        assistantInput?.focus();
        void loadAssistantKnowledgeBase();
        if(assistantChat && assistantChat.children.length === 0) {
            addAssistantMessage("Hello! I'm Rocky, KK's assistant. Ask me anything about Koushik.", 'bot');
        }
    }
}

function addAssistantMessage(text, type = 'bot') {
    if(!assistantChat) return;
    const message = document.createElement('div');
    message.className = `assistant-message assistant-message--${type}`;
    message.textContent = text;
    assistantChat.appendChild(message);
    // Scroll the body container to the bottom
    if(assistantBody) {
        setTimeout(() => {
            assistantBody.scrollTop = assistantBody.scrollHeight;
        }, 0);
    }
    return message;
}

function addTypingIndicator() {
    if(!assistantChat) return null;
    const typing = document.createElement('div');
    typing.className = 'assistant-message assistant-message--typing';
    typing.textContent = 'Rocky is typing';
    assistantChat.appendChild(typing);
    // Scroll the body container to the bottom
    if(assistantBody) {
        setTimeout(() => {
            assistantBody.scrollTop = assistantBody.scrollHeight;
        }, 0);
    }
    return typing;
}

function removeTypingIndicator(element) {
    if(element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
}

function normalizeAssistantQuestion(question) {
    return question
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

const assistantKnowledgeBase = {
    answers: [],
    defaultReply: "I can answer from Koushik's saved portfolio Q&A. Ask about his skills, projects, experience, career, or contact details.",
    loaded: false,
    loadingPromise: null
};

function buildAssistantPatterns(patternList) {
    if (!Array.isArray(patternList)) {
        return [];
    }

    const compiledPatterns = [];
    for (const pattern of patternList) {
        if (typeof pattern !== 'string' || pattern.length === 0) {
            continue;
        }

        try {
            compiledPatterns.push(new RegExp(pattern));
        } catch (_error) {
            continue;
        }
    }

    return compiledPatterns;
}

function applyAssistantKnowledgeData(data) {
    if (!data || typeof data !== 'object') {
        return false;
    }

    if (typeof data.defaultReply === 'string' && data.defaultReply.trim()) {
        assistantKnowledgeBase.defaultReply = data.defaultReply.trim();
    }

    if (!Array.isArray(data.answers)) {
        return false;
    }

    assistantKnowledgeBase.answers = data.answers
        .map((entry) => {
            const reply = typeof entry?.reply === 'string' ? entry.reply.trim() : '';
            const patterns = buildAssistantPatterns(entry?.patterns);
            if (!reply || patterns.length === 0) {
                return null;
            }
            return { reply, patterns };
        })
        .filter(Boolean);

    return assistantKnowledgeBase.answers.length > 0;
}

async function loadAssistantKnowledgeBase() {
    if (assistantKnowledgeBase.loaded) {
        return;
    }

    if (assistantKnowledgeBase.loadingPromise) {
        return assistantKnowledgeBase.loadingPromise;
    }

    assistantKnowledgeBase.loadingPromise = (async () => {
        try {
            const preloadedData = window.ASSISTANT_QA_DATA;
            const protocol = window.location?.protocol || '';
            const isHttpProtocol = protocol === 'http:' || protocol === 'https:';

            if (isHttpProtocol) {
                const response = await fetch('./assistant-qa.json', { cache: 'no-store' });
                if (response.ok) {
                    const data = await response.json();
                    if (applyAssistantKnowledgeData(data)) {
                        return;
                    }
                }
            }

            applyAssistantKnowledgeData(preloadedData);
        } catch (_error) {
            const preloadedData = window.ASSISTANT_QA_DATA;
            if (!applyAssistantKnowledgeData(preloadedData)) {
                assistantKnowledgeBase.answers = [];
            }
        } finally {
            assistantKnowledgeBase.loaded = true;
        }
    })();

    return assistantKnowledgeBase.loadingPromise;
}

function getAssistantResponse(question) {
    const normalizedQuestion = normalizeAssistantQuestion(question);

    for (const answer of assistantKnowledgeBase.answers) {
        if (answer.patterns.some((pattern) => pattern.test(normalizedQuestion))) {
            return answer.reply;
        }
    }

    return assistantKnowledgeBase.defaultReply;
}

async function sendAssistantMessage() {
    if(!assistantInput) return;
    const text = assistantInput.value.trim();
    if(!text) return;
    addAssistantMessage(text, 'user');
    assistantInput.value = '';
    const typingElement = addTypingIndicator();

    await loadAssistantKnowledgeBase();
    const reply = getAssistantResponse(text);
    removeTypingIndicator(typingElement);
    addAssistantMessage(reply, 'bot');
}

assistantButton?.addEventListener('click', () => setAssistantOpen(true));
assistantClose?.addEventListener('click', () => setAssistantOpen(false));
assistantOverlay?.addEventListener('click', () => setAssistantOpen(false));
assistantSend?.addEventListener('click', sendAssistantMessage);
assistantInput?.addEventListener('keydown', (e) => {
    if(e.key === 'Enter') {
        e.preventDefault();
        sendAssistantMessage();
    }
});

// --- About stat items navigation handlers ---
(function handleStatNavigation(){
    const statButtons = document.querySelectorAll('.about-stats .stat-item[role="button"]');
    if(!statButtons || statButtons.length === 0) return;
    statButtons.forEach(item => {
        item.addEventListener('click', (e) => {
            const target = item.getAttribute('data-target');
            if(!target) return;
            // close mobile nav if open
            if(navLinks) navLinks.classList.remove('mobile-open');
            const el = document.querySelector(target);
            if(!el) return;
            const navHeight = navbar ? navbar.offsetHeight : 80;
            const top = el.getBoundingClientRect().top + window.pageYOffset - navHeight - 18;
            window.scrollTo({ top, behavior: 'smooth' });
        });
        item.addEventListener('keydown', (e) => {
            if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.click(); }
        });
    });
})();
