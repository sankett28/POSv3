export function ThemePreview() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Beautiful, Modern Design
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            A clean and intuitive interface that your staff will love to use
          </p>
        </div>
        
        <div className="bg-white p-2 rounded-xl shadow-xl max-w-5xl mx-auto">
          <div className="relative aspect-video bg-gradient-to-br from-warm-cream to-coffee-brown/10 rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8">
                <h3 className="text-2xl font-bold text-coffee-brown mb-4">Lichi POS Dashboard</h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Experience the power of our intuitive dashboard that gives you complete control over your business.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
