import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Thank You for Your Support!
          </h1>

          <p className="text-gray-600 mb-6">
            Your sponsorship helps keep Studorama free and accessible for everyone. We truly appreciate your contribution to the mission of making quality education available to all.
          </p>

          <div className="space-y-3">
            <Link
              to="/"
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center"
            >
              <Home className="w-5 h-5 mr-2" />
              Continue Learning
            </Link>

            <Link
              to="/pricing"
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              Back to Sponsorship
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Questions? Contact us at{' '}
            <a href="mailto:support@studorama.com" className="text-orange-600 hover:text-orange-700">
              support@studorama.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}