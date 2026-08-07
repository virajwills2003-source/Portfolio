/**
 * DEVELOPER PORTFOLIO - J.H.P.W. VIRAJ
 * Interactive Logic & Scroll Animation Script
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================
     0. LENIS SMOOTH SCROLLING & GSAP INTEGRATION
     ========================================== */
  let lenis = null;

  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false
    });

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      // Sync Lenis scroll updates with ScrollTrigger
      lenis.on('scroll', () => ScrollTrigger.update());

      // Drive Lenis inside GSAP ticker for 60fps frame sync
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });

      // Disable lag smoothing to keep scrolling instant & fluid
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }


  /* ==========================================
     SCROLLYTELLING CANVAS & SCRUBBER ENGINE
     ========================================== */
  const scrollyWrapper = document.querySelector('.scrolly-section-wrapper');
  const scrollyCanvas = document.getElementById('scrollyCanvas');
  const scrubberProgress = document.getElementById('scrubberProgress');

  if (scrollyCanvas && scrollyWrapper && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    const ctx = scrollyCanvas.getContext('2d');
    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    // Canvas resize handler
    function resizeCanvas() {
      width = scrollyCanvas.parentElement.clientWidth;
      height = scrollyCanvas.parentElement.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      scrollyCanvas.width = width * dpr;
      scrollyCanvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle Matrix Data
    const numParticles = 75;
    const particles = [];
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 1000,
        y: (Math.random() - 0.5) * 1000,
        z: Math.random() * 1000,
        size: Math.random() * 2.5 + 1,
        color: i % 3 === 0 ? '#00f0ff' : i % 3 === 1 ? '#8a2be2' : '#3b82f6'
      });
    }

    // Canvas Render Function bound to scroll progress [0.0 - 1.0]
    function renderScrollyCanvas(progress) {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Dynamic Mesh Grid Perspective Lines
      const gridOffset = (progress * 400) % 40;
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.07)';
      ctx.lineWidth = 1;

      // Perspective Grid Lines
      const gridRows = 16;
      for (let i = -gridRows; i <= gridRows; i++) {
        const xProj = centerX + i * 45;
        ctx.beginPath();
        ctx.moveTo(xProj, 0);
        ctx.lineTo(centerX + i * 140, height);
        ctx.stroke();
      }

      // Horizontal Moving Perspective Lines
      for (let y = 0; y < height; y += 35) {
        const currY = (y + gridOffset) % height;
        ctx.beginPath();
        ctx.moveTo(0, currY);
        ctx.lineTo(width, currY);
        ctx.stroke();
      }
      ctx.restore();

      // 2. Futuristic 3D Orbit Ring Telemetry Core
      ctx.save();
      ctx.translate(centerX, centerY);

      // Scrubbed rotation and scale
      const rotationAngle = progress * Math.PI * 4;
      const coreScale = 0.85 + Math.sin(progress * Math.PI) * 0.35;

      // Outer HUD Ring
      ctx.save();
      ctx.rotate(rotationAngle * 0.3);
      ctx.scale(coreScale, coreScale);
      ctx.beginPath();
      ctx.arc(0, 0, 180, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
      ctx.lineWidth = 2;
      ctx.setLineDash([15, 10, 5, 10]);
      ctx.stroke();
      ctx.restore();

      // Middle Counter-Rotating Tech Ring
      ctx.save();
      ctx.rotate(-rotationAngle * 0.6);
      ctx.scale(coreScale, coreScale);
      ctx.beginPath();
      ctx.arc(0, 0, 130, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(138, 43, 226, 0.35)';
      ctx.lineWidth = 3;
      ctx.setLineDash([40, 20, 10, 20]);
      ctx.stroke();
      ctx.restore();

      // Inner Glowing Core Node
      ctx.save();
      ctx.scale(coreScale, coreScale);
      const gradient = ctx.createRadialGradient(0, 0, 10, 0, 0, 80);
      gradient.addColorStop(0, 'rgba(0, 240, 255, 0.8)');
      gradient.addColorStop(0.5, 'rgba(138, 43, 226, 0.4)');
      gradient.addColorStop(1, 'rgba(0, 240, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, 80, 0, Math.PI * 2);
      ctx.fill();

      // Center Core Pulsing Dot
      ctx.beginPath();
      ctx.arc(0, 0, 8 + Math.sin(progress * 20) * 3, 0, Math.PI * 2);
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.restore();

      ctx.restore();

      // 3. Scrubbed 3D Particle Constellation Engine
      ctx.save();
      ctx.translate(centerX, centerY);

      particles.forEach((p, idx) => {
        const zPos = (p.z - progress * 800 + 1000) % 1000;
        const scale = 300 / (300 + zPos);

        const rot = rotationAngle * 0.2 + idx;
        const projX = (p.x * Math.cos(rot) - p.y * Math.sin(rot)) * scale;
        const projY = (p.x * Math.sin(rot) + p.y * Math.cos(rot)) * scale;

        const particleAlpha = Math.min(1, Math.max(0.1, (1000 - zPos) / 1000));

        ctx.beginPath();
        ctx.arc(projX, projY, p.size * scale, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = particleAlpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8 * scale;
        ctx.fill();

        // Matrix node linking lines
        if (idx > 0 && idx % 4 === 0) {
          const prev = particles[idx - 1];
          const prevZ = (prev.z - progress * 800 + 1000) % 1000;
          const prevScale = 300 / (300 + prevZ);
          const prevX = (prev.x * Math.cos(rot) - prev.y * Math.sin(rot)) * prevScale;
          const prevY = (prev.x * Math.sin(rot) + prev.y * Math.cos(rot)) * prevScale;

          const dist = Math.hypot(projX - prevX, projY - prevY);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(projX, projY);
            ctx.lineTo(prevX, prevY);
            ctx.strokeStyle = `rgba(0, 240, 255, ${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      });
      ctx.restore();
    }

    // Initial render call
    renderScrollyCanvas(0);

    // 4. GSAP ScrollTrigger Sequence Scrubber Setup
    const stages = [
      document.getElementById('scrollyStage1'),
      document.getElementById('scrollyStage2'),
      document.getElementById('scrollyStage3'),
      document.getElementById('scrollyStage4')
    ];

    function updateStageProgress(progress) {
      if (scrubberProgress) {
        scrubberProgress.style.width = `${progress * 100}%`;
      }

      scrollyWrapper.classList.toggle('scrolly-finished', progress >= 0.995);

      // Render 60fps canvas graphics
      renderScrollyCanvas(progress);

      // Gate Opening Scroll Synchronization (Progress 0.0 -> 0.14)
      const gateLeft = document.getElementById('gateLeft');
      const gateRight = document.getElementById('gateRight');
      const gateEmblem = document.getElementById('gateEmblem');
      const gateOverlay = document.getElementById('gateOverlay');

      if (gateLeft && gateRight && gateEmblem && gateOverlay) {
        const gateProgress = Math.min(1, Math.max(0, progress / 0.14));
        gateLeft.style.transform = `translateX(${-gateProgress * 100}%)`;
        gateRight.style.transform = `translateX(${gateProgress * 100}%)`;
        
        gateEmblem.style.opacity = `${1 - gateProgress}`;
        gateEmblem.style.transform = `scale(${1 + gateProgress * 0.35})`;

        if (gateProgress >= 0.95) {
          gateOverlay.style.pointerEvents = 'none';
        } else {
          gateOverlay.style.pointerEvents = 'all';
        }
      }

      // Parallax Stage Threshold Transitions
      let activeIndex = 0;
      if (progress < 0.23) {
        activeIndex = 0;
      } else if (progress >= 0.23 && progress < 0.52) {
        activeIndex = 1;
      } else if (progress >= 0.52 && progress < 0.78) {
        activeIndex = 2;
      } else {
        activeIndex = 3;
      }

      stages.forEach((stage, idx) => {
        if (stage) {
          if (idx === activeIndex) {
            stage.classList.add('active');
          } else {
            stage.classList.remove('active');
          }
        }
      });

      // 1. Stage 2 Sentence-by-Sentence scroll reveal (Continuous calculation for reverse scroll support)
      const stage2Progress = Math.min(1, Math.max(0, (progress - 0.23) / (0.52 - 0.23)));
      const sentenceElements = document.querySelectorAll('#scrollyStage2 .hero-sentence');
      sentenceElements.forEach((el, index) => {
        const threshold = index * 0.15;
        if (stage2Progress >= threshold && activeIndex >= 1) {
          el.classList.add('revealed');
        } else {
          el.classList.remove('revealed');
        }
      });

      // 2. Stage 3 Skill Meters progress fill (Continuous calculation for reverse scroll support)
      const stage3Progress = Math.min(1, Math.max(0, (progress - 0.52) / (0.78 - 0.52)));
      const skillItems = document.querySelectorAll('.scrolly-skill-item');
      skillItems.forEach(item => {
        const targetVal = parseInt(item.getAttribute('data-target'), 10) || 0;
        const currentVal = activeIndex >= 2 ? Math.round(targetVal * Math.min(1, stage3Progress * 1.25)) : 0;
        
        const fill = item.querySelector('.scrolly-progress-fill');
        const valText = item.querySelector('.skill-val');

        if (fill) fill.style.width = `${currentVal}%`;
        if (valText) valText.textContent = `${currentVal}%`;
      });

      // 3. Stage 4 Feature Badges scroll reveal (Continuous calculation for reverse scroll support)
      const stage4Progress = Math.min(1, Math.max(0, (progress - 0.78) / (1.0 - 0.78)));
      const archElements = document.querySelectorAll('#scrollyStage4 .arch-item');
      archElements.forEach((el, index) => {
        const threshold = index * 0.22;
        if (stage4Progress >= threshold && activeIndex === 3) {
          el.classList.add('revealed');
        } else {
          el.classList.remove('revealed');
        }
      });
    }

    // Pinning ScrollTrigger Timeline
    ScrollTrigger.create({
      trigger: scrollyWrapper,
      start: "top top",
      end: () => window.matchMedia('(max-width: 768px)').matches ? "+=170%" : "+=250%",
      pin: ".scrolly-sticky-viewport",
      scrub: 0.6,
      onUpdate: (self) => {
        updateStageProgress(self.progress);
      },
      onEnterBack: () => {
        scrollyWrapper.classList.remove('scrolly-finished');
      },
      onLeaveBack: () => {
        scrollyWrapper.classList.remove('scrolly-finished');
      }
    });
  }


  /* ==========================================
     1. DYNAMIC TYPING EFFECT
     ========================================== */
  const typingElement = document.getElementById('typingText');
  const linesToType = [
    "HND IT Student at SLIATE",
    "Software & Web Developer",
    "Java | PHP | JavaScript | SQL | C# | Laravel",
    "Passionate about Database Management & Networking",
    "Always Learning New Technologies!"
  ];

  let lineIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingDelay = 80;
  let erasingDelay = 40;
  let newTextDelay = 2000; // Pause before deleting

  function typeText() {
    const currentLine = linesToType[lineIndex];

    if (isDeleting) {
      typingElement.textContent = currentLine.substring(0, charIndex - 1);
      charIndex--;
      typingDelay = erasingDelay;
    } else {
      typingElement.textContent = currentLine.substring(0, charIndex + 1);
      charIndex++;
      typingDelay = 80;
    }

    if (!isDeleting && charIndex === currentLine.length) {
      // Line finished typing -> Wait then start deleting
      typingDelay = newTextDelay;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      // Finished deleting -> Move to next line
      isDeleting = false;
      lineIndex = (lineIndex + 1) % linesToType.length;
      typingDelay = 500;
    }

    setTimeout(typeText, typingDelay);
  }

  if (typingElement) {
    typeText();
  }


  /* ==========================================
     2. NAVBAR SCROLLED STATE & MOBILE MENU
     ========================================== */
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    highlightActiveNav();
  });

  // Mobile Menu Toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = mobileToggle.querySelector('i');
      if (navMenu.classList.contains('active')) {
        icon.className = 'fa-solid fa-xmark';
      } else {
        icon.className = 'fa-solid fa-bars';
      }
    });

  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    document.documentElement.classList.add('light-theme');
    if (themeToggle) themeToggle.querySelector('i').className = 'fa-solid fa-sun';
  }
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.documentElement.classList.toggle('light-theme');
      const isLight = document.documentElement.classList.contains('light-theme');
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
      const icon = themeToggle.querySelector('i');
      icon.className = isLight ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    });
  }

  }

  // Close Mobile Menu on Nav Link Click
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      if (navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        if (mobileToggle) {
          mobileToggle.querySelector('i').className = 'fa-solid fa-bars';
        }
      }
    });
  });


  /* ==========================================
     3. ACTIVE NAVBAR LINK HIGHLIGHTING
     ========================================== */
  const sections = document.querySelectorAll('section[id]');

  function highlightActiveNav() {
    const scrollPosition = window.scrollY + 120;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      const targetNavLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

      if (targetNavLink) {
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          navLinks.forEach(l => l.classList.remove('active'));
          targetNavLink.classList.add('active');
        }
      }
    });
  }


  /* ==========================================
     4. GSAP SCROLLTRIGGER REVEAL ANIMATIONS FOR ALL SECTIONS
     ========================================== */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    const allRevealTargets = document.querySelectorAll('.section-header, .about-card, .skill-card, .project-card, .net-card, .edu-card, .contact-card, .reveal-up, .reveal-left, .reveal-right');
    const mobileReveal = window.matchMedia('(max-width: 768px)').matches;

    function getRevealOffset(el) {
      if (!mobileReveal) return { x: 0, y: 45 };
      if (el.classList.contains('reveal-left')) return { x: -18, y: 0 };
      if (el.classList.contains('reveal-right')) return { x: 18, y: 0 };
      if (el.classList.contains('reveal-fade')) return { x: 0, y: 0 };
      return { x: 0, y: 20 };
    }

    allRevealTargets.forEach(el => {
      const revealOffset = getRevealOffset(el);

      gsap.fromTo(el, 
        { 
          opacity: 0, 
          x: revealOffset.x,
          y: revealOffset.y,
          scale: mobileReveal ? 0.99 : 0.98 
        }, 
        {
          opacity: 1, 
          x: 0,
          y: 0, 
          scale: 1,
          duration: 0.85,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });
  } else {
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-fade, .reveal-left, .reveal-right');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
        } else {
          entry.target.classList.remove('reveal-active');
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });
    revealElements.forEach(el => revealObserver.observe(el));
  }


  /* ==========================================
     5. SKILL BARS & PERCENTAGE ANIMATION
     ========================================== */
  const skillsSection = document.getElementById('skills');
  let hasAnimatedSkills = false;

  function animateSkills() {
    const skillCards = document.querySelectorAll('.skill-card');
    
    skillCards.forEach(card => {
      const items = card.querySelectorAll('.skill-item');
      items.forEach(item => {
        const fillBar = item.querySelector('.progress-bar-fill');
        const percentageText = item.querySelector('.skill-percentage');
        
        if (fillBar && percentageText) {
          const targetWidth = fillBar.getAttribute('data-width');
          const targetNum = parseInt(percentageText.getAttribute('data-target'), 10);
          
          fillBar.style.width = targetWidth;

          // Counter Animation
          let currentNum = 0;
          const stepTime = Math.abs(Math.floor(1500 / targetNum));
          const counterInterval = setInterval(() => {
            currentNum++;
            percentageText.textContent = `${currentNum}%`;
            if (currentNum >= targetNum) {
              clearInterval(counterInterval);
            }
          }, stepTime);
        }
      });
    });
  }

  if (skillsSection) {
    const skillsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimatedSkills) {
          animateSkills();
          hasAnimatedSkills = true;
        }
      });
    }, { threshold: 0.2 });

    skillsObserver.observe(skillsSection);
  }


  /* ==========================================
     6. SKILL CATEGORY TAB FILTERING
     ========================================== */
  const tabBtns = document.querySelectorAll('.tab-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-tab');

      skillCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });





  /* ==========================================
     8. CONTACT FORM SUBMISSION HANDLER (WhatsApp & Gmail)
     ========================================== */
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  const methodOptions = document.querySelectorAll('.method-option');

  // Toggle active class on send method radio options
  methodOptions.forEach(option => {
    option.addEventListener('click', () => {
      methodOptions.forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
      const radio = option.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const subject = document.getElementById('subject').value.trim();
      const message = document.getElementById('message').value.trim();

      const selectedMethodRadio = document.querySelector('input[name="sendMethod"]:checked');
      const sendMethod = selectedMethodRadio ? selectedMethodRadio.value : 'whatsapp';

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Preparing...';

      // Format Message for WhatsApp / Gmail
      const formattedMessage = `Hi Viraj,\n\n*Name:* ${name}\n*Email:* ${email}\n*Subject:* ${subject}\n\n*Message:*\n${message}`;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        
        if (sendMethod === 'whatsapp') {
          // Send via WhatsApp to +9476926251
          const whatsappNumber = '9476926251';
          const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(formattedMessage)}`;
          
          formStatus.className = 'form-status success';
          formStatus.innerHTML = `<i class="fa-brands fa-whatsapp"></i> Opening WhatsApp to send message to <strong>+9476926251</strong>...`;
          
          window.open(waUrl, '_blank');
        } else {
          // Send via Gmail to virajwills2003@gmail.com
          const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=virajwills2003@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(formattedMessage)}`;
          const mailtoUrl = `mailto:virajwills2003@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(formattedMessage)}`;
          
          formStatus.className = 'form-status success';
          formStatus.innerHTML = `<i class="fa-solid fa-envelope"></i> Opening Gmail to send message to <strong>virajwills2003@gmail.com</strong>...`;
          
          // Open web Gmail or fallback mailto
          window.open(gmailUrl, '_blank') || window.location.assign(mailtoUrl);
        }
        
        contactForm.reset();

        setTimeout(() => {
          formStatus.innerHTML = '';
        }, 8000);
      }, 800);
    });
  }

});
