import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export const Contact2 = ({
  title = 'Contact Us',
  description = 'We are available for questions, feedback, or collaboration opportunities. Let us know how we can help!',
  phone = '(123) 34567890',
  email = 'email@example.com',
  web = { label: 'vibetribe.com', url: 'https://vibetribe.com' },
  onSubmit = () => {},
}) => {
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ firstName: '', lastName: '', email: '', subject: '', message: '' });
  };

  return (
    <section className="py-32" style={{
      background: 'linear-gradient(135deg, #E0B8F0 0%, #D6CCF1 25%, #A970FF 50%, #8B4DEB 75%, #6A39B1 100%)',
    }}>
      <div className="container mx-auto px-4">
        <div className="mx-auto flex max-w-screen-xl flex-col justify-between gap-10 lg:flex-row lg:gap-20">
          {/* Left Column - Contact Details */}
          <div className="mx-auto flex max-w-sm flex-col justify-between gap-10">
            <div className="text-center lg:text-left">
              <h1 className="mb-2 text-5xl font-semibold lg:mb-1 lg:text-6xl text-white">
                {title}
              </h1>
              <p className="text-white text-lg">{description}</p>
            </div>
            <div className="mx-auto w-fit lg:mx-0">
              <h3 className="mb-6 text-center text-2xl font-semibold lg:text-left text-white">
                Contact Details
              </h3>
              <ul className="ml-4 list-disc space-y-3 text-white">
                <li className="text-lg">
                  <span className="font-bold">Phone: </span>
                  {phone}
                </li>
                <li className="text-lg">
                  <span className="font-bold">Email: </span>
                  <a href={`mailto:${email}`} className="underline hover:text-gray-200 transition">
                    {email}
                  </a>
                </li>
                <li className="text-lg">
                  <span className="font-bold">Web: </span>
                  <a href={web.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-200 transition">
                    {web.label}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="mx-auto flex max-w-screen-md flex-col gap-6 rounded-lg bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex gap-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="firstName" className="text-white">First Name</Label>
                  <Input 
                    type="text" 
                    id="firstName" 
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="bg-white bg-opacity-90"
                  />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="lastName" className="text-white">Last Name</Label>
                  <Input 
                    type="text" 
                    id="lastName" 
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="bg-white bg-opacity-90"
                  />
                </div>
              </div>

              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input 
                  type="email" 
                  id="email" 
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-white bg-opacity-90"
                />
              </div>

              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="subject" className="text-white">Subject</Label>
                <Input 
                  type="text" 
                  id="subject" 
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="bg-white bg-opacity-90"
                />
              </div>

              <div className="grid w-full gap-1.5">
                <Label htmlFor="message" className="text-white">Message</Label>
                <Textarea 
                  placeholder="Type your message here." 
                  id="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="bg-white bg-opacity-90"
                />
              </div>

              <Button className="w-full" variant="default">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
