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
      className="min-h-screen flex flex-col font-inter"
      style={{
        background: 'linear-gradient(135deg, #E0B8F0 0%, #D6CCF1 25%, #A970FF 50%, #8B4DEB 75%, #6A39B1 100%)',
      }}
    >
      {/* Header - Always visible and fixed */}
      <header className="w-full bg-[var(--panel)] bg-opacity-95 shadow-md py-4 px-8 flex justify-between items-center fixed top-0 left-0 z-50">
        <h1 className="text-3xl font-extrabold text-[var(--text-strong)]">VibeTribe</h1>
        <nav className="flex items-center space-x-6">
          <button
            onClick={() => scrollToSection(welcomeRef)}
            className="text-[var(--text-muted)] hover:text-[var(--accent)] font-semibold transition duration-300"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection(aboutRef)}
            className="text-[var(--text-muted)] hover:text-[var(--accent)] font-semibold transition duration-300"
          >
            About
          </button>
          <button
            onClick={() => scrollToSection(contactRef)}
            className="text-[var(--text-muted)] hover:text-[var(--accent)] font-semibold transition duration-300"
          >
            Contact Us
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
                <h2 className="text-6xl font-extrabold leading-tight mb-4 drop-shadow-lg " style={{ color: '#6A39B1' }}>

                  Discover Your Tribe
                </h2>
                <p className="text-2xl font-light max-w-2xl mx-auto drop-shadow-md mb-6" style={{ color: '#6A39B1' }}>
                  Connect with like-minded people who match your vibe. Whether you're quirky, calm,
                  creative, or chaotic — there’s a tribe for everyone.
                </p>
                <button
                  onClick={() => setShowAuthForm(true)}
                  className="px-8 py-3 bg-white text-[var(--accent)] font-semibold rounded-full shadow-md hover:bg-[var(--muted-1)] transition duration-300 transform hover:scale-105"
                >
                  Get Started
                </button>
              </div>
            </section>

            {/* About Section */}
            <section
              ref={aboutRef}
              className="bg-[var(--panel)] bg-opacity-15 p-10 rounded-xl shadow-lg w-full max-w-4xl mx-auto mb-20 text-white"
              style={{ minHeight: `calc(100vh - ${headerHeight}px)` }} // Adjust min-height for header
            >
              <div className="flex flex-col items-center justify-center h-full">
                <br></br>
                <br></br>
                <br></br>
                <br></br>
                <br></br>
                <h3 className="text-4xl font-bold text-center mb-6" style={{ color: '#6A39B1' }}>About VibeTribe</h3>
                <p className="text-lg leading-relaxed mb-4" style={{ color: '#6A39B1' }}>
                  VibeTribe helps you discover meaningful connections through:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-lg" style={{ color: '#6A39B1' }}>
                  <li>A playful and friendly profile creation experience</li>
                  <li>Matching based on personality, hobbies, and lifestyle</li>
                  <li>Community-first approach with real people</li>
                </ul>
                <p className="text-lg leading-relaxed mt-4" style={{ color: '#6A39B1' }}>
                  Whether you’re into poetry, parkour, painting, or just peace — we’ll help you vibe with the right people.
                </p>
              </div>
            </section>

            {/* Contact Section (Form) */}
            <section
              ref={contactRef}
              className="bg-[var(--panel)] bg-opacity-15 p-10 rounded-xl shadow-lg w-full max-w-4xl mx-auto mb-20 text-white"
              style={{ minHeight: `calc(100vh - ${headerHeight}px)` }} // Adjust min-height for header
            >
              <div className="flex flex-col items-center justify-center h-full">
                <h3 className="text-4xl font-bold text-center mb-6" style={{ color: '#6A39B1' }}>Contact Us</h3>
                <p className="text-lg leading-relaxed text-center mb-4" style={{ color: '#6A39B1' }}>
                  Got feedback or ideas? We'd love to hear from you!
                </p>
                <form onSubmit={handleContactSubmit} className="w-full max-w-md space-y-4">
                  <div>
                    <label htmlFor="contactName" className="block text-sm font-bold mb-2" style={{ color: '#6A39B1' }}>
                      Name
                    </label>
                    <input
                      type="text"
                      id="contactName"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-bold mb-2" style={{ color: '#6A39B1' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="contactMessage" className="block text-sm font-bold mb-2" style={{ color: '#6A39B1' }}>
                      Message
                    </label>
                    <textarea
                      id="contactMessage"
                      rows="5"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-white text-[var(--accent)] font-semibold rounded-full shadow-md hover:bg-[var(--muted-1)] transition duration-300 transform hover:scale-105 w-full"
                  >
                    Send Message
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
                <span role="img" aria-label="Facebook">📘</span>
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
