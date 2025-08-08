// Scroll Progress Bar
function updateScrollProgress() {
    const scrollTop = window.pageYOffset;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    document.querySelector('.scroll-progress').style.width = scrollPercent + '%';
}

// Intersection Observer for fade-in animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

// Observe all sections
document.querySelectorAll('.section').forEach(section => {
    observer.observe(section);
});

// Parallax effect
function parallaxScroll() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.hero::before');

    parallaxElements.forEach(element => {
        const speed = 0.5;
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
}

// Create floating particles
function createParticles() {
    const particles = document.querySelector('.particles');
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particles.appendChild(particle);
    }
}

function playVideo(videoId) {
    const videoContainer = document.querySelector('.video-container');
    const videoPlaceholder = document.querySelector('.video-placeholder');
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    iframe.setAttribute('allowfullscreen', '');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.position = 'absolute';
    iframe.style.top = '0';
    iframe.style.left = '0';
    videoPlaceholder.remove();
    videoContainer.appendChild(iframe);
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// --- SCRIPT PARA EL CARRUSEL DE IMÁGENES ---
document.addEventListener('DOMContentLoaded', () => {
    const slider = document.querySelector('.gallery-slider');
    const slides = document.querySelectorAll('.gallery-slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let currentIndex = 0;
    const slideCount = slides.length > 0 ? slides.length : 1;

    function goToSlide(index) {
        if (index < 0) index = slideCount - 1;
        else if (index >= slideCount) index = 0;
        slider.style.transform = `translateX(-${index * 100}%)`;
        currentIndex = index;
    }
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
        nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
    }

    const gallerySection = document.getElementById('gallery');
    if (gallerySection) observer.observe(gallerySection);
});

window.addEventListener('load', () => {
    createParticles();
    updateScrollProgress();
});

window.addEventListener('scroll', () => {
    updateScrollProgress();
    parallaxScroll();
});

function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.innerHTML = '';
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// ======== TRADUCCIONES (VERSIÓN FINAL) ========
const translations = {
    en: {
        pageTitle: "Living Legacy - Immersive Parenthood Experience",
        metaDescription: "An immersive experience to feel the parenthood that never was, using XR, emotional AI, advanced haptics, and BCI",
        metaKeywords: "extended reality, XR, virtual parenthood, emotional AI, immersive technology",
        heroTitle: "LIVING LEGACY",
        heroSubtitle: "An immersive experience to feel the parenthood that never was.",
        exploreButton: "Explore Vision",
        videoPlaceholderText: "Discover the Future of Human Experience",
        visionTitle: "The Vision",
        visionParagraph1: "For those who couldn't have children, we offer a way to explore what could have been. A multi-sensory simulation from birth to 18 years, where the most advanced technology meets the deepest emotionality.",
        visionParagraph2: "Living Legacy is not just a simulation; it's a bridge to understanding parenthood, human connection, and the meaning of leaving a mark on a life.",
        techTitle: "Revolutionary Technologies",
        techXRTitle: "Extended Reality (XR)",
        techXRDesc: "Immersive environments combining virtual, augmented, and mixed reality to create completely convincing visual and spatial experiences.",
        techHapticTitle: "Emotional Haptics",
        techHapticDesc: "Advanced tactile technology that simulates real physical sensations, from the first hug to the most intimate moments of connection.",
        techBCITitle: "Brain-Computer Interface (BCI)",
        techBCIDesc: "Direct connection between thoughts and experience, allowing authentic and natural emotional responses.",
        techAITitle: "Adaptive Emotional AI",
        techAIDesc: "Artificial intelligence systems that evolve and learn, creating unique personalities and genuine relationships.",
        testimonialQuote: "I've learned that even amidst uncertainty, there's always room for hope. This idea I share with you stems from an intimate truth: the deep longing to experience, even if only in memory and feeling, what life didn't allow me to experience naturally. Being able to approach—even through an idea or a simulation—what it means to be a biological parent, is a powerful possibility. Not just for me, but for so many people who, for various reasons, couldn't experience that in a traditional way. What you are about to see is not just a project; it's a bridge to a universal emotion. Thank you for lending your gaze and sensibility.",
        testimonialCite: "— URCG, Founder",
        galleryTitle: "Conceptual Description",
        gallerySubtitle: "A glimpse into the visual and emotional world of Living Legacy. Use the controls to navigate.",
                faqTitle: "Frequently Asked Questions",
                faqQ1: "What is Living Legacy exactly?",
                faqA1: "Living Legacy is a conceptual project that aims to create an immersive simulation of parenthood for those who could not have children. It uses a combination of XR, emotional AI, haptics, and BCI to create a deeply personal and emotional journey.",
                faqQ2: "Is this a real product?",
                faqA2: "Currently, Living Legacy is a conceptual vision. The technologies involved are on the cutting edge, and this project serves as a north star for what could be possible in the future of human-computer interaction and emotional simulation.",
                faqQ3: "How can I support this vision?",
                faqA3: "You can support the research and development behind this vision by contributing through the donation options below. Every bit of support helps us explore these groundbreaking technologies.",
                faqQ4: "Who is behind this project?",
                faqA4: "This conceptual project is led by U.R.C.G under the banner of NeuroVance Synthara Technologies, focusing on the intersection of neuroscience, AI, and immersive experiences.",
        supportTitle: "Support the Project",
        supportSubtitle: "Your contribution helps build the future of human experience. Please choose your preferred donation method below.",
        cryptoButton: "Donate with Crypto",
        paypalButton: "PayPal/Debit/Credit",
        contactButton: "Contact Us",
        footerText1: "Conceptual project by U.R.C.G — NeuroVance Synthara Technologies",
        footerText2: "© 2025 Living Legacy. All rights reserved."
    },
    es: {
        pageTitle: "Legado Vivo - Experiencia Inmersiva de Paternidad",
        metaDescription: "Una experiencia inmersiva para sentir la paternidad que nunca fue vivida usando XR, IA emocional, háptica avanzada y BCI",
        metaKeywords: "realidad extendida, XR, paternidad virtual, IA emocional, tecnología inmersiva",
        heroTitle: "LEGADO VIVO",
        heroSubtitle: "Una experiencia inmersiva para sentir la paternidad que nunca fue vivida.",
        exploreButton: "Explorar Visión",
        videoPlaceholderText: "Descubre el Futuro de la Experiencia Humana",
        visionTitle: "La Visión",
        visionParagraph1: "Para quienes no pudieron tener hijos, ofrecemos una forma de explorar lo que pudo haber sido. Una simulación multisensorial desde el nacimiento hasta los 18 años, donde la tecnología más avanzada se encuentra con la emotividad más profunda.",
        visionParagraph2: "Legado Vivo no es solo una simulación, es un puente hacia la comprensión de la paternidad, la conexión humana y el significado de dejar huella en una vida.",
        techTitle: "Tecnologías Revolucionarias",
        techXRTitle: "Realidad Extendida (XR)",
        techXRDesc: "Entornos inmersivos que combinan realidad virtual, aumentada y mixta para crear experiencias visuales y espaciales completamente convincentes.",
        techHapticTitle: "Háptica Emocional",
        techHapticDesc: "Tecnología táctil avanzada que simula sensaciones físicas reales, desde el primer abrazo hasta los momentos más íntimos de conexión.",
        techBCITitle: "Interfaz Cerebro-Computadora (BCI)",
        techBCIDesc: "Conexión directa entre pensamientos y experiencia, permitiendo respuestas emocionales auténticas y naturales.",
        techAITitle: "IA Emocional Adaptativa",
        techAIDesc: "Sistemas de inteligencia artificial que evolucionan y aprenden, creando personalidades únicas y relaciones genuinas.",
        testimonialQuote: " He aprendido que, incluso en medio de lo incierto, siempre hay espacio para la esperanza. Esta idea que comparto contigo nace de una verdad íntima: el anhelo profundo de vivir, aunque sea en memoria y sentimiento, lo que la vida no me permitió experimentar de forma natural. Poder acercarme —aunque sea a través de una idea o una simulación— a lo que significa ser padre biológico, es una posibilidad poderosa. No solo para mí, sino para tantas personas que, por diferentes razones, no pudieron conocer esa vivencia de forma tradicional. Lo que estás por ver no es solo un proyecto; es un puente hacia una emoción universal. Gracias por prestarle tu mirada y tu sensibilidad.",
        testimonialCite: "— URCG, Fundador",
        galleryTitle: "Descripción Conceptual",
        gallerySubtitle: "Un vistazo al mundo visual y emocional de Legado Vivo. Usa los controles para navegar.",
                faqTitle: "Preguntas Frecuentes",
                faqQ1: "¿Qué es Legado Vivo exactamente?",
                faqA1: "Legado Vivo es un proyecto conceptual que busca crear una simulación inmersiva de la paternidad para aquellos que no pudieron tener hijos. Utiliza una combinación de XR, IA emocional, háptica y BCI para crear un viaje profundamente personal y emotivo.",
                faqQ2: "¿Es este un producto real?",
                faqA2: "Actualmente, Legado Vivo es una visión conceptual. Las tecnologías involucradas están a la vanguardia, y este proyecto sirve como una estrella polar para lo que podría ser posible en el futuro de la interacción humano-computadora y la simulación emocional.",
                faqQ3: "¿Cómo puedo apoyar esta visión?",
                faqA3: "Puedes apoyar la investigación y el desarrollo detrás de esta visión contribuyendo a través de las opciones de donación a continuación. Cada gramo de apoyo nos ayuda a explorar estas tecnologías innovadoras.",
                faqQ4: "¿Quién está detrás de este proyecto?",
                faqA4: "Este proyecto conceptual está liderado por U.R.C.G bajo el estandarte de NeuroVance Synthara Technologies, centrándose en la intersección de la neurociencia, la IA y las experiencias inmersivas.",
        supportTitle: "Apoya el Proyecto",
        supportSubtitle: "Tu contribución ayuda a construir el futuro de la experiencia humana. Por favor, elige tu método de donación preferido a continuación.",
        cryptoButton: "Donar con Cripto",
        paypalButton: "PayPal/Débito/Crédito",
        contactButton: "Contáctanos",
        footerText1: "Proyecto conceptual de U.R.C.G — NeuroVance Synthara Technologies",
        footerText2: "© 2025 Legado Vivo. Todos los derechos reservados."
    }
};

function setLanguage(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-lang-key]').forEach(element => {
        const key = element.getAttribute('data-lang-key');
        if (translations[lang] && translations[lang][key]) {
            if (element.tagName === 'META') {
                element.setAttribute('content', translations[lang][key]);
            } else if (element.tagName === 'TITLE') {
                document.title = translations[lang][key];
            } else {
                // Usar innerHTML permite que las traducciones incluyan etiquetas como <strong>
                element.innerHTML = translations[lang][key];
            }
        }
    });
    localStorage.setItem('selectedLanguage', lang);

    setTimeout(() => {
        const subtitle = document.querySelector('.hero p');
        const originalText = translations[lang]['heroSubtitle'];
        if (subtitle && typeof typeWriter === 'function') {
            typeWriter(subtitle, originalText, 30);
        }
    }, 500);
}

document.addEventListener('DOMContentLoaded', () => {
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    const languageSelector = document.getElementById('languageSelector');
    if (languageSelector) {
        languageSelector.value = savedLanguage;
        setLanguage(savedLanguage);
        languageSelector.addEventListener('change', (event) => {
            setLanguage(event.target.value);
        });
    }
});
