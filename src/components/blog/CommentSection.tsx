
import CommentList from './CommentList';

interface CommentSectionProps {
    postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
    return (
        <section className="bg-stone-50 border-t border-stone-200 py-16">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto">
                    <details className="group cursor-pointer">
                        <summary className="font-serif text-3xl font-bold list-none flex justify-between items-center outline-none">
                            Discussion
                            <span className="text-sm font-sans font-medium uppercase tracking-widest text-stone-500 flex items-center gap-2 group-open:opacity-0 transition-opacity">
                                View Comments <svg className="w-5 h-5 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </span>
                        </summary>
                        <div className="pt-8 mt-6 border-t border-stone-200">
                            <p className="text-stone-600 mb-8">Join the conversation and share your insights.</p>
                            <CommentList postId={postId} />
                        </div>
                    </details>
                </div>
            </div>
        </section>
    );
}
