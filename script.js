document.addEventListener("DOMContentLoaded", () => {
  // Utility: Debounce function to limit event handler calls
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Preloader handling
  const initPreloader = () => {
    const preloader = document.getElementById("preloader");
    if (!preloader) return;

    const hidePreloader = () => preloader.classList.add("hidden");
    window.addEventListener("load", hidePreloader);
    setTimeout(hidePreloader, 3000); // Fallback
  };

  // Mobile menu toggle
  const initMobileMenu = () => {
    const menuToggle = document.querySelector(".menu-toggle");
    const navbar = document.getElementById("navbar");
    if (!menuToggle || !navbar) return;

    // Add close icon if not present
    if (!menuToggle.querySelector(".fa-times")) {
      menuToggle.appendChild(Object.assign(document.createElement("i"), {
        className: "fas fa-times"
      }));
    }

    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      navbar.classList.toggle("active");
      menuToggle.classList.toggle("open");
    });

    // Close menu on nav link click or outside click
    document.addEventListener("click", (e) => {
      if (navbar.classList.contains("active") &&
          !navbar.contains(e.target) &&
          !menuToggle.contains(e.target)) {
        navbar.classList.remove("active");
        menuToggle.classList.remove("open");
      }
    });

    navbar.addEventListener("click", (e) => {
      if (e.target.tagName === "A" && navbar.classList.contains("active")) {
        navbar.classList.remove("active");
        menuToggle.classList.remove("open");
      }
    });
  };

  // Header scroll effect
  const initHeaderScroll = () => {
    const header = document.querySelector("header");
    if (!header) return;

    const updateHeader = debounce(() => {
      header.classList.toggle("scrolled", window.scrollY > 50);
    }, 50);
    window.addEventListener("scroll", updateHeader);
  };

  // Navigation link highlighting
  const initNavHighlight = () => {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll("#navbar a");
    const header = document.querySelector("header");
    if (sections.length === 0 || navLinks.length === 0) return;

    const headerHeight = header?.offsetHeight || 70;
    const updateActiveLink = debounce(() => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      let current = "";

      sections.forEach((section) => {
        if (scrollY >= section.offsetTop - headerHeight - 20) {
          current = section.id;
        }
      });

      // Handle bottom of page
      if (window.innerHeight + scrollY + 50 >= document.body.scrollHeight) {
        current = sections[sections.length - 1].id;
      }

      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
      });
    }, 50);

    window.addEventListener("scroll", updateActiveLink);
    window.addEventListener("load", updateActiveLink);
  };

  // Theme toggle
  const initThemeToggle = () => {
    const themeToggle = document.querySelector(".theme-toggle");
    const htmlElement = document.documentElement;
    if (!themeToggle) return;

    const savedTheme = localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    htmlElement.setAttribute("data-theme", savedTheme);

    themeToggle.addEventListener("click", () => {
      const newTheme = htmlElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      htmlElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
    });
  };

  // Category content display
  const initCategoryDisplay = () => {
    const categoryItems = document.querySelectorAll(".category-item");
    const contentSections = document.querySelectorAll("#content-display > .content-section");
    const contentPlaceholder = document.querySelector("#content-display-area .content-placeholder");
    const contentDisplayArea = document.getElementById("content-display-area");
    const header = document.querySelector("header");
    if (categoryItems.length === 0 || !contentDisplayArea) {
      console.log("Category items or content display area not found.");
      return;
    }

    const headerHeight = header?.offsetHeight || 70; // Fallback header height

    const showCategory = (categoryId) => {
      console.log(`Showing category: ${categoryId}`);

      categoryItems.forEach((item) => item.classList.remove("active"));
      const activeItem = document.querySelector(`.category-item[data-category="${categoryId}"]`);
      if (activeItem) {
        activeItem.classList.add("active");
        console.log(`Active item set: ${categoryId}`);
      } else {
        console.log(`Active item not found for category: ${categoryId}`);
      }

      contentSections.forEach((section) => section.style.display = "none");
      if (contentPlaceholder) contentPlaceholder.style.display = "none";

      const selectedSection = document.getElementById(categoryId);
      if (selectedSection) {
        selectedSection.style.display = "block";
        console.log(`Selected section displayed: ${categoryId}`);

        // Scroll to selected section with header offset
        try {
          const rect = selectedSection.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const targetPosition = rect.top + scrollTop - headerHeight - 20;

          console.log(`Scrolling to position: ${targetPosition}`);
          window.scrollTo({
            top: targetPosition,
            behavior: "smooth"
          });

          // Fallback: Check if scroll worked and use scrollIntoView if needed
          setTimeout(() => {
            const currentPosition = window.scrollY;
            if (Math.abs(currentPosition - targetPosition) > 5) {
              console.log("window.scrollTo failed, using scrollIntoView as fallback");
              selectedSection.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }, 500);
        } catch (error) {
          console.error("Error during scroll:", error);
          selectedSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } else {
        console.log(`Selected section not found for category: ${categoryId}`);
        if (contentPlaceholder) contentPlaceholder.style.display = "flex";
      }
    };

    categoryItems.forEach((item) => {
      item.addEventListener("click", () => {
        const categoryId = item.getAttribute("data-category");
        console.log(`Category item clicked: ${categoryId}`);
        if (item.classList.contains("active")) {
          item.classList.remove("active");
          document.getElementById(categoryId).style.display = "none";
          if (contentPlaceholder) contentPlaceholder.style.display = "flex";
          console.log(`Category deselected: ${categoryId}`);
        } else {
          showCategory(categoryId);
        }
      });
    });

    if (contentPlaceholder) contentPlaceholder.style.display = "flex";
    contentSections.forEach((section) => section.style.display = "none");
  };

  // Scroll down and scroll to top
  const initScrollButtons = () => {
    const scrollDownArrow = document.querySelector(".scroll-down a");
    const scrollTopContainer = document.querySelector(".scroll-top");
    const header = document.querySelector("header");

    if (scrollDownArrow && header) {
      scrollDownArrow.addEventListener("click", (e) => {
        e.preventDefault();
        const targetSection = document.querySelector(scrollDownArrow.getAttribute("href"));
        if (targetSection) {
          window.scrollTo({
            top: targetSection.offsetTop - header.offsetHeight,
            behavior: "smooth"
          });
        }
      });
    }

    if (scrollTopContainer) {
      scrollTopContainer.querySelector("a").addEventListener("click", (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      window.addEventListener("scroll", debounce(() => {
        scrollTopContainer.classList.toggle("visible", window.scrollY > 300);
      }, 50));
    }
  };

  // Hero parallax effect
  const initHeroParallax = () => {
    const heroSection = document.querySelector(".hero");
    if (!heroSection) return;

    window.addEventListener("scroll", debounce(() => {
      heroSection.style.backgroundPositionY = `${window.scrollY * 0.3}px`;
    }, 10));
  };

  // Scroll reveal animations
  const initScrollReveal = () => {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -5% 0px" });

    document.querySelectorAll(
      ".animate-on-scroll, .book-item, .semester-item, .resource-item, .category-item, .blog-post-preview, .profile-bio-container, .typewriter-code, .education, .skills-overview, .social-links, .contact-form"
    ).forEach((el) => {
      el.classList.add("animate-on-scroll");
      observer.observe(el);
    });
  };

  // Typewriter effect for hero title
  const initTypewriter = () => {
    const heroTitle = document.querySelector(".hero-content h1");
    if (!heroTitle || !heroTitle.textContent.trim()) return;

    const text = heroTitle.textContent.trim();
    heroTitle.textContent = "";
    heroTitle.style.opacity = "1";
    let i = 0;

    const typeWriter = () => {
      if (i < text.length) {
        heroTitle.textContent += text[i++];
        setTimeout(typeWriter, 70);
      }
    };
    setTimeout(typeWriter, 1200);
  };

  // Blog section
  const initBlogSection = () => {
    const blogPostsData = [
      {
        id: "blog1",
        title: "As World Shifts Towards Sustainable Energy",
        bloggerUrl: "https://eramritkhanal.blogspot.com/2025/05/introduction-as-world-shifts-its-focus.html",
        previewImage: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhvivZqWhc_srBhJ4z4Wj8n34yd1uYPlkz7laZbvmVHUqF_OU-hUZ68vQvUU1FRns65JhU5yPAIIRmbkIUmAELmxa2KktBCc7lPugcZTWkrN19LakktmcS9LaumKvJ_Nu4f3hFgCng-v5r9FIZf_wN7BuDV8qA1fZg2ehSFqXBCP2fp9TAtXDhV3pBoBxc/w567-h319/background-image.png",
        snippet: "An introduction to the global shift towards sustainable energy, exploring drivers, benefits, and challenges. Learn about solar, wind, and other renewables."
      },
      {
        id: "blog2",
        title: "Chemical Engineering in Nepal: Opportunities and Challenges",
        bloggerUrl: "https://eramritkhanal.blogspot.com/2025/05/chemical-engineering-in-nepal.html",
        previewImage: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiV3iTARM1TIlbLM6TQ4Hoitd2Qqw310zc9XJ-lyfRsIC0QGzhyKq9krZ-YA1e6FJ_tDCUqP0_u2rAdbIWOeCMo2QzEF0xGKsAEr_xwO6Of7ZcOonlUMIxcUQKnldCGh3KddoW2eTAmVci4SxG-bw-8vBXvDuKUHGzivae73gLB-8ihP4c3TRDmFKzgFU0/w675-h380/Untitled%20design%20(3).png",
        snippet: "The history of chemical engineering in Nepal may be short, but its development has been promising. Originating after the Industrial Revolution, this field can significantly contribute to Nepal’s pharmaceutical, food processing, cement, environmental protection, and renewable energy sectors."
      },
      {
        id: "blog3",
        title: "Mastering Remote Work: Tips for Productivity",
        bloggerUrl: "https://eramritkhanal.blogspot.com/your-remote-work-link-here",
        previewImage: "Images/blog-placeholder-3.jpg",
        snippet: "Practical advice and strategies to stay focused, organized, and maintain a healthy work-life balance while working from home effectively."
      }
    ];

    const blogPostsContainer = document.querySelector(".blog-posts-container");
    const blogModal = document.getElementById("blogModal");
    if (!blogPostsContainer || !blogModal) return;

    const modalBlogTitle = document.getElementById("modalBlogTitle");
    const blogIframe = document.getElementById("blogIframe");
    const viewOnBloggerLinkModal = document.getElementById("viewOnBloggerLink");
    const closeModalButtons = document.querySelectorAll("#blogModal .close-button, #blogModal .close-modal-footer-btn");

    const displayBlogPreviews = () => {
      blogPostsContainer.innerHTML = blogPostsData.length === 0
        ? '<p style="text-align: center; color: var(--text-light);">No blog posts available yet. Check back soon!</p>'
        : blogPostsData.map(post => `
          <article class="blog-post-preview animate-on-scroll">
            ${post.previewImage ? `<img src="${post.previewImage}" alt="${post.title} preview" class="preview-image">` : ""}
            <h3>${post.title}</h3>
            <p class="snippet">${post.snippet}</p>
            <div class="actions">
              <button class="btn primary-btn read-more-btn" data-id="${post.id}" aria-label="Read more about ${post.title}">Read More</button>
              <a href="${post.bloggerUrl}" target="_blank" rel="noopener noreferrer" class="btn secondary-btn view-on-blogger-preview" aria-label="View ${post.title} on Blogger">View on Blogger</a>
            </div>
          </article>
        `).join("");

      document.querySelectorAll(".blog-post-preview").forEach((el) => initScrollReveal().observer.observe(el));
    };

    const openModalWithPost = ({ id, title, bloggerUrl }) => {
      if (!modalBlogTitle || !blogIframe || !viewOnBloggerLinkModal) return;

      modalBlogTitle.textContent = title;
      blogIframe.src = bloggerUrl;
      viewOnBloggerLinkModal.href = bloggerUrl;

      blogModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");

      const firstFocusable = blogModal.querySelector(".close-button, a.btn, button.btn");
      if (firstFocusable) firstFocusable.focus();
    };

    const closeBlogModal = () => {
      if (!blogIframe) return;
      blogModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
      setTimeout(() => blogIframe.src = "", 300);
    };

    blogPostsContainer.addEventListener("click", (e) => {
      const readMoreBtn = e.target.closest(".read-more-btn");
      if (readMoreBtn) {
        const postId = readMoreBtn.dataset.id;
        const postData = blogPostsData.find((p) => p.id === postId);
        if (postData) openModalWithPost(postData);
      }
    });

    closeModalButtons.forEach((btn) => btn.addEventListener("click", closeBlogModal));
    blogModal.addEventListener("click", (e) => e.target === blogModal && closeBlogModal());
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && blogModal.getAttribute("aria-hidden") === "false") {
        closeBlogModal();
      }
    });

    displayBlogPreviews();
  };

  // Contact form handling
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = contactForm.name.value.trim();
      const email = contactForm.email.value.trim();
      const subject = contactForm.subject.value.trim();
      const message = contactForm.message.value.trim();
      let isValid = true;
      if (!name) { isValid = false; alert('Name is required.'); contactForm.name.focus(); }
      else if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { isValid = false; alert('Valid email is required.'); contactForm.email.focus(); }
      else if (!subject) { isValid = false; alert('Subject is required.'); contactForm.subject.focus(); }
      else if (!message) { isValid = false; alert('Message is required.'); contactForm.message.focus(); }
      if (!isValid) return;
      console.log('Form Data:', { name, email, subject, message });
      alert(`Thank you, ${name}! Your message has been "sent".It will be reviewed shortly.`);
      contactForm.reset();
    });
  }

  // Update footer year
  const yearSpan = document.getElementById('currentYear');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

 // Initialize all features
  initPreloader();
  initMobileMenu();
  initHeaderScroll();
  initNavHighlight();
  initThemeToggle();
  initCategoryDisplay();
  initScrollButtons();
  initHeroParallax();
  initScrollReveal();
  initTypewriter();
  initBlogSection();
  initContactForm();
  initFooterYear();
});