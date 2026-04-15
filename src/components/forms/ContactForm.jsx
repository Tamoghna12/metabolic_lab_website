import { useState } from 'preact/hooks';

export default function ContactForm() {
    const [status, setStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus('');

        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStatus('success');
        setIsLoading(false);
        e.target.reset();
    };

    return (
        <section id="contact" class="py-16 bg-white/40">
            <div class="max-container">
                <div class="section-header">
                    <span class="section-eyebrow">Connect</span>
                    <h2 class="section-title">Get in Touch</h2>
                    <p class="section-subtitle">Interested in collaboration or joining our lab? Send us a message.</p>
                </div>

                <div class="contact-grid grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div class="contact-info">
                        <div class="info-card card-surface p-8">
                            <h3 class="text-xl font-bold mb-6">Contact Information</h3>
                            <div class="space-y-4">
                                <div class="flex items-center gap-4">
                                    <span class="text-2xl">📍</span>
                                    <div>
                                        <p class="font-bold">Location</p>
                                        <p class="text-gray-600">Loughborough University, UK</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-4">
                                    <span class="text-2xl">📧</span>
                                    <div>
                                        <p class="font-bold">Email</p>
                                        <a href="mailto:a.islam@lboro.ac.uk" class="text-primary hover:underline">a.islam@lboro.ac.uk</a>
                                    </div>
                                </div>
                                <div class="flex items-center gap-4">
                                    <span class="text-2xl">🌐</span>
                                    <div>
                                        <p class="font-bold">Department</p>
                                        <p class="text-gray-600">Chemical Engineering</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="contact-form-container">
                        <form onSubmit={handleSubmit} class="card-surface p-8">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div class="form-group">
                                    <label for="name">Name</label>
                                    <input type="text" id="name" name="name" placeholder="Your Name" required />
                                </div>
                                <div class="form-group">
                                    <label for="email">Email</label>
                                    <input type="email" id="email" name="email" placeholder="Your Email" required />
                                </div>
                            </div>
                            <div class="form-group mb-4">
                                <label for="subject">Subject</label>
                                <select id="subject" name="subject" required>
                                    <option value="">Select a subject</option>
                                    <option value="collaboration">Research Collaboration</option>
                                    <option value="phd">PhD Opportunity</option>
                                    <option value="postdoc">Postdoctoral Positions</option>
                                    <option value="other">General Inquiry</option>
                                </select>
                            </div>
                            <div class="form-group mb-6">
                                <label for="message">Message</label>
                                <textarea id="message" name="message" rows="5" placeholder="How can we help you?" required></textarea>
                            </div>

                            {status === 'success' && (
                                <div class="alert success mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
                                    Thank you! Your message has been sent successfully.
                                </div>
                            )}

                            <button type="submit" class="pill-button w-full" disabled={isLoading}>
                                {isLoading ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}
