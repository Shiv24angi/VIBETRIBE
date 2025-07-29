import React, { useState, useRef } from 'react';

// Placeholder for AuthForm if it's not provided in the same file
const AuthForm = ({ onAuthSuccess }) => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you'd handle authentication here (Firebase, etc.)
    console.log(`Attempting to ${isSignIn ? 'sign in' : 'sign up'} with:`, { email, password });
    // Simulate success
    if (onAuthSuccess) {
      onAuthSuccess();
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md mx-auto text-gray-800">
      <h3 className="text-3xl font-bold text-center text-[#2A1E5C] mb-6">
        {isSignIn ? 'Sign In' : 'Sign Up'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="bg-[#A970FF] hover:bg-[#8B4DEB] text-white font-bold py-2 px-4 rounded-full w-full transition duration-300"
        >
          {isSignIn ? 'Sign In' : 'Sign Up'}
        </button>
      </form>
      <p className="text-center text-sm mt-4">
        {isSignIn ? "Don't have an account?" : "Already have an account?"}{' '}
        <button
          type="button"
          onClick={() => setIsSignIn(!isSignIn)}
          className="text-[#A970FF] hover:text-[#8B4DEB] font-bold"
        >
          {isSignIn ? 'Sign Up' : 'Sign In'}
        </button>
      </p>
    </div>
  );
};


const LandingPage = ({ onAuthSuccess }) => {
  const [showAuthForm, setShowAuthForm] = useState(false);
  const welcomeRef = useRef(null); // Ref for the welcome section
  const aboutRef = useRef(null);
  const contactRef = useRef(null);

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

  return (
    <div
      className="min-h-screen flex flex-col font-inter"
      style={{
        background: 'linear-gradient(135deg, #1e215d 0%, #2c2f78 30%, #463c97 60%, #8c59c6 80%, #db7dc9 100%)',
      }}
    >
      {/* Header - Always visible and fixed */}
      <header className="w-full bg-white bg-opacity-90 shadow-md py-4 px-8 flex justify-between items-center fixed top-0 left-0 z-50">
        <h1 className="text-3xl font-extrabold text-[#2A1E5C]">VibeTribe</h1>
        <nav className="flex items-center space-x-6">
          <button
            onClick={() => scrollToSection(welcomeRef)}
            className="text-gray-700 hover:text-[#A970FF] font-semibold transition duration-300"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection(aboutRef)}
            className="text-gray-700 hover:text-[#A970FF] font-semibold transition duration-300"
          >
            About
          </button>
          <button
            onClick={() => scrollToSection(contactRef)}
            className="text-gray-700 hover:text-[#A970FF] font-semibold transition duration-300"
          >
            Contact Us
          </button>
          <button
            onClick={() => setShowAuthForm(true)}
            className="px-6 py-2 bg-[#A970FF] text-white font-bold rounded-full shadow-lg hover:bg-[#8B4DEB] transition duration-300 transform hover:scale-105"
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
            <section ref={welcomeRef} className="text-center text-white mb-20 max-w-4xl mx-auto min-h-screen"> {/* Changed to min-h-screen */}
              <div className="flex flex-col items-center justify-center h-full">
                <h2 className="text-6xl font-extrabold leading-tight mb-4 drop-shadow-lg text-[#F3EBFF]">
                  Discover Your Tribe
                </h2>
                <p className="text-2xl font-light max-w-2xl mx-auto drop-shadow-md text-[#F3EBFF] mb-6">
                  Connect with like-minded people who match your vibe. Whether you're quirky, calm,
                  creative, or chaotic — there’s a tribe for everyone.
                </p>
                <button
                  onClick={() => setShowAuthForm(true)}
                  className="px-8 py-3 bg-[#A970FF] text-white font-semibold rounded-full shadow-md hover:bg-[#8B4DEB] transition duration-300 transform hover:scale-105"
                >
                  Get Started
                </button>
              </div>
            </section>

            {/* About Section */}
            <section
              ref={aboutRef}
              className="bg-white bg-opacity-20 p-10 rounded-xl shadow-lg w-full max-w-4xl mx-auto mb-20 text-white min-h-screen" // Changed to min-h-screen
            >
              <div className="flex flex-col items-center justify-center h-full">
                <h3 className="text-4xl font-bold text-center text-[#F3EBFF] mb-6">About VibeTribe</h3>
                <p className="text-lg leading-relaxed mb-4">
                  VibeTribe helps you discover meaningful connections through:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-lg">
                  <li>A playful and friendly profile creation experience</li>
                  <li>Matching based on personality, hobbies, and lifestyle</li>
                  <li>Community-first approach with real people</li>
                </ul>
                <p className="text-lg leading-relaxed mt-4">
                  Whether you’re into poetry, parkour, painting, or just peace — we’ll help you vibe with the right people.
                </p>
              </div>
            </section>

            {/* Contact Section (Form) */}
            <section
              ref={contactRef}
              className="bg-white bg-opacity-20 p-10 rounded-xl shadow-lg w-full max-w-4xl mx-auto mb-20 text-white min-h-screen" // Changed to min-h-screen
            >
              <div className="flex flex-col items-center justify-center h-full">
                <h3 className="text-4xl font-bold text-center text-[#F3EBFF] mb-6">Contact Us</h3>
                <p className="text-lg leading-relaxed text-center mb-4">
                  Got feedback or ideas? We'd love to hear from you!
                </p>
                <form onSubmit={handleContactSubmit} className="w-full max-w-md space-y-4">
                  <div>
                    <label htmlFor="contactName" className="block text-white text-sm font-bold mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      id="contactName"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="contactEmail" className="block text-white text-sm font-bold mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="contactMessage" className="block text-white text-sm font-bold mb-2">
                      Message
                    </label>
                    <textarea
                      id="contactMessage"
                      rows="5"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-[#A970FF] text-white font-semibold rounded-full shadow-md hover:bg-[#8B4DEB] transition duration-300 transform hover:scale-105 w-full"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </section>
          </>
        ) : (
          // Auth Form (still an overlay/separate view)
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
                fill="#8c59c6"
              />
            </svg>
          </div>

          {/* Footer Content */}
          <div className="py-6 px-4 flex justify-between items-center" style={{ backgroundColor: '#8c59c6' }}>
            {/* Left content */}
            <div className="text-white text-sm">
              <p>Designed by Elegant Themes | Powered by WordPress</p>
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
