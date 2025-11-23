export default function Custom404() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            {/* 404 Illustration Container */}
            <div className="relative mb-8">
            <img 
                src="/assets/404-error-img.webp" 
                alt="404 Error Illustration" 
                className="w-full max-w-2xl h-auto"
            />
            </div>
    
            {/* Error Message */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Oops! the page not found.
            </h1>
            
            <p className="text-gray-500 text-base md:text-lg mb-8 max-w-md text-center">
            Or simply leverage the expertise of our consultation team.
            </p>
    
            {/* Go Home Button */}
            <a
            href="/User/Home"
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md"
            >
            Go Home
            </a>
        </div>
        );
    }