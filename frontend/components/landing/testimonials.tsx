import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Cafe Owner, The Daily Grind",
    content: "Lichi POS has completely transformed how we run our cafe. The interface is so intuitive that our staff learned it in minutes.",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "Restaurant Manager, Bistro 42",
    content: "The reporting features alone have saved us hours of work each week. Highly recommend to any food business owner.",
    rating: 5
  },
  {
    name: "Emily Rodriguez",
    role: "Bakery Owner, Sweet Delights",
    content: "Switching to Lichi was the best decision we made. The customer support is exceptional and the system just works.",
    rating: 5
  }
];

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex">
    {[...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ))}
  </div>
);

export function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Loved by Businesses Like Yours
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Don't just take our word for it. Here's what our customers say.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 p-8 rounded-xl">
              <StarRating rating={testimonial.rating} />
              <p className="mt-4 text-gray-600 italic">"{testimonial.content}"</p>
              <div className="mt-6">
                <p className="font-medium text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
