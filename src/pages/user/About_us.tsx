import React, { useState } from 'react';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';

const AboutPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await authService.contactUsSubmission(formData);
            toast.success(response.message);
            setFormData({ name: '', email: '', message: '' });
        } catch (err: any) {
            // Handle error appropriately, maybe toast.error
            toast.error(err.message || "Failed to submit form.");
        }
    };

    const TeamMemberCard: React.FC<{ imageSrc: string; name: string; title: string }> = ({ imageSrc, name, title }) => (
        <div className="flex flex-col items-center text-center p-4">
            <img
                src={imageSrc}
                alt={name}
                className="w-32 h-32 rounded-full object-cover mb-4 shadow-lg border-4 border-white dark:border-gray-700"
            />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{name}</h3>
            <p className="text-gray-600 dark:text-gray-400">{title}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col transition-colors duration-300">

            <main className="flex-grow container mx-auto px-4 py-8">

                {/* About Us Section */}
                <section className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md mb-8 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">About Us</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </p>
                </section>

                {/* Team Section */}
                <section className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md mb-8 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">Our Team</h2>
                    <div className="flex flex-wrap justify-center gap-8">
                        <TeamMemberCard imageSrc="https://tse1.mm.bing.net/th/id/OIP.z0z7nPbkdQd1fr66zUIAtAAAAA?pid=Api&P=0&h=180" name="Sarah Miller" title="CEO" />
                        <TeamMemberCard imageSrc="https://media.istockphoto.com/id/530838837/vector/businessman-profile-icon-male-portrait-flat.jpg?s=612x612&w=0&k=20&c=CLFTKBzjlVMAjcuCScxFEb4Z7HvhS4CKB25c4-Cs1ps=" name="David Chen" title="CTO" />
                        <TeamMemberCard imageSrc="https://media.istockphoto.com/id/530838795/vector/businessman-profile-icon-male-portrait-flat.jpg?s=612x612&w=0&k=20&c=KmotqUnrA2LUBFIV8u7F8-DRY6ahfGa1_wBRmscjGbM=" name="Emily Rodriguez" title="Head of Operations" />
                    </div>
                </section>

                {/* Contact Us Section */}
                <section className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md mb-8 max-w-2xl mx-auto border border-gray-200 dark:border-gray-700">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Contact Us</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                                Your Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                placeholder="Enter your name"
                                value={formData.name}
                                onChange={handleChange}
                                className="shadow-sm border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                                Your Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                className="shadow-sm border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="message" className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                                Message
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                placeholder="Enter your message"
                                value={formData.message}
                                onChange={handleChange}
                                rows={5}
                                className="shadow-sm border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y transition-colors"
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                        >
                            Submit
                        </button>
                    </form>

                    <div className="mt-8 text-gray-700 dark:text-gray-300">
                        <p className="mb-2">
                            <span className="font-semibold text-gray-900 dark:text-white">Email:</span> myemail@quickmaker.com
                        </p>
                        <p className="mb-2">
                            <span className="font-semibold text-gray-900 dark:text-white">Phone:</span> (555) 123-4567
                        </p>
                        <p>
                            <span className="font-semibold text-gray-900 dark:text-white">Address:</span> 123 Main Street, Anytown, Anydistrict
                        </p>
                    </div>
                </section>
            </main>

        </div>
    );
};

export default AboutPage;