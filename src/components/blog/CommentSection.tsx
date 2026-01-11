
import CommentList from './CommentList';

interface CommentSectionProps {
    postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
    return (
        <section className="bg-stone-50 border-t border-stone-200 py-16">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto">
                    <h2 className="font-serif text-3xl font-bold mb-2">Discussion</h2>
                    <p className="text-stone-600 mb-8">Join the conversation and share your insights.</p>

                    <CommentList postId={postId} />
                </div>
            </div>
        </section>
    );
}
