import Image from 'next/image';
import { Target, TrendingUp, Users, Award, Briefcase, Microscope, Leaf } from 'lucide-react';
import { supabase } from '@/lib/supabase';

async function getStats() {
    try {
        const [jobsResult, postsResult, startupsResult] = await Promise.all([
            supabase.from('jobs').select('id', { count: 'exact', head: true }),
            supabase.from('posts').select('id', { count: 'exact', head: true }),
            supabase.from('startups').select('id', { count: 'exact', head: true })
        ]);

        return {
            jobs: jobsResult.count || 5, // fallback to mock count
            posts: postsResult.count || 25,
            startups: startupsResult.count || 4
        };
    } catch {
        return {
            jobs: 5,
            posts: 25,
            startups: 4
        };
    }
}

export default async function AboutPage() {
    const stats = await getStats();
    return (
        <div className="bg-white min-h-screen pb-20">

            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-stone-900">
                    {/* Abstract background or image */}
                    <div className="absolute inset-0 opacity-40">
                        <Image
                            src="https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&q=80"
                            alt="Background"
                            fill
                            priority
                            sizes="100vw"
                            className="object-cover"
                        />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900 to-transparent" />
                </div>

                <div className="relative z-10 text-center max-w-4xl px-4">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <span className="bg-agri-green/20 border border-agri-green text-agri-green px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                            Our Mission
                        </span>
                    </div>
                    <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                        Cultivating the Future of Agriculture
                    </h1>
                    <p className="text-xl text-stone-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Agri Updates is the premier digital ecosystem connecting agricultural researchers, innovators, and professionals with the opportunities that shape our food systems.
                    </p>
                    <button className="bg-agri-green text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-agri-dark transition-all rounded shadow-lg transform hover:-translate-y-1">
                        Join Our Mission
                    </button>
                </div>
            </section>

            {/* Stats Divider */}
            <div className="container mx-auto px-4 -mt-16 relative z-20">
                <div className="bg-white shadow-xl rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center border border-stone-100">
                    <div>
                        <div className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-2">Jobs Posted</div>
                        <div className="text-4xl font-serif font-bold text-agri-green">{stats.jobs}+</div>
                    </div>
                    <div>
                        <div className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-2">Startups</div>
                        <div className="text-4xl font-serif font-bold text-agri-green">{stats.startups}+</div>
                    </div>
                    <div>
                        <div className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-2">Articles</div>
                        <div className="text-4xl font-serif font-bold text-agri-green">{stats.posts}+</div>
                    </div>
                    <div>
                        <div className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-2">Community</div>
                        <div className="text-4xl font-serif font-bold text-agri-green">2.5k+</div>
                    </div>
                </div>
            </div>

            {/* Mission & Values */}
            <section className="container mx-auto px-4 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    <div className="lg:col-span-4">
                        <h2 className="font-serif text-4xl font-bold mb-6">Our Mission & Values</h2>
                        <p className="text-stone-500 leading-relaxed mb-8">
                            We exist to democratize access to research, internships, and careers in the agricultural sector. We believe that by connecting the right people with the right opportunities, we can accelerate innovation in farming and food systems.
                        </p>
                        <div className="bg-stone-50 p-6 border-l-4 border-agri-green">
                            <p className="font-serif italic text-lg text-stone-700">
                                "We aim to be the digital soil where the seeds of agricultural innovation take root—providing the nutrients of knowledge and connection."
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-8 flex flex-col gap-6">
                        {/* Card 1 */}
                        <div className="bg-white border border-stone-100 p-8 rounded-xl shadow-sm flex items-start gap-6 hover:shadow-md transition-shadow">
                            <div className="bg-green-50 p-4 rounded-full text-agri-green">
                                <TrendingUp className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="font-serif text-xl font-bold mb-2">Growth</h3>
                                <p className="text-sm text-stone-500 leading-relaxed">
                                    Fostering constant learning and professional development for every member.
                                </p>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white border border-stone-100 p-8 rounded-xl shadow-sm flex items-start gap-6 hover:shadow-md transition-shadow">
                            <div className="bg-green-50 p-4 rounded-full text-agri-green">
                                <Microscope className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="font-serif text-xl font-bold mb-2">Insight</h3>
                                <p className="text-sm text-stone-500 leading-relaxed">
                                    Delivering accurate, timely data to help professionals make informed decisions.
                                </p>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white border border-stone-100 p-8 rounded-xl shadow-sm flex items-start gap-6 hover:shadow-md transition-shadow">
                            <div className="bg-green-50 p-4 rounded-full text-agri-green">
                                <Users className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="font-serif text-xl font-bold mb-2">Community</h3>
                                <p className="text-sm text-stone-500 leading-relaxed">
                                    Supporting a thriving ecosystem of startups, students, and researchers working towards a sustainable future.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Timeline Section */}
            <section className="bg-stone-50 py-24">
                <div className="container mx-auto px-4 text-center mb-16">
                    <h2 className="font-serif text-4xl font-bold mb-4">Our Journey</h2>
                    <p className="text-stone-500">From a trusted news source to a career ecosystem.</p>
                </div>

                <div className="max-w-3xl mx-auto px-4 relative">
                    {/* Vertical Line */}
                    <div className="absolute left-10 md:left-1/2 top-0 bottom-0 w-px bg-stone-300 md:-ml-px"></div>

                    {/* Item 1 */}
                    <div className="relative mb-12 md:mb-20">
                        <div className="md:flex items-center justify-between w-full">
                            <div className="order-1 md:w-5/12 text-left md:text-right pl-20 md:pl-0 md:pr-12">
                                <span className="bg-green-100 text-agri-dark text-[10px] font-bold px-2 py-1 rounded mb-2 inline-block">2021</span>
                                <h3 className="font-serif text-xl font-bold mb-2">Founded as a Blog</h3>
                                <p className="text-xs text-stone-500">Started sharing daily updates on the Agritech landscape and research breakthroughs.</p>
                            </div>
                            <div className="absolute left-0 md:left-1/2 top-0 bg-white border-4 border-green-100 w-10 h-10 rounded-full flex items-center justify-center text-agri-green z-10 md:-ml-5">
                                <Leaf className="w-4 h-4" />
                            </div>
                            <div className="order-2 md:w-5/12"></div>
                        </div>
                    </div>

                    {/* Item 2 */}
                    <div className="relative mb-12 md:mb-20">
                        <div className="md:flex items-center justify-between w-full">
                            <div className="order-1 md:w-5/12"></div>
                            <div className="absolute left-0 md:left-1/2 top-0 bg-white border-4 border-green-100 w-10 h-10 rounded-full flex items-center justify-center text-agri-green z-10 md:-ml-5">
                                <Users className="w-4 h-4" />
                            </div>
                            <div className="order-2 md:w-5/12 text-left pl-20 md:pl-12">
                                <span className="bg-green-100 text-agri-dark text-[10px] font-bold px-2 py-1 rounded mb-2 inline-block">2023</span>
                                <h3 className="font-serif text-xl font-bold mb-2">First 10,000 Subscribers</h3>
                                <p className="text-xs text-stone-500">Our newsletter community grew rapidly as researchers sought reliable news sources.</p>
                            </div>
                        </div>
                    </div>

                    {/* Item 3 */}
                    <div className="relative mb-12 md:mb-20">
                        <div className="md:flex items-center justify-between w-full">
                            <div className="order-1 md:w-5/12 text-left md:text-right pl-20 md:pl-0 md:pr-12">
                                <span className="bg-green-100 text-agri-dark text-[10px] font-bold px-2 py-1 rounded mb-2 inline-block">2024</span>
                                <h3 className="font-serif text-xl font-bold mb-2">Launched Career Platform</h3>
                                <p className="text-xs text-stone-500">Expanded from news to a dedicated job and internship portal for the agricultural sector.</p>
                            </div>
                            <div className="absolute left-0 md:left-1/2 top-0 bg-white border-4 border-green-100 w-10 h-10 rounded-full flex items-center justify-center text-agri-green z-10 md:-ml-5">
                                <Briefcase className="w-4 h-4" />
                            </div>
                            <div className="order-2 md:w-5/12"></div>
                        </div>
                    </div>

                    {/* Item 4 */}
                    <div className="relative">
                        <div className="md:flex items-center justify-between w-full">
                            <div className="order-1 md:w-5/12"></div>
                            <div className="absolute left-0 md:left-1/2 top-0 bg-white border-4 border-green-100 w-10 h-10 rounded-full flex items-center justify-center text-agri-green z-10 md:-ml-5">
                                <Award className="w-4 h-4" />
                            </div>
                            <div className="order-2 md:w-5/12 text-left pl-20 md:pl-12">
                                <span className="bg-green-100 text-agri-dark text-[10px] font-bold px-2 py-1 rounded mb-2 inline-block">2026</span>
                                <h3 className="font-serif text-xl font-bold mb-2">Partnered with Top Firms</h3>
                                <p className="text-xs text-stone-500">Collaborating with industry leaders to shape the workforce of tomorrow.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Leadership & Advisors */}
            <section className="container mx-auto px-4 py-24 border-t border-stone-100">
                <div className="text-center mb-16">
                    <h2 className="font-serif text-4xl font-bold mb-4">Curated by Experts</h2>
                    <p className="text-stone-500 max-w-2xl mx-auto">Agri Updates is led by a dedicated team of researchers and industry veterans committed to bridging the gap between talent and opportunity.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                    <div className="text-center group">
                        <div className="w-32 h-32 bg-stone-100 rounded-full mx-auto mb-6 flex items-center justify-center border-2 border-stone-50 group-hover:border-agri-green transition-colors">
                            <span className="font-serif text-3xl text-stone-400">AS</span>
                        </div>
                        <h3 className="font-serif text-xl font-bold mb-1">Dr. Aryaman Singh</h3>
                        <p className="text-xs text-agri-green font-bold uppercase tracking-widest mb-4">Editor-in-Chief</p>
                        <p className="text-sm text-stone-500 leading-relaxed">Former Senior Scientist at IARI. Passionate about connecting young agronomists with global research hubs.</p>
                    </div>

                    <div className="text-center group">
                        <div className="w-32 h-32 bg-stone-100 rounded-full mx-auto mb-6 flex items-center justify-center border-2 border-stone-50 group-hover:border-agri-green transition-colors">
                            <span className="font-serif text-3xl text-stone-400">JP</span>
                        </div>
                        <h3 className="font-serif text-xl font-bold mb-1">Jyoti Patel</h3>
                        <p className="text-xs text-agri-green font-bold uppercase tracking-widest mb-4">Head of Partnerships</p>
                        <p className="text-sm text-stone-500 leading-relaxed">MBA in Agribusiness. previously worked with leading Agritech startups to scale operations across India.</p>
                    </div>

                    <div className="text-center group">
                        <div className="w-32 h-32 bg-stone-100 rounded-full mx-auto mb-6 flex items-center justify-center border-2 border-stone-50 group-hover:border-agri-green transition-colors">
                            <span className="font-serif text-3xl text-stone-400">RK</span>
                        </div>
                        <h3 className="font-serif text-xl font-bold mb-1">Rahul Kumar</h3>
                        <p className="text-xs text-agri-green font-bold uppercase tracking-widest mb-4">Tech Lead</p>
                        <p className="text-sm text-stone-500 leading-relaxed">Building the digital infrastructure to make agricultural data accessible to every student in India.</p>
                    </div>
                </div>
            </section>

            {/* Team CTA */}
            <section className="container mx-auto px-4 py-24 text-center">
                <div className="bg-stone-900 text-white rounded-3xl p-12 md:p-20 relative overflow-hidden">
                    {/* Decorative Background Circles */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-agri-green/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-agri-green/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6">Ready to grow your career?</h2>
                        <p className="text-stone-400 mb-10 text-lg">Join thousands of researchers and professionals finding their next big opportunity on Agri Updates.</p>
                        <div className="flex justify-center gap-4">
                            <button className="bg-agri-green text-white px-8 py-3 font-bold uppercase tracking-widest hover:bg-agri-dark transition-all rounded">
                                Browse Jobs
                            </button>
                            <button className="bg-transparent border border-stone-600 text-white px-8 py-3 font-bold uppercase tracking-widest hover:bg-stone-800 transition-all rounded">
                                Partner with Us
                            </button>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}
