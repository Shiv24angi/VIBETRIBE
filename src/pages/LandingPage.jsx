import React, { useState, useRef, useEffect } from 'react';
import AuthForm from '../components/AuthForm'; // Correctly import AuthForm from its file

const LandingPage = ({ onAuthSuccess }) => {
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [visibleSections, setVisibleSections] = useState({});
  const welcomeRef = useRef(null); // Ref for the welcome section
  const aboutRef = useRef(null);
  const contactRef = useRef(null);
  const aboutItemsRef = useRef([]);

  // Function to smoothly scroll to a section
  const scrollToSection = (ref) => {
    if (showAuthForm) {
      setShowAuthForm(false); // Hide auth form if it's open
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth' }), 100); // Small delay to allow form to hide
    } else {
      ref.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // State for Contact Form fields
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  // Handle Contact Form submission
  const handleContactSubmit = (e) => {
    e.preventDefault();
    console.log('Contact Form Submitted:', {
      name: contactName,
      email: contactEmail,
      message: contactMessage,
    });
    // Here you would typically send this data to a backend
    // Using alert for simplicity, consider a custom modal in a real app
    alert('Thank you for your message! We will get back to you soon.');
    setContactName('');
    setContactEmail('');
    setContactMessage('');
  };

  // Calculate header height dynamically or use a fixed value if known
  // For this example, assuming header height is roughly 96px (pt-24 on main)
  const headerHeight = 96; // Based on pt-24 on main, which pushes content down

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisibleSections(prev => ({ ...prev, [entry.target.id]: true }));
        }
      });
    }, observerOptions);

    // Observe all sections
    if (welcomeRef.current) observer.observe(welcomeRef.current);
    if (aboutRef.current) observer.observe(aboutRef.current);
    if (contactRef.current) observer.observe(contactRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col font-inter overflow-x-hidden"
      style={{
        background: 'linear-gradient(135deg, #E0B8F0 0%, #D6CCF1 25%, #A970FF 50%, #8B4DEB 75%, #6A39B1 100%)',
      }}
    >
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(106, 57, 177, 0.5);
          }
          50% {
            box-shadow: 0 0 40px rgba(106, 57, 177, 0.8);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out;
        }

        .animate-slide-in-left {
          animation: slideInLeft 0.8s ease-out;
        }

        .animate-slide-in-right {
          animation: slideInRight 0.8s ease-out;
        }

        .animate-scale-in {
          animation: scaleIn 0.6s ease-out;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .section-visible {
          animation: fadeInUp 0.8s ease-out;
        }

        .about-item {
          transition: all 0.3s ease;
        }

        .about-item:hover {
          transform: translateX(10px);
          text-shadow: 0 0 15px rgba(106, 57, 177, 0.6);
        }
      `}</style>
      {/* Header - Always visible and fixed */}
      <header className="w-full bg-[var(--panel)] bg-opacity-95 shadow-md py-4 px-8 flex justify-between items-center fixed top-0 left-0 z-50">
        <h1 className="text-3xl font-extrabold text-[var(--text-strong)]">VibeTribe</h1>
        <nav className="flex items-center space-x-6">
          <button
            onClick={() => scrollToSection(welcomeRef)}
            className="text-[var(--text-muted)] hover:text-[var(--accent)] font-semibold transition duration-300 relative group"
          >
            Home
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--accent)] group-hover:w-full transition-all duration-300"></span>
          </button>
          <button
            onClick={() => scrollToSection(aboutRef)}
            className="text-[var(--text-muted)] hover:text-[var(--accent)] font-semibold transition duration-300 relative group"
          >
            About
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--accent)] group-hover:w-full transition-all duration-300"></span>
          </button>
          <button
            onClick={() => scrollToSection(contactRef)}
            className="text-[var(--text-muted)] hover:text-[var(--accent)] font-semibold transition duration-300 relative group"
          >
            Contact Us
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--accent)] group-hover:w-full transition-all duration-300"></span>
          </button>
          <button
            onClick={() => setShowAuthForm(true)}
            className="px-6 py-2 bg-[var(--accent)] text-white font-bold rounded-full shadow-lg hover:bg-[var(--accent-2)] transition duration-300 transform hover:scale-105"
          >
            Sign In / Sign Up
          </button>
        </nav>
      </header>

      {/* Main Content Area - Scrollable sections */}
      <main className="flex-grow flex flex-col items-center p-4 pt-24">
        {!showAuthForm ? (
          <>
            {/* Welcome Section */}
            <section
              ref={welcomeRef}
              className="text-center text-white mb-20 max-w-4xl mx-auto w-full"
              style={{ minHeight: `calc(100vh - ${headerHeight}px)` }} // Adjust min-height for header
            >
              <div className="flex flex-col items-center justify-center h-full">
                <br></br>
                <br></br>
                <br></br>
                <br></br>
                <br></br>
                <br></br>
                <br></br>
                <br></br>
                <h2 className="text-7xl font-extrabold leading-tight mb-6 drop-shadow-lg animate-fade-in-up" style={{ color: '#6A39B1' }}>
                  Discover Your Tribe
                </h2>
                <p className="text-2xl font-light max-w-2xl mx-auto drop-shadow-md mb-8 animate-fade-in-up" style={{ color: '#6A39B1', animationDelay: '0.2s' }}>
                  Connect with like-minded people who match your vibe. Whether you're quirky, calm,
                  creative, or chaotic — there’s a tribe for everyone.
                </p>
                <button
                  onClick={() => setShowAuthForm(true)}
                  className="px-8 py-4 bg-white text-[var(--accent)] font-bold rounded-full shadow-lg hover:shadow-2xl transition duration-300 transform hover:scale-110 animate-scale-in"
                  style={{ animationDelay: '0.4s' }}
                >
                  🚀 Get Started
                </button>
              </div>
            </section>

            {/* About Section */}
            <section
              ref={aboutRef}
              className="bg-white bg-opacity-5 backdrop-blur-sm p-12 rounded-2xl shadow-2xl w-full max-w-4xl mx-auto mb-20 text-white border border-white border-opacity-10"
              style={{ minHeight: `calc(100vh - ${headerHeight}px)` }}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <h3 className="text-5xl font-bold text-center mb-8 animate-fade-in-up" style={{ color: '#6A39B1' }}>&nbsp;About VibeTribe</h3>
                <p className="text-xl leading-relaxed mb-8 text-center animate-fade-in-up" style={{ color: 'white', animationDelay: '0.1s' }}>
                  VibeTribe helps you discover meaningful connections through:
                </p>
                <ul className="space-y-4 text-lg w-full max-w-2xl mb-8">
                  <li className="about-item p-4 rounded-lg bg-white bg-opacity-5 border-l-4 border-[#6A39B1] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <div style={{ display: 'inline', color: '#FFD700', fontWeight: '400' }}><span></span></div> <span style={{ color: 'white', fontWeight: 'bold' }}>Playful Profile Creation</span> - <span style={{ color: 'white' }}>Make it fun and express yourself!</span>
                  </li>
                  <li className="about-item p-4 rounded-lg bg-white bg-opacity-5 border-l-4 border-[#6A39B1] animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <div style={{ display: 'inline', color: '#FF6B9D', fontWeight: '400' }}><span></span></div> <span style={{ color: 'white', fontWeight: 'bold' }}>Smart Matching</span> - <span style={{ color: 'white' }}>Based on personality, hobbies, and lifestyle</span>
                  </li>
                  <li className="about-item p-4 rounded-lg bg-white bg-opacity-5 border-l-4 border-[#6A39B1] animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <div style={{ display: 'inline', color: '#00D9FF', fontWeight: '400' }}><span></span></div> <span style={{ color: 'white', fontWeight: 'bold' }}>Real People</span> - <span style={{ color: 'white' }}>Community-first approach with genuine connections</span>
                  </li>
                </ul>
                <p className="text-xl leading-relaxed text-center animate-fade-in-up" style={{ color: 'white', animationDelay: '0.5s' }}>
                  Whether you’re into poetry, parkour, painting, or just peace&nbsp;&nbsp; �� we’ll help you vibe with the right people.
                </p>
              </div>
            </section>

            {/* Contact Section (Form) */}
            <section
              id="contact"
              ref={contactRef}
              className="bg-white bg-opacity-5 backdrop-blur-sm p-12 rounded-2xl shadow-2xl w-full max-w-4xl mx-auto mb-20 text-white border border-white border-opacity-10"
              style={{ minHeight: `calc(100vh - ${headerHeight}px)` }}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <h3 className="text-5xl font-bold text-center mb-8 animate-fade-in-up" style={{ color: '#6A39B1' }}>&nbsp;Contact Us</h3>
                <p className="text-xl leading-relaxed text-center mb-8 animate-fade-in-up" style={{ color: 'white', animationDelay: '0.1s' }}>
                  Got feedback or ideas? We'd love to hear from you!
                </p>
                <form onSubmit={handleContactSubmit} className="w-full max-w-md space-y-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <div>
                    <label htmlFor="contactName" className="block text-sm font-bold mb-2" style={{ color: 'white' }}>
                      Name
                    </label>
                    <input
                      type="text"
                      id="contactName"
                      className="shadow appearance-none border border-white border-opacity-30 rounded-lg w-full py-3 px-4 text-black leading-tight focus:outline-none focus:ring-2 focus:ring-[#6A39B1] focus:border-transparent transition duration-300 bg-white bg-opacity-90"
                      placeholder="Your name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-bold mb-2" style={{ color: 'white' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      className="shadow appearance-none border border-white border-opacity-30 rounded-lg w-full py-3 px-4 text-black leading-tight focus:outline-none focus:ring-2 focus:ring-[#6A39B1] focus:border-transparent transition duration-300 bg-white bg-opacity-90"
                      placeholder="your@email.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="contactMessage" className="block text-sm font-bold mb-2" style={{ color: 'white' }}>
                      Message
                    </label>
                    <textarea
                      id="contactMessage"
                      rows="5"
                      className="shadow appearance-none border border-white border-opacity-30 rounded-lg w-full py-3 px-4 text-black leading-tight focus:outline-none focus:ring-2 focus:ring-[#6A39B1] focus:border-transparent transition duration-300 bg-white bg-opacity-90 resize-none"
                      placeholder="Your message here..."
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-white text-[#6A39B1] font-bold rounded-full shadow-lg hover:shadow-2xl transition duration-300 transform hover:scale-105 w-full hover:bg-gradient-to-r hover:from-white hover:to-purple-100"
                  >
                    ✉️ Send Message
                  </button>
                </form>
              </div>
            </section>
          </>
        ) : (
          // Auth Form overlay
          <div className="w-full max-w-md mx-auto">
            <AuthForm onAuthSuccess={onAuthSuccess} />
            <button
              onClick={() => setShowAuthForm(false)}
              className="mt-4 w-full bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-400 transition duration-300"
            >
              Back to Sections
            </button>
          </div>
        )}
      </main>

      {/* Footer - Always visible at the bottom of the entire content */}
      {!showAuthForm && (
        <footer className="relative w-full text-white text-center mt-auto">
          {/* SVG Top Wave */}
          <div className="w-full overflow-hidden leading-none">
            <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="w-full h-28">
              <path
                d="M0,50 C180,10 360,90 540,50 C720,10 900,90 1080,50 C1260,10 1440,50 1440,50 L1440,100 L0,100 Z"
                fill="var(--accent)"
              />
            </svg>
          </div>

          {/* Footer Content */}
          <div className="py-6 px-4 flex justify-between items-center" style={{ backgroundColor: 'var(--accent)' }}>
            {/* Left content */}
            <div className="text-white text-sm">
              <p>Designed by </p>
            </div>

            {/* Right content - Social Media Icons */}
            <div className="flex space-x-4 text-xl">
              <a href="#" className="text-white hover:text-gray-300 transition duration-300">
                <span role="img" aria-label="Facebook"><p>📘</p></span>
              </a>
              <a href="#" className="text-white hover:text-gray-300 transition duration-300">
                <span role="img" aria-label="Twitter">🐦</span>
              </a>
              <a href="#" className="text-white hover:text-gray-300 transition duration-300">
                <span role="img" aria-label="Google Plus">➕</span>
              </a>
              <a href="#" className="text-white hover:text-gray-300 transition duration-300">
                <span role="img" aria-label="RSS">📡</span>
              </a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default LandingPage;
