import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - TimeCapsule',
  description: 'Terms of Service and usage conditions for TimeCapsule - Send messages to your future self.',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Terms of Service
          </h1>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                By accessing and using TimeCapsule, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                2. Service Description
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                TimeCapsule is a web application that allows users to create and schedule messages to be delivered to themselves at a future date. 
                The service provides both free and premium tiers with different message limits.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                3. User Responsibilities
              </h2>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>You are responsible for maintaining the confidentiality of your account</li>
                <li>You agree not to use the service for any unlawful purposes</li>
                <li>You will not create messages containing harmful, offensive, or illegal content</li>
                <li>You understand that messages are stored securely but should not contain sensitive personal information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                4. Privacy and Data Protection
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We take your privacy seriously. Your messages are encrypted and stored securely. We do not read, share, or sell your personal messages. 
                For detailed information about how we handle your data, please refer to our Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Service Limitations
              </h2>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Free accounts are limited to 10 messages</li>
                <li>Messages can only be scheduled for future delivery (minimum 24 hours)</li>
                <li>We reserve the right to modify or discontinue the service with notice</li>
                <li>Service availability is not guaranteed 100% of the time</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                6. Payment Terms
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Premium subscriptions are processed through Stripe. All payments are final and non-refundable unless required by law. 
                Premium features include unlimited message creation and priority support.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                7. Limitation of Liability
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                TimeCapsule is provided "as is" without warranties of any kind. We are not liable for any damages arising from the use of our service, 
                including but not limited to lost messages, service interruptions, or data loss.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                8. Termination
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We may terminate or suspend your account at any time for violations of these terms. 
                You may delete your account at any time through your user profile.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                9. Contact Information
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-blue-600 dark:text-blue-400 font-medium">
                <a href="mailto:nacer.msi1@gmail.com" className="hover:underline">
                  nacer.msi1@gmail.com
                </a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                10. Changes to Terms
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. 
                Your continued use of the service constitutes acceptance of any changes.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <a 
              href="/"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              ← Back to TimeCapsule
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
