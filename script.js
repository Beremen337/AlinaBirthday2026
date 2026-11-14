/* ============================================
   НАСТРОЙКИ
   ============================================ */
const CONFIG = {
    totalDays: 7,
    codes: {
        1: "Привет Алинка Мандаринка",
        2: "Вкусняшка из СССР",
        3: "Баранки топ",
        4: "Аниме Китай крутяк",
        5: "Пакет из под попкорна",
        6: "Научись валять",
        7: "Финальный День Для Алины"
    }
};

/* ============================================
   Состояние
   ============================================ */
const STORAGE_KEY = 'alina_opened_days';
let openedDays = [];

try {
    const raw = localStorage.getItem(STORAGE_KEY);
    openedDays = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(openedDays)) openedDays = [];
} catch (e) {
    openedDays = [];
}

let currentDay = null;

/* ============================================
   Утилиты
   ============================================ */
function normalize(str) {
    return str
        .trim()
        .toLowerCase()
        .replace(/ё/g, 'е')
        .replace(/[.,!?;:—–\-"'«»()]/g, '')
        .replace(/\s+/g, ' ');
}

function saveOpened() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(openedDays));
    } catch (e) {
        /* localStorage может быть недоступен — молча игнорируем */
    }
}

/* ============================================
   Календарь
   ============================================ */
function buildCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';

    for (let i = 1; i <= CONFIG.totalDays; i++) {
        const isOpened = openedDays.includes(i);
        const day = document.createElement('div');
        day.className = 'day ' + (isOpened ? 'opened' : 'available');
        day.setAttribute('role', 'button');
        day.setAttribute('tabindex', '0');
        day.setAttribute('aria-label', `День ${i}`);

        if (isOpened) {
            day.innerHTML = `<div class="gift-icon">🎁</div><div class="day-label">открыто</div>`;
        } else {
            day.innerHTML = `<div class="day-num">${i}</div>`;
        }

        const handleClick = () => {
            if (isOpened) {
                showImage(i);
            } else {
                askCode(i);
            }
        };

        day.addEventListener('click', handleClick);
        day.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick();
            }
        });

        day.addEventListener('mousemove', (e) => {
            const rect = day.getBoundingClientRect();
            day.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width) * 100 + '%');
            day.style.setProperty('--my', ((e.clientY - rect.top) / rect.height) * 100 + '%');
        });

        calendar.appendChild(day);
    }

    updateProgress();
}

function updateProgress() {
    const total = CONFIG.totalDays;
    const count = openedDays.length;
    const pct = (count / total) * 100;

    document.getElementById('progressFill').style.width = pct + '%';

    const text = document.getElementById('progressText');
    if (count === 0) {
        text.textContent = `0 из ${total} открыто`;
    } else if (count === total) {
        text.textContent = `Все ${total} открыто 💖`;
    } else {
        text.textContent = `${count} из ${total} открыто`;
    }
}

/* ============================================
   Ввод кода
   ============================================ */
function askCode(dayNumber) {
    currentDay = dayNumber;
    document.getElementById('code-day-badge').textContent = `День ${dayNumber}`;
    document.getElementById('code-input').value = '';
    document.getElementById('code-error').textContent = '';
    document.getElementById('code-modal').classList.add('active');

    setTimeout(() => {
        document.getElementById('code-input').focus();
    }, 350);
}

function submitCode() {
    const input = document.getElementById('code-input');
    const errorEl = document.getElementById('code-error');
    const answer = normalize(input.value);
    const expected = normalize(CONFIG.codes[currentDay] || '');

    if (!answer) {
        errorEl.textContent = 'Сначала введи слово 🌸';
        return;
    }

    if (answer === expected) {
        const dayToOpen = currentDay;

        if (!openedDays.includes(dayToOpen)) {
            openedDays.push(dayToOpen);
            saveOpened();
        }

        document.getElementById('code-modal').classList.remove('active');
        confettiBurst();

        setTimeout(() => {
            buildCalendar();
            showImage(dayToOpen);
        }, 400);
    } else {
        errorEl.textContent = 'Не то слово 🙈 попробуй ещё раз';
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 500);
        input.select();
    }
}

/* ============================================
   Показ картинки (PNG)
   ============================================ */
function showImage(dayNumber) {
    const img = document.getElementById('modal-image');
    const wrap = img.parentElement;

    img.src = `images/${dayNumber}.png`;
    document.getElementById('image-modal').classList.add('active');

    // Перезапуск анимации появления
    wrap.classList.remove('reveal');
    void wrap.offsetWidth;
    wrap.classList.add('reveal');
}

/* ============================================
   Конфетти
   ============================================ */
function confettiBurst() {
    const colors = ['#ff8fab', '#ffc2d1', '#f4d58d', '#c44dff', '#ffffff'];

    for (let i = 0; i < 60; i++) {
        const c = document.createElement('div');
        c.className = 'confetti';
        c.style.left = '50%';
        c.style.top = '50%';
        c.style.background = colors[Math.floor(Math.random() * colors.length)];
        c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        document.body.appendChild(c);

        const angle = Math.random() * Math.PI * 2;
        const velocity = 200 + Math.random() * 300;
        const dx = Math.cos(angle) * velocity;
        const dy = Math.sin(angle) * velocity;

        const anim = c.animate(
            [
                { transform: 'translate(-50%, -50%) rotate(0deg) scale(1)', opacity: 1 },
                {
                    transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${Math.random() * 720}deg) scale(0.3)`,
                    opacity: 0
                }
            ],
            {
                duration: 1400 + Math.random() * 600,
                easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)',
                fill: 'forwards'
            }
        );

        anim.onfinish = () => c.remove();
    }
}

/* ============================================
   Частицы на фоне
   ============================================ */
function initParticles() {
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');
    const particles = [];
    let w, h;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() {
            this.reset(true);
        }
        reset(init = false) {
            this.x = Math.random() * w;
            this.y = init ? Math.random() * h : h + 10;
            this.size = 1 + Math.random() * 2;
            this.speedY = -(0.15 + Math.random() * 0.4);
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.opacity = 0.15 + Math.random() * 0.4;
            this.hue = Math.random() > 0.5 ? 340 : 45;
        }
        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            if (this.y < -10 || this.x < -10 || this.x > w + 10) this.reset();
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 80%, 75%, ${this.opacity})`;
            ctx.fill();
        }
    }

    const count = Math.min(70, Math.floor(w / 20));
    for (let i = 0; i < count; i++) particles.push(new Particle());

    function loop() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(loop);
    }
    loop();
}

/* ============================================
   Закрытие модалок
   ============================================ */
function closeTopModal() {
    const imageModal = document.getElementById('image-modal');
    const codeModal = document.getElementById('code-modal');

    if (imageModal.classList.contains('active')) {
        imageModal.classList.remove('active');
    } else if (codeModal.classList.contains('active')) {
        codeModal.classList.remove('active');
    }
}

/* ============================================
   Слушатели
   ============================================ */
document.getElementById('code-submit').addEventListener('click', submitCode);

document.getElementById('code-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitCode();
});

document.getElementById('close-code').addEventListener('click', () => {
    document.getElementById('code-modal').classList.remove('active');
});

document.getElementById('close-image').addEventListener('click', () => {
    document.getElementById('image-modal').classList.remove('active');
});

document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeTopModal();
});

/* ============================================
   Старт
   ============================================ */
initParticles();
buildCalendar();
