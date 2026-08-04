/**
 * DEVELOPER PORTFOLIO - J.H.P.W. VIRAJ
 * Interactive Logic & Scroll Animation Script
 */

document.addEventListener('DOMContentLoaded', () => {

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
     4. SCROLL REVEAL ANIMATION (IntersectionObserver)
     ========================================== */
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
     7. PROFILE PHOTO UPLOADER & CANVAS JPG COMPRESSOR
     ========================================== */
  const imageUploadInput = document.getElementById('imageUploadInput');
  const profileImageDisplay = document.getElementById('profileImageDisplay');
  const defaultAvatarIcon = document.getElementById('defaultAvatarIcon');
  const resetAvatarBtn = document.getElementById('resetAvatarBtn');
  const uploadStatusInfo = document.getElementById('uploadStatusInfo');

  // Load saved photo from localStorage if present
  const savedPhoto = localStorage.getItem('viraj_portfolio_avatar_jpg');
  if (savedPhoto && profileImageDisplay) {
    profileImageDisplay.src = savedPhoto;
    profileImageDisplay.style.display = 'block';
    if (defaultAvatarIcon) defaultAvatarIcon.style.display = 'none';
    if (resetAvatarBtn) resetAvatarBtn.style.display = 'inline-flex';
    if (uploadStatusInfo) {
      uploadStatusInfo.className = 'upload-status-info success';
      uploadStatusInfo.innerHTML = '<i class="fa-solid fa-circle-check"></i> Profile photo loaded (Compressed 500×500 JPG)';
    }
  }

  // Handle Photo Upload & Canvas Compression
  if (imageUploadInput) {
    imageUploadInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (JPG/PNG).');
        return;
      }

      uploadStatusInfo.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Resizing & Compressing image to standard 500×500 JPG...';

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Standard Resolution: 500x500 pixels
          const targetWidth = 500;
          const targetHeight = 500;
          
          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Crop center square to avoid stretching/distortion
          const size = Math.min(img.width, img.height);
          const startX = (img.width - size) / 2;
          const startY = (img.height - size) / 2;

          ctx.drawImage(img, startX, startY, size, size, 0, 0, targetWidth, targetHeight);

          // Compress to JPG format with 0.85 quality factor
          const compressedJpgDataUrl = canvas.toDataURL('image/jpeg', 0.85);

          // Update Display
          profileImageDisplay.src = compressedJpgDataUrl;
          profileImageDisplay.style.display = 'block';
          if (defaultAvatarIcon) defaultAvatarIcon.style.display = 'none';
          if (resetAvatarBtn) resetAvatarBtn.style.display = 'inline-flex';

          // Store in LocalStorage
          try {
            localStorage.setItem('viraj_portfolio_avatar_jpg', compressedJpgDataUrl);
          } catch (err) {
            console.warn('LocalStorage quota exceeded for avatar', err);
          }

          // Calculate sizes
          const origKb = (file.size / 1024).toFixed(1);
          const compKb = (compressedJpgDataUrl.length * 0.75 / 1024).toFixed(1);

          uploadStatusInfo.className = 'upload-status-info success';
          uploadStatusInfo.innerHTML = `<i class="fa-solid fa-circle-check"></i> Compressed: ${origKb}KB ➔ <strong>${compKb}KB JPG</strong> (Standard 500×500)`;
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // Reset Photo Handler
  if (resetAvatarBtn) {
    resetAvatarBtn.addEventListener('click', () => {
      localStorage.removeItem('viraj_portfolio_avatar_jpg');
      profileImageDisplay.src = '';
      profileImageDisplay.style.display = 'none';
      if (defaultAvatarIcon) defaultAvatarIcon.style.display = 'inline-block';
      resetAvatarBtn.style.display = 'none';
      if (imageUploadInput) imageUploadInput.value = '';
      uploadStatusInfo.className = 'upload-status-info';
      uploadStatusInfo.innerHTML = '<i class="fa-solid fa-compress"></i> Standard 500×500 JPG Resolution Auto-Compressor';
    });
  }


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

